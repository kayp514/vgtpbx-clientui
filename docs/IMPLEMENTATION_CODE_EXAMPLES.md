# Implementation Code Examples

**Purpose:** Specific code snippets to implement the architecture decisions  
**Date:** January 3, 2026

---

## 1. Email Classification Service

```typescript
// lib/email-classifier.ts

interface EmailClassification {
  type: 'personal' | 'business';
  domain: string;
  isAllowedForTier: (tier: string) => boolean;
  suggestions: string[];
}

const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'ymail.com', 'yahoo.co.uk',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'aol.com', 'aim.com',
  'mail.com', 'email.com',
  'zoho.com', 'zohomail.com'
];

export function classifyEmail(email: string, selectedTier?: string): EmailClassification {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const isPersonal = PERSONAL_EMAIL_DOMAINS.includes(domain);

  if (isPersonal) {
    const suggestions: string[] = [];
    
    if (selectedTier === 'tier2') {
      suggestions.push('💡 Consider using your business email for better team collaboration');
    } else if (selectedTier === 'tier3') {
      suggestions.push('⚠️ Enterprise tier requires a verified business email address');
    }

    return {
      type: 'personal',
      domain,
      isAllowedForTier: (tier: string) => tier !== 'tier3',
      suggestions
    };
  }

  return {
    type: 'business',
    domain,
    isAllowedForTier: () => true,
    suggestions: []
  };
}

// Usage in sign-up form
export function validateEmailForTier(email: string, tier: string): { 
  valid: boolean; 
  error?: string; 
  warnings?: string[] 
} {
  const classification = classifyEmail(email, tier);

  if (!classification.isAllowedForTier(tier)) {
    return {
      valid: false,
      error: `Enterprise tier requires a business email. Personal emails (${classification.domain}) are not allowed.`
    };
  }

  return {
    valid: true,
    warnings: classification.suggestions
  };
}
```

---

## 2. Tenant Resolution Service (NO Subdomain)

```typescript
// lib/tenant-resolver.ts

import { prisma } from '@/lib/prisma';

interface TenantResolution {
  tenantId: string | null;
  tenant?: {
    id: string;
    name: string;
    tier: string;
    emailType?: string;
  };
  isNewTenant: boolean;
  method: 'existing-user' | 'domain-match' | 'new-signup';
}

export async function resolveTenantFromEmail(
  email: string
): Promise<TenantResolution> {
  // Strategy 1: Check if user already exists
  const existingUser = await prisma.auth_user.findUnique({
    where: { email },
    include: { auth_tenant: true }
  });

  if (existingUser) {
    return {
      tenantId: existingUser.tenantId,
      tenant: existingUser.auth_tenant,
      isNewTenant: false,
      method: 'existing-user'
    };
  }

  // Strategy 2: Check if email domain matches existing organization
  const emailDomain = email.split('@')[1]?.toLowerCase();
  const classification = classifyEmail(email);

  if (classification.type === 'business') {
    const existingTenant = await prisma.auth_tenant.findFirst({
      where: { 
        domain: emailDomain,
        id: { not: 'default' }
      }
    });

    if (existingTenant) {
      return {
        tenantId: existingTenant.id,
        tenant: existingTenant,
        isNewTenant: false,
        method: 'domain-match'
      };
    }
  }

  // Strategy 3: New tenant (will be created during onboarding)
  return {
    tenantId: null,
    isNewTenant: true,
    method: 'new-signup'
  };
}

// Usage in sign-in page
export async function handleSignInAttempt(email: string, password: string) {
  const resolution = await resolveTenantFromEmail(email);

  if (resolution.isNewTenant) {
    return {
      error: 'No account found. Please sign up first.',
      redirectTo: '/sign-up'
    };
  }

  if (resolution.method === 'domain-match' && !resolution.tenant) {
    return {
      error: `An organization exists for ${email.split('@')[1]}. Please contact your admin or use a different email.`
    };
  }

  // Proceed with Firebase sign-in
  return {
    success: true,
    tenantId: resolution.tenantId
  };
}
```

