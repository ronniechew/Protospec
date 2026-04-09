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
              <div v-if="showStreamingOutput && streamingOutput" class="mb-6 p-4 bg-gray-50 rounded-md shadow-border border border-gray-200">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-body-medium text-gray-700">LLM Reasoning Process</span>
                  <span v-if="isStreaming" class="inline-flex items-center px-2 py-1 rounded-pill text-caption font-medium bg-blue-100 text-blue-800">
                    Thinking...
                  </span>
                </div>
                <pre class="text-mono-body text-gray-600 whitespace-pre-wrap break-words max-h-60 overflow-y-auto p-2 bg-white rounded border border-gray-200">
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
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
                  :disabled="isGenerating || !formData.requirements.trim()"
                >
                  <span v-if="!isGenerating">Generate Quote</span>
                  <span v-else>Generating...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRequirementTemplates } from '~/composables/useRequirementTemplates'

const { templates, applyTemplate } = useRequirementTemplates()

const formData = ref({
  clientName: '',
  requirements: ''
})

const isGenerating = ref(false)
const costPreview = ref<{ 
  totalEstimatedHours: number; 
  totalCostMYR: number; 
  aiPowered?: boolean;
  confidenceScore?: number;
} | null>(null)

const showApiKeyError = ref(false)
const showStreamingOutput = ref(false)
const streamingOutput = ref('')
const isStreaming = ref(false)

// Check if API key is available
const hasApiKey = () => {
  return !!(localStorage.getItem('protospec_qwen_api_key') || localStorage.getItem('protospec_gemini_api_key'))
}

// Apply template function
const applyTemplateToForm = (templateId: string) => {
  formData.value.requirements = applyTemplate(templateId, formData.value.requirements)
}

// Streaming cost estimation with LLM thinking process
const streamEstimateCost = async (requirements: string) => {
  if (!requirements.trim()) {
    costPreview.value = null
    showApiKeyError.value = false
    streamingOutput.value = ''
    showStreamingOutput.value = false
    isStreaming.value = false
    return
  }
  
  // Require API key for any estimation
  if (!hasApiKey()) {
    costPreview.value = null
    showApiKeyError.value = true
    streamingOutput.value = ''
    showStreamingOutput.value = false
    isStreaming.value = false
    return
  }
  
  // Reset streaming state
  streamingOutput.value = ''
  showStreamingOutput.value = true
  isStreaming.value = true
  costPreview.value = null
  
  try {
    const response = await fetch('/api/estimate-quote-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requirements: requirements,
        clientName: formData.value.clientName || 'Anonymous',
        qwenApiKey: localStorage.getItem('protospec_qwen_api_key') || undefined,
        geminiApiKey: localStorage.getItem('protospec_gemini_api_key') || undefined
      })
    })
    
    if (!response.ok) {
      // Handle API errors
      const errorData = await response.json().catch(() => ({}))
      console.error('Estimation API error:', errorData.error || response.statusText)
      costPreview.value = null
      streamingOutput.value += `\nError: ${errorData.error || response.statusText}`
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
        }
      }
    }
    
    // Handle any remaining buffer
    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer)
        if (chunk.type === 'thinking') {
          streamingOutput.value += chunk.content
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
      }
    }
    
  } catch (error) {
    console.error('Streaming estimation request failed:', error)
    streamingOutput.value += `\nError: Failed to connect to estimation service. ${error.message || ''}`
    costPreview.value = null
  } finally {
    isStreaming.value = false
  }
}

// Real-time cost estimation - LLM ONLY, NO FALLBACK
const estimateCost = async (requirements: string) => {
  // Use streaming version for real-time updates
  await streamEstimateCost(requirements)
}

// Watch requirements for real-time updates
watch(() => formData.value.requirements, async (newRequirements) => {
  await estimateCost(newRequirements)
}, { immediate: true })

const generateQuote = async () => {
  if (!formData.value.clientName || !formData.value.requirements.trim()) {
    alert('Please fill in all fields')
    return
  }
  
  // Ensure API key is configured before generating quote
  if (!hasApiKey()) {
    alert('Please configure your LLM API key in Settings before generating a quote.')
    return
  }
  
  isGenerating.value = true
  try {
    // Get final estimation using LLM only
    const response = await fetch('/api/estimate-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requirements: formData.value.requirements,
        clientName: formData.value.clientName,
        qwenApiKey: localStorage.getItem('protospec_qwen_api_key') || undefined,
        geminiApiKey: localStorage.getItem('protospec_gemini_api_key') || undefined
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      const finalEstimate = {
        totalEstimatedHours: data.estimatedHours,
        totalCostMYR: data.totalCostMYR,
        aiPowered: data.aiPowered === true,
        confidenceScore: data.confidenceScore
      }
      
      // Store final estimate in localStorage
      localStorage.setItem('protospec-cost-preview', JSON.stringify(finalEstimate))
      localStorage.setItem('protospec-form-data', JSON.stringify(formData.value))
      
      // Navigate to results page
      window.location.href = '/results'
    } else {
      const errorData = await response.json().catch(() => ({}))
      alert(`Failed to generate quote: ${errorData.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error generating quote:', error)
    alert('An error occurred while generating the quote. Please check your API key configuration.')
  } finally {
    isGenerating.value = false
  }
}
</script>