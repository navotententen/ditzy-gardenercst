// main.js - runs on every page.
// Job 1: highlight the navigation link for the page the player is on.
// Job 2: show who is logged in, with a Logout button.
import { getCurrentUser, clearCurrentUser } from "./storage.js";

/**
 * Finds the nav link that points to the current page and marks it "active".
 * The CSS (style.css) gives the "active" class a pink background.
 */
function highlightCurrentPage() {
  const pathParts = window.location.pathname.split("/");
  const currentFile = pathParts[pathParts.length - 1] || "index.html";

  document.querySelectorAll(".nav-list a").forEach((link) => {
    if (link.getAttribute("href") === currentFile) {
      link.classList.add("active");
    }
  });
}

function showLoginStatus() {
  const username = getCurrentUser();
  if (!username) {
    return;
  }

  const navList = document.querySelector(".nav-list");

  const greeting = document.createElement("li");
  greeting.className = "nav-greeting";
  greeting.textContent = `Hi, ${username}!`;

  const logoutItem = document.createElement("li");
  const logoutButton = document.createElement("button");
  logoutButton.type = "button";
  logoutButton.className = "nav-logout";
  logoutButton.textContent = "Logout";
  logoutButton.addEventListener("click", () => {
    clearCurrentUser();
    window.location.href = "index.html";
  });
  logoutItem.appendChild(logoutButton);

  navList.append(greeting, logoutItem);
}

highlightCurrentPage();
showLoginStatus();
