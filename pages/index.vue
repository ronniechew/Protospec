<template>
  <div class="min-h-screen bg-white">
    <header class="bg-white shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)]">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-display-hero text-black">Protospec</h1>
          <p class="mt-2 text-body-large text-secondary">Generate accurate software development quotations for Malaysian SMEs</p>
        </div>
        <nav class="hidden md:block">
          <a href="/settings" class="text-link hover:text-link/80 font-medium transition-colors text-button">
            Settings
          </a>
        </nav>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white rounded-md p-6 md:p-8 relative shadow-card">
            <h2 class="text-subheading-large text-black mb-8">Enter Project Requirements</h2>
            
            <!-- Template Selection -->
            <div class="mb-8">
              <label class="block text-body-medium text-black mb-4">
                Start with a template (optional)
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  v-for="template in templates"
                  :key="template.id"
                  @click="applyTemplateToForm(template.id)"
                  type="button"
                  class="text-left p-4 rounded-md shadow-border hover:shadow-md transition-all duration-200 bg-white min-h-[80px] flex flex-col justify-center hover:bg-[rgba(0,0,0,0.02)]"
                >
                  <div class="font-medium text-black text-body-medium">{{ template.name }}</div>
                  <div class="text-caption text-tertiary mt-2">{{ template.description }}</div>
                </button>
              </div>
            </div>
            
            <form @submit.prevent="generateQuote">
              <div class="mb-6">
                <label for="clientName" class="block text-body-medium text-black mb-2">
                  Client Name
                </label>
                <input
                  id="clientName"
                  v-model="formData.clientName"
                  type="text"
                  class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-body-small"
                  placeholder="Enter client name"
                />
              </div>
              <div class="mb-6">
                <label for="requirements" class="block text-body-medium text-black mb-2">
                  Project Requirements
                </label>
                <textarea
                  id="requirements"
                  v-model="formData.requirements"
                  rows="6"
                  class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-mono-body leading-relaxed"
                  placeholder="Describe your project requirements in detail..."
                ></textarea>
                <p class="mt-3 text-caption text-secondary">
                  Be as specific as possible about features, integrations, and technical requirements.
                </p>
                <!-- Estimate Cost Button -->
                <div class="mt-6 flex justify-end">
                  <button
                    type="button"
                    @click="estimateCostManually"
                    class="inline-flex items-center px-6 py-3 rounded-lg text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[48px] shadow-border hover:shadow-md"
                    :disabled="!formData.requirements.trim() || isEstimating"
                  >
                    <span v-if="!isEstimating">Estimate Cost</span>
                    <span v-else>Estimating...</span>
                  </button>
                </div>
              </div>
              
              <!-- Real-time Cost Preview -->
              <div v-if="costPreview" class="mb-6 p-4 bg-purple-light rounded-md shadow-border">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-body-medium text-purple-text">Live Cost Estimate</span>
                    <span v-if="costPreview.aiPowered" class="inline-flex items-center px-2 py-1 rounded-pill text-caption font-medium bg-success/10 text-success">
                      AI-powered
                    </span>
                  </div>
                  <span class="text-card-title font-bold text-purple-text">RM {{ costPreview.totalCostMYR.toLocaleString() }}</span>
                </div>
                <div class="text-body-medium text-purple-text mt-2">
                  Estimated {{ costPreview.totalEstimatedHours }} hours
                  <span v-if="costPreview.confidenceScore !== undefined" class="ml-2 text-caption">
                    (Confidence: {{ Math.round(costPreview.confidenceScore * 100) }}%)
                  </span>
                </div>
              </div>
              
              <!-- Streaming LLM Thinking Process -->
              <div v-if="showStreamingOutput" class="mb-6 p-4 bg-gray-50 rounded-md shadow-border border border-gray-200">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-body-medium text-gray-700">LLM Reasoning Process</span>
                  <span v-if="isStreaming || isThinking" class="inline-flex items-center px-2 py-1 rounded-pill text-caption font-medium bg-blue-100 text-blue-800">
                    {{ isThinking ? 'Thinking...' : 'Streaming...' }}
                  </span>
                </div>
                <!-- Show "LLM is thinking..." immediately when estimation starts -->
                <div v-if="isThinking && !streamingOutput" class="text-mono-body text-gray-600 whitespace-pre-wrap break-words p-2 bg-white rounded border border-gray-200">
                  LLM is thinking...
                </div>
                <!-- Show streaming output with auto-scroll -->
                <pre 
                  v-else-if="streamingOutput" 
                  ref="streamingOutputRef"
                  class="text-mono-body text-gray-600 whitespace-pre-wrap break-words max-h-60 overflow-y-auto p-2 bg-white rounded border border-gray-200"
                  @scroll="handleScroll"
                >
{{ streamingOutput }}
                </pre>
              </div>
              
              <!-- Error message when no API key -->
              <div v-else-if="showApiKeyError && !hasApiKey()" class="mb-6 p-4 bg-error/10 rounded-md border border-error/20">
                <div class="text-body-medium text-error">
                  LLM API key required for cost estimation
                </div>
                <div class="text-caption text-error/80 mt-1">
                  Please configure your Qwen or Gemini API key in Settings to enable AI-powered cost estimates.
                </div>
              </div>
              
              <!-- Generate Quote Button - Only shown when cost estimate exists -->
              <div v-if="costPreview" class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-6 py-3 rounded-lg text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[48px] shadow-border hover:shadow-md"
                  :disabled="isGenerating"
                >
                  <span v-if="!isGenerating">Generate Quote</span>
                  <span v-else>Generating...</span>
                </button>
              </div>
              
              <!-- Placeholder message when no cost estimate exists -->
              <div v-else class="mt-8 pt-6 border-t border-gray-100 text-center py-4">
                <p class="text-body-medium text-secondary">
                  Click "Estimate Cost" to generate a cost estimate before creating your quote.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRequirementTemplates } from '~/composables/useRequirementTemplates'

