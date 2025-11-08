/**
 * Tipo genérico para la entrada de datos del Webhook.
 * Usamos Record<string, unknown> para permitir cualquier estructura JSON.
 */
export type FlowPayload = Record<string, unknown>;

/**
 * Tipo para las variables de entorno/secrets inyectadas en el script.
 * Deben ser solo strings para simular variables de entorno (ENV).
 */
export type FlowSecrets = Record<string, string>;

/**
 * Tipo de la respuesta devuelta por el motor executeUserScript.
 * Contiene el resultado final del script O el error de ejecución.
 */
export type ExecutionResult = {
    success: true;
    result: unknown; // El valor que retorna el script del usuario.
} | {
    success: false;
    error: string; // Mensaje de error (ej: timeout, error de sintaxis, etc.)
};