# Authentication Flow & PBX User Verification

## Overview

This document explains the authentication flow using **Ternsecure Auth** (built on Firebase) and how it integrates with the Cloud PBX system. The key principle is **separation of concerns**:

1. **Ternsecure/Firebase**: Handles authentication (sign-in/sign-up, tokens, sessions)
2. **PBX System**: Manages PBX user access and onboarding

---

## Current Environment Configuration

```env
# Force redirects after auth success
NEXT_PUBLIC_SIGN_IN_FORCE_REDIRECT_URL=/auth/verify
NEXT_PUBLIC_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
```

---

## Authentication Flow Diagrams

### Sign-In Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SIGN-IN FLOW                                        │
└──────────────────────────────────────────────────────────────────────────────┘

    User                    Sign-In Page              Ternsecure           Backend
      │                          │                        │                    │
      │  1. Enter credentials    │                        │                    │
      │─────────────────────────►│                        │                    │
      │                          │                        │                    │
      │                          │  2. signIn()           │                    │
      │                          │───────────────────────►│                    │
      │                          │                        │                    │
      │                          │  3. Success + Token    │                    │
      │                          │◄───────────────────────│                    │
      │                          │                        │                    │
      │                          │  4. Set cookie         │                    │
      │                          │  (persistence:         │                    │
      │                          │   browserCookie)       │                    │
      │                          │                        │                    │
      │                          │  5. Force redirect     │                    │
      │◄─────────────────────────│     to /auth/verify    │                    │
      │                          │                        │                    │
      ▼                          │                        │                    │
┌─────────────┐                  │                        │                    │
│ /auth/verify│                  │                        │                    │
│    Page     │                  │                        │                    │
└──────┬──────┘                  │                        │                    │
       │                         │                        │                    │
       │  6. Get current user    │                        │                    │
       │────────────────────────────────────────────────►│                    │
       │                         │                        │                    │
       │  7. verifyAuthPbxUser() │                        │                    │
       │─────────────────────────────────────────────────────────────────────►│
       │                         │                        │                    │
       │                         │                        │                    │
       │◄─────────────────────────────────────────────────────────────────────│
       │  8. Verification Result │                        │                    │
       │                         │                        │                    │
       ├──── If SUCCESS ─────────────────────────────────────────────────────►│
       │     Redirect to /dashboard                                            │
       │                                                                       │
       ├──── If NO PBX USER ──────────────────────────────────────────────────►│
       │     Redirect to /onboarding (need to complete setup)                  │
       │                                                                       │
       └──── If FAILED ───────────────────────────────────────────────────────►│
             Sign out + Redirect to /sign-in with error                        │
```

### Sign-Up Flow (New User Onboarding)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          SIGN-UP FLOW (NEW USER)                              │
└──────────────────────────────────────────────────────────────────────────────┘

    User                   Sign-Up Page              Ternsecure           Backend
      │                          │                        │                    │
      │  1. Enter details        │                        │                    │
      │─────────────────────────►│                        │                    │
      │                          │                        │                    │
      │                          │  2. signUp()           │                    │
      │                          │───────────────────────►│                    │
      │                          │                        │                    │
      │                          │  3. User created       │                    │
      │                          │◄───────────────────────│                    │
      │                          │                        │                    │
      │                          │  4. onSuccess callback │                    │
      │                          │     createAuthPbxUser()│                    │
      │                          │─────────────────────────────────────────────►│
      │                          │                        │                    │
      │                          │                        │   5. Create:       │
      │                          │                        │   - auth_user      │
      │                          │                        │   - pbx_users      │
      │                          │                        │                    │
      │                          │  6. Force redirect     │                    │
      │◄─────────────────────────│     to /onboarding     │                    │
      │                          │                        │                    │
      ▼                          │                        │                    │
┌─────────────┐                  │                        │                    │
│ /onboarding │                  │                        │                    │
│    Page     │                  │                        │                    │
└──────┬──────┘                  │                        │                    │
       │                         │                        │                    │
       │  7. Collect company info│                        │                    │
       │     - Company name      │                        │                    │
       │     - Domain preference │                        │                    │
       │     - Plan selection    │                        │                    │
       │                         │                        │                    │
       │  8. completeOnboarding()│                        │                    │
       │─────────────────────────────────────────────────────────────────────►│
       │                         │                        │                    │
       │                         │                        │   9. Create:       │
       │                         │                        │   - auth_tenant    │
       │                         │                        │   - pbx_domains    │
       │                         │                        │   - Link user      │
       │                         │                        │                    │
       │◄─────────────────────────────────────────────────────────────────────│
       │  10. Success            │                        │                    │
       │                         │                        │                    │
       │  11. Redirect to /dashboard                                           │
       ▼                                                                       │
┌─────────────┐                                                                │
│ /dashboard  │                                                                │
│ (PBX Ready) │                                                                │
└─────────────┘                                                                │
```

