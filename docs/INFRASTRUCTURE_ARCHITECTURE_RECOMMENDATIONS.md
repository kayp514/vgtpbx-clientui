# Infrastructure Architecture & Provisioning Strategy
## Comprehensive Analysis & Senior Infrastructure Engineer Recommendations

**Document Version:** 2.0 (REVISED - Jan 2026)  
**Date:** January 3, 2026  
**Audience:** Engineering Leadership, DevOps, Cloud Architects  
**Status:** Strategic Analysis - Architecture Decisions Finalized

---

## 🎯 Quick Reference: Key Decisions

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE DECISIONS                       │
└─────────────────────────────────────────────────────────────────┘

1. EMAIL STRATEGY: ✅ Support BOTH Personal & Business Emails
   ├─ Personal (Gmail, Outlook): Allowed for Tier 1 & 2
   ├─ Business (user@company.com): Required for Tier 3
   └─ Rationale: Wider adoption, easier onboarding

2. SIGN-IN STRATEGY: ✅ Single Entry Point (NO Subdomains)
   ├─ Primary URL: pbx.yourapp.com/sign-in (100% of users)
   ├─ Optional Enterprise: companyA.pbx.yourapp.com (branding)
   └─ Tenant Detection: Email lookup in database (NOT subdomain)

3. CONTAINER ARCHITECTURE: ✅ Separate FreeSWITCH + Shared PostgreSQL
   ├─ Each Organization: Dedicated FreeSWITCH container
   │  └─ Can restart/pause independently
   │  └─ Cost: $12-$100/month per org (tier-based)
   │
   └─ All Organizations: Shared PostgreSQL database
      └─ Row-Level Security enforces isolation
      └─ Cost: $400/month total (81% savings vs isolated)

┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED TIERS                            │
└─────────────────────────────────────────────────────────────────┘

TIER 1 (FREE):
├─ Price: $0/month (customer) | Cost: $20/month (your expense)
├─ FreeSWITCH: Dedicated pod (0.5 CPU, 512MB RAM)
├─ PostgreSQL: Shared (with RLS)
├─ Email: Personal OR business
├─ Restart Control: ✓ YES (independent)
└─ Ideal: Startups, personal use, testing

TIER 2 (PROFESSIONAL): 
├─ Price: $149/month (customer) | Cost: $95/month (your expense)
├─ FreeSWITCH: Dedicated pod (2 CPU, 2GB RAM)
├─ PostgreSQL: Shared (with RLS + hourly snapshots)
├─ Email: Business encouraged, personal allowed
├─ Restart Control: ✓ YES (independent)
└─ Ideal: SMBs, 10-50 users, mission-critical

TIER 3 (ENTERPRISE):
├─ Price: $999/month (customer) | Cost: $910/month (your expense)
├─ FreeSWITCH: Dedicated pod (4+ CPU, 8+ GB RAM)
├─ PostgreSQL: DEDICATED database (full isolation)
├─ Email: Business REQUIRED (verified)
├─ Restart Control: ✓ YES (independent)
├─ Custom Subdomain: ✓ Optional
└─ Ideal: Enterprises, 500+ users, compliance

┌─────────────────────────────────────────────────────────────────┐
│                    COST ANALYSIS                                │
└─────────────────────────────────────────────────────────────────┘

Scenario: 100 free, 50 professional, 10 enterprise
─────────────────────────────────────────────────────────────────
Fixed Infrastructure:              $980/month
Tier 1 (100 × $20):             $2,000/month
Tier 2 (50 × $95):              $4,750/month
Tier 3 (10 × $910):             $9,100/month
─────────────────────────────────────────────────────────────────
TOTAL COST:                    $16,830/month

Revenue:
- Tier 1 (100 × $0):                $0
- Tier 2 (50 × $149):          $7,450
- Tier 3 (10 × $999):          $9,990
─────────────────────────────────────────────────────────────────
TOTAL REVENUE:                 $17,440/month
PROFIT:                           $610/month (3.5% margin)
⚠️ THIN BUT VIABLE - Consider limiting free tier to 50 orgs

With limited free tier (50 orgs):
PROFIT:                         $5,200/month (17.5% margin) ✓
```

---

## Executive Summary

Your Cloud PBX system presents a **multi-tenancy challenge with significant architecture implications**. The current approach (single Docker container for all tenants) creates operational, scalability, and isolation bottlenecks. This document provides a comprehensive provisioning strategy using Google Cloud infrastructure that balances isolation, scalability, and cost.

### Key Findings

1. **Single Sign-In Entry Point is CORRECT** ✅ - All users should use one entry point with tenant-aware routing
2. **Current Docker Architecture Needs Scaling Strategy** ⚠️ - Single container model fails at scale
3. **Hybrid Multi-Tenancy Model Recommended** ✨ - Mix of shared and isolated deployments based on tenant tier
4. **Firebase Tenant System Design Requires Clarification** 🔍 - Current implementation inconsistent with Firebase best practices

### Critical Architecture Clarifications (Updated Jan 2026)

#### ✅ Email Strategy Decision
**RECOMMENDATION: Support BOTH Personal & Business Emails**
- **Personal emails (Gmail, Outlook, etc.)**: Allowed for all tiers
- **Business emails**: Optional but encouraged for Professional/Enterprise
- **Rationale**: Startups and small teams often start with personal emails, migrate to business emails later

#### ✅ Subdomain Strategy
**NO subdomains for regular users** - Only for enterprise customers who request it
- Primary sign-in: `pbx.yourapp.com/sign-in` (100% of traffic)
- Optional enterprise subdomain: `companyname.pbx.yourapp.com` (custom branding)
- Tenant detection via: Database lookup by email, NOT subdomain parsing

#### ✅ Container Architecture (REVISED)
**Hybrid Model: Separate FreeSWITCH + Shared PostgreSQL**
```
✓ Each organization gets: Dedicated FreeSWITCH container (full control)
✓ All organizations share: Single PostgreSQL instance (with RLS)
✓ Cost-effective: Database consolidation reduces costs by 60%
✓ Isolation: FreeSWITCH restarts don't affect other tenants
✓ Scalability: Scale FreeSWITCH independently per organization
```

---

## Part 0: Critical Architecture Decisions (ANSWERED)

### Decision 1: Personal Email vs Business Email

**QUESTION:** Should users sign up with personal emails (Gmail, Outlook) or business emails only?

**ANSWER: ✅ SUPPORT BOTH**

#### Rationale

```
Personal Emails (Gmail, Outlook, Yahoo, etc.):
✓ ALLOW for all tiers (Free, Professional, Enterprise)
✓ Startups often use personal emails initially
✓ Individual users testing the platform
✓ Teams without custom domain yet
✓ Easier onboarding (no domain setup required)

Business Emails (user@company.com):
✓ ENCOURAGE for Professional/Enterprise tiers
✓ Better for team collaboration (domain-based discovery)
✓ Professional appearance
✓ Easier to manage organization members
✓ Can auto-detect organization from email domain
⚠️ REQUIRE for Enterprise Tier 3 (for security/compliance)
```

#### Implementation Strategy

```typescript
// Email validation logic

interface EmailClassification {
  type: 'personal' | 'business';
  domain: string;
  isAllowed: (tier: string) => boolean;
  warnings?: string[];
}

function classifyEmail(email: string, tier: string): EmailClassification {
  const domain = email.split('@')[1].toLowerCase();
  
  const personalDomains = [
    'gmail.com', 'googlemail.com', 
    'outlook.com', 'hotmail.com', 'live.com',
    'yahoo.com', 'ymail.com',
    'icloud.com', 'me.com',
    'protonmail.com', 'pm.me',
    'aol.com', 'mail.com'
  ];

  const isPersonal = personalDomains.includes(domain);

  if (isPersonal) {
    return {
      type: 'personal',
      domain,
      isAllowed: (tier) => {
        // Personal emails allowed for Tier 1 & 2
        // NOT allowed for Tier 3 (Enterprise)
        return tier !== 'tier3';
      },
      warnings: tier === 'tier2' 
        ? ['Consider using your business email for better team collaboration']
        : []
    };
  }

  return {
    type: 'business',
    domain,
    isAllowed: () => true,  // Business emails allowed for all tiers
    warnings: []
  };
}

// Usage during sign-up
async function validateSignUp(email: string, selectedTier: string) {
  const classification = classifyEmail(email, selectedTier);

  if (!classification.isAllowed(selectedTier)) {
    throw new Error(
      `Enterprise tier requires a business email. ` +
      `Personal emails (${classification.domain}) are not allowed for Tier 3.`
    );
  }

  // Show warnings (not errors)
  if (classification.warnings.length > 0) {
    // Display as info message in UI
    console.log('Suggestions:', classification.warnings);
  }

  return classification;
}
```

#### User Experience Flow

```
Sign-Up with Gmail (Personal Email):
┌─────────────────────────────────────────────────┐
│ Enter email: john@gmail.com                     │
│                                                 │
│ ✓ Email accepted for Free/Professional tiers   │
│ ℹ️ Tip: Use business email for better team     │
│    collaboration                                │
│                                                 │
│ Selected Plan: Free ✓                           │
│ Selected Plan: Professional ✓ (with warning)   │
│ Selected Plan: Enterprise ❌ (blocked)          │
└─────────────────────────────────────────────────┘

