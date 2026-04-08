<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Protospec</h1>
        <p class="mt-2 text-gray-600">Generate accurate software development quotations for Malaysian SMEs</p>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Enter Project Requirements</h2>
            
            <!-- Template Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start with a template (optional)
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 template-grid">
                <button
                  v-for="template in templates"
                  :key="template.id"
                  @click="applyTemplateToForm(template.id)"
                  type="button"
                  class="text-left p-3 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50 transition-colors touch-target"
                >
                  <div class="font-medium text-sm text-gray-900">{{ template.name }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ template.description }}</div>
                </button>
              </div>
            </div>
            
            <form @submit.prevent="generateQuote">
              <div class="mb-4">
                <label for="clientName" class="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  id="clientName"
                  v-model="formData.clientName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter client name"
                />
              </div>
              <div class="mb-4">
                <label for="requirements" class="block text-sm font-medium text-gray-700 mb-1">
                  Project Requirements
                </label>
                <textarea
                  id="requirements"
                  v-model="formData.requirements"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your project requirements in detail..."
                ></textarea>
                <p class="mt-2 text-sm text-gray-500">
                  Be as specific as possible about features, integrations, and technical requirements.
                </p>
              </div>
              
              <!-- Real-time Cost Preview -->
              <div v-if="costPreview" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-green-800">Live Cost Estimate</span>
                  <span class="text-lg font-bold text-green-700">RM {{ costPreview.totalCostMYR.toLocaleString() }}</span>
                </div>
                <div class="text-sm text-green-600 mt-1">
                  Estimated {{ costPreview.totalEstimatedHours }} hours
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
const costPreview = ref<{ totalEstimatedHours: number; totalCostMYR: number } | null>(null)

// Apply template function
const applyTemplateToForm = (templateId: string) => {
  formData.value.requirements = applyTemplate(templateId, formData.value.requirements)
}

// Real-time cost estimation
const estimateCost = (requirements: string) => {
  if (!requirements.trim()) {
    costPreview.value = null
    return
  }
  
  // Simple estimation logic based on word count and keywords
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
    totalCostMYR: totalCostMYR
  }
}

// Watch requirements for real-time updates
watch(() => formData.value.requirements, (newRequirements) => {
  estimateCost(newRequirements)
}, { immediate: true })

const generateQuote = async () => {
  if (!formData.value.clientName || !formData.value.requirements.trim()) {
    alert('Please fill in all fields')
    return
  }
  
  isGenerating.value = true
  try {
    // Store cost preview in localStorage or pass to results page
    if (costPreview.value) {
      localStorage.setItem('protospec-cost-preview', JSON.stringify(costPreview.value))
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