---

## 3. Enhanced Prisma Schema Updates

```prisma
// prisma/schema.prisma (additions)

model auth_tenant {
  id              String    @id @db.VarChar(50)
  name            String    @unique @db.VarChar(100)
  domain          String    @unique @db.VarChar(100)
  
  // NEW FIELDS for architecture
  tier            String    @default("tier1") @db.VarChar(10)  // tier1|tier2|tier3
  emailType       String?   @db.VarChar(10)                     // personal|business
  ownerEmail      String    @db.VarChar(255)                    // Original owner email
  
  // FreeSWITCH pod tracking
  freeswitchPodName String? @db.VarChar(100)                    // Kubernetes pod name
  freeswitchStatus  String  @default("pending") @db.VarChar(20) // pending|running|paused|failed
  
  // Firebase tenant (for Tier 3 isolated tenants)
  firebaseTenantId String?  @unique @db.VarChar(100)
  
  // Billing
  plan            String    @default("basic") @db.VarChar(20)
  maxUsers        Int       @default(5)
  maxConcurrentCalls Int    @default(10)
  
  // Metadata
  disabled        Boolean   @default(false)
  description     String?   @db.VarChar(500)
  logo            String?   @db.VarChar(255)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Custom subdomain (optional for Tier 3)
  customSubdomain String?   @unique @db.VarChar(100)
  
  // Relations
  users           auth_user[]
  pbxDomains      pbx_domains[]
  
  @@index([tier])
  @@index([emailType])
  @@index([freeswitchPodName])
}

// Migration SQL
/*
-- Add new columns to existing auth_tenant table

ALTER TABLE auth_tenant 
  ADD COLUMN tier VARCHAR(10) DEFAULT 'tier1',
  ADD COLUMN emailType VARCHAR(10),
  ADD COLUMN ownerEmail VARCHAR(255),
  ADD COLUMN freeswitchPodName VARCHAR(100),
  ADD COLUMN freeswitchStatus VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN firebaseTenantId VARCHAR(100) UNIQUE,
  ADD COLUMN maxConcurrentCalls INTEGER DEFAULT 10,
  ADD COLUMN customSubdomain VARCHAR(100) UNIQUE;

CREATE INDEX idx_auth_tenant_tier ON auth_tenant(tier);
CREATE INDEX idx_auth_tenant_emailType ON auth_tenant(emailType);
CREATE INDEX idx_auth_tenant_freeswitchPodName ON auth_tenant(freeswitchPodName);

-- Update existing tenants
UPDATE auth_tenant SET ownerEmail = (
  SELECT email FROM auth_user WHERE auth_user.tenantId = auth_tenant.id LIMIT 1
);
*/
```

---

## 4. Row-Level Security (PostgreSQL)

```sql
-- Enable Row-Level Security on pbx tables

-- 1. Enable RLS on all pbx tables
ALTER TABLE pbx_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE pbx_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pbx_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pbx_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE pbx_devices ENABLE ROW LEVEL SECURITY;
-- ... repeat for all pbx_* tables

-- 2. Create function to get current tenant ID
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', TRUE);
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Create RLS policies
-- Policy for pbx_domains
CREATE POLICY tenant_isolation_policy ON pbx_domains
  FOR ALL
  USING (tenantId = current_tenant_id());

-- Policy for pbx_users
CREATE POLICY tenant_isolation_policy ON pbx_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pbx_domains 
      WHERE pbx_domains.id = pbx_users.domainId 
      AND pbx_domains.tenantId = current_tenant_id()
    )
  );

-- Policy for pbx_extensions
CREATE POLICY tenant_isolation_policy ON pbx_extensions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pbx_domains 
      WHERE pbx_domains.id = pbx_extensions.domain_uuid 
      AND pbx_domains.tenantId = current_tenant_id()
    )
  );

-- 4. Usage in application (Prisma)
-- Set tenant context before queries

// lib/db/with-tenant.ts
import { PrismaClient } from '@prisma/client';

export async function withTenant<T>(
  tenantId: string,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = new PrismaClient();
  
  try {
    // Set tenant context
    await prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, false)`;
    
    // Execute queries (RLS automatically filters)
    const result = await callback(prisma);
    
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