Sign-Up with Business Email:
┌─────────────────────────────────────────────────┐
│ Enter email: john@mycompany.com                 │
│                                                 │
│ ✓ Email accepted for all tiers                 │
│ ✓ Auto-detect if organization exists           │
│                                                 │
│ Selected Plan: Any tier ✓                       │
└─────────────────────────────────────────────────┘
```

---

### Decision 2: Subdomain Strategy

**QUESTION:** Should we use subdomains for tenant routing?

**ANSWER: ❌ NO - Single URL Entry Point (Except Optional Enterprise)**

#### Rationale

```
Single URL (pbx.yourapp.com/sign-in):
✓ Simple UX - users remember one URL
✓ No confusion about which subdomain to use
✓ Easier marketing (one URL to promote)
✓ Tenant detection via database lookup (email-based)
✓ Works with personal AND business emails
✓ Single SSL certificate management
✓ Easier mobile app integration

Subdomains (companyA.pbx.yourapp.com):
❌ User must remember which subdomain
❌ Harder to discover correct URL
❌ Requires wildcard SSL certificate
❌ Doesn't work well with personal emails
❌ Complex routing logic
✓ OPTIONAL: Enterprise customers can request custom subdomain
```

#### Implementation

```typescript
// NO subdomain routing needed

// Sign-in page: pbx.yourapp.com/sign-in
// ALL users visit this single URL

async function handleSignIn(email: string, password: string) {
  // 1. Look up user by email
  const user = await db.auth_user.findUnique({
    where: { email },
    include: { auth_tenant: true }
  });

  if (user) {
    // Existing user - sign them in directly
    // No need to check subdomain
    return signInWithFirebase(email, password);
  }

  // 2. Check if email domain has existing organization
  const emailDomain = email.split('@')[1];
  const tenant = await db.auth_tenant.findFirst({
    where: { domain: emailDomain }
  });

  if (tenant) {
    // Organization exists - suggest user to request access
    return {
      error: 'Organization exists. Contact admin@' + emailDomain
    };
  }

  // 3. New user - proceed to sign-up/onboarding
  return { redirectTo: '/sign-up' };
}

// Optional: Enterprise custom subdomain (manual setup)
// companyA.pbx.yourapp.com → Same sign-in logic
// Just branded differently (white-label)
```

#### URL Structure

```
PRIMARY (100% of users):
├─ Sign-in:    pbx.yourapp.com/sign-in
├─ Sign-up:    pbx.yourapp.com/sign-up
├─ Dashboard:  pbx.yourapp.com/dashboard
└─ All pages:  pbx.yourapp.com/...

OPTIONAL (Enterprise Tier 3 only - custom branding):
├─ Sign-in:    companyA.pbx.yourapp.com/sign-in
├─ Dashboard:  companyA.pbx.yourapp.com/dashboard
└─ Logic: Same as primary URL, just different branding
          (Custom logo, colors, domain name)

Implementation:
- Primary URL: Default for everyone
- Custom subdomain: Only created upon request (Tier 3)
- Backend: Both URLs route to same application
- Frontend: Detect subdomain for branding only
```

---

### Decision 3: Container Architecture

**QUESTION:** Should every organization have separate FreeSWITCH container, but share PostgreSQL?

**ANSWER: ✅ YES - This is the RECOMMENDED approach**

#### Rationale

```
Separate FreeSWITCH Container per Organization:
✓ Each organization gets dedicated FreeSWITCH instance
✓ Admin can restart/pause their own FreeSWITCH
✓ No impact on other organizations
✓ Resource isolation (CPU, RAM, network)
✓ Can scale FreeSWITCH independently per org
✓ Easier to troubleshoot per organization
✓ Supports tier-based resource allocation

Shared PostgreSQL Database:
✓ Cost-effective (saves ~$400/month per org)
✓ Simpler backup strategy (single database)
✓ Easier to query cross-tenant analytics
✓ Centralized user management
✓ Row-Level Security (RLS) enforces isolation
✓ Connection pooling (PgBouncer) handles 1000+ orgs
✓ Single database maintenance window
```

#### Why This Model Works

```
Problem with Fully Shared (Current):
├─ All organizations in ONE FreeSWITCH instance
├─ Restart affects EVERYONE
├─ Noisy neighbor problem (resource contention)
└─ Cannot scale individual organizations

Problem with Fully Isolated:
├─ Each organization gets own FreeSWITCH + own PostgreSQL
├─ Cost: $910/month per organization (too expensive!)
├─ Backup complexity (100 databases to backup)
└─ No shared analytics or reporting

Solution: Hybrid (Separate FS + Shared DB):
├─ Each organization gets own FreeSWITCH container
│  └─ Can restart independently ✓
│  └─ Resource isolation ✓
│  └─ Cost: $12-$100/month per org (affordable)
│
└─ All organizations share PostgreSQL database
   └─ Row-Level Security enforces isolation ✓
   └─ Cost: $400/month total (shared across all)
   └─ Single backup strategy ✓

TOTAL COST SAVINGS: 81% vs fully isolated model
```

#### Architecture Diagram (Detailed)

```
┌────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED ARCHITECTURE                        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  User Access Layer                                       │    │
│  │  - Single URL: pbx.yourapp.com/sign-in                  │    │
│  │  - Tenant detection via email lookup                    │    │
│  │  - No subdomain routing                                 │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                       │
│  ┌────────────────────────▼─────────────────────────────────┐    │
│  │  Application Layer (Next.js on GKE)                      │    │
│  │  - Handles authentication (Firebase)                     │    │
│  │  - Routes requests to correct FreeSWITCH pod            │    │
│  │  - Manages tenant→pod mapping                           │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  FreeSWITCH Container Layer (GKE - Auto-scaling)        │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │ Org A FS Pod │  │ Org B FS Pod │  │ Org N FS Pod │  │    │
│  │  │ 0.5 CPU      │  │ 2 CPU        │  │ 4 CPU        │  │    │
│  │  │ 512MB RAM    │  │ 2GB RAM      │  │ 8GB RAM      │  │    │
│  │  │ (Tier 1)     │  │ (Tier 2)     │  │ (Tier 3)     │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │    │
│  │         │                  │                  │          │    │
│  │         │ Read/Write       │ Read/Write       │ R/W      │    │
│  │         │ WHERE tenantId   │ WHERE tenantId   │ WHERE    │    │
│  │         │ ='org-a'         │ ='org-b'         │ tenant.. │    │
│  └─────────┼──────────────────┼──────────────────┼──────────┘    │
│            │                  │                  │               │
│            └──────────────────┴──────────────────┘               │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────┐     │
│  │  Connection Pooler (PgBouncer)                         │     │
│  │  - Multiplexes connections (10,000 → 500)             │     │
│  │  - Transaction mode for efficiency                    │     │
│  └───────────────────────────┬────────────────────────────┘     │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────┐     │
│  │  Shared PostgreSQL (Cloud SQL - HA)                   │     │
│  │  - Single database for ALL organizations              │     │
│  │  - Row-Level Security enforces isolation              │     │
│  │                                                        │     │
│  │  ┌──────────────────────────────────────────────┐    │     │
│  │  │ Table: pbx_domains                           │    │     │
│  │  │ ├─ org-a.local (tenantId='org-a')           │    │     │
│  │  │ ├─ org-b.local (tenantId='org-b')           │    │     │
│  │  │ └─ org-n.local (tenantId='org-n')           │    │     │
│  │  │                                              │    │     │
│  │  │ RLS Policy:                                  │    │     │
│  │  │   WHERE tenantId = current_tenant_id()      │    │     │
│  │  └──────────────────────────────────────────────┘    │     │
│  │                                                        │     │
│  │  Cost: $400/month (shared across ALL orgs)            │     │
│  └────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘

Key Benefits:
✓ Each org has own FreeSWITCH container (restart/pause independently)
✓ All orgs share PostgreSQL (cost-effective)
✓ Row-Level Security enforces data isolation
✓ Auto-scaling adds FreeSWITCH pods as needed
✓ Single backup strategy for all data
✓ 81% cost savings vs fully isolated model
```

---

## Part 1: Current Architecture Analysis

### 1.1 Existing Setup Overview

```
Current State:
┌─────────────────────────────────────────────────┐
│  Google Cloud (Single GKE/Compute Instance)     │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Docker Compose / Single Instance          │   │
│  │                                            │   │
│  │ ┌──────────────────────────────────────┐  │   │
│  │ │  v_postgres (PostgreSQL)              │  │   │
│  │ │  - Prisma Schema (auth_* tables)      │  │   │
│  │ │  - FreeSWITCH Database (pbx_*)        │  │   │
│  │ │  - ALL TENANTS DATA MIXED             │  │   │
│  │ └──────────────────────────────────────┘  │   │
│  │                                            │   │
│  │ ┌──────────────────────────────────────┐  │   │
│  │ │  v_switch (FreeSWITCH)                │  │   │
│  │ │  - Single Instance                    │  │   │
│  │ │  - Reads from shared v_postgres       │  │   │
│  │ │  - NO TENANT ISOLATION                │  │   │
│  │ └──────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Next.js Client UI (vgtpbx-clientui)     │   │
│  │  - Ternsecure/Firebase Auth              │   │
│  │  - Single sign-in entry point ✓          │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 1.2 Data Model Analysis

#### Authentication Separation
```
✓ GOOD: auth_user synced with Firebase UID
✓ GOOD: auth_tenant represents company/organization
✓ GOOD: Permission/group model for RBAC

⚠️ ISSUE: pbx_users links 1:1 with auth_user (can cause conflicts)
⚠️ ISSUE: Multiple pbx_users per tenant, but auth_user limited to 1
```

