import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Enhanced Estimation function loaded')

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// LLM Configuration
const LLM_API_KEY = Deno.env.get('LLM_API_KEY')
const LLM_MODEL = Deno.env.get('LLM_MODEL') || 'qwen/qwen3-max-2026-01-23'
const LLM_TIMEOUT_MS = parseInt(Deno.env.get('LLM_TIMEOUT_MS') || '30000')

interface Requirement {
  description: string
  category?: string
  complexity_score?: number
  confidence?: number
  suggested_adjustments?: string[]
}

interface EstimationRequest {
  client_name: string
  client_tier?: 'startup' | 'growing' | 'enterprise'
  requirements: string
  project_context?: string
}

interface EstimationResult {
  project_id: string
  total_estimated_hours: number
  total_cost_myr: number
  rule_based_estimate: {
    hours: number
    cost: number
  }
  llm_refined_estimate: {
    hours: number
    cost: number
    adjustments_reasoning: string
  }
  requirements_analysis: Requirement[]
  historical_comparison?: {
    similar_projects: Array<{
      project_id: string
      name: string
      similarity_score: number
      estimated_vs_actual_variance: number
    }>
    recommendation: string
  }
  project_complexity_multiplier: number
}

// Validation utility
function validateEstimationRequest(request: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!request.client_name || typeof request.client_name !== 'string' || request.client_name.trim().length === 0) {
    errors.push('client_name is required and must be a non-empty string')
  }
  
  if (!request.requirements || typeof request.requirements !== 'string' || request.requirements.trim().length === 0) {
    errors.push('requirements is required and must be a non-empty string')
  }
  
  if (request.client_tier && !['startup', 'growing', 'enterprise'].includes(request.client_tier)) {
    errors.push('client_tier must be one of: startup, growing, enterprise')
  }
  
  if (request.project_context && typeof request.project_context !== 'string') {
    errors.push('project_context must be a string if provided')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// LLM Integration for requirement analysis
async function analyzeRequirementsWithLLM(requirementsText: string, projectContext?: string): Promise<Requirement[]> {
  if (!LLM_API_KEY) {
    console.warn('LLM_API_KEY not configured, falling back to rule-based analysis')
    return await analyzeRequirementsRuleBased(requirementsText)
  }
  
  try {
    // Construct prompt for LLM
    const prompt = `
You are an expert software estimation assistant. Analyze the following software requirements and provide a structured analysis.

Requirements:
${requirementsText}

Project Context (if any):
${projectContext || 'None provided'}

For each requirement or logical group of requirements, provide:
1. Description (clear, concise)
2. Category (from: Authentication, Database, API Integration, Real-time Features, File Handling, Payment Processing, Admin Dashboard, User Interface, Mobile Responsiveness, Reporting, General)
3. Complexity Score (1.0-5.0, where 1.0=simple, 5.0=very complex)
4. Confidence Level (0.0-1.0, how confident you are in this assessment)
5. Suggested Adjustments (list of potential hidden complexities or considerations)

Format your response as a JSON array of objects with these exact properties.
If you cannot determine a category, use "General".
If confidence is low (<0.7), suggest manual review.
`
    
    const response = await fetch('https://api.openclaw.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      }),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS)
    })
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    const llmResponse = data.choices?.[0]?.message?.content
    
    if (!llmResponse) {
      throw new Error('No content in LLM response')
    }
    
    // Extract JSON from response (handle cases where LLM wraps JSON in markdown)
    const jsonMatch = llmResponse.match(/```json\s*([\s\S]*?)\s*```/) || llmResponse.match(/(\[.*\])/s)
    const jsonString = jsonMatch ? jsonMatch[1] : llmResponse
    
    const requirements = JSON.parse(jsonString)
    
    // Validate and sanitize the response
    if (!Array.isArray(requirements)) {
      throw new Error('LLM response is not a valid array')
    }
    
    return requirements.map((req: any) => ({
      description: req.description || 'Unknown requirement',
      category: req.category || 'General',
      complexity_score: Math.max(0.5, Math.min(5.0, parseFloat(req.complexity_score) || 1.0)),
      confidence: Math.max(0.0, Math.min(1.0, parseFloat(req.confidence) || 0.8)),
      suggested_adjustments: Array.isArray(req.suggested_adjustments) ? req.suggested_adjustments : []
    }))
    
  } catch (error) {
    console.error('LLM analysis failed:', error)
    // Fall back to rule-based analysis
    return await analyzeRequirementsRuleBased(requirementsText)
  }
}

