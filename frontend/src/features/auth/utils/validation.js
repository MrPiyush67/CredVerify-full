/**
 * Centralized validation functions for auth forms
 * Used by LoginPage and SignupPage to avoid duplication
 */

// Consistent email regex used across all auth forms
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email field
 * @param {string} email - Email to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateEmail(email) {
  if (!email?.trim()) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Email does not match the format';
  }
  return null;
}

/**
 * Validate password field
 * @param {string} password - Password to validate
 * @param {boolean} checkComplexity - Whether to check password complexity (for signup)
 * @returns {string|null} - Error message or null if valid
 */
export function validatePassword(password, checkComplexity = false) {
  if (!password?.trim()) {
    return 'Password is required';
  }

  if (checkComplexity) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return 'Password must contain uppercase, lowercase, and number';
    }
  }

  return null;
}

/**
 * Validate name field
 * @param {string} name - Name to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateName(name) {
  if (!name?.trim()) {
    return 'Full name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return null;
}

/**
 * Validate that two values match (for confirm fields)
 * @param {string} value1 - First value
 * @param {string} value2 - Second value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
export function validateMatch(value1, value2, fieldName = 'Values') {
  if (!value2?.trim()) {
    return `Please confirm your ${fieldName.toLowerCase()}`;
  }
  if (value1.trim() !== value2.trim()) {
    return `${fieldName} do not match`;
  }
  return null;
}
