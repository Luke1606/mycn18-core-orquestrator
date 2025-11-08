import { describe, it, expect } from 'vitest';
import { executeUserScript } from '../src/runtime';

describe('executeUserScript', () => {
  it('should execute user code successfully and return a result', async () => {
    const userCode = 'return payload.value + env.SECRET_KEY;';
    const payload = { value: 10 };
    const secrets = { SECRET_KEY: 'abc' };

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe('10abc');
    }
  });

  it('should handle async user code', async () => {
    const userCode = 'await new Promise(resolve => setTimeout(resolve, 100)); return "async_done";';
    const payload = {};
    const secrets = {};

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe('async_done');
    }
  });

  it('should return an error for invalid user code (syntax error)', async () => {
    const userCode = 'return ;'; // Syntax error
    const payload = {};
    const secrets = {};

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('SyntaxError');
    }
  });

  it('should return an error for timeout', async () => {
    const userCode = 'while(true) {}'; // Infinite loop
    const payload = {};
    const secrets = {};

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Script execution timed out');
    }
  });

  it('should prevent access to non-whitelisted modules', async () => {
    const userCode = 'require("fs").readFileSync("/etc/passwd");'; // Forbidden module
    const payload = {};
    const secrets = {};

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Access denied to require');
    }
  });

  it('should allow access to whitelisted modules injected into sandbox', async () => {
    const userCode = 'return typeof axios.get;'; // Check if axios.get is a function
    const payload = {};
    const secrets = {};

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe('function');
    }
  });

  it('should not allow access to process object', async () => {
    const userCode = 'return process.env;';
    const payload = {};
    const secrets = {};

    const result = await executeUserScript(userCode, payload, secrets);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('process is not defined');
    }
  });
});
