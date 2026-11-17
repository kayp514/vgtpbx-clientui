import prisma from '@/lib/prisma';
import type { DomainUser } from '@/lib/db/types';

// TODO(VGT-30): inviting a member replaces the old auth-table and
// invitation queries. The server creates the Firebase user in the admin's tenant and
// inserts a pbx_users row with status "invited".
// TODO(VGT-31): a pending guest is a pbx_users row with status "invited" and
// no firebaseUid, bound on the guest's first sign-in.

// ============================================================================
// DOMAIN USER QUERIES
// ============================================================================

// TODO(VGT-19): resolve the domain from the host name, not subscription.slug.
// TODO(VGT-32): merge Firebase profile data (name, photo) into the list.
export async function listUsersByDomainSlug(slug: string): Promise<DomainUser[]> {
    const subscription = await prisma.subscription.findUnique({
        where: { slug },
        select: { domainId: true }
    });

    if (!subscription) {
        return [];
    }

    return prisma.pbx_users.findMany({
        where: {
            domainId: subscription.domainId
        },
        select: {
            id: true,
            user_uuid: true,
            username: true,
            email: true,
            status: true,
            userType: true,
            firebaseUid: true,
            groupId: true,
            created: true,
        },
        orderBy: {
            created: 'desc'
        }
    });
}

/**
 * Get subscription slug for a user by their Firebase uid
 * Used when we need to determine which domain a user belongs to
 */
// TODO(VGT-19): routing moves to the host name; this lookup goes away.
export async function getSlugByUserId(uid: string): Promise<string | null> {
    const pbxUser = await prisma.pbx_users.findFirst({
        where: { firebaseUid: uid },
        select: {
            domainId: true,
            pbx_domains: {
                select: {
                    subscription: {
                        select: { slug: true }
                    }
                }
            }
        }
    });

    return pbxUser?.pbx_domains?.subscription?.slug ?? null;
}
