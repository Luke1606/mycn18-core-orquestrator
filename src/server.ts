import { Hono } from 'hono';
import { executeUserScript } from './runtime';
import { FlowPayload, FlowSecrets, ExecutionResult } from './types';

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

// --- Endpoint del Webhook (El Músculo de la Orquestación) ---

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

    // --- Lógica de Orquestación (Simulación MVP) ---
    
    // **NOTA CLAVE:** En la versión real, estas variables se cargarían de Firestore/DB.
    // Para el MVP y el testing, simulamos un flujo exitoso:
    
    // 1. Cargar Código: El código que el usuario escribió en el Monaco Editor.
    const mockUserCode: string = `
        const axios = require('axios'); // Dependencia de lista blanca
        console.log('Flow started for ID:', flowId);
        
        // Simulación de una llamada a una API externa con axios (valor clave)
        // const response = await axios.post(payload.action_url, { status: 'processing' }); 

        if (payload.event_type === 'invoice.paid') {
            return {
                status: 'success',
                message: 'Invoice processed and ready for logging.',
                data: {
                    id: payload.id,
                    amount: payload.amount,
                }
            };
        }
        
        return { status: 'skipped', message: 'Event type not relevant.' };
    `;

    // 2. Cargar Secrets: Variables de entorno para el script.
    const mockSecrets: FlowSecrets = { 
        STRIPE_KEY: process.env.STRIPE_SECRET || 'sk_mock_default_xxx',
        FLOW_ID: flowId, // Inyectar el ID del flujo como un secret
    };

    // --- Ejecución en la Caja de Arena ---
    
    const executionResult: ExecutionResult = await executeUserScript(
        mockUserCode,
        payload,
        mockSecrets
    );

    // --- Respuesta y Manejo de Errores ---
    
    if (executionResult.success) {
        // El script terminó correctamente. Retornamos 200/202.
        // Aquí se ejecutaría la LÓGICA DE ACCIÓN (fetch a la URL final del usuario)
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