### Invited User Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      INVITED USER SIGN-UP FLOW                                │
└──────────────────────────────────────────────────────────────────────────────┘

    Invited User            Sign-Up Page              Ternsecure           Backend
      │                          │                        │                    │
      │  1. Click invite link    │                        │                    │
      │  /sign-up?token=xxx      │                        │                    │
      │─────────────────────────►│                        │                    │
      │                          │                        │                    │
      │                          │  2. Validate invite    │                    │
      │                          │─────────────────────────────────────────────►│
      │                          │                        │                    │
      │                          │◄─────────────────────────────────────────────│
      │                          │  3. Get tenant/domain  │                    │
      │                          │     from invite        │                    │
      │                          │                        │                    │
      │  4. Complete sign-up     │                        │                    │
      │─────────────────────────►│                        │                    │
      │                          │                        │                    │
      │                          │  5. signUp()           │                    │
      │                          │───────────────────────►│                    │
      │                          │                        │                    │
      │                          │  6. onSuccess callback │                    │
      │                          │     - Use invite data  │                    │
      │                          │     - Link to existing │                    │
      │                          │       tenant & domain  │                    │
      │                          │─────────────────────────────────────────────►│
      │                          │                        │                    │
      │                          │                        │   7. Create:       │
      │                          │                        │   - auth_user      │
      │                          │                        │     (with tenantId)│
      │                          │                        │   - pbx_users      │
      │                          │                        │     (with domainId)│
      │                          │                        │   - pbx_extension  │
      │                          │                        │                    │
      │  8. Force redirect to /auth/verify (skip onboarding)                   │
      │◄─────────────────────────│                        │                    │
      │                          │                        │                    │
      ▼                          │                        │                    │
┌─────────────┐                  │                        │                    │
│ /auth/verify│─── Success ─────────────────────────────────────► /dashboard   │
└─────────────┘                                                                │
```

---

## Recommended File Structure

```
app/
├── (auth)/                          # Auth group (existing)
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx             # With onSuccess handler
│   └── sign-up/
│       └── [[...sign-up]]/
│           └── page.tsx             # With onSuccess -> createAuthPbxUser
│
├── auth/                            # New verification routes
│   └── verify/
│       └── page.tsx                 # NEW: PBX verification page
│
├── onboarding/                      # New onboarding routes
│   ├── page.tsx                     # NEW: Main onboarding wizard
│   └── complete/
│       └── page.tsx                 # NEW: Completion confirmation
│
├── sign-in/                         # Duplicate routes (remove or redirect)
│   └── [[...sign-in]]/
│       └── page.tsx                 # Consider removing
│
├── sign-up/                         # Duplicate routes (remove or redirect)
│   └── [[...sign-up]]/
│       └── page.tsx                 # Consider removing
│
└── dashboard/                       # Protected PBX dashboard
    └── ...
