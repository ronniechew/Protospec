<template>
  <div class="min-h-screen bg-background">
    <header class="bg-white shadow-lg border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-text-heading">Protospec</h1>
          <p class="mt-2 text-text-body leading-relaxed">Generate accurate software development quotations for Malaysian SMEs</p>
        </div>
        <nav class="hidden md:block">
          <a href="/settings" class="text-primary hover:text-primary/80 font-medium transition-colors">
            Settings
          </a>
        </nav>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow-lg rounded-xl p-6 md:p-8 relative">
            <h2 class="text-3xl font-semibold text-text-heading mb-6">Enter Project Requirements</h2>
            
            <!-- Template Selection -->
            <div class="mb-8">
              <label class="block text-base font-medium text-text-heading mb-4">
                Start with a template (optional)
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  v-for="template in templates"
                  :key="template.id"
                  @click="applyTemplateToForm(template.id)"
                  type="button"
                  class="text-left p-4 border border-gray-200 rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all duration-200 bg-white min-h-[80px] flex flex-col justify-center hover:bg-blue-50"
                >
                  <div class="font-medium text-text-heading text-base">{{ template.name }}</div>
                  <div class="text-sm text-text-body mt-2">{{ template.description }}</div>
                </button>
              </div>
            </div>
            
            <form @submit.prevent="generateQuote">
              <div class="mb-6">
                <label for="clientName" class="block text-base font-medium text-text-heading mb-2">
                  Client Name
                </label>
                <input
                  id="clientName"
                  v-model="formData.clientName"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base"
                  placeholder="Enter client name"
                />
              </div>
              <div class="mb-6">
                <label for="requirements" class="block text-base font-medium text-text-heading mb-2">
                  Project Requirements
                </label>
                <textarea
                  id="requirements"
                  v-model="formData.requirements"
                  rows="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base leading-relaxed"
                  placeholder="Describe your project requirements in detail..."
                ></textarea>
                <p class="mt-3 text-sm text-text-body">
                  Be as specific as possible about features, integrations, and technical requirements.
                </p>
              </div>
              
              <!-- Real-time Cost Preview -->
              <div v-if="costPreview" class="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-base font-medium text-accent">Live Cost Estimate</span>
                    <span v-if="costPreview.aiPowered" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      AI-powered
                    </span>
                  </div>
                  <span class="text-2xl font-bold text-accent">RM {{ costPreview.totalCostMYR.toLocaleString() }}</span>
                </div>
                <div class="text-base text-accent mt-2">
                  Estimated {{ costPreview.totalEstimatedHours }} hours
                  <span v-if="costPreview.confidenceScore !== undefined" class="ml-2 text-sm">
                    (Confidence: {{ Math.round(costPreview.confidenceScore * 100) }}%)
                  </span>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 min-h-[44px] shadow-sm hover:shadow-md"
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

// Check if API key is available
const hasApiKey = () => {
  return !!localStorage.getItem('protospec_gemini_api_key')
}

// Apply template function
const applyTemplateToForm = (templateId: string) => {
  formData.value.requirements = applyTemplate(templateId, formData.value.requirements)
}

// Real-time cost estimation
const estimateCost = async (requirements: string) => {
  if (!requirements.trim()) {
    costPreview.value = null
    return
  }
  
  // Use LLM if API key is available, otherwise use rule-based
  if (hasApiKey()) {
    try {
      const response = await fetch('/api/estimate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requirements: requirements,
          clientName: formData.value.clientName || 'Anonymous'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        costPreview.value = {
          totalEstimatedHours: data.estimatedHours,
          totalCostMYR: data.totalCostMYR,
          aiPowered: data.aiPowered === true,
          confidenceScore: data.confidenceScore
        }
        return
      }
      // If LLM fails, fall back to rule-based
    } catch (error) {
      console.warn('LLM estimation failed, falling back to rule-based:', error)
    }
  }
  
  // Rule-based estimation fallback
  const words = requirements.split(/\s+/).filter(word => word.length > 0).length
  
  // Base hours calculation
  let baseHours = Math.max(20, words * 0.3) // Minimum 20 hours
  
  // Complexity multipliers based on keywords
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
      complexityMultiplier += (multiplier - 1) * 0.3 // Reduce impact to avoid overestimation
    }
  })
  
  const estimatedHours = Math.round(baseHours * complexityMultiplier)
  const hourlyRateMYR = 70 // Average Malaysian SME rate
  const totalCostMYR = estimatedHours * hourlyRateMYR
  
  costPreview.value = {
    totalEstimatedHours: estimatedHours,
    totalCostMYR: totalCostMYR,
    aiPowered: false,
    confidenceScore: Math.min(0.7, requirements.length / 500) // Max 0.7 for rule-based
  }
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
  
  isGenerating.value = true
  try {
    // Get final estimation (this ensures we have the most up-to-date estimate)
    let finalEstimate = costPreview.value
    if (!finalEstimate || (hasApiKey() && !finalEstimate.aiPowered)) {
      // If we don't have an estimate or should use LLM but don't have AI-powered result
      try {
        const response = await fetch('/api/estimate-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requirements: formData.value.requirements,
            clientName: formData.value.clientName
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          finalEstimate = {
            totalEstimatedHours: data.estimatedHours,
            totalCostMYR: data.totalCostMYR,
            aiPowered: data.aiPowered === true,
            confidenceScore: data.confidenceScore
          }
        }
      } catch (error) {
        console.warn('Final LLM estimation failed, using current estimate:', error)
      }
    }
    
    // Store final estimate in localStorage
    if (finalEstimate) {
      localStorage.setItem('protospec-cost-preview', JSON.stringify(finalEstimate))
    }
    localStorage.setItem('protospec-form-data', JSON.stringify(formData.value))
    
    // Navigate to results page
    window.location.href = '/results'
  } catch (error) {
    console.error('Error generating quote:', error)
    alert('An error occurred while generating the quote')
  } finally {
    isGenerating.value = false
  }
}
</script>