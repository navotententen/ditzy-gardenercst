// game.js - the Game class: runs the garden, the levels and the rules.
import { Player } from "./player.js";
import { Bee } from "./bee.js";
import { Flower, FLOWER_TYPES } from "./flower.js";
import { Pickup } from "./pickup.js";
import { SoundManager } from "./sound.js";
import { Hud } from "./hud.js";
import { createBackground } from "./background.js";
import { LEVELS, TOTAL_CUSTOMERS, dealOrder, randomBetween } from "./levels.js";
import { BEE_PUNS, SHIELD_LINES, WRONG_FLOWER_LINES, randomLine } from "./puns.js";

const WIDTH = 800;
const HEIGHT = 520;
const HUD_HEIGHT = 64;
const BOUNDS = { left: 0, top: HUD_HEIGHT, right: WIDTH, bottom: HEIGHT };
const START_HEARTS = 3;
const BANNER_SECONDS = 2.5;
const BETWEEN_CUSTOMERS_SECONDS = 1.6;

// Moods: the column of each face in customer-sheet.png
const MOOD_HAPPY = 0;
const MOOD_NEUTRAL = 1;
const MOOD_ANGRY = 2;

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{onMessage:Function, onEnd:Function}} callbacks
   *   onMessage(text) is called with funny lines to show the player;
   *   onEnd(result) is called when the game finishes.
   */
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.callbacks = callbacks;

    this.sound = new SoundManager();
    this.hud = new Hud(WIDTH, HUD_HEIGHT);
    this.backgrounds = LEVELS.map((level) => createBackground(level.theme, WIDTH, HEIGHT));

    this.keys = { left: false, right: false, up: false, down: false };
    this.state = "idle"; // "idle", "banner", "playing" or "over"
    this.lastTime = 0;

    this.player = new Player(WIDTH / 2, HEIGHT - 70);
    this.flowers = [];
    this.bees = [];
    this.pickups = [];

    this.resetStats();
    this.bindKeys();

    // Start the animation loop (it draws the garden even before the game starts)
    requestAnimationFrame((time) => this.tick(time));
  }

  // Setting up

  /** Sets score, lives, etc. back to the start. */
  resetStats() {
    this.score = 0;
    this.hearts = START_HEARTS;
    this.bouquets = 0;
    this.levelIndex = 0;
    this.customersServed = 0;
    this.order = null;
    this.basket = this.emptyBasket();
    this.orderTimeLeft = 0;
    this.nextOrderTimer = 0;
    this.mood = MOOD_NEUTRAL;
  }

  /** A basket with 0 of each flower. */
  emptyBasket() {
    const basket = {};
    FLOWER_TYPES.forEach((type) => {
      basket[type] = 0;
    });
    return basket;
  }

  /** Listens for the arrow keys and WASD. */
  bindKeys() {
    const keyMap = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down"
    };

    window.addEventListener("keydown", (event) => {
      const direction = keyMap[event.code];
      if (direction) {
        this.keys[direction] = true;
        // Stop the arrow keys from scrolling the page while playing
        if (this.state === "playing" || this.state === "banner") {
          event.preventDefault();
        }
      }
    });

    window.addEventListener("keyup", (event) => {
      const direction = keyMap[event.code];
      if (direction) {
        this.keys[direction] = false;
      }
    });

    // If the window loses focus the keyup may never arrive, so let go of everything
    window.addEventListener("blur", () => {
      this.keys = { left: false, right: false, up: false, down: false };
    });
  }

  /** Starts a brand new game (called by the Start button). */
  start() {
    this.sound.unlock();
    this.resetStats();
    this.player = new Player(WIDTH / 2, HEIGHT - 70);
    this.startLevel(0);
  }

  /** Gets a level ready and shows its banner. */
  startLevel(index) {
    const level = LEVELS[index];
    this.levelIndex = index;
    this.customersServed = 0;
    this.order = null;
    this.basket = this.emptyBasket();
    this.mood = MOOD_NEUTRAL;

    this.player.x = WIDTH / 2;
    this.player.y = HEIGHT - 70;
    this.player.resetStatus();

    this.flowers = [];
    this.pickups = [];
    this.bees = [];
    for (let i = 0; i < level.bees; i++) {
      const spot = this.randomSpot(220);
      this.bees.push(new Bee(spot.x, spot.y, level.beeSpeed, level.beesChase));
    }
    for (let i = 0; i < level.maxFlowers; i++) {
      this.spawnFlower(this.randomFlowerType());
    }

    this.spawnTimer = 1.2;
    this.butterflyTimer = 10 + Math.random() * 6;
    this.ladybugTimer = 13 + Math.random() * 6;
    this.nextOrderTimer = 0; // a new customer arrives as soon as the banner ends

    this.bannerTimer = BANNER_SECONDS;
    this.state = "banner";
  }

  // Orders 
  /** A new customer arrives with an order. */
  newOrder() {
    const level = LEVELS[this.levelIndex];
    const size = randomBetween(level.orderSize[0], level.orderSize[1]);
    this.order = dealOrder(size);
    this.basket = this.emptyBasket();
    this.orderTimeLeft = level.orderTime;
    this.mood = MOOD_NEUTRAL;

    // Make sure there are enough of the right flowers growing
    FLOWER_TYPES.forEach((type) => {
      const shortage = this.order[type] - this.countFlowers(type);
      for (let i = 0; i < shortage; i++) {
        this.spawnFlower(type);
      }
    });
  }

  /** The player picked everything on the order. */
  deliverOrder() {
    const timeBonus = Math.ceil(this.orderTimeLeft) * 3;
    const points = 100 + timeBonus;
    this.score += points;
    this.bouquets += 1;
    this.customersServed += 1;
    this.mood = MOOD_HAPPY;
    this.order = null;
    this.nextOrderTimer = BETWEEN_CUSTOMERS_SECONDS;
    this.sound.deliver();
    this.say(`Lovely bouquet! The customer is delighted. +${points} points`);
  }

  /** The customer waited too long and left. */
  expireOrder() {
    this.customersServed += 1;
    this.mood = MOOD_ANGRY;
    this.order = null;
    this.basket = this.emptyBasket();
    this.nextOrderTimer = BETWEEN_CUSTOMERS_SECONDS;
    this.sound.expire();
    this.say("Oh no, the customer got tired of waiting and left!");
  }

  /**
   * Shop rating out of 10: the share of all customers you made happy.
   * @returns {number}
   */
  get rating() {
    return Math.round((this.bouquets / TOTAL_CUSTOMERS) * 100) / 10;
  }


  // Spawning
  /** Number of a type of flower currently growing. */
  countFlowers(type) {
    return this.flowers.filter((flower) => flower.type === type).length;
  }

  /**
   * Chooses what to plant next. Most of the time it picks a flower
   * the current customer still needs, so the order can always be finished.
   */
  randomFlowerType() {
    if (this.order) {
      const needed = FLOWER_TYPES.filter(
        (type) => this.order[type] - this.basket[type] - this.countFlowers(type) > 0
      );
      if (needed.length > 0 && Math.random() < 0.65) {
        return needed[Math.floor(Math.random() * needed.length)];
      }
    }
    return FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
  }

  /**
   * Finds a random empty spot that is at least minDistance from the player.
   * @param {number} minDistance
   * @returns {{x:number,y:number}}
   */
  randomSpot(minDistance) {
    let spot = { x: WIDTH / 2, y: HEIGHT / 2 };
    for (let attempt = 0; attempt < 30; attempt++) {
      spot = {
        x: 40 + Math.random() * (WIDTH - 80),
        y: BOUNDS.top + 50 + Math.random() * (HEIGHT - BOUNDS.top - 90)
      };
      const farFromPlayer = Math.hypot(spot.x - this.player.x, spot.y - this.player.y) > minDistance;
      const farFromFlowers = this.flowers.every(
        (flower) => Math.hypot(spot.x - flower.x, spot.y - flower.y) > 45
      );
      if (farFromPlayer && farFromFlowers) {
        return spot;
      }
    }
    return spot;
  }

  spawnFlower(type) {
    const spot = this.randomSpot(90);
    this.flowers.push(new Flower(type, spot.x, spot.y));
  }

  spawnPickup(kind) {
    const spot = this.randomSpot(120);
    this.pickups.push(new Pickup(kind, spot.x, spot.y));
  }

  // Events
  /** Sends a line of text to the page. */
  say(text) {
    this.callbacks.onMessage(text);
  }

  /**
   * Shows a pop-up notification on top of the game (not a browser alert).
   * @param {string} text
   * @param {"good"|"warn"} kind - good news is green, bad news is red
   * @param {number} seconds - how long it stays on screen
   */
  notify(text, kind, seconds) {
    this.callbacks.onNotify(text, kind, seconds);
  }

  /** The player picked up a flower. */
  pickFlower(flower) {
    this.sound.pick();

    if (this.order && this.basket[flower.type] < this.order[flower.type]) {
      this.basket[flower.type] += 1;
      this.score += 10;

      const complete = FLOWER_TYPES.every((type) => this.basket[type] >= this.order[type]);
      if (complete) {
        this.deliverOrder();
      }
    } else if (Math.random() < 0.5) {
      // A flower nobody asked for: it just disappears
      this.say(randomLine(WRONG_FLOWER_LINES));
    }
  }

  /** A bee touched the player. */
  handleBee(bee) {
    if (this.player.safeTimer > 0) {
      return;
    }

    if (this.player.hasShield) {
      this.player.useShield();
      bee.shoo(this.player);
      this.sound.shield();
      this.say(randomLine(SHIELD_LINES));
      return;
    }

    this.player.getStung();
    this.hearts -= 1;
    this.score = Math.max(0, this.score - 20);
    this.sound.sting();

    // The sting makes you drop one flower from your basket
    const held = FLOWER_TYPES.filter((type) => this.basket[type] > 0);
    if (held.length > 0) {
      const dropped = held[Math.floor(Math.random() * held.length)];
      this.basket[dropped] -= 1;
    }

    this.say(randomLine(BEE_PUNS));
    this.notify("Stung! Dizzy: left and right are swapped for 4 seconds.", "warn", 4);

    if (this.hearts <= 0) {
      this.finish(false);
    }
  }

  /** The player picked up a butterfly or a ladybug. */
  collectPickup(pickup) {
    this.sound.powerUp();

    if (pickup.kind === "butterfly") {
      // Butterfly: lots more flowers bloom
      for (let i = 0; i < 5; i++) {
        this.spawnFlower(this.randomFlowerType());
      }
      this.say("Butterfly magic! A whole patch of extra flowers just bloomed!");
      this.notify("Butterfly! 5 extra flowers bloomed.", "good", 2.5);
    } else {
      this.player.hasShield = true;
      this.say("A ladybug has your back! The next sting will be blocked.");
      this.notify("Ladybug shield on! The next sting is blocked.", "good", 3);
    }
  }

  /** Called when the level's customers have all been served. */
  completeLevel() {
    this.score += 100;
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.finish(true);
    } else {
      this.sound.win();
      this.startLevel(this.levelIndex + 1);
    }
  }

  /**
   * Ends the game and tells the page how it went.
   * @param {boolean} won - true if every level was completed
   */
  finish(won) {
    this.state = "over";
    if (won) {
      this.sound.win();
    } else {
      this.sound.gameOver();
    }
    this.callbacks.onEnd({
      won: won,
      score: this.score,
      rating: this.rating,
      bouquets: this.bouquets,
      totalCustomers: TOTAL_CUSTOMERS
    });
  }

  //  The game loop 
  /** Runs about 60 times a second. */
  tick(time) {
    const seconds = Math.min(0.05, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;

    this.update(seconds);
    this.draw();

    requestAnimationFrame((nextTime) => this.tick(nextTime));
  }

  update(seconds) {
    if (this.state === "banner") {
      this.flowers.forEach((flower) => flower.update(seconds));
      this.bannerTimer -= seconds;
      if (this.bannerTimer <= 0) {
        this.state = "playing";
        this.newOrder();
      }
      return;
    }

    if (this.state !== "playing") {
      // Keep the flowers swaying on the start screen
      this.flowers.forEach((flower) => flower.update(seconds));
      return;
    }

    this.player.update(seconds, this.keys, BOUNDS);
    this.flowers.forEach((flower) => flower.update(seconds));
    this.bees.forEach((bee) => bee.update(seconds, this.player, BOUNDS));
    this.pickups.forEach((pickup) => pickup.update(seconds));
    this.pickups = this.pickups.filter((pickup) => !pickup.expired);

    this.updateSpawning(seconds);
    this.updateCollisions();
    this.updateOrder(seconds);
  }

  /** Grows new flowers and power-ups over time. */
  updateSpawning(seconds) {
    const level = LEVELS[this.levelIndex];

    this.spawnTimer -= seconds;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.2;
      if (this.flowers.length < level.maxFlowers) {
        this.spawnFlower(this.randomFlowerType());
      }
    }

    this.butterflyTimer -= seconds;
    if (this.butterflyTimer <= 0) {
      this.butterflyTimer = 14 + Math.random() * 8;
      if (!this.pickups.some((pickup) => pickup.kind === "butterfly")) {
        this.spawnPickup("butterfly");
      }
    }

    this.ladybugTimer -= seconds;
    if (this.ladybugTimer <= 0) {
      this.ladybugTimer = 16 + Math.random() * 8;
      if (!this.pickups.some((pickup) => pickup.kind === "ladybug") && !this.player.hasShield) {
        this.spawnPickup("ladybug");
      }
    }
  }

  /** Checks what the player is touching. */
  updateCollisions() {
    // Flowers
    for (let i = this.flowers.length - 1; i >= 0; i--) {
      if (this.flowers[i].touches(this.player)) {
        const flower = this.flowers.splice(i, 1)[0];
        this.pickFlower(flower);
      }
    }

    // Power-ups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      if (this.pickups[i].touches(this.player)) {
        const pickup = this.pickups.splice(i, 1)[0];
        this.collectPickup(pickup);
      }
    }

    // Bees (the game may end here, so stop checking once it is over)
    for (const bee of this.bees) {
      if (this.state !== "playing") {
        return;
      }
      if (bee.touches(this.player)) {
        this.handleBee(bee);
      }
    }
  }

  /** Counts down the customer's patience, or brings in the next customer. */
  updateOrder(seconds) {
    if (this.state !== "playing") {
      return;
    }

    const level = LEVELS[this.levelIndex];

    if (this.order) {
      this.orderTimeLeft -= seconds;
      if (this.orderTimeLeft <= 0) {
        this.expireOrder();
      }
    } else {
      this.nextOrderTimer -= seconds;
      if (this.nextOrderTimer <= 0) {
        if (this.customersServed >= level.customers) {
          this.completeLevel();
        } else {
          this.newOrder();
        }
      }
    }
  }

  // Drawing 
  /** The numbers the HUD needs. */
  getHudState() {
    const level = LEVELS[this.levelIndex];
    return {
      hearts: this.hearts,
      score: this.score,
      rating: this.rating,
      levelNumber: this.levelIndex + 1,
      levelName: level.name,
      customerNumber: Math.min(this.customersServed + (this.order ? 1 : 0), level.customers),
      customerTotal: level.customers,
      order: this.order,
      basket: this.basket,
      orderTimeLeft: this.orderTimeLeft,
      orderTime: level.orderTime,
      mood: this.mood,
      hasShield: this.player.hasShield,
      reversed: this.player.reversedTimer
    };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(this.backgrounds[this.levelIndex], 0, 0);

    this.flowers.forEach((flower) => flower.draw(ctx));
    this.pickups.forEach((pickup) => pickup.draw(ctx));
    this.bees.forEach((bee) => bee.draw(ctx));
    this.player.draw(ctx);

    this.hud.draw(ctx, this.getHudState());

    if (this.state === "banner") {
      const level = LEVELS[this.levelIndex];
      this.hud.drawBanner(ctx, `Level ${this.levelIndex + 1}`, level.name);
    }
  }
}
