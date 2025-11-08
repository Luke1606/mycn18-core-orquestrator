import { Hono } from 'hono';
import { FlowPayload, FlowSecrets, ExecutionResult, ExecutionLog, LogStatus } from './types.js'; 
import { dispatchActionAsynchronously } from './action.js'; 
import { resolveUserSecrets } from './secrets.js';
import { executeUserScript } from './runtime.js'; 
import { getFlowDocument, logExecution } from './db.js'; 
import { logger } from './logger.js';

// --- Configuración del Servidor ---
const app = new Hono();
const PORT = process.env.PORT || 8080; 

// Function to initialize logger with database logging
export function initializeLogger() {
    logger.initializeDatabaseLogging(logExecution);
}

// Middleware para logs estructurados
app.use('*', async (c, next) => {
    logger.info(`Request received`, { method: c.req.method, url: c.req.url });
    await next();
    logger.info(`Request completed`, { method: c.req.method, url: c.req.url, status: c.res.status });
});

// --- Endpoint Principal del Webhook ---
app.post('/api/webhook/:flowId', async (c) => {
    const startTime = performance.now(); 
    const flowId = c.req.param('flowId');
    let userId: string = 'unknown'; // Initialize userId to 'unknown'

    let payload: FlowPayload;
    try {
        payload = (await c.req.json()) as FlowPayload;
    } catch (e: unknown) {
        logger.error('Failed to parse request body as JSON', e, { flowId });
        payload = {};
        // Log the failure and return 400 Bad Request for invalid JSON
        logger.executionLog({
            flowId,
            userId, // Use the initialized userId
            status: LogStatus.FAIL,
            durationMs: performance.now() - startTime,
            timestamp: new Date(),
            payload: {}, // No valid payload
            error: `Failed to parse request body as JSON: ${e instanceof Error ? e.message : String(e)}`
        });
        return c.json({ status: 'rejected', flowId: flowId, message: `Failed to parse request body: ${e instanceof Error ? e.message : String(e)}` }, 400);
    }

    // --- Lógica de Orquestación: Cargar y Validar ---
    
    const flow = await getFlowDocument(flowId);
    userId = flow ? flow.userId : 'unknown'; // Update userId if flow is found

    if (!flow || !flow.isActive) {
        const message = `Flow ${flowId} not found, inactive, or DB connection failed.`;

        // Log: Flujo no encontrado o inactivo
        logger.executionLog({
            flowId,
            userId,
            status: LogStatus.FAIL,
            durationMs: performance.now() - startTime,
            timestamp: new Date(),
            payload,
            error: message
        });

        return c.json({ status: 'rejected', flowId: flowId, message }, 404);
    }

    const { userCode, secretReferences } = flow; // Usar secretReferences
    
    // 1. Resolución de Secrets
    let resolvedSecrets: FlowSecrets;
    try {
        resolvedSecrets = await resolveUserSecrets(secretReferences); // Pasar secretReferences
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Log: Fallo en resolución de secrets
        logger.executionLog({
            flowId,
            userId,
            status: LogStatus.FAIL,
            durationMs: performance.now() - startTime,
            timestamp: new Date(),
            payload,
            error: `Secret resolution failed: ${errorMessage}`
        });
        return c.json({ status: 'failed', flowId: flowId, message: `Secret resolution failed: ${errorMessage}` }, 500);
    }
    
    // 2. Inyección de Secrets
    const executionSecrets: FlowSecrets = { 
        ...resolvedSecrets, 
        FLOW_ID: flowId, 
    };

    // --- Ejecución en la Caja de Arena ---
    
    const executionResult: ExecutionResult = await executeUserScript(
        userCode,
        payload,
        executionSecrets
    );

    // --- Manejo de Éxito o Fracaso ---
    const durationMs = performance.now() - startTime;
    let finalStatus: ExecutionLog['status'] = executionResult.success ? LogStatus.SUCCESS : LogStatus.FAIL;

    
    if (executionResult.success) {
        // 3. Delegar la Acción de Salida a la Cola de Tareas (Desacoplamiento)
        const dispatchStatus = await dispatchActionAsynchronously(flow, executionResult.result); 
        
        if (!dispatchStatus.success) {
            finalStatus = LogStatus.ACTION_FAIL; 
            
            // Loguear el fallo de puesta en cola (asíncronamente)
            logger.error(`Action dispatch failed for flow ${flowId}`, new Error(dispatchStatus.error), { flowId, userId, result: executionResult.result });
            
            // Log: Fallo en el dispatch a la cola
            logger.executionLog({
                flowId,
                userId,
                status: finalStatus,
                durationMs,
                timestamp: new Date(),
                payload,
                result: executionResult.result,
                error: `Action Dispatch Error: ${dispatchStatus.error}`,
                actionStatus: 500, // Error interno de infraestructura
            });

            // Retornamos 500 ya que es un fallo de infraestructura
            return c.json({ 
                status: 'dispatch_failed', 
                flowId: flowId, 
                message: `Failed to queue action: ${dispatchStatus.error}` 
            }, 500); 
        }

        // Éxito completo (Script OK y Tarea Queued OK)
        // Log: Éxito completo
        logger.executionLog({
            flowId,
            userId,
            status: LogStatus.SUCCESS, 
            durationMs,
            timestamp: new Date(),
            payload,
            result: executionResult.result,
            actionStatus: 202, // 202 Accepted por la cola
        });

        // Respuesta inmediata al cliente de Webhook con 202 Accepted
        return c.json({ 
            status: 'completed_and_dispatched', 
            flowId: flowId, 
            message: 'Script executed successfully. Action dispatched to task queue.',
            result: executionResult.result 
        }, 202); 
        
    } else {
        // El script falló 
        logger.error(`Execution failure for flow ${flowId}`, new Error(executionResult.error), { flowId, userId });
        
        if (executionResult.error.toLowerCase().includes('timeout')) {
            finalStatus = LogStatus.TIMEOUT;
        }
        
        // Log: Fallo en la ejecución del script
        logger.executionLog({
            flowId,
            userId,
            status: finalStatus,
            durationMs,
            timestamp: new Date(),
            payload,
            error: executionResult.error
        });

        return c.json({ 
            status: 'failed', 
            flowId: flowId,
            message: `Execution Error: ${executionResult.error}`
        }, 500); 
    }
});

// --- Endpoint de Salud ---
app.get('/health', (c) => c.text('OK', 200));

// --- Exportación del Handler ---
logger.info(`ScriptFlow Orchestrator initialized. Listening on port ${PORT}`);

export default {
    port: PORT,
    fetch: app.fetch,
};
