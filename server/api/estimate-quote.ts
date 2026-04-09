import { defineEventHandler, readBody, setResponseStatus, sendStream } from 'h3'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Qwen AI client using OpenAI-compatible endpoint with streaming support
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface OpenAIStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      content?: string
      role?: string
    }
    finish_reason: string | null
  }>
}

async function callQwenAPIStream(projectRequirements: string, apiKey: string): Promise<ReadableStream> {
  // Use the correct OpenAI-compatible Qwen endpoint with streaming enabled
  const response = await fetch('https://coding-intl.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'system',
          content: `You are an expert Software Estimator and Solution Architect specializing in the Malaysian tech market. Your goal is to convert software requirements into a highly realistic, professional quotation in Malaysian Ringgit (MYR).

### Estimation Logic:
1. **Complexity Analysis**: Categorize tasks into Simple, Medium, and Complex.
2. **Man-Hour Conversion**: Use a standard 8-hour man-day.
3. **Market Rates (2026 Malaysia Standard)**:
 - Technical Lead / Architect: RM 2,500 - RM 3,500 per day
 - Senior Developer: RM 1,500 - RM 2,200 per day
 - UI/UX Designer: RM 1,200 - RM 1,800 per day
 - QA/Testing: RM 800 - RM 1,200 per day
4. **Buffer**: Include a 15-20% contingency buffer for unforeseen technical debt or scope creep.

### Professional Quote Format:
Conclude your response with a professional markdown quote in the EXACT format shown below, including ALL sections:

# Professional Quotation

## Executive Summary
[Brief overview of the project, total investment required, and key deliverables]

## Project Scope & Investment
[Detailed breakdown of what's included in the project scope with associated costs]

## Implementation Timeline
[Clear timeline with phases, milestones, and estimated completion dates]

## Payment Milestones
[Payment schedule tied to project milestones with specific amounts in MYR]

## Technical Specifications & Assumptions
[Tech stack details (Nuxt 4 / Supabase), infrastructure requirements, and key assumptions made during estimation]

## Acceptance
[Client acceptance criteria and next steps for project initiation]

Be pragmatic. If a requirement is vague, state your assumptions clearly rather than underquoting. Maintain Malaysian market context and 2026 pricing standards throughout your analysis.`
        },
        { role: 'user', content: projectRequirements }
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Qwen API error: ${response.status} ${errorText}`)
  }

  // Return the streaming response directly
  return response.body as ReadableStream
}

async function callQwenAPINonStream(projectRequirements: string, apiKey: string): Promise<string> {
  // Non-streaming version for fallback or when streaming isn't needed
  const response = await fetch('https://coding-intl.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'system',
          content: `You are an expert Software Estimator and Solution Architect specializing in the Malaysian tech market. Your goal is to convert software requirements into a highly realistic, professional quotation in Malaysian Ringgit (MYR).

### Estimation Logic:
1. **Complexity Analysis**: Categorize tasks into Simple, Medium, and Complex.
2. **Man-Hour Conversion**: Use a standard 8-hour man-day.
3. **Market Rates (2026 Malaysia Standard)**:
 - Technical Lead / Architect: RM 2,500 - RM 3,500 per day
 - Senior Developer: RM 1,500 - RM 2,200 per day
 - UI/UX Designer: RM 1,200 - RM 1,800 per day
 - QA/Testing: RM 800 - RM 1,200 per day
4. **Buffer**: Include a 15-20% contingency buffer for unforeseen technical debt or scope creep.

### Professional Quote Format:
Conclude your response with a professional markdown quote in the EXACT format shown below, including ALL sections:

# Professional Quotation

## Executive Summary
[Brief overview of the project, total investment required, and key deliverables]

## Project Scope & Investment
[Detailed breakdown of what's included in the project scope with associated costs]

## Implementation Timeline
[Clear timeline with phases, milestones, and estimated completion dates]

## Payment Milestones
[Payment schedule tied to project milestones with specific amounts in MYR]

## Technical Specifications & Assumptions
[Tech stack details (Nuxt 4 / Supabase), infrastructure requirements, and key assumptions made during estimation]

## Acceptance
[Client acceptance criteria and next steps for project initiation]

Be pragmatic. If a requirement is vague, state your assumptions clearly rather than underquoting. Maintain Malaysian market context and 2026 pricing standards throughout your analysis.`
        },
        { role: 'user', content: projectRequirements }
      ],
      stream: false,
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
  stream?: boolean // Add stream option to request
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

    // Check if streaming is requested
    const shouldStream = body.stream === true

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

    // For non-streaming requests, check cache first
    if (!shouldStream) {
      const cacheKey = `quote:${body.requirements.trim().substring(0, 100)}`
      const cached = requestCache.get(cacheKey)
      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.response
      }
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

    // For streaming requests, we can only use Qwen (Gemini doesn't support streaming in this implementation)
    if (shouldStream) {
      if (!qwenApiKey) {
        setResponseStatus(event, 400)
        return { 
          error: 'Streaming requires Qwen API key',
          details: 'Please provide qwenApiKey in the request or configure QWEN_API_KEY environment variable for streaming support.'
        }
      }
      
      try {
        console.log('Attempting Qwen API streaming call')
        const stream = await callQwenAPIStream(body.requirements, qwenApiKey)
        
        // Set appropriate headers for streaming
        event.node.res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        event.node.res.setHeader('Cache-Control', 'no-cache')
        event.node.res.setHeader('Connection', 'keep-alive')
        
        // Send the stream directly to the client
        await sendStream(event, stream)
        return // Streaming response sent, no further processing needed
      } catch (streamError) {
        console.error('Qwen streaming API failed:', streamError)
        setResponseStatus(event, 500)
        return { 
          error: 'Streaming estimation failed',
          details: `Qwen streaming API error: ${(streamError as Error).message}`
        }
      }
    }

    // Non-streaming path (original logic with both Qwen and Gemini support)
    let responseText = ''
    let usedModel = ''
    let lastError: Error | null = null
    
    // Try Qwen first if available
    if (qwenApiKey) {
      try {
        console.log('Attempting Qwen API call with correct endpoint')
        responseText = await callQwenAPINonStream(body.requirements, qwenApiKey)
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
        
        // Create a prompt for Gemini that matches the requirements
        const geminiPrompt = `
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
        
        const result = await model.generateContent(geminiPrompt)
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
        const cacheKey = `quote:${body.requirements.trim().substring(0, 100)}`
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