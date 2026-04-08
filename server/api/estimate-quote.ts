import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Qwen AI client
interface QwenResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function callQwenAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-max',
      input: {
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      parameters: {
        result_format: 'message'
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status} ${await response.text()}`)
  }

  const data: QwenResponse = await response.json()
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

    // Try Qwen first, then Gemini, then fallback to rule-based
    // Prioritize request-provided API keys over environment variables
    const qwenApiKey = body.qwenApiKey || process.env.QWEN_API_KEY
    const geminiApiKey = body.geminiApiKey || process.env.GEMINI_API_KEY
    
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
    
    // Try Qwen first if available
    if (qwenApiKey) {
      try {
        console.log('Attempting Qwen API call')
        responseText = await callQwenAPI(prompt, qwenApiKey)
        usedModel = 'qwen'
      } catch (qwenError) {
        console.warn('Qwen API failed, trying Gemini:', qwenError)
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
      } catch (geminiError) {
        console.warn('Gemini API failed:', geminiError)
      }
    }
    
    // If both failed, fall back to rule-based
    if (!responseText) {
      console.warn('Both Qwen and Gemini APIs failed or not configured, falling back to rule-based estimation')
      return await getRuleBasedEstimation(body.requirements)
    }
    
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
      console.error('Failed to parse Gemini response:', responseText, parseError)
      // Fall back to rule-based estimation
      return await getRuleBasedEstimation(body.requirements)
    }

  } catch (error: any) {
    console.error('Error in estimate-quote endpoint:', error)
    
    // Handle specific Gemini errors
    if (error.message?.includes('API key')) {
      console.warn('Gemini API key issue, falling back to rule-based estimation')
      const body = await readBody<QuoteEstimationRequest>(event)
      return await getRuleBasedEstimation(body?.requirements || '')
    }
    
    // Fall back to rule-based estimation on any error
    const body = await readBody<QuoteEstimationRequest>(event)
    return await getRuleBasedEstimation(body?.requirements || '')
  }
})

async function getRuleBasedEstimation(requirements: string): Promise<any> {
  // This replicates the logic from the frontend but returns the full structure
  if (!requirements.trim()) {
    return {
      estimatedHours: 0,
      totalCostMYR: 0,
      confidenceScore: 0,
      breakdown: [],
      aiPowered: false
    }
  }

  const words = requirements.split(/\s+/).filter(word => word.length > 0).length
  let baseHours = Math.max(20, words * 0.3)
  
  const complexityKeywords = [
    { keyword: 'payment', multiplier: 1.5 },
    { keyword: 'authentication', multiplier: 1.3 },
    { keyword: 'mobile app', multiplier: 2.0 },
    { keyword: 'e-commerce', multiplier: 1.8 },
    { keyword: 'database', multiplier: 1.4 },
    { keyword: 'api', multiplier: 1.6 },
    { keyword: 'integration', multiplier: 1.7 },
    { keyword: 'real-time', multiplier: 2.0 },
    { keyword: 'admin dashboard', multiplier: 1.5 },
    { keyword: 'seo', multiplier: 1.2 }
  ]
  
  let complexityMultiplier = 1.0
  const lowerRequirements = requirements.toLowerCase()
  
  complexityKeywords.forEach(({ keyword, multiplier }) => {
    if (lowerRequirements.includes(keyword)) {
      complexityMultiplier += (multiplier - 1) * 0.3
    }
  })
  
  const estimatedHours = Math.round(baseHours * complexityMultiplier)
  const hourlyRateMYR = 70
  const totalCostMYR = estimatedHours * hourlyRateMYR
  
  // Generate breakdown based on keywords found
  const breakdown = complexityKeywords
    .filter(({ keyword }) => lowerRequirements.includes(keyword))
    .map(({ keyword, multiplier }) => ({
      feature: keyword.charAt(0).toUpperCase() + keyword.slice(1),
      hours: Math.round(estimatedHours * ((multiplier - 1) * 0.3) / complexityMultiplier),
      costMYR: Math.round(estimatedHours * ((multiplier - 1) * 0.3) / complexityMultiplier * hourlyRateMYR),
      complexity: multiplier
    }))
  
  // Add base development if no specific features found
  if (breakdown.length === 0) {
    breakdown.push({
      feature: 'General Development',
      hours: estimatedHours,
      costMYR: totalCostMYR,
      complexity: 1.0
    })
  }

  return {
    estimatedHours,
    totalCostMYR,
    confidenceScore: Math.min(0.7, requirements.length / 500), // Max 0.7 for rule-based
    breakdown,
    aiPowered: false
  }
}