export const ROLES = { CLIENT: 'client', ADVOCATE: 'advocate', ADMIN: 'admin' };

export const ROLE_HOME = {
  client: '/client/dashboard',
  advocate: '/advocate/dashboard',
  admin: '/admin/dashboard',
};

// Suggestions for the registration form; admin-managed practice areas arrive in a later module
export const PRACTICE_AREAS = [
  'Family Law', 'Property Law', 'Criminal Law', 'Corporate Law', 'Civil Litigation',
  'Labour & Employment', 'Consumer Protection', 'Tax Law', 'Intellectual Property',
  'Cyber Law', 'Banking & Finance', 'Immigration',
];

export const CASE_STATUSES = [
  'Consultation', 'Opened', 'Document Collection', 'Under Review',
  'Action Required', 'Hearing', 'Resolved', 'Closed',
];
