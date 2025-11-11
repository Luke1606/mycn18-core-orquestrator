# Contributing to MyCn18 Core Orchestrator

## Note: There are versions in both english and spanish, if you speak english please check below this note

## Nota: Hay versiones en español e inglés, si habla español por favor revise a partir de cuando termina la versión en inglés

---

## (English)

We welcome contributions to the MyCn18 Orchestrator project! By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 💡 Extensibility Model: Sandbox Contribution

MyCn18 allows users to utilize private NPM packages in their code via the **`require()`** function. This is a powerful feature, but it requires that all third-party (community) libraries are explicitly **whitelisted** in the engine for security and stability.

We highly appreciate contributions that reinforce this layer of extensibility and security.

### 1. Proposals and Pull Requests for Community Modules

If a popular community library (e.g., `axios-retry`, `joi`, `lodash-es`) proves useful to the community and does not have unsafe I/O dependencies, please propose its inclusion:

* **Security Verification:** Ensure the library is "pure" (pure functions) and does not attempt to access the file system (`fs`), sockets (`net`), or the Node.js environment outside the sandbox permissions.
* **Update the Resolver:** The Pull Request must include installing the NPM package on the host and adding the module to the whitelist (`communityModules`) within the resolver logic (e.g., `src/safe-mods/resolver.ts` or `src/runtime.ts`).
* **Tests:** Include a test that confirms the module loads correctly and does not break sandbox security.

### 2. New Node Components (Core Node Proposals)

If you have implemented repetitive logic that could become a generic visual "node" for the platform (e.g., a node to process CSV data, a JSON validation node):

* **Write the Base Logic:** Implement the function in host TypeScript and submit a Pull Request (PR) with the logic.
* **Documentation:** Clearly describe the function's *input* and *output*. The MyCn18 team will be responsible for creating the *visual node* and the *transpiler* that converts the visual node into the correct `require()` call.

## How to Contribute

1. **Fork the Repository**: Start by forking the `mycn18-core-orchestrator` repository to your GitHub account.
2. **Clone Your Fork**: Clone your forked repository to your local machine.

    ```bash
    git clone [https://github.com/YOUR_USERNAME/mycn18-core-orchestrator.git](https://github.com/YOUR_USERNAME/mycn18-core-orchestrator.git)
    cd mycn18-core-orchestrator
    ```

