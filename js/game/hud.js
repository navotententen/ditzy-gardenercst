// hud.js - the information bar at the top of the game (hearts, score, order...).
import { SpriteSheet } from "./sprite.js";
import { Flower, FLOWER_TYPES } from "./flower.js";

const BROWN = "#7a5c4a";
const CUSTOMER_SHEET = new SpriteSheet("images/customer-sheet.png", 48, 48);

export class Hud {
  /**
   * @param {number} width - canvas width
   * @param {number} height - height of the bar
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  /**
   * Draws the whole bar.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} s - the game's current numbers (see Game.getHudState)
   */
  draw(ctx, s) {
    // Bar background
    ctx.fillStyle = "#fff8ec";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = BROWN;
    ctx.fillRect(0, this.height - 3, this.width, 3);

    // Left: hearts and score
    for (let i = 0; i < 3; i++) {
      this.drawHeart(ctx, 30 + i * 30, 24, 12, i < s.hearts);
    }
    ctx.fillStyle = BROWN;
    ctx.textAlign = "left";
    ctx.font = "bold 16px 'Trebuchet MS', sans-serif";
    ctx.fillText(`Score: ${s.score}`, 14, 54);

    // Left-middle: level, customer and rating
    ctx.font = "bold 13px 'Trebuchet MS', sans-serif";
    ctx.fillText(`Level ${s.levelNumber}: ${s.levelName}`, 135, 20);
    ctx.fillText(`Customer ${s.customerNumber} of ${s.customerTotal}`, 135, 38);
    ctx.fillText(`Shop rating: ${s.rating.toFixed(1)}/10`, 135, 56);

    // Middle: the customer and what they want
    CUSTOMER_SHEET.draw(ctx, s.mood, 0, 340, 30, 0.9);
    if (s.order) {
      let x = 375;
      FLOWER_TYPES.forEach((type) => {
        if (s.order[type] > 0) {
          Flower.drawIcon(ctx, type, x + 14, 28, 0.7);
          ctx.fillStyle = s.basket[type] >= s.order[type] ? "#3f8f4d" : BROWN;
          ctx.font = "bold 16px 'Trebuchet MS', sans-serif";
          ctx.fillText(`${s.basket[type]}/${s.order[type]}`, x + 34, 36);
          x += 88;
        }
      });

      // Patience bar
      const share = Math.max(0, s.orderTimeLeft / s.orderTime);
      ctx.fillStyle = "#ecd9c0";
      ctx.fillRect(375, 50, 260, 8);
      ctx.fillStyle = share > 0.3 ? "#7bc47f" : "#e05a5a";
      ctx.fillRect(375, 50, 260 * share, 8);
    } else {
      ctx.fillStyle = BROWN;
      ctx.font = "bold 14px 'Trebuchet MS', sans-serif";
      ctx.fillText("Next customer is coming...", 375, 36);
    }

  }

  /**
   * Draws a big message in the middle of the garden (used between levels).
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} title
   * @param {string} subtitle
   */
  drawBanner(ctx, title, subtitle) {
    const y = (this.height + 520) / 2;
    ctx.save();
    ctx.fillStyle = "rgba(255, 248, 236, 0.92)";
    ctx.strokeStyle = BROWN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 250, y - 55, 500, 110, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e07a9e";
    ctx.textAlign = "center";
    ctx.font = "bold 34px 'Trebuchet MS', sans-serif";
    ctx.fillText(title, this.width / 2, y - 5);
    ctx.fillStyle = BROWN;
    ctx.font = "18px 'Trebuchet MS', sans-serif";
    ctx.fillText(subtitle, this.width / 2, y + 30);
    ctx.restore();
  }

  /** Draws one heart (filled = life left, outline = life lost). */
  drawHeart(ctx, x, y, size, filled) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.4);
    ctx.bezierCurveTo(-size * 1.2, -size * 0.4, -size * 0.5, -size * 1.1, 0, -size * 0.4);
    ctx.bezierCurveTo(size * 0.5, -size * 1.1, size * 1.2, -size * 0.4, 0, size * 0.4);
    ctx.closePath();
    ctx.fillStyle = filled ? "#e05a85" : "#f3e2d6";
    ctx.strokeStyle = BROWN;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
