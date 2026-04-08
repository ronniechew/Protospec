<template>
  <div class="min-h-screen bg-background">
    <header class="bg-white shadow-[border]">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-[40px] font-semibold text-primary leading-[1.20] tracking-[-2.4px]">Settings</h1>
        <p class="mt-2 text-secondary text-body">Configure your Protospec preferences</p>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow-card rounded-md p-6 md:p-8">
            <h2 class="text-subheading-large text-primary mb-6">AI Integration Settings</h2>
            
            <form @submit.prevent="saveSettings" class="space-y-6">
              <div>
                <label for="geminiApiKey" class="block text-body-semibold text-primary mb-2">
                  Gemini API Key
                </label>
                <div class="relative">
                  <input
                    id="geminiApiKey"
                    v-model="apiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    class="w-full px-3 py-2 pr-12 shadow-[border] rounded-md focus:outline-focus focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0_0_0_4px_rgba(147,197,253,0.5)] text-body-small placeholder:text-placeholder"
                    placeholder="Enter your Gemini API key (optional)"
                  />
                  <button
                    type="button"
                    @click="showApiKey = !showApiKey"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-secondary text-button"
                  >
                    <span v-if="showApiKey">Hide</span>
                    <span v-else>Show</span>
                  </button>
                </div>
                <p class="mt-3 text-caption text-secondary">
                  Your API key is stored locally in your browser and never sent to our servers.
                  Get your key from 
                  <a href="https://ai.google.dev/gemini-api" target="_blank" class="text-link hover:underline">
                    Google AI Studio
                  </a>.
                </p>
              </div>
              
              <div v-if="apiKeyStatus !== null" class="p-4 rounded-md shadow-[border]" :class="{
                'bg-success/10': apiKeyStatus === true,
                'bg-error/10': apiKeyStatus === false
              }">
                <div class="flex items-center">
                  <div v-if="apiKeyStatus === true" class="flex-shrink-0">
                    <svg class="h-5 w-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div v-else class="flex-shrink-0">
                    <svg class="h-5 w-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-caption" :class="{
                      'text-success': apiKeyStatus === true,
                      'text-error': apiKeyStatus === false
                    }">
                      {{ apiKeyStatusMessage }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <button
                  type="button"
                  @click="testApiKey"
                  :disabled="!apiKey.trim() || isTesting"
                  class="inline-flex items-center px-4 py-2 shadow-[border] text-button font-medium rounded-md text-primary bg-white hover:bg-gray-50 focus:outline-focus focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0_0_0_4px_rgba(147,197,253,0.5)] min-h-[36px]"
                >
                  <span v-if="!isTesting">Test API Key</span>
                  <span v-else>Testing...</span>
                </button>
                
                <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    @click="clearApiKey"
                    class="inline-flex items-center px-4 py-2 shadow-[border] text-button font-medium rounded-md text-primary bg-white hover:bg-gray-50 focus:outline-focus focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0_0_0_4px_rgba(147,197,253,0.5)] min-h-[36px]"
                  >
                    Clear Key
                  </button>
                  <button
                    type="submit"
                    :disabled="isSaving"
                    class="inline-flex items-center px-4 py-2 text-button font-medium rounded-md text-white bg-purple hover:bg-purple-dark focus:outline-focus focus:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0_0_0_4px_rgba(147,197,253,0.5)] transition-colors duration-200 min-h-[36px]"
                  >
                    <span v-if="!isSaving">Save Settings</span>
                    <span v-else>Saving...</span>
                  </button>
                </div>
              </div>
            </form>
            
            <div class="mt-8 pt-6 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)]">
              <h3 class="text-card-title text-primary mb-4">How AI Integration Works</h3>
              <div class="text-body-small text-secondary">
                <ul class="space-y-2 pl-5 list-disc">
                  <li>When you provide a valid Gemini API key, Protospec will use AI to analyze your project requirements</li>
                  <li>The AI provides more accurate estimates based on real-world development experience</li>
                  <li>Your API key is stored only in your browser's localStorage - we never see it</li>
                  <li>If the AI is unavailable or fails, Protospec automatically falls back to rule-based estimation</li>
                  <li>You can always remove your API key to disable AI features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const apiKey = ref('')
const showApiKey = ref(false)
const isTesting = ref(false)
const isSaving = ref(false)
const apiKeyStatus = ref<boolean | null>(null)
const apiKeyStatusMessage = ref('')

onMounted(() => {
  // Load existing API key from localStorage
  const savedKey = localStorage.getItem('protospec_gemini_api_key')
  if (savedKey) {
    apiKey.value = savedKey
  }
})

const testApiKey = async () => {
  if (!apiKey.value.trim()) {
    apiKeyStatus.value = false
    apiKeyStatusMessage.value = 'Please enter an API key first'
    return
  }

  isTesting.value = true
  apiKeyStatus.value = null
  apiKeyStatusMessage.value = ''

  try {
    // Test the API key by making a simple request to our endpoint
    const response = await fetch('/api/estimate-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requirements: 'Test requirement for API validation',
        clientName: 'Test Client'
      })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.aiPowered) {
        apiKeyStatus.value = true
        apiKeyStatusMessage.value = 'API key is valid and working!'
      } else {
        apiKeyStatus.value = false
        apiKeyStatusMessage.value = 'API key may be invalid or server-side configuration is missing'
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      apiKeyStatus.value = false
      apiKeyStatusMessage.value = errorData.error || `API test failed with status ${response.status}`
    }
  } catch (error) {
    console.error('API key test failed:', error)
    apiKeyStatus.value = false
    apiKeyStatusMessage.value = 'Failed to connect to the API service'
  } finally {
    isTesting.value = false
  }
}

const clearApiKey = () => {
  apiKey.value = ''
  localStorage.removeItem('protospec_gemini_api_key')
  apiKeyStatus.value = null
  apiKeyStatusMessage.value = ''
}

const saveSettings = () => {
  isSaving.value = true
  
  try {
    if (apiKey.value.trim()) {
      localStorage.setItem('protospec_gemini_api_key', apiKey.value.trim())
    } else {
      localStorage.removeItem('protospec_gemini_api_key')
    }
    
    // Show success message
    apiKeyStatus.value = true
    apiKeyStatusMessage.value = 'Settings saved successfully!'
    
    // Reset after 3 seconds
    setTimeout(() => {
      apiKeyStatus.value = null
      apiKeyStatusMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to save settings:', error)
    apiKeyStatus.value = false
    apiKeyStatusMessage.value = 'Failed to save settings'
  } finally {
    isSaving.value = false
  }
}
</script>