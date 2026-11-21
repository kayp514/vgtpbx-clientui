import { ServiceAccountManager } from '@tern-secure/backend/auth'
import type { Credential, ServiceAccount } from '@tern-secure/backend/auth';

/**
 * AccessToken helper class for obtaining access token
 */
export class AccessToken {
    constructor(private credential: Credential) { }

    /**
     * Get the current access token
     * @param forceRefresh - If true, forces a token refresh
     * @returns The access token string or null if unavailable
     */
    public async getToken(forceRefresh: boolean = false): Promise<string | null> {
        const token = await this.credential.getAccessToken(forceRefresh);
        const accessToken = token?.accessToken || null;
        return accessToken;
    }
}

/**
 * Get service account credentials from environment variables
 */
function getServiceAccountFromEnv(): ServiceAccount {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
        throw new Error(
            'Missing required environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL'
        );
    }

    return {
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
    };
}


let credentialInstance: ServiceAccountManager | null = null;

/**
 * Get the singleton ServiceAccountManager instance
 */
export function getCredential(): ServiceAccountManager {
    if (!credentialInstance) {
        const serviceAccount = getServiceAccountFromEnv();
        credentialInstance = new ServiceAccountManager(serviceAccount);
    }
    return credentialInstance;
}

/**
 * Get an AccessToken instance using the default service account
 * Assign the required roles/permissions to the service account used to create the token.
 * Otherwise, the API will return an error 'user denied'
 */
export function getAccessToken(): AccessToken {
    const credential = getCredential();
    return new AccessToken(credential);
}