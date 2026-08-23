import type {
  AuthUserFull,
  DatabaseUserInput,
  Extension,
  ExtensionCreateInput,
  ExtensionUpdateInput,
  ExtensionDisplay,
  Gateway,
  GatewayCreateInput,
  GatewayUpdateInput,
  GatewayDisplay,
  Domain,
  DomainCreateInput,
  DomainUpdateInput,
  DomainDisplay,
  DomainSettingCreateInput,
  AccessControl,
  AccessControlCreateInput,
  AccessControlUpdateInput,
  AccessControlDisplay,
  EmailTemplate,
  EmailTemplateCreateInput,
  EmailTemplateUpdateInput,
  EmailTemplateDisplay,
  Module,
  ModuleCreateInput,
  ModuleUpdateInput,
  ModuleDisplay,
  Variable,
  VariableCreateInput,
  VariableUpdateInput,
  VariableDisplay,
  Tenant,
  TenantCreateInput,
  TenantUpdateInput,
  TenantDisplay,
  PbxUserCreateInput,
  PbxUserUpdateInput,
  PbxUserDisplay,
  PbxUserFull,
} from "@/lib/db/types"
import {
  AUTH_USER_DEFAULTS,
  DEFAULT_EXTENSION_VALUES,
  EXTENSION_USER_DEFAULTS,
  EMAIL_TEMPLATE_DEFAULTS,
  GATEWAY_DEFAULTS,
  DOMAIN_DEFAULTS,
  DOMAIN_SETTING_DEFAULTS,
  ACCESS_CONTROL_DEFAULTS,
  ACCESS_CONTROL_NODE_DEFAULTS,
  MODULE_DEFAULTS,
  VARIABLE_DEFAULTS,
  TENANT_DEFAULTS,
  PBX_USER_DEFAULTS,
  PBX_USER_SETTING_DEFAULTS,
} from '@/lib/db/types'

import prisma from '@/lib/prisma';


const isDevelopment = process.env.NODE_ENV === 'development'

const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://vgtpbx.dev'


interface VerifyAuthUserResult {
  exists: boolean;
  user: {
    uid: string;
    email: string;
    displayName: string | null;
    disabled: boolean;
    tenantId: string;
    pbx_user?: {
      id: bigint;
      username: string;
      status: string;
      disabled: boolean;
      domainId?: string | null;
    };
    tenant: {
      id: string;
      name: string;
      disabled: boolean;
    };
  } | null;
  error?: string;
}


