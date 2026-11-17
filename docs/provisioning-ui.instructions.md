## Provisioning UI Pattern

Goal: Automatically reflect PBX provisioning status in the UI based on `pbx_domains` (homeSwitch + status), with an optional button to (re)trigger provisioning.

### 1. Data model expectations (DB / API)

- `pbx_domains` must have at least:
  - `id: string`
  - `name: string` (PBX domain name)
  - `homeSwitch: string | null` (VM / switch instance identifier)
  - `switchStatus: "pending" | "provisioning" | "ready" | "failed"` (or similar enum)
  - Optional: `ipAddress: string | null`
- Cloud Run provisioner (see pub-sub.instructions.md):
  - On success: sets `homeSwitch` and `switchStatus = "ready"` (or `"provisioned"`; map to `"ready"` in UI).
  - On failure: sets `switchStatus = "failed"`.

Expose a simple API/server action that returns the current domain provisioning info for the logged‑in user:
- Input: current user / slug
- Output shape for UI (PbxDomain):
  - `{ id, domainName, status, homeSwitch, ipAddress? }`

---

### 2. Provisioning context provider

File: `ctx/ProvisionCtxProvider.tsx`

Implement `ProvisioningProvider` as a client wrapper that:

- State:
  - `pbxDomain: PbxDomain | null`
  - `isChecking: boolean`
- Functions:
  - `refreshStatus: () => Promise<void>`
    - Calls a server action or `/api/provisioning/status` to re‑fetch the current domain.
    - Updates `pbxDomain` and `isChecking`.
  - `simulateProvisioning: () => void`
    - For demo/dev only:
      - Option 1: use `localStorage` (keys like `pbx_provision_*`) to mock progress and final "ready" state.
      - Option 2: no‑op in production.

Usage:

- Wrap tenant‑scoped pages (e.g. `[slug]/layout.tsx`) with `ProvisioningProvider`.
- On initial mount, call `refreshStatus()` once to load domain state.

Context value:

```ts
const value: ProvisioningContextType = {
  Domain,
  isChecking,
  refreshStatus,
  simulateProvisioning,
};
```

---

### 3. Provisioning status indicator

File: `components/provisioning-status-indicator.tsx`

Behavior:

- Uses `useProvisioning()` to access `pbxDomain` and `isChecking`.
- If `!pbxDomain`: render `null` (no indicator).
- Map `pbxDomain.status` to UI state:
  - `"ready"` → success (CheckCircle icon, "PBX Ready").
  - `"failed"` → error (Alert icon, "Failed").
  - otherwise (`"pending"`, `"provisioning"`, etc.) → in‑progress (spinner, "Provisioning").
- Because the app only sees discrete status values from the DB (not live Cloud Run progress), `getStatusMessage(status)` should map each status to a static, human‑readable message.
- If you expose `getStatusProgress(status)`, it must be a simple, **static mapping** per status (e.g. `pending = 25`, `provisioning = 75`, `ready = 100`) and **not** a real‑time percentage from Cloud Run.
- Tooltip content:
  - Main message from `getStatusMessage`.
  - Progress bar (`Progress`) when in‑progress.
  - Optional extra info:
    - `Domain: pbxDomain.domainName`
    - `IP: pbxDomain.ipAddress`

Sonner integration (shadcn):

- When onboarding completes, call a server action that **waits/polls** for `switchStatus = "ready"` and `homeSwitch != null`.
- Wrap that promise with `toast.promise(...)` so the user sees:
  - loading: "Provisioning your PBX…"
  - success: "PBX is ready"
  - error: "Provisioning failed"
- Inside that promise, periodically call `refreshStatus()` until ready or timeout.

---

### 4. Provisioning button (optional)

File: `components/provisioning-button.tsx`

Purpose: optional control to (re)trigger provisioning in special cases (e.g. after `failed`) or for demos.

Implementation guidance:

- Uses `useProvisioning()` to access `pbxDomain` and `simulateProvisioning`.
- Derive `isProvisioning` from `pbxDomain.status` (not ready/failed).
- Real behavior (production):
  - On click:
    - Call a server action `triggerProvisioning(domainId)`:
      - Publishes a Pub/Sub message to start/redo provisioning for that domain.
      - Optionally sets `switchStatus = "pending"` immediately.
    - Use `toast.promise(triggerProvisioning(...))` to show progress.
- Demo behavior (current code):
  - `simulateProvisioning()` uses `localStorage` and a timer to fake progress.
  - "Reset Demo" clears `pbx_provision_*` keys and reloads.

Usage guidance:

- Provisioning is **automatic** after onboarding via Pub/Sub + Cloud Run.
- Only render the button in:
  - Admin/dev views, or
  - UI for handling `switchStatus = "failed"` (e.g. "Retry provisioning").

---

### 5. Integration contract for LLMs

When implementing code:

- Do **not** move provisioning logic (VM creation) into the Next.js app; always use Pub/Sub + Cloud Run as per `.github/instructions/pub-sub.instructions.md`.
- UI must **only** read/update provisioning state via:
  - DB fields on `pbx_domains` (`homeSwitch`, `switchStatus`, optional `ipAddress`).
  - Server actions / APIs that wrap those DB operations.
- Keep `ProvisioningProvider`, `ProvisioningStatusIndicator`, and `ProvisioningButton` pure UI + fetch/poll logic; no direct GCP API calls from the browser.
