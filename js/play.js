// play.js - connects the game page (game.html) to the Game class.
import { getCurrentUser, saveScore } from "./storage.js";
import { Game } from "./game/game.js";

function init() {
  const username = getCurrentUser();

  // Only logged-in players can play
  if (!username) {
    document.getElementById("login-warning").classList.remove("hidden");
    return;
  }
  document.getElementById("game-area").classList.remove("hidden");

  const overlay = document.getElementById("game-overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const overlayBest = document.getElementById("overlay-best");
  const rankingsLink = document.getElementById("overlay-rankings");
  const startButton = document.getElementById("start-button");
  const muteButton = document.getElementById("mute-button");
  const messageBox = document.getElementById("game-message");
  const toastBox = document.getElementById("game-toasts");

  /** Shows a line of text under the game. */
  function showMessage(text) {
    messageBox.textContent = text;
  }

  /**
   * Pops up a short notification over the game, then removes it.
   * (This is an on-page pop-up, not a browser alert box.)
   */
  function showToast(text, kind, seconds) {
    const toast = document.createElement("p");
    toast.className = `toast ${kind}`;
    toast.textContent = text;
    toastBox.appendChild(toast);

    // Keep at most 3 notifications on screen
    while (toastBox.children.length > 3) {
      toastBox.removeChild(toastBox.firstChild);
    }

    setTimeout(() => {
      toast.remove();
    }, seconds * 1000);
  }

  /** Called by the game when it finishes. Saves the score and shows the results. */
  function handleEnd(result) {
    const saved = saveScore(username, result.score, result.rating);

    overlayTitle.textContent = result.won ? "You ran the best flower shop in town!" : "Game over!";
    overlayText.textContent =
      `Score: ${result.score}  |  Shop rating: ${result.rating.toFixed(1)}/10  |  ` +
      `Happy customers: ${result.bouquets} of ${result.totalCustomers}`;

    if (saved && saved.newBest) {
      overlayBest.textContent = "New personal best! Your score has been saved to the rankings.";
    } else if (saved) {
      overlayBest.textContent = `Your top score is still ${saved.topScore}. Can you beat it?`;
    } else {
      overlayBest.textContent = "";
    }

    startButton.textContent = "Play again";
    rankingsLink.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  const game = new Game(document.getElementById("game-canvas"), {
    onMessage: showMessage,
    onNotify: showToast,
    onEnd: handleEnd
  });

  startButton.addEventListener("click", () => {
    overlay.classList.add("hidden");
    showMessage("Pick flowers to match the customer's order.");
    game.start();
  });

  muteButton.addEventListener("click", () => {
    const muted = game.sound.toggleMute();
    muteButton.textContent = muted ? "Sound: off" : "Sound: on";
  });
}

init();