#### PBX Layer Structure
```
pbx_domains (1) ─────► (N) pbx_users
                        │
                        └─► pbx_extensions
                        └─► pbx_devices
                        └─► pbx_gateways
                        
Each domain = separate PBX instance for a tenant

PROBLEM: All domains share same FreeSWITCH instance (v_switch)
- No resource isolation
- Noisy neighbor problem
- Single point of failure
- Can't be restarted per tenant
```

### 1.3 Current Pain Points

| Issue | Severity | Impact |
|-------|----------|--------|
| Single FreeSWITCH instance for all tenants | CRITICAL | No tenant isolation, shared failure domain |
| Shared PostgreSQL database | HIGH | No data isolation, no per-tenant backups |
| No container restart per tenant | HIGH | Admin can't restart/pause their PBX independently |
| Single sign-in entry point missing tenant detection | MEDIUM | Unclear tenant resolution logic |
| Firebase tenant model not clearly implemented | HIGH | Confusion between Firebase tenants and app tenants |
| No horizontal scaling for PBX | HIGH | Cannot scale individual tenants |

---

## Part 2: Firebase Multi-Tenancy Deep Dive

### 2.1 Firebase Tenant System

Firebase provides **three approaches** for multi-tenancy:

#### Approach A: Default Pool (Single Sign-In)
```
- All users in one Firebase project
- All users sign-in via ONE entry point
- Tenant differentiation via URL/subdomain
- BEST FOR: Low isolation requirements, cost-sensitive

Your Current Model: ✓ Uses this (Ternsecure/Firebase)
```

#### Approach B: Isolated Tenant Pools
```
- Separate Firebase Tenant ID for each company
- Different sign-in URLs per tenant
- User must know their tenant
- COMPLEX: Requires tenant discovery mechanism

Your Model: ⚠️ auth_tenant.id (Attempted but not fully leveraged)
```

#### Approach C: Hybrid (Recommended)
```
- Default pool for SMBs/free tier
- Isolated tenant pools for Enterprise/high-isolation needs
- Single unified sign-in entry that auto-detects
- FLEXIBLE: Scale isolation with revenue

Your Current Implementation: ❌ Not implemented
```

### 2.2 Sign-In Entry Point Recommendation: ✅ YES, USE SINGLE ENTRY

**PRIMARY URL:** `pbx.yourapp.com/sign-in` (100% of users)
**NO SUBDOMAIN ROUTING** - Tenant detected via database lookup

```typescript
// Recommended Single Sign-In Entry Point Pattern (NO SUBDOMAIN)

async function resolveTenantFromRequest(req) {
  const { email } = req.body || req.query;

  // Priority 1: Email-based lookup (works for personal AND business emails)
  if (email) {
    // First: Check if this specific email is registered
    const existingUser = await db.auth_user.findUnique({
      where: { email },
      include: { auth_tenant: true }
    });
    
    if (existingUser) {
      return {
        tenantId: existingUser.tenantId,
        method: existingUser.auth_tenant.firebaseTenantId ? 'isolated' : 'default',
        tier: existingUser.auth_tenant.tier
      };
    }

    // Second: Check if email domain has an organization
    // (Only for business emails like user@companyA.com)
    const emailDomain = email.split('@')[1];
    const publicDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
    
    if (!publicDomains.includes(emailDomain.toLowerCase())) {
      const tenant = await db.auth_tenant.findFirst({
        where: { 
          domain: emailDomain,
          id: { not: 'default' }
        }
      });
      
      if (tenant) {
        return {
          tenantId: tenant.id,
          method: tenant.firebaseTenantId ? 'isolated' : 'default',
          tier: tenant.tier,
          suggestBusinessEmail: true  // Suggest user to use business email
        };
      }
    }
  }

  // Priority 2: Session tenant (from cookie - for return users)
  if (req.cookies.tenantId) {
    const tenant = await db.auth_tenant.findUnique({
      where: { id: req.cookies.tenantId }
    });
    
    if (tenant) {
      return {
        tenantId: tenant.id,
        method: tenant.firebaseTenantId ? 'isolated' : 'default',
        tier: tenant.tier (REVISED)

**KEY CHANGE:** Separate FreeSWITCH per organization + Shared PostgreSQL

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    REVISED ARCHITECTURE (Jan 2026)                         │
│                    Separate FreeSWITCH + Shared Database                   │
│                    (Google Cloud Platform - GKE)                           │
└────────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────────────────┐
                    │  Cloud Load Balancer (Global)     │
                    │  - Single Entry: pbx.yourapp.com  │
                    │  - NO subdomain routing           │
                    └─────────────┬─────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────────────┐
                    │   Next.js Client (GKE)            │
                    │   - Single sign-in entry point    │
                    │   - Tenant detection via DB       │
                    │   - Personal/Business email OK    │
                    └─────────────┬─────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────────────┐
                    │   SHARED PostgreSQL (Cloud SQL)   │
                    │   db-custom-8-32768 (HA)          │
                    │                                   │
                    │   ┌─────────────────────────────┐ │
                    │   │  auth_tenant (all orgs)     │ │
                    │   │  auth_user (all users)      │ │
                    │   │  pbx_domains (all orgs)     │ │
                    │   │  pbx_* (FreeSWITCH tables)  │ │
                    │   │  - Row-Level Security ON    │ │
                    │   │  - tenantId indexed         │ │
                    │   └─────────────────────────────┘ │
                    │                                   │
                    │   Connections: ~500 max           │
                    │   Cost: $400/month (shared)       │
                    └─────────────┬─────────────────────┘
                                  │
                    ┌─────────────┴─────────────────────┐
                    │   Connection Pooler (PgBouncer)   │
                    │   - Transaction mode               │
                    │   - 10,000 → 500 connections      │
                    └─────────────┬─────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────────┐
        │                         │                             │
        ▼                         ▼                             ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│ ORGANIZATION A   │    │ ORGANIZATION B   │    │ ORGANIZATION N       │
│ FreeSWITCH       │    │ FreeSWITCH       │    │ FreeSWITCH           │
│ (GKE Pod)        │    │ (GKE Pod)        │    │ (GKE Pod)            │
│                  │    │                  │    │                      │
│ ┌──────────────┐ │    │ ┌──────────────┐ │    │ ┌──────────────────┐ │
│ │ v_switch     │ │    │ │ v_switch     │ │    │ │ v_switch         │ │
│ │ Container    │ │    │ │ Container    │ │    │ │ Container        │ │
│ │              │ │    │ │              │ │    │ │                  │ │
│ │ Domain:      │ │    │ │ Domain:      │ │    │ │ Domain:          │ │
│ │ org-a.local  │ │    │ │ org-b.local  │ │    │ │ org-n.local      │ │
│ │              │ │    │ │              │ │    │ │                  │ │
│ │ Reads:       │ │    │ │ Reads:       │ │    │ │ Reads:           │ │
│ │ Shared DB    │ │    │ │ Shared DB    │ │    │ │ Shared DB        │ │
│ │ WHERE        │ │    │ │ WHERE        │ │    │ │ WHERE            │ │
│ │ tenantId='A' │ │    │ │ tenantId='B' │ │    │ │ tenantId='N'     │ │
│ └──────────────┘ │    │ └──────────────┘ │    │ └──────────────────┘ │
│                  │    │                  │    │                      │
│ Resources:       │    │ Resources:       │    │ Resources:           │
│ CPU: 0.5 core    │    │ CPU: 2 cores     │    │ CPU: 4 cores         │
│ RAM: 512MB       │    │ RAM: 2GB         │    │ RAM: 8GB             │
│ (Tier 1)         │    │ (Tier 2)         │    │ (Tier 3)             │
│                  │    │                  │    │                      │
│ ✓ Can restart    │    │ ✓ Can restart    │    │ ✓ Can restart        │
│ ✓ Can pause      │    │ ✓ Can pause      │    │ ✓ Can pause          │
│ ✓ Independent    │    │ ✓ Independent    │    │ ✓ Independent        │
└──────────────────┘    └──────────────────┘    └──────────────────────┘

Each organization gets:
✓ Dedicated FreeSWITCH container (restart/pause independently)
✓ Dedicated resources (CPU/RAM) based on tier
✓ Dedicated configuration per organization
✓ Isolated call processing (no noisy neighbor)

All organizations share:
✓ Single PostgreSQL database (cost-effective)
✓ Single PgBouncer connection pool
✓ Single backup strategy
✓ Single disaster recovery plan
```

**Benefits of This Model:**

| Aspect | Benefit |
|--------|---------|
| **Isolation** | Each org can restart/pause FreeSWITCH without affecting others |
| **Cost** | Shared PostgreSQL reduces DB costs by 60% |
| **Scalability** | Add FreeSWITCH pods independently (GKE auto-scaling) |
| **Admin Control** | Full control over own FreeSWITCH instance |
| **Data Security** | Row-Level Security enforces tenant isolation in DB |
| **Backup** | Single backup strategy for all data (simpler) |
| **Performance** | Dedicated resources per org (no CPU/RAM sharing) |   tier: 'tier1',  // Start with free tier
      ownerEmail: user.email,
      emailType: emailStrategy.type
    }
  });

  return tenant;
}
```

**Benefits of Single Entry Point:**
- ✅ Users don't need to remember which URL to visit
- ✅ Enables email-based tenant auto-detection
- ✅ Single code path for authentication
- ✅ Easier invite workflows
- ✅ Subdomain routing for enterprise customers

---

## Part 3: Recommended Multi-Tenancy Architecture

### 3.1 Hybrid Provisioning Model

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED ARCHITECTURE                              │
│                    (Google Cloud Platform)                               │
└──────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  Cloud Load     │
                              │  Balancer       │
                              │  (Global)       │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │   TIER 1: SHARED │  │  TIER 2: POOLED  │  │ TIER 3: ISOLATED │
        │   (Free (Personal/Startup - $0/month) - REVISED

```
Characteristics (NEW):
- Each organization gets: DEDICATED FreeSWITCH container
- All organizations share: PostgreSQL database
- Limited resources per organization (0.5 CPU, 512MB RAM)
- Can restart/pause own FreeSWITCH independently

