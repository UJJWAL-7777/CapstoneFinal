import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Case } from '../models/Case.js';
import { CaseDocument } from '../models/CaseDocument.js';
import { DocumentRequest } from '../models/DocumentRequest.js';
import { CaseTimeline } from '../models/CaseTimeline.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, TIMELINE_EVENT_TYPES, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';

function getIo(req) { return req.app.get('io'); }

function assertCaseAccess(caseDoc, userId, role) {
  const participants = [String(caseDoc.client._id || caseDoc.client), String(caseDoc.advocate._id || caseDoc.advocate)];
  if (!participants.includes(String(userId)) && role !== ROLES.ADMIN) throw ApiError.forbidden();
}

// ─── Multer setup (local disk, swap for Cloudinary later) ────────
const UPLOAD_DIR = 'uploads/case-documents';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: images, PDF, Word, text'));
  },
});

// ─── Documents ───────────────────────────────────────────────────

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const io = getIo(req);

  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const rawCategory = req.body.category;
  const categoryMap = {
    'Identity Proof': 'Identity',
    'Property Document': 'Legal',
    'Legal Notice': 'Legal',
    'Court Order': 'Court',
    'Evidence': 'Evidence',
    'Agreement / Contract': 'Agreement',
    'Agreement': 'Agreement',
    'Identity': 'Identity',
    'Legal': 'Legal',
    'Financial': 'Financial',
    'Financial Statement': 'Financial',
    'Court': 'Court',
    'Correspondence': 'Correspondence',
    'Medical Record': 'Other',
    'Other': 'Other',
  };
  const category = categoryMap[rawCategory] || (Object.values(DOCUMENT_CATEGORIES).includes(rawCategory) ? rawCategory : 'Other');

  const doc = await CaseDocument.create({
    case: caseDoc._id,
    uploadedBy: req.user._id,
    name: req.body.name || req.file.originalname,
    originalName: req.file.originalname,
    url: `/uploads/case-documents/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
    category,
    description: req.body.description,
    documentRequest: req.body.documentRequestId || undefined,
  });

  // Auto-fulfil document request if linked
  if (req.body.documentRequestId) {
    await DocumentRequest.findByIdAndUpdate(req.body.documentRequestId, {
      status: 'Fulfilled',
      fulfilledAt: new Date(),
      fulfilledDocument: doc._id,
    });
  }

  await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: TIMELINE_EVENT_TYPES.DOCUMENT_UPLOADED,
    title: 'Document Uploaded',
    description: `"${doc.name}" uploaded by ${req.user.name}`,
  });

  const notifyId = req.user.role === ROLES.ADVOCATE ? String(caseDoc.client) : String(caseDoc.advocate);
  await createNotification(io, {
    recipient: notifyId,
    type: NOTIFICATION_TYPES.DOCUMENT_UPLOAD,
    title: 'Document Uploaded',
    message: `${req.user.name} uploaded "${doc.name}" to case ${caseDoc.caseId}`,
    link: `/${req.user.role === ROLES.CLIENT ? 'client' : 'advocate'}/cases/${caseDoc._id}?tab=documents`,
    relatedEntity: { type: 'Case', id: caseDoc._id },
  });

  res.status(201).json({ success: true, data: doc });
});

export const getDocuments = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const docs = await CaseDocument.find({ case: req.params.caseId, isDeleted: false })
    .populate('uploadedBy', 'name avatar role')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: docs });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const doc = await CaseDocument.findById(req.params.docId);
  if (!doc || doc.isDeleted) throw ApiError.notFound('Document not found');
  if (String(doc.uploadedBy) !== String(req.user._id) && req.user.role !== ROLES.ADMIN) throw ApiError.forbidden();

  doc.isDeleted = true;
  doc.deletedBy = req.user._id;
  doc.deletedAt = new Date();
  await doc.save();

  res.json({ success: true, data: { message: 'Document deleted' } });
});

export const reviewDocument = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const doc = await CaseDocument.findByIdAndUpdate(
    req.params.docId,
    { isReviewed: true, reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!doc) throw ApiError.notFound('Document not found');

  await CaseTimeline.create({
    case: caseDoc._id,
    createdBy: req.user._id,
    type: TIMELINE_EVENT_TYPES.DOCUMENT_REVIEWED,
    title: 'Document Reviewed',
    description: `"${doc.name}" reviewed by advocate`,
  });

  res.json({ success: true, data: doc });
});

// ─── Document Requests ───────────────────────────────────────────

export const createDocumentRequest = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  if (String(caseDoc.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  const docRequest = await DocumentRequest.create({
    case: caseDoc._id,
    requestedBy: req.user._id,
    requestedFrom: caseDoc.client,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    dueDate: req.body.dueDate,
  });

  await createNotification(io, {
    recipient: caseDoc.client,
    type: NOTIFICATION_TYPES.DOCUMENT_REQUEST,
    title: 'Document Requested',
    message: `Your advocate has requested: "${docRequest.title}"`,
    link: `/client/cases/${caseDoc._id}?tab=documents`,
    relatedEntity: { type: 'Case', id: caseDoc._id },
  });

  res.status(201).json({ success: true, data: docRequest });
});

export const getDocumentRequests = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId);
  if (!caseDoc) throw ApiError.notFound('Case not found');
  assertCaseAccess(caseDoc, req.user._id, req.user.role);

  const requests = await DocumentRequest.find({ case: req.params.caseId })
    .populate('requestedBy', 'name avatar')
    .populate('requestedFrom', 'name avatar')
    .populate('fulfilledDocument')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
});

export const getAllMyDocuments = asyncHandler(async (req, res) => {
  const query = req.user.role === ROLES.CLIENT ? { client: req.user._id } : { advocate: req.user._id };
  const userCases = await Case.find(query).select('_id title caseId');
  const caseIds = userCases.map((c) => c._id);

  const docs = await CaseDocument.find({
    $or: [
      { case: { $in: caseIds } },
      { uploadedBy: req.user._id },
    ],
    isDeleted: false,
  })
    .populate('uploadedBy', 'name avatar role')
    .populate('case', 'title caseId status')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: docs });
});

export const downloadDocument = asyncHandler(async (req, res) => {
  const doc = await CaseDocument.findById(req.params.docId).populate('case');
  if (!doc || doc.isDeleted) throw ApiError.notFound('Document not found');
  if (doc.case) {
    assertCaseAccess(doc.case, req.user._id, req.user.role);
  } else if (String(doc.uploadedBy) !== String(req.user._id) && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden();
  }

  const relativePath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url;
  const fullPath = path.resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    throw ApiError.notFound('File not found on server disk');
  }

  const filename = doc.originalName || doc.name || path.basename(fullPath);
  res.download(fullPath, filename);
});


