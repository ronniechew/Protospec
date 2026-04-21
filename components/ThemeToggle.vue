<template>
  <div class="theme-toggle">
    <button
      class="theme-toggle-option"
      :class="{ active: currentTheme === 'light' }"
      @click="setTheme('light')"
    >
      Light
    </button>
    <button
      class="theme-toggle-option"
      :class="{ active: currentTheme === 'dark' }"
      @click="setTheme('dark')"
    >
      Dark
    </button>
    <button
      class="theme-toggle-option"
      :class="{ active: currentTheme === 'system' }"
      @click="setTheme('system')"
    >
      System
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTheme = ref('system')

// Get current theme from localStorage or system preference
const getCurrentTheme = () => {
  const stored = localStorage.getItem('theme')
  if (stored) return stored
  return 'system'
}

// Set theme using the global function defined in app.vue
const setTheme = (theme) => {
  // Call the global applyTheme function
  if (typeof window.applyTheme === 'function') {
    window.applyTheme(theme)
  } else {
    // Fallback: use the same logic as in app.vue
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem('theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
    
    // Set CSS variables based on theme
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.style.setProperty('--bg-primary', '#171717')
      document.documentElement.style.setProperty('--bg-secondary', '#222222')
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', '#cccccc')
      document.documentElement.style.setProperty('--text-tertiary', '#aaaaaa')
      document.documentElement.style.setProperty('--border-color', 'rgba(255,255,255,0.1)')
      document.documentElement.style.setProperty('--primary-color', '#8B5CF6')
      document.documentElement.style.setProperty('--primary-color-dark', '#7C3AED')
      document.documentElement.style.setProperty('--primary-color-light', '#312E47')
      document.documentElement.style.setProperty('--success', '#60a5fa')
      document.documentElement.style.setProperty('--warning', '#fbbf24')
      document.documentElement.style.setProperty('--error', '#f87171')
      document.documentElement.style.setProperty('--link', '#93c5fd')
    } else {
      // Light theme (default values)
      document.documentElement.style.setProperty('--bg-primary', '#ffffff')
      document.documentElement.style.setProperty('--bg-secondary', '#f8f5ff')
      document.documentElement.style.setProperty('--text-primary', '#171717')
      document.documentElement.style.setProperty('--text-secondary', '#4d4d4d')
      document.documentElement.style.setProperty('--text-tertiary', '#666666')
      document.documentElement.style.setProperty('--border-color', 'rgba(0,0,0,0.08)')
      document.documentElement.style.setProperty('--primary-color', '#7C3AED')
      document.documentElement.style.setProperty('--primary-color-dark', '#6a32c9')
      document.documentElement.style.setProperty('--primary-color-light', '#f8f5ff')
      document.documentElement.style.setProperty('--success', '#0a72ef')
      document.documentElement.style.setProperty('--warning', '#de1d8d')
      document.documentElement.style.setProperty('--error', '#ff5b4f')
      document.documentElement.style.setProperty('--link', '#0072f5')
    }
  }
  
  currentTheme.value = theme
  
  // Listen for system theme changes when in system mode
  if (theme === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)
  } else {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange)
  }
}

const handleSystemThemeChange = (e) => {
  if (currentTheme.value === 'system') {
    setTheme('system')
  }
}

onMounted(() => {
  currentTheme.value = getCurrentTheme()
  
  // Initialize system theme listener if needed
  if (currentTheme.value === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)
  }
})

// Clean up event listeners
onUnmounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange)
})
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 4px;
  transition: all 0.3s ease;
}

.theme-toggle-option {
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-option.active {
  background: var(--primary-color);
  color: white;
}
</style>