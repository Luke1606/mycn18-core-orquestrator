import { VM, VMScript } from 'vm2';
import { FlowPayload, FlowSecrets, ExecutionResult } from './types'; // Ahora incluye ExecutionResult

/**
 * Lista blanca de módulos que el script del usuario tiene permitido importar.
 * Esta lista está pre-instalada en la imagen de Docker.
 */
const ALLOWED_MODULES = ['axios', 'lodash', 'moment', 'ts-pattern'];

/**
 * Mapea los módulos de la lista blanca para inyectarlos en el sandbox.
 * Esto asegura que solo las dependencias pre-aprobadas puedan ser requeridas.
 */
const MOCKED_REQUIRE = ALLOWED_MODULES.reduce((acc, mod) => {
    // Usamos 'require' nativo de Node.js para cargar el módulo real
    return { ...acc, [mod]: require(mod) };
}, {});


/**
 * Ejecuta el código del usuario dentro de un entorno seguro y aislado (sandbox).
 * @param userCode - El script del usuario a ejecutar.
 * @param payload - Los datos del webhook.
 * @param secrets - Las variables de entorno para el script.
 * @returns Un objeto ExecutionResult indicando éxito o fracaso.
 */
export const executeUserScript = async (
    userCode: string,
    payload: FlowPayload,
    secrets: FlowSecrets
): Promise<ExecutionResult> => {
    
    // 1. Configuración del Sandbox
    const vm = new VM({
        timeout: 5000,      // **CRÍTICO:** Límite estricto de 5 segundos de ejecución.
        allowAsync: true,   // Permite usar 'await' en el script del usuario.
        
        // Variables globales que el script puede acceder
        sandbox: {
            payload: payload,   // Datos de entrada del webhook
            env: secrets,       // Secrets inyectados como variables de entorno
            console: console    // Permite al usuario hacer logging
        },
        
        // Configuración de Seguridad de Módulos (Lista Blanca)
        require: {
            external: true, // Permite require()
            // Módulos nativos de Node permitidos (minimalista)
            builtin: ['util', 'events'], 
            root: './',
            mock: MOCKED_REQUIRE // Inyección de módulos de la Lista Blanca
        }
    } as any);

    try {
        // Envolver el código del usuario en una IIFE asíncrona para poder usar 'await' y 'return'.
        const wrappedCode = `(async () => { ${userCode} })()`;
        
        // Crear el script (opcional pero ayuda a optimizar la ejecución en VM2)
        const script = new VMScript(wrappedCode);

        // Ejecución
        const result = await vm.run(script);
        
        // El script se ejecutó sin errores y retornó un valor
        return { success: true, result };
        
    } catch (err: any) {
        // Captura errores de sintaxis, timeouts, o excepciones dentro del script
        const errorMessage = err?.message ?? String(err);
        
        // Limpiamos la referencia a la VM por seguridad después de un fallo
        (vm as any).dispose(); 
        
        return { success: false, error: errorMessage };
    }
};