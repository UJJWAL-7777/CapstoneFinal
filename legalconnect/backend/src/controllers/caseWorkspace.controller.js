import { Case } from '../models/Case.js';
import { CaseTask } from '../models/CaseTask.js';
import { CaseTimeline } from '../models/CaseTimeline.js';
import { Hearing } from '../models/Hearing.js';
import { CaseNote } from '../models/CaseNote.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, TIMELINE_EVENT_TYPES, NOTIFICATION_TYPES, TASK_STATUS } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';

function getIo(req) { return req.app.get('io'); }

function assertCaseAccess(caseDoc, userId, role) {
  const participants = [String(caseDoc.client._id || caseDoc.client), String(caseDoc.advocate._id || caseDoc.advocate)];
  if (!participants.includes(String(userId)) && role !== ROLES.ADMIN) throw ApiError.forbidden();
}

// ─── Tasks ───────────────────────────────────────────────────────

export const createTask = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const task = await CaseTask.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    assignedTo: req.body.assignedTo || caseDoc.client,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    priority: req.body.priority || 'medium',
  });

  await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: TIMELINE_EVENT_TYPES.TASK_CREATED,
    title: 'Task Assigned',
    description: `Task "${task.title}" assigned`,
  });

  await createNotification(io, {
    recipient: task.assignedTo,
    type: NOTIFICATION_TYPES.TASK_ASSIGNED,
    title: 'New Task Assigned',
    message: `You have a new task: "${task.title}"`,
    link: `/client/cases/${caseDoc._id}?tab=tasks`,
    relatedEntity: { type: 'Case', id: caseDoc._id },
  });

  res.status(201).json({ success: true, data: task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const tasks = await CaseTask.find({ case: req.params.caseId })
    .populate('assignedTo', 'name avatar role')
    .populate('createdBy', 'name avatar role')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: tasks });
});

export const updateTask = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');

  const task = await CaseTask.findById(req.params.taskId);
  if (!task || String(task.case) !== req.params.caseId) throw ApiError.notFound('Task not found');

  const isAdvocate = String(caseDoc.advocate) === String(req.user._id);
  const isAssignee = String(task.assignedTo) === String(req.user._id);
  if (!isAdvocate && !isAssignee) throw ApiError.forbidden();

  const allowed = isAdvocate
    ? ['title', 'description', 'dueDate', 'status', 'assignedTo', 'priority']
    : ['status']; // clients can only update status

  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (updates.status === TASK_STATUS.COMPLETED) updates.completedAt = new Date();

  const updated = await CaseTask.findByIdAndUpdate(task._id, { $set: updates }, { new: true })
    .populate('assignedTo', 'name avatar role');

  if (updates.status === TASK_STATUS.COMPLETED) {
    await CaseTimeline.create({
      case: caseDoc._id,
      createdBy: req.user._id,
      type: TIMELINE_EVENT_TYPES.TASK_COMPLETED,
      title: 'Task Completed',
      description: `Task "${task.title}" marked as completed`,
    });

    await createNotification(io, {
      recipient: caseDoc.advocate,
      type: NOTIFICATION_TYPES.TASK_COMPLETED,
      title: 'Task Completed',
      message: `Task "${task.title}" has been completed.`,
      link: `/advocate/cases/${caseDoc._id}?tab=tasks`,
    });
  }

  res.json({ success: true, data: updated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  await CaseTask.findByIdAndDelete(req.params.taskId);
  res.json({ success: true, data: { message: 'Task deleted' } });
});

// ─── Timeline ────────────────────────────────────────────────────

export const getTimeline = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const events = await CaseTimeline.find({ case: req.params.caseId })
    .populate('createdBy', 'name avatar role')
    .sort({ eventDate: -1 });

  res.json({ success: true, data: events });
});

export const addTimelineEvent = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const event = await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: req.body.type || TIMELINE_EVENT_TYPES.CUSTOM,
    title: req.body.title,
    description: req.body.description,
    eventDate: req.body.eventDate || new Date(),
  });

  res.status(201).json({ success: true, data: event });
});

// ─── Hearings ────────────────────────────────────────────────────

export const createHearing = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const hearing = await Hearing.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    date: req.body.date,
    time: req.body.time,
    court: req.body.court,
    purpose: req.body.purpose,
    notes: req.body.notes,
    requiredDocuments: req.body.requiredDocuments || [],
  });

  await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: TIMELINE_EVENT_TYPES.HEARING_SCHEDULED,
    title: 'Hearing Scheduled',
    description: `Hearing at ${hearing.court} on ${new Date(hearing.date).toLocaleDateString()}`,
  });

  await createNotification(io, {
    recipient: caseDoc.client,
    type: NOTIFICATION_TYPES.HEARING_SCHEDULED,
    title: 'Hearing Scheduled',
    message: `A hearing has been scheduled at ${hearing.court}`,
    link: `/client/cases/${caseDoc._id}?tab=hearings`,
    relatedEntity: { type: 'Case', id: caseDoc._id },
  });

  res.status(201).json({ success: true, data: hearing });
});

export const getHearings = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const hearings = await Hearing.find({ case: req.params.caseId }).sort({ date: 1 });
  res.json({ success: true, data: hearings });
});

export const updateHearing = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const hearing = await Hearing.findByIdAndUpdate(req.params.hearingId, { $set: req.body }, { new: true });
  if (!hearing) throw ApiError.notFound('Hearing not found');

  res.json({ success: true, data: hearing });
});

// ─── Notes (Advocate only) ────────────────────────────────────────

export const createNote = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const note = await CaseNote.create({
    case: caseDoc._id,
    author: req.user._id,
    content: req.body.content,
    isPinned: req.body.isPinned || false,
  });

  res.status(201).json({ success: true, data: note });
});

export const getNotes = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id) && req.user.role !== ROLES.ADMIN) throw ApiError.forbidden();

  const notes = await CaseNote.find({ case: req.params.caseId }).sort({ isPinned: -1, createdAt: -1 });
  res.json({ success: true, data: notes });
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await CaseNote.findById(req.params.noteId);
  if (!note) throw ApiError.notFound('Note not found');
  if (String(note.author) !== String(req.user._id)) throw ApiError.forbidden();

  Object.assign(note, { content: req.body.content, isPinned: req.body.isPinned });
  await note.save();
  res.json({ success: true, data: note });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const note = await CaseNote.findById(req.params.noteId);
  if (!note) throw ApiError.notFound('Note not found');
  if (String(note.author) !== String(req.user._id)) throw ApiError.forbidden();

  await note.deleteOne();
  res.json({ success: true, data: { message: 'Note deleted' } });
});
