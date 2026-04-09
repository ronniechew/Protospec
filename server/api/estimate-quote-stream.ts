import { defineEventHandler, readBody, setResponseStatus } from 'h3'

interface QuoteEstimationRequest {
  requirements: string
  clientName?: string
  qwenApiKey?: string
  geminiApiKey?: string
}

async function callQwenAPIStream(prompt: string, apiKey: string) {
  // Use the correct OpenAI-compatible Qwen endpoint with streaming
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

### Output Format:
Provide a structured breakdown including:
- **Executive Summary**: Total cost and estimated timeline.
- **Scope Breakdown**: Phase-by-phase man-day estimates.
- **Pricing Table**: Clear line items in MYR.
- **Assumptions**: Tech stack (Nuxt 4 / Supabase) and infrastructure needs.

### Final Structured Output:
At the very end of your response, provide a JSON object with the final estimate in this exact format:
\`\`\`json
{"final_estimate": {"totalCostMYR": [final_amount], "totalEstimatedHours": [total_hours], "confidenceScore": [confidence_0_to_1]}}
\`\`\`

Be pragmatic. If a requirement is vague, state your assumptions clearly rather than underquoting.`
        },
        { role: 'user', content: prompt }
      ],
      stream: true
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Qwen API error: ${response.status} ${errorText}`)
  }

  return response.body
}

// Helper function to parse SSE chunks from Qwen API
function parseSSEChunk(chunk: string) {
  if (chunk.trim() === '[DONE]') {
    return { done: true, content: null }
  }
  
  try {
    // Remove 'data: ' prefix if present
    const dataStr = chunk.startsWith('data: ') ? chunk.substring(6) : chunk
    const data = JSON.parse(dataStr)
    const content = data.choices?.[0]?.delta?.content || ''
    return { done: false, content }
  } catch (e) {
    console.error('Failed to parse SSE chunk:', chunk, e)
    return { done: false, content: '' }
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<QuoteEstimationRequest>(event)
    
    if (!body?.requirements?.trim()) {
      setResponseStatus(event, 400)
      return { error: 'Requirements are required' }
    }

    // Require Qwen API key for streaming (Gemini streaming not implemented)
    const qwenApiKey = body.qwenApiKey || process.env.QWEN_API_KEY
    if (!qwenApiKey) {
      setResponseStatus(event, 400)
      return { 
        error: 'Qwen API key required for streaming estimation.',
        details: 'Please provide qwenApiKey in the request or configure QWEN_API_KEY environment variable.'
      }
    }

    // Set proper streaming headers
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
    event.node.res.setHeader('Cache-Control', 'no-cache')
    event.node.res.setHeader('Connection', 'keep-alive')

    try {
      const stream = await callQwenAPIStream(body.requirements, qwenApiKey)
      if (!stream) {
        throw new Error('No stream returned from Qwen API')
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          const parsed = parseSSEChunk(line)
          if (parsed.done) {
            break
          }
          
          if (parsed.content) {
            // Send structured JSON for frontend consumption
            const output = JSON.stringify({ type: 'thinking', content: parsed.content }) + '\n'
            event.node.res.write(output)
          }
        }
      }
      
      event.node.res.end()
    } catch (streamError) {
      console.error('Streaming error:', streamError)
      const errorOutput = JSON.stringify({ 
        type: 'error', 
        content: 'Streaming failed: ' + (streamError instanceof Error ? streamError.message : 'Unknown error') 
      }) + '\n'
      event.node.res.write(errorOutput)
      event.node.res.end()
    }

  } catch (error: any) {
    console.error('Error in estimate-quote-stream endpoint:', error)
    setResponseStatus(event, 500)
    return { 
      error: 'Internal streaming estimation error',
      details: error.message || 'Unknown error occurred during streaming estimation'
    }
  }
})