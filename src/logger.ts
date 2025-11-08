import { LogStatus } from './types';

// Define a basic structured logger for Cloud Run
// Cloud Run automatically ingests JSON logs from stdout/stderr
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({ severity: 'INFO', message, ...context }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ severity: 'WARNING', message, ...context }));
  },
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(JSON.stringify({ severity: 'ERROR', message, errorMessage, errorStack, ...context }));
  },
  // Specific log for execution results
  executionLog: (logData: {
    flowId: string;
    userId: string;
    status: LogStatus;
    durationMs: number;
    payload: Record<string, unknown>;
    result?: unknown;
    error?: string;
    actionStatus?: number;
  }) => {
    console.log(JSON.stringify({ severity: 'INFO', type: 'EXECUTION_LOG', timestamp: new Date().toISOString(), ...logData }));
  },
};
