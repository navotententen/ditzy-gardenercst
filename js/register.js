// register.js - handles the registration form.
import { validateRegistration } from "./validation.js";
import { findUser, addUser } from "./storage.js";
import { readFields, showErrors, showFormMessage } from "./forms.js";

const FIELD_NAMES = ["username", "email", "password", "confirmPassword", "shopName"];

const form = document.getElementById("register-form");

form.addEventListener("submit", (event) => {
  // Stop the page from reloading; we handle everything in JavaScript
  event.preventDefault();

  const values = readFields(form, FIELD_NAMES);
  const errors = validateRegistration(values);

  // The username must also be unused
  if (!errors.username && findUser(values.username)) {
    errors.username = "That username is already taken. Please choose another.";
  }

  showErrors(FIELD_NAMES, errors);

  if (Object.keys(errors).length > 0) {
    showFormMessage("Oops! Please fix the problems marked below.", "error");
    return;
  }

  // Everything is valid: save the new user
  addUser({
    username: values.username,
    email: values.email,
    password: values.password,
    shopName: values.shopName,
    topScore: 0,
    bestRating: 0
  });

  form.reset();
  showFormMessage(`Welcome, ${values.username}! Your account is ready. You can now log in.`, "success");
});
