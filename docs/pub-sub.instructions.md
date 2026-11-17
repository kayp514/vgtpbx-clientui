

## Pub/Sub + VM Provisioning Pattern

Goal: For each new pbx_domain (tenant), automatically provision a dedicated FreeSWITCH VM on GCE and store its identity in pbx_domains.

### 1. App side (Next.js / completeOnboarding)

- In completeOnboarding:
	- Create pbx_domains, subscription, pbx_users in a DB transaction.
	- After commit, publish a Pub/Sub message to a topic, e.g. `switch-provisioning`.
- Pub/Sub message payload (JSON):
	- `{ domainId: string, slug: string, tenantId: string }`.

### 2. Provisioning service (Cloud Run)

- Implement a Cloud Run service in TypeScript/Node:
	- Trigger: Pub/Sub subscription on `switch-provisioning`.
	- Auth: service account with `compute.instances.create`, `compute.instances.start/stop`.
	- DB: use the same Postgres PBX DB via Prisma client.
- On message receive:
	1. Parse `{ domainId, slug, tenantId }`.
	2. Call GCE API `instances.insert` using a predefined instance template that runs the `vgtpbx-switch` Docker image (e2-micro by default).
	3. Pass env/metadata to the VM:
		 - `DOMAIN_UUID = pbx_domains.id`
		 - `PBX_DB_URL = <connection string>`
		 - Any other required config (region, logging, etc.).
	4. After the instance is successfully created (optionally wait until RUNNING):
		 - `UPDATE pbx_domains SET homeSwitch = <instanceName>, switchStatus = 'provisioned', switchZone = <zone> WHERE id = domainId`.

### 3. UI behavior

- After completeOnboarding resolves successfully:
	- Redirect the user to `/{slug}/dashboard`.
	- Dashboard should read pbx_domains.switchStatus:
		- If not `provisioned`, show a “Provisioning your switch…” state and poll or revalidate until ready.
		- Once `provisioned`, normal PBX UI is enabled.

### 4. Notes for implementers (LLM)

- Do not block completeOnboarding on the VM creation; always enqueue and return quickly.
- Keep all provisioning logic in the Cloud Run service; Next.js only publishes Pub/Sub messages.
- Always treat pbx_domains as the single source of truth for switch identity and status.