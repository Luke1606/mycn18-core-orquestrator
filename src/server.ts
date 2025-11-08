import { Hono } from 'hono';
import { executeUserScript } from './runtime'; 
import { FlowPayload, FlowSecrets, ExecutionResult } from './types';
import { getFlowDocument } from './db'; 
import { sendActionWebhook } from './action';

// --- Configuración del Servidor y Tipos ---
const app = new Hono();

// El puerto es necesario solo si se ejecuta localmente con un servidor HTTP tradicional
const PORT = process.env.PORT || 8080; 

// Middleware para logs simples
app.use('*', async (c, next) => {
    // Log el URL y método para trazabilidad en Cloud Run
    console.log(`[${new Date().toISOString()}] ${c.req.method}: ${c.req.url}`);
    await next();
});

// --- Endpoint Principal del Webhook ---
app.post('/api/webhook/:flowId', async (c) => {

    const flowId = c.req.param('flowId');

    // 1. Obtener datos del Webhook
    let payload: FlowPayload;
    try {
        payload = await c.req.json();
    } catch (e) {
        // En caso de que el cuerpo no sea JSON, lo tratamos como vacío.
        payload = {};
    }
    // --- Lógica de Orquestación Real: Cargar de Firestore ---
    
    const flow = await getFlowDocument(flowId);

    if (!flow || !flow.isActive) {
        const message = `Flow ${flowId} not found or is inactive.`;
        console.warn(message);
        return c.json({ status: 'rejected', flowId: flowId, message }, 404);
    }

    const { userCode, secrets } = flow;
    const executionSecrets: FlowSecrets = { ...secrets, FLOW_ID: flowId };

    // --- Ejecución en la Caja de Arena ---
    
    const executionResult: ExecutionResult = await executeUserScript(
        userCode,
        payload,
        executionSecrets
    );

    // --- Respuesta y Manejo de Errores ---
    
    if (executionResult.success) {
        // 1. Ejecutar la acción de salida
        const actionStatus = await sendActionWebhook(flow, executionResult.result); 
        
        // 2. Determinar la respuesta final del Webhook
        if (!actionStatus.success) {
            // El script funcionó, pero el webhook de salida falló (ej. URL caída).
            // Retornamos 500 para indicar un error de la cadena de flujo,
            // pero el error es del servidor remoto.
            return c.json({ 
                status: 'action_failed', 
                flowId: flowId, 
                message: `Action webhook failed: ${actionStatus.error}` 
            }, 500); 
        }

        // Éxito completo (Script OK y Acción OK)
        return c.json({ 
            status: 'completed', 
            flowId: flowId, 
            result: executionResult.result 
        }, 200);
        
    } else {
        // El script falló (error de sintaxis, timeout, o error lógico).
        console.error(`Execution failure for flow ${flowId}:`, executionResult.error);
        // Retornar un error 500 para el cliente de Webhook
        return c.json({ 
            status: 'failed', 
            flowId: flowId,
            message: `Execution Error: ${executionResult.error}`
        }, 500); 
    }
});

// --- Endpoint de Salud (Esencial para Serverless) ---

app.get('/health', (c) => c.text('OK', 200));

// --- Exportación del Handler (El Patrón Serverless) ---

console.log(`ScriptFlow Orchestrator initialized.`);

// Cloud Run/Functions espera un objeto con un método fetch.
// Usamos este patrón de exportación para la máxima compatibilidad.
export default {
    port: PORT,
    fetch: app.fetch,
};