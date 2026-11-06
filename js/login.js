// login.js - handles the login form.
import { validateLogin } from "./validation.js";
import { findUser, setCurrentUser } from "./storage.js";
import { readFields, showErrors, showFormMessage } from "./forms.js";

const FIELD_NAMES = ["username", "password"];

const form = document.getElementById("login-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const values = readFields(form, FIELD_NAMES);
  const errors = validateLogin(values);

  // Only look the user up when both boxes were filled in
  if (Object.keys(errors).length === 0) {
    const user = findUser(values.username);

    if (!user) {
      errors.username = "No account found with that username.";
    } else if (user.password !== values.password) {
      errors.password = "Incorrect password. Please try again.";
    }
  }

  showErrors(FIELD_NAMES, errors);

  if (Object.keys(errors).length > 0) {
    showFormMessage("We couldn't log you in.", "error");
    return;
  }

  setCurrentUser(findUser(values.username).username);
  showFormMessage("Logged in! Taking you to the garden...", "success");

  // Short pause so the player can read the message, then go to the game
  setTimeout(() => {
    window.location.href = "game.html";
  }, 800);
});
