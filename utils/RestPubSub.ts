import { AccessToken, getCredential } from './AccessToken';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const TOPIC_ID = process.env.PUBSUB_SWITCH_PROVISIONING_TOPIC || 'vgtpbx-switch-provisioning';

export interface SwitchProvisioningMessage {
    domainId: string;
    slug: string;
    tenantId: string;
}

/**
 * REST API client for publishing messages to Pub/Sub
 */
export class RestPubSub {
    private projectId: string;
    private topicId: string;
    private accessToken: AccessToken;

    constructor(topicId?: string) {
        if (!PROJECT_ID) {
            throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
        }
        this.projectId = PROJECT_ID;
        this.topicId = topicId || TOPIC_ID;

        const credential = getCredential();
        this.accessToken = new AccessToken(credential);
    }

    /**
     * REST URL for publishing to the topic
     */
    private getPublishUrl(): string {
        return `https://pubsub.googleapis.com/v1/projects/${this.projectId}/topics/${this.topicId}:publish`;
    }

    /**
     * Publish a message to the Pub/Sub topic
     * @param message - The message payload to publish
     * @returns The message ID from Pub/Sub
     */
    async publish(message: SwitchProvisioningMessage): Promise<string> {
        const token = await this.accessToken.getToken();

        if (!token) {
            throw new Error('Failed to obtain access token for Pub/Sub');
        }

        // Encode message as base64 (required by Pub/Sub REST API)
        const messageData = Buffer.from(JSON.stringify(message)).toString('base64');

        const response = await fetch(this.getPublishUrl(), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        data: messageData,
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Pub/Sub publish failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json() as { messageIds: string[] };
        return result.messageIds[0];
    }

    /**
     * Publish a switch provisioning message
     * @param payload - The switch provisioning payload
     * @returns The message ID from Pub/Sub
     */
    async publishSwitchProvisioning(payload: SwitchProvisioningMessage): Promise<string> {
        return this.publish(payload);
    }
}

/**
 * Singleton instance for switch provisioning topic
 */
let switchProvisioningPubSub: RestPubSub | null = null;

/**
 * Get the singleton RestPubSub instance for switch provisioning
 */
export function getSwitchProvisioningPubSub(): RestPubSub {
    if (!switchProvisioningPubSub) {
        switchProvisioningPubSub = new RestPubSub();
    }
    return switchProvisioningPubSub;
}

/**
 * Publish a switch provisioning message
 * Convenience function that uses the singleton instance
 */
export async function publishSwitchProvisioning(
    payload: SwitchProvisioningMessage
): Promise<string> {
    const pubsub = getSwitchProvisioningPubSub();
    return pubsub.publishSwitchProvisioning(payload);
}