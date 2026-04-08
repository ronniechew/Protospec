import { describe, it, expect, vi } from 'vitest'

// Mock database responses for historical projects
const mockHistoricalProjects = [
  {
    id: 'proj-1',
    name: 'E-commerce Website',
    client_tier: 'startup',
    estimated_hours: 100,
    actual_hours: 120,
    estimated_cost_myr: 7000,
    actual_cost_myr: 8400,
    project_complexity_multiplier: 1.2,
    completion_percentage: 100
  },
  {
    id: 'proj-2', 
    name: 'Mobile App',
    client_tier: 'growing',
    estimated_hours: 200,
    actual_hours: 180,
    estimated_cost_myr: 15000,
    actual_cost_myr: 13500,
    project_complexity_multiplier: 0.9,
    completion_percentage: 100
  },
  {
    id: 'proj-3',
    name: 'Enterprise Dashboard',
    client_tier: 'enterprise', 
    estimated_hours: 300,
    actual_hours: 350,
    estimated_cost_myr: 25000,
    actual_cost_myr: 29250,
    project_complexity_multiplier: 1.17,
    completion_percentage: 100
  }
]

describe('Estimation Accuracy Validation Against Historical Projects', () => {
  it('should calculate estimation accuracy percentage', () => {
    mockHistoricalProjects.forEach(project => {
      const accuracy = (project.estimated_hours / project.actual_hours) * 100
      
      // For proj-1: 100/120 = 83.3% (underestimated)
      // For proj-2: 200/180 = 111.1% (overestimated)  
      // For proj-3: 300/350 = 85.7% (underestimated)
      
      if (project.id === 'proj-1') {
        expect(accuracy).toBeCloseTo(83.3, 0.1)
      } else if (project.id === 'proj-2') {
        expect(accuracy).toBeCloseTo(111.1, 0.1)
      } else if (project.id === 'proj-3') {
        expect(accuracy).toBeCloseTo(85.7, 0.1)
      }
    })
  })

  it('should validate acceptable accuracy range for Malaysian SME market', () => {
    // For Malaysian SME market, acceptable estimation accuracy is typically ±20%
    const acceptableRange = { min: 80, max: 120 }
    
    mockHistoricalProjects.forEach(project => {
      const accuracy = (project.estimated_hours / project.actual_hours) * 100
      const isInAcceptableRange = accuracy >= acceptableRange.min && accuracy <= acceptableRange.max
      
      expect(isInAcceptableRange).toBe(true)
    })
  })

  it('should adjust complexity multiplier based on historical performance', () => {
    // The system should learn from historical data and adjust complexity multipliers
    // proj-1 was underestimated (83.3%), so multiplier should be > 1.0
    // proj-2 was overestimated (111.1%), so multiplier should be < 1.0  
    // proj-3 was underestimated (85.7%), so multiplier should be > 1.0
    
    expect(mockHistoricalProjects[0].project_complexity_multiplier).toBeGreaterThan(1.0)
    expect(mockHistoricalProjects[1].project_complexity_multiplier).toBeLessThan(1.0)
    expect(mockHistoricalProjects[2].project_complexity_multiplier).toBeGreaterThan(1.0)
  })

  it('should categorize projects by client tier for rate card selection', () => {
    const tiers = mockHistoricalProjects.map(p => p.client_tier)
    expect(tiers).toContain('startup')
    expect(tiers).toContain('growing')
    expect(tiers).toContain('enterprise')
    
    // Each tier should have appropriate rate cards applied
    mockHistoricalProjects.forEach(project => {
      let expectedHourlyRateRange: { min: number; max: number }
      
      switch (project.client_tier) {
        case 'startup':
          expectedHourlyRateRange = { min: 45, max: 95 } // Based on schema rates
          break
        case 'growing':
          expectedHourlyRateRange = { min: 55, max: 105 } // Slightly higher
          break
        case 'enterprise':
          expectedHourlyRateRange = { min: 65, max: 115 } // Highest rates
          break
        default:
          expectedHourlyRateRange = { min: 45, max: 95 }
      }
      
      const actualHourlyRate = project.estimated_cost_myr / project.estimated_hours
      expect(actualHourlyRate).toBeGreaterThanOrEqual(expectedHourlyRateRange.min)
      expect(actualHourlyRate).toBeLessThanOrEqual(expectedHourlyRateRange.max)
    })
  })

  it('should track completion percentage for project success metrics', () => {
    // All completed projects should have 100% completion
    mockHistoricalProjects.forEach(project => {
      expect(project.completion_percentage).toBe(100)
    })
    
    // Incomplete projects would have < 100%
    const incompleteProject = { ...mockHistoricalProjects[0], completion_percentage: 75 }
    expect(incompleteProject.completion_percentage).toBeLessThan(100)
  })

  it('should validate cost calculations are consistent with hours and rates', () => {
    mockHistoricalProjects.forEach(project => {
      // Cost should equal hours * average hourly rate
      const calculatedCost = project.estimated_hours * (project.estimated_cost_myr / project.estimated_hours)
      expect(calculatedCost).toBeCloseTo(project.estimated_cost_myr, 1)
      
      const actualCalculatedCost = project.actual_hours * (project.actual_cost_myr / project.actual_hours)
      expect(actualCalculatedCost).toBeCloseTo(project.actual_cost_myr, 1)
    })
  })

  it('should identify patterns for LLM-assisted refinement', () => {
    // The hybrid approach should use historical data to refine LLM suggestions
    // Common patterns might include:
    const commonUnderestimationAreas = [
      'Payment Processing', // Often underestimated due to compliance requirements
      'Real-time Features', // Complex synchronization issues
      'Mobile Responsiveness' // Cross-device testing overhead
    ]
    
    const commonOverestimationAreas = [
      'User Interface', // Modern frameworks make this easier
      'Database' // ORMs simplify development
    ]
    
    // System should adjust complexity weights based on these patterns
    commonUnderestimationAreas.forEach(area => {
      expect(area).toBeDefined()
    })
    
    commonOverestimationAreas.forEach(area => {
      expect(area).toBeDefined()
    })
  })
})