import { asyncHandler } from '../utils/asyncHandler.js';
import { analyzeIssue } from '../services/ai.service.js';

export const assist = asyncHandler(async (req, res) => {
  const { issue } = req.body;
  if (!issue || issue.trim().length < 10) {
    return res.status(400).json({ success: false, error: { message: 'Please describe your legal issue (at least 10 characters)' } });
  }

  const result = analyzeIssue(issue);
  res.json({ success: true, data: result });
});
