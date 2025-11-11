# MyCn18 Core Orchestrator

## Note: There are versions in both english and spanish, if you speak english please check below this note

## Nota: Hay versiones en español e inglés, si habla español por favor revise a partir de cuando termina la versión en inglés

## (English)

Minimal skeleton for the MyCn18 orchestrator runtime (MVP).

## 🚀 The Code-First Value: Full Extensibility via NPM

MyCn18 distinguishes itself from traditional Low-Code solutions (like Zapier or n8n) by adopting a **Code-First** and **Open Source** architecture.

While other platforms force you to rely on predefined nodes, MyCn18 grants you complete control: your code is the single source of truth.

### 1. Code is the Source of Truth

The visual interface is merely a design layer. The true execution engine is your pure TypeScript/JavaScript code, running within a secure sandbox (`vm2`). This means you can write business logic as complex as you would in your preferred IDE, without the limitations of a visual editor.

### 2. Versioned and Reusable Libraries (The Core Power)

This architecture allows the use of the standard **`require()`** command within Custom Code Nodes, but in a completely secure (whitelisted) manner.

- **Your Own Business Logic:** You can create your own business logic library (e.g., `@your-org/fiscal-calculations`), publish it to a private NPM registry (like GitHub Packages), and import it directly into any MyCn18 flow.

- **Approved Modules:** Use common community packages like `lodash` or `axios-retry` (pre-approved by the platform).

**What does this mean?** Your complex logic can be maintained, versioned, and tested outside the editor, ensuring maximum quality, traceability, and reuse across all your flows. MyCn18 is a Low-Code platform that **respects and empowers the expert developer**.

NOTE: Donations through paypal are recieved by a direct familiar and focused to support MyCn18. Every support is 100% focused on maintenance and developing new features.

## Quickstart (local) EN

1. Install dependencies and build

    ```bash
    npm ci
    npm run build
    npm start
    ```

2. Dev

    ```bash
    npm run dev
    ```

## Endpoints EN

- GET /health — readiness check

- POST /api/webhook/:flowId — execute user code (MVP: pass `userCode`, `payload`, `secrets` in JSON body)

## Dev Notes EN

- This is an initial skeleton. The runtime uses `vm2` for sandboxing in `src/runtime.ts` and a small white-list of modules.

- Do not pass real secrets in cleartext in production. This is an MVP scaffold; secure secret management is required before production.

## (ESPAÑOL)

## 🚀 El Valor Code-First: Extensibilidad Total con NPM

MyCn18 se diferencia de las soluciones Low-Code tradicionales (como Zapier o n8n) al adoptar una arquitectura **Code-First** y **Open Source**.

Mientras que otras plataformas lo obligan a depender de nodos predefinidos, MyCn18 le otorga el control total: su código es la única fuente de verdad.

### 1. El Código es la Fuente de Verdad

La interfaz visual es simplemente una capa de diseño. El verdadero motor de ejecución es su código TypeScript/JavaScript puro, ejecutado en un entorno seguro (`vm2`). Esto significa que puede escribir lógica de negocio tan compleja como lo haría en su IDE, sin las restricciones de un editor visual.

### 2. Librerías Versionadas y Reutilizables (El Poder Central)

Esta arquitectura permite utilizar el comando estándar **`require()`** dentro de los nodos de código personalizado (Custom Code Nodes), pero de forma totalmente segura (lista blanca controlada).

- **Lógica de Negocio Propia:** Puede crear su propia librería de lógica de negocio (ej. `@su-org/calculos-fiscales`), publicarla en un registro NPM privado (como GitHub Packages), e importarla directamente en cualquier flujo de MyCn18.

- **Módulos Aprobados:** Utilice paquetes comunes de la comunidad como `lodash` o `axios-retry` (pre-aprobados por la plataforma).

**¿Qué significa esto?** Su lógica compleja puede ser mantenida, versionada y testeada fuera del editor, asegurando la máxima calidad, trazabilidad y reutilización en todos sus flujos. MyCn18 es una plataforma Low-Code que **respeta y potencia al desarrollador experto**.

NOTA: Las donaciones a través de PayPal están gestionadas por un familiar directo para optimizar el soporte a MyCn18. Todo el apoyo recibido se destina 100% al mantenimiento y desarrollo de nuevas funciones.

## Quickstart (local) ES

1. Install dependencies and build

    ```bash
    npm ci
    npm run build
    npm start
    ```

2. Dev

    ```bash
    npm run dev
    ```

## Endpoints ES

- GET /health — readiness check

- POST /api/webhook/:flowId — execute user code (MVP: pass `userCode`, `payload`, `secrets` in JSON body)

## Dev Notes ES

- Esto es un esqueleto inicial. El entorno de ejecución utiliza `vm2` para guardar el código en una ´caja´ en `src/runtime.ts` y una pequeña lista blanca de módulos importables.

- No permita filtrado de secretos reales en texto plano en producción. Esto es un borrador MVP; el manejo de secretos seguro es requerido antes de producción.
