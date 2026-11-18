// Tiny validation helpers used by the controllers.
export function findMissingFields(body, requiredFields) {
  return requiredFields.filter((field) => !String(body[field] ?? '').trim())
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
