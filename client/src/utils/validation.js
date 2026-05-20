export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PHONE_REGEX =
  /^(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}([\s-]?\d{1,4})?$/

export const isValidEmail = (value) => EMAIL_REGEX.test(String(value).trim())

export const isValidPhone = (value) => {
  const trimmed = String(value).trim()
  if (!trimmed) return true
  return PHONE_REGEX.test(trimmed) && trimmed.replace(/\D/g, '').length >= 10
}