3. **Create a New Branch**: Create a new branch for your feature or bug fix.

    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```

4. **Install Dependencies**:

    ```bash
    npm ci
    ```

5. **Make Your Changes**: Implement your feature or fix the bug. Ensure your code adheres to the project's coding standards (linting, formatting).
6. **Run Tests**: Before submitting, ensure all existing tests pass and add new tests for your changes.

    ```bash
    npm test
    ```

7. **Lint and Typecheck**:

    ```bash
    npm run lint
    npm run typecheck
    ```

8. **Commit Your Changes**: Write clear and concise commit messages.

    ```bash
    git commit -m "feat: Add new feature"
    # or
    git commit -m "fix: Resolve issue #123"
    ```

9. **Push to Your Fork**:

    ```bash
    git push origin feature/your-feature-name
    ```

10. **Create a Pull Request**: Open a Pull Request from your fork to the `main` branch of the original repository. Fill out the provided Pull Request Template.

## Code Style and Guidelines

* **TypeScript**: All new code should be written in TypeScript.
* **ESLint & Prettier**: We use ESLint for linting and Prettier for code formatting. Ensure your code passes linting and formatting checks.
* **Testing**: All new features and bug fixes should be accompanied by appropriate unit and/or integration tests.

## Reporting Bugs

If you find a bug, please open an issue using the "Bug Report" template.

## Suggesting Features

If you have an idea for a new feature, please open an issue using the "Feature Request" template.

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---
---

## (ESPAÑOL)

Damos la bienvenida a las contribuciones al proyecto MyCn18 Orchestrator. Al participar, acepta cumplir con nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## 💡 El Modelo de Extensibilidad: Contribución al Sandbox

MyCn18 permite a los usuarios utilizar paquetes NPM privados en su código a través de la función **`require()`**. Esta es una característica poderosa, pero requiere que todas las librerías de terceros (comunitarias) sean explícitamente añadidas a una **lista blanca segura** (whitelisting) en el motor por razones de seguridad y estabilidad.

Agradecemos enormemente las contribuciones que refuercen esta capa de extensibilidad y seguridad.

### 1. Propuestas y Pull Requests para Módulos Comunitarios

Si una librería popular de la comunidad (ej. `axios-retry`, `joi`, `lodash-es`) resulta útil y no tiene dependencias inseguras de I/O, proponga su inclusión:

* **Verificación de Seguridad:** Asegúrese de que la librería sea "pura" (pure functions) y no intente acceder al sistema de archivos (`fs`), sockets (`net`), ni al entorno de Node.js fuera de los permisos del sandbox.
* **Actualizar el Resolver:** El Pull Request debe incluir la instalación del paquete NPM en el host y la adición del módulo a la lista blanca (`communityModules`) dentro de la lógica del *resolver* (ej. `src/safe-mods/resolver.ts` o `src/runtime.ts`).
* **Pruebas:** Incluya una prueba que confirme que el módulo se carga correctamente y que no rompe la seguridad del sandbox.

### 2. Nuevos Componentes de Nodos (Propuestas de Core Nodes)

Si ha implementado una lógica muy repetitiva que podría convertirse en un "nodo" visual genérico para la plataforma (ej. un nodo para procesar datos CSV, un nodo de validación de JSON con Joi):

* **Escribir la Lógica Base:** Implemente la función en TypeScript de host y envíenos un Pull Request (PR) con la lógica.
* **Documentación:** Describa claramente el *input* y *output* de la función. El equipo de MyCn18 se encargará de crear el *nodo visual* y el *transpilador* que convierte el nodo visual a la llamada de `require()` correcta.

## Cómo Contribuir

1. **Fork del Repositorio**: Comience haciendo un fork del repositorio `mycn18-core-orchestrator` a su cuenta de GitHub.
2. **Clonar su Fork**: Clone su repositorio bifurcado a su máquina local.

    ```bash
    git clone [https://github.com/SU_USUARIO/mycn18-core-orchestrator.git](https://github.com/SU_USUARIO/mycn18-core-orchestrator.git)
    cd mycn18-core-orchestrator
    ```

3. **Crear una Nueva Rama**: Cree una nueva rama para su característica o corrección de error.

    ```bash
    git checkout -b feature/nombre-de-su-feature
    # o
    git checkout -b bugfix/descripcion-del-problema
    ```

4. **Instalar Dependencias**:

    ```bash
    npm ci
    ```

5. **Realizar Sus Cambios**: Implemente su característica o corrija el error. Asegúrese de que su código cumpla con los estándares de codificación del proyecto (linting, formateo).
6. **Ejecutar Pruebas**: Antes de enviar, asegúrese de que todas las pruebas existentes pasen y añada nuevas pruebas para sus cambios.

    ```bash
    npm test
    ```

7. **Lint y Verificación de Tipos**:

    ```bash
    npm run lint
    npm run typecheck
    ```

8. **Confirmar Sus Cambios (Commit)**: Escriba mensajes de commit claros y concisos.

    ```bash
    git commit -m "feat: Añadir nueva característica"
    # o
    git commit -m "fix: Resolver problema #123"
    ```

9. **Empujar a su Fork (Push)**:

    ```bash
    git push origin feature/nombre-de-su-feature
    ```

10. **Crear un Pull Request**: Abra un Pull Request desde su fork a la rama `main` del repositorio original. Rellene la Plantilla de Pull Request proporcionada.

## Estilo de Código y Pautas

* **TypeScript**: Todo código nuevo debe escribirse en TypeScript.
* **ESLint & Prettier**: Usamos ESLint para linting y Prettier para el formateo de código. Asegúrese de que su código pase las comprobaciones de linting y formateo.
* **Pruebas**: Todas las nuevas características y correcciones de errores deben ir acompañadas de pruebas unitarias y/o de integración apropiadas.

## Reportar Errores

Si encuentra un error, por favor abra un *issue* utilizando la plantilla de "Reporte de Error".

## Sugerir Características

Si tiene una idea para una nueva característica, por favor abra un *issue* utilizando la plantilla de "Solicitud de Característica".

## Código de Conducta

Por favor, revise nuestro [Código de Conducta](CODE_OF_CONDUCT.md) antes de contribuir.
