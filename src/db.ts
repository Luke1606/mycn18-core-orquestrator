import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getFirestore, doc, getDoc, Firestore, collection, addDoc } from 'firebase/firestore'; 
import { FlowDocument, ExecutionLog } from './types.js';
import { logger } from './logger.js';

// -------------------------------------------------------------
// 0. CONFIGURACIÓN
// -------------------------------------------------------------

// Las opciones de Firebase se leen de las variables de entorno de Cloud Run.
const apiKey: string | undefined = process.env.FIREBASE_API_KEY;
const authDomain: string | undefined = process.env.FIREBASE_AUTH_DOMAIN;
const projectId: string | undefined = process.env.FIREBASE_PROJECT_ID;
const storageBucket: string | undefined = process.env.FIREBASE_STORAGE_BUCKET;
const messagingSenderId: string | undefined = process.env.FIREBASE_MESSAGING_SENDER_ID;
const appId: string | undefined = process.env.FIREBASE_APP_ID;

if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    const errorMessage: string = 'One or more Firebase configuration environment variables are missing.';
    logger.warn(errorMessage, {
        FIREBASE_API_KEY: !!apiKey,
        FIREBASE_AUTH_DOMAIN: !!authDomain,
        FIREBASE_PROJECT_ID: !!projectId,
        FIREBASE_STORAGE_BUCKET: !!storageBucket,
        FIREBASE_MESSAGING_SENDER_ID: !!messagingSenderId,
        FIREBASE_APP_ID: !!appId,
    });
    throw new Error(errorMessage);
}

const FIREBASE_CONFIG: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
};

let appInstance: FirebaseApp;
let firestoreDb: Firestore;

// -------------------------------------------------------------
// 1. INICIALIZACIÓN DE FIREBASE
// -------------------------------------------------------------

/**
 * Inicializa la aplicación Firebase y el servicio Firestore (solo una vez).
 * Esto es clave para el rendimiento en el entorno serverless (cold start).
 */
export const initializeFirebase = (): void => {
    if (getApps().length === 0) {
        try {
            appInstance = initializeApp(FIREBASE_CONFIG);
            firestoreDb = getFirestore(appInstance);
            logger.info('Firestore client initialized successfully.');
        } catch (error) {
            logger.error('Error initializing Firebase:', error);
            throw error; // Re-throw to prevent further execution with uninitialized DB
        }
    } else {
        const existingApp = getApps()[0];
        if (!existingApp) {
            const errorMessage: string = 'Firebase app instance is undefined despite getApps() returning length > 0.';
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        appInstance = existingApp;
        firestoreDb = getFirestore(appInstance);
        logger.info('Firestore client already initialized.');
    }
};

// Se ejecuta al cargar el módulo (durante el cold start).
initializeFirebase();

// -------------------------------------------------------------
// 2. FUNCIONES DE LECTURA DE FLUJOS (Orquestación)
// -------------------------------------------------------------

/**
 * Recupera un documento de flujo por su flowId.
 * @param flowId - El ID del flujo a buscar.
 * @returns El FlowDocument si se encuentra y está activo, o null.
 */
export const getFlowDocument = async (flowId: string): Promise<FlowDocument | null> => {
    try {
        const flowRef = doc(firestoreDb, 'flows', flowId);
        const flowSnap = await getDoc(flowRef);

        if (flowSnap.exists()) {
            const data = flowSnap.data() as FlowDocument;
            if (data.isActive) {
                return data;
            }
        }
        
        return null; // El flujo no existe o está inactivo
    } catch (error) {
        logger.error(`Error fetching flow ${flowId} from Firestore:`, error, { flowId });
        return null; // Error de conexión o de lectura
    }
};

// -------------------------------------------------------------
// 3. FUNCIONES DE REGISTRO (LOGGING)
// -------------------------------------------------------------

/**
 * Registra un evento completo de ejecución en la colección 'execution_logs'.
 * @param logData - Los datos del log a registrar.
 */
export const logExecution = async (logData: ExecutionLog): Promise<void> => {
    try {
        const logsCollection = collection(firestoreDb, 'execution_logs');
        await addDoc(logsCollection, logData);
    } catch (error) {
        logger.error(`CRITICAL: Failed to save execution log for ${logData.flowId}:`, error, { flowId: logData.flowId });
        // En un escenario real, esto debería ir a un sistema de errores de emergencia.
    }
};
