# Architecture Decision: Organization vs Auth Tenant

## The Proposal

Separate **business grouping** from **authentication isolation**:

| Model | Purpose | When Used |
|-------|---------|-----------|
| `organization` | Business grouping (company/team) | **All users, all tiers** |
| `auth_tenant` | Firebase authentication isolation | **Tier 3 only** |

---

## Current Problem

```
auth_tenant is doing TWO jobs:
├── Business grouping (who works together)
└── Auth isolation (Firebase tenant)

But Firebase has NO tenant isolation for Tier 1-2!
This creates confusion.
```

---

## Proposed Solution

### Visual Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE AUTH                                │
├─────────────────────────────────────────────────────────────────┤
│  DEFAULT POOL (tenantId = null)    │    ISOLATED TENANT          │
│  ├── alice@acme.com                │    (tenantId = "enterprise1")│
│  ├── bob@acme.com                  │    ├── cto@bigcorp.com       │
│  ├── carol@startup.io              │    └── admin@bigcorp.com     │
│  └── dave@freelance.com            │                              │
│                                    │                              │
│  Tier 1-2 users                    │    Tier 3 users              │
└─────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OUR DATABASE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  auth_tenant: "default"           │  auth_tenant: "enterprise1"  │
│  (maps to Firebase null)          │  (maps to Firebase tenant)   │
│                                   │                              │
│  organization: "acme"             │  organization: "bigcorp"     │
│  ├── alice@acme.com               │  ├── cto@bigcorp.com         │
│  └── bob@acme.com                 │  └── admin@bigcorp.com       │
│                                   │                              │
│  organization: "startup"          │                              │
│  └── carol@startup.io             │                              │
│                                   │                              │
│  organization: "freelance"        │                              │
│  └── dave@freelance.com           │                              │
│                                   │                              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Insight

```
auth_tenant  = WHERE you authenticate (Firebase pool)
organization = WHO you work with (business grouping)

These are INDEPENDENT concepts!
```

---

## Database Schema Changes

### NEW: organization model

```prisma
model organization {
  id          String        @id @default(uuid()) @db.VarChar(50)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  name        String        @unique @db.VarChar(100)
  slug        String        @unique @db.VarChar(100)  // url-friendly: acme-corp
  displayName String?       @db.VarChar(200)          // Acme Corporation
  logo        String?       @db.VarChar(255)
  plan        String        @default("basic") @db.VarChar(20)
  maxUsers    Int           @default(5)
  disabled    Boolean       @default(false)
  
  // Relations
  users       auth_user[]
  pbxDomains  pbx_domains[]
}
```

### SIMPLIFIED: auth_tenant model

```prisma
model auth_tenant {
  id                String      @id @db.VarChar(50)  // "default" or Firebase tenantId
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  name              String      @unique @db.VarChar(100)
  description       String?     @db.VarChar(500)
  firebaseTenantId  String?     @unique @db.VarChar(50)  // null = default pool
  
  users             auth_user[]
}
```

### MODIFIED: auth_user model

```prisma
model auth_user {
  uid           String    @id @unique @db.VarChar(50)
  email         String    @unique @db.VarChar(255)
  // ... other fields
  
  // TWO separate foreign keys
  tenantId      String    @db.VarChar(50)  // Firebase isolation (usually "default")
  orgId         String    @db.VarChar(50)  // Business grouping
  
  auth_tenant   auth_tenant   @relation(fields: [tenantId], references: [id])
  organization  organization  @relation(fields: [orgId], references: [id])
}
```

---

## Firebase Custom Claims

### Current (no org info)
```json
{
  "uid": "abc123",
  "email": "alice@acme.com"
}
```

### Proposed (with org_id)
```json
{
  "uid": "abc123",
  "email": "alice@acme.com",
  "org_id": "acme-org-uuid",
  "org_role": "admin",
  "plan": "professional"
}
```

### Benefits of org_id in claims:
1. **No DB call** for basic authorization
2. **Frontend knows org** immediately after auth
3. **API routes** can validate org without querying
4. **RLS policies** can use org_id from JWT

---

## Tier Upgrade Flow (Tier 2 → Tier 3)

