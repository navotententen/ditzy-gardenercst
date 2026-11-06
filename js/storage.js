// storage.js - the only file that talks to the browser's localStorage.
// All data is saved as JSON text.

const USERS_KEY = "ditzyUsers";
const CURRENT_USER_KEY = "ditzyCurrentUser";

/**
 * Returns the array of all registered users (empty array if none yet).
 * @returns {Array<Object>}
 */
export function getUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    // Storage blocked or the saved text was damaged: start fresh
    return [];
  }
}

/**
 * Saves the full array of users as JSON.
 * @param {Array<Object>} users
 */
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Looks for a user by username (not case sensitive).
 * @param {string} username
 * @returns {Object|undefined} the user, or undefined if not found
 */
export function findUser(username) {
  const wanted = username.toLowerCase();
  return getUsers().find((user) => user.username.toLowerCase() === wanted);
}

/**
 * Adds a new user to the saved list.
 * @param {Object} user
 */
export function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

/**
 * Saves a finished game's result. Only keeps the user's TOP score and
 * best rating, so a worse game never overwrites a better one.
 * @param {string} username
 * @param {number} score
 * @param {number} rating - shop rating out of 10
 * @returns {{newBest:boolean, topScore:number, bestRating:number}|null}
 *          null if the user could not be found
 */
export function saveScore(username, score, rating) {
  const users = getUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return null;
  }

  const newBest = score > user.topScore;
  if (newBest) {
    user.topScore = score;
  }
  if (rating > user.bestRating) {
    user.bestRating = rating;
  }

  saveUsers(users);
  return { newBest: newBest, topScore: user.topScore, bestRating: user.bestRating };
}

/**
 * The ranking table: every registered user, best score first.
 * @returns {Array<{username:string, shopName:string, topScore:number, bestRating:number}>}
 */
export function getRankings() {
  return getUsers()
    .map((user) => ({
      username: user.username,
      shopName: user.shopName || "Unnamed shop", // older accounts have no shop name
 
      topScore: user.topScore,
      bestRating: user.bestRating
    }))
    .sort((a, b) => b.topScore - a.topScore || b.bestRating - a.bestRating);
}

/** Remembers which user is logged in. */
export function setCurrentUser(username) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(username));
}

/**
 * Returns the logged-in username, or null if nobody is logged in.
 * @returns {string|null}
 */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch (error) {
    return null;
  }
}

/** Logs the user out. */
export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
