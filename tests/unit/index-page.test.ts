import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '../../pages/index.vue'

describe('Index Page', () => {
  it('should render the form with client name and requirements fields', () => {
    const wrapper = mount(IndexPage)
    
    expect(wrapper.find('h1').text()).toBe('Protospec')
    expect(wrapper.find('input#clientName').exists()).toBe(true)
    expect(wrapper.find('textarea#requirements').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Generate Quote')
  })

  it('should show validation error when fields are empty', async () => {
    const wrapper = mount(IndexPage)
    
    // Mock alert to capture the message
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields')
    alertSpy.mockRestore()
  })

  it('should disable submit button when generating quote', async () => {
    const wrapper = mount(IndexPage)
    
    // Set form data
    await wrapper.setData({
      formData: {
        clientName: 'Test Client',
        requirements: 'Test requirements'
      }
    })
    
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeUndefined()
    
    // Simulate quote generation
    wrapper.vm.isGenerating = true
    await wrapper.vm.$nextTick()
    
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('Generating...')
  })

  it('should handle quote generation error', async () => {
    const wrapper = mount(IndexPage)
    
    // Mock console.error and alert
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    // Set form data
    await wrapper.setData({
      formData: {
        clientName: 'Test Client',
        requirements: 'Test requirements'
      }
    })
    
    // Mock the generateQuote method to throw an error
    wrapper.vm.generateQuote = vi.fn().mockRejectedValue(new Error('API Error'))
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalledWith('An error occurred while generating the quote')
    
    consoleErrorSpy.mockRestore()
    alertSpy.mockRestore()
  })
})