```
BEFORE UPGRADE:
├── Firebase: tenantId = null (default pool)
├── auth_tenant: "default"
└── organization: "acme" (orgId stays same!)

UPGRADE PROCESS:
1. Create Firebase tenant → returns "firebase-tenant-xyz"
2. Create auth_tenant record: id="firebase-tenant-xyz"
3. Update auth_user: tenantId = "firebase-tenant-xyz"
4. Migrate user in Firebase to new tenant

AFTER UPGRADE:
├── Firebase: tenantId = "firebase-tenant-xyz"
├── auth_tenant: "firebase-tenant-xyz"
└── organization: "acme" (UNCHANGED!)

Key Point: orgId NEVER changes during upgrade!
           All PBX data stays connected via orgId.
```

---

## Data Isolation: Why orgId, Not tenantId

| Scenario | tenantId | orgId | RLS filter by |
|----------|----------|-------|---------------|
| Tier 1 Acme user | "default" | "acme" | orgId ✓ |
| Tier 1 Startup user | "default" | "startup" | orgId ✓ |
| Tier 3 BigCorp user | "bigcorp-firebase" | "bigcorp" | orgId ✓ |

**All PBX data is filtered by `orgId`, never by `tenantId`.**

```sql
-- RLS Policy (conceptual)
CREATE POLICY "org_isolation"
ON pbx_domains
USING (org_id = current_setting('app.current_org_id')::uuid);
```

---

## Updated Relationships

```
┌─────────────────┐         ┌─────────────────┐
│   auth_tenant   │         │  organization   │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ name            │         │ name            │
│ firebaseTenantId│         │ slug            │
│ (null=default)  │         │ plan, maxUsers  │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │    ┌──────────────────────┘
         │    │
         ▼    ▼
    ┌─────────────────┐
    │    auth_user    │
    ├─────────────────┤
    │ uid (PK)        │
    │ email           │
    │ tenantId (FK)───┼──→ auth_tenant.id   (WHERE you auth)
    │ orgId (FK)──────┼──→ organization.id  (WHO you work with)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   pbx_domains   │
    ├─────────────────┤
    │ id (PK)         │
    │ orgId (FK)──────┼──→ organization.id  ← Changed!
    └────────┬────────┘
             │
             ▼
        (pbx_users, pbx_extensions, etc.)
```

---

## Complete Flow Example

### Sign-Up (New Organization)

```
1. User signs up in Firebase (default pool, tenantId=null)
2. App creates:
   ├── organization { id: "org-123", name: "Acme Corp", slug: "acme" }
   └── auth_user { uid: "user-abc", orgId: "org-123", tenantId: "default" }
3. Set Firebase claims: { org_id: "org-123", org_role: "admin" }
4. Redirect to onboarding → create pbx_domains with orgId
```

### Sign-In (Existing User)

```
1. Firebase authenticates → returns { uid, claims: { org_id: "org-123" } }
2. Frontend reads org_id from claims immediately
3. No DB query needed for basic org context
4. Dashboard loads, API uses org_id for RLS
```

### Invite User (Same Organization)

```
1. Admin creates invite for bob@acme.com with orgId: "org-123"
2. Bob signs up in Firebase (same default pool)
3. App creates auth_user { uid: "bob-xyz", orgId: "org-123", tenantId: "default" }
4. Set claims: { org_id: "org-123", org_role: "member" }
5. Bob sees same org data as Alice (filtered by orgId)
```

### Upgrade to Tier 3

```
1. Admin requests upgrade
2. Create Firebase tenant → "firebase-acme-tenant"
3. Create auth_tenant { id: "firebase-acme-tenant", firebaseTenantId: "..." }
4. Migrate users in Firebase to new tenant
5. Update auth_user records: tenantId = "firebase-acme-tenant"
6. organization stays unchanged!
7. All PBX data still accessible (same orgId)
```

---

## Summary: Clean Separation

| Concept | Model | Firebase | Purpose |
|---------|-------|----------|---------|
| Auth Pool | `auth_tenant` | tenantId | WHERE users authenticate |
| Business Group | `organization` | claims.org_id | WHO works together |
| Data Isolation | RLS on `orgId` | - | WHAT data users see |

### Benefits

1. ✅ **No confusion**: tenant = auth, org = business
2. ✅ **Easy upgrades**: Change tenantId, keep orgId
3. ✅ **Fast auth**: org_id in claims, no DB call
4. ✅ **Clean RLS**: Always filter by orgId
5. ✅ **Firebase alignment**: Default pool is explicit

---

## Decision

**✅ ADOPT this architecture**

Proceed with:
1. Create `organization` model
2. Add default `auth_tenant` record  
3. Add `orgId` to `auth_user`
4. Migrate existing data
5. Implement claims on sign-in
6. Update all queries to use orgId

