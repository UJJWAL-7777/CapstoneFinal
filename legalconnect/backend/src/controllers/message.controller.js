import { Message } from '../models/Message.js';
import { Case } from '../models/Case.js';
import { Consultation } from '../models/Consultation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/index.js';

function getIo(req) {
  return req.app.get('io');
}

/**
 * GET /api/messages/conversations
 * Returns active chat threads across cases and consultations for current user
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  // 1. Fetch cases
  const caseQuery = { isArchived: false };
  if (role === ROLES.CLIENT) caseQuery.client = userId;
  else if (role === ROLES.ADVOCATE) caseQuery.advocate = userId;

  const cases = await Case.find(caseQuery)
    .populate('client', 'name email avatar phone')
    .populate('advocate', 'name email avatar phone')
    .sort({ updatedAt: -1 })
    .lean();

  // 2. Fetch consultations
  const consQuery = {};
  if (role === ROLES.CLIENT) consQuery.client = userId;
  else if (role === ROLES.ADVOCATE) consQuery.advocate = userId;

  const consultations = await Consultation.find(consQuery)
    .populate('client', 'name email avatar phone')
    .populate('advocate', 'name email avatar phone')
    .sort({ date: -1 })
    .lean();

  // Build unified thread list
  const threads = [];
  const linkedConsIds = new Set(cases.map((c) => String(c.consultation)).filter(Boolean));

  for (const c of cases) {
    const lastMsg = await Message.findOne({ case: c._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .select('content sender createdAt')
      .lean();

    threads.push({
      id: `case_${c._id}`,
      type: 'case',
      caseId: c._id,
      title: c.title,
      caseNumber: c.caseId,
      status: c.status,
      client: c.client,
      advocate: c.advocate,
      lastMessage: lastMsg,
      updatedAt: lastMsg?.createdAt || c.updatedAt,
    });
  }

  // Include consultations that aren't already represented by a case
  for (const cn of consultations) {
    if (linkedConsIds.has(String(cn._id))) continue;

    const lastMsg = await Message.findOne({ consultation: cn._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .select('content sender createdAt')
      .lean();

    threads.push({
      id: `cons_${cn._id}`,
      type: 'consultation',
      consultationId: cn._id,
      title: `Consultation: ${cn.practiceArea || 'General'} (${cn.timeSlot || 'Scheduled'})`,
      status: cn.status,
      client: cn.client,
      advocate: cn.advocate,
      lastMessage: lastMsg,
      updatedAt: lastMsg?.createdAt || cn.updatedAt,
    });
  }

  // Sort by most recent activity
  threads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json({ success: true, data: threads });
});

/**
 * GET /api/messages
 * Query messages for a case or consultation
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { caseId, consultationId, page = 1, limit = 50 } = req.query;
  const userId = String(req.user._id);

  if (!caseId && !consultationId) {
    throw ApiError.badRequest('Either caseId or consultationId is required');
  }

  let query = { isDeleted: false };

  if (caseId) {
    const caseDoc = await Case.findById(caseId).lean();
    if (!caseDoc) throw ApiError.notFound('Case not found');
    const participants = [String(caseDoc.client), String(caseDoc.advocate)];
    if (!participants.includes(userId) && req.user.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have access to this conversation');
    }
    query.case = caseId;
  } else if (consultationId) {
    const consDoc = await Consultation.findById(consultationId).lean();
    if (!consDoc) throw ApiError.notFound('Consultation not found');
    const participants = [String(consDoc.client), String(consDoc.advocate)];
    if (!participants.includes(userId) && req.user.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have access to this conversation');
    }
    query.consultation = consultationId;
  }

  const total = await Message.countDocuments(query);
  const messages = await Message.find(query)
    .sort({ createdAt: 1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('sender', 'name avatar role')
    .lean();

  // Mark unread messages as read
  await Message.updateMany(
    { ...query, sender: { $ne: userId }, readBy: { $not: { $elemMatch: { $eq: userId } } } },
    { $addToSet: { readBy: userId } }
  );

  res.json({ success: true, data: { messages, total } });
});

/**
 * POST /api/messages
 * Send a message via REST with real-time socket broadcast
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { caseId, consultationId, content, type = 'text', attachment } = req.body;
  const userId = String(req.user._id);
  const io = getIo(req);

  if (!content?.trim() && !attachment) {
    throw ApiError.badRequest('Message content or attachment is required');
  }

  let roomId = null;
  const msgData = {
    sender: req.user._id,
    content: content?.trim(),
    type,
    attachment,
    readBy: [req.user._id],
  };

  if (caseId) {
    const caseDoc = await Case.findById(caseId).lean();
    if (!caseDoc) throw ApiError.notFound('Case not found');
    const participants = [String(caseDoc.client), String(caseDoc.advocate)];
    if (!participants.includes(userId) && req.user.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have access to this case');
    }
    roomId = `case:${caseId}`;
    msgData.case = caseId;
  } else if (consultationId) {
    const consDoc = await Consultation.findById(consultationId).lean();
    if (!consDoc) throw ApiError.notFound('Consultation not found');
    const participants = [String(consDoc.client), String(consDoc.advocate)];
    if (!participants.includes(userId) && req.user.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have access to this consultation');
    }
    roomId = `consultation:${consultationId}`;
    msgData.consultation = consultationId;
  } else {
    throw ApiError.badRequest('Either caseId or consultationId is required');
  }

  const message = await Message.create(msgData);
  const populated = await message.populate('sender', 'name avatar role');

  // Broadcast via socket if room exists
  if (io && roomId) {
    io.to(roomId).emit('chat:message', populated);
  }

  res.status(201).json({ success: true, data: populated });
});
