import { ApiError } from '../utils/ApiError.js';

// Validates and replaces req.body / req.query / req.params with the parsed (stripped) result.
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      path: i.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
      message: i.message,
    }));
    return next(ApiError.badRequest('Please fix the highlighted fields', { code: 'VALIDATION_ERROR', errors }));
  }
  const { body, query, params } = result.data;
  if (body) req.body = body;
  if (query) Object.assign(req.query, query);
  if (params) Object.assign(req.params, params);
  next();
};
