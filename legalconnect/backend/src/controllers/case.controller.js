import { Case } from '../models/Case.js';
import { Consultation } from '../models/Consultation.js';
import { CaseTimeline } from '../models/CaseTimeline.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, CONSULTATION_STATUS, CASE_STATUS, TIMELINE_EVENT_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';
import { logAudit } from '../services/audit.service.js';

function getIo(req) {
  return req.app.get('io');
}

function assertCaseAccess(caseDoc, userId, role) {
  const participants = [String(caseDoc.client._id || caseDoc.client), String(caseDoc.advocate._id || caseDoc.advocate)];
  if (!participants.includes(String(userId)) && role !== ROLES.ADMIN) {
    throw ApiError.forbidden('You do not have access to this case');
  }
}

export const createCase = asyncHandler(async (req, res) => {
  const { consultationId, title, description, practiceArea, priority } = req.body;
  const io = getIo(req);

  const consultation = await Consultation.findById(consultationId);
  if (!consultation) throw ApiError.notFound('Consultation not found');
  if (consultation.status !== CONSULTATION_STATUS.COMPLETED) {
    throw ApiError.badRequest('Case can only be created from a completed consultation');
  }
  if (String(consultation.advocate) !== String(req.user._id)) throw ApiError.forbidden();
  if (consultation.case) throw ApiError.conflict('A case already exists for this consultation');

  const caseDoc = await Case.create({
    title,
    description,
    client: consultation.client,
    advocate: req.user._id,
    consultation: consultationId,
    practiceArea: practiceArea || consultation.practiceArea,
    priority,
    status: CASE_STATUS.OPENED,
  });

  // Link consultation to case
  consultation.case = caseDoc._id;
  await consultation.save();

  // Create first timeline event
  await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: TIMELINE_EVENT_TYPES.CASE_CREATED,
    title: 'Case Opened',
    description: `Case "${title}" created by advocate`,
    eventDate: new Date(),
  });

  await createNotification(io, {
    recipient: consultation.client,
    type: NOTIFICATION_TYPES.CASE_UPDATE,
    title: 'New Case Created',
    message: `Your case "${title}" has been opened.`,
    link: `/client/cases/${caseDoc._id}`,
    relatedEntity: { type: 'Case', id: caseDoc._id },
  });

  await logAudit({ actor: req.user._id, action: 'case.created', entityType: 'Case', entityId: caseDoc._id, req });

  res.status(201).json({ success: true, data: caseDoc });
});

export const getCases = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === ROLES.CLIENT) query.client = req.user._id;
  else if (req.user.role === ROLES.ADVOCATE) query.advocate = req.user._id;

  if (status) query.status = status;
  query.isArchived = false;

  const total = await Case.countDocuments(query);
  const cases = await Case.find(query)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('client', 'name email avatar')
    .populate('advocate', 'name email avatar');

  res.json({
    success: true,
    data: { cases, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const getCase = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id)
    .populate('client', 'name email avatar phone')
    .populate('advocate', 'name email avatar phone')
    .populate('consultation', 'date mode legalIssue');

  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  res.json({ success: true, data: caseDoc });
});

export const updateCase = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const allowed = ['title', 'description', 'priority', 'status', 'courtName', 'caseNumber', 'opposingParty', 'importantDates'];
  const updates = {};
  let statusChanged = false;
  const oldStatus = caseDoc.status;

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      if (field === 'status' && req.body[field] !== caseDoc.status) statusChanged = true;
      updates[field] = req.body[field];
    }
  }

  const updated = await Case.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
    .populate('client', 'name email avatar')
    .populate('advocate', 'name email avatar');

  const io = getIo(req);

  if (statusChanged) {
    await CaseTimeline.create({
      case: caseDoc._id,
      createdBy: req.user._id,
      type: TIMELINE_EVENT_TYPES.STATUS_CHANGED,
      title: 'Case Status Updated',
      description: `Status changed from "${oldStatus}" to "${req.body.status}"`,
    });

    const notifyId = req.user.role === ROLES.ADVOCATE ? String(caseDoc.client) : String(caseDoc.advocate);
    await createNotification(io, {
      recipient: notifyId,
      type: NOTIFICATION_TYPES.CASE_UPDATE,
      title: 'Case Status Updated',
      message: `Case "${caseDoc.title}" status changed to ${req.body.status}`,
      link: `/${req.user.role === ROLES.ADVOCATE ? 'client' : 'advocate'}/cases/${caseDoc._id}`,
      relatedEntity: { type: 'Case', id: caseDoc._id },
    });
  }

  res.json({ success: true, data: updated });
});
