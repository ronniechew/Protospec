// Test script to verify the LLM-only estimate function loads without syntax errors
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Mock Deno environment - now requires LLM_API_KEY
const mockEnv = {
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_SERVICE_ROLE_KEY: 'test-key',
  LLM_API_KEY: 'test-llm-key', // Required for LLM-only estimation
  LLM_MODEL: 'qwen/qwen3-max-2026-01-23',
  LLM_TIMEOUT_MS: '30000'
}

// Mock Deno.env.get
const originalDenoEnvGet = (Deno as any).env?.get
;(Deno as any).env = {
  get: (key: string) => mockEnv[key as keyof typeof mockEnv] || originalDenoEnvGet?.(key)
}

console.log('Testing LLM-only estimate function import...')

// Import the function (this will catch syntax errors)
try {
  await import('./supabase/functions/estimate.ts')
  console.log('✅ LLM-only Estimate function loaded successfully')
} catch (error) {
  console.error('❌ LLM-only Estimate function failed to load:', error)
  Deno.exit(1)
}

console.log('Test completed successfully')