Registro de Cambios (Changelog)

Este archivo documenta todos los cambios significativos realizados en el proyecto MyCn18.

El formato se basa en Keep a Changelog, y el proyecto se adhiere al Versionado Semántico (SemVer).

[1.0.0] - 2025-11-08

Añadido

Lanzamiento inicial (GA) de MyCn18.

Motor de flujo de doble vía (código y nodos visuales).

Soporte inicial para el SDK de TypeScript para la creación de nodos personalizados.

Plantillas para Issues y Pull Requests en .github/.

Documentación completa del repositorio (README, CONTRIBUTING, LICENSE).

Cambiado

El formato de los archivos de flujo (flow files) se actualizó a la versión 1.2.

Eliminado

Se eliminó la dependencia legacy-parser que era lenta y se reemplazó por el nuevo parser basado en TS.

Corregido

Se solucionó un error crítico de desbordamiento de memoria al ejecutar flujos recursivos.

El watcher del entorno de desarrollo ahora funciona correctamente en sistemas operativos basados en Linux.

[0.9.0] - 2025-08-15

Añadido

Primera versión Beta pública del motor.

Funcionalidad de nodos de integración HTTP, Timer y Logging.

Soporte para TypeScript.

Corregido

Corrección inicial de errores de tipo y sintaxis.
