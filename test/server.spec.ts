import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { getFlowDocument, logExecution } from '../src/db';
import { dispatchActionAsynchronously } from '../src/action';
import { resolveUserSecrets } from '../src/secrets';
import { executeUserScript } from '../src/runtime';
import { FlowDocument, FlowPayload, FlowSecrets, ExecutionResult, LogStatus } from '../src/types';

// Mock dependencies
vi.mock('../src/db', () => ({
  getFlowDocument: vi.fn(),
  logExecution: vi.fn(),
}));
vi.mock('../src/action', () => ({
  dispatchActionAsynchronously: vi.fn(),
}));
vi.mock('../src/secrets', () => ({
  resolveUserSecrets: vi.fn(),
}));
vi.mock('../src/runtime', () => ({
  executeUserScript: vi.fn(),
}));

// Import the server after mocks are set up
import server from '../src/server';

describe('server', () => {
  const app = new Hono();
  app.post('/api/webhook/:flowId', server.fetch); // Use the exported fetch handler

  const mockFlow: FlowDocument = {
    flowId: 'testFlow123',
    userId: 'user123',
    isActive: true,
    userCode: 'return "hello";',
    secretReferences: { API_KEY: 'projects/1/secrets/my-api-key/versions/latest' },
    actionUrl: 'https://example.com/action',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    (getFlowDocument as vi.Mock).mockResolvedValue(mockFlow);
    (resolveUserSecrets as vi.Mock).mockResolvedValue({ API_KEY: 'resolved_api_key', FLOW_ID: 'testFlow123' });
    (executeUserScript as vi.Mock).mockResolvedValue({ success: true, result: 'script_result' });
    (dispatchActionAsynchronously as vi.Mock).mockResolvedValue({ success: true });
  });

  it('should return 404 if flow is not found or inactive', async () => {
    (getFlowDocument as vi.Mock).mockResolvedValue(null);

    const req = new Request('http://localhost/api/webhook/nonExistentFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await app.request(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe('rejected');
    expect(logExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        flowId: 'nonExistentFlow',
        status: LogStatus.FAIL,
        error: expect.stringContaining('not found'),
      })
    );
  });

  it('should execute user script and dispatch action on success', async () => {
    const testPayload: FlowPayload = { data: 'some_data' };
    const req = new Request('http://localhost/api/webhook/testFlow123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    const res = await app.request(req);

    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.status).toBe('completed_and_dispatched');
    expect(body.result).toBe('script_result');

    expect(getFlowDocument).toHaveBeenCalledWith('testFlow123');
    expect(resolveUserSecrets).toHaveBeenCalledWith(mockFlow.secretReferences);
    expect(executeUserScript).toHaveBeenCalledWith(
      mockFlow.userCode,
      testPayload,
      expect.objectContaining({ API_KEY: 'resolved_api_key', FLOW_ID: 'testFlow123' })
    );
    expect(dispatchActionAsynchronously).toHaveBeenCalledWith(mockFlow, 'script_result');
    expect(logExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        flowId: 'testFlow123',
        status: LogStatus.SUCCESS,
        result: 'script_result',
        actionStatus: 202,
      })
    );
  });

  it('should return 500 if user script fails', async () => {
    (executeUserScript as vi.Mock).mockResolvedValue({ success: false, error: 'Script failed' });

    const req = new Request('http://localhost/api/webhook/testFlow123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await app.request(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.status).toBe('failed');
    expect(body.message).toContain('Script failed');
    expect(logExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        flowId: 'testFlow123',
        status: LogStatus.FAIL,
        error: 'Script failed',
      })
    );
  });

  it('should return 500 if action dispatch fails', async () => {
    (dispatchActionAsynchronously as vi.Mock).mockResolvedValue({ success: false, error: 'Dispatch error' });

    const req = new Request('http://localhost/api/webhook/testFlow123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await app.request(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.status).toBe('dispatch_failed');
    expect(body.message).toContain('Dispatch error');
    expect(logExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        flowId: 'testFlow123',
        status: LogStatus.ACTION_FAIL,
        error: expect.stringContaining('Dispatch error'),
        actionStatus: 500,
      })
    );
  });

  it('/health endpoint should return OK', async () => {
    const req = new Request('http://localhost/health');
    const res = await app.request(req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('OK');
  });
});
