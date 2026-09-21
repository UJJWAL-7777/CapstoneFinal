export const ROLES = Object.freeze({
  CLIENT: 'client',
  ADVOCATE: 'advocate',
  ADMIN: 'admin',
});

export const SELF_REGISTER_ROLES = [ROLES.CLIENT, ROLES.ADVOCATE];

export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
});

export const VERIFICATION_STATUS = Object.freeze({
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
});

export const CONSULTATION_MODES = ['video', 'chat', 'in-person'];

export const CONSULTATION_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
});

export const CASE_STATUS = Object.freeze({
  CONSULTATION: 'Consultation',
  OPENED: 'Opened',
  DOCUMENT_COLLECTION: 'Document Collection',
  UNDER_REVIEW: 'Under Review',
  ACTION_REQUIRED: 'Action Required',
  HEARING: 'Hearing',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
});

export const CASE_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const TASK_STATUS = Object.freeze({
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
});

export const HEARING_STATUS = Object.freeze({
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  ADJOURNED: 'Adjourned',
  CANCELLED: 'Cancelled',
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  SUCCESSFUL: 'Successful',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
});

export const NOTIFICATION_TYPES = Object.freeze({
  BOOKING: 'booking',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_REJECTED: 'booking_rejected',
  PAYMENT: 'payment',
  UPCOMING_CONSULTATION: 'upcoming_consultation',
  VIDEO_CALL: 'video_call',
  NEW_MESSAGE: 'new_message',
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_REQUEST: 'document_request',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  HEARING_SCHEDULED: 'hearing_scheduled',
  CASE_UPDATE: 'case_update',
  VERIFICATION_UPDATE: 'verification_update',
  BADGE_ACHIEVED: 'badge_achieved',
  REVIEW_RECEIVED: 'review_received',
  REPORT_UPDATE: 'report_update',
  CONSULTATION_CANCELLED: 'consultation_cancelled',
});

export const REPORT_TYPES = Object.freeze({
  FAKE_PROFILE: 'Fake Profile',
  MISCONDUCT: 'Misconduct',
  HARASSMENT: 'Harassment',
  PAYMENT_ISSUE: 'Payment Issue',
  MISSED_APPOINTMENT: 'Missed Appointment',
  SUSPICIOUS_ACTIVITY: 'Suspicious Activity',
  OTHER: 'Other',
});

export const REPORT_STATUS = Object.freeze({
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
});

export const BADGE_TYPES = Object.freeze({
  VERIFIED_ADVOCATE: 'verified_advocate',
  QUICK_RESPONDER: 'quick_responder',
  RELIABLE_ADVOCATE: 'reliable_advocate',
  ACTIVE_CONSULTANT: 'active_consultant',
  EXPERIENCED_ADVOCATE: 'experienced_advocate',
  CLIENT_TRUSTED: 'client_trusted',
  TOP_RATED: 'top_rated',
  CASE_WINNER: 'case_winner',
  CASE_CHAMPION: 'case_champion',
  CLIENT_FAVORITE: 'client_favorite',
  COMMUNITY_CONTRIBUTOR: 'community_contributor',
  VERIFIED_EXPERT: 'verified_expert',
});

export const TIMELINE_EVENT_TYPES = Object.freeze({
  CASE_CREATED: 'case_created',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_REVIEWED: 'document_reviewed',
  CONSULTATION_COMPLETED: 'consultation_completed',
  NOTICE_PREPARED: 'notice_prepared',
  HEARING_SCHEDULED: 'hearing_scheduled',
  STATUS_CHANGED: 'status_changed',
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  NOTE_ADDED: 'note_added',
  CUSTOM: 'custom',
});

export const DOCUMENT_CATEGORIES = Object.freeze({
  IDENTITY: 'Identity',
  LEGAL: 'Legal',
  FINANCIAL: 'Financial',
  COURT: 'Court',
  EVIDENCE: 'Evidence',
  AGREEMENT: 'Agreement',
  CORRESPONDENCE: 'Correspondence',
  OTHER: 'Other',
});

export const PRACTICE_AREAS = [
  'Family Law',
  'Property Law',
  'Criminal Law',
  'Corporate Law',
  'Civil Litigation',
  'Labour & Employment',
  'Consumer Protection',
  'Tax Law',
  'Intellectual Property',
  'Cyber Law',
  'Banking & Finance',
  'Immigration',
  'Constitutional Law',
  'Environmental Law',
  'Medical Law',
  'Insurance Law',
];
