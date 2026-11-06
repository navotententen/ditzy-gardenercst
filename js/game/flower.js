// flower.js - the flowers you pick to make bouquets.
import { Entity } from "./entity.js";
import { SpriteSheet } from "./sprite.js";

// Order matters: it is also the column of each flower in flowers-sheet.png
export const FLOWER_TYPES = ["rose", "tulip", "daisy"];

const FLOWER_SHEET = new SpriteSheet("images/flowers-sheet.png", 48, 48);

export class Flower extends Entity {
  /**
   * @param {string} type - "rose", "tulip" or "daisy"
   * @param {number} x
   * @param {number} y
   */
  constructor(type, x, y) {
    super(x, y, 16);
    this.type = type;
    this.column = FLOWER_TYPES.indexOf(type);
    this.swayOffset = Math.random() * Math.PI * 2; // so flowers don't all sway together
    this.clock = 0;
  }

  update(seconds) {
    this.clock += seconds;
  }

  /**
   * Draws a flower (also used by the HUD, so it is a static helper).
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} type
   * @param {number} x - centre x
   * @param {number} y - centre y
   * @param {number} scale
   */
  static drawIcon(ctx, type, x, y, scale) {
    FLOWER_SHEET.draw(ctx, FLOWER_TYPES.indexOf(type), 0, x, y, scale);
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    // Gentle sway: tilt the flower from its base
    const sway = Math.sin(this.clock * 2 + this.swayOffset) * 0.08;
    ctx.save();
    ctx.translate(this.x, this.y + 20);
    ctx.rotate(sway);
    FLOWER_SHEET.draw(ctx, this.column, 0, 0, -20, 1);
    ctx.restore();
  }
}
