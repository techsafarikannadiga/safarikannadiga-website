import { FieldValue, getFirebaseDb } from './firebase-admin';
import { getAuthenticatedUser } from './firebase-auth';

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH';
export type AuditEntityType = 'TOUR' | 'GALLERY' | 'COVER_PHOTO' | 'TESTIMONIAL';

export async function recordAuditTrail(
    actionType: AuditActionType,
    entityType: AuditEntityType,
    entityId: string,
    metaDetails: Record<string, any> = {}
): Promise<void> {
    try {
        const currentUser = await getAuthenticatedUser();

        await getFirebaseDb().collection('admin_logs').add({
            admin_id: currentUser?.id || null,
            admin_email: currentUser?.email || 'system',
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details: metaDetails,
            created_at: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('[AuditTrail] Could not commit log:', error);
    }
}
