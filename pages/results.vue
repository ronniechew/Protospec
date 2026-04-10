<template>
  <div class="min-h-screen bg-white">
    <main>
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white rounded-md p-6 md:p-8 relative shadow-card">
            <!-- Client Information -->
            <div class="mb-8">
              <h2 class="text-subheading-large text-black mb-4">Client Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-body-medium text-black mb-2">Client Name</label>
                  <input
                    v-model="clientName"
                    type="text"
                    class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-body-small"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label class="block text-body-medium text-black mb-2">Quote Date</label>
                  <input
                    v-model="quoteDate"
                    type="date"
                    class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-body-small"
                  />
                </div>
              </div>
            </div>

            <!-- Project Requirements -->
            <div class="mb-8">
              <h2 class="text-subheading-large text-black mb-4">Project Requirements</h2>
              <textarea
                v-model="requirements"
                rows="6"
                class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-mono-body leading-relaxed"
                placeholder="Project requirements summary..."
              ></textarea>
            </div>

            <!-- Quote Preview (Professional Markdown) -->
            <div class="mb-8" v-if="markdownQuote">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-subheading-large text-black">Quote Preview</h2>
                <span 
                  v-if="hasCostDiscrepancies" 
                  class="inline-flex items-center px-2 py-1 rounded-pill text-caption font-medium bg-warning/10 text-warning"
                >
                  Adjusted from original
                </span>
              </div>
              <div 
                class="prose prose-purple max-w-none p-6 bg-gray-50 rounded-md border border-purple/20"
                v-html="parsedMarkdown"
              ></div>
              <p 
                v-if="hasCostDiscrepancies" 
                class="mt-2 text-caption text-secondary"
              >
                Note: Cost values have been adjusted from the original AI-generated quote. PDF exports will reflect your current adjustments.
              </p>
            </div>

            <!-- Interactive Rate Card -->
            <div class="mb-8">
              <h2 class="text-subheading-large text-black mb-6">Rate Card Configuration</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Technical Lead / Architect -->
                <div class="bg-purple-light/10 p-4 rounded-md border border-purple/20">
                  <h3 class="font-medium text-body-medium text-purple-text mb-3">Technical Lead / Architect</h3>
                  <div class="mb-2">
                    <label class="block text-caption text-secondary mb-1">Daily Rate: {{ Math.round(technicalLeadRate) }}</label>
                    <input
                      v-model="technicalLeadRate"
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      class="w-full h-2 bg-purple/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="flex justify-between text-caption text-secondary mt-1">
                      <span>100</span>
                      <span>10,000</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-caption text-secondary mb-1">Days: {{ technicalLeadDays }}</label>
                    <input
                      v-model="technicalLeadDays"
                      type="number"
                      min="1"
                      max="100"
                      class="w-full px-2 py-1 text-body-small rounded border border-purple/30 focus:outline-purple focus:ring-1 focus:ring-purple"
                    />
                  </div>
                </div>

                <!-- Senior Developer -->
                <div class="bg-purple-light/10 p-4 rounded-md border border-purple/20">
                  <h3 class="font-medium text-body-medium text-purple-text mb-3">Senior Developer</h3>
                  <div class="mb-2">
                    <label class="block text-caption text-secondary mb-1">Daily Rate: {{ Math.round(seniorDevRate) }}</label>
                    <input
                      v-model="seniorDevRate"
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      class="w-full h-2 bg-purple/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="flex justify-between text-caption text-secondary mt-1">
                      <span>100</span>
                      <span>10,000</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-caption text-secondary mb-1">Days: {{ seniorDevDays }}</label>
                    <input
                      v-model="seniorDevDays"
                      type="number"
                      min="1"
                      max="100"
                      class="w-full px-2 py-1 text-body-small rounded border border-purple/30 focus:outline-purple focus:ring-1 focus:ring-purple"
                    />
                  </div>
                </div>

                <!-- UI/UX Designer -->
                <div class="bg-purple-light/10 p-4 rounded-md border border-purple/20">
                  <h3 class="font-medium text-body-medium text-purple-text mb-3">UI/UX Designer</h3>
                  <div class="mb-2">
                    <label class="block text-caption text-secondary mb-1">Daily Rate: {{ Math.round(uiuxRate) }}</label>
                    <input
                      v-model="uiuxRate"
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      class="w-full h-2 bg-purple/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="flex justify-between text-caption text-secondary mt-1">
                      <span>100</span>
                      <span>10,000</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-caption text-secondary mb-1">Days: {{ uiuxDays }}</label>
                    <input
                      v-model="uiuxDays"
                      type="number"
                      min="1"
                      max="100"
                      class="w-full px-2 py-1 text-body-small rounded border border-purple/30 focus:outline-purple focus:ring-1 focus:ring-purple"
                    />
                  </div>
                </div>

                <!-- QA/Testing -->
                <div class="bg-purple-light/10 p-4 rounded-md border border-purple/20">
                  <h3 class="font-medium text-body-medium text-purple-text mb-3">QA/Testing</h3>
                  <div class="mb-2">
                    <label class="block text-caption text-secondary mb-1">Daily Rate: {{ Math.round(qaRate) }}</label>
                    <input
                      v-model="qaRate"
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      class="w-full h-2 bg-purple/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="flex justify-between text-caption text-secondary mt-1">
                      <span>100</span>
                      <span>10,000</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-caption text-secondary mb-1">Days: {{ qaDays }}</label>
                    <input
                      v-model="qaDays"
                      type="number"
                      min="1"
                      max="100"
                      class="w-full px-2 py-1 text-body-small rounded border border-purple/30 focus:outline-purple focus:ring-1 focus:ring-purple"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Cost Breakdown -->
            <div class="mb-8">
              <h2 class="text-subheading-large text-black mb-6">Cost Breakdown</h2>
              <div class="border border-purple/20 rounded-md overflow-hidden">
                <table class="w-full">
                  <thead class="bg-purple/10">
                    <tr>
                      <th class="text-left py-3 px-4 text-body-medium text-purple-text">Role</th>
                      <th class="text-right py-3 px-4 text-body-medium text-purple-text">Daily Rate</th>
                      <th class="text-right py-3 px-4 text-body-medium text-purple-text">Days</th>
                      <th class="text-right py-3 px-4 text-body-medium text-purple-text">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-purple/10">
                      <td class="py-3 px-4 text-body-small">Technical Lead / Architect</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ Math.round(technicalLeadRate).toLocaleString() }}</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ technicalLeadDays }}</td>
                      <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(technicalLeadCost).toLocaleString() }}</td>
                    </tr>
                    <tr class="border-b border-purple/10">
                      <td class="py-3 px-4 text-body-small">Senior Developer</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ Math.round(seniorDevRate).toLocaleString() }}</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ seniorDevDays }}</td>
                      <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(seniorDevCost).toLocaleString() }}</td>
                    </tr>
                    <tr class="border-b border-purple/10">
                      <td class="py-3 px-4 text-body-small">UI/UX Designer</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ Math.round(uiuxRate).toLocaleString() }}</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ uiuxDays }}</td>
                      <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(uiuxCost).toLocaleString() }}</td>
                    </tr>
                    <tr class="border-b border-purple/10">
                      <td class="py-3 px-4 text-body-small">QA/Testing</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ Math.round(qaRate).toLocaleString() }}</td>
                      <td class="text-right py-3 px-4 text-body-small">{{ qaDays }}</td>
                      <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(qaCost).toLocaleString() }}</td>
                    </tr>
                    <tr class="bg-purple/5">
                      <td class="py-4 px-4 text-body-medium font-medium text-purple-text">Total</td>
                      <td colspan="2"></td>
                      <td class="text-right py-4 px-4 text-card-title font-bold text-purple-text">{{ Math.round(totalCost).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                @click="exportAsPDF"
                class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
              >
                Export as PDF
              </button>
              <button
                @click="saveQuote"
                class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-purple-text bg-white border border-purple hover:bg-purple/5 focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
              >
                Save Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePDFGenerator } from '~/composables/usePDFGenerator'

// Client information
const clientName = ref('')
const quoteDate = ref(new Date().toISOString().split('T')[0])

// Project details
const requirements = ref('')
const markdownQuote = ref('')

// Parse markdown for display
const parsedMarkdown = computed(() => {
  if (!markdownQuote.value) return ''
  
  let html = markdownQuote.value
  
  // Handle headers
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-purple-text mt-6 mb-4">$1</h2>')
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-black mt-4 mb-2">$1</h3>')
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-medium text-black mt-3 mb-2">$1</h4>')
  
  // Handle bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  
  // Handle tables
  html = html.replace(/<table>/g, '<table class="w-full my-4 border-collapse">')
  html = html.replace(/<thead>/g, '<thead class="bg-purple/10">')
  html = html.replace(/<th>/g, '<th class="text-left py-2 px-3 text-body-medium text-purple-text border border-purple/20">')
  html = html.replace(/<td>/g, '<td class="py-2 px-3 text-body-small border border-purple/20">')
  
  // Handle lists
  html = html.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-6 list-decimal">$2</li>')
  html = html.replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
  
  // Wrap lists in proper tags
  html = html.replace(/(<li.*?>.*?<\/li>)+/gs, '<ol class="list-decimal space-y-1">$&</ol>')
  html = html.replace(/(<li.*?>.*?<\/li>)+/gs, '<ul class="list-disc space-y-1">$&</ul>')
  
  // Handle paragraphs
  html = html.replace(/^(?!<[h|t|l])/gm, '<p class="mb-3 text-body-medium text-black">$&</p>')
  
  return html
})

// Rate card configuration with flexible ranges
const technicalLeadRate = ref(3000)
const technicalLeadDays = ref(10)
const seniorDevRate = ref(2000)
const seniorDevDays = ref(20)
const uiuxRate = ref(1500)
const uiuxDays = ref(15)
const qaRate = ref(1000)
const qaDays = ref(12)

// Computed costs
const technicalLeadCost = computed(() => technicalLeadRate.value * technicalLeadDays.value)
const seniorDevCost = computed(() => seniorDevRate.value * seniorDevDays.value)
const uiuxCost = computed(() => uiuxRate.value * uiuxDays.value)
const qaCost = computed(() => qaRate.value * qaDays.value)
const totalCost = computed(() => technicalLeadCost.value + seniorDevCost.value + uiuxCost.value + qaCost.value)

// Check if current values differ from original LLM quote
const hasCostDiscrepancies = computed(() => {
  // Try to parse original LLM cost breakdown from localStorage
  const storedCostBreakdown = localStorage.getItem('protospec-cost-breakdown')
  if (!storedCostBreakdown) return false
  
  try {
    const originalBreakdown = JSON.parse(storedCostBreakdown)
    
    // Check if this is the detailed format with role breakdowns
    if (originalBreakdown.technicalLeadArchitect && 
        originalBreakdown.seniorDeveloper && 
        originalBreakdown.uiuxDesigner && 
        originalBreakdown.qaTesting) {
      
      const originalTotal = (
        originalBreakdown.technicalLeadArchitect.dailyRate * originalBreakdown.technicalLeadArchitect.days +
        originalBreakdown.seniorDeveloper.dailyRate * originalBreakdown.seniorDeveloper.days +
        originalBreakdown.uiuxDesigner.dailyRate * originalBreakdown.uiuxDesigner.days +
        originalBreakdown.qaTesting.dailyRate * originalBreakdown.qaTesting.days
      )
      
      // Compare with current total (allow small rounding differences)
      return Math.abs(originalTotal - totalCost.value) > 1
    }
    
    // Check if this is the summary format
    if (originalBreakdown.totalCostMYR) {
      return Math.abs(originalBreakdown.totalCostMYR - totalCost.value) > 1
    }
    
  } catch (error) {
    console.warn('Failed to parse original cost breakdown:', error)
  }
  
  return false
})

// PDF export functionality
const { downloadPDF: generateAndDownloadPDF } = usePDFGenerator()

const exportAsPDF = () => {
  console.log('Export as PDF button clicked!')
  // Always use current rate card values for PDF export (user-adjusted values)
  const quoteData = {
    clientName: clientName.value,
    quoteDate: quoteDate.value,
    requirements: requirements.value,
    markdownQuote: markdownQuote.value,
    costBreakdown: {
      technicalLead: { rate: technicalLeadRate.value, days: technicalLeadDays.value, cost: technicalLeadCost.value },
      seniorDev: { rate: seniorDevRate.value, days: seniorDevDays.value, cost: seniorDevCost.value },
      uiux: { rate: uiuxRate.value, days: uiuxDays.value, cost: uiuxCost.value },
      qa: { rate: qaRate.value, days: qaDays.value, cost: qaCost.value }
    },
    totalCost: totalCost.value
  }
  
  generateAndDownloadPDF(quoteData, `${clientName.value.replace(/[^a-z0-9]/gi, '_')}_quote.pdf`)
}

const saveQuote = () => {
  alert('Quote saved successfully!')
}

// Load data from localStorage
onMounted(() => {
  const storedFormData = localStorage.getItem('protospec-form-data')
  const storedMarkdownQuote = localStorage.getItem('protospec-markdown-quote')
  const storedCostBreakdown = localStorage.getItem('protospec-cost-breakdown')
  
  if (storedFormData) {
    const formData = JSON.parse(storedFormData)
    clientName.value = formData.clientName || ''
    requirements.value = formData.requirements || ''
  }
  
  if (storedMarkdownQuote) {
    markdownQuote.value = storedMarkdownQuote
  }
  
  // Load detailed cost breakdown from LLM if available
  if (storedCostBreakdown) {
    try {
      const costBreakdown = JSON.parse(storedCostBreakdown)
      
      // Check if this is the new detailed format
      if (costBreakdown.technicalLeadArchitect && costBreakdown.seniorDeveloper && costBreakdown.uiuxDesigner && costBreakdown.qaTesting) {
        // Initialize rate card with actual LLM values (detailed format)
        technicalLeadRate.value = costBreakdown.technicalLeadArchitect.dailyRate || 3000
        technicalLeadDays.value = costBreakdown.technicalLeadArchitect.days || 10
        seniorDevRate.value = costBreakdown.seniorDeveloper.dailyRate || 2000
        seniorDevDays.value = costBreakdown.seniorDeveloper.days || 20
        uiuxRate.value = costBreakdown.uiuxDesigner.dailyRate || 1500
        uiuxDays.value = costBreakdown.uiuxDesigner.days || 15
        qaRate.value = costBreakdown.qaTesting.dailyRate || 1000
        qaDays.value = costBreakdown.qaTesting.days || 12
      } else if (costBreakdown.totalCostMYR) {
        // Handle old summary format - keep defaults since we don't have detailed breakdown
        // The defaults will remain as initialized
      }
    } catch (error) {
      console.warn('Failed to parse stored cost breakdown:', error)
      // Keep default values if parsing fails
    }
  }
})
</script>

<style scoped>
/* Print-specific styles for PDF export */
@media print {
  .shadow-card, .shadow-border {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }
  
  button {
    display: none !important;
  }
  
  .bg-purple-light\/10 {
    background-color: #f9f5ff !important;
  }
  
  .prose {
    font-size: 14px !important;
  }
}
</style>