const { templates, applyTemplate } = useRequirementTemplates()

const formData = ref({
  clientName: '',
  requirements: ''
})

const isGenerating = ref(false)
const isEstimating = ref(false) // New: tracks manual estimation state
const costPreview = ref<{ 
  totalEstimatedHours: number; 
  totalCostMYR: number; 
  aiPowered?: boolean;
  confidenceScore?: number;
} | null>(null)

const showApiKeyError = ref(false)
const showStreamingOutput = ref(false)
const streamingOutput = ref('')
const llmReasoningOutput = ref('') // New: accumulates complete LLM reasoning
const isStreaming = ref(false)
const isThinking = ref(false) // New: shows "LLM is thinking..." immediately
const streamingOutputRef = ref<HTMLPreElement | null>(null)
const autoScrollEnabled = ref(true) // Controls auto-scroll behavior

// AbortController for request cancellation
let abortController: AbortController | null = null

// Check if API key is available
const hasApiKey = () => {
  return !!(localStorage.getItem('protospec_qwen_api_key') || localStorage.getItem('protospec_gemini_api_key'))
}

// Apply template function
const applyTemplateToForm = (templateId: string) => {
  formData.value.requirements = applyTemplate(templateId, formData.value.requirements)
}

// Auto-scroll to bottom of streaming output
const scrollToBottom = () => {
  if (autoScrollEnabled.value && streamingOutputRef.value) {
    streamingOutputRef.value.scrollTop = streamingOutputRef.value.scrollHeight
  }
}

// Handle user scroll interaction
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const isScrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1
  autoScrollEnabled.value = isScrolledToBottom
}

// Detect and parse structured final estimate from streaming output
const parseFinalEstimate = (text: string): { totalCostMYR: number; totalEstimatedHours: number; confidenceScore: number } | null => {
  // Look for the structured JSON response at the end
  const jsonMatch = text.match(/```json\s*({.*?"final_estimate".*?})\s*```/s)
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1])
      if (parsed.final_estimate) {
        return {
          totalCostMYR: parsed.final_estimate.totalCostMYR,
          totalEstimatedHours: parsed.final_estimate.totalEstimatedHours,
          confidenceScore: parsed.final_estimate.confidenceScore
        }
      }
    } catch (e) {
      console.warn('Failed to parse final estimate JSON:', e)
    }
  }
  
  // Also check for plain JSON without markdown code blocks
  const plainJsonMatch = text.match(/({.*?"final_estimate".*?})$/s)
  if (plainJsonMatch && plainJsonMatch[1]) {
    try {
      const parsed = JSON.parse(plainJsonMatch[1])
      if (parsed.final_estimate) {
        return {
          totalCostMYR: parsed.final_estimate.totalCostMYR,
          totalEstimatedHours: parsed.final_estimate.totalEstimatedHours,
          confidenceScore: parsed.final_estimate.confidenceScore
        }
      }
    } catch (e) {
      console.warn('Failed to parse plain final estimate JSON:', e)
    }
  }
  
  return null
}