// Usage example
const domains = await withTenant('tenant-123', async (prisma) => {
  // This query is automatically filtered by tenantId='tenant-123'
  return prisma.pbx_domains.findMany();
});
```

---

## 5. FreeSWITCH Pod Provisioning (Kubernetes)

```typescript
// services/freeswitch-provisioner.ts

import { KubeConfig, AppsV1Api, CoreV1Api } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(AppsV1Api);
const k8sCoreApi = kc.makeApiClient(CoreV1Api);

interface FreeSwitchPodConfig {
  tenantId: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  organizationName: string;
}

export async function provisionFreeSwitchPod(config: FreeSwitchPodConfig) {
  const podName = `freeswitch-${config.tenantId}`;
  const namespace = 'pbx-production';

  // Resource allocation based on tier
  const resources = {
    tier1: { cpu: '500m', memory: '512Mi' },
    tier2: { cpu: '2000m', memory: '2Gi' },
    tier3: { cpu: '4000m', memory: '8Gi' }
  };

  const podSpec = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: podName,
      namespace,
      labels: {
        app: 'freeswitch',
        tenant: config.tenantId,
        tier: config.tier
      }
    },
    spec: {
      containers: [{
        name: 'freeswitch',
        image: 'your-registry/freeswitch:latest',
        env: [
          { name: 'TENANT_ID', value: config.tenantId },
          { name: 'DB_HOST', value: 'postgres-shared.default.svc.cluster.local' },
          { name: 'DB_PORT', value: '5432' },
          { name: 'DB_NAME', value: 'vgtpbx' },
          { name: 'DB_USER', valueFrom: { secretKeyRef: { name: 'postgres-creds', key: 'username' } } },
          { name: 'DB_PASSWORD', valueFrom: { secretKeyRef: { name: 'postgres-creds', key: 'password' } } }
        ],
        resources: {
          requests: resources[config.tier],
          limits: {
            cpu: resources[config.tier].cpu,
            memory: resources[config.tier].memory
          }
        },
        ports: [
          { name: 'sip-udp', containerPort: 5060, protocol: 'UDP' },
          { name: 'sip-tcp', containerPort: 5060, protocol: 'TCP' },
          { name: 'sip-tls', containerPort: 5061, protocol: 'TCP' },
          { name: 'rtp-start', containerPort: 16384, protocol: 'UDP' }
        ],
        livenessProbe: {
          tcpSocket: { port: 5060 },
          initialDelaySeconds: 30,
          periodSeconds: 10
        },
        readinessProbe: {
          tcpSocket: { port: 5060 },
          initialDelaySeconds: 10,
          periodSeconds: 5
        }
      }],
      restartPolicy: 'Always'
    }
  };

  try {
    const response = await k8sCoreApi.createNamespacedPod(namespace, podSpec);
    
    // Update database
    await prisma.auth_tenant.update({
      where: { id: config.tenantId },
      data: {
        freeswitchPodName: podName,
        freeswitchStatus: 'running'
      }
    });

    return {
      success: true,
      podName,
      status: response.body.status?.phase
    };
  } catch (error) {
    console.error('Failed to provision FreeSWITCH pod:', error);
    throw error;
  }
}

// Admin control functions
export async function restartFreeSwitchPod(tenantId: string) {
  const tenant = await prisma.auth_tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant?.freeswitchPodName) {
    throw new Error('No FreeSWITCH pod found for tenant');
  }

  const namespace = 'pbx-production';
  
  try {
    // Delete pod (Kubernetes will restart it)
    await k8sCoreApi.deleteNamespacedPod(
      tenant.freeswitchPodName,
      namespace
    );

    return { success: true, message: 'FreeSWITCH pod restarting' };
  } catch (error) {
    console.error('Failed to restart pod:', error);
    throw error;
  }
}

