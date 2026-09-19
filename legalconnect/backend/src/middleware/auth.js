import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { USER_STATUS } from '../constants/index.js';

// Authenticates the request and attaches req.user (fresh from the DB on every call,
// so suspensions and password changes take effect immediately).
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Your session has expired. Please sign in again.' : 'Invalid session. Please sign in again.',
      { code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID' }
    );
  }

  const user = await User.findById(payload.sub);
  if (!user || (user.tokenVersion ?? 0) !== payload.tv) {
    throw ApiError.unauthorized('Invalid session. Please sign in again.', { code: 'TOKEN_INVALID' });
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('This account is suspended. Contact support for help.', { code: 'ACCOUNT_SUSPENDED' });
  }

  req.user = user;
  next();
});

// Role-based access control. Use after protect: router.get('/x', protect, authorize('admin'), ...)
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};
