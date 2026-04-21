<template>
  <div class="min-h-screen bg-bg-primary">
    <main>
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-display-hero text-text-primary">Quote Details</h1>
              <p class="mt-2 text-body-large text-text-secondary">View and manage your saved quotation</p>
            </div>
            <a href="/quotes" class="text-link hover:text-link/80 font-medium transition-colors text-button ml-4">
              ← Back to Quotes
            </a>
          </div>
        </div>
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white rounded-md p-6 md:p-8 relative shadow-card">
            <!-- Loading state -->
            <div v-if="loading" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple mb-4"></div>
              <p class="text-body-medium text-secondary">Loading quote details...</p>
            </div>
            
            <!-- Error state -->
            <div v-else-if="error" class="text-center py-12">
              <div class="mx-auto w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 class="text-card-title text-black mb-2">Quote Not Found</h3>
              <p class="text-body-medium text-secondary mb-6">{{ error }}</p>
              <a 
                href="/quotes" 
                class="inline-flex items-center px-6 py-3 rounded-lg text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[48px] shadow-border hover:shadow-md"
              >
                Back to All Quotes
              </a>
            </div>
            
            <!-- Quote details -->
            <div v-else>
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-100">
                <div>
                  <h2 class="text-subheading-large text-black mb-2">
                    {{ quote.clientName || 'Untitled Quote' }}
                  </h2>
                  <div class="flex flex-wrap items-center gap-4 text-caption text-secondary">
                    <span>Created: {{ formatDate(quote.createdAt) }}</span>
                    <span>•</span>
                    <span class="font-medium text-purple">RM {{ Math.round(quote.totalCost).toLocaleString() }}</span>
                    <span>•</span>
                    <span>{{ quote.projectDuration || 'Duration unknown' }}</span>
                  </div>
                </div>
                <div class="flex gap-3 mt-4 sm:mt-0">
                  <button
                    @click="exportAsPDF"
                    class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    Export as PDF
                  </button>
                  <button
                    @click="duplicateQuote"
                    class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-purple-text bg-white border border-purple hover:bg-purple/5 focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Duplicate
                  </button>
                </div>
              </div>
              
              <!-- Quote Preview (Professional Markdown) -->
              <div class="mb-8" v-if="quote.markdownQuote">
                <h3 class="text-card-title text-black mb-4">Quote Preview</h3>
                <div 
                  class="prose prose-purple max-w-none p-6 bg-gray-50 rounded-md border border-purple/20"
                  v-html="parsedMarkdown"
                ></div>
              </div>
              
              <!-- Project Requirements -->
              <div class="mb-8">
                <h3 class="text-card-title text-black mb-4">Project Requirements</h3>
                <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
                  <p class="text-body-medium text-black whitespace-pre-wrap">{{ quote.requirements }}</p>
                </div>
              </div>
              
              <!-- Cost Breakdown -->
              <div class="mb-8" v-if="quote.costBreakdown">
                <h3 class="text-card-title text-black mb-6">Cost Breakdown</h3>
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
                        <td class="text-right py-3 px-4 text-body-small">{{ Math.round(quote.costBreakdown.technicalLead?.rate || 0).toLocaleString() }}</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ quote.costBreakdown.technicalLead?.days || 0 }}</td>
                        <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(quote.costBreakdown.technicalLead?.cost || 0).toLocaleString() }}</td>
                      </tr>
                      <tr class="border-b border-purple/10">
                        <td class="py-3 px-4 text-body-small">Senior Developer</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ Math.round(quote.costBreakdown.seniorDev?.rate || 0).toLocaleString() }}</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ quote.costBreakdown.seniorDev?.days || 0 }}</td>
                        <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(quote.costBreakdown.seniorDev?.cost || 0).toLocaleString() }}</td>
                      </tr>
                      <tr class="border-b border-purple/10">
                        <td class="py-3 px-4 text-body-small">UI/UX Designer</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ Math.round(quote.costBreakdown.uiux?.rate || 0).toLocaleString() }}</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ quote.costBreakdown.uiux?.days || 0 }}</td>
                        <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(quote.costBreakdown.uiux?.cost || 0).toLocaleString() }}</td>
                      </tr>
                      <tr class="border-b border-purple/10">
                        <td class="py-3 px-4 text-body-small">QA/Testing</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ Math.round(quote.costBreakdown.qa?.rate || 0).toLocaleString() }}</td>
                        <td class="text-right py-3 px-4 text-body-small">{{ quote.costBreakdown.qa?.days || 0 }}</td>
                        <td class="text-right py-3 px-4 text-body-small font-medium">{{ Math.round(quote.costBreakdown.qa?.cost || 0).toLocaleString() }}</td>
                      </tr>
                      <tr class="bg-purple/5">
                        <td class="py-4 px-4 text-body-medium font-medium text-purple-text">Total</td>
                        <td colspan="2"></td>
                        <td class="text-right py-4 px-4 text-card-title font-bold text-purple-text">{{ Math.round(quote.totalCost).toLocaleString() }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-100">
                <button
                  @click="deleteCurrentQuote"
                  class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-error bg-white border border-error hover:bg-error/5 focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
                >
                  Delete Quote
                </button>
                <a
                  href="/"
                  class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-purple-text bg-white border border-purple hover:bg-purple/5 focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
                >
                  Create New Quote
                </a>
                <a
                  href="/quotes"
                  class="inline-flex items-center px-4 py-2 rounded-md text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[44px] shadow-border hover:shadow-md"
                >
                  View All Quotes
                </a>
              </div>
            </div>
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
import { useRoute } from 'vue-router'

interface Quote {
  id: string;
  clientName: string;
  requirements: string;
  totalCost: number;
  createdAt: string;
  projectDuration?: string;
  markdownQuote?: string;
  costBreakdown?: any;
}

const route = useRoute()
const quote = ref<Quote | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Parse markdown for display
const parsedMarkdown = computed(() => {
  if (!quote.value?.markdownQuote) return ''
  
  let html = quote.value.markdownQuote
  
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// PDF export functionality
const { downloadPDF: generateAndDownloadPDF } = usePDFGenerator()

const exportAsPDF = () => {
  if (!quote.value) return
  
  const quoteData = {
    clientName: quote.value.clientName,
    quoteDate: new Date(quote.value.createdAt).toISOString().split('T')[0],
    requirements: quote.value.requirements,
    markdownQuote: quote.value.markdownQuote || '',
    costBreakdown: quote.value.costBreakdown || {},
    totalCost: quote.value.totalCost
  }
  
  generateAndDownloadPDF(quoteData, `${quote.value.clientName.replace(/[^a-z0-9]/gi, '_')}_quote.pdf`)
}

const loadQuote = (id: string) => {
  try {
    const savedQuotes = localStorage.getItem('protospec-saved-quotes')
    if (savedQuotes) {
      const quotes = JSON.parse(savedQuotes)
      const foundQuote = quotes.find((q: Quote) => q.id === id)
      if (foundQuote) {
        quote.value = foundQuote
        loading.value = false
      } else {
        error.value = 'Quote not found in storage.'
        loading.value = false
      }
    } else {
      error.value = 'No quotes found in storage.'
      loading.value = false
    }
  } catch (err) {
    console.error('Error loading quote:', err)
    error.value = 'Failed to load quote details.'
    loading.value = false
  }
}

const deleteCurrentQuote = () => {
  if (!quote.value) return
  
  if (confirm(`Are you sure you want to delete the quote for "${quote.value.clientName}"? This action cannot be undone.`)) {
    try {
      const savedQuotes = localStorage.getItem('protospec-saved-quotes')
      if (savedQuotes) {
        const quotes = JSON.parse(savedQuotes)
        const updatedQuotes = quotes.filter((q: Quote) => q.id !== quote.value!.id)
        localStorage.setItem('protospec-saved-quotes', JSON.stringify(updatedQuotes))
        window.location.href = '/quotes'
      }
    } catch (err) {
      console.error('Error deleting quote:', err)
      alert('Failed to delete quote.')
    }
  }
}

const duplicateQuote = () => {
  if (!quote.value) return
  
  try {
    // Create a new quote with modified properties
    const newQuote = {
      ...quote.value,
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      clientName: `${quote.value.clientName} (Copy)`
    }
    
    // Load existing quotes and add the new one
    const savedQuotes = localStorage.getItem('protospec-saved-quotes')
    let quotes = savedQuotes ? JSON.parse(savedQuotes) : []
    quotes.push(newQuote)
    localStorage.setItem('protospec-saved-quotes', JSON.stringify(quotes))
    
    // Navigate to the new quote
    window.location.href = `/quotes/${newQuote.id}`
  } catch (err) {
    console.error('Error duplicating quote:', err)
    alert('Failed to duplicate quote.')
  }
}

onMounted(() => {
  // Extract quote ID from route params
  const quoteId = route.params.id as string
  if (quoteId) {
    loadQuote(quoteId)
  } else {
    error.value = 'Invalid quote ID provided.'
    loading.value = false
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