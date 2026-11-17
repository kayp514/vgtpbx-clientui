# Cloud PBX System Architecture & Firebase Auth Integration

## Overview

This document explains the architecture of the SaaS Cloud PBX system built on top of FreeSWITCH, integrated with Firebase Authentication (via Ternsecure) as the external identity provider. The system is designed for multi-tenancy with flexible isolation options.

---

## Table of Contents

1. [Ternsecure Auth Implementation](#ternsecure-auth-implementation)
2. [System Architecture Overview](#system-architecture-overview)
3. [Core Data Models](#core-data-models)
4. [Authentication & Multi-Tenancy Flow](#authentication--multi-tenancy-flow)
5. [User Onboarding Flow](#user-onboarding-flow)
6. [User Synchronization Strategy](#user-synchronization-strategy)
7. [Tenant Isolation Modes](#tenant-isolation-modes)
8. [Entity Relationship Diagrams](#entity-relationship-diagrams)
9. [Implementation Guidelines](#implementation-guidelines)

---

## Ternsecure Auth Implementation

### Environment Configuration

The external auth system (Ternsecure, built on Firebase) uses environment variables to control redirect behavior:

```bash
# .env.local

# After sign-in, redirect to /verify to check PBX access
NEXT_PUBLIC_SIGN_IN_FORCE_REDIRECT_URL=/verify

# After sign-up, redirect to /onboarding to complete company setup
NEXT_PUBLIC_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
```

### Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    TERNSECURE AUTH FLOW                                       │
└──────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   Entry Point   │
                         │  /sign-in or    │
                         │  /sign-up       │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐        ┌─────────────────┐
           │    SIGN-IN      │        │    SIGN-UP      │
           │  (Existing User)│        │   (New User)    │
           └────────┬────────┘        └────────┬────────┘
                    │                          │
                    │ Ternsecure creates       │ Ternsecure creates
                    │ session cookie           │ session cookie
                    │                          │
                    ▼                          ▼
           ┌─────────────────┐        ┌─────────────────┐
           │    /verify      │        │   /onboarding   │
           │                 │        │                 │
           │ verifyAuthPbx   │        │ completeOnboard │
           │ User()          │        │ ing()           │
           └────────┬────────┘        └────────┬────────┘
                    │                          │
         ┌──────────┴──────────┐               │
         │                     │               │
         ▼                     ▼               │
    ┌─────────┐        ┌─────────────┐         │
    │ Success │        │ Needs       │         │
    │         │        │ Onboarding  │         │
    └────┬────┘        └──────┬──────┘         │
         │                    │                │
         │                    └────────────────┼───┐
         │                                     │   │
         ▼                                     ▼   ▼
    ┌─────────────────┐               ┌─────────────────┐
    │   /dashboard    │◄──────────────│   Complete      │
    │   (Protected)   │               │   Onboarding    │
    └─────────────────┘               └─────────────────┘
```

### Route Structure

```
app/
├── sign-in/
│   └── [[...sign-in]]/
│       └── page.tsx          # Ternsecure <SignIn /> component
├── sign-up/
│   └── [[...sign-up]]/
│       └── page.tsx          # Ternsecure <SignUp /> component
├── verify/
│   └── page.tsx              # PBX access verification (after sign-in)
├── onboarding/
│   └── page.tsx              # Company setup wizard (after sign-up)
└── dashboard/
    └── ...                   # Protected routes
```

### Key Server Actions

```typescript
// app/actions.ts

// Called after sign-in to verify PBX access
export async function verifyAuthPbxUser(
  uid: string,
  tenantId: string
): Promise<VerifyResult> {
  // Returns:
  // - success: true/false
  // - needsOnboarding: true if user exists but no domain setup
  // - data: auth + pbx user details
  // - error: if access denied
}

// Called during onboarding to complete company setup
export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  // Creates:
  // - auth_tenant (company)
  // - pbx_domains (PBX instance)
  // - Links pbx_users to domain
}
```

### Verification Flow (/verify)

The `/verify` page acts as an intermediary between authentication and the dashboard:

```typescript
// Simplified verification logic
const result = await verifyAuthPbxUser(user.uid, user.tenantId);

if (!result.success) {
  if (result.needsOnboarding) {
    // New user without PBX setup -> redirect to onboarding
    router.replace("/onboarding");
  } else {
    // Access denied (disabled, etc.)
    showError(result.error);
  }
  return;
}

if (result.needsOnboarding) {
  // Existing auth user but no domain -> redirect to onboarding
  router.replace("/onboarding");
  return;
}

// Full access granted
router.replace("/dashboard");
```

### Why Separate Auth and PBX Verification?

1. **External Auth System**: Ternsecure/Firebase handles authentication independently
2. **PBX Access Control**: Not every authenticated user should access PBX features
3. **Onboarding Required**: New sign-ups need to complete company/domain setup
4. **Multi-tenant Isolation**: Verify user belongs to correct tenant before PBX access

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATION                                 │
│                    (Next.js SaaS Dashboard)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     FIREBASE AUTHENTICATION                          │    │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │    │
│  │  │  Default Pool   │    │   Tenant A      │    │   Tenant B      │  │    │
│  │  │  (Shared Users) │    │  (Isolated)     │    │  (Isolated)     │  │    │
│  │  │                 │    │                 │    │                 │  │    │
│  │  │ user1@email.com │    │ admin@compA.com │    │ admin@compB.com │  │    │
│  │  │ user2@email.com │    │ staff@compA.com │    │ staff@compB.com │  │    │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION DATABASE                                 │
│                            (PostgreSQL)                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    AUTH LAYER (Prisma Schema)                         │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐           │   │
│  │  │ auth_tenant │◄───│  auth_user  │───►│ auth_permission │           │   │
│  │  │             │    │   (uid=     │    │                 │           │   │
│  │  │ id (matches │    │   Firebase  │    │                 │           │   │
│  │  │  Firebase   │    │   UID)      │    │                 │           │   │
│  │  │  tenantId)  │    └─────────────┘    └─────────────────┘           │   │
│  │  └─────────────┘           │                                          │   │
│  │                            │ 1:1                                      │   │
│  │                            ▼                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────┐    │   │
│  │  │                    PBX LAYER                                  │    │   │
│  │  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐   │    │   │
│  │  │  │ pbx_domains │◄───│  pbx_users  │───►│ pbx_extensions  │   │    │   │
│  │  │  │             │    │             │    │                 │   │    │   │
│  │  │  │(tenantId FK)│    │(auth_user_id│    │ (SIP/VoIP)      │   │    │   │
│  │  │  └─────────────┘    │ FK)         │    └─────────────────┘   │    │   │
│  │  │                     └─────────────┘                          │    │   │
│  │  └──────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FREESWITCH PBX ENGINE                                │
│                    (SIP Trunks, Dialplans, IVR, etc.)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Data Models

### Authentication Layer

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `auth_tenant` | Represents a company/organization subscription | `id` (matches Firebase tenant ID), `name`, `domain`, `plan`, `maxUsers` |
| `auth_user` | User identity synced with Firebase | `uid` (Firebase UID), `email`, `tenantId`, `isAdmin`, `isSuperuser` |
| `auth_group` | Role-based access control groups | `name` |
| `auth_permission` | Granular permissions | `codename` |

### PBX Layer

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `pbx_domains` | PBX domain/context (maps to tenant) | `id`, `name`, `tenantId`, `portalName` |
| `pbx_users` | PBX-specific user profile | `user_uuid`, `auth_user_id` (FK to auth_user), `domainId` |
| `pbx_extensions` | SIP extensions/phone lines | `extension`, `password`, `domain_uuid` |
| `pbx_gateways` | SIP trunk connections | `gateway`, `proxy`, `domain_uuid` |

### Key Relationships

```
auth_tenant (1) ─────► (N) auth_user
     │
     │ 1:N
     ▼
pbx_domains (1) ─────► (N) pbx_users
                            │
                            │ 1:1
                            ▼
                       auth_user

pbx_users (1) ─────► (N) pbx_extension_users ◄───── (1) pbx_extensions
```

---

## Authentication & Multi-Tenancy Flow

### Sign-In Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SIGN-IN FLOW                                        │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐          ┌──────────────┐         ┌─────────────┐
    │  User   │          │  Client App  │         │  Firebase   │
    └────┬────┘          └──────┬───────┘         └──────┬──────┘
         │                      │                        │
         │  1. Enter email/pwd  │                        │
         │─────────────────────►│                        │
         │                      │                        │
         │                      │  2. Determine tenant   │
         │                      │     (from URL/domain)  │
         │                      │                        │
         │                      ├───── If Isolated ──────┤
         │                      │                        │
         │                      │  3a. signInWithTenant  │
         │                      │      (tenantId)        │
         │                      │───────────────────────►│
         │                      │                        │
         │                      ├───── If Shared ────────┤
         │                      │                        │
         │                      │  3b. signInWithEmail   │
         │                      │      (default pool)    │
         │                      │───────────────────────►│
         │                      │                        │
         │                      │  4. Return ID Token    │
         │                      │◄───────────────────────│
         │                      │                        │
    ┌────┴────┐          ┌──────┴───────┐         ┌──────┴──────┐
    │  User   │          │  Client App  │         │   Backend   │
    └────┬────┘          └──────┬───────┘         └──────┬──────┘
         │                      │                        │
         │                      │  5. Verify Token       │
         │                      │───────────────────────►│
         │                      │                        │
         │                      │  6. Fetch auth_user    │
         │                      │     + pbx_user         │
         │                      │◄───────────────────────│
         │                      │                        │
         │  7. Dashboard loaded │                        │
         │◄─────────────────────│                        │
         │                      │                        │
```

### Tenant Resolution Logic

```typescript
// Pseudo-code for tenant resolution
async function resolveSignInMethod(email: string, subdomain?: string) {
  // Option 1: Subdomain-based isolation
  if (subdomain) {
    const tenant = await db.auth_tenant.findUnique({
      where: { domain: subdomain }
    });
    
    if (tenant && tenant.id !== 'default') {
      // This company uses isolated Firebase tenant
      return {
        method: 'tenant',
        tenantId: tenant.id,
        signInUrl: `https://${subdomain}.app.cloudpbx.com/sign-in`
      };
    }
  }
  
  // Option 2: Email domain lookup
  const emailDomain = email.split('@')[1];
  const tenant = await db.auth_tenant.findFirst({
    where: { domain: emailDomain }
  });
  
  if (tenant && tenant.id !== 'default') {
    return {
      method: 'tenant',
      tenantId: tenant.id
    };
  }
  
  // Default: Shared container
  return {
    method: 'default',
    tenantId: null
  };
}
```

---

## User Onboarding Flow

### After Sign-Up: Owner Onboarding

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      NEW OWNER ONBOARDING FLOW                                │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sign-Up   │───►│ After-Signup│───►│Create Tenant│───►│ Create PBX  │
│   (Firebase)│    │    Page     │    │  & Domain   │    │   Domain    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                                      │
                          ▼                                      ▼
                   ┌─────────────┐                       ┌─────────────┐
                   │ Collect:    │                       │ Auto-Create:│
                   │ - Company   │                       │ - pbx_domain│
                   │   name      │                       │ - pbx_user  │
                   │ - Plan type │                       │   (owner)   │
                   │ - Domain    │                       │ - Default   │
                   │   preference│                       │   settings  │
                   └─────────────┘                       └─────────────┘

                                      │
                                      ▼
                              ┌─────────────────┐
                              │   DASHBOARD     │
                              │  (Ready to use) │
                              │                 │
                              │ - Add Users     │
                              │ - Configure PBX │
                              │ - Setup Trunks  │
                              └─────────────────┘
```

### Step-by-Step Onboarding Process

```typescript
// 1. After Firebase sign-up webhook or client callback
async function handleAfterSignup(firebaseUser: FirebaseUser) {
  
  // 2. Create auth_tenant (or use existing for shared mode)
  const tenant = await db.auth_tenant.create({
    data: {
      id: generateTenantId(), // Could match Firebase tenant if isolated
      name: companyName,
      domain: companyDomain,
      plan: selectedPlan,
      maxUsers: planLimits[selectedPlan]
    }
  });
  
  // 3. Create auth_user
  const authUser = await db.auth_user.create({
    data: {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      tenantId: tenant.id,
      isAdmin: true,      // First user is admin
      isSuperuser: false,
      emailVerified: firebaseUser.emailVerified
    }
  });
  
  // 4. Create pbx_domains
  const pbxDomain = await db.pbx_domains.create({
    data: {
      id: generateUuid(),
      name: `${companyDomain}.pbx.local`,
      tenantId: tenant.id,
      portalName: companyDomain,
      disabled: false
    }
  });
  
  // 5. Create pbx_users (links auth_user to PBX)
  const pbxUser = await db.pbx_users.create({
    data: {
      user_uuid: generateUuid(),
      username: firebaseUser.email,
      email: firebaseUser.email,
      auth_user_id: authUser.uid,
      domainId: pbxDomain.id,
      status: 'active',
      disabled: false
    }
  });
  
  // 6. Create default extension for owner
  await createDefaultExtension(pbxDomain.id, pbxUser.user_uuid);
  
  return { tenant, authUser, pbxDomain, pbxUser };
}
```

---

## User Synchronization Strategy

### Firebase ↔ Database Sync Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    USER SYNCHRONIZATION STRATEGIES                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     STRATEGY 1: REAL-TIME SYNC                               │
│                    (Firebase Admin SDK + Webhooks)                           │
│                                                                              │
│   ┌─────────────┐         ┌──────────────┐         ┌─────────────┐          │
│   │  Firebase   │  Event  │   Firebase   │  HTTP   │  Backend    │          │
│   │  Auth       │────────►│   Functions  │────────►│  API        │          │
│   │             │         │  (Webhook)   │         │             │          │
│   └─────────────┘         └──────────────┘         └──────────────┘          │
│                                                           │                  │
│   Events:                                                 ▼                  │
│   - user.created                              ┌─────────────────┐            │
│   - user.deleted                              │  Sync Handler   │            │
│   - user.updated                              │  - auth_user    │            │
│                                               │  - pbx_users    │            │
│                                               └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     STRATEGY 2: ON-DEMAND SYNC                               │
│                    (Lazy sync on first login)                                │
│                                                                              │
│   ┌─────────────┐         ┌──────────────┐         ┌─────────────┐          │
│   │   Client    │  Token  │   Backend    │  Check  │  Database   │          │
│   │   (Login)   │────────►│   Verify     │────────►│  Exists?    │          │
│   └─────────────┘         └──────────────┘         └─────────────┘          │
│                                  │                        │                  │
│                                  │ No record found        │                  │
│                                  ▼                        ▼                  │
│                           ┌──────────────┐         ┌─────────────┐          │
│                           │ Fetch from   │────────►│ Create      │          │
│                           │ Firebase     │         │ auth_user + │          │
│                           │ Admin SDK    │         │ pbx_users   │          │
│                           └──────────────┘         └─────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     STRATEGY 3: BATCH SYNC                                   │
│                    (Scheduled reconciliation)                                │
│                                                                              │
│   ┌─────────────┐         ┌──────────────┐         ┌─────────────┐          │
│   │  Cron Job   │  List   │   Firebase   │ Compare │  Database   │          │
│   │  (Daily)    │────────►│   All Users  │────────►│  auth_user  │          │
│   └─────────────┘         └──────────────┘         └─────────────┘          │
│                                                           │                  │
│                                           ┌───────────────┼───────────────┐  │
│                                           ▼               ▼               ▼  │
│                                       ┌───────┐     ┌───────┐      ┌───────┐│
│                                       │Create │     │Update │      │Disable││
│                                       │Missing│     │Changed│      │Removed││
│                                       └───────┘     └───────┘      └───────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sync Implementation Code

```typescript
// Real-time sync handler (Firebase Cloud Function)
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  // Determine tenant from custom claims or email domain
  const tenantId = user.customClaims?.tenantId || 'default';
  
  await fetch(`${BACKEND_URL}/api/sync/user`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create',
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      tenantId: tenantId
    })
  });
});

// Backend sync handler
async function syncUserFromFirebase(data: SyncUserRequest) {
  const { action, uid, email, tenantId } = data;
  
  switch (action) {
    case 'create':
      // Check if user already exists
      const existing = await db.auth_user.findUnique({ where: { uid } });
      if (existing) return;
      
      // Find the tenant
      const tenant = await db.auth_tenant.findUnique({
        where: { id: tenantId }
      });
      
      if (!tenant) throw new Error('Tenant not found');
      
      // Create auth_user
      const authUser = await db.auth_user.create({
        data: {
          uid,
          email,
          tenantId,
          isAdmin: false,
          isSuperuser: false
        }
      });
      
      // Find the PBX domain for this tenant
      const pbxDomain = await db.pbx_domains.findFirst({
        where: { tenantId }
      });
      
      if (pbxDomain) {
        // Create pbx_users
        await db.pbx_users.create({
          data: {
            user_uuid: generateUuid(),
            username: email,
            email,
            auth_user_id: uid,
            domainId: pbxDomain.id,
            status: 'active'
          }
        });
      }
      break;
      
    case 'delete':
      // Soft delete - disable users
      await db.auth_user.update({
        where: { uid },
        data: { disabled: true }
      });
      await db.pbx_users.updateMany({
        where: { auth_user_id: uid },
        data: { disabled: true }
      });
      break;
  }
}
```

---

## Tenant Isolation Modes

### Mode 1: Shared Container (Default)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    MODE 1: SHARED FIREBASE CONTAINER                          │
│                    (All users in one Firebase project)                        │
└──────────────────────────────────────────────────────────────────────────────┘

FIREBASE PROJECT (cloudpbx-prod)
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEFAULT USER POOL                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ user1@      │  │ admin@      │  │ user@       │  │ owner@      │         │
│  │ compA.com   │  │ compB.com   │  │ compC.com   │  │ compD.com   │         │
│  │             │  │             │  │             │  │             │         │
│  │ tenantId:   │  │ tenantId:   │  │ tenantId:   │  │ tenantId:   │         │
│  │ tenant_A    │  │ tenant_B    │  │ tenant_C    │  │ tenant_D    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ auth_tenant │ │ auth_tenant │ │ auth_tenant │
            │ id:tenant_A │ │ id:tenant_B │ │ id:tenant_C │
            └─────────────┘ └─────────────┘ └─────────────┘

CHARACTERISTICS:
✓ Single sign-in endpoint for all users
✓ Simple setup and management
✓ Lower cost (single Firebase project)
✓ Tenant isolation via custom claims + database FK

SIGN-IN URL: https://app.cloudpbx.com/sign-in
```

### Mode 2: Isolated Tenants (Enterprise)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    MODE 2: ISOLATED FIREBASE TENANTS                          │
│                    (Separate identity pools per company)                      │
└──────────────────────────────────────────────────────────────────────────────┘

FIREBASE PROJECT (cloudpbx-prod) with Identity Platform
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐   │
│   │   TENANT: compA   │    │   TENANT: compB   │    │   DEFAULT POOL    │   │
│   │   (Isolated)      │    │   (Isolated)      │    │   (Shared users)  │   │
│   │                   │    │                   │    │                   │   │
│   │ ┌───────────────┐ │    │ ┌───────────────┐ │    │ ┌───────────────┐ │   │
│   │ │admin@compA.com│ │    │ │admin@compB.com│ │    │ │user@random.com│ │   │
│   │ │staff@compA.com│ │    │ │staff@compB.com│ │    │ │test@gmail.com │ │   │
│   │ └───────────────┘ │    │ └───────────────┘ │    │ └───────────────┘ │   │
│   │                   │    │                   │    │                   │   │
│   │ Firebase Tenant   │    │ Firebase Tenant   │    │   No tenant ID    │   │
│   │ ID: compA-xyz123  │    │ ID: compB-abc456  │    │                   │   │
│   └───────────────────┘    └───────────────────┘    └───────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

         │                           │                           │
         ▼                           ▼                           ▼
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │   auth_tenant   │       │   auth_tenant   │       │   auth_tenant   │
  │ id: compA-xyz123│       │ id: compB-abc456│       │ id: default     │
  │ (matches FB)    │       │ (matches FB)    │       │                 │
  └─────────────────┘       └─────────────────┘       └─────────────────┘

SIGN-IN ENDPOINTS:
• Company A: https://compa.cloudpbx.com/sign-in  (Tenant: compA-xyz123)
• Company B: https://compb.cloudpbx.com/sign-in  (Tenant: compB-abc456)
• Shared:    https://app.cloudpbx.com/sign-in    (Default pool)

CHARACTERISTICS:
✓ Complete user isolation at Firebase level
✓ Custom branding per tenant
✓ Separate SSO/IdP configuration possible
✓ Enhanced security for enterprise clients
✓ Users cannot exist in multiple tenants
```

### Migration: Shared → Isolated

```typescript
// Migrate a company from shared pool to isolated tenant
async function migrateToIsolatedTenant(tenantId: string) {
  // 1. Create Firebase tenant
  const firebaseTenant = await admin.auth().tenantManager().createTenant({
    displayName: `Tenant ${tenantId}`,
    emailSignInConfig: {
      enabled: true,
      passwordRequired: true
    }
  });
  
  // 2. Get all users for this tenant
  const users = await db.auth_user.findMany({
    where: { tenantId }
  });
  
  // 3. For each user, migrate to Firebase tenant
  for (const user of users) {
    // Get user from default pool
    const firebaseUser = await admin.auth().getUser(user.uid);
    
    // Create in tenant
    const tenantAuth = admin.auth().tenantManager()
      .authForTenant(firebaseTenant.tenantId);
    
    const newUser = await tenantAuth.createUser({
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      password: generateTemporaryPassword() // User will reset
    });
    
    // Update database with new UID
    await db.auth_user.update({
      where: { uid: user.uid },
      data: { 
        uid: newUser.uid,
        // Note: You may want to keep old UID for reference
      }
    });
    
    // Update pbx_users
    await db.pbx_users.updateMany({
      where: { auth_user_id: user.uid },
      data: { auth_user_id: newUser.uid }
    });
    
    // Delete from default pool (after verification)
    await admin.auth().deleteUser(user.uid);
  }
  
  // 4. Update tenant to use Firebase tenant ID
  await db.auth_tenant.update({
    where: { id: tenantId },
    data: { 
      id: firebaseTenant.tenantId,
      // Mark as isolated
    }
  });
  
  // 5. Send password reset emails
  for (const user of users) {
    await sendPasswordResetEmail(user.email, firebaseTenant.tenantId);
  }
}
```

---

## Entity Relationship Diagrams

### Complete System ERD

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE SYSTEM ERD                                   │
└──────────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │   auth_tenant   │
                            ├─────────────────┤
                            │ id (PK)         │◄─────────────────────────┐
                            │ name            │                          │
                            │ domain          │                          │
                            │ plan            │                          │
                            │ maxUsers        │                          │
                            │ disabled        │                          │
                            └────────┬────────┘                          │
                                     │                                   │
                     ┌───────────────┴───────────────┐                   │
                     │ 1:N                           │ 1:N               │
                     ▼                               ▼                   │
           ┌─────────────────┐             ┌─────────────────┐           │
           │   auth_user     │             │   pbx_domains   │           │
           ├─────────────────┤             ├─────────────────┤           │
           │ uid (PK)        │◄────┐       │ id (PK)         │           │
           │ email           │     │       │ name            │           │
           │ tenantId (FK)───┼─────┼───────┤ tenantId (FK)───┼───────────┘
           │ isAdmin         │     │       │ portalName      │
           │ isSuperuser     │     │       │ disabled        │
           │ disabled        │     │       └────────┬────────┘
           └────────┬────────┘     │                │
                    │              │                │ 1:N
                    │ 1:1          │                ▼
                    │              │      ┌─────────────────┐
                    │              │      │   pbx_users     │
                    │              │      ├─────────────────┤
                    │              │      │ id (PK)         │
                    │              └──────┤ auth_user_id(FK)│
                    │                     │ domainId (FK)───┼──────┐
                    │                     │ user_uuid       │      │
                    │                     │ username        │      │
                    │                     │ status          │      │
                    │                     └────────┬────────┘      │
                    │                              │               │
                    │              ┌───────────────┼───────┐       │
                    │              │               │       │       │
                    ▼              ▼               ▼       ▼       │
           ┌─────────────┐ ┌───────────────┐ ┌─────────┐ ┌───┐     │
           │auth_user_   │ │pbx_extension_ │ │pbx_ring_│ │...│     │
           │groups       │ │users          │ │group_   │ └───┘     │
           └─────────────┘ └───────┬───────┘ │users    │           │
                                   │         └─────────┘           │
                                   ▼                               │
                          ┌─────────────────┐                      │
                          │ pbx_extensions  │◄─────────────────────┘
                          ├─────────────────┤        (via domain_uuid)
                          │ id (PK)         │
                          │ extension       │
                          │ password        │
                          │ domain_uuid(FK) │
                          │ SIP settings... │
                          └─────────────────┘
```

### Owner Adding New Users Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    OWNER ADDING NEW USERS FLOW                                │
└──────────────────────────────────────────────────────────────────────────────┘

    Owner                    Dashboard                   Backend                Firebase
      │                          │                          │                      │
      │  1. Click "Add User"     │                          │                      │
      │─────────────────────────►│                          │                      │
      │                          │                          │                      │
      │  2. Fill user details    │                          │                      │
      │     - email              │                          │                      │
      │     - name               │                          │                      │
      │     - role               │                          │                      │
      │     - extension #        │                          │                      │
      │─────────────────────────►│                          │                      │
      │                          │                          │                      │
      │                          │  3. POST /api/users      │                      │
      │                          │─────────────────────────►│                      │
      │                          │                          │                      │
      │                          │                          │  4. Create Firebase  │
      │                          │                          │     user (with tenant)
      │                          │                          │─────────────────────►│
      │                          │                          │                      │
      │                          │                          │◄─────────────────────│
      │                          │                          │  5. Return UID       │
      │                          │                          │                      │
      │                          │                          │  6. Create auth_user │
      │                          │                          │     with UID         │
      │                          │                          │         │            │
      │                          │                          │         ▼            │
      │                          │                          │  7. Create pbx_users │
      │                          │                          │         │            │
      │                          │                          │         ▼            │
      │                          │                          │  8. Create extension │
      │                          │                          │         │            │
      │                          │                          │         ▼            │
      │                          │                          │  9. Link extension   │
      │                          │                          │     to pbx_user      │
      │                          │                          │                      │
      │                          │◄─────────────────────────│                      │
      │                          │  10. Return success      │                      │
      │                          │                          │                      │
      │◄─────────────────────────│                          │                      │
      │  11. Show confirmation   │                          │                      │
      │      + send invite email │                          │                      │
      │                          │                          │                      │
```

---

## Implementation Guidelines

### 1. Sign-In Entry Points

For **shared mode** (single entry):
```typescript
// pages/sign-in/page.tsx
const auth = getAuth(firebaseApp);
await signInWithEmailAndPassword(auth, email, password);
```

For **isolated mode** (tenant-specific entry):
```typescript
// pages/[tenant]/sign-in/page.tsx
const auth = getAuth(firebaseApp);
auth.tenantId = tenantId; // Set before sign-in
await signInWithEmailAndPassword(auth, email, password);
```

### 2. Token Verification Middleware

```typescript
// middleware/auth.ts
async function verifyToken(req: Request) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  const decoded = await admin.auth().verifyIdToken(token);
  
  // Get user from database
  const authUser = await db.auth_user.findUnique({
    where: { uid: decoded.uid },
    include: {
      auth_tenant: true,
      pbx_users: {
        include: { pbx_domains: true }
      }
    }
  });
  
  if (!authUser) {
    throw new Error('User not found in database');
  }
  
  // Verify tenant matches if using isolated tenants
  if (decoded.firebase?.tenant && decoded.firebase.tenant !== authUser.tenantId) {
    throw new Error('Tenant mismatch');
  }
  
  return authUser;
}
```

### 3. User Creation API

```typescript
// app/api/users/route.ts
export async function POST(req: Request) {
  const session = await getServerSession();
  const owner = await verifyToken(session);
  
  // Verify owner has permission
  if (!owner.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { email, displayName, role, extensionNumber } = await req.json();
  
  // Check user limit
  const userCount = await db.auth_user.count({
    where: { tenantId: owner.tenantId }
  });
  
  if (userCount >= owner.auth_tenant.maxUsers) {
    return Response.json({ error: 'User limit reached' }, { status: 400 });
  }
  
  // Create in Firebase (with tenant if isolated)
  let auth = admin.auth();
  if (owner.auth_tenant.id !== 'default') {
    auth = auth.tenantManager().authForTenant(owner.tenantId);
  }
  
  const firebaseUser = await auth.createUser({
    email,
    displayName,
    password: generateTemporaryPassword()
  });
  
  // Create in database
  const authUser = await db.auth_user.create({
    data: {
      uid: firebaseUser.uid,
      email,
      displayName,
      tenantId: owner.tenantId,
      isAdmin: role === 'admin'
    }
  });
  
  // Create PBX user
  const pbxDomain = await db.pbx_domains.findFirst({
    where: { tenantId: owner.tenantId }
  });
  
  const pbxUser = await db.pbx_users.create({
    data: {
      user_uuid: generateUuid(),
      username: email,
      email,
      auth_user_id: authUser.uid,
      domainId: pbxDomain.id,
      status: 'active'
    }
  });
  
  // Create extension if requested
  if (extensionNumber) {
    const extension = await db.pbx_extensions.create({
      data: {
        id: generateUuid(),
        extension: extensionNumber,
        password: generateSipPassword(),
        domain_uuid: pbxDomain.id,
        // ... other SIP settings
      }
    });
    
    // Link user to extension
    await db.pbx_extension_users.create({
      data: {
        id: generateUuid(),
        extension_uuid: extension.id,
        user_uuid: pbxUser.user_uuid,
        default_user: 'true'
      }
    });
  }
  
  // Send invite email
  await sendInviteEmail(email, owner.auth_tenant.name);
  
  return Response.json({ success: true, user: authUser });
}
```

### 4. Recommended File Structure

```
app/
├── (auth)/
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx          # Default sign-in
│   └── sign-up/
│       └── [[...sign-up]]/
│           └── page.tsx          # Default sign-up
├── [tenant]/
│   └── sign-in/
│       └── page.tsx              # Tenant-specific sign-in
├── onboarding/
│   └── page.tsx                  # After-signup page
├── dashboard/
│   ├── users/
│   │   ├── page.tsx              # User list
│   │   └── new/
│   │       └── page.tsx          # Add new user
│   └── settings/
│       └── tenant/
│           └── page.tsx          # Tenant settings

lib/
├── firebase/
│   ├── client.ts                 # Client-side Firebase init
│   ├── admin.ts                  # Server-side Admin SDK
│   └── tenant.ts                 # Tenant resolution logic
├── sync/
│   └── user-sync.ts              # Sync handlers

api/
├── users/
│   ├── route.ts                  # CRUD for users
│   └── sync/
│       └── route.ts              # Webhook for Firebase events
```

---

## Quick Reference: Key Tables

| Purpose | Tables Involved |
|---------|-----------------|
| Authentication | `auth_user`, `auth_tenant`, `auth_group`, `auth_permission` |
| PBX User Management | `pbx_users`, `pbx_domains`, `pbx_user_settings` |
| SIP/Extensions | `pbx_extensions`, `pbx_extension_users` |
| Call Routing | `pbx_dialplans`, `pbx_dialplan_details` |
| SIP Trunks | `pbx_gateways`, `pbx_sip_profiles` |
| IVR/Menus | `pbx_ivr_menus`, `pbx_ivr_menu_options` |
| Call History | `pbx_xml_cdr`, `pbx_call_timeline` |

---

## Summary

1. **Firebase Auth** handles authentication with optional tenant isolation
2. **auth_user** syncs with Firebase UIDs and belongs to `auth_tenant`
3. **pbx_domains** represents a company's PBX instance, linked to `auth_tenant`
4. **pbx_users** links `auth_user` to PBX functionality
5. **Onboarding** creates tenant → auth_user → pbx_domain → pbx_user flow
6. **Isolation modes**: Shared (simple) or Isolated (enterprise) per tenant need
7. **Sync strategy**: Real-time (webhooks), On-demand (lazy), or Batch (scheduled)

For questions about specific implementations, refer to the code samples above or the Prisma schema directly.