export async function pauseFreeSwitchPod(tenantId: string) {
  const tenant = await prisma.auth_tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant?.freeswitchPodName) {
    throw new Error('No FreeSWITCH pod found for tenant');
  }

  const namespace = 'pbx-production';
  
  try {
    // Scale to 0 replicas (pause)
    await k8sApi.patchNamespacedDeploymentScale(
      tenant.freeswitchPodName,
      namespace,
      { spec: { replicas: 0 } }
    );

    await prisma.auth_tenant.update({
      where: { id: tenantId },
      data: { freeswitchStatus: 'paused' }
    });

    return { success: true, message: 'FreeSWITCH pod paused' };
  } catch (error) {
    console.error('Failed to pause pod:', error);
    throw error;
  }
}
```

---

## 6. Admin Control API Routes

```typescript
// app/api/admin/freeswitch/[action]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { restartFreeSwitchPod, pauseFreeSwitchPod } from '@/services/freeswitch-provisioner';

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tenantId } = await req.json();

  // Verify user is admin of the tenant
  const user = await prisma.auth_user.findUnique({
    where: { uid: session.user.id },
    include: { auth_tenant: true }
  });

  if (user?.tenantId !== tenantId && !user?.isSuperuser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    let result;
    
    switch (params.action) {
      case 'restart':
        result = await restartFreeSwitchPod(tenantId);
        break;
      case 'pause':
        result = await pauseFreeSwitchPod(tenantId);
        break;
      case 'resume':
        // Scale back to 1 replica
        result = await resumeFreeSwitchPod(tenantId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Audit log
    await prisma.audit_log.create({
      data: {
        userId: user.uid,
        tenantId,
        action: `freeswitch_${params.action}`,
        details: JSON.stringify(result),
        timestamp: new Date()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin action failed:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}
```

---

## 7. Frontend: Admin Control Panel

```tsx
// components/admin-freeswitch-control.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface FreeSwitchControlProps {
  tenantId: string;
  currentStatus: string;
}

export function FreeSwitchControl({ tenantId, currentStatus }: FreeSwitchControlProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: 'restart' | 'pause' | 'resume') {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/freeswitch/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      const result = await response.json();
      
      toast.success(`FreeSWITCH ${action} successful`);
      setStatus(action === 'pause' ? 'paused' : 'running');
    } catch (error) {
      toast.error(`Failed to ${action} FreeSWITCH`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">FreeSWITCH Control</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`font-medium ${
            status === 'running' ? 'text-green-600' :
            status === 'paused' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleAction('restart')}
            disabled={loading || status === 'paused'}
            variant="outline"
          >
            Restart
          </Button>

          {status === 'running' ? (
            <Button
              onClick={() => handleAction('pause')}
              disabled={loading}
              variant="secondary"
            >
              Pause
            </Button>
          ) : (
            <Button
              onClick={() => handleAction('resume')}
              disabled={loading}
              variant="default"
            >
              Resume
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Restarting takes ~30 seconds. Pausing stops all calls.
        </p>
      </div>
    </Card>
  );
}
```

---

## Next Steps

1. Copy these code snippets into your project
2. Install dependencies: `npm install @kubernetes/client-node`
3. Update Prisma schema and run migration
4. Implement Row-Level Security in PostgreSQL
5. Test email classification logic
6. Test tenant resolution (no subdomain)
7. Deploy FreeSWITCH provisioning service
8. Build admin control panel UI

**For full context, see:**
- `INFRASTRUCTURE_ARCHITECTURE_RECOMMENDATIONS.md` (full analysis)
- `ARCHITECTURE_DECISION_SUMMARY.md` (quick reference)
