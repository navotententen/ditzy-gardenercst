// pickup.js - power-ups: a butterfly (extra flowers) or a ladybug (shield).
import { Entity } from "./entity.js";
import { SpriteSheet, Animation } from "./sprite.js";

const SHEETS = {
  butterfly: new SpriteSheet("images/butterfly-sheet.png", 40, 40),
  ladybug: new SpriteSheet("images/ladybug-sheet.png", 40, 40)
};

const LIFETIME_SECONDS = 9;

export class Pickup extends Entity {
  /**
   * @param {"butterfly"|"ladybug"} kind
   * @param {number} x
   * @param {number} y
   */
  constructor(kind, x, y) {
    super(x, y, 18);
    this.kind = kind;
    this.homeX = x;
    this.homeY = y;
    this.age = 0;
    this.animation = new Animation(2, kind === "butterfly" ? 0.15 : 0.25);
  }

  /** True once the power-up has been waiting too long and should vanish. */
  get expired() {
    return this.age >= LIFETIME_SECONDS;
  }

  update(seconds) {
    this.age += seconds;
    this.animation.update(seconds);

    if (this.kind === "butterfly") {
      // Flutters around in a loop
      this.x = this.homeX + Math.cos(this.age * 1.6) * 40;
      this.y = this.homeY + Math.sin(this.age * 2.4) * 25;
    } else {
      // Ladybug crawls from side to side
      this.x = this.homeX + Math.sin(this.age * 0.9) * 50;
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    // Blink during the last 2 seconds as a warning
    if (this.age > LIFETIME_SECONDS - 2 && Math.floor(this.age * 8) % 2 === 0) {
      return;
    }
    SHEETS[this.kind].draw(ctx, this.animation.frame, 0, this.x, this.y, 1.1);
  }
}
