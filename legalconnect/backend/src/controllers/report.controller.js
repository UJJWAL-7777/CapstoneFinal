import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { REPORT_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';
import { logAudit } from '../services/audit.service.js';

function getIo(req) { return req.app.get('io'); }

export const createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, type, description, relatedConsultation, relatedCase } = req.body;

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) throw ApiError.notFound('User not found');

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: reportedUserId,
    type,
    description,
    relatedConsultation,
    relatedCase,
  });

  res.status(201).json({ success: true, data: report });
});

export const getReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await Report.countDocuments(query);
  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('reporter', 'name email avatar role')
    .populate('reportedUser', 'name email avatar role');

  res.json({ success: true, data: { reports, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const updateReport = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const { status, adminNotes, actionTaken } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) throw ApiError.notFound('Report not found');

  report.status = status;
  report.adminNotes = adminNotes;
  report.actionTaken = actionTaken;
  report.reviewedBy = req.user._id;
  if ([REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED].includes(status)) {
    report.resolvedAt = new Date();
  }
  await report.save();

  // If action is suspension, suspend the user
  if (actionTaken === 'suspended') {
    await User.findByIdAndUpdate(report.reportedUser, { status: 'suspended' });
  }

  await createNotification(io, {
    recipient: report.reporter,
    type: NOTIFICATION_TYPES.REPORT_UPDATE,
    title: 'Report Updated',
    message: `Your report has been ${status.toLowerCase()}.`,
    link: '/client/profile',
  });

  await logAudit({ actor: req.user._id, action: 'report.updated', entityType: 'Report', entityId: report._id, req });

  res.json({ success: true, data: report });
});
