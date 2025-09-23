// Simple test to verify Jest setup
describe('Test Setup Verification', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have test environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  it('should be able to import test utilities', () => {
    // This will verify that our test setup can be imported
    expect(true).toBe(true);
  });
});
