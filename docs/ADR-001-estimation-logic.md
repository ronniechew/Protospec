# ADR-001: Estimation Logic Approach

## Status
Accepted

## Context
We need to convert software requirements into accurate cost estimates for the Malaysian SME market. Two approaches are possible:
1. **Rule-based engine**: Uses predefined complexity matrices with fixed weights
2. **LLM-assisted heuristic**: Leverages LLMs to interpret requirements and apply contextual understanding

The rule-based approach offers consistency and explainability but may struggle with novel requirements. The LLM approach provides flexibility and contextual understanding but may lack consistency and transparency in pricing.

Malaysian SME clients typically value transparency in pricing and may question estimates they don't understand. However, they also expect modern solutions that can handle diverse and evolving requirements.

## Decision
We will implement a **hybrid approach** with the following characteristics:

1. **Primary estimation through rule-based engine** with clearly defined complexity matrices
   - Provides transparent, explainable estimates
   - Allows easy adjustment of weights as market conditions change
   - Forms the baseline estimate that can be justified to clients

2. **LLM-assisted refinement layer** that:
   - Analyzes requirements for completeness and potential hidden complexities
   - Suggests adjustments to the rule-based estimate based on pattern recognition from historical projects
   - Flags unusual requirements that may need manual review

3. **Human-in-the-loop capability** where:
   - Estimates above a certain threshold require human review
   - Discrepancies between rule-based and LLM estimates trigger alerts
   - All final quotes include an explanation of the estimation factors

This approach prioritizes reversibility by keeping the core logic in adjustable rules while enhancing accuracy through LLM insights.

## Consequences
**Positive:**
- Transparent pricing that can be explained to clients
- Adaptable to changing market rates in Malaysia
- Improved accuracy through LLM pattern recognition
- Reduced risk through human oversight on complex projects

**Negative:**
- Increased implementation complexity
- Requires maintaining both rule definitions and LLM prompts
- Potential performance impact from LLM calls during estimation