Architecture:
┌──────────────────────────────────────────────────────┐
│ GKE Cluster (Auto-scaling)                           │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Organization A - FreeSWITCH Pod              │   │
│ │ - Dedicated v_switch container               │   │
│ │ - 0.5 CPU, 512MB RAM                         │   │
│ │ - Reads from shared DB (WHERE tenantId='A')  │   │
│ │ ✓ Can restart independently                  │   │
│ │ ✓ Can pause independently                    │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Organization B - FreeSWITCH Pod              │   │
│ │ - Dedicated v_switch container               │   │
│ │ - 0.5 CPU, 512MB RAM                         │   │
│ │ - Reads from shared DB (WHERE tenantId='B')  │   │
│ │ ✓ Can restart independently                  │   │
│ │ ✓ Can pause independently                    │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ... (up to 500 organizations)                       │
│                                                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ Shared PostgreSQL (Cloud SQL)                       │
│ - db-custom-8-32768 (8 vCPU, 32GB RAM)              │
│ - All organizations' data (with RLS)                │
│ - Automated daily backups                           │
│ - Cost: $400/month (shared across all orgs)         │
└──────────────────────────────────────────────────────┘

Features:
✓ Dedicated FreeSWITCH container per organization
✓ Independent restart/pause control
✓ Resource limits prevent noisy neighbors
✓ Shared database reduces costs
✓ Personal email (Gmail, Outlook) supported
✓ Business email supported
✓ Auto-scaling: Add pods as organizations grow

Limitations:
⚠️ Limited resources (0.5 CPU, 512MB RAM)
⚠️ Max concurrent calls: ~10
⚠️ Max users per org: 10
⚠️ Shared database (data isolated via RLS)
⚠️ No custom configurations
⚠️ Standard support only

Ideal For:
- Personal use (Gmail/Outlook emails)
- Startups with business emails
- Small teams (<10 users)
- Low call volume (<100 calls/day)nt config  │        │                          │
        └─────────────────────────┘        └──────────────────────────┘
```

### 3.2 Tier Specifications

#### TIER 1: Shared Multi-Tenant (Free / Startup - $29/month)

```
Characteristics:
- Multiple companies (max 50 domains) in ONE container
- Single FreeSWITCH instance (v_switch)
- Single PostgreSQL database
- Shared resources (CPU, Memory, Disk)
- Simple backup strategy

Architecture:
┌────────────────────────────┐
│ GKE Deployment             │
│ (2 replicas for HA)        │
│ ┌──────────────────────┐   │
│ │  v_postgrerofessional (Business Email Encouraged - $149/month) - REVISED

```
Characteristics (NEW):
- Each organization gets: DEDICATED FreeSWITCH container
- All organizations share: PostgreSQL database (same as Tier 1)
- More resources per organization (2 CPU, 2GB RAM)
- Priority support + SLA

Architecture:
┌──────────────────────────────────────────────────────┐
│ GKE Cluster (Auto-scaling)                           │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Organization Pro-1 - FreeSWITCH Pod          │   │
│ │ - Dedicated v_switch container               │   │
│ │ - 2 CPU, 2GB RAM (4x Tier 1 resources)       │   │
│ │ - Reads from shared DB (WHERE tenantId='P1') │   │
│ │ - Priority scheduling (guaranteed resources) │   │
│ │ ✓ Can restart independently                  │   │
│ │ ✓ Can pause independently                    │   │
│ │ ✓ Custom dialplan allowed                    │   │
│ │ ✓ 99.9% uptime SLA                           │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Organization Pro-2 - FreeSWITCH Pod          │   │
│ │ - Same as above                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ... (unlimited organizations)                       │
│                                                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ Same Shared PostgreSQL (Cloud SQL)                  │
│ - Same database as Tier 1                           │
│ - BUT: Priority connection pooling                  │
│ - BUT: Hourly automated snapshots (vs daily)        │
└──────────────────────────────────────────────────────┘

Features:
✓ 4x resourceEnterprise (Business Email Required - $499+/month) - REVISED

```
Characteristics (NEW):
- Each organization gets: DEDICATED FreeSWITCH container
- Each organization gets: DEDICATED PostgreSQL database
- Full resource isolation (no sharing)
- White-glove support + Custom SLA
- Optional custom subdomain (companyname.pbx.yourapp.com)

Architecture:
┌──────────────────────────────────────────────────────┐
│ Organization Enterprise-1 (FULLY ISOLATED)           │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Dedicated GKE Namespace OR GCE VM            │   │
│ │                                              │   │
│ │ ┌──────────────────────────────────────┐    │   │
│ │ │ FreeSWITCH Pod                       │    │   │
│ │ │ - 4 CPU, 8GB RAM (dedicated)         │    │   │
│ │ │ - Burst to 16 CPU, 32GB RAM          │    │   │
│ │ │ ✓ Can restart anytime                │    │   │
│ │ │ ✓ Can pause anytime                  │    │   │
│ │ │ ✓ Full SSH access                    │    │   │
│ │ │ ✓ Custom FreeSWITCH modules          │    │   │
│ │ └──────────────────────────────────────┘    │   │
│ │                                              │   │
│ │ ┌──────────────────────────────────────┐    │   │
│ │ │ Dedicated PostgreSQL (Cloud SQL)     │    │   │
│ │ │ - db-custom-8-30720 (dedicated)      │    │   │
│ │ │ - Only this organization's data      │    │   │
│ │ │ - PITR enabled (point-in-time)       │    │   │
│ │ │ - Continuous backups                 │    │   │
│ │ │ - Cost: $600/month (dedicated)       │    │   │
│ │ └──────────────────────────────────────┘    │   │
│ │                                              │   │
│ │ Optional: Custom subdomain                  │   │
│ │ → companyname.pbx.yourapp.com               │   │
│ └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

Features:
✓ 8x resources vs Tier 1 (4 CPU, 8GB RAM)
✓ Dedicated PostgreSQL database (no sharing)
✓ Full data isolation (compliance-ready)
✓ Independent restart/pause control
✓ Custom FreeSWITCH modules/plugins
✓ SSH/root access to FreeSWITCH container
✓ Business email REQUIRED (verified)
✓ Optional custom subdomain
✓ 99.95% uptime SLA
✓ White-glove support (response <1 hour)
✓ PITR backups (point-in-time restore)
✓ Dedicated account manager
✓ Custom contract terms

No Limitations:
✓ Unlimited concurrent calls
✓ Unlimited users per org
✓ HIPAA/PCI compliance support
✓ Data residency options (regional)
✓ Custom security policies

Ideal For:
- Large enterprises (500+ users)
- Regulatory compliance (HIPAA, PCI, SOC2)
- Mission-critical operations (24/7)
- High call volume (10,000+ calls/day)
- Government contracts
- Multi-national corporation

#### TIER 3: Isolated Single-Tenant (Enterprise - $299+/month)

```
Characteristics:
- ONE company = ONE dedicated container
- Dedicated FreeSWITCH instance
- Dedicated PostgreSQL instance
- Full resource isolation
- Complete admin control

Architecture:
┌────────────────────────────────┐
│  GCE Virtual Machine           │
│  (n1-standard-4, auto-scaling) │
│  ┌──────────────────────────┐  │
│  │  v_postgres (Dedicated)  │  │
│  │  - 1 organization only   │  │
│  │  - Per-hour backups      │  │
│  │  - PITR enabled          │  │
│  │  - Max 500 domains       │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  v_switch (Dedicated)    │  │
│  │  - 1 org per instance    │  │
│  │  - Can restart anytime   │  │
│  │  - Can pause anytime     │  │
│  │  - No impact on others   │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
    ↓
Optional: Use Compute Engine → Kubernetes Engine
for auto-scaling within organization

Capabilities:
✓ FULL RESTART control
✓ FULL PAUSE/RESUME control
✓ Dedicated resources
✓ Dedicated database
✓ Custom configurations
✓ SLA: 99.95% uptime
✓ On-demand scaling
✓ Compliance-friendly (data residency)

Ideal For:
- Enterprise customers
- Regulatory compliance
- Mission-critical operations
- 500+ users
```

### 3.3 Provisioning Decision Tree

```
┌─ User Signs Up ─────────────────────────────────┐
│                                                 │
│  Is email from known enterprise customer?       │
│  └─► YES ────────────► TIER 3 (Isolated)       │
│  └─► NO                                        │
│                                                 │
│  Does customer plan include dedicated support? │
│  └─► YES ────────────► Offer TIER 3            │
│  └─► NO                                        │
│                                                 │
│  Select plan at sign-up                        │
│  ┌────────────────────────────────────────┐    │
│  │ Free Plan (Free)     ──► TIER 1        │    │
│  │ Professional ($99)   ──► TIER 2        │    │
│  │ Enterprise ($299+)   ──► TIER 3        │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  Can upgrade mid-cycle:                        │
│  ┌────────────────────────────────────────┐    │
│  │ T1 → T2: Horizontal migration          │    │
│  │ T2 → T3: Full isolation setup (4 hrs)  │    │
│  │ T3 → T2: Data copy + cleanup (2 hrs)   │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4) ⚠️ DO FIRST

#### 1.1 Single Sign-In Entry Point

```typescript
// File: app/api/tenant/route.ts (NEW)

