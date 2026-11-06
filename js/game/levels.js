// levels.js - the settings for each level, plus the order "dealer".
import { FLOWER_TYPES } from "./flower.js";

// Each level is an object of settings. Level 2 is harder and looks different.
export const LEVELS = [
  {
    name: "Sunny Meadow",
    customers: 4, // customers to serve before the level ends
    bees: 2,
    beeSpeed: 75, // pixels per second
    beesChase: false, // do the bees go after the player?
    maxFlowers: 9, // flowers growing at once
    orderSize: [2, 3], // smallest and biggest number of flowers in an order
    orderTime: 40, // seconds the customer will wait
    theme: {
      seed: 11,
      grass: "#bfe3a8",
      grassDark: "#a9d894",
      path: "#f1dfb6",
      accents: ["#f6a8c0", "#fff3a0", "#c9b6ff"],
      tint: "rgba(255, 255, 255, 0)"
    }
  },
  {
    name: "Twilight Orchard",
    customers: 4,
    bees: 4,
    beeSpeed: 100,
    beesChase: true,
    maxFlowers: 10,
    orderSize: [3, 5],
    orderTime: 38,
    theme: {
      seed: 29,
      grass: "#a7c7b4",
      grassDark: "#8fb59f",
      path: "#e3c9a0",
      accents: ["#ffcf8a", "#e9a6e0", "#ffffff"],
      tint: "rgba(255, 150, 90, 0.14)"
    }
  }
];

// Total customers over all levels (used to work out the shop rating)
export const TOTAL_CUSTOMERS = LEVELS.reduce((sum, level) => sum + level.customers, 0);

/**
 * Whole number between min and max (both included).
 * @param {number} min
 * @param {number} max
 */
export function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Makes a customer's order by dealing flowers out of a "pack",
 * just like dealing cards: pick a random flower and remove it (splice).
 * @param {number} size - how many flowers the customer wants
 * @returns {{rose:number,tulip:number,daisy:number}}
 */
export function dealOrder(size) {
  // The pack holds 4 of each flower, like a pack of cards
  const pack = [];
  FLOWER_TYPES.forEach((type) => {
    for (let i = 0; i < 4; i++) {
      pack.push(type);
    }
  });

  const order = {};
  FLOWER_TYPES.forEach((type) => {
    order[type] = 0;
  });

  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * pack.length);
    const dealt = pack.splice(index, 1)[0]; // splice removes it and returns it
    order[dealt] += 1;
  }

  return order;
}
