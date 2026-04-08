import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Estimation function loaded')

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface Requirement {
  description: string
  category?: string
  complexity_score?: number
}

interface EstimationRequest {
  client_name: string
  requirements: string
}

interface EstimationResult {
  project_id: string
  total_estimated_hours: number
  total_cost_myr: number
  requirements_analysis: Requirement[]
}

async function analyzeRequirements(requirementsText: string): Promise<Requirement[]> {
  // In a real implementation, this would use an LLM to analyze requirements
  // For now, we'll use a simple rule-based approach
  
  const categories = [
    { name: 'Authentication', keywords: ['login', 'auth', 'authentication', 'signup', 'register'] },
    { name: 'Database', keywords: ['database', 'data', 'store', 'save', 'persist'] },
    { name: 'API Integration', keywords: ['api', 'integration', 'third-party', 'external'] },
    { name: 'Real-time Features', keywords: ['real-time', 'live', 'websocket', 'chat'] },
    { name: 'File Handling', keywords: ['file', 'upload', 'download', 'image', 'document'] },
    { name: 'Payment Processing', keywords: ['payment', 'pay', 'checkout', 'stripe', 'paypal'] },
    { name: 'Admin Dashboard', keywords: ['admin', 'dashboard', 'control panel'] },
    { name: 'User Interface', keywords: ['ui', 'interface', 'design', 'ux', 'user experience'] },
    { name: 'Mobile Responsiveness', keywords: ['mobile', 'responsive', 'phone', 'tablet'] },
    { name: 'Reporting', keywords: ['report', 'analytics', 'statistics', 'metrics'] }
  ]
  
  const requirements: Requirement[] = []
  const text = requirementsText.toLowerCase()
  
  // Split into sentences or bullet points
  const sentences = requirementsText.split(/[\n\.]/).filter(s => s.trim().length > 0)
  
  for (const sentence of sentences) {
    if (sentence.trim().length === 0) continue
    
    let matchedCategory = null
    let maxMatches = 0
    
    for (const category of categories) {
      let matches = 0
      for (const keyword of category.keywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          matches++
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches
        matchedCategory = category.name
      }
    }
    
    // Assign complexity based on category and sentence length
    const baseComplexity = matchedCategory ? 
      (await supabase.from('requirement_categories').select('base_complexity_weight').eq('name', matchedCategory).single()).data?.base_complexity_weight || 1.0 : 1.0
    
    const lengthFactor = Math.min(2.0, 0.5 + (sentence.length / 100))
    const complexityScore = baseComplexity * lengthFactor
    
    requirements.push({
      description: sentence.trim(),
      category: matchedCategory || 'General',
      complexity_score: parseFloat(complexityScore.toFixed(2))
    })
  }
  
  return requirements
}

async function calculateEstimate(requirements: Requirement[]): Promise<{ hours: number, cost: number }> {
  // Get active rate card
  const { data: rateCard } = await supabase
    .from('rate_cards')
    .select('id')
    .eq('name', 'Malaysian SME Standard')
    .single()
  
  if (!rateCard) {
    throw new Error('Default rate card not found')
  }
  
  // Calculate total complexity
  const totalComplexity = requirements.reduce((sum, req) => sum + (req.complexity_score || 1.0), 0)
  
  // Convert complexity to hours (this is a simplified formula)
  // In reality, this would be more sophisticated
  const estimatedHours = totalComplexity * 8 // 8 hours per complexity point
  
  // Get average hourly rate
  const { data: rates } = await supabase
    .from('rate_entries')
    .select('hourly_rate_myr')
    .eq('rate_card_id', rateCard.id)
  
  if (!rates || rates.length === 0) {
    throw new Error('No rates found for rate card')
  }
  
  const avgRate = rates.reduce((sum, rate) => sum + rate.hourly_rate_myr, 0) / rates.length
  const estimatedCost = estimatedHours * avgRate
  
  return {
    hours: parseFloat(estimatedHours.toFixed(2)),
    cost: parseFloat(estimatedCost.toFixed(2))
  }
}

serve(async (req: Request) => {
  try {
    const { client_name, requirements } = await req.json() as EstimationRequest
    
    if (!client_name || !requirements) {
      return new Response(JSON.stringify({ error: 'client_name and requirements are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Analyze requirements
    const requirementsAnalysis = await analyzeRequirements(requirements)
    
    // Calculate estimate
    const { hours, cost } = await calculateEstimate(requirementsAnalysis)
    
    // Create project record
    const { data: project } = await supabase
      .from('historical_projects')
      .insert({
        name: `Project for ${client_name}`,
        client_name,
        estimated_hours: hours,
        estimated_cost_myr: cost
      })
      .select('id')
      .single()
    
    if (!project) {
      throw new Error('Failed to create project record')
    }
    
    // Store individual requirements
    await supabase.from('project_requirements').insert(
      requirementsAnalysis.map(req => ({
        project_id: project.id,
        description: req.description,
        category_id: req.category ? 
          (await supabase.from('requirement_categories').select('id').eq('name', req.category).single()).data?.id : null,
        is_functional: true,
        complexity_score: req.complexity_score,
        estimated_hours: (req.complexity_score || 1.0) * 8
      }))
    )
    
    // Create quotation
    const { data: rateCard } = await supabase
      .from('rate_cards')
      .select('id')
      .eq('name', 'Malaysian SME Standard')
      .single()
    
    await supabase.from('quotations').insert({
      project_id: project.id,
      rate_card_id: rateCard?.id,
      total_estimated_hours: hours,
      total_cost_myr: cost,
      status: 'draft'
    })
    
    const result: EstimationResult = {
      project_id: project.id,
      total_estimated_hours: hours,
      total_cost_myr: cost,
      requirements_analysis: requirementsAnalysis
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Estimation error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})