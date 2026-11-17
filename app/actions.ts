"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createUserWithPbx, verifyAuthUser } from "@/lib/db/queries";

import type {
  DomainUser,
  FirebaseAuthUser,
  SignUpResult,
  VerifyResult,
} from "@/lib/db/types";

import {
  createNextSessionCookie,
  clearNextSessionCookie,
  clearSessionCookieServer,
  createSessionCookieServer,
  setNextServerSession,
} from "@tern-secure/nextjs/admin";
import { listUsersByDomainSlug, getSlugByUserId } from "@/lib/db/queries_v2";
import { publishSwitchProvisioning } from "@/utils/RestPubSub";
import type { PbxDomain, SwitchStatus } from "@/lib/provisioning";

export async function addExtension(formData: FormData) {
  const extension = formData.get("extension") as string;
  const password = formData.get("password") as string;
  const domain_uuid = formData.get("domain_uuid") as string;
  const user_context = formData.get("user_context") as string;

  try {
    const newExtension = await prisma.pbx_extensions.create({
      data: {
        id: crypto.randomUUID(),
        extension,
        password,
        domain_uuid,
        user_context,
        created: new Date(),
        updated: new Date(),
        updated_by: "system",
        disabled: false,
        directory_visible: "true",
        directory_exten_visible: "true",
        call_screen_enabled: "false",
        do_not_disturb: "false",
        forward_all_enabled: "false",
        forward_busy_enabled: "false",
        forward_no_answer_enabled: "false",
        forward_user_not_registered_enabled: "false",
        follow_me_enabled: "false",
        force_ping: "false",
      },
    });

    revalidatePath("/dashboard/accounts/extensions");
    return { success: true, data: newExtension };
  } catch (error) {
    console.error("Error adding extension:", error);
    return { success: false, error: "Failed to add extension" };
  }
}

export async function createAuthPbxUser(
  firebaseUser: FirebaseAuthUser,
): Promise<SignUpResult> {
  try {
    const verifyResult = await verifyAuthUser(
      firebaseUser.uid,
      firebaseUser.email,
    );

    if (verifyResult.exists) {
      return {
        success: false,
        error: { message: "User already exists" },
      };
    }

    const authUserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      avatar: firebaseUser.photoURL || null,
      phoneNumber: firebaseUser.phoneNumber || null,
      emailVerified: firebaseUser.emailVerified,
      tenantId: firebaseUser.tenantId,
      disabled: false,
      isAdmin: false,
      isSuperuser: false,
      isStaff: false,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      lastSignInAt: new Date(
        firebaseUser.metadata.lastSignInTime || Date.now(),
      ),
    };

    const pbxUserData = {
      username: firebaseUser.email.split("@")[0],
      email: firebaseUser.email,
      status: "active",
      disabled: false,
      updatedBy: "system",
      settings: [
        {
          category: "preferences",
          subcategory: "general",
          value_type: "string",
          value: "default",
          sequence: 1,
          enabled: true,
        },
      ],
    };

    const { authUser, pbxUser } = await createUserWithPbx(
      authUserData,
      pbxUserData,
    );

    return {
      success: true,
      data: {
        auth: authUser,
        pbx: pbxUser,
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);

    return {
      success: false,
      error: {
        message: "Failed to create user",
        code: 500,
      },
    };
  }
}

export async function verifyAuthPbxUser(
  uid: string,
  tenantId: string,
): Promise<VerifyResult> {
  try {
    const verifyResult = await verifyAuthUser(uid, tenantId);

    if (!verifyResult.exists || !verifyResult.user) {
      return {
        success: false,
        needsOnboarding: true,
        error: {
          message: "User not found in system",
          code: 404,
        },
      };
    }

    const { user } = verifyResult;

    if (verifyResult.error) {
      return {
        success: false,
        needsOnboarding: false,
        error: {
          message: verifyResult.error,
          code: 403,
        },
      };
    }

    const hasPbxAccess = user.pbx_user && !user.pbx_user.disabled;
    const hasDomain = user.pbx_user?.domainId != null;

    if (!hasPbxAccess || !hasDomain) {
      return {
        success: true,
        needsOnboarding: true,
        data: {
          auth: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            disabled: user.disabled,
            tenantId: user.tenantId,
          },
          pbx: user.pbx_user
            ? {
                id: user.pbx_user.id,
                username: user.pbx_user.username,
                status: user.pbx_user.status,
                disabled: user.pbx_user.disabled,
                domainId: user.pbx_user.domainId || undefined,
              }
            : undefined,
          tenant: {
            ...user.tenant,
            name: user.tenant.name,
          },
        },
      };
    }

    // Fetch subscription slug for multi-tenant routing
    const pbxUser = user.pbx_user!;
    const subscription = await prisma.subscription.findUnique({
      where: { domainId: pbxUser.domainId! },
      select: { slug: true },
    });

    return {
      success: true,
      needsOnboarding: false,
      slug: subscription?.slug,
      data: {
        auth: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          disabled: user.disabled,
          tenantId: user.tenantId,
        },
        pbx: {
          id: pbxUser.id,
          username: pbxUser.username,
          status: pbxUser.status,
          disabled: pbxUser.disabled,
          domainId: pbxUser.domainId || undefined,
        },
        tenant: {
          ...user.tenant,
          name: user.tenant.name,
        },
      },
    };
  } catch (error) {
    console.error("Error verifying user:", error);

    return {
      success: false,
      needsOnboarding: false,
      error: {
        message: "Failed to verify user",
        code: 500,
      },
    };
  }
}