// Rule-based requirement analysis (existing logic enhanced)
async function analyzeRequirementsRuleBased(requirementsText: string): Promise<Requirement[]> {
  const categories = [
    { name: 'Authentication', keywords: ['login', 'auth', 'authentication', 'signup', 'register', 'oauth', 'sso'] },
    { name: 'Database', keywords: ['database', 'data', 'store', 'save', 'persist', 'sql', 'nosql', 'schema'] },
    { name: 'API Integration', keywords: ['api', 'integration', 'third-party', 'external', 'webhook', 'rest', 'graphql'] },
    { name: 'Real-time Features', keywords: ['real-time', 'live', 'websocket', 'chat', 'notification', 'push'] },
    { name: 'File Handling', keywords: ['file', 'upload', 'download', 'image', 'document', 'storage', 'cdn'] },
    { name: 'Payment Processing', keywords: ['payment', 'pay', 'checkout', 'stripe', 'paypal', 'billing', 'subscription'] },
    { name: 'Admin Dashboard', keywords: ['admin', 'dashboard', 'control panel', 'cms', 'management'] },
    { name: 'User Interface', keywords: ['ui', 'interface', 'design', 'ux', 'user experience', 'component', 'form'] },
    { name: 'Mobile Responsiveness', keywords: ['mobile', 'responsive', 'phone', 'tablet', 'touch', 'adaptive'] },
    { name: 'Reporting', keywords: ['report', 'analytics', 'statistics', 'metrics', 'dashboard', 'chart', 'graph'] }
  ]
  
  const requirements: Requirement[] = []
  const text = requirementsText.toLowerCase()
  
  // Split into sentences or bullet points
  const sentences = requirementsText
    .split(/[\n\.\r]/)
    .map(s => s.trim())
    .filter(s => s.length > 10) // Only consider substantial sentences
  
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
    
    // Get base complexity from database
    const baseComplexity = matchedCategory ? 
      (await supabase.from('requirement_categories').select('base_complexity_weight').eq('name', matchedCategory).single()).data?.base_complexity_weight || 1.0 : 1.0
    
    // Calculate complexity based on sentence length and keyword matches
    const lengthFactor = Math.min(2.5, 0.8 + (sentence.length / 150))
    const keywordFactor = maxMatches > 0 ? (1 + (maxMatches * 0.3)) : 1.0
    const complexityScore = baseComplexity * lengthFactor * keywordFactor
    
    requirements.push({
      description: sentence.trim(),
      category: matchedCategory || 'General',
      complexity_score: parseFloat(Math.min(5.0, complexityScore).toFixed(2)),
      confidence: maxMatches > 0 ? 0.9 : 0.6,
      suggested_adjustments: maxMatches === 0 ? ['Consider clarifying requirement scope'] : []
    })
  }
  
  return requirements
}

// Calculate project complexity multiplier based on requirements
function calculateProjectComplexityMultiplier(requirements: Requirement[]): number {
  if (requirements.length === 0) return 1.0
  
  // Base multiplier from average complexity
  const avgComplexity = requirements.reduce((sum, req) => sum + (req.complexity_score || 1.0), 0) / requirements.length
  
  // Adjust based on high-complexity requirements
  const highComplexityCount = requirements.filter(req => (req.complexity_score || 0) > 3.0).length
  const highComplexityFactor = 1 + (highComplexityCount * 0.1)
  
  // Adjust based on requirement count (more requirements = more integration complexity)
  const requirementCountFactor = Math.min(2.0, 1 + (requirements.length * 0.05))
  
  const multiplier = avgComplexity * highComplexityFactor * requirementCountFactor
  return parseFloat(Math.min(3.0, Math.max(0.5, multiplier)).toFixed(2))
}

