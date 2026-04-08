// Test setup file
import { config } from '@vue/test-utils'

// Configure Vue Test Utils
config.global.mocks = {
  $t: (msg: string) => msg, // Mock i18n
  $route: {}, // Mock route
  $router: {} // Mock router
}

// Mock console.error to avoid noise in tests
console.error = () => {}