export async function POST(req: Request) {
  const { email, subdomain, returnUrl } = await req.json();

  const tenant = await resolveTenant({ email, subdomain });

  return Response.json({
    tenantId: tenant.id,
    method: tenant.method,      // 'isolated' | 'default'
    signInUrl: tenant.signInUrl,
    redirectAfterAuth: returnUrl || '/auth/verify'
  });
}
```

#### 1.2 Firebase Tenant Configuration

```javascript
// .env.production
FIREBASE_DEFAULT_POOL_ID="your-firebase-project"
FIREBASE_ENTERPRISE_TENANTS_ENABLED=true
NEXT_PUBLIC_FIREBASE_TENANT_AUTO_DETECT=true
```

#### 1.3 Enhanced auth_tenant Schema

```prisma
model auth_tenant {
  id              String    @id @db.VarChar(50)
  name            String    @unique
  domain          String    @unique
  
  // NEW FIELDS
  tier            String    @default("tier1")  // tier1|tier2|tier3
  firebaseTenantId String? @unique // For isolated tenants
  containerGroup  String?            // For pooling (tier2)
  maxDomains      Int       @default(50)
  features        Json      // Feature flags
  provisioned     Boolean   @default(false)
  
  // Links
  users           auth_user[]
  domains         pbx_domains[]
  subscriptions   billing_subscription[]
}
```

**Deliverables:**
- [ ] Update Prisma schema
- [ ] Create tenant resolution service
- [ ] Update sign-in component with tenant detection
- [ ] Add audit logging for tenant access

---

### Phase 2: Docker Image Strategy (Weeks 5-8)

#### 2.1 Create Tier-Specific Images

```dockerfile
# Dockerfile.tier1 (Shared Multi-Tenant)
FROM freeswitch:latest
# Add multi-tenant configuration
COPY config/tier1/freeswitch.conf /etc/freeswitch/

# Dockerfile.tier2 (Pooled Multi-Tenant)
FROM freeswitch:latest
# Add pooled configuration with resource limits
COPY config/tier2/freeswitch.conf /etc/freeswitch/

# Dockerfile.tier3 (Single-Tenant Enterprise)
FROM freeswitch:latest
# Add single-tenant configuration
COPY config/tier3/freeswitch.conf /etc/freeswitch/
```

#### 2.2 Container Orchestration Config

```yaml
# kubernetes/tier1-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pbx-tier1-shared
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15
        volumeMounts:
        - name: tier1-data
          mountPath: /var/lib/postgresql
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
      - name: freeswitch
        image: your-registry/vgtpbx:tier1-latest
        env:
        - name: MULTITENANCY=true
        - name: DB_HOST=localhost
        - name: TIER=tier1
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
```

**Deliverables:**
- [ ] Build multi-tenant FreeSWITCH image
- [ ] Create tier-specific configurations
- [ ] K8s StatefulSet for PostgreSQL
- [ ] Redis cache for domain lookups

---

### Phase 3: Provisioning Automation (Weeks 9-14)

#### 3.1 Provisioning Service

```typescript
// services/provisioning-service.ts (NEW)

interface ProvisioningRequest {
  tenantId: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  name: string;
  domainName: string;
}

export async function provisionTenant(req: ProvisioningRequest) {
  const tenant = await db.auth_tenant.create({ data: req });

  if (req.tier === 'tier3') {
    // Tier 3: Create dedicated resources
    return await provisionEnterpriseCluster(tenant);
  } else if (req.tier === 'tier2') {
    // Tier 2: Add to pooled cluster
    return await addToPooledCluster(tenant, 'pool-2');
  } else {
    // Tier 1: Add to shared cluster
    return await addToSharedCluster(tenant);
  }
}

async function provisionEnterpriseCluster(tenant: AuthTenant) {
  // 1. Create GCE VM
  const vm = await gce.instances.insert({
    project: PROJECT_ID,
    zone: ZONE,
    requestBody: {
      name: `pbx-${tenant.id}`,
      machineType: `zones/${ZONE}/machineTypes/n1-standard-4`,
      // ... config
    }
  });

  // 2. Create Cloud SQL instance
  const sql = await sqladmin.instances.insert({
    project: PROJECT_ID,
    requestBody: {
      name: `pbx-${tenant.id}-db`,
      databaseVersion: 'POSTGRES_15',
      // ... config
    }
  });

  // 3. Deploy FreeSWITCH container
  await deployToInstance(vm, tenant, sql);

  // 4. Create backup schedule
  await createBackupSchedule(tenant);

  return {
    status: 'provisioned',
    vmId: vm.id,
    sqlId: sql.name,
    estimatedTime: '15 minutes'
  };
}
```

#### 3.2 Admin Control API

```typescript
// app/api/admin/tenant/[tenantId]/route.ts (NEW)

export async function POST(req: Request, { params }) {
  const { action } = await req.json(); // 'restart'|'pause'|'resume'
  const { tenantId } = params;

  const tenant = await db.auth_tenant.findUnique({
    where: { id: tenantId }
  });

  if (tenant.tier === 'tier3') {
    // Full control
    return await executeAction(tenant, action);
  } else if (tenant.tier === 'tier2') {
    // Limited control (pause/resume)
    if (action === 'restart') {
      return errorResponse('Tier 2 does not support independent restart');
    }
    return await pauseDomain(tenant);
  } else {
    return errorResponse('Tier 1 does not support admin actions');
  }
}
```

**Deliverables:**
- [ ] Provisioning service (REST API)
- [ ] Terraform/Deployment Manager configs
- [ ] Admin control panel in Next.js
- [ ] Webhook handlers for status updates
- [ ] Automatic health checks

---

### Phase 4: Scaling & Operations (Weeks 15+)

#### 4.1 Monitoring & Observability

```yaml
# monitoring/prometheus.yaml
global:
  scrape_interval: 15s

alerting:
  rules:
    - alert: TenantHighMemory
      expr: container_memory_usage_bytes{tier="tier1"} > 7GB
      for: 5m
      
    - alert: FreeSwitchDown
      expr: freeswitch_up{tier="tier3"} == 0
      for: 1m

    - alert: DatabaseConnectionPoolExhausted
      expr: pg_stat_database_numbackends > max_connections * 0.9
```

#### 4.2 Auto-Scaling Policies

```
Tier 1 (Shared):
- Horizontal: GKE cluster auto-scaling
- Vertical: Pod resource requests adjust based on domain count
- Max: 50 domains per instance

Tier 2 (Pooled):
- Horizontal: Add new pool when > 10 domains
- Vertical: Upgrade database IOPS
- Max: 10 domains per instance

Tier 3 (Isolated):
- Horizontal: Customer triggers upgrade
- Vertical: Auto-scale VM + DB based on calls
- Max: 500 domains per instance
```

**Deliverables:**
- [ ] Monitoring dashboard (Data Studio / Grafana)
- [ ] Auto-scaling rules (GKE + Cloud SQL)
- [ ] Alert rules (PagerDuty integration)
- [ ] Cost analysis automation

---

## Part 5: Implementation Priority

### Quick Wins (Do First - Week 1)

```
1. ✅ DECIDE: Personal vs Business Email Strategy
   - Decision: Support BOTH (personal + business)
   - Update sign-up form to accept any email
   - Add email validation logic
   - Impact: Enables wider user base
   - Effort: 1 day
   - Risk: LOW

2. ✅ CONFIRM: Single Sign-In Entry Point (NO Subdomains)
   - Single URL: pbx.yourapp.com/sign-in
   - Tenant detection via email lookup (not subdomain)
   - Remove subdomain routing logic
   - Impact: Simpler UX, easier implementation
   - Effort: 1 day
   - Risk: LOW

3. ✅ CREATE SINGLE SIGN-IN ENTRY POINT
   - Update sign-in page with tenant detection
   - Add tenant resolution service (email-based)
   - Impact: Enables all future scaling
   - Effort: 2 days
   - Risk: LOW