// Enhanced estimation calculation with client tier and seasonal adjustments
async function calculateEnhancedEstimate(
  requirements: Requirement[],
  clientTier: 'startup' | 'growing' | 'enterprise' = 'startup',
  projectComplexityMultiplier: number
): Promise<{ hours: number, cost: number, rateCardId: string }> {
  // Get appropriate rate card for client tier
  const { data: rateCard } = await supabase
    .from('rate_cards')
    .select('id')
    .eq('client_tier', clientTier)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (!rateCard) {
    throw new Error(`Active rate card not found for client tier: ${clientTier}`)
  }
  
  // Calculate total complexity with project multiplier
  const totalComplexity = requirements.reduce((sum, req) => sum + (req.complexity_score || 1.0), 0)
  const adjustedComplexity = totalComplexity * projectComplexityMultiplier
  
  // Convert complexity to hours (enhanced formula)
  const estimatedHours = adjustedComplexity * 6 // 6 hours per complexity point (adjusted from 8)
  
  // Get rates with seasonal adjustment for current quarter
  const currentQuarter = `q${Math.floor(new Date().getMonth() / 3) + 1}` as 'q1' | 'q2' | 'q3' | 'q4'
  
  const { data: rates } = await supabase
    .from('rate_entries')
    .select('hourly_rate_myr, seasonal_adjustment_factor')
    .eq('rate_card_id', rateCard.id)
    .or(`season.eq.${currentQuarter},season.eq.none`)
    .order('season', { ascending: false }) // Prefer seasonal rates over 'none'
  
  if (!rates || rates.length === 0) {
    throw new Error('No rates found for rate card')
  }
  
  // Calculate weighted average rate considering seasonal adjustments
  const totalRate = rates.reduce((sum, rate) => {
    return sum + (rate.hourly_rate_myr * (rate.seasonal_adjustment_factor || 1.0))
  }, 0)
  const avgRate = totalRate / rates.length
  
  const estimatedCost = estimatedHours * avgRate
  
  return {
    hours: parseFloat(estimatedHours.toFixed(2)),
    cost: parseFloat(estimatedCost.toFixed(2)),
    rateCardId: rateCard.id
  }
}

// Historical project comparison
async function findSimilarHistoricalProjects(
  requirements: Requirement[],
  clientTier: 'startup' | 'growing' | 'enterprise'
): Promise<Array<{ project_id: string; name: string; similarity_score: number; estimated_vs_actual_variance: number }>> {
  try {
    // Get historical projects for the same client tier
    const { data: historicalProjects } = await supabase
      .from('historical_projects')
      .select('id, name, client_tier, estimated_hours, actual_hours, estimated_cost_myr, actual_cost_myr')
      .eq('client_tier', clientTier)
      .not('actual_hours', 'is', null)
      .gte('completion_percentage', 90) // Only completed projects
    
    if (!historicalProjects || historicalProjects.length === 0) {
      return []
    }
    
    // Simple similarity calculation based on requirement categories and complexity
    const currentCategories = new Set(requirements.map(req => req.category || 'General'))
    const currentAvgComplexity = requirements.reduce((sum, req) => sum + (req.complexity_score || 1.0), 0) / requirements.length
    
    const similarities = await Promise.all(historicalProjects.map(async (project) => {
      // Get requirements for this historical project
      const { data: projectReqs } = await supabase
        .from('project_requirements')
        .select('category_id, complexity_score')
        .eq('project_id', project.id)
      
      if (!projectReqs || projectReqs.length === 0) {
        return { ...project, similarity_score: 0.1 }
      }
      
      // Get category names for historical requirements
      const categoryIds = projectReqs.map(req => req.category_id).filter(id => id !== null)
      let historicalCategories = new Set<string>()
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from('requirement_categories')
          .select('name')
          .in('id', categoryIds)
        historicalCategories = new Set(categories?.map(cat => cat.name) || [])
      }
      
      // Calculate category overlap
      const commonCategories = [...currentCategories].filter(cat => historicalCategories.has(cat))
      const categorySimilarity = commonCategories.length / Math.max(currentCategories.size, historicalCategories.size)
      
      // Calculate complexity similarity
      const historicalAvgComplexity = projectReqs.reduce((sum, req) => sum + (req.complexity_score || 1.0), 0) / projectReqs.length
      const complexityDifference = Math.abs(currentAvgComplexity - historicalAvgComplexity)
      const complexitySimilarity = Math.max(0, 1 - (complexityDifference / 5.0))
      
      // Combined similarity score
      const similarityScore = (categorySimilarity * 0.6 + complexitySimilarity * 0.4)
      
      // Calculate variance between estimated and actual
      const estimatedVsActualVariance = project.actual_hours && project.estimated_hours
        ? Math.abs(project.actual_hours - project.estimated_hours) / project.estimated_hours
        : 0
      
      return {
        project_id: project.id,
        name: project.name,
        similarity_score: parseFloat(similarityScore.toFixed(3)),
        estimated_vs_actual_variance: parseFloat(estimatedVsActualVariance.toFixed(3))
      }
    }))
    
    // Filter and sort by similarity
    return similarities
      .filter(sim => sim.similarity_score > 0.3)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 3) // Top 3 similar projects
    
  } catch (error) {
    console.error('Historical project comparison failed:', error)
    return []
  }
}

