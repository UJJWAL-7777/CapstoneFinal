import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, req);
  res.status(201).json({ success: true, data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, req);
  res.json({ success: true, data });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user, req);
  res.json({ success: true, data: { message: 'Signed out' } });
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfileForUser(req.user);
  res.json({ success: true, data: { user: req.user, profile } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const token = await authService.changePassword(req.user._id, req.body, req);
  res.json({ success: true, data: { token, message: 'Password updated' } });
});
