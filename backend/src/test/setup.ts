import { expect, beforeAll, afterAll } from 'vitest';

// Setup global test environment
beforeAll(() => {
  // Initialize test database or other resources
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup test resources
  console.log('Cleaning up test environment...');
});

// Custom matchers
expect.extend({});
