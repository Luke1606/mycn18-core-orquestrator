import { ExecutionLog } from './types.js';

// Variable privada para mantener la función de BDD
let dbLogger: ((logData: ExecutionLog) => Promise<void>) | null = null;

// Define a basic structured logger for Cloud Run
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

    /**
     * Permite que el servidor "inyecte" el logger de la BDD.
     */
    initializeDatabaseLogging: (logFn: (logData: ExecutionLog) => Promise<void>) => {
        dbLogger = logFn;
        logger.info('Database logging has been initialized.');
    },

    /**
     * ACTUALIZADO: Esta función ahora loguea a la consola Y a la BDD.
     * Acepta el objeto ExecutionLog completo.
     */
    executionLog: (logData: ExecutionLog) => {
        // 1. Loguear a la consola (como antes)
        console.log(JSON.stringify({ 
            severity: 'INFO', 
            type: 'EXECUTION_LOG', 
            ...logData,
            // Convertir la fecha a string para el log de consola
            timestamp: logData.timestamp.toISOString(), 
        }));

        // 2. Loguear a la BDD (de forma asíncrona y sin bloquear)
        if (dbLogger) {
            // Llamamos a la función inyectada.
            // Usamos .catch() para que un fallo de logueo de BDD no crashee el logger.
            dbLogger(logData).catch(err => {
                // Si falla el logueo a BDD, lo logueamos a la consola
                logger.error('CRITICAL_DB_LOG_FAIL: Failed to save execution log to Firestore', err, { 
                    flowId: logData.flowId 
                });
            });
        } else {
            // Advertencia si alguien olvida inicializarlo
            logger.warn('Database logger not initialized. Execution log was only sent to console.', {
                flowId: logData.flowId
            });
        }
    },
};