// Extract professional markdown quote from streaming output
const extractMarkdownQuote = (text: string): string | null => {
  // Look for the start of the professional quotation
  const quoteStartIndex = text.indexOf('# Professional Quotation')
  if (quoteStartIndex === -1) {
    return null
  }
  
  // Find where the professional quote ends (before the final JSON)
  const jsonCodeBlockIndex = text.lastIndexOf('```json')
  
  if (jsonCodeBlockIndex !== -1 && jsonCodeBlockIndex > quoteStartIndex) {
    // Extract everything from '# Professional Quotation' to just before '```json'
    return text.substring(quoteStartIndex, jsonCodeBlockIndex).trim()
  } else {
    // If no JSON code block found, return everything from '# Professional Quotation' onwards
    return text.substring(quoteStartIndex).trim()
  }
}

// Streaming cost estimation with LLM thinking process
const streamEstimateCost = async (requirements: string) => {
  if (!requirements.trim()) {
    costPreview.value = null
    showApiKeyError.value = false
    streamingOutput.value = ''
    showStreamingOutput.value = false
    isStreaming.value = false
    isThinking.value = false
    autoScrollEnabled.value = true
    return
  }
  
  // Require API key for any estimation
  if (!hasApiKey()) {
    costPreview.value = null
    showApiKeyError.value = true
    streamingOutput.value = ''
    showStreamingOutput.value = false
    isStreaming.value = false
    isThinking.value = false
    autoScrollEnabled.value = true
    return
  }
  
  // Set immediate feedback states
  isThinking.value = true
  showStreamingOutput.value = true
  streamingOutput.value = ''
  llmReasoningOutput.value = '' // Reset LLM reasoning output
  costPreview.value = null
  isStreaming.value = false
  autoScrollEnabled.value = true
  
  // Cancel any previous request
  if (abortController) {
    abortController.abort()
  }
  
  // Create new AbortController
  abortController = new AbortController()
  
  try {
    const response = await fetch('/api/estimate-quote-stream', {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requirements: requirements,
        clientName: formData.value.clientName || 'Anonymous',
        qwenApiKey: localStorage.getItem('protospec_qwen_api_key') || undefined,
        geminiApiKey: localStorage.getItem('protospec_gemini_api_key') || undefined,
        // Enhanced system prompt instruction for structured final response
        systemPromptEnhancement: 'Conclude your response with a structured JSON object in the following format:\n```json\n{"final_estimate": {"totalCostMYR": 12345, "totalEstimatedHours": 176, "confidenceScore": 0.95}}\n```'
      })
    })
    
    if (!response.ok) {
      // Handle API errors
      const errorData = await response.json().catch(() => ({}))
      console.error('Estimation API error:', errorData.error || response.statusText)
      costPreview.value = null
      streamingOutput.value += `\nError: ${errorData.error || response.statusText}`
      isThinking.value = false
      isStreaming.value = false
      return
    }
    
    // Process streaming response
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    if (!reader) {
      throw new Error('ReadableStream not supported')
    }
    
    isThinking.value = false
    isStreaming.value = true
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // Process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue
        
        try {
          // Parse JSON chunk
          const chunk = JSON.parse(line)
          
          // Handle different types of streaming events
          if (chunk.type === 'thinking') {
            // Append thinking process
            streamingOutput.value += chunk.content
            llmReasoningOutput.value += chunk.content // Accumulate complete reasoning
            // Trigger auto-scroll after DOM update
            await nextTick()
            scrollToBottom()
            
            // Check for final structured estimate in the content
            const finalEstimate = parseFinalEstimate(streamingOutput.value)
            if (finalEstimate) {
              costPreview.value = {
                totalEstimatedHours: finalEstimate.totalEstimatedHours,
                totalCostMYR: finalEstimate.totalCostMYR,
                aiPowered: true,
                confidenceScore: finalEstimate.confidenceScore
              }
            }
            
            // Extract and save markdown quote
            const markdownQuote = extractMarkdownQuote(streamingOutput.value)
            if (markdownQuote) {
              localStorage.setItem('protospec-markdown-quote', markdownQuote)
            }
          } else if (chunk.type === 'result') {
            // Final result
            costPreview.value = {
              totalEstimatedHours: chunk.data.estimatedHours,
              totalCostMYR: chunk.data.totalCostMYR,
              aiPowered: chunk.data.aiPowered === true,
              confidenceScore: chunk.data.confidenceScore
            }
          }
        } catch (parseError) {
          // If not valid JSON, treat as plain text thinking output
          streamingOutput.value += line + '\n'
          llmReasoningOutput.value += line + '\n' // Accumulate complete reasoning
          // Trigger auto-scroll after DOM update
          await nextTick()
          scrollToBottom()
          
          // Check for final structured estimate in the content
          const finalEstimate = parseFinalEstimate(streamingOutput.value)
          if (finalEstimate) {
            costPreview.value = {
              totalEstimatedHours: finalEstimate.totalEstimatedHours,
              totalCostMYR: finalEstimate.totalCostMYR,
              aiPowered: true,
              confidenceScore: finalEstimate.confidenceScore
            }
          }
          
          // Extract and save markdown quote
          const markdownQuote = extractMarkdownQuote(streamingOutput.value)
          if (markdownQuote) {
            localStorage.setItem('protospec-markdown-quote', markdownQuote)
          }
        }
      }
    }
    
    // Handle any remaining buffer
    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer)
        if (chunk.type === 'thinking') {
          streamingOutput.value += chunk.content
          llmReasoningOutput.value += chunk.content // Accumulate complete reasoning
          await nextTick()
          scrollToBottom()
          
          const finalEstimate = parseFinalEstimate(streamingOutput.value)
          if (finalEstimate) {
            costPreview.value = {
              totalEstimatedHours: finalEstimate.totalEstimatedHours,
              totalCostMYR: finalEstimate.totalCostMYR,
              aiPowered: true,
              confidenceScore: finalEstimate.confidenceScore
            }
          }
        } else if (chunk.type === 'result') {
          costPreview.value = {
            totalEstimatedHours: chunk.data.estimatedHours,
            totalCostMYR: chunk.data.totalCostMYR,
            aiPowered: chunk.data.aiPowered === true,
            confidenceScore: chunk.data.confidenceScore
          }
        }
      } catch (parseError) {
        streamingOutput.value += buffer + '\n'
        llmReasoningOutput.value += buffer + '\n' // Accumulate complete reasoning
        await nextTick()
        scrollToBottom()
        
        const finalEstimate = parseFinalEstimate(streamingOutput.value)
        if (finalEstimate) {
          costPreview.value = {
            totalEstimatedHours: finalEstimate.totalEstimatedHours,
            totalCostMYR: finalEstimate.totalCostMYR,
            aiPowered: true,
            confidenceScore: finalEstimate.confidenceScore
          }
        }
        
        // Extract and save markdown quote
        const markdownQuote = extractMarkdownQuote(streamingOutput.value)
        if (markdownQuote) {
          localStorage.setItem('protospec-markdown-quote', markdownQuote)
        }
      }
    }
    
  } catch (error) {
    console.error('Streaming estimation request failed:', error)
    streamingOutput.value += `\nError: Failed to connect to estimation service. ${error.message || ''}`
    costPreview.value = null
  } finally {
    isStreaming.value = false
    isThinking.value = false
    isEstimating.value = false
    // Ensure we scroll to bottom one final time
    await nextTick()
    scrollToBottom()
  }
}

