import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { logger } from '../logger.js';

/**
 * Configuración por defecto para el cliente HTTP seguro.
 * Incluye timeouts y límites de tamaño de respuesta.
 */
const DEFAULT_HTTP_CONFIG: AxiosRequestConfig = {
    timeout: 3000, // 3 segundos de timeout para cualquier petición externa
    maxContentLength: 1024 * 1024, // Limite de 1MB para la respuesta
    validateStatus: (status) => status >= 200 && status < 300, // Solo 2xx son éxito por defecto
};

/**
 * Cliente HTTP seguro para ser expuesto en el sandbox.
 * Limita las capacidades de Axios para prevenir abusos.
 */
export const safeHttpClient = {
    /**
     * Realiza una petición GET segura.
     * @param url La URL a la que se va a hacer la petición.
     * @param config Configuración adicional para la petición (se fusiona con la configuración por defecto).
     * @returns La respuesta de Axios.
     */
    get: async <T = unknown, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => {
        const mergedConfig = { ...DEFAULT_HTTP_CONFIG, ...config };
        try {
            logger.info(`[SANDBOX_HTTP] GET request to ${url}`, { url, method: 'GET', timeout: mergedConfig.timeout });
            return await axios.get<T, R>(url, mergedConfig);
        } catch (error) {
            logger.error(`[SANDBOX_HTTP_ERROR] GET request to ${url} failed`, error, { url, method: 'GET' });
            throw error;
        }
    },

    /**
     * Realiza una petición POST segura.
     * @param url La URL a la que se va a hacer la petición.
     * @param data Los datos a enviar en el cuerpo de la petición.
     * @param config Configuración adicional para la petición.
     * @returns La respuesta de Axios.
     */
    post: async <T = unknown, R = AxiosResponse<T>>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<R> => {
        const mergedConfig = { ...DEFAULT_HTTP_CONFIG, ...config };
        try {
            logger.info(`[SANDBOX_HTTP] POST request to ${url}`, { url, method: 'POST', timeout: mergedConfig.timeout });
            return await axios.post<T, R>(url, data, mergedConfig);
        } catch (error) {
            logger.error(`[SANDBOX_HTTP_ERROR] POST request to ${url} failed`, error, { url, method: 'POST' });
            throw error;
        }
    },

    // Puedes añadir otros métodos HTTP (put, delete, etc.) aquí, siguiendo el mismo patrón.
    // Asegúrate de que todos los métodos expuestos sean seguros y controlados.
};
