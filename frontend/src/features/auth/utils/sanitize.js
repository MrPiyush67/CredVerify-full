export function sanitizeInput(value) {
  return typeof value === 'string' ? value.trim() : value;
}

export function sanitizeEmail(value) {
  const v = sanitizeInput(value).toLowerCase();
  return /\S+@\S+\.\S+/.test(v) ? v : '';
}

export function sanitizePassword(value) {
  return sanitizeInput(value);
}