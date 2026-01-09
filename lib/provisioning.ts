

export type SwitchStatus = "pending" | "provisioning" | "ready" | "failed"


export interface PbxDomain {
    id: string
    domainName: string
    status: SwitchStatus
    homeSwitch: string | null
    ipAddress: string | null
}


export function getStatusMessage(status: SwitchStatus): string {
    switch (status) {
        case "pending":
            return "Your PBX is queued for provisioning"
        case "provisioning":
            return "Setting up your PBX infrastructure..."
        case "ready":
            return "Your PBX is ready to use"
        case "failed":
            return "Provisioning failed. Please contact support or retry."
        default:
            return "Unknown status"
    }
}


export function getStatusLabel(status: SwitchStatus): string {
    switch (status) {
        case "pending":
            return "Pending"
        case "provisioning":
            return "Setting up"
        case "ready":
            return "Ready"
        case "failed":
            return "Failed"
        default:
            return "Unknown"
    }
}

export function isProvisioningInProgress(status: SwitchStatus): boolean {
    return status === "pending" || status === "provisioning"
}
