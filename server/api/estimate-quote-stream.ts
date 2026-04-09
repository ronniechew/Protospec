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

// Helper function to parse SSE chunks and extract content
function parseSSEChunk(chunk: string): { content: string | null; done: boolean } {
  // Check for [DONE] marker
  if (chunk.trim() === 'data: [DONE]') {
    return { content: null, done: true }
  }
  
  // Check if it's a valid data chunk
  if (chunk.startsWith('data: ') && chunk !== 'data: ') {
    try {
      const jsonString = chunk.substring(6).trim() // Remove 'data: ' prefix
      const parsed = JSON.parse(jsonString)
      
      // Extract content from choices[0].delta.content
      if (parsed.choices && parsed.choices.length > 0 && 
          parsed.choices[0].delta && parsed.choices[0].delta.content) {
        return { content: parsed.choices[0].delta.content, done: false }
      }
    } catch (e) {
      console.error('Error parsing SSE chunk:', e, 'Chunk:', chunk)
    }
  }
  
  return { content: null, done: false }
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

    // Set proper streaming headers for JSON lines
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
    event.node.res.setHeader('Cache-Control', 'no-cache')
    event.node.res.setHeader('Connection', 'keep-alive')
    event.node.res.setHeader('Transfer-Encoding', 'chunked')

    try {
      const stream = await callQwenAPIStream(body.requirements, qwenApiKey)
      if (stream) {
        const reader = stream.getReader()
        let decoder = new TextDecoder()
        let buffer = ''
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            buffer += decoder.decode(value, { stream: true })
            
            // Process complete lines from the buffer
            let lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.trim() === '') continue // Skip empty lines
              
              const { content, done: isDone } = parseSSEChunk(line)
              
              if (isDone) {
                // Send final completion message if needed
                event.node.res.write('\n')
                event.node.res.end()
                return
              }
              
              if (content !== null) {
                // Transform to frontend-compatible JSON format
                const formattedResponse = {
                  type: 'thinking',
                  content: content
                }
                
                // Write as JSON line (newline-delimited JSON)
                event.node.res.write(JSON.stringify(formattedResponse) + '\n')
              }
            }
          }
          
          // Handle any remaining buffer content
          if (buffer.trim() !== '') {
            const { content, done: isDone } = parseSSEChunk(buffer)
            if (isDone) {
              event.node.res.write('\n')
            } else if (content !== null) {
              const formattedResponse = {
                type: 'thinking',
                content: content
              }
              event.node.res.write(JSON.stringify(formattedResponse) + '\n')
            }
          }
          
          event.node.res.end()
        } finally {
          reader.releaseLock()
        }
      } else {
        throw new Error('No stream returned from Qwen API')
      }
    } catch (streamError) {
      console.error('Streaming error:', streamError)
      const errorResponse = {
        type: 'error',
        content: 'Streaming failed',
        details: streamError instanceof Error ? streamError.message : 'Unknown error'
      }
      event.node.res.write(JSON.stringify(errorResponse) + '\n')
      event.node.res.end()
    }

  } catch (error: any) {
    console.error('Error in estimate-quote-stream endpoint:', error)
    setResponseStatus(event, 500)
    const errorResponse = {
      type: 'error',
      content: 'Internal streaming estimation error',
      details: error.message || 'Unknown error occurred during streaming estimation'
    }
    return errorResponse
  }
})