const parseDetailedCostBreakdown = (text: string): Record<string, any> | null => {
  // Look for detailed cost breakdown JSON in various formats
  
  // Format 1: JSON code block with cost breakdown
  const codeBlockMatches = text.matchAll(/```json\s*({[^`]*?})\s*```/g)
  for (const match of codeBlockMatches) {
    if (match[1]) {
      try {
        const parsed = JSON.parse(match[1])
        // Check if it contains the expected cost breakdown structure (nested under costBreakdown)
        if (parsed.costBreakdown && 
            parsed.costBreakdown.technicalLeadArchitect && 
            parsed.costBreakdown.seniorDeveloper && 
            parsed.costBreakdown.uiuxDesigner && 
            parsed.costBreakdown.qaTesting) {
          return parsed
        }
        // Also check if roles are at top level (fallback)
        if (parsed.technicalLeadArchitect && 
            parsed.seniorDeveloper && 
            parsed.uiuxDesigner && 
            parsed.qaTesting) {
          return parsed
        }
      } catch (e) {
        // Continue to next match
      }
    }
  }
  
  // Format 2: JSON without code block markers
  const jsonMatches = text.matchAll(/(\{[^}]*"costBreakdown"[^}]*\})/g)
  for (const match of jsonMatches) {
    if (match[1]) {
      try {
        const parsed = JSON.parse(match[1])
        if (parsed.costBreakdown && 
            parsed.costBreakdown.technicalLeadArchitect && 
            parsed.costBreakdown.seniorDeveloper && 
            parsed.costBreakdown.uiuxDesigner && 
            parsed.costBreakdown.qaTesting) {
          return parsed
        }
      } catch (e) {
        // Continue to next match
      }
    }
  }
  
  return null
}