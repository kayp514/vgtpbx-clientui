"use server";

import prisma from "@vgtpbx/db";
import { revalidatePath } from "next/cache";
import type {
  DomainUser,
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

// TODO(VGT-16): the member or guest access check on every request replaces
// this lookup. It read the old auth tables, which no longer exist.
export async function verifyAuthPbxUser(
  _uid: string,
  _tenantId: string,
): Promise<VerifyResult> {
  return {
    success: false,
    needsOnboarding: false,
    error: {
      message: "Sign-in verification is not available yet.",
      code: 501,
    },
  };
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

    const result = await prisma.$transaction(async (tx) => {
      const pbxDomain = await tx.pbx_domains.create({
        data: {
          id: crypto.randomUUID(),
          name: domainName,
          portalName: input.domain,
          disabled: false,
          updatedBy: "system",
          description: `PBX domain for ${input.companyName}`,
          // TODO(VGT-27): create the Firebase tenant for this organization
          // first and store its ID here. Delete the tenant if this write fails.
          firebaseTenantId: input.tenantId,
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
          updatedBy: "system",
          domainId: pbxDomain.id,
          firebaseUid: input.uid,
          homeTenantId: input.tenantId,
          userType: "member",
          // TODO(VGT-27): the first user of a domain gets the admin role.
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
