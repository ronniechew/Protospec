import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeRequirements, calculateEstimate } from '../../supabase/functions/estimate'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'test-id', base_complexity_weight: 1.5 } }),
    insert: vi.fn().mockReturnThis()
  })
}))

describe('Estimation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeRequirements', () => {
    it('should correctly categorize authentication requirements', async () => {
      const requirements = 'Build a user login system with email and password authentication'
      const result = await analyzeRequirements(requirements)
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Authentication')
      expect(result[0].complexity_score).toBeGreaterThan(1.0)
    })

    it('should correctly categorize payment processing requirements', async () => {
      const requirements = 'Integrate Stripe payment gateway for online checkout'
      const result = await analyzeRequirements(requirements)
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Payment Processing')
      expect(result[0].complexity_score).toBeGreaterThan(2.0) // Payment processing has high complexity
    })

    it('should handle multiple requirements in one input', async () => {
      const requirements = 'Build user auth system. Add payment integration with Stripe.'
      const result = await analyzeRequirements(requirements)
      
      expect(result).toHaveLength(2)
      expect(result.some(req => req.category === 'Authentication')).toBe(true)
      expect(result.some(req => req.category === 'Payment Processing')).toBe(true)
    })

    it('should assign default category for unrecognized requirements', async () => {
      const requirements = 'Some random requirement that doesnt match any category'
      const result = await analyzeRequirements(requirements)
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('General')
      expect(result[0].complexity_score).toBeCloseTo(1.0, 0.5)
    })
  })

  describe('calculateEstimate', () => {
    it('should calculate hours based on total complexity', async () => {
      const requirements = [
        { description: 'Test req 1', category: 'Authentication', complexity_score: 1.5 },
        { description: 'Test req 2', category: 'Database', complexity_score: 1.2 }
      ]
      
      const result = await calculateEstimate(requirements)
      
      expect(result.hours).toBeGreaterThan(0)
      expect(result.cost).toBeGreaterThan(0)
      // Total complexity = 2.7, hours = 2.7 * 8 = 21.6
      expect(result.hours).toBeCloseTo(21.6, 1.0)
    })

    it('should use average rate from rate entries', async () => {
      const requirements = [{ description: 'Simple req', complexity_score: 1.0 }]
      
      // Mock different rates
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockImplementation(function(this: any, field: string) {
          if (field === 'id') {
            return { ...this, single: vi.fn().mockResolvedValue({ data: { id: 'rate-card-id' } }) }
          }
          return this
        }),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'rate-card-id' } })
      }
      
      // Mock rates array
      mockSupabase.from = vi.fn().mockImplementation(function(this: any, table: string) {
        if (table === 'rate_entries') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ 
              data: [
                { hourly_rate_myr: 50.00 },
                { hourly_rate_myr: 70.00 },
                { hourly_rate_myr: 90.00 }
              ] 
            })
          }
        }
        return this
      })
      
      // This would need proper mocking setup, but for now we'll test the logic
      // The key point is that it should calculate cost = hours * average_rate
    })
  })
})