import { Case } from '../models/Case.js';
import { User } from '../models/User.js';
import { Consultation } from '../models/Consultation.js';
import { CaseTimeline } from '../models/CaseTimeline.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, CONSULTATION_STATUS, CASE_STATUS, CASE_PRIORITY, TIMELINE_EVENT_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';
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
  const { consultationId, clientId, title, description, practiceArea, priority, courtName, caseNumber, opposingParty } = req.body;
  const io = getIo(req);

  if (!title?.trim()) throw ApiError.badRequest('Case title is required');

  let targetClientId = clientId;
  let consultation = null;

  if (consultationId) {
    consultation = await Consultation.findById(consultationId);
    if (!consultation) throw ApiError.notFound('Consultation not found');
    if (String(consultation.advocate) !== String(req.user._id) && req.user.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('You can only create cases for your own consultations');
    }
    if (consultation.case) {
      throw ApiError.conflict('A case already exists for this consultation');
    }
    targetClientId = consultation.client;
  }

  if (!targetClientId) {
    throw ApiError.badRequest('Either a valid consultationId or clientId is required to open a case');
  }

  const clientUser = await User.findById(targetClientId);
  if (!clientUser) throw ApiError.notFound('Client not found');

  const caseDoc = await Case.create({
    title: title.trim(),
    description: description?.trim(),
    client: targetClientId,
    advocate: req.user._id,
    consultation: consultation ? consultation._id : undefined,
    practiceArea: practiceArea || (consultation ? consultation.practiceArea : 'General Legal'),
    priority: priority || CASE_PRIORITY.MEDIUM,
    status: CASE_STATUS.OPENED,
    courtName: courtName?.trim(),
    caseNumber: caseNumber?.trim(),
    opposingParty: opposingParty?.trim(),
  });

  // Link consultation to case if present
  if (consultation) {
    consultation.case = caseDoc._id;
    await consultation.save();
  }

  // Create first timeline event
  await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: TIMELINE_EVENT_TYPES.CASE_CREATED,
    title: 'Case Opened',
    description: `Case "${caseDoc.title}" opened by ${req.user.name}`,
    eventDate: new Date(),
  });

  await createNotification(io, {
    recipient: targetClientId,
    type: NOTIFICATION_TYPES.CASE_UPDATE,
    title: 'New Case Opened',
    message: `Advocate ${req.user.name} opened case "${caseDoc.title}" for you.`,
    link: `/client/cases/${caseDoc._id}`,
    relatedEntity: { type: 'Case', id: caseDoc._id },
  });

  await logAudit({ actor: req.user._id, action: 'case.created', entityType: 'Case', entityId: caseDoc._id, req });

  const populated = await Case.findById(caseDoc._id)
    .populate('client', 'name email avatar phone')
    .populate('advocate', 'name email avatar phone');

  res.status(201).json({ success: true, data: populated });
});

export const getCases = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const query = {};

  if (req.user.role === ROLES.CLIENT) query.client = req.user._id;
  else if (req.user.role === ROLES.ADVOCATE) query.advocate = req.user._id;

  if (status) query.status = status;
  if (search?.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { caseId: { $regex: search.trim(), $options: 'i' } },
      { practiceArea: { $regex: search.trim(), $options: 'i' } },
      { courtName: { $regex: search.trim(), $options: 'i' } },
    ];
  }
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
