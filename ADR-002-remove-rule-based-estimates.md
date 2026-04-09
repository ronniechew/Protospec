# ADR-002: Remove Rule-Based Estimates in Favor of LLM-Only Estimation

## Status
Accepted

## Context
The current estimation system uses a hybrid approach where it attempts LLM-based analysis first, but falls back to rule-based logic when LLM is unavailable or fails. However, the rule-based estimates have proven to be inaccurate and unreliable, as noted by stakeholders. The business requirement is to always use LLM for estimates since rule-based approaches cannot capture the nuanced complexity of software requirements.

## Decision
Remove all rule-based estimation logic from the `estimate.ts` Supabase Edge Function and make LLM-based estimation the only path. If LLM estimation fails, the system should return an error rather than falling back to inaccurate rule-based estimates.

Key changes required:
1. Remove the `analyzeRequirementsRuleBased()` function entirely
2. Remove the fallback logic in `analyzeRequirementsWithLLM()` 
3. Remove the `rule_based_estimate` field from the response structure
4. Update error handling to return meaningful errors when LLM is unavailable or fails
5. Update the final estimate to use only the LLM-refined values (which will now be the primary estimate)

## Consequences
**Benefits:**
- Eliminates inaccurate rule-based estimates that could mislead clients
- Simplifies the codebase by removing complex fallback logic
- Ensures consistent, high-quality estimates using advanced LLM reasoning
- Aligns with business requirements for accuracy over availability

**Trade-offs:**
- System becomes dependent on LLM availability - if LLM service is down, estimation fails completely
- Requires proper LLM configuration (API keys, model settings) to be operational
- May increase latency slightly due to LLM calls (though this was already happening in the hybrid approach)
- Removes the safety net of having any estimate when LLM fails

**Mitigations:**
- Implement proper monitoring and alerting for LLM service health
- Ensure robust error messages guide users to resolve LLM configuration issues
- Consider implementing retry logic with exponential backoff for transient LLM failures