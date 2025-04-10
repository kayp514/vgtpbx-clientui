'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createUserWithPbx, verifyAuthUser } from '@/lib/db/queries';

import type { 
  FirebaseAuthUser, 
  SignUpResult,
  VerifyResult
} from "@/lib/db/types"


const DEFAULT_TENANT_ID = 'default'


export async function addExtension(formData: FormData) {
  const extension = formData.get('extension') as string
  const password = formData.get('password') as string
  const domain_uuid = formData.get('domain_uuid') as string
  const user_context = formData.get('user_context') as string

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
        updated_by: 'system',
        disabled: false,
        directory_visible: 'true',
        directory_exten_visible: 'true',
        call_screen_enabled: 'false',
        do_not_disturb: 'false',
        forward_all_enabled: 'false',
        forward_busy_enabled: 'false',
        forward_no_answer_enabled: 'false',
        forward_user_not_registered_enabled: 'false',
        follow_me_enabled: 'false',
        force_ping: 'false',
      },
    })

    revalidatePath('/dashboard/accounts/extensions')
    return { success: true, data: newExtension }
  } catch (error) {
    console.error('Error adding extension:', error)
    return { success: false, error: 'Failed to add extension' }
  }
}



export async function createAuthPbxUser(
  firebaseUser: FirebaseAuthUser
): Promise<SignUpResult> {
  try {
    const verifyResult = await verifyAuthUser(
      firebaseUser.uid,
      firebaseUser.email
    );

    if (verifyResult.exists) {
      return {
        success: false,
        error: { message: 'User already exists' }
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
      lastSignInAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
    };


    const pbxUserData = {
      username: firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      status: 'active',
      disabled: false,
      updatedBy: 'system',
      settings: [
        {
          category: 'preferences',
          subcategory: 'general',
          value_type: 'string',
          value: 'default',
          sequence: 1,
          enabled: true
        }
      ]
    };


    const { authUser, pbxUser } = await createUserWithPbx(
      authUserData,
      pbxUserData
    );


    return {
      success: true,
      data: {
        auth: authUser,
        pbx: pbxUser
      }
    };

  } catch (error) {
    console.error('Error creating user:', error);
    

    return {
      success: false,
      error: {
        message: 'Failed to create user',
        code: 500
      }
    };
  }
}



export async function verifyAuthPbxUser(
  uid: string,
  tenantId: string
): Promise<VerifyResult> {
  try {
    const verifyResult = await verifyAuthUser(uid, tenantId);

    if (!verifyResult.exists || !verifyResult.user) {
      return {
        success: false,
        error: {
          message: 'User not found in system',
          code: 404
        }
      };
    }

    const { user } = verifyResult;

    if (verifyResult.error) {
      return {
        success: false,
        error: {
          message: verifyResult.error,
          code: 403
        }
      };
    }

    return {
      success: true,
      data: {
        auth: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          disabled: user.disabled,
          emailVerified: user.emailVerified,
          tenantId: user.tenantId
        },
        pbx: user.pbx_user ? {
          id: user.pbx_user.id,
          username: user.pbx_user.username,
          status: user.pbx_user.status,
          disabled: user.pbx_user.disabled
        } : undefined,
        tenant: user.tenant
      }
    };

  } catch (error) {
    console.error('Error verifying user:', error);

    return {
      success: false,
      error: {
        message: 'Failed to verify user',
        code: 500
      }
    };
  }
}