// Removes keys that could be used for NoSQL operator injection ($where, a.b, ...).
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) delete value[key];
      else value[key] = clean(value[key]);
    }
  }
  return value;
}

export const sanitize = (req, _res, next) => {
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  next();
};