// Apply LLM refinement to rule-based estimate
async function applyLLMRefinement(
  ruleBasedHours: number,
  ruleBasedCost: number,
  requirements: Requirement[],
  similarProjects: Array<{ project_id: string; name: string; similarity_score: number; estimated_vs_actual_variance: number }>
): Promise<{ hours: number; cost: number; adjustmentsReasoning: string }> {
  if (!LLM_API_KEY) {
    return { hours: ruleBasedHours, cost: ruleBasedCost, adjustmentsReasoning: 'LLM refinement not available' }
  }
  
  try {
    const avgVariance = similarProjects.length > 0
      ? similarProjects.reduce((sum, proj) => sum + proj.estimated_vs_actual_variance, 0) / similarProjects.length
      : 0
    
    const highConfidenceRequirements = requirements.filter(req => (req.confidence || 0) >= 0.8)
    const lowConfidenceRequirements = requirements.filter(req => (req.confidence || 0) < 0.8)
    
    const prompt = `
Based on the following estimation analysis, provide refined estimates:

Rule-based estimate: ${ruleBasedHours} hours, ${ruleBasedCost} MYR
Average variance in similar historical projects: ${(avgVariance * 100).toFixed(1)}%
High-confidence requirements: ${highConfidenceRequirements.length}
Low-confidence requirements: ${lowConfidenceRequirements.length}

Low-confidence requirements that may need adjustment:
${lowConfidenceRequirements.map(req => `- ${req.description} (confidence: ${(req.confidence || 0).toFixed(2)})`).join('\n')}

Provide:
1. Refined hours estimate (consider historical variance and requirement confidence)
2. Refined cost estimate  
3. Brief reasoning for adjustments

Respond in JSON format: {"hours": number, "cost": number, "adjustments_reasoning": "string"}
`
    
    const response = await fetch('https://api.openclaw.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500
      }),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS)
    })
    
    if (!response.ok) {
      throw new Error(`LLM refinement error: ${response.status}`)
    }
    
    const data = await response.json()
    const llmResponse = data.choices?.[0]?.message?.content
    
    if (!llmResponse) {
      throw new Error('No content in LLM refinement response')
    }
    
    // Extract JSON
    const jsonMatch = llmResponse.match(/({.*})/s)
    const jsonString = jsonMatch ? jsonMatch[1] : llmResponse
    
    const refinement = JSON.parse(jsonString)
    
    return {
      hours: Math.max(0.1, parseFloat(refinement.hours) || ruleBasedHours),
      cost: Math.max(0.1, parseFloat(refinement.cost) || ruleBasedCost),
      adjustmentsReasoning: refinement.adjustments_reasoning || 'No specific reasoning provided'
    }
    
  } catch (error) {
    console.error('LLM refinement failed:', error)
    return {
      hours: ruleBasedHours,
      cost: ruleBasedCost,
      adjustmentsReasoning: 'LLM refinement failed, using rule-based estimate'
    }
  }
}

