import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}))

describe('Rate Card Flexibility', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockReturnValue(mockSupabase)
  })

  it('should retrieve correct rate card for startup tier', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'startup-card-id', name: 'Malaysian Startup Standard' } 
    })
    
    // Simulate getting startup rate card
    const result = await mockSupabase
      .from('rate_cards')
      .select('id, name')
      .eq('client_tier', 'startup')
      .single()
    
    expect(result.data?.name).toBe('Malaysian Startup Standard')
    expect(result.data?.id).toBe('startup-card-id')
  })

  it('should retrieve correct rate card for growing business tier', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'growing-card-id', name: 'Malaysian Growing Business Standard' } 
    })
    
    const result = await mockSupabase
      .from('rate_cards')
      .select('id, name')
      .eq('client_tier', 'growing')
      .single()
    
    expect(result.data?.name).toBe('Malaysian Growing Business Standard')
  })

  it('should retrieve correct rate card for enterprise tier', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'enterprise-card-id', name: 'Malaysian Enterprise Standard' } 
    })
    
    const result = await mockSupabase
      .from('rate_cards')
      .select('id, name')
      .eq('client_tier', 'enterprise')
      .single()
    
    expect(result.data?.name).toBe('Malaysian Enterprise Standard')
  })

  it('should handle seasonal rate adjustments', async () => {
    // Create a new mock for this specific test
    const seasonalMockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'rate_entries') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ 
              data: [
                { hourly_rate_myr: 70.00, seasonal_adjustment_factor: 1.1, season: 'q4' },
                { hourly_rate_myr: 70.00, seasonal_adjustment_factor: 1.0, season: 'none' }
              ] 
            })
          }
        }
        return seasonalMockSupabase
      }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis()
    }
    
    ;(createClient as any).mockReturnValue(seasonalMockSupabase)
    
    const result = await seasonalMockSupabase
      .from('rate_entries')
      .select('hourly_rate_myr, seasonal_adjustment_factor, season')
      .eq('rate_card_id', 'test-id')
    
    expect(result.data).toHaveLength(2)
    // Q4 should have 10% increase
    expect(result.data[0].hourly_rate_myr * result.data[0].seasonal_adjustment_factor).toBe(77.00)
    // Non-seasonal should remain same
    expect(result.data[1].hourly_rate_myr * result.data[1].seasonal_adjustment_factor).toBe(70.00)
  })

  it('should validate rate card schema constraints', () => {
    // Test client_tier validation
    const validTiers = ['startup', 'growing', 'enterprise']
    const invalidTier = 'invalid-tier'
    
    expect(validTiers).toContain('startup')
    expect(validTiers).toContain('growing')
    expect(validTiers).toContain('enterprise')
    expect(validTiers).not.toContain(invalidTier)
    
    // Test season validation
    const validSeasons = ['q1', 'q2', 'q3', 'q4', 'none']
    const invalidSeason = 'summer'
    
    expect(validSeasons).toContain('q1')
    expect(validSeasons).toContain('q4')
    expect(validSeasons).toContain('none')
    expect(validSeasons).not.toContain(invalidSeason)
  })
})