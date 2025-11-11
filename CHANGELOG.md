# Registro de Cambios (Changelog)

## Note: There are versions in both english and spanish, if you speak english please check below this note

## Nota: Hay versiones en español e inglés, si habla español por favor revise a partir de cuando termina la versión en inglés

## (English)

This file documents every significative change reflected in the MyCn18 proyect.

The format bases in [Keep a Changelog](https://keepachangelog.com/en/1.0.0/ "null"), and the project stands for [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html "null").

## [1.1.0] - 2025-11-08

### Changed

- **Cloud-Agnostic Architecture Migration:** The core orchestrator has been completely refactored to eliminate direct dependencies on Google Cloud Platform (GCP), adopting a serverless, vendor-agnostic technology stack.

  - **Database:** **Google Firestore** was replaced with **PostgreSQL**, utilizing the `pg` client. This allows integration with serverless database providers like Neon.

  - **Task Queue:** Migrated from **Google Cloud Tasks** to **BullMQ**, backed by a serverless Redis service like Upstash.

  - **Secret Management:** Integration with **Google Secret Manager** was removed. The system now assumes secrets are resolved by the control plane before being injected into the orchestrator.

### Added

- New dependencies added to support the agnostic architecture: `pg`, `bullmq`, `ioredis`.

### Removed

- Google Cloud dependencies: `@google-cloud/secret-manager`, `@google-cloud/tasks`, `firebase`.

## [1.0.0] - 2025-11-08

### Added

- Initial General Availability (GA) release of MyCn18.

- Dual-path flow engine (code and visual nodes).

- Initial support for the TypeScript SDK for creating custom nodes.

- Templates for Issues and Pull Requests in `.github/`.

- Complete repository documentation (README, CONTRIBUTING, LICENSE).

### Changed

- Flow file format updated to version 1.2.

### Removed

- Removed the slow `legacy-parser` dependency, replaced with the new TS-based parser.

### Fixed

- Fixed a critical memory overflow error when executing recursive flows.

- The development environment watcher now works correctly on Linux-based operating systems.

## [0.9.0] - 2025-08-15

### Added

- First public Beta version of the engine (migrated for a new deploy environment).

- Functionality for HTTP, Timer, and Logging integration nodes.

- TypeScript support.

### Fixed

- Initial fix for type and syntax errors.

## (ESPAÑOL)

Este archivo documenta todos los cambios significativos realizados en el proyecto MyCn18.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/ "null"), y el proyecto se adhiere al [Versionado Semántico (SemVer)](https://semver.org/spec/v2.0.0.html "null").

## [1.1.0] - 2025-11-08

### Cambiado

- **Migración de Arquitectura a Cloud-Agnostic:** Se ha refactorizado por completo el núcleo del orquestador para eliminar las dependencias directas con Google Cloud Platform (GCP), adoptando una pila tecnológica serverless y agnóstica del proveedor.

  - **Base de Datos:** Se reemplazó **Google Firestore** por **PostgreSQL**, utilizando el cliente `pg`. Esto permite la integración con proveedores de bases de datos serverless como Neon.

  - **Cola de Tareas:** Se migró de **Google Cloud Tasks** a **BullMQ**, respaldado por un servicio de Redis serverless como Upstash.

  - **Gestión de Secretos:** Se eliminó la integración con **Google Secret Manager**. El sistema ahora asume que los secretos son resueltos por la capa de control antes de ser inyectados en el orquestador.

### Añadido

- Nuevas dependencias para soportar la arquitectura agnóstica: `pg`, `bullmq`, `ioredis`.

### Eliminado

- Dependencias de Google Cloud: `@google-cloud/secret-manager`, `@google-cloud/tasks`, `firebase`.

## [1.0.0] - 2025-11-08

### Añadido

- Lanzamiento inicial (GA) de MyCn18.

- Motor de flujo de doble vía (código y nodos visuales).

- Soporte inicial para el SDK de TypeScript para la creación de nodos personalizados.

- Plantillas para Issues y Pull Requests en `.github/`.

- Documentación completa del repositorio (README, CONTRIBUTING, LICENSE).

### Cambiado

- El formato de los archivos de flujo (_flow files_) se actualizó a la versión 1.2.

### Eliminado

- Se eliminó la dependencia `legacy-parser` que era lenta y se reemplazó por el nuevo parser basado en TS.

### Corregido

- Se solucionó un error crítico de desbordamiento de memoria al ejecutar flujos recursivos.

- El _watcher_ del entorno de desarrollo ahora funciona correctamente en sistemas operativos basados en Linux.

## [0.9.0] - 2025-08-15

### Añadido

- Primera versión Beta pública del motor (migrada para un nuevo entorno de _deploy_).

- Funcionalidad de nodos de integración HTTP, Timer y Logging.

- Soporte para TypeScript.

### Corregido

- Corrección inicial de errores de tipo y sintaxis.
