import { navigation, type NavItem } from "@/lib/navigation"

import type { InboundRule } from "@/lib/mock-type"

export const mockInboundRules: InboundRule[] = [
  {
    id: "rule1",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },
  {
    id: "rule2",
    name: "After Hours",
    description: "Route after-hours calls to voicemail",
    pattern: "^\\+1(\\d{10})$",
    destination: "after-hours-vm",
    destinationType: "voicemail",
    enabled: true,
    priority: 200,
    normalizationRules: [
      {
        id: "norm-2",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
      {
        id: "norm-3",
        pattern: "^(\\d{3})(\\d{3})(\\d{4})$",
        replacement: "$1-$2-$3",
        description: "Format as XXX-XXX-XXXX",
      },
    ],
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-07-10T11:15:00Z",
  },

  {
    id: "rule3",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule4",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule5",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule6",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule7",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule8",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule9",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule10",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },

  {
    id: "rule11",
    name: "Main Office Hours",
    description: "Route calls during business hours to the main IVR",
    pattern: "^\\+1(\\d{10})$",
    destination: "main-ivr",
    destinationType: "ivr",
    enabled: true,
    priority: 100,
    normalizationRules: [
      {
        id: "norm-1",
        pattern: "^\\+1(\\d{10})$",
        replacement: "$1",
        description: "Strip +1 from US numbers",
      },
    ],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },
]

export async function getInboundRules(): Promise<InboundRule[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockInboundRules
}

export async function getInboundRule(id: string): Promise<InboundRule | undefined> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockInboundRules.find((rule) => rule.id === id)
}

export async function createInboundRule(data: any): Promise<InboundRule> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const newRule: InboundRule = {
    id: `rule-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return newRule
}

export async function updateInboundRule(id: string, data: any): Promise<InboundRule> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const existingRule = mockInboundRules.find((rule) => rule.id === id)
  if (!existingRule) {
    throw new Error(`Rule with ID ${id} not found`)
  }

  const updatedRule: InboundRule = {
    ...existingRule,
    ...data,
    updatedAt: new Date().toISOString(),
  }

  return updatedRule
}

export async function deleteInboundRule(id: string): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  // In a real app, you would delete the rule from the database
}

export const destinationOptions = [
  { label: "Extension", value: "extension" },
  { label: "IVR Menu", value: "ivr" },
  { label: "Ring Group", value: "ring_group" },
  { label: "Voicemail", value: "voicemail" },
  { label: "Call Queue", value: "queue" },
]


export interface AuthUsers {
    uid: string
    displayName: string
    email: string
    firstName: string
    lastName: string
    disabled: boolean
    isAdmin: boolean
    isStaff: boolean
    isSuperuser: boolean
    department?: string // Added for compatibility with existing UI
    lastLogin?: string // Added for compatibility with existing UI
    createdAt?: string // Added for compatibility with existing UI
  }
  
  // Helper function to determine user roles based on boolean flags
  export function getUserRoles(user: AuthUsers): string[] {
    const roles: string[] = []
  
    if (user.isAdmin) roles.push("admin")
    if (user.isSuperuser) roles.push("superuser")
    if (user.isStaff) roles.push("staff")
    if (!user.isAdmin && !user.isSuperuser && !user.isStaff) roles.push("member")
  
    return roles
  }
  
  // Helper function to get primary role (for display purposes)
  export function getPrimaryRole(user: AuthUsers): string {
    if (user.isAdmin) return "admin"
    if (user.isSuperuser) return "superuser"
    if (user.isStaff) return "staff"
    return "member"
  }
  
  export const departments = [
    "IT",
    "Operations",
    "Sales",
    "Marketing",
    "HR",
    "Finance",
    "Customer Support",
    "Research & Development",
    "Legal",
    "Executive",
  ]
  
  export async function getUsers(): Promise<AuthUsers[]> {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    return [
      {
        uid: "1",
        displayName: "John Doe",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        disabled: false,
        isAdmin: true,
        isStaff: false,
        isSuperuser: false,
        department: "IT",
        lastLogin: "2023-04-15T10:30:00Z",
        createdAt: "2022-01-10T08:00:00Z",
      },
      {
        uid: "2",
        displayName: "Jane Smith",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: false,
        isSuperuser: true,
        department: "Operations",
        lastLogin: "2023-04-14T14:45:00Z",
        createdAt: "2022-02-15T09:30:00Z",
      },
      {
        uid: "3",
        displayName: "Robert Johnson",
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.johnson@example.com",
        disabled: true,
        isAdmin: false,
        isStaff: false,
        isSuperuser: false,
        department: "Sales",
        lastLogin: "2023-03-20T11:15:00Z",
        createdAt: "2022-03-05T10:15:00Z",
      },
      {
        uid: "4",
        displayName: "Emily Davis",
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: false,
        isSuperuser: false,
        department: "Marketing",
        lastLogin: "2023-04-15T09:20:00Z",
        createdAt: "2022-04-12T14:00:00Z",
      },
      {
        uid: "5",
        displayName: "Michael Wilson",
        firstName: "Michael",
        lastName: "Wilson",
        email: "michael.wilson@example.com",
        disabled: false,
        isAdmin: true,
        isStaff: false,
        isSuperuser: true, // Both admin and superuser
        department: "IT",
        lastLogin: "2023-04-14T16:30:00Z",
        createdAt: "2022-01-20T11:45:00Z",
      },
      {
        uid: "6",
        displayName: "Sarah Brown",
        firstName: "Sarah",
        lastName: "Brown",
        email: "sarah.brown@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: true,
        isSuperuser: false,
        department: "HR",
        lastLogin: "",
        createdAt: "2023-04-10T13:20:00Z",
      },
      {
        uid: "7",
        displayName: "David Miller",
        firstName: "David",
        lastName: "Miller",
        email: "david.miller@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: true,
        isSuperuser: false,
        department: "Finance",
        lastLogin: "2023-04-12T10:10:00Z",
        createdAt: "2022-06-15T09:00:00Z",
      },
      {
        uid: "8",
        displayName: "Jennifer Taylor",
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: false,
        isSuperuser: false,
        department: "Operations",
        lastLogin: "2023-04-13T15:45:00Z",
        createdAt: "2022-07-22T08:30:00Z",
      },

      {
        uid: "11",
        displayName: "Jennifer Taylor",
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: false,
        isSuperuser: false,
        department: "Operations",
        lastLogin: "2023-04-13T15:45:00Z",
        createdAt: "2022-07-22T08:30:00Z",
      },

      {
        uid: "9",
        displayName: "Jennifer Taylor",
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: false,
        isSuperuser: false,
        department: "Operations",
        lastLogin: "2023-04-13T15:45:00Z",
        createdAt: "2022-07-22T08:30:00Z",
      },

      {
        uid: "10",
        displayName: "Jennifer Taylor",
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@example.com",
        disabled: false,
        isAdmin: false,
        isStaff: false,
        isSuperuser: false,
        department: "Operations",
        lastLogin: "2023-04-13T15:45:00Z",
        createdAt: "2022-07-22T08:30:00Z",
      },
    ]
  }
  
  export async function createUser(userData: Omit<AuthUsers, "uid" | "createdAt" | "lastLogin">): Promise<AuthUsers> {
    // In a real app, this would be an API call to create a user
    console.log("Creating user:", userData)
  
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  
    // Return a mock response with generated ID and timestamps
    return {
      ...userData,
      uid: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      lastLogin: "",
    }
  }
  
  export async function updateUser(uid: string, userData: Partial<AuthUsers>): Promise<AuthUsers> {
    // In a real app, this would be an API call to update a user
    console.log(`Updating user with ID: ${uid}`, userData)
  
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  
    // Return a mock response
    return {
      uid,
      displayName: userData.displayName || "",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      disabled: userData.disabled !== undefined ? userData.disabled : false,
      isAdmin: userData.isAdmin !== undefined ? userData.isAdmin : false,
      isStaff: userData.isStaff !== undefined ? userData.isStaff : false,
      isSuperuser: userData.isSuperuser !== undefined ? userData.isSuperuser : false,
      department: userData.department,
      lastLogin: userData.lastLogin || new Date().toISOString(),
      createdAt: userData.createdAt || new Date().toISOString(),
    }
  }
  
  export async function deleteUser(uid: string): Promise<void> {
    // In a real app, this would be an API call to delete a user
    console.log(`Deleting user with ID: ${uid}`)
  
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  
  export async function toggleUserStatus(uid: string): Promise<void> {
    // In a real app, this would be an API call to toggle the user status
    console.log(`Toggling status for user with ID: ${uid}`)
  
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500))
  }




export type UserRole = "admin" | "superuser" | "member" | "guest" | "staff"

export interface PortalAccess {
  id: string
  navItemPath: string // Path to the navigation item (e.g., "overview.dashboard")
  navItemName: string // Display name of the navigation item
  roles: UserRole[] // Roles that can access this item
  isVisible: boolean // Whether this item is visible in the portal
  isDefault: boolean // Whether this is a default landing page for any role
  defaultForRoles: UserRole[] // Roles for which this is the default landing page
  lastModified: string
}

export interface RoleDefaultPage {
  role: UserRole
  defaultPageId: string | null
}

export interface PortalConfiguration {
  id: string
  name: string
  description: string
  isActive: boolean
  accessItems: PortalAccess[]
  roleDefaults: RoleDefaultPage[]
  createdAt: string
  updatedAt: string
}

// Helper function to flatten navigation items for easier processing
export function flattenNavigation(
  navItems: NavItem[],
  parentPath = "",
  result: { path: string; item: NavItem }[] = [],
): { path: string; item: NavItem }[] {
  navItems.forEach((item) => {
    const currentPath = parentPath ? `${parentPath}.${item.name}` : item.name
    result.push({ path: currentPath, item })

    if (item.submenu) {
      flattenNavigation(item.submenu, currentPath, result)
    }
  })

  return result
}

// Generate mock portal access data based on the navigation configuration
function generateMockPortalAccess(): PortalAccess[] {
  const flatNav = flattenNavigation(navigation)

  return flatNav
    .filter((nav) => nav.item.href) // Only include items with href
    .map((nav) => ({
      id: Math.random().toString(36).substring(2, 11),
      navItemPath: nav.path,
      navItemName: nav.item.name,
      roles: (nav.item.roles || ["admin", "superuser", "member"]) as UserRole[],
      isVisible: true,
      isDefault: nav.item.href === "/dashboard",
      defaultForRoles: nav.item.href === "/dashboard" ? ["member"] : [],
      lastModified: new Date().toISOString(),
    }))
}

// Mock data for portal configurations
export async function getPortalConfigurations(): Promise<PortalConfiguration[]> {
  // In a real app, this would be an API call
  const mockAccess = generateMockPortalAccess()

  return [
    {
      id: "default",
      name: "Default Portal Configuration",
      description: "Default access configuration for the portal",
      isActive: true,
      accessItems: mockAccess,
      roleDefaults: [
        { role: "admin", defaultPageId: mockAccess.find((item) => item.navItemPath.includes("dashboard"))?.id || null },
        {
          role: "superuser",
          defaultPageId: mockAccess.find((item) => item.navItemPath.includes("dashboard"))?.id || null,
        },
        {
          role: "member",
          defaultPageId: mockAccess.find((item) => item.navItemPath.includes("dashboard"))?.id || null,
        },
        { role: "staff", defaultPageId: mockAccess.find((item) => item.navItemPath.includes("dashboard"))?.id || null },
        { role: "guest", defaultPageId: mockAccess.find((item) => item.navItemPath.includes("dashboard"))?.id || null },
      ],
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  ]
}

export async function updatePortalConfiguration(
  configId: string,
  updates: Partial<PortalConfiguration>,
): Promise<PortalConfiguration> {
  // In a real app, this would be an API call
  console.log(`Updating portal configuration ${configId}:`, updates)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock updated configuration
  return {
    id: configId,
    name: updates.name || "Updated Configuration",
    description: updates.description || "Updated description",
    isActive: updates.isActive !== undefined ? updates.isActive : true,
    accessItems: updates.accessItems || generateMockPortalAccess(),
    roleDefaults: updates.roleDefaults || [
      { role: "admin", defaultPageId: null },
      { role: "superuser", defaultPageId: null },
      { role: "member", defaultPageId: null },
      { role: "staff", defaultPageId: null },
      { role: "guest", defaultPageId: null },
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  }
}

export async function updatePortalAccess(
  configId: string,
  accessId: string,
  updates: Partial<PortalAccess>,
): Promise<PortalAccess> {
  // In a real app, this would be an API call
  console.log(`Updating portal access ${accessId} in config ${configId}:`, updates)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock updated access
  return {
    id: accessId,
    navItemPath: updates.navItemPath || "",
    navItemName: updates.navItemName || "",
    roles: updates.roles || [],
    isVisible: updates.isVisible !== undefined ? updates.isVisible : true,
    isDefault: updates.isDefault !== undefined ? updates.isDefault : false,
    defaultForRoles: updates.defaultForRoles || [],
    lastModified: new Date().toISOString(),
  }
}

export async function updateRoleDefaultPage(
  configId: string,
  role: UserRole,
  defaultPageId: string | null,
): Promise<RoleDefaultPage> {
  // In a real app, this would be an API call
  console.log(`Updating default page for role ${role} in config ${configId}:`, defaultPageId)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock updated role default
  return {
    role,
    defaultPageId,
  }
}

export const availableRoles: UserRole[] = ["admin", "superuser", "member", "staff", "guest"]



export interface Tenant {
  id: string
  name: string
  domain: string
  plan: string
  status: "active" | "suspended" | "pending" | "expired"
  usersCount: number
  extensionsCount: number
  createdAt: string
  expiresAt?: string
}

export async function getTenants(): Promise<Tenant[]> {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return [
    {
      id: "1",
      name: "Acme Corporation",
      domain: "acme.vogatpbx.com",
      plan: "Enterprise",
      status: "active",
      usersCount: 45,
      extensionsCount: 120,
      createdAt: "2023-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Globex Industries",
      domain: "globex.vogatpbx.com",
      plan: "Business",
      status: "active",
      usersCount: 28,
      extensionsCount: 65,
      createdAt: "2023-02-22T14:45:00Z",
    },
    {
      id: "3",
      name: "Initech LLC",
      domain: "initech.vogatpbx.com",
      plan: "Professional",
      status: "suspended",
      usersCount: 12,
      extensionsCount: 30,
      createdAt: "2023-03-10T09:15:00Z",
      expiresAt: "2023-09-10T09:15:00Z",
    },
    {
      id: "4",
      name: "Umbrella Corp",
      domain: "umbrella.vogatpbx.com",
      plan: "Enterprise",
      status: "active",
      usersCount: 78,
      extensionsCount: 210,
      createdAt: "2022-11-05T16:20:00Z",
    },
    {
      id: "5",
      name: "Stark Industries",
      domain: "stark.vogatpbx.com",
      plan: "Enterprise Plus",
      status: "active",
      usersCount: 120,
      extensionsCount: 350,
      createdAt: "2022-08-18T11:10:00Z",
    },
    {
      id: "6",
      name: "Wayne Enterprises",
      domain: "wayne.vogatpbx.com",
      plan: "Enterprise",
      status: "active",
      usersCount: 95,
      extensionsCount: 280,
      createdAt: "2022-09-30T13:25:00Z",
    },
    {
      id: "7",
      name: "Cyberdyne Systems",
      domain: "cyberdyne.vogatpbx.com",
      plan: "Business",
      status: "expired",
      usersCount: 35,
      extensionsCount: 85,
      createdAt: "2023-01-20T08:40:00Z",
      expiresAt: "2023-07-20T08:40:00Z",
    },
    {
      id: "8",
      name: "Soylent Corp",
      domain: "soylent.vogatpbx.com",
      plan: "Professional",
      status: "pending",
      usersCount: 8,
      extensionsCount: 20,
      createdAt: "2023-04-05T15:50:00Z",
    },
  ]
}

export async function toggleTenantStatus(id: string): Promise<void> {
  // In a real app, this would be an API call to toggle the tenant status
  console.log(`Toggling tenant status with ID: ${id}`)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) => setTimeout(resolve, 500))
}

export async function deleteTenant(id: string): Promise<void> {
  // In a real app, this would be an API call to delete the tenant
  console.log(`Deleting tenant with ID: ${id}`)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) => setTimeout(resolve, 500))
}

export async function createTenant(tenant: Omit<Tenant, "id" | "createdAt">): Promise<Tenant> {
  // In a real app, this would be an API call to create a tenant
  console.log("Creating tenant:", tenant)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        ...tenant,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
      })
    }, 500),
  )
}

export async function updateTenant(id: string, tenant: Partial<Tenant>): Promise<Tenant> {
  console.log(`Updating tenant with ID: ${id}`, tenant)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        id,
        name: tenant.name || "",
        domain: tenant.domain || "",
        plan: tenant.plan || "",
        status: tenant.status || "active",
        usersCount: tenant.usersCount || 0,
        extensionsCount: tenant.extensionsCount || 0,
        createdAt: tenant.createdAt || new Date().toISOString(),
        expiresAt: tenant.expiresAt,
      })
    }, 500),
  )
}

export const availablePlans = ["Free", "Starter", "Professional", "Business", "Enterprise", "Enterprise Plus"]



export interface Domain {
  id: string
  name: string
  tenant: string
  portalName: string
  homeSwitch?: string
  description?: string
  disabled: boolean
}

export interface TenantOption {
  id: string
  name: string
}

export async function getDomains(): Promise<Domain[]> {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return [
    {
      id: "1",
      name: "acme.vogatpbx.com",
      tenant: "1",
      portalName: "Acme Portal",
      homeSwitch: "switch1.vogatpbx.com",
      description: "Main domain for Acme Corporation",
      disabled: false,
    },
    {
      id: "2",
      name: "sales.acme.vogatpbx.com",
      tenant: "1",
      portalName: "Acme Sales Portal",
      homeSwitch: "switch1.vogatpbx.com",
      description: "Sales department domain for Acme",
      disabled: false,
    },
    {
      id: "3",
      name: "globex.vogatpbx.com",
      tenant: "2",
      portalName: "Globex Portal",
      homeSwitch: "switch2.vogatpbx.com",
      description: "Main domain for Globex Industries",
      disabled: false,
    },
    {
      id: "4",
      name: "support.globex.vogatpbx.com",
      tenant: "2",
      portalName: "Globex Support",
      homeSwitch: "switch2.vogatpbx.com",
      description: "Support portal for Globex Industries",
      disabled: true,
    },
    {
      id: "5",
      name: "initech.vogatpbx.com",
      tenant: "3",
      portalName: "Initech Portal",
      homeSwitch: "switch1.vogatpbx.com",
      description: "Main domain for Initech LLC",
      disabled: true,
    },
    {
      id: "6",
      name: "umbrella.vogatpbx.com",
      tenant: "4",
      portalName: "Umbrella Portal",
      homeSwitch: "switch3.vogatpbx.com",
      description: "Main domain for Umbrella Corp",
      disabled: false,
    },
    {
      id: "7",
      name: "stark.vogatpbx.com",
      tenant: "5",
      portalName: "Stark Industries Portal",
      homeSwitch: "switch3.vogatpbx.com",
      description: "Main domain for Stark Industries",
      disabled: false,
    },
    {
      id: "8",
      name: "wayne.vogatpbx.com",
      tenant: "6",
      portalName: "Wayne Enterprises Portal",
      homeSwitch: "switch2.vogatpbx.com",
      description: "Main domain for Wayne Enterprises",
      disabled: false,
    },
  ]
}

export async function getTenantOptions(): Promise<TenantOption[]> {
  // Get tenants and convert to options format
  const tenants = await getTenants()
  return tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
  }))
}

export async function toggleDomainStatus(id: string): Promise<void> {
  // In a real app, this would be an API call to toggle the domain status
  console.log(`Toggling domain status with ID: ${id}`)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) => setTimeout(resolve, 500))
}

export async function deleteDomain(id: string): Promise<void> {
  // In a real app, this would be an API call to delete the domain
  console.log(`Deleting domain with ID: ${id}`)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) => setTimeout(resolve, 500))
}

export async function createDomain(domain: Omit<Domain, "id">): Promise<Domain> {
  // In a real app, this would be an API call to create a domain
  console.log("Creating domain:", domain)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        ...domain,
        id: Math.random().toString(36).substring(2, 11),
      })
    }, 500),
  )
}

export async function updateDomain(id: string, domain: Partial<Domain>): Promise<Domain> {
  // In a real app, this would be an API call to update a domain
  console.log(`Updating domain with ID: ${id}`, domain)
  // Return a promise that resolves after a short delay to simulate API call
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        id,
        name: domain.name || "",
        tenant: domain.tenant || "",
        portalName: domain.portalName || "",
        homeSwitch: domain.homeSwitch,
        description: domain.description,
        disabled: domain.disabled !== undefined ? domain.disabled : false,
      })
    }, 500),
  )
}

export const availableSwitches = [
  "switch1.vogatpbx.com",
  "switch2.vogatpbx.com",
  "switch3.vogatpbx.com",
  "switch4.vogatpbx.com",
]

//account settings


export interface AccountDetails {
  id: string
  name: string
  email: string
  status: "active" | "suspended" | "pending" | "expired"
  plan: {
    name: string
    tier: "free" | "starter" | "professional" | "business" | "enterprise"
    price: number
    billingCycle: "monthly" | "annually"
    features: string[]
    limits: {
      users: number
      extensions: number
      storage: number // in GB
    }
  }
  createdAt: string
  updatedAt: string
  billingInfo?: {
    nextBillingDate: string
    paymentMethod: string
    cardLastFour?: string
  }
}

export interface PlanOption {
  id: string
  name: string
  tier: "free" | "starter" | "professional" | "business" | "enterprise"
  price: {
    monthly: number
    annually: number
  }
  features: string[]
  limits: {
    users: number
    extensions: number
    storage: number // in GB
  }
  recommended?: boolean
}

export async function getAccountDetails(): Promise<AccountDetails> {
  // In a real app, this would fetch from an API
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: "acc_01HPQW3JDKZN5T6G8X9Y0Z1A2B",
    name: "Acme Corporation",
    email: "admin@acmecorp.com",
    status: "active",
    plan: {
      name: "Professional",
      tier: "professional",
      price: 49.99,
      billingCycle: "monthly",
      features: ["Unlimited calls", "Advanced call routing", "Call recording", "API access", "Priority support"],
      limits: {
        users: 25,
        extensions: 50,
        storage: 100,
      },
    },
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-04-22T14:45:00Z",
    billingInfo: {
      nextBillingDate: "2023-05-15T00:00:00Z",
      paymentMethod: "Credit Card",
      cardLastFour: "4242",
    },
  }
}

export async function getAvailablePlans(): Promise<PlanOption[]> {
  // In a real app, this would fetch from an API
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "plan_free",
      name: "Free",
      tier: "free",
      price: {
        monthly: 0,
        annually: 0,
      },
      features: ["5 users", "10 extensions", "Basic call routing", "Community support"],
      limits: {
        users: 5,
        extensions: 10,
        storage: 5,
      },
    },
    {
      id: "plan_starter",
      name: "Starter",
      tier: "starter",
      price: {
        monthly: 19.99,
        annually: 199.99,
      },
      features: ["10 users", "20 extensions", "Basic call routing", "Call recording (7 days)", "Email support"],
      limits: {
        users: 10,
        extensions: 20,
        storage: 25,
      },
    },
    {
      id: "plan_professional",
      name: "Professional",
      tier: "professional",
      price: {
        monthly: 49.99,
        annually: 499.99,
      },
      features: [
        "25 users",
        "50 extensions",
        "Advanced call routing",
        "Call recording (30 days)",
        "API access",
        "Priority support",
      ],
      limits: {
        users: 25,
        extensions: 50,
        storage: 100,
      },
      recommended: true,
    },
    {
      id: "plan_business",
      name: "Business",
      tier: "business",
      price: {
        monthly: 99.99,
        annually: 999.99,
      },
      features: [
        "100 users",
        "200 extensions",
        "Advanced call routing",
        "Call recording (90 days)",
        "API access",
        "Custom integrations",
        "24/7 support",
      ],
      limits: {
        users: 100,
        extensions: 200,
        storage: 500,
      },
    },
    {
      id: "plan_enterprise",
      name: "Enterprise",
      tier: "enterprise",
      price: {
        monthly: 199.99,
        annually: 1999.99,
      },
      features: [
        "Unlimited users",
        "Unlimited extensions",
        "Advanced call routing",
        "Call recording (unlimited)",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Custom development",
      ],
      limits: {
        users: Number.POSITIVE_INFINITY,
        extensions: Number.POSITIVE_INFINITY,
        storage: 1000,
      },
    },
  ]
}

export async function upgradePlan(planId: string): Promise<{ success: boolean; message: string }> {
  // In a real app, this would call an API to upgrade the plan
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    message: "Plan upgraded successfully. Changes will be reflected in your billing cycle.",
  }
}





  
  