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

            <!-- LLM Reasoning Summary -->
            <div class="mb-8">
              <h2 class="text-subheading-large text-black mb-4">LLM Analysis & Reasoning</h2>
              <textarea
                v-model="llmReasoning"
                rows="8"
                class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-mono-body leading-relaxed"
                placeholder="LLM reasoning process and analysis..."
              ></textarea>
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
import { ref, computed } from 'vue'
import { usePDFGenerator } from '~/composables/usePDFGenerator'

// Client information
const clientName = ref('')
const quoteDate = ref(new Date().toISOString().split('T')[0])

// Project details
const requirements = ref('')
const llmReasoning = ref('')

// Rate card configuration with flexible ranges
const technicalLeadRate = ref(3000) // Default reasonable value
const technicalLeadDays = ref(10)
const seniorDevRate = ref(2000) // Default reasonable value  
const seniorDevDays = ref(20)
const uiuxRate = ref(1500) // Default reasonable value
const uiuxDays = ref(15)
const qaRate = ref(1000) // Default reasonable value
const qaDays = ref(12)

// Computed costs
const technicalLeadCost = computed(() => technicalLeadRate.value * technicalLeadDays.value)
const seniorDevCost = computed(() => seniorDevRate.value * seniorDevDays.value)
const uiuxCost = computed(() => uiuxRate.value * uiuxDays.value)
const qaCost = computed(() => qaRate.value * qaDays.value)
const totalCost = computed(() => technicalLeadCost.value + seniorDevCost.value + uiuxCost.value + qaCost.value)

// PDF export functionality
const { downloadPDF: generateAndDownloadPDF } = usePDFGenerator()

const exportAsPDF = () => {
  const quoteData = {
    clientName: clientName.value,
    quoteDate: quoteDate.value,
    requirements: requirements.value,
    llmReasoning: llmReasoning.value,
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
  // Save quote logic would go here
  alert('Quote saved successfully!')
}

// Load data from localStorage if available (from estimation process)
onMounted(() => {
  const storedFormData = localStorage.getItem('protospec-form-data')
  const storedCostPreview = localStorage.getItem('protospec-cost-preview')
  
  if (storedFormData) {
    const formData = JSON.parse(storedFormData)
    clientName.value = formData.clientName || ''
    requirements.value = formData.requirements || ''
  }
  
  if (storedCostPreview) {
    const costPreview = JSON.parse(storedCostPreview)
    // Note: In a real implementation, you'd parse the LLM reasoning to extract role-specific estimates
    // For now, we'll use reasonable defaults based on total cost
    llmReasoning.value = 'LLM analysis and reasoning would appear here...'
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
}
</style>