interface OnboardingInput {
  uid: string;
  email: string;
  tenantId: string;
  companyName: string;
  domain: string;
}

interface OnboardingResult {
  success: boolean;
  slug?: string;
  error?: {
    message: string;
    code?: number;
  };
  data?: {
    tenant: {
      id: string;
      name: string;
    };
    domain: {
      id: string;
      name: string;
    };
  };
}

export async function completeOnboarding(
  input: OnboardingInput,
): Promise<OnboardingResult> {
  const domainName = `${input.domain}.internal.vgtpbx.com`;

  try {
    const existingDomain = await prisma.pbx_domains.findFirst({
      where: {
        OR: [{ name: domainName }, { portalName: input.domain }],
      },
    });

    if (existingDomain) {
      return {
        success: false,
        error: {
          message:
            "This domain is already taken. Please choose a different one.",
          code: 409,
        },
      };
    }

    const existingUser = await prisma.auth_user.findUnique({
      where: { uid: input.uid },
    });

    if (!existingUser) {
      return {
        success: false,
        error: {
          message: "User not found.",
          code: 404,
        },
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const pbxDomain = await tx.pbx_domains.create({
        data: {
          id: crypto.randomUUID(),
          name: domainName,
          portalName: input.domain,
          disabled: false,
          updatedBy: "system",
          description: `PBX domain for ${input.companyName}`,
        },
      });

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      await tx.subscription.create({
        data: {
          domainId: pbxDomain.id,
          slug: input.domain,
          displayName: input.companyName,
          plan: "basic",
          maxUsers: 5,
          maxExtensions: 10,
          billingEmail: input.email,
          billingCycle: "monthly",
          status: "trialing",
          trialEndsAt,
        },
      });

      await tx.pbx_users.create({
        data: {
          user_uuid: crypto.randomUUID(),
          username: input.email.split("@")[0],
          email: input.email,
          status: "active",
          disabled: false,
          updatedBy: "system",
          domainId: pbxDomain.id,
          auth_user_id: input.uid,
        },
      });

      return { pbxDomain };
    });

    try {
      await publishSwitchProvisioning({
        domainId: result.pbxDomain.id,
        slug: input.domain,
        tenantId: input.tenantId,
      });
      console.log(
        "Switch provisioning message published for domain:",
        result.pbxDomain.id,
      );
    } catch (pubsubError) {
      // Log but don't fail onboarding if Pub/Sub publish fails
      // The provisioning can be retried manually or via a background job
      console.error(
        "Failed to publish switch provisioning message:",
        pubsubError,
      );
    }

    return {
      success: true,
      slug: input.domain,
      data: {
        tenant: {
          id: input.tenantId,
          name: input.companyName,
        },
        domain: {
          id: result.pbxDomain.id,
          name: result.pbxDomain.name,
        },
      },
    };
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: {
          message: "This domain or username is already taken.",
          code: 409,
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Failed to complete onboarding. Please try again.",
        code: 500,
      },
    };
  }
}

export async function validateSlug(slug: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { slug },
      select: { id: true },
    });

    return !!subscription;
  } catch (error) {
    console.error("Error validating slug:", error);
    return false;
  }
}

export async function listUsersByDomain(slug: string): Promise<DomainUser[]> {
  try {
    return await listUsersByDomainSlug(slug);
  } catch (error) {
    console.error("Error listing users by domain:", error);
    return [];
  }
}

export async function getUserSlug(uid: string): Promise<string | null> {
  try {
    return await getSlugByUserId(uid);
  } catch (error) {
    console.error("Error getting user slug:", error);
    return null;
  }
}

/**
 * Get provisioning status for a domain by slug
 */
export async function getProvisioningStatus(
  slug: string,
): Promise<PbxDomain | null> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { slug },
      select: {
        domainId: true,
        pbx_domain: {
          select: {
            id: true,
            name: true,
            homeSwitch: true,
            switchStatus: true,
            ipAddress: true,
          },
        },
      },
    });

    if (!subscription?.pbx_domain) {
      return null;
    }

    const domain = subscription.pbx_domain;
    return {
      id: domain.id,
      domainName: domain.name,
      status: domain.switchStatus as SwitchStatus,
      homeSwitch: domain.homeSwitch,
      ipAddress: domain.ipAddress,
    };
  } catch (error) {
    console.error("Error getting provisioning status:", error);
    return null;
  }
}

/**
 * Trigger provisioning (or re-provisioning) for a domain
 * Used when status is failed or for manual retry
 */
export async function triggerProvisioning(
  domainId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get domain and subscription info
    const domain = await prisma.pbx_domains.findUnique({
      where: { id: domainId },
      select: {
        id: true,
        subscription: {
          select: { slug: true },
        },
      },
    });

    if (!domain || !domain.subscription) {
      return { success: false, error: "Domain not found" };
    }

    // Update status to pending
    await prisma.pbx_domains.update({
      where: { id: domainId },
      data: { switchStatus: "pending" },
    });

    // Publish provisioning message
    await publishSwitchProvisioning({
      domainId: domain.id,
      slug: domain.subscription.slug,
      tenantId: "", // tenantId will be resolved by Cloud Run if needed
    });

    return { success: true };
  } catch (error) {
    console.error("Error triggering provisioning:", error);
    return { success: false, error: "Failed to trigger provisioning" };
  }
}

export {
  clearNextSessionCookie,
  clearSessionCookieServer,
  createSessionCookieServer,
  setNextServerSession,
  createNextSessionCookie,
};
