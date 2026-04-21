<template>
  <div class="min-h-screen bg-bg-primary">
    <main>
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <h1 class="text-display-hero text-text-primary">Quote Management</h1>
          <p class="mt-2 text-body-large text-text-secondary">Manage your saved project quotations</p>
        </div>
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white rounded-md p-6 md:p-8 relative shadow-card">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 class="text-subheading-large text-black mb-4 sm:mb-0">Saved Quotes</h2>
              <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div class="relative w-full sm:w-64">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search quotes..."
                    class="w-full px-4 py-2 rounded-md shadow-border focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] text-body-small"
                  />
                  <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="filteredQuotes.length === 0" class="text-center py-12">
              <div class="mx-auto w-24 h-24 bg-purple-light/20 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-card-title text-black mb-2">No quotes saved yet</h3>
              <p class="text-body-medium text-secondary mb-6">
                Create your first quote to get started managing your project estimates
              </p>
              <a 
                href="/" 
                class="inline-flex items-center px-6 py-3 rounded-lg text-button font-medium text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:ring-0 focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_0px_0px_4px_rgba(147,197,253,0.5)] transition-all duration-200 min-h-[48px] shadow-border hover:shadow-md"
              >
                Create New Quote
              </a>
            </div>
            
            <!-- Quote Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="quote in filteredQuotes" 
                :key="quote.id"
                class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                @click="viewQuote(quote.id)"
              >
                <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-card-title font-bold text-black truncate">
                        {{ quote.clientName || 'Untitled Quote' }}
                      </h3>
                      <p class="text-caption text-secondary mt-1">
                        {{ formatDate(quote.createdAt) }}
                      </p>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-pill text-caption font-medium bg-purple/10 text-purple">
                      RM {{ Math.round(quote.totalCost).toLocaleString() }}
                    </span>
                  </div>
                  
                  <div class="mb-4">
                    <p class="text-body-small text-secondary line-clamp-3">
                      {{ quote.requirements ? quote.requirements.substring(0, 120) + (quote.requirements.length > 120 ? '...' : '') : 'No requirements specified' }}
                    </p>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <div class="text-caption text-secondary">
                      {{ quote.projectDuration || 'Duration unknown' }}
                    </div>
                    <button 
                      @click.stop="deleteQuote(quote.id)"
                      class="text-error hover:text-error/80 transition-colors"
                      title="Delete quote"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pagination -->
            <div v-if="filteredQuotes.length > 0" class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-body-medium text-secondary">
                Showing {{ Math.min((currentPage - 1) * itemsPerPage + 1, filteredQuotes.length) }} - 
                {{ Math.min(currentPage * itemsPerPage, filteredQuotes.length) }} of 
                {{ filteredQuotes.length }} quotes
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="px-3 py-2 rounded-md text-body-medium font-medium text-secondary bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span class="px-3 py-2 text-body-medium font-medium text-black">
                  {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-2 rounded-md text-body-medium font-medium text-secondary bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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

const quotes = ref<Quote[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 9

const filteredQuotes = computed(() => {
  const filtered = quotes.value.filter(quote => 
    quote.clientName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    quote.requirements.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    quote.totalCost.toString().includes(searchQuery.value)
  )
  
  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filtered.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(
    quotes.value.filter(quote => 
      quote.clientName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      quote.requirements.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      quote.totalCost.toString().includes(searchQuery.value)
    ).length / itemsPerPage
  )
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const loadQuotes = () => {
  try {
    const savedQuotes = localStorage.getItem('protospec-saved-quotes')
    if (savedQuotes) {
      quotes.value = JSON.parse(savedQuotes)
    } else {
      quotes.value = []
    }
  } catch (error) {
    console.error('Failed to load quotes:', error)
    quotes.value = []
  }
}

const viewQuote = (id: string) => {
  window.location.href = `/quotes/${id}`
}

const deleteQuote = (id: string) => {
  if (confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
    try {
      const updatedQuotes = quotes.value.filter(quote => quote.id !== id)
      localStorage.setItem('protospec-saved-quotes', JSON.stringify(updatedQuotes))
      quotes.value = updatedQuotes
    } catch (error) {
      console.error('Failed to delete quote:', error)
      alert('Failed to delete quote')
    }
  }
}

onMounted(() => {
  loadQuotes()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>