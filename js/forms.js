// forms.js - small helpers shared by the register and login pages.

/**
 * Reads the text from each named input in a form, trimming spaces.
 * Passwords are not trimmed, so spaces in them still count.
 * @param {HTMLFormElement} form
 * @param {string[]} fieldNames
 * @returns {Object} e.g. { username: "Rose", password: "abc123" }
 */
export function readFields(form, fieldNames) {
  const values = {};
  fieldNames.forEach((name) => {
    const raw = form.elements[name].value;
    values[name] = name.toLowerCase().includes("password") ? raw : raw.trim();
  });
  return values;
}

/**
 * Shows each error message under its field. Fields with no error are cleared.
 * Each message box must have the id "<fieldName>-error".
 * @param {string[]} fieldNames
 * @param {Object} errors
 */
export function showErrors(fieldNames, errors) {
  fieldNames.forEach((name) => {
    const box = document.getElementById(`${name}-error`);
    box.textContent = errors[name] || "";
  });
}

/**
 * Shows a message in the big message area at the top of the form.
 * @param {string} text
 * @param {"error"|"success"} kind
 */
export function showFormMessage(text, kind) {
  const box = document.getElementById("form-message");
  box.textContent = text;
  box.className = `form-message ${kind}`;
}
