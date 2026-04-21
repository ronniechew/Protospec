<template>
  <div class="font-geist min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
  ],
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap'
    }
  ],
  script: [
    {
      innerHTML: `
        (function() {
          // Theme management
          const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const getStoredTheme = () => localStorage.getItem('theme');
          
          const applyTheme = (theme) => {
            if (theme === 'system') {
              document.documentElement.removeAttribute('data-theme');
              localStorage.removeItem('theme');
            } else {
              document.documentElement.setAttribute('data-theme', theme);
              localStorage.setItem('theme', theme);
            }
            
            // Set CSS variables based on theme
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.style.setProperty('--bg-primary', '#171717');
              document.documentElement.style.setProperty('--bg-secondary', '#222222');
              document.documentElement.style.setProperty('--text-primary', '#ffffff');
              document.documentElement.style.setProperty('--text-secondary', '#cccccc');
              document.documentElement.style.setProperty('--text-tertiary', '#aaaaaa');
              document.documentElement.style.setProperty('--border-color', 'rgba(255,255,255,0.1)');
              document.documentElement.style.setProperty('--primary-color', '#8B5CF6');
              document.documentElement.style.setProperty('--primary-color-dark', '#7C3AED');
              document.documentElement.style.setProperty('--primary-color-light', '#312E47');
              document.documentElement.style.setProperty('--success', '#60a5fa');
              document.documentElement.style.setProperty('--warning', '#fbbf24');
              document.documentElement.style.setProperty('--error', '#f87171');
              document.documentElement.style.setProperty('--link', '#93c5fd');
            } else {
              // Light theme (default values)
              document.documentElement.style.setProperty('--bg-primary', '#ffffff');
              document.documentElement.style.setProperty('--bg-secondary', '#f8f5ff');
              document.documentElement.style.setProperty('--text-primary', '#171717');
              document.documentElement.style.setProperty('--text-secondary', '#4d4d4d');
              document.documentElement.style.setProperty('--text-tertiary', '#666666');
              document.documentElement.style.setProperty('--border-color', 'rgba(0,0,0,0.08)');
              document.documentElement.style.setProperty('--primary-color', '#7C3AED');
              document.documentElement.style.setProperty('--primary-color-dark', '#6a32c9');
              document.documentElement.style.setProperty('--primary-color-light', '#f8f5ff');
              document.documentElement.style.setProperty('--success', '#0a72ef');
              document.documentElement.style.setProperty('--warning', '#de1d8d');
              document.documentElement.style.setProperty('--error', '#ff5b4f');
              document.documentElement.style.setProperty('--link', '#0072f5');
            }
          };
          
          // Initialize theme
          const initTheme = () => {
            const storedTheme = getStoredTheme();
            if (storedTheme) {
              applyTheme(storedTheme);
            } else {
              applyTheme('system');
            }
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
              if (getStoredTheme() === 'system') {
                applyTheme('system');
              }
            });
          };
          
          // Apply theme when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTheme);
          } else {
            initTheme();
          }
        })();
      `,
      type: 'text/javascript'
    }
  ]
})
</script>