// validation.js - checks what the user typed.
// Each function returns an object of error messages, keyed by field name.
// An empty object means "everything is fine".

// Letters, numbers and underscores only, 3 to 15 characters
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,15}$/;

// Something@something.something (no spaces)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shop names: letters, numbers, spaces and a few friendly symbols, 3 to 30 characters
const SHOP_NAME_PATTERN = /^[A-Za-z0-9 '&-]{3,30}$/;

/**
 * Validates the registration form values.
 * @param {Object} values - username, email, password, confirmPassword, shopName
 * @returns {Object} errors, e.g. { username: "Please enter a username." }
 */
export function validateRegistration(values) {
  const errors = {};

  if (values.username === "") {
    errors.username = "Please enter a username.";
  } else if (!USERNAME_PATTERN.test(values.username)) {
    errors.username = "Username must be 3-15 letters, numbers or underscores.";
  }

  if (values.email === "") {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "That email address doesn't look right (e.g. name@example.com).";
  }

  if (values.password === "") {
    errors.password = "Please choose a password.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  } else if (!/[A-Za-z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    errors.password = "Password must contain at least one letter and one number.";
  }

  if (values.confirmPassword === "") {
    errors.confirmPassword = "Please type your password again.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "The two passwords don't match.";
  }

 if (values.shopName === "") {
    errors.shopName = "Please name your flower shop.";
  } else if (!SHOP_NAME_PATTERN.test(values.shopName)) {
    errors.shopName = "Shop name must be 3-30 letters, numbers or spaces.";
  }

  return errors;
}

/**
 * Validates the login form values (only checks that nothing is missing;
 * checking the password against the saved user happens in login.js).
 * @param {Object} values - username, password
 * @returns {Object} errors
 */
export function validateLogin(values) {
  const errors = {};

  if (values.username === "") {
    errors.username = "Please enter your username.";
  }

  if (values.password === "") {
    errors.password = "Please enter your password.";
  }

  return errors;
}
