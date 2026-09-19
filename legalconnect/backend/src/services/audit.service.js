import { AuditLog } from '../models/AuditLog.js';

// Audit logging must never break the request that triggered it.
export async function logAudit({ actor, action, entityType, entityId, metadata, req }) {
  try {
    await AuditLog.create({
      actor,
      action,
      entityType,
      entityId,
      metadata,
      ip: req?.ip,
      userAgent: req?.get?.('user-agent')?.slice(0, 255),
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}
