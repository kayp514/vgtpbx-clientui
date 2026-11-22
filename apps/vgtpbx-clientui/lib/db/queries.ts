import type {
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
  PbxUserCreateInput,
  PbxUserUpdateInput,
  PbxUserDisplay,
  PbxUserFull,
} from "@/lib/db/types"
import {
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
  PBX_USER_DEFAULTS,
  PBX_USER_SETTING_DEFAULTS,
} from '@/lib/db/types'

import prisma from '@vgtpbx/db';


const isDevelopment = process.env.NODE_ENV === 'development'

const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://vgtpbx.dev'











export async function listPbxUsers(): Promise<PbxUserDisplay[]> {
  try {
    return await prisma.pbx_users.findMany({
      select: {
        id: true,
        user_uuid: true,
        username: true,
        email: true,
        status: true,
        userType: true,
        firebaseUid: true,
        groupId: true,
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
      }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
  }
}


export async function createPbxUser(input: PbxUserCreateInput): Promise<PbxUserFull> {
  try {
    // TODO(VGT-30): inviting a member creates the Firebase user in the admin's
    // tenant first, then inserts this row with status "invited".
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










