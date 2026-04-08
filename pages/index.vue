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
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  :disabled="isGenerating"
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
import { ref } from 'vue'

const formData = ref({
  clientName: '',
  requirements: ''
})

const isGenerating = ref(false)

const generateQuote = async () => {
  if (!formData.value.clientName || !formData.value.requirements) {
    alert('Please fill in all fields')
    return
  }
  
  isGenerating.value = true
  try {
    // TODO: Call API to generate quote
    console.log('Generating quote for:', formData.value)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Navigate to results page
  } catch (error) {
    console.error('Error generating quote:', error)
    alert('An error occurred while generating the quote')
  } finally {
    isGenerating.value = false
  }
}
</script>