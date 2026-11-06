// rankings.js - fills the rankings table on rankings.html.
import { getRankings, getCurrentUser } from "./storage.js";

/** Builds a table row with the given cell texts. */
function makeRow(cells, highlight) {
  const row = document.createElement("tr");
  if (highlight) {
    row.className = "rank-you";
  }
  cells.forEach((text) => {
    const cell = document.createElement("td");
    cell.textContent = text; // textContent keeps usernames safe
    row.appendChild(cell);
  });
  return row;
}

function showRankings() {
  const rankings = getRankings();
  const currentUser = getCurrentUser();
  const body = document.getElementById("rank-body");
  const emptyNote = document.getElementById("rank-empty");
  const table = document.getElementById("rank-table");

  if (rankings.length === 0) {
    table.classList.add("hidden");
    emptyNote.textContent = "No scores yet. Be the first to play and top the rankings!";
    return;
  }

  rankings.forEach((entry, index) => {
    const isYou = currentUser !== null && entry.username.toLowerCase() === currentUser.toLowerCase();
    const name = isYou ? `${entry.username} (you)` : entry.username;
    body.appendChild(
      makeRow([index + 1, name, entry.topScore, `${entry.bestRating.toFixed(1)}/10`], isYou)
    );
  });
}

showRankings();
