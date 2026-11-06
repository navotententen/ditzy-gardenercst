// puns.js - the words the game says.
// Shown when a bee stings the player

export const BEE_PUNS = [
  "Ouch! That sting really made a bee-line for me!",
  "Don't worry, bee happy!",
  "That hurt, but I'm not going to let it bug me.",
  "What's the buzz? Oh. It's pain.",
  "You've got to be kidding... bee serious!",
  "I'm bee-yond annoyed right now.",
  "Honey, that stings!",
  "Wax on, wax off... mostly ouch.",
  "Sorry, I'm in a bit of a bee-wildered state.",
  "Hive-five? No thanks, I'm good."
];

// Shown when a ladybug shield blocks a sting
export const SHIELD_LINES = [
  "Shield up! The bee buzzes off, very confused.",
  "The ladybug saved you! Spot on!",
  "Sting blocked! Lady-luck is on your side."
];

// Shown when the player picks a flower nobody asked for
export const WRONG_FLOWER_LINES = [
  "Oops! Nobody wanted that one. So ditzy!",
  "Whoops, wrong flower. It's still pretty though!",
  "Ditzy gardener alert: that wasn't on the order!"
];

/**
 * Picks a random line from a list.
 * @param {string[]} lines
 * @returns {string}
 */
export function randomLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}
