<template>
  <div class="min-h-screen bg-white">
    <!-- Global Header Navigation -->
    <header 
      class="sticky top-0 z-50 bg-white shadow-border"
      :class="{ 'shadow-elevation': isScrolled }"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo/Brand -->
          <div class="flex-shrink-0 flex items-center">
            <span class="text-black text-body-medium font-semibold">Protospec</span>
          </div>
          
          <!-- Navigation Links -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink 
              to="/" 
              class="text-tertiary text-button hover:text-primary transition-colors duration-150"
              active-class="text-purple font-semibold"
            >
              Home
            </NuxtLink>
            <NuxtLink 
              to="/results" 
              class="text-tertiary text-button hover:text-primary transition-colors duration-150"
              active-class="text-purple font-semibold"
            >
              Results
            </NuxtLink>
            <NuxtLink 
              to="/settings" 
              class="text-tertiary text-button hover:text-primary transition-colors duration-150"
              active-class="text-purple font-semibold"
            >
              Settings
            </NuxtLink>
          </nav>
          
          <!-- Primary CTA Button -->
          <div class="flex items-center">
            <button 
              class="bg-purple text-white px-4 py-2 rounded-md text-button font-medium hover:bg-purple-dark transition-colors duration-150 focus:outline-focus focus:shadow-focus"
            >
              New Prompt
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
const isScrolled = ref(false)

// Add scroll listener for elevation effect
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 0
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // Clean up event listener
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style scoped>
/* Apply Geist typography globally */
:global(body) {
  font-family: theme('fontFamily.sans');
}

/* Ensure shadow-as-border technique is used instead of traditional borders */
.shadow-border {
  box-shadow: theme('boxShadow.border');
}

.shadow-elevation {
  box-shadow: theme('boxShadow.elevation');
}
</style>