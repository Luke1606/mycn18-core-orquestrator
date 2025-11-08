# scriptflow-orchestrator (ScriptFlow / Flow Weaver)

Minimal skeleton for the ScriptFlow orchestrator runtime (MVP).

Quickstart (local)

1. Install dependencies and build

    ```powershell
    npm ci
    npm run build
    npm start
    ```

2. Dev

    ```powershell
    npm run dev
    ```

Endpoints

- GET /health — readiness check
- POST /api/webhook/:flowId — execute user code (MVP: pass `userCode`, `payload`, `secrets` in JSON body)

Notes

- This is an initial skeleton. The runtime uses `vm2` for sandboxing in `src/runtime.ts` and a small white-list of modules.
- Do not pass real secrets in cleartext in production. This is an MVP scaffold; secure secret management is required before production.
