import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Qwen AI client using OpenAI-compatible endpoint
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function callQwenAPI(prompt: string, apiKey: string): Promise<string> {
  // Use the correct OpenAI-compatible Qwen endpoint
  const response = await fetch('https://coding-intl.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-max',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Qwen API error: ${response.status} ${errorText}`)
  }

  const data: OpenAIResponse = await response.json()
  return data.choices[0].message.content
}

interface QuoteEstimationRequest {
  requirements: string
  clientName?: string
  qwenApiKey?: string
  geminiApiKey?: string
}

interface QuoteEstimationResponse {
  estimatedHours: number
  totalCostMYR: number
  confidenceScore: number
  breakdown: Array<{
    feature: string
    hours: number
    costMYR: number
    complexity: number
  }>
  aiPowered: true
}

// Rate limiting and caching to prevent abuse
const requestCounts = new Map<string, { count: number; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const requestCache = new Map<string, { response: QuoteEstimationResponse; timestamp: number }>()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<QuoteEstimationRequest>(event)
    
    if (!body?.requirements?.trim()) {
      setResponseStatus(event, 400)
      return { error: 'Requirements are required' }
    }

    // Basic rate limiting (max 10 requests per minute per IP)
    const clientIP = event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const clientData = requestCounts.get(clientIP) || { count: 0, timestamp: now }
    
    if (now - clientData.timestamp > 60000) {
      // Reset counter after 1 minute
      clientData.count = 0
      clientData.timestamp = now
    }
    
    if (clientData.count >= 10) {
      setResponseStatus(event, 429)
      return { error: 'Rate limit exceeded. Please try again later.' }
    }
    
    clientData.count++
    requestCounts.set(clientIP, clientData)

    // Check cache first
    const cacheKey = `quote:${body.requirements.trim().substring(0, 100)}`
    const cached = requestCache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.response
    }

    // Prioritize request-provided API keys over environment variables
    const qwenApiKey = body.qwenApiKey || process.env.QWEN_API_KEY
    const geminiApiKey = body.geminiApiKey || process.env.GEMINI_API_KEY
    
    // Require at least one API key to be configured
    if (!qwenApiKey && !geminiApiKey) {
      setResponseStatus(event, 400)
      return { 
        error: 'LLM API key required for estimation. Rule-based fallback has been removed per ADR-002.',
        details: 'Please provide either qwenApiKey or geminiApiKey in the request, or configure QWEN_API_KEY/GEMINI_API_KEY environment variables.'
      }
    }

    const prompt = `
You are an expert software development estimator specializing in Malaysian SME projects. 
Analyze the following project requirements and provide a detailed cost estimation in JSON format.

Requirements: "${body.requirements}"

Return ONLY a JSON object with this exact structure:
{
  "estimatedHours": number,
  "totalCostMYR": number,
  "confidenceScore": number (0.0 to 1.0),
  "breakdown": [
    {
      "feature": "string",
      "hours": number,
      "costMYR": number,
      "complexity": number (1.0 to 5.0)
    }
  ]
}

Guidelines:
- Use Malaysian Ringgit (RM) as currency
- Average hourly rate for Malaysian SME developers is RM 70/hour
- Consider typical Malaysian business requirements and constraints
- Be realistic about project scope and complexity
- Confidence score should reflect how clear and detailed the requirements are
- Break down into logical features/components mentioned in requirements
- If requirements are vague, make reasonable assumptions but lower confidence score
- Estimated hours should be realistic for a small-to-medium Malaysian development team
`

    let responseText = ''
    let usedModel = ''
    let lastError: Error | null = null
    
    // Try Qwen first if available
    if (qwenApiKey) {
      try {
        console.log('Attempting Qwen API call with correct endpoint')
        responseText = await callQwenAPI(prompt, qwenApiKey)
        usedModel = 'qwen'
      } catch (qwenError) {
        console.warn('Qwen API failed:', qwenError)
        lastError = qwenError as Error
      }
    }
    
    // Try Gemini if Qwen failed or not available
    if (!responseText && geminiApiKey) {
      try {
        console.log('Attempting Gemini API call')
        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
        const result = await model.generateContent(prompt)
        responseText = result.response.text()
        usedModel = 'gemini'
        lastError = null // Clear error since Gemini succeeded
      } catch (geminiError) {
        console.warn('Gemini API failed:', geminiError)
        lastError = geminiError as Error
      }
    }
    
    // Handle results
    if (responseText) {
      // Successfully got response from either LLM
      let aiResponse: QuoteEstimationResponse
      try {
        aiResponse = JSON.parse(responseText)
        // Validate response structure
        if (!aiResponse.estimatedHours || !aiResponse.totalCostMYR || !aiResponse.confidenceScore) {
          throw new Error('Invalid response structure')
        }
        
        // Add AI-powered flag and model info
        aiResponse.aiPowered = true
        ;(aiResponse as any).modelUsed = usedModel
        
        // Cache the response
        requestCache.set(cacheKey, { response: aiResponse, timestamp: now })
        
        return aiResponse
      } catch (parseError) {
        console.error('Failed to parse LLM response:', responseText, parseError)
        // Return specific parsing error
        setResponseStatus(event, 500)
        return { 
          error: 'LLM response parsing failed',
          details: 'The LLM returned an invalid response format. Please try again.'
        }
      }
    } else {
      // Both LLMs failed or weren't available
      setResponseStatus(event, 500)
      const qwenAttempted = !!qwenApiKey
      const geminiAttempted = !!geminiApiKey
      
      let errorMessage = 'LLM estimation unavailable'
      let errorDetails = ''
      
      if (qwenAttempted && geminiAttempted) {
        errorDetails = `Both Qwen and Gemini APIs failed. Last error: ${lastError?.message || 'Unknown error'}`
      } else if (qwenAttempted) {
        errorDetails = `Qwen API failed: ${lastError?.message || 'Unknown error'}`
      } else if (geminiAttempted) {
        errorDetails = `Gemini API failed: ${lastError?.message || 'Unknown error'}`
      } else {
        errorDetails = 'No LLM response received. Please check your API keys and try again.'
      }
      
      return { 
        error: errorMessage,
        details: errorDetails
      }
    }

  } catch (error: any) {
    console.error('Error in estimate-quote endpoint:', error)
    
    // Handle specific errors without fallback
    if (error.message?.includes('API key')) {
      setResponseStatus(event, 400)
      return { 
        error: 'LLM API key configuration error',
        details: 'Please verify your LLM API key configuration.'
      }
    }
    
    // Return error for any other failure (NO FALLBACK)
    setResponseStatus(event, 500)
    return { 
      error: 'Internal estimation error',
      details: error.message || 'Unknown error occurred during estimation'
    }
  }
})