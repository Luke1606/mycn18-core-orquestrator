import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore';
import { FlowDocument, FlowSecrets } from './types';

// La configuración se obtendría del entorno de Cloud Run/GCP
// Usaremos variables globales que se inyectan en el entorno serverless
const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

// -------------------------------------------------------------
// 1. INICIALIZACIÓN DE FIREBASE
// -------------------------------------------------------------

/**
 * Inicializa la aplicación Firebase y el servicio Firestore.
 * Se asegura de que la inicialización solo ocurra una vez (necesario en serverless).
 */
export const initializeFirebase = (): void => {
    // Si ya está inicializada, no hacemos nada.
    if (getApps().length) {
        app = getApps()[0];
        db = getFirestore(app);
        console.log('Firestore client already initialized.');
        return;
    }
    
    // Validamos que la configuración mínima esté presente
    if (!FIREBASE_CONFIG.projectId) {
        console.error('FIREBASE_PROJECT_ID is not defined. DB functionality will be mocked.');
        return;
    }
    
    try {
        app = initializeApp(FIREBASE_CONFIG);
        db = getFirestore(app);
        console.log('Firestore client initialized successfully.');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
};

// Inicializar al cargar el módulo
initializeFirebase();

// -------------------------------------------------------------
// 2. FUNCIONES DE LECTURA DE FLUJOS
// -------------------------------------------------------------

/**
 * Recupera un documento de flujo por su flowId (Webhook ID).
 * @param flowId - El ID del flujo a buscar.
 * @returns El FlowDocument si se encuentra y está activo, o null.
 */
export const getFlowDocument = async (flowId: string): Promise<FlowDocument | null> => {
    if (!db) {
        console.warn('Firestore not initialized. Returning mock flow.');
        // Si la DB no está inicializada (ej. en desarrollo sin ENV), retornamos un mock
        return {
            userId: 'mock-user',
            flowId: flowId,
            isActive: true,
            userCode: 'return { status: "mocked", message: "DB not connected" };',
            secrets: { MOCK_KEY: 'mock-secret' } as FlowSecrets,
            actionUrl: 'https://mock.example.com/action',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    try {
        // En Firestore, asumiremos que los flujos se almacenan en una colección global 'flows'
        // con el flowId como ID del documento.
        const flowRef = doc(db, 'flows', flowId);
        const flowSnap = await getDoc(flowRef);

        if (flowSnap.exists()) {
            const data = flowSnap.data() as FlowDocument;
            
            if (data.isActive) {
                // Aquí podrías validar más campos si fuera necesario
                return { 
                    ...data,
                    // Asegurar que las fechas son objetos Date si no lo son ya
                    createdAt: (data.createdAt as any).toDate ? (data.createdAt as any).toDate() : data.createdAt,
                    updatedAt: (data.updatedAt as any).toDate ? (data.updatedAt as any).toDate() : data.updatedAt,
                };
            }
        }
        
        return null; // El flujo no existe o está inactivo
    } catch (error) {
        console.error(`Error fetching flow ${flowId} from Firestore:`, error);
        return null; // Error de conexión o de lectura
    }
};