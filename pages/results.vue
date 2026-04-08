<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Protospec Quote</h1>
        <p class="mt-2 text-gray-600">Your software development quotation</p>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ quote.clientName }} Project</h2>
                <p class="text-gray-600">Generated on {{ formatDate(new Date()) }}</p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold text-indigo-600">RM {{ quote.totalCostMYR.toLocaleString() }}</p>
                <p class="text-sm text-gray-500">{{ quote.totalEstimatedHours }} hours estimated</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="border border-gray-200 rounded-lg p-4 mobile-padding">
                <h3 class="font-medium text-gray-900 mb-2">Project Summary</h3>
                <p class="text-gray-600 text-sm">{{ quote.requirements }}</p>
              </div>
              <div class="border border-gray-200 rounded-lg p-4 mobile-padding">
                <h3 class="font-medium text-gray-900 mb-2">Rate Card</h3>
                <p class="text-gray-600 text-sm">Malaysian SME Standard</p>
                <div class="mt-2 text-xs text-gray-500">
                  <p>Frontend (Mid): RM 65/hour</p>
                  <p>Backend (Mid): RM 70/hour</p>
                  <p>Fullstack (Mid): RM 75/hour</p>
                </div>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="font-medium text-gray-900 mb-3">Requirements Analysis</h3>
              <div class="space-y-3 responsive-table">
                <div v-for="(req, index) in quote.requirementsAnalysis" :key="index" 
                     class="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full mr-3 touch-target">
                    <span class="text-indigo-800 font-medium text-sm">{{ index + 1 }}</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-900 text-sm">{{ req.description }}</p>
                    <div class="flex flex-wrap items-center mt-1 gap-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ req.category }}
                      </span>
                      <span class="text-xs text-gray-500">
                        Complexity: {{ req.complexityScore }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                @click="goBack"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-target"
              >
                Edit Requirements
              </button>
              <button
                @click="downloadPDF"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 pdf-download-btn touch-target"
              >
                Download PDF Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePDFGenerator } from '~/composables/usePDFGenerator'

const { downloadPDF: generateAndDownloadPDF } = usePDFGenerator()

const quote = ref({
  clientName: 'Sample Client',
  requirements: 'Build a responsive e-commerce website with user authentication, product catalog, shopping cart, and payment integration.',
  totalEstimatedHours: 120,
  totalCostMYR: 8400,
  requirementsAnalysis: [
    {
      description: 'User authentication system with login and registration',
      category: 'Authentication',
      complexityScore: 1.5
    },
    {
      description: 'Product catalog with search and filtering',
      category: 'Database',
      complexityScore: 1.8
    },
    {
      description: 'Shopping cart functionality',
      category: 'User Interface',
      complexityScore: 1.2
    },
    {
      description: 'Payment gateway integration with Stripe',
      category: 'Payment Processing',
      complexityScore: 2.5
    },
    {
      description: 'Fully responsive design for mobile and desktop',
      category: 'Mobile Responsiveness',
      complexityScore: 0.8
    }
  ]
})

onMounted(() => {
  // Load data from localStorage if available
  const formData = localStorage.getItem('protospec-form-data')
  const costPreview = localStorage.getItem('protospec-cost-preview')
  
  if (formData) {
    try {
      const parsedFormData = JSON.parse(formData)
      quote.value.clientName = parsedFormData.clientName
      quote.value.requirements = parsedFormData.requirements
      
      if (costPreview) {
        const parsedCostPreview = JSON.parse(costPreview)
        quote.value.totalEstimatedHours = parsedCostPreview.totalEstimatedHours
        quote.value.totalCostMYR = parsedCostPreview.totalCostMYR
      }
      
      // Generate requirements analysis based on requirements text
      generateRequirementsAnalysis(parsedFormData.requirements)
    } catch (error) {
      console.error('Error loading quote data:', error)
    }
  }
})

const generateRequirementsAnalysis = (requirements: string) => {
  // Simple analysis based on keywords
  const categories = [
    { keyword: 'authentication|login|register|user account', category: 'Authentication', baseComplexity: 1.5 },
    { keyword: 'product|catalog|inventory|shopping cart|e-commerce', category: 'E-commerce', baseComplexity: 1.8 },
    { keyword: 'mobile|responsive|phone|tablet', category: 'Mobile Responsiveness', baseComplexity: 0.8 },
    { keyword: 'payment|stripe|paypal|fpX|boost|touch n go', category: 'Payment Processing', baseComplexity: 2.5 },
    { keyword: 'database|sql|postgresql|mongodb', category: 'Database', baseComplexity: 1.6 },
    { keyword: 'api|integration|third party', category: 'Integration', baseComplexity: 2.0 },
    { keyword: 'admin|dashboard|report|analytics', category: 'Admin Features', baseComplexity: 1.7 },
    { keyword: 'seo|search engine|google', category: 'SEO & Marketing', baseComplexity: 1.2 },
    { keyword: 'security|ssl|https|encryption', category: 'Security', baseComplexity: 2.2 },
    { keyword: 'real-time|live|websocket|push', category: 'Real-time Features', baseComplexity: 2.8 }
  ]
  
  const lowerRequirements = requirements.toLowerCase()
  const analysis: any[] = []
  
  categories.forEach(({ keyword, category, baseComplexity }) => {
    const regex = new RegExp(keyword, 'i')
    if (regex.test(requirements)) {
      // Adjust complexity based on context
      let complexity = baseComplexity
      if (lowerRequirements.includes('simple') || lowerRequirements.includes('basic')) {
        complexity *= 0.7
      } else if (lowerRequirements.includes('complex') || lowerRequirements.includes('advanced')) {
        complexity *= 1.3
      }
      
      analysis.push({
        description: `Feature related to: ${category.toLowerCase()}`,
        category: category,
        complexityScore: Math.round(complexity * 10) / 10
      })
    }
  })
  
  // If no specific categories found, add generic ones
  if (analysis.length === 0) {
    analysis.push({
      description: 'General software development requirements',
      category: 'General Development',
      complexityScore: 1.0
    })
  }
  
  quote.value.requirementsAnalysis = analysis
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-MY', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const goBack = () => {
  // Navigate back to input page
  window.location.href = '/'
}

const downloadPDF = () => {
  generateAndDownloadPDF(quote.value, `${quote.value.clientName.replace(/[^a-z0-9]/gi, '_')}_quote.pdf`)
}
</script>