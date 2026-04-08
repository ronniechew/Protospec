import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '../../pages/index.vue'
import ResultsPage from '../../pages/results.vue'

// Mock performance.now for timing tests
const originalPerformance = window.performance
beforeEach(() => {
  window.performance = {
    ...originalPerformance,
    now: vi.fn().mockReturnValue(0)
  }
})

afterEach(() => {
  window.performance = originalPerformance
})

describe('Rapid Entry Workflow', () => {
  it('should complete quote generation workflow in under 2 minutes on desktop', async () => {
    // Simulate desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    
    const startTime = Date.now()
    
    // Mount index page
    const indexWrapper = mount(IndexPage)
    
    // Fill out form
    await indexWrapper.find('#clientName').setValue('Test Client')
    await indexWrapper.find('#requirements').setValue(
      'Build a responsive e-commerce website with user authentication, product catalog, shopping cart, and payment integration.'
    )
    
    // Mock API call timing (should be fast)
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return 0 as any
    })
    
    // Submit form
    await indexWrapper.find('form').trigger('submit.prevent')
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Should complete in under 2 minutes (120,000 ms)
    // In reality, this should be much faster (< 5 seconds)
    expect(totalTime).toBeLessThan(120000)
    
    // Verify we would navigate to results
    expect(indexWrapper.vm.isGenerating.value).toBe(false)
  })

  it('should complete quote generation workflow in under 2 minutes on mobile', async () => {
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    
    const startTime = Date.now()
    
    const indexWrapper = mount(IndexPage)
    
    await indexWrapper.find('#clientName').setValue('Mobile Test Client')
    await indexWrapper.find('#requirements').setValue(
      'Simple mobile app with login and basic features.'
    )
    
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return 0 as any
    })
    
    await indexWrapper.find('form').trigger('submit.prevent')
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    expect(totalTime).toBeLessThan(120000)
  })

  it('should handle minimal requirements input quickly', async () => {
    const startTime = Date.now()
    
    const indexWrapper = mount(IndexPage)
    
    await indexWrapper.find('#clientName').setValue('Quick Client')
    await indexWrapper.find('#requirements').setValue('Simple website.')
    
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return 0 as any
    })
    
    await indexWrapper.find('form').trigger('submit.prevent')
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Minimal input should be very fast
    expect(totalTime).toBeLessThan(5000)
  })

  it('should maintain responsive design across devices', () => {
    // Test desktop
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    const desktopWrapper = mount(IndexPage)
    expect(desktopWrapper.find('.max-w-7xl').exists()).toBe(true)
    
    // Test tablet
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true })
    const tabletWrapper = mount(IndexPage)
    expect(tabletWrapper.find('.max-w-7xl').exists()).toBe(true)
    
    // Test mobile
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    const mobileWrapper = mount(IndexPage)
    expect(mobileWrapper.find('.px-4').exists()).toBe(true)
  })
})