serve(async (req: Request) => {
  try {
    // Enhanced error handling for request parsing
    let requestData: any
    try {
      requestData = await req.json()
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Validate request
    const validation = validateEstimationRequest(requestData)
    if (!validation.isValid) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const { client_name, client_tier = 'startup', requirements, project_context } = requestData as EstimationRequest
    
    // Step 1: Analyze requirements with LLM (falls back to rule-based if LLM unavailable)
    const requirementsAnalysis = await analyzeRequirementsWithLLM(requirements, project_context)
    
    if (requirementsAnalysis.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No requirements could be analyzed from the input'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Step 2: Calculate project complexity multiplier
    const projectComplexityMultiplier = calculateProjectComplexityMultiplier(requirementsAnalysis)
    
    // Step 3: Calculate rule-based estimate
    const ruleBasedEstimate = await calculateEnhancedEstimate(requirementsAnalysis, client_tier, projectComplexityMultiplier)
    
    // Step 4: Find similar historical projects
    const similarProjects = await findSimilarHistoricalProjects(requirementsAnalysis, client_tier)
    
    // Step 5: Apply LLM refinement
    const llmRefinedEstimate = await applyLLMRefinement(
      ruleBasedEstimate.hours,
      ruleBasedEstimate.cost,
      requirementsAnalysis,
      similarProjects
    )
    
    // Use the refined estimate as final estimate
    const finalHours = llmRefinedEstimate.hours
    const finalCost = llmRefinedEstimate.cost
    
    // Step 6: Create project record with complexity multiplier
    const { data: project } = await supabase
      .from('historical_projects')
      .insert({
        name: `Project for ${client_name}`,
        client_name,
        client_tier,
        estimated_hours: finalHours,
        estimated_cost_myr: finalCost,
        project_complexity_multiplier
      })
      .select('id')
      .single()
    
    if (!project) {
      throw new Error('Failed to create project record')
    }
    
    // Step 7: Store individual requirements
    const projectRequirements = await Promise.all(
      requirementsAnalysis.map(async (req) => ({
        project_id: project.id,
        description: req.description,
        category_id: req.category ? 
          (await supabase.from('requirement_categories').select('id').eq('name', req.category).single()).data?.id : null,
        is_functional: true,
        complexity_score: req.complexity_score,
        estimated_hours: ((req.complexity_score || 1.0) * projectComplexityMultiplier * 6)
      }))
    )
    
    await supabase.from('project_requirements').insert(projectRequirements)
    
    // Step 8: Create quotation
    await supabase.from('quotations').insert({
      project_id: project.id,
      rate_card_id: ruleBasedEstimate.rateCardId,
      total_estimated_hours: finalHours,
      total_cost_myr: finalCost,
      status: 'draft'
    })
    
    // Step 9: Prepare historical comparison recommendation
    let historicalComparison: EstimationResult['historical_comparison'] | undefined
    if (similarProjects.length > 0) {
      const avgVariance = similarProjects.reduce((sum, proj) => sum + proj.estimated_vs_actual_variance, 0) / similarProjects.length
      const recommendation = avgVariance > 0.2 
        ? `Historical data shows high variance (${(avgVariance * 100).toFixed(1)}%) in similar projects. Consider adding contingency buffer.`
        : `Historical data shows good accuracy in similar projects. Estimate should be reliable.`
      
      historicalComparison = {
        similar_projects: similarProjects,
        recommendation
      }
    }
    
    const result: EstimationResult = {
      project_id: project.id,
      total_estimated_hours: finalHours,
      total_cost_myr: finalCost,
      rule_based_estimate: {
        hours: ruleBasedEstimate.hours,
        cost: ruleBasedEstimate.cost
      },
      llm_refined_estimate: {
        hours: llmRefinedEstimate.hours,
        cost: llmRefinedEstimate.cost,
        adjustments_reasoning: llmRefinedEstimate.adjustmentsReasoning
      },
      requirements_analysis: requirementsAnalysis,
      historical_comparison: historicalComparison,
      project_complexity_multiplier
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Estimation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal error'
    return new Response(JSON.stringify({ 
      error: 'Internal server error during estimation',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})