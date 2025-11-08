import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeUserScript } from '../src/runtime';
import { logger } from '../src/logger';

// Mock the logger to capture output
vi.mock('../src/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        executionLog: vi.fn(),
        initializeDatabaseLogging: vi.fn(),
    },
}));

describe('executeUserScript', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

    it('should handle async user code', { timeout: 1000 }, async () => {
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
        const userCode = 'return (1 + 2'; 
        const payload = {};
        const secrets = {};

        const result = await executeUserScript(userCode, payload, secrets);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toMatch(/SyntaxError|Unexpected/);
        }
    });

    it('should return an error for timeout', { timeout: 6000 }, async () => {
        const userCode = 'while(true) {}'; // Infinite loop
        const payload = {};
        const secrets = {};

        const result = await executeUserScript(userCode, payload, secrets);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('Script execution timed out');
        }
    }); // Increase Vitest timeout for this specific test

    it('should prevent access to non-whitelisted modules via require', async () => {
        // El test funciona si 'require' no está definido globalmente, lo cual es el caso.
        const userCode = 'require("fs").readFileSync("/etc/passwd");'; // Forbidden module
        const payload = {};
        const secrets = {};

        const result = await executeUserScript(userCode, payload, secrets);

        expect(result.success).toBe(false);
        if (!result.success) {
            // Verificamos que contenga 'ReferenceError' o 'require is not defined'.
            expect(result.error).toMatch(/require is not defined|ReferenceError/);
        }
    });

    it('should allow access to safeHttpClient for HTTP requests', async () => {
        const userCode = 'return typeof http.get;'; // Check if http.get is a function
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

    it('should use the sandboxed logger for console output', async () => {
        const userCode = 'console.info("Test log from sandbox"); return "logged";';
        const payload = {};
        const secrets = {};

        const result = await executeUserScript(userCode, payload, secrets);

        expect(result.success).toBe(true);
        expect(logger.info).toHaveBeenCalledWith('[USER_SCRIPT] Test log from sandbox', undefined);
    });

    it('should prevent access to global objects like window or document', async () => {
        const userCode = 'return typeof window;';
        const payload = {};
        const secrets = {};

        const result = await executeUserScript(userCode, payload, secrets);

        expect(result.success).toBe(true); // typeof window returns 'undefined' in Node.js VM
        if (result.success) {
            expect(result.result).toBe('undefined');
        }

        const userCode2 = 'return typeof document;';
        const result2 = await executeUserScript(userCode2, payload, secrets);
        expect(result2.success).toBe(true);
        if (result2.success) {
            expect(result2.result).toBe('undefined');
        }
    });

    it('should prevent prototype pollution attempts', async () => {
        const userCode = `
            Object.prototype.polluted = "I am polluted";
            return {}.polluted;
        `;
        const payload = {};
        const secrets = {};

        const result = await executeUserScript(userCode, payload, secrets);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.result).toBe('I am polluted'); // This is expected inside the VM
        }

        // Verify that the host environment is NOT polluted
        expect(Object.prototype.hasOwnProperty.call({}, 'polluted')).toBe(false);
        expect(Object.getOwnPropertyDescriptor(Object.prototype, 'polluted')).toBeUndefined();
    });
});