4. ✅ ENHANCE auth_tenant SCHEMA
   - Add tier field (tier1/tier2/tier3)
   - Add emailType field (per (REVISED)
   - Create FreeSWITCH Docker image (standalone)
   - Configure FreeSWITCH to read from external PostgreSQL
   - Test tenant isolation via RLS (WHERE tenantId='xxx')
   - Create Kubernetes Pod template with resource limits
   - Impact: Foundation for separate containers per org
   - Effort: 2 weeks
   - Risk: MEDIUM

2. 🗄️ POSTGRESQL ROW-LEVEL SECURITY (CRITICAL)
   - Implement RLS on all pbx_* tables
   - Create tenant-scoped functions
   - Test data isolation between tenants
   - Impact: Security for shared database model
   - Effort: 1 week
   - Risk: HIGH (security critical)

3. 🔧 BUILD PROVISIONING SERVICE
   - REST API for creating FreeSWITCH pods
   - Kubernetes API integration
   - Tenant → Pod mapping logic
   - Impact: Enable on-demand scaling
   - Effort: 2 weeks
   - Risk: MEDIUM

4. 👥 ADMIN CONTROL PANEL
   - UI for restart/pause/resume per organization
   - Kubernetes API calls (restart pod, scale to 0)
   - Audit trail for admin actions
1. 📦 CONTAINERIZE PBX LAYERS
   - Create tier-specific Dockerfiles
   - Test multi-tenant FreeSWITCH config
   - Impact: Foundation for scaling
   - Effort: 2 weeks
   - Risk: MEDIUM

2. 🔧 BUILD PROVISIONING SERVICE
   - REST API for tier provisioning
   - Terraform/DM templates
   - Impact: Enable on-demand scaling
   - Effort: 2 weeks
   - Risk: MEDIUM

3. 👥 ADMIN CONTROL PANEL
   - UI for restart/pause/resume
   - Audit trail
   - Impact: Core business requirement
   - Effort: 1 week
   - Risk: LOW
```

### Production Hardening (Weeks 7+)

```
1. 📊 MONITORING & ALERTING
   - Prometheus + Grafana stack
   - PagerDuty integration
   - Impact: Production readiness
   - Effort: 1 week
   - Risk: LOW

2. 🔄 BACKUP & DISASTER RECOVERY
   - Automated backups per tier
   - PITR for Tier 3
   - Impact: Data protection
   - Effort: 1 week
   - Risk: MEDIUM

3. 📈 AUTO-SCALING
   - GKE cluster auto-scaling
   - Cloud SQL resource scaling
   - Impact: Cost optimization
   - Effort: 1 week
   - Risk: MEDIUM
```

---

## Part 6: Sign-In Architecture Decision

### Question: Should All Users Share Single Sign-In Entry?

**ANSWER: ✅ YES, ABSOLUTELY**

#### Why Single Entry Point is Better

| Aspect | Single Entry | Multiple Entries |
|--------|-------------|------------------|
| UX | 1 URL to remember | User must know their tenant URL |
| Discoverability | ✓ SEO friendly | ✗ Multiple sign-in pages |
| Invite workflow | ✓ Invite anyone via email | ✗ Need to specify tenant |
| Tenant onboarding | ✓ Auto-detect from email | ✗ Manual selection |
| Mobile apps | ✓ Single app | ✗ Multiple apps or complex logic |
| Federation | ✓ Easy SSO integration | ✗ Multiple configurations |
| Implementation | ✓ Simpler code | ✗ Complex routing |

#### Implementation Pattern

```
User Flow:
┌─────────────────────────────────────────────────────────────────┐
│  https://pbx.yourapp.com/sign-in                               │
│                                                                 │
│  1. User enters email (user@companyA.com)                      │
│                                                                 │
│  2. System auto-detects tenant                                 │
│     → Look up email domain → Find auth_tenant → Get tier      │
│                                                                 │
│  3. Redirect to appropriate sign-in method                     │
│     ├─► Tier 3: Firebase isolated tenant                       │
│     ├─► Tier 2: Default pool (shared)                         │
│     └─► Tier 1: Default pool (shared)                         │
│                                                                 │
│  4. After auth success → /verify → /dashboard                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Alternative URLs (For Tier 3 Enterprise):
┌──────────────────────────────────────────────────────────┐
│ companyA.pbx.yourapp.com/sign-in                        │
│ ↓                                                        │
│ Auto-selects Enterprise tenant + dedicated sign-in     │
└──────────────────────────────────────────────────────────┘
```

#### Tenant Resolution Pseudocode

```typescript
// Recommended implementation
async function getTenantFromRequest(req: Request) {
  const { email, subdomain } = extractFromRequest(req);

  // Strategy 1: Subdomain (if using Tier 3 enterprise subdomains)
  if (subdomain && subdomain !== 'www') {
    const tenant = await findTenantByDomain(subdomain);
    if (tenant?.tier === 'tier3' && tenant.firebaseTenantId) {
      return {
        tenantId: tenant.id,
        firebaseTenantId: tenant.firebaseTenantId,  // Isolated
        method: 'isolated'
      };
    }
  }

  // Strategy 2: Email-based lookup (if email provided during sign-up)
  if (email) {
    const tenant = await findTenantByEmailDomain(email);
    if (tenant?.id !== 'default') {
      return {
        tenantId: tenant.id,
        firebaseTenantId: tenant.firebaseTenantId,
        method: tenant.firebaseTenantId ? 'isolated' : 'default'
      };
    }
  }

  // Strategy 3: Session tenant ID (from cookie)
  const sessionTenant = parseCookie(req, 'tenantId');
  if (sessionTenant) {
    return { tenantId: sessionTenant, method: 'default' };
  }

  // Default: Shared pool
  return {
    tenantId: 'default',
    firebaseTenantId: null,
    method: 'default'
  };
}
```

#### Firebase Tenant Configuration

```typescript
// lib/firebase-tenant-config.ts (NEW)

export const firebaseConfig = {
  // Shared pool (most users)
  default: {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    // ... other config
  },

  // Isolated pools (enterprise only)
  enterprise: {
    tenantId: "enterprise-tenant-id",
    // Uses same Firebase project but isolated tenant
  }
};

// Usage in sign-in component
export function useFirebaseAuth() {
  const tenant = useTenantContext();
  
  const auth = tenant?.firebaseTenantId
    ? getAuth(app, tenant.firebaseTenantId)
    : getAuth(app);

  return auth;
}
```

---

## Part 7: Cost Analysis (REVISED for New Architecture)

### Monthly Cost Comparison

#### Option A: Current (Single Container)
```
- GCE Instance (n1-standard-4): $150/month
- Cloud SQL (db-f1-micro): $35/month
- Storage: $20/month
- Networking: $30/month
─────────────────────────────
TOTAL: ~$235/month

Scalability: NONE
Tenant Isolation: NONE (single point of failure)
Admin Control: NONE (no restart per tenant)
```

#### Option B: RECOMMENDED - Separate FreeSWITCH + Shared DB

```
INFRASTRUCTURE FOUNDATION (Shared across ALL tiers):
├─ GKE Cluster (3 nodes, e2-standard-4): $360/month
├─ Cloud SQL Shared (db-custom-8-32768): $400/month
│  └─ Serves ALL Tier 1 & Tier 2 customers
├─ PgBouncer (Connection Pooler): $50/month
├─ Load Balancer (Global): $20/month
├─ Storage (Shared backups): $100/month
├─ Monitoring (Prometheus/Grafana): $50/month
└─ Subtotal: $980/month (Fixed cost)

Per Organization Costs:

TIER 1 (Free - $0/month for customer):
├─ FreeSWITCH Pod (0.5 CPU, 512MB RAM): $12/month
├─ Network egress: $3/month
├─ Shared DB allocation: $5/month (amortized)
└─ Subtotal per org: $20/month (your cost)

   With 100 FREE orgs:
   Revenue: $0
   Cost: $980 (fixed) + (100 × $20) = $2,980/month
   ───────────────────────────────────────────
   Loss: -$2,980/month (acceptable for growth)

TIER 2 (Professional - $149/month per org):
├─ FreeSWITCH Pod (2 CPU, 2GB RAM): $50/month
├─ Network egress: $10/month
├─ Shared DB allocation: $10/month (amortized)
├─ Hourly snapshots: $10/month
├─ Priority support overhead: $15/month
└─ Subtotal per org: $95/month (your cost)

   With 50 PROFESSIONAL orgs:
   Revenue: 50 × $149 = $7,450/month
   Cost: (50 × $95) = $4,750/month
   ───────────────────────────────────────────
   Profit: $2,700/month (36% margin) ✓

TIER 3 (Enterprise - $499/month per org):
├─ FreeSWITCH Pod (4 CPU, 8GB RAM): $100/month
├─ Dedicated Cloud SQL (db-custom-8-30720): $600/month
├─ PITR backups (continuous): $80/month
├─ Dedicated support: $100/month
├─ Network egress: $30/month
└─ Subtotal per org: $910/month (your cost)

   With 10 ENTERPRISE orgs:
   Revenue: 10 × $499 = $4,990/month
   Cost: (10 × $910) = $9,100/month
   ───────────────────────────────────────────
   Loss: -$4,110/month ❌ (NOT PROFITABLE!)

   ⚠️ TIER 3 PRICING ADJUSTMENT NEEDED
   Recommended: $999/month minimum
   
   With adjusted pricing ($999/month):
   Revenue: 10 × $999 = $9,990/month
   Cost: $9,100/month
   ───────────────────────────────────────────
   Profit: $890/month (10% margin) ✓

TOTAL SCENARIO (100 free, 50 pro, 10 enterprise):
─────────────────────────────────────────────────────────
Fixed Infrastructure: $980/month
Tier 1 (100 orgs × $20): $2,000/month
Tier 2 (50 orgs × $95): $4,750/month
Tier 3 (10 orgs × $910): $9,100/month
─────────────────────────────────────────────────────────
TOTAL COST: $16,830/month

Revenue:
- Tier 1 (100 × $0): $0
- Tier 2 (50 × $149): $7,450
- Tier 3 (10 × $999): $9,990  [ADJUSTED PRICING]
─────────────────────────────────────────────────────────
TOTAL REVENUE: $17,440/month

PROFIT: $610/month (3.5% margin) ⚠️ THIN BUT VIABLE
```

### Break-Even Analysis (Revised)

```
RECOMMENDED PRICING STRUCTURE:

┌──────────────┬────────────┬──────────────┬────────────┬────────────┐
│ Tier         │ Customer   │ Your Cost    │ Profit     │ Margin     │
│              │ Pays       │              │            │            │
├──────────────┼────────────┼──────────────┼────────────┼────────────┤
│ Free (T1)    │ $0/mo      │ $20/mo       │ -$20/mo    │ N/A        │
│              │            │              │            │ (Growth)   │
├──────────────┼────────────┼──────────────┼────────────┼────────────┤
│ Pro (T2)     │ $149/mo    │ $95/mo       │ $54/mo     │ 36% ✓      │
│              │            │              │            │            │
├──────────────┼────────────┼──────────────┼────────────┼────────────┤
│ Enterprise   │ $999/mo    │ $910/mo      │ $89/mo     │ 10% ✓      │
│ (T3)         │ [ADJUSTED] │              │            │            │
└──────────────┴────────────┴──────────────┴────────────┴────────────┘

KEY INSIGHT: Shared PostgreSQL saves ~$400/month per Tier 2 customer!

Without shared DB (old model): Tier 2 cost = $95 + $400 = $495/month
   → Would need to charge $599/month for 17% margin
   → Less competitive

With shared DB (new model): Tier 2 cost = $95/month
   → Can charge $149/month with 36% margin
   → More competitive ✓

Break-Even Point:
─────────────────────────────────────────────────────────
Fixed costs: $980/month
Need to cover with paying customers (Tier 2 + Tier 3)

Option A: All Tier 2 customers
   $980 ÷ $54 profit = 19 customers minimum

Option B: Mix (10 Tier 2 + 2 Tier 3)
   (10 × $54) + (2 × $89) = $718/month
   Covers 73% of fixed costs

Option C: 20 Tier 2 + 5 Tier 3
   (20 × $54) + (5 × $89) = $1,525/month
   Exceeds fixed costs by $545 ✓

GROWTH TARGET (6 months):
─────────────────────────────────────────────────────────
- 500 free users (loss: $10,000/month - growth investment)
- 100 professional ($149): Revenue $14,900, Cost $9,500 = +$5,400
- 20 enterprise ($999): Revenue $19,980, Cost $18,200 = +$1,780
─────────────────────────────────────────────────────────
Fixed cost: $980/month
Total Cost: $980 + $10,000 + $9,500 + $18,200 = $38,680/month
Total Revenue: $0 + $14,900 + $19,980 = $34,880/month
─────────────────────────────────────────────────────────
NET: -$3,800/month (still growth phase, need to reduce free tier)

ALTERNATIVE: Limit free tier to 50 orgs
- 50 free users (loss: $1,000/month)
- 100 professional: +$5,400
- 20 enterprise: +$1,780
─────────────────────────────────────────────────────────
Total Cost: $980 + $1,000 + $9,500 + $18,200 = $29,680/month
Total Revenue: $34,880/month
─────────────────────────────────────────────────────────
NET: +$5,200/month (17.5% margin) ✓ HEALTHY
```

### Cost Savings vs Other Models

```
Comparison: Separate FreeSWITCH + Shared DB vs Other Approaches

MODEL 1: Fully Shared (Current)
├─ Pros: Cheapest ($235/month total)
├─ Cons: No isolation, no admin control, doesn't scale
└─ Cost per customer: $235 ÷ N (gets cheaper with scale)

MODEL 2: Fully Isolated (Old Tier 3 recommendation for everyone)
├─ Pros: Perfect isolation
├─ Cons: Very expensive ($910/month per customer!)
└─ Cost per customer: $910 (doesn't scale down)

MODEL 3: Separate FreeSWITCH + Shared DB (RECOMMENDED)
├─ Pros: Balance of isolation + cost-effectiveness
├─ Cons: Still shares database (mitigated by RLS)
└─ Cost per customer: $20-$910 (tier-based, scales well)

Savings Example (100 customers):
─────────────────────────────────────────────────────────
Model 2 (Fully Isolated): 100 × $910 = $91,000/month
Model 3 (Hybrid - RECOMMENDED): $16,830/month
─────────────────────────────────────────────────────────
SAVINGS: $74,170/month (81% reduction!) ✓
```

---

## Part 8: Security Considerations

### Data Isolation

```
TIER 1 (Shared):
├─ Database: SHARED
│  └─ Risk: Low if proper row-level security (RLS) enforced
├─ FreeSWITCH: SHARED
│  └─ Risk: MEDIUM - Domain isolation via dialplan routing
├─ Backups: SHARED
│  └─ Risk: Customer A could recover Tenant B data if RLS fails
└─ Compliance: NOT suitable for HIPAA/PCI

TIER 2 (Pooled):
├─ Database: SHARED (same as Tier 1)
├─ FreeSWITCH: SHARED with quotas
├─ Backups: SHARED with snapshots
└─ Compliance: NOT suitable for HIPAA/PCI

TIER 3 (Isolated):
├─ Database: DEDICATED
├─ FreeSWITCH: DEDICATED
├─ Backups: DEDICATED
└─ Compliance: ✓ HIPAA/PCI suitable
```

### Mandatory Security Measures

```
1. Row-Level Security (RLS) - PostgreSQL
   - Enforce tenant_id on all pbx_* tables
   - Ensure auth_user only sees own tenant data

   CREATE POLICY pbx_domains_isolation
     ON pbx_domains
     USING (tenantId = current_setting('app.current_tenant_id'));

2. Network Isolation
   - Use VPC with separate subnets per tier
   - Firewall rules limiting inter-tier communication

3. Secrets Management
   - Use Google Secret Manager (not env vars)
   - Rotate credentials every 90 days

4. Audit Logging
   - Log all admin actions per tenant
   - Store in Cloud Logging with long retention

5. Encryption
   - TLS 1.3 for all transit
   - At-rest encryption for Cloud SQL
   - Separate encryption keys per Tier 3 tenant
```

---

## Part 9: Migration Strategy

### From Current to Recommended (For Existing Customers)

```
Phase 1: Non-Breaking (No downtime)
├─ Deploy new schema with tier field (default: tier1)
├─ Run background job: Assign all current tenants to tier1
├─ Deploy tenant-aware sign-in (backward compatible)
└─ Enable gradual rollout (10% traffic → 100%)

Phase 2: Tier 2 Onboarding
├─ Offer free trial of Professional tier
├─ Manual migration for interested customers
├─ Monitor compatibility issues
└─ Auto-scale Tier 2 pool as adoption grows

Phase 3: Tier 3 Provisioning
├─ Launch for enterprise customers only (private beta)
├─ Manual provisioning by support team
├─ Build automation in parallel
└─ Full self-service launch (6 months)

Timeline:
Week 1-2: Phase 1 complete
Week 3-8: Phase 2 rolling migration
Week 9+: Phase 3 enterprise launch
```

### Zero-Downtime Deployment

```
Strategy: Blue-Green Deployment with Database Migration

BLUE (Current):
├─ Single Tier 1 container (all tenants)
└─ Old schema (no tier field)

GREEN (New):
├─ Tiered containers (Tier 1/2/3)
└─ Enhanced schema (with tier)

Steps:
1. Deploy GREEN infrastructure in parallel
2. Create snapshot of current database
3. Migrate schema (add tier field): ~1 minute
4. Sync data between BLUE and GREEN: ~5 minutes
5. Update load balancer: Route 5% → GREEN
6. Monitor for 1 hour
7. Gradual increase: 5% → 25% → 50% → 100%
8. If issues: Rollback to BLUE (instant)
9. Decommission BLUE after 24 hours

Total downtime: 0 minutes
Rollback time: < 30 seconds
```

---

## Part 10: Recommended Next Steps

### Immediate Actions (This Week)

```
1. ✅ Decision: Confirm single sign-in entry point
   → Present this doc to team
   → Make decision and communicate

2. ✅ Planning: Assign team ownership
   → Backend lead: Firebase tenant setup + provisioning service
   → DevOps lead: Kubernetes + Terraform configs
   → Frontend lead: Sign-in UI + tenant detection
   → DBA: Schema migration + RLS policies

3. ✅ Review: Examine current FreeSWITCH config
   → Document current limitations
   → Identify multi-tenancy issues
   → Plan configuration changes

4. ✅ POC: Build simple tier detection
   → Extend auth_tenant schema
   → Create tenant resolution service
   → Test with 2-3 development tenants
```

### This Month

```
1. Implement Phase 1 (Foundation)
   - Single sign-in entry point ✅
   - Schema updates ✅
   - Audit logging ✅

2. Begin Phase 2 (Infrastructure)
   - Tier-specific Docker images
   - Kubernetes manifests
   - Cloud SQL backup policies

3. Document
   - Admin procedures per tier
   - Troubleshooting guide
   - Customer SLA terms
```

### This Quarter

```
1. Complete Phase 2 (Docker strategy)
2. Build Phase 3 (Provisioning automation)
3. Test with 10-20 beta customers
4. Measure: Cost, reliability, customer satisfaction
```

---

## Appendix A: Tenant Configuration Example

```yaml
# Database: Example tenant configs

-- Free Tier (Tier 1)
INSERT INTO auth_tenant VALUES (
  'tenant-123',
  'ACME Corp Startup',
  'acme-startup',
  'tier1',
  NULL,        -- No isolated Firebase tenant
  'shared-1',  -- Shared container group
  50,          -- Max 50 domains
  '{"calls": "unlimited", "users": "unlimited", "sip_trunks": 1}',
  true
);

-- Professional Tier (Tier 2)
INSERT INTO auth_tenant VALUES (
  'tenant-456',
  'Tech Consulting Inc',
  'tech-consulting',
  'tier2',
  NULL,
  'pool-2',
  10,
  '{"calls": "1000/month", "users": 50, "sip_trunks": 5}',
  true
);

-- Enterprise Tier (Tier 3)
INSERT INTO auth_tenant VALUES (
  'tenant-789',
  'Fortune 500 Corp',
  'fortune500corp',
  'tier3',
  'enterprise-tenant-xyz',  -- Isolated Firebase tenant
  'enterprise-789',         -- Dedicated GKE/GCE instance
  500,
  '{"calls": "unlimited", "users": "unlimited", "sip_trunks": "unlimited"}',
  true
);
```

---

## Appendix B: Rollout Checklist

```
[ ] FOUNDATION (Week 1)
    [ ] Team alignment on architecture
    [ ] Assign code ownership
    [ ] Update auth_tenant schema
    [ ] Implement tenant resolution service
    [ ] Add audit logging
    [ ] Code review and deploy

[ ] DOCKER STRATEGY (Week 2-4)
    [ ] Analyze current FreeSWITCH config
    [ ] Create Dockerfile.tier1
    [ ] Create Dockerfile.tier2
    [ ] Create Dockerfile.tier3
    [ ] Test multi-tenant FreeSWITCH config
    [ ] Load testing with 3 domains per instance

[ ] KUBERNETES (Week 5-6)
    [ ] Create tier1-deployment.yaml
    [ ] Create tier2-statefulset.yaml
    [ ] Create tier3-gce-instance.tf (Terraform)
    [ ] Deploy to GKE dev environment
    [ ] Test failover and scaling
    [ ] Document deployment process

[ ] PROVISIONING (Week 7-9)
    [ ] Build provisioning REST API
    [ ] Implement enterprise cluster provisioning
    [ ] Create admin control panel UI
    [ ] Test end-to-end provisioning workflow
    [ ] Load testing with 10 simultaneous provisions

[ ] OPERATIONS (Week 10-12)
    [ ] Set up Prometheus/Grafana monitoring
    [ ] Create alerting rules
    [ ] Implement automated backups
    [ ] Document operational procedures
    [ ] Train support team
    [ ] Create runbooks for common tasks

[ ] LAUNCH PREP (Week 13-14)
    [ ] Beta testing with 5-10 customers
    [ ] Gather feedback and iterate
    [ ] Final security audit
    [ ] Load testing at expected scale
    [ ] Launch communication/marketing

[ ] GO-LIVE (Week 15)
    [ ] Internal production deployment
    [ ] Monitor for 1 week
    [ ] Release to customers
    [ ] Support team on-call
```

---

## Appendix C: Glossary

- **Tier 1**: Shared multi-tenant (lowest cost, no isolation)
- **Tier 2**: Pooled multi-tenant (medium cost, partial isolation via quotas)
- **Tier 3**: Isolated single-tenant (highest cost, full isolation)
- **Firebase Tenant**: Separate Firebase authentication realm (not your auth_tenant)
- **auth_tenant**: Your application-level organization/company entity
- **pbx_domain**: FreeSWITCH domain/context representing a customer's PBX instance
- **RLS**: Row-Level Security in PostgreSQL (enforces tenant isolation at DB level)
- **PITR**: Point-In-Time Recovery (restore database to any past timestamp)

---

## Summary & Final Recommendations

### Architecture Decision: ✅ IMPLEMENT TIERED MODEL

Your system would benefit dramatically from this approach:

1. **Free users** → Tier 1 (shared, $0)
2. **Growing SMBs** → Tier 2 (pooled, $99-$199)
3. **Enterprise** → Tier 3 (isolated, $299-$999)

### Sign-In Strategy: ✅ SINGLE ENTRY POINT

**DO NOT** create separate sign-in URLs per tenant. Instead:
- One sign-in page: `pbx.yourapp.com/sign-in`
- Auto-detect tenant from email domain
- Route to appropriate authentication method (shared vs isolated)
- Optional: Support subdomain entry (`company.pbx.yourapp.com/sign-in`) for enterprise

### Immediate Priority: ✅ START WITH FOUNDATION

Don't wait for perfect container strategy. First:
1. Implement single sign-in entry point
2. Add tenant tier to schema
3. Build tenant resolution logic

**Then** proceed with Docker/Kubernetes strategy.

### Expected Benefits

| Metric | Current | After Implementation |
|--------|---------|----------------------|
| Tenant Isolation | None | Tier-based (0-100%) |
| Admin Control | None | Full for Tier 3 |
| Scalability | Single instance | Horizontal (unlimited) |
| Cost per Customer | Fixed $235 | Tiered ($0-$500) |
| Revenue Potential | Limited | Unlimited tiers |
| Compliance-Ready | No | Yes (Tier 3) |

---

## Final Recommendations Summary

### 🎯 Immediate Actions (This Week)

1. **✅ Confirm Architecture Decisions**
   - Email Strategy: Support both personal AND business emails
   - Sign-In: Single entry point at `pbx.yourapp.com/sign-in`
   - Container Model: Separate FreeSWITCH per org + Shared PostgreSQL
   - Get stakeholder approval

2. **✅ Update Database Schema**
   ```sql
   ALTER TABLE auth_tenant ADD COLUMN tier VARCHAR(10) DEFAULT 'tier1';
   ALTER TABLE auth_tenant ADD COLUMN emailType VARCHAR(10);
   ALTER TABLE auth_tenant ADD COLUMN ownerEmail VARCHAR(255);
   ALTER TABLE auth_tenant ADD COLUMN freeswitchPodName VARCHAR(100);
   ```

3. **✅ Implement Email Classification**
   - Create utility function to classify personal vs business emails
   - Update sign-up form validation
   - Add appropriate warnings/messages

4. **✅ Create Single Sign-In Entry Point**
   - Remove subdomain routing logic (if any exists)
   - Implement email-based tenant lookup
   - Update authentication flow

### 📋 Next 30 Days

1. **Week 1-2: PostgreSQL Row-Level Security**
   - Implement RLS on all pbx_* tables
   - Test tenant isolation thoroughly
   - Document security policies

2. **Week 2-3: FreeSWITCH Container Image**
   - Create standalone FreeSWITCH Docker image
   - Configure to read from external PostgreSQL
   - Test with sample tenant data

3. **Week 3-4: Kubernetes Configuration**
   - Create Pod templates with resource limits
   - Implement provisioning API
   - Test auto-scaling

### 📊 Success Metrics

```
Technical Metrics:
├─ Tenant isolation: 100% (verified via RLS testing)
├─ Independent restart capability: 100% of organizations
├─ PostgreSQL connection efficiency: <200ms avg query time
├─ Auto-scaling response: <60 seconds to add new pod
└─ Cost per Tier 1 org: <$25/month

Business Metrics:
├─ Free tier adoption: Target 50-100 orgs in 3 months
├─ Conversion to Professional: Target 20% (10-20 orgs)
├─ Enterprise deals: Target 3-5 orgs
├─ Overall profit margin: Target >15%
└─ Customer satisfaction: Target >85% (restart/pause control)
```

### ⚠️ Critical Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Shared DB bottleneck | HIGH | PgBouncer pooling + Cloud SQL scaling |
| RLS bypass vulnerability | CRITICAL | Security audit + automated testing |
| FreeSWITCH pod proliferation | MEDIUM | Auto-cleanup of inactive pods |
| Cost overrun (free tier) | MEDIUM | Limit free tier to 50 orgs initially |
| Container networking complexity | MEDIUM | Use managed GKE service discovery |

### 🚀 Go-To-Market Strategy

```
Phase 1 (Month 1-2): Foundation
├─ Launch with Tier 1 (Free) only
├─ Invite 10-20 beta testers
├─ Gather feedback on restart/pause functionality
└─ Fix critical issues

Phase 2 (Month 3-4): Professional Launch
├─ Enable Tier 2 (Professional) with pricing
├─ Migrate beta testers to Professional (offer discount)
├─ Start marketing campaign
└─ Target: 20 Professional customers

Phase 3 (Month 5-6): Enterprise Launch
├─ Enable Tier 3 (Enterprise) for qualified leads
├─ White-glove onboarding for first 3 customers
├─ Build case studies
└─ Target: 3-5 Enterprise customers

Phase 4 (Month 7+): Scale & Optimize
├─ Analyze cost metrics
├─ Optimize resource allocation
├─ Consider additional tiers or add-ons
└─ Continuous improvement
```

---

**Document Prepared By:** Senior Infrastructure Engineer  
**Version:** 2.0 (Revised - Architecture Decisions Finalized)  
**Last Updated:** January 3, 2026  
**Next Review:** April 2026 (Post-Phase 1 implementation)

**Key Stakeholders:**
- Engineering Lead: Approve architecture decisions
- DevOps Lead: Implement container strategy
- Product Lead: Approve pricing and tier structure
- Finance Lead: Approve cost projections

For questions or clarifications, refer to Part 0 (Critical Architecture Decisions) or consult the architecture team.

---

## Appendix D: FAQ

**Q: Why not use fully isolated containers (separate DB per org)?**
A: Cost. Would cost $910/month per org vs $20-$95/month with shared DB. 81% savings.

**Q: Is shared PostgreSQL secure?**
A: Yes, with Row-Level Security (RLS). Each tenant can only access their own data. Tested and proven in multi-tenant SaaS.

**Q: Can I restart my FreeSWITCH without affecting others?**
A: Yes! Each org gets dedicated FreeSWITCH container. Restart only affects your organization.

**Q: What if shared PostgreSQL becomes bottleneck?**
A: Cloud SQL can scale vertically (more CPU/RAM) and PgBouncer handles connection pooling. Can support 1000+ orgs.

**Q: Why allow personal emails (Gmail)?**
A: Startups and individuals often start with personal emails. Business emails can be added later. Increases adoption.

**Q: Why single sign-in URL instead of subdomains?**
A: Simpler UX. Users don't need to remember subdomain. Tenant auto-detected from email. Enterprise can request custom subdomain for branding.

**Q: How long to provision new organization?**
A: ~30 seconds to create FreeSWITCH pod. Fully automated via Kubernetes API.

**Q: What happens if FreeSWITCH pod crashes?**
A: Kubernetes auto-restarts failed pods. Zero-downtime with liveness/readiness probes.

---

**END OF DOCUMENT**
