<template>
  <div class="theme-toggle">
    <button
      class="theme-toggle-option"
      :class="{ active: currentTheme === 'light' }"
      data-theme="light"
      @click="setTheme('light')"
    >
      Light
    </button>
    <button
      class="theme-toggle-option"
      :class="{ active: currentTheme === 'dark' }"
      data-theme="dark"
      @click="setTheme('dark')"
    >
      Dark
    </button>
    <button
      class="theme-toggle-option"
      :class="{ active: currentTheme === 'system' }"
      data-theme="system"
      @click="setTheme('system')"
    >
      System
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTheme = ref('system')

// Get system theme preference
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Get stored theme from localStorage
const getStoredTheme = () => {
  return localStorage.getItem('theme')
}

// Apply theme to document
const applyTheme = (theme) => {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }
  currentTheme.value = theme
  updateToggleUI()
}

// Update toggle UI to reflect current theme
const updateToggleUI = () => {
  const options = document.querySelectorAll('.theme-toggle-option')
  options.forEach(option => {
    option.classList.toggle('active', option.dataset.theme === currentTheme.value)
  })
}

// Initialize theme
const initTheme = () => {
  const storedTheme = getStoredTheme()
  const systemTheme = getSystemTheme()
  
  if (storedTheme) {
    applyTheme(storedTheme)
  } else {
    applyTheme('system')
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (currentTheme.value === 'system') {
      document.documentElement.removeAttribute('data-theme')
      updateToggleUI()
    }
  })
}

// Set theme handler
const setTheme = (theme) => {
  applyTheme(theme)
}

onMounted(() => {
  initTheme()
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