```

---

## Implementation Guide

### 1. Environment Variables

Update your `.env.local`:

```env
# Ternsecure Auth Redirects
NEXT_PUBLIC_SIGN_IN_FORCE_REDIRECT_URL=/auth/verify
NEXT_PUBLIC_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# For invited users (handled via query params)
# NEXT_PUBLIC_SIGN_UP_FORCE_REDIRECT_URL=/auth/verify?source=invite
```

### 2. Verification Page (`/auth/verify/page.tsx`)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ternSecureAuth } from '@tern-secure/nextjs'
import { verifyAuthPbxUser } from '@/app/actions'
import { Loader2 } from 'lucide-react'

type VerifyStatus = 'loading' | 'success' | 'no-pbx-user' | 'error'

export default function VerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<VerifyStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verify() {
      try {
        const currentUser = await ternSecureAuth.currentUser

        if (!currentUser) {
          // No authenticated user, redirect to sign-in
          router.replace('/sign-in')
          return
        }

        const result = await verifyAuthPbxUser(
          currentUser.uid,
          currentUser.tenantId || 'default'
        )

        if (result.success) {
          if (result.data?.pbx) {
            // User has PBX access - go to dashboard
            setStatus('success')
            router.replace('/dashboard')
          } else {
            // User authenticated but no PBX user - needs onboarding
            setStatus('no-pbx-user')
            router.replace('/onboarding')
          }
        } else {
          // Verification failed
          setStatus('error')
          setError(result.error?.message || 'Verification failed')
          
          // Sign out and redirect to sign-in with error
          await ternSecureAuth.signOut()
          router.replace(`/sign-in?error=${encodeURIComponent(result.error?.message || 'Access denied')}`)
        }
      } catch (err) {
        console.error('Verification error:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
        
        await ternSecureAuth.signOut()
        router.replace('/sign-in?error=verification_failed')
      }
    }

    verify()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Verifying your access...</p>
          </>
        )}
        {status === 'error' && (
          <div className="text-destructive">
            <p>Verification failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 3. Onboarding Page (`/onboarding/page.tsx`)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ternSecureAuth } from '@tern-secure/nextjs'
import { completeOnboarding } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface OnboardingData {
  companyName: string
  domain: string
  plan: 'basic' | 'professional' | 'enterprise'
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    domain: '',
    plan: 'basic'
  })

  useEffect(() => {
    async function checkUser() {
      const user = await ternSecureAuth.currentUser
      if (!user) {
        router.replace('/sign-in')
        return
      }
      setCurrentUser(user)
    }
    checkUser()
  }, [router])

  const handleSubmit = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const result = await completeOnboarding({
        uid: currentUser.uid,
        email: currentUser.email,
        tenantId: currentUser.tenantId || 'default',
        companyName: data.companyName,
        domain: data.domain,
        plan: data.plan
      })

      if (result.success) {
        router.replace('/dashboard')
      } else {
        console.error('Onboarding failed:', result.error)
        // Show error to user
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Setup</CardTitle>
          <CardDescription>
            Set up your Cloud PBX account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">PBX Domain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="domain"
                    value={data.domain}
                    onChange={(e) => setData({ ...data, domain: e.target.value.toLowerCase() })}
                    placeholder="acme"
                  />
                  <span className="text-muted-foreground">.cloudpbx.com</span>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Plan</Label>
                <div className="grid gap-2">
                  {['basic', 'professional', 'enterprise'].map((plan) => (
                    <div
                      key={plan}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        data.plan === plan ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setData({ ...data, plan: plan as any })}
                    >
                      <p className="font-medium capitalize">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4. Server Action: Complete Onboarding

Add to `app/actions.ts`:

```typescript
export async function completeOnboarding(input: {
  uid: string
  email: string
  tenantId: string
  companyName: string
  domain: string
  plan: 'basic' | 'professional' | 'enterprise'
}): Promise<{ success: boolean; error?: { message: string } }> {
  try {
    // Create or get tenant
    const tenant = await prisma.auth_tenant.upsert({
      where: { id: input.tenantId },
      update: {
        name: input.companyName,
        plan: input.plan,
      },
      create: {
        id: input.tenantId === 'default' ? crypto.randomUUID() : input.tenantId,
        name: input.companyName,
        domain: input.domain,
        plan: input.plan,
        maxUsers: input.plan === 'enterprise' ? 100 : input.plan === 'professional' ? 25 : 5,
      }
    })

    // Create PBX domain
    const pbxDomain = await prisma.pbx_domains.create({
      data: {
        id: crypto.randomUUID(),
        name: `${input.domain}.pbx.local`,
        portalName: input.domain,
        tenantId: tenant.id,
        disabled: false,
        updatedBy: 'system',
      }
    })

    // Update auth_user with correct tenant
    await prisma.auth_user.update({
      where: { uid: input.uid },
      data: {
        tenantId: tenant.id,
        isAdmin: true, // First user is admin
      }
    })

    // Update pbx_users with domain
    await prisma.pbx_users.updateMany({
      where: { auth_user_id: input.uid },
      data: {
        domainId: pbxDomain.id,
      }
    })

    revalidatePath('/dashboard')
    return { success: true }

  } catch (error) {
    console.error('Onboarding error:', error)
    return {
      success: false,
      error: { message: 'Failed to complete onboarding' }
    }
  }
}
```

### 5. Updated verifyAuthPbxUser

The current implementation already checks for PBX user. Update it to distinguish between "no user at all" and "user exists but no PBX setup":

```typescript
export async function verifyAuthPbxUser(
  uid: string,
  tenantId: string
): Promise<VerifyResult> {
  try {
    const verifyResult = await verifyAuthUser(uid, tenantId);

    if (!verifyResult.exists || !verifyResult.user) {
      return {
        success: false,
        needsOnboarding: true, // NEW: indicates onboarding needed
        error: {
          message: 'User not found in system',
          code: 404
        }
      };
    }

    const { user } = verifyResult;

    // Check if user has PBX access
    const hasPbxAccess = user.pbx_user && !user.pbx_user.disabled;
    const hasDomain = user.pbx_user?.domainId != null;

    if (!hasPbxAccess || !hasDomain) {
      return {
        success: true,  // Auth is valid
        needsOnboarding: true, // But needs PBX setup
        data: {
          auth: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            disabled: user.disabled,
            emailVerified: user.emailVerified,
            tenantId: user.tenantId
          },
          pbx: undefined,
          tenant: user.tenant
        }
      };
    }

    return {
      success: true,
      needsOnboarding: false,
      data: {
        auth: { /* ... */ },
        pbx: { /* ... */ },
        tenant: user.tenant
      }
    };

  } catch (error) {
    console.error('Error verifying user:', error);
    return {
      success: false,
      needsOnboarding: false,
      error: {
        message: 'Failed to verify user',
        code: 500
      }
    };
  }
}
```

---

## Decision Flow Chart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POST-AUTH DECISION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User Signs    │
                              │   In/Up         │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Ternsecure Auth │
                              │   Success?      │
                              └────────┬────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │ NO                        │ YES
                         ▼                           ▼
                ┌─────────────────┐         ┌─────────────────┐
                │  Show Error     │         │  Cookie Set     │
                │  Stay on Page   │         │  Force Redirect │
                └─────────────────┘         └────────┬────────┘
                                                     │
                                                     ▼
                                   ┌──────────────────────────────┐
                                   │  Is this Sign-Up or Sign-In? │
                                   └──────────────┬───────────────┘
                                                  │
                              ┌───────────────────┴───────────────────┐
                              │ SIGN-UP                               │ SIGN-IN
                              ▼                                       ▼
                     ┌─────────────────┐                    ┌─────────────────┐
                     │ /onboarding     │                    │  /auth/verify   │
                     │                 │                    │                 │
                     │ 1. Collect info │                    │ verifyAuthPbx() │
                     │ 2. Create tenant│                    └────────┬────────┘
                     │ 3. Create domain│                             │
                     │ 4. Link user    │            ┌────────────────┼────────────────┐
                     └────────┬────────┘            │                │                │
                              │                     ▼                ▼                ▼
                              │             ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                              │             │  SUCCESS    │  │ NEEDS       │  │  FAILED     │
                              │             │  Has PBX    │  │ ONBOARDING  │  │             │
                              │             └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                              │                    │                │                │
                              ▼                    ▼                ▼                ▼
                     ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                     │   /dashboard    │  │  /dashboard │  │ /onboarding │  │  /sign-in   │
                     │   (PBX Ready)   │  │             │  │             │  │  (+ error)  │
                     └─────────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Summary of Changes Needed

| File | Change |
|------|--------|
| `.env.local` | Update `SIGN_IN_FORCE_REDIRECT_URL=/auth/verify` and `SIGN_UP_FORCE_REDIRECT_URL=/onboarding` |
| `app/auth/verify/page.tsx` | **CREATE**: New verification page |
| `app/onboarding/page.tsx` | **CREATE**: New onboarding wizard |
| `app/actions.ts` | **ADD**: `completeOnboarding` action |
| `app/actions.ts` | **UPDATE**: `verifyAuthPbxUser` to include `needsOnboarding` flag |
| `lib/db/types.ts` | **UPDATE**: Add `needsOnboarding` to `VerifyResult` type |
| `app/sign-in/` and `app/sign-up/` | Consider removing duplicates or redirecting to `(auth)` versions |

---

## Key Principles

1. **Ternsecure handles auth only**: Sign-in/sign-up, token management, sessions
2. **Force redirects separate concerns**: Auth success → Verification page
3. **Verification checks PBX access**: Separate from auth success
4. **Onboarding for new users**: Creates tenant + domain + links user
5. **Invited users skip onboarding**: Already have tenant/domain from invite
