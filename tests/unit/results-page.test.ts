import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsPage from '../../pages/results.vue'

describe('Results Page', () => {
  const mockQuote = {
    clientName: 'Test Client',
    requirements: 'Build a responsive e-commerce website',
    totalEstimatedHours: 120,
    totalCostMYR: 8400,
    requirementsAnalysis: [
      {
        description: 'User authentication system',
        category: 'Authentication',
        complexityScore: 1.5
      },
      {
        description: 'Payment gateway integration',
        category: 'Payment Processing',
        complexityScore: 2.5
      }
    ]
  }

  it('should display quote summary correctly', () => {
    const wrapper = mount(ResultsPage, {
      global: {
        mocks: {
          $route: { query: {} }
        }
      }
    })
    
    // Update the component's quote data
    wrapper.vm.quote = mockQuote
    
    expect(wrapper.find('h2').text()).toContain('Test Client Project')
    expect(wrapper.find('.text-3xl.font-bold.text-indigo-600').text()).toBe('RM 8,400')
    expect(wrapper.text()).toContain('120 hours estimated')
  })

  it('should display requirements analysis list', () => {
    const wrapper = mount(ResultsPage)
    wrapper.vm.quote = mockQuote
    
    const requirementItems = wrapper.findAll('.flex.items-start.border-b')
    expect(requirementItems).toHaveLength(2)
    
    expect(requirementItems[0].text()).toContain('User authentication system')
    expect(requirementItems[0].text()).toContain('Authentication')
    expect(requirementItems[0].text()).toContain('Complexity: 1.5')
    
    expect(requirementItems[1].text()).toContain('Payment gateway integration')
    expect(requirementItems[1].text()).toContain('Payment Processing')
    expect(requirementItems[1].text()).toContain('Complexity: 2.5')
  })

  it('should handle goBack functionality', () => {
    const wrapper = mount(ResultsPage)
    const historySpy = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    
    wrapper.find('button').trigger('click')
    
    expect(historySpy).toHaveBeenCalled()
    historySpy.mockRestore()
  })

  it('should handle PDF download', () => {
    const wrapper = mount(ResultsPage)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    const downloadButton = wrapper.findAll('button').at(-1) // Last button is download
    downloadButton?.trigger('click')
    
    expect(alertSpy).toHaveBeenCalledWith('PDF generation would be implemented here')
    alertSpy.mockRestore()
  })

  it('should format dates correctly for Malaysian locale', () => {
    const wrapper = mount(ResultsPage)
    const date = new Date('2026-04-08')
    const formattedDate = wrapper.vm.formatDate(date)
    
    // Should include day, month name, and year in correct order for MY locale
    expect(formattedDate).toContain('April')
    expect(formattedDate).toContain('2026')
    expect(formattedDate).toMatch(/\d{1,2}\s+\w+\s+\d{4}/)
  })
})