// Manual cost estimation function
const estimateCostManually = async () => {
  if (!formData.value.requirements.trim()) return
  
  isEstimating.value = true
  await streamEstimateCost(formData.value.requirements)
}

const generateQuote = async () => {
  if (!formData.value.clientName || !formData.value.requirements.trim()) {
    alert('Please fill in all fields')
    return
  }
  
  // If no cost preview exists, trigger estimation first
  if (!costPreview.value) {
    alert('Please click "Estimate Cost" to get a cost estimate before generating a quote.')
    return
  }
  
  isGenerating.value = true
  try {
    // Use the existing costPreview.value instead of making a redundant API call
    const finalEstimate = {
      totalEstimatedHours: costPreview.value.totalEstimatedHours,
      totalCostMYR: costPreview.value.totalCostMYR,
      aiPowered: costPreview.value.aiPowered === true,
      confidenceScore: costPreview.value.confidenceScore
    }
    
    // Store final quote data in localStorage using the existing cost preview
    localStorage.setItem('protospec-cost-preview', JSON.stringify(finalEstimate))
    localStorage.setItem('protospec-form-data', JSON.stringify(formData.value))
    localStorage.setItem('protospec-llm-reasoning', llmReasoningOutput.value)
    
    // Ensure markdown quote is saved (fallback extraction)
    const fallbackMarkdownQuote = extractMarkdownQuote(llmReasoningOutput.value)
    if (fallbackMarkdownQuote) {
      localStorage.setItem('protospec-markdown-quote', fallbackMarkdownQuote)
    }
    
    // Navigate to results page with pre-computed data
    window.location.href = '/results'
  } catch (error) {
    console.error('Error generating quote:', error)
    alert('An error occurred while generating the quote.')
  } finally {
    isGenerating.value = false
  }
}
</script>