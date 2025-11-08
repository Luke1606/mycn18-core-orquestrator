import { logger } from './logger.js';
import { FlowDocument } from './types.js';
import { CloudTasksClient } from '@google-cloud/tasks';

// Usamos una variable global para cachear el cliente de Cloud Tasks una vez que se inicializa.
// En un entorno de producción, se podría usar un cliente de Cloud Tasks inicializado de forma síncrona
// o un patrón de inyección de dependencias más robusto.
let taskClient: CloudTasksClient | null = null; 

// -------------------------------------------------------------------------
// CONFIGURACIÓN (Debe estar definida en las variables de entorno)
// -------------------------------------------------------------------------
const PROJECT_ID = process.env.CLOUD_TASKS_PROJECT_ID;
const LOCATION = process.env.CLOUD_TASKS_LOCATION; 
const QUEUE_NAME = process.env.CLOUD_TASKS_QUEUE_NAME; 
const ACTION_HANDLER_URL = process.env.CLOUD_RUN_ACTION_HANDLER_URL; 

// **CORRECCIÓN 1: Se envuelve el bloque de comprobación de config en una función o se elimina el if suelto.**
// En este caso, lo he dejado como un bloque de inicialización para que se ejecute una vez.
if (!PROJECT_ID || !LOCATION || !QUEUE_NAME || !ACTION_HANDLER_URL) {
    logger.error("CRITICAL: Cloud Tasks configuration is incomplete. Action dispatch will fail.");
}

// -------------------------------------------------------------------------
// FUNCIÓN ASÍNCRONA DE DESPACHO
// -------------------------------------------------------------------------

/**
 * Inicializa el cliente de Cloud Tasks si aún no está inicializado.
 * @returns El cliente de Cloud Tasks inicializado o null si falla.
 */
const initializeTaskClient = async (): Promise<CloudTasksClient | null> => {
    if (taskClient) {
        return taskClient;
    }

    try {
        // La importación ya no es dinámica si se usa 'import { CloudTasksClient }' arriba.
        // Si el proyecto usa ES Modules y la importación falla, se podría volver a la importación dinámica.
        // Asumiendo un entorno Node.js/CommonJS donde la importación de arriba funciona:
        taskClient = new CloudTasksClient();
        logger.info("Cloud Tasks Client initialized.");
        return taskClient;
    } catch (error) {
        const initError = `Failed to initialize Cloud Tasks client: ${error}`;
        logger.error(`[TASKS_ERROR] ${initError}`);
        return null;
    }
};

/**
 * Delega el envío del resultado del flujo a una cola de tareas (Google Cloud Tasks).
 * @param flow El documento de flujo completo.
 * @param result El resultado retornado por el script del usuario.
 * @returns El estado de la PUESTA EN COLA (asíncrona).
 */
export const dispatchActionAsynchronously = async (
    flow: FlowDocument, 
    result: unknown
): Promise<{ success: boolean, error?: string }> => {

    // Comprobación de configuración crítica
    if (!PROJECT_ID || !LOCATION || !QUEUE_NAME || !ACTION_HANDLER_URL) {
        const errorMessage = "Cloud Tasks configuration is missing.";
        logger.error(errorMessage);
        return { success: false, error: errorMessage };
    }
    
    const currentTaskClient = await initializeTaskClient();
    if (!currentTaskClient) {
        const errorMessage = "Cloud Tasks client failed to initialize.";
        return { success: false, error: errorMessage };
    }

    // Payload que se enviará al Action Handler (servicio de Cloud Run separado)
    const taskPayload = {
        flowId: flow.flowId,
        actionUrl: flow.actionUrl,
        userId: flow.userId,
        result: result,
    };
    
    // Ruta completa de la cola de tareas
    const parentPath = currentTaskClient.queuePath(PROJECT_ID, LOCATION, QUEUE_NAME);

    const taskRequest = { 
        parent: parentPath,
        task: {
            httpRequest: {
                url: ACTION_HANDLER_URL, 
                httpMethod: 1, // POST
                // El cuerpo debe ser codificado en base64 para Cloud Tasks
                body: Buffer.from(JSON.stringify(taskPayload)).toString('base64'),
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        },
    };

    try {
        // Se llama al cliente con el objeto request
        await currentTaskClient.createTask(taskRequest);
        logger.info(`[TASKS] Action for flow ${flow.flowId} successfully queued to ${QUEUE_NAME}.`); 
        return { success: true };
    } catch (error) {
        const errorMessage = `Failed to queue task: ${error instanceof Error ? error.message : String(error)}`;
        logger.error(`[TASKS_ERROR] ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};

// Función obsoleta mantenida para compatibilidad de importaciones
export const sendActionWebhook = async (): Promise<{ success: boolean, error: string }> => { // Tipificación mejorada
    logger.warn("WARNING: sendActionWebhook is deprecated. The orchestrator should use dispatchActionAsynchronously.");
    return { success: false, error: "Deprecated function called." };
};