export async function createUserWithPbx(
  authInput: DatabaseUserInput,
  pbxInput?: Partial<PbxUserCreateInput>
): Promise<{
  authUser: AuthUserFull;
  pbxUser: PbxUserFull;
}> {
  try {
    return await prisma.$transaction(async (tx) => {
      const authUser = await tx.auth_user.create({
        //create auth_user first
        data: {
          ...AUTH_USER_DEFAULTS,
          ...authInput,
        },
        include: {
          auth_tenant: true,
        }
      });

      //creare corresponding pbx_user
      const pbxUser = await tx.pbx_users.create({
        data: {
          ...PBX_USER_DEFAULTS,
          user_uuid: crypto.randomUUID(),
          username: authInput.email.split('@')[0],
          email: authInput.email,
          status: 'active',
          disabled: false,
          auth_user_id: authUser.uid,
          updatedBy: 'system',
          ...pbxInput,
          pbx_user_settings: pbxInput?.settings ? {
            create: pbxInput.settings.map(setting => ({
              ...PBX_USER_SETTING_DEFAULTS,
              ...setting
            }))
          } : undefined,
        },
        include: {
          pbx_user_settings: true,
          auth_user: true
        }
      });

      return {
        authUser,
        pbxUser
      };
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        throw new Error('User with this email or username already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
    throw new Error('Failed to create user');
  }
}


export async function createAuthUser(input: DatabaseUserInput): Promise<AuthUserFull> {
  try {
    return await prisma.auth_user.create({
      data: {
        ...AUTH_USER_DEFAULTS,
        ...input,
      },
      include: {
        auth_tenant: true,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create auth user');
  }
}


export async function verifyAuthUser(
  uid: string,
  tenantId: string
): Promise<VerifyAuthUserResult> {
  try {
    const user = await prisma.auth_user.findFirst({
      where: {
        AND: [
          { uid },
          { tenantId },
          { disabled: false },
        ]
      },
      select: {
        uid: true,
        email: true,
        displayName: true,
        disabled: true,
        tenantId: true,
        pbx_users: {
          select: {
            id: true,
            username: true,
            disabled: true,
            status: true,
            domainId: true,
          }
        },
        auth_tenant: {
          select: {
            id: true,
            name: true,
            disabled: true,
          }
        }
      }
    });

    if (!user) {
      return {
        exists: false,
        user: null,
        error: 'User not found'
      };
    }

    if (user.auth_tenant.disabled) {
      return {
        exists: false,
        user: null,
        error: 'Tenant is disabled'
      };
    }

    const pbxUser = user.pbx_users && user.pbx_users.length > 0 ? user.pbx_users[0] : undefined;

    const transformedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      disabled: user.disabled,
      tenantId: user.tenantId,
      pbx_user: pbxUser ? {
        id: pbxUser.id,
        username: pbxUser.username,
        status: pbxUser.status,
        disabled: pbxUser.disabled,
        domainId: pbxUser.domainId,
      } : undefined,
      tenant: {
        id: user.auth_tenant.id,
        name: user.auth_tenant.name,
        disabled: user.auth_tenant.disabled,
      }
    };

    return {
      exists: true,
      user: transformedUser,
      error: undefined
    };

  } catch (error) {
    console.error('Error verifying auth user:', error);
    return {
      exists: false,
      user: null,
      error: error instanceof Error ? error.message : 'Failed to verify user'
    };
  }
}



export async function listPbxUsers(): Promise<PbxUserDisplay[]> {
  try {
    return await prisma.pbx_users.findMany({
      select: {
        id: true,
        user_uuid: true,
        username: true,
        email: true,
        status: true,
        disabled: true,
        auth_user: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      },
      orderBy: { created: 'desc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
  }
}


export async function getPbxUser(id: bigint): Promise<PbxUserFull | null> {
  try {
    return await prisma.pbx_users.findUnique({
      where: { id },
      include: {
        pbx_user_settings: true,
        auth_user: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
  }
}


export async function createPbxUser(input: PbxUserCreateInput): Promise<PbxUserFull> {
  try {

    const authUser = await prisma.auth_user.findUnique({
      where: { uid: input.auth_user_id }
    });

    if (!authUser) {
      throw new Error('Auth user not found');
    }

    const { settings, ...userData } = input;

    return await prisma.pbx_users.create({
      data: {
        ...PBX_USER_DEFAULTS,
        ...userData,
        pbx_user_settings: settings ? {
          create: settings.map(setting => ({
            ...PBX_USER_SETTING_DEFAULTS,
            ...setting
          }))
        } : undefined
      },
      include: {
        pbx_user_settings: true,
        auth_user: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create user');
  }
}


export async function PbxupdateUser(
  id: bigint,
  data: PbxUserUpdateInput
): Promise<PbxUserFull> {
  try {
    const { settings, ...userData } = data;

    return await prisma.pbx_users.update({
      where: { id },
      data: {
        ...userData,
        updated: new Date(),
        updatedBy: data.updatedBy || 'system',
        pbx_user_settings: settings ? {
          deleteMany: {},  // Remove existing settings
          create: settings.map(setting => ({
            ...PBX_USER_SETTING_DEFAULTS,
            ...setting
          }))
        } : undefined
      },
      include: {
        pbx_user_settings: true,
        auth_user: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update user');
  }
}


export async function PbxdeleteUser(id: bigint): Promise<void> {
  try {
    await prisma.pbx_users.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
  }
}



export async function createUserOld(input: DatabaseUserInput | null) {
  console.log("user: createUser received input:", input);
  if (!input) {
    console.error("user: Input is null in createUser");
    throw new Error("User input data is required")
  }


  try {
    // Create a sanitized version of the input data
    const sanitizedData = {
      uid: input.uid,
      email: input.email.toLowerCase(),
      displayName: input.displayName,
      firstName: input.firstName,
      lastName: input.lastName,
      avatar: input.avatar,
      tenantId: input.tenantId,
      isSuperuser: input.isSuperuser,
      isAdmin: input.isAdmin,
      isStaff: input.isStaff,
      phoneNumber: input.phoneNumber,
      emailVerified: input.emailVerified,
      disabled: input.disabled,
      createdAt: input.createdAt,
      lastSignInAt: input.lastSignInAt,
      updatedAt: new Date(),
    }

    console.log("user: Cleaned user data:", sanitizedData)


    const user = await prisma.auth_user.create({
      data: sanitizedData,
      select: {
        uid: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatar: true,
        tenantId: true,
        isSuperuser: true,
        isAdmin: true,
        isStaff: true,
        phoneNumber: true,
        disabled: true,
        updatedAt: true,
        createdAt: true,
        lastSignInAt: true,
      },
    })

    if (!user) {
      throw new Error("Failed to create user: No user returned from database")
    }

    console.log("Prisma create operation returned:", user);

    return user
  } catch (error) {
    console.error("Detailed error in createUser:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
    })
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        throw new Error("User with this email or uid already exists")
      }
      if (error.message.includes("Foreign key constraint")) {
        throw new Error("Invalid tenant ID")
      }
      throw new Error(`Failed to create user: ${error.message}`)
    }
    throw new Error("Failed to create user: Unknown error")
  }
}


export async function verifyDatabaseUser(uid: string): Promise<{
  success: boolean;
  user?: {
    uid: string;
    email: string;
    displayName: string | null;
    tenantId: string;
    isAdmin: boolean;
    emailVerified: boolean;
    disabled: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}> {
  try {
    const dbUser = await prisma.auth_user.findUnique({
      where: { uid },
      select: {
        uid: true,
        email: true,
        displayName: true,
        tenantId: true,
        isAdmin: true,
        disabled: true,
      }
    })

    if (!dbUser) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in database'
        }
      }
    }

    if (dbUser.disabled) {
      return {
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is inactive'
        }
      }
    }

    return {
      success: true,
      user: dbUser
    }
  } catch (error) {
    console.error('Error verifying database user:', error)
    return {
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to verify user'
      }
    }
  }
}



export async function listDomains(): Promise<DomainDisplay[]> {
  try {
    return await prisma.pbx_domains.findMany({
      select: {
        id: true,
        name: true,
        portalName: true,
        homeSwitch: true,
        description: true,
        disabled: true,
      },
      orderBy: { created: 'desc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch domains');
  }
}

export async function getDomain(id: string): Promise<Domain | null> {
  try {
    return await prisma.pbx_domains.findUnique({
      where: { id },
      include: {
        domain_settings: true,
      }
    });
  } catch (error) {
    console.error('Error fetching domain:', error)
    throw error
  }
}

export async function createDomain(input: DomainCreateInput): Promise<Domain> {
  try {
    const { settings, ...domainData } = input;

    return await prisma.pbx_domains.create({
      data: {
        ...DOMAIN_DEFAULTS,
        ...domainData,
        domain_settings: settings ? {
          create: settings.map(setting => ({
            ...DOMAIN_SETTING_DEFAULTS,
            ...setting
          }))
        } : undefined
      },
      include: {
        domain_settings: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create domain');
  }
}


export async function updateDomain(
  id: string,
  data: DomainUpdateInput
): Promise<Domain> {
  try {
    const { settings, ...domainData } = data;

    return await prisma.pbx_domains.update({
      where: { id },
      data: {
        ...domainData,
        updated: new Date(),
        updatedBy: data.updatedBy || 'system',
        domain_settings: settings ? {
          deleteMany: {},
          create: settings.map(setting => ({
            ...DOMAIN_SETTING_DEFAULTS,
            ...setting
          }))
        } : undefined
      },
      include: {
        domain_settings: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update domain');
  }
}

/**
 * Update domain switch provisioning status
 * Used by Cloud Run provisioning service to update homeSwitch, switchStatus, ipAddress
 */
export async function updateDomainSwitchStatus(
  id: string,
  data: {
    switchStatus: string;
    homeSwitch?: string;
    ipAddress?: string;
  }
): Promise<{
  id: string;
  name: string;
  homeSwitch: string | null;
  switchStatus: string;
  ipAddress: string | null;
}> {
  return await prisma.pbx_domains.update({
    where: { id },
    data: {
      switchStatus: data.switchStatus,
      ...(data.homeSwitch !== undefined && { homeSwitch: data.homeSwitch }),
      ...(data.ipAddress !== undefined && { ipAddress: data.ipAddress }),
      updated: new Date(),
    },
    select: {
      id: true,
      name: true,
      homeSwitch: true,
      switchStatus: true,
      ipAddress: true,
    },
  });
}

export async function deleteDomain(id: string): Promise<void> {
  try {
    await prisma.pbx_domains.delete({
      where: { id },
      include: {
        domain_settings: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete domain');
  }
}

export async function listAccessControls(): Promise<AccessControlDisplay[]> {
  try {
    return await prisma.pbx_access_controls.findMany({
      select: {
        id: true,
        name: true,
        default: true,
        description: true,
      },
      orderBy: { created: 'desc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch access controls');
  }
}


export async function getAccessControl(id: string): Promise<AccessControl | null> {
  try {
    return await prisma.pbx_access_controls.findUnique({
      where: { id },
      include: {
        pbx_access_control_nodes: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch access control');
  }
}

export async function createAccessControl(input: AccessControlCreateInput): Promise<AccessControl> {
  try {
    const { nodes, ...accessControlData } = input;

    return await prisma.pbx_access_controls.create({
      data: {
        ...ACCESS_CONTROL_DEFAULTS,
        ...accessControlData,
        pbx_access_control_nodes: nodes ? {
          create: nodes.map(node => ({
            ...ACCESS_CONTROL_NODE_DEFAULTS,
            ...node
          }))
        } : undefined
      },
      include: {
        pbx_access_control_nodes: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create access control');
  }
}


export async function updateAccessControl(
  id: string,
  data: AccessControlUpdateInput
): Promise<AccessControl> {
  try {
    const { nodes, ...accessControlData } = data;

    return await prisma.pbx_access_controls.update({
      where: { id },
      data: {
        ...accessControlData,
        updated: new Date(),
        updated_by: data.updated_by || 'system',
        pbx_access_control_nodes: nodes ? {
          deleteMany: {},  // Remove existing nodes
          create: nodes.map(node => ({
            ...ACCESS_CONTROL_NODE_DEFAULTS,
            ...node
          }))
        } : undefined
      },
      include: {
        pbx_access_control_nodes: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update access control');
  }
}


export async function deleteAccessControl(id: string): Promise<void> {
  try {
    await prisma.pbx_access_controls.delete({
      where: { id },
      include: {
        pbx_access_control_nodes: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete access control');
  }
}

export async function listEmailTemplates(): Promise<EmailTemplateDisplay[]> {
  try {
    return await prisma.pbx_email_templates.findMany({
      select: {
        id: true,
        language: true,
        category: true,
        subcategory: true,
        subject: true,
        type: true,
        enabled: true,
        description: true,
      },
      orderBy: { created: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch email templates');
  }
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  try {
    return await prisma.pbx_email_templates.findUnique({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch email template');
  }
}

export async function createEmailTemplate(
  input: EmailTemplateCreateInput
): Promise<EmailTemplate> {
  try {
    return await prisma.pbx_email_templates.create({
      data: {
        ...EMAIL_TEMPLATE_DEFAULTS,
        ...input,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create email template');
  }
}


export async function updateEmailTemplate(
  id: string,
  data: EmailTemplateUpdateInput
): Promise<EmailTemplate> {
  try {
    return await prisma.pbx_email_templates.update({
      where: { id },
      data: {
        ...data,
        updated: new Date(),
        updatedBy: data.updatedBy || 'system',
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update email template');
  }
}


export async function deleteEmailTemplate(id: string): Promise<void> {
  try {
    await prisma.pbx_email_templates.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete email template');
  }
}

export async function listExtensions(): Promise<ExtensionDisplay[]> {
  try {
    return await prisma.pbx_extensions.findMany({
      select: {
        id: true,
        extension: true,
        effective_caller_id_name: true,
        effective_caller_id_number: true,
        call_group: true,
        user_context: true,
        disabled: true,
      },
      orderBy: { created: 'desc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch extensions');
  }
}

export async function getExtension(id: string): Promise<Extension | null> {
  try {
    return await prisma.pbx_extensions.findUnique({
      where: { id },
      include: {
        pbx_extension_users: true,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch extension');
  }
}

export async function createExtension(
  input: ExtensionCreateInput
): Promise<Extension> {
  try {
    const { users, ...extensionData } = input;

    return await prisma.pbx_extensions.create({
      data: {
        ...DEFAULT_EXTENSION_VALUES,
        ...extensionData,
        pbx_extension_users: users ? {
          create: users.map(user => ({
            ...EXTENSION_USER_DEFAULTS,
            ...user,
          })),
        } : undefined,
      },
      include: {
        pbx_extension_users: true,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create extension');
  }
}

export async function updateExtension(
  id: string,
  data: ExtensionUpdateInput
): Promise<Extension> {
  try {
    const { users, ...extensionData } = data;

    return await prisma.pbx_extensions.update({
      where: { id },
      data: {
        ...extensionData,
        updated: new Date(),
        updated_by: data.updated_by || 'system',
        pbx_extension_users: users ? {
          deleteMany: {},
          create: users.map(user => ({
            ...EXTENSION_USER_DEFAULTS,
            ...user,
          })),
        } : undefined,
      },
      include: {
        pbx_extension_users: true,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update extension');
  }
}


export async function getExtensionSettings(id: string): Promise<Extension | null> {
  try {
    return await prisma.pbx_extensions.findUnique({
      where: { id },
      include: {
        pbx_extension_users: true,
      }
    });
  } catch (error) {
    console.error('Error fetching extension settings:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch extension settings');
  }
}

export async function deleteExtension(id: string): Promise<void> {
  try {
    await prisma.pbx_extensions.delete({
      where: { id },
      include: {
        pbx_extension_users: true,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete extension');
  }
}

export async function listGateways(): Promise<GatewayDisplay[]> {
  try {
    return await prisma.pbx_gateways.findMany({
      select: {
        id: true,
        gateway: true,
        proxy: true,
        context: true,
        enabled: true,
        description: true,
        profile: true,
      },
      orderBy: { created: 'desc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch gateways');
  }
}


export async function getGateway(id: string): Promise<Gateway | null> {
  try {
    return await prisma.pbx_gateways.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching gateways:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch gateway');
  }
}

export async function createGateway(input: GatewayCreateInput): Promise<Gateway> {
  try {
    return await prisma.pbx_gateways.create({
      data: {
        ...GATEWAY_DEFAULTS,
        ...input,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create gateway');
  }
}

export async function updateGateway(
  id: string,
  data: GatewayUpdateInput
): Promise<Gateway> {
  try {
    return await prisma.pbx_gateways.update({
      where: { id },
      data: {
        ...data,
        updated: new Date(),
        updated_by: data.updated_by || 'system',
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update gateway');
  }
}

export async function deleteGateway(id: string): Promise<void> {
  try {
    await prisma.pbx_gateways.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete gateway');
  }
}


export async function listModules(): Promise<ModuleDisplay[]> {
  try {
    return await prisma.pbx_modules.findMany({
      select: {
        id: true,
        label: true,
        name: true,
        category: true,
        enabled: true,
        default_enabled: true,
        description: true,
      },
      orderBy: { sequence: 'asc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch modules');
  }
}


export async function getModule(id: string): Promise<Module | null> {
  try {
    return await prisma.pbx_modules.findUnique({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch module');
  }
}


export async function createModule(input: ModuleCreateInput): Promise<Module> {
  try {
    return await prisma.pbx_modules.create({
      data: {
        ...MODULE_DEFAULTS,
        ...input,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create module');
  }
}


export async function updateModule(
  id: string,
  data: ModuleUpdateInput
): Promise<Module> {
  try {
    return await prisma.pbx_modules.update({
      where: { id },
      data: {
        ...data,
        updated: new Date(),
        updated_by: data.updated_by || 'system',
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update module');
  }
}


export async function deleteModule(id: string): Promise<void> {
  try {
    await prisma.pbx_modules.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete module');
  }
}


export async function listVariables(): Promise<VariableDisplay[]> {
  try {
    return await prisma.pbx_vars.findMany({
      select: {
        id: true,
        category: true,
        name: true,
        value: true,
        hostname: true,
        enabled: true,
        description: true,
      },
      orderBy: [
        { category: 'asc' },
        { sequence: 'asc' }
      ]
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch variables');
  }
}


export async function getVariable(id: string): Promise<Variable | null> {
  try {
    return await prisma.pbx_vars.findUnique({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch variable');
  }
}

export async function createVariable(input: VariableCreateInput): Promise<Variable> {
  try {
    return await prisma.pbx_vars.create({
      data: {
        ...VARIABLE_DEFAULTS,
        ...input,
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create variable');
  }
}

export async function updateVariable(
  id: string,
  data: VariableUpdateInput
): Promise<Variable> {
  try {
    return await prisma.pbx_vars.update({
      where: { id },
      data: {
        ...data,
        updated: new Date(),
        updated_by: data.updated_by || 'system',
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update variable');
  }
}


export async function deleteVariable(id: string): Promise<void> {
  try {
    await prisma.pbx_vars.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete variable');
  }
}


export async function listTenants(): Promise<TenantDisplay[]> {
  try {
    return await prisma.auth_tenant.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        description: true,
        logo: true,
        plan: true,
        maxUsers: true,
        disabled: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch tenants');
  }
}


export async function getTenant(id: string): Promise<Tenant | null> {
  try {
    return await prisma.auth_tenant.findUnique({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch tenant');
  }
}


export async function createTenant(input: TenantCreateInput): Promise<Tenant> {
  try {
    return await prisma.auth_tenant.create({
      data: {
        ...TENANT_DEFAULTS,
        ...input,
      },
      include: {
        users: true,
        pbxDomains: true
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create tenant');
  }
}


export async function updateTenant(
  id: string,
  data: TenantUpdateInput
): Promise<Tenant> {
  try {
    return await prisma.auth_tenant.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update tenant');
  }
}


export async function deleteTenant(id: string): Promise<void> {
  try {
    await prisma.auth_tenant.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete tenant');
  }
}
