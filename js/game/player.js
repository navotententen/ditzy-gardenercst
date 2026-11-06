// player.js - the ditzy cat gardener you control.
import { Entity } from "./entity.js";
import { SpriteSheet, Animation } from "./sprite.js";

const SPEED = 190; // pixels per second
const REVERSED_SECONDS = 4; // how long left/right stay swapped after a sting
const SAFE_SECONDS = 2; // short "can't be stung again" time after a sting

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 18);

    this.sheet = new SpriteSheet("images/cat-sheet.png", 64, 64);
    this.animation = new Animation(4, 0.12);

    this.row = 0; // sprite sheet row: 0 = facing right, 1 = facing left
    this.reversedTimer = 0; // seconds of swapped controls left
    this.safeTimer = 0; // seconds of sting protection left
    this.hasShield = false; // true after picking up a ladybug
    this.clock = 0; // used for the wobble and blinking effects
  }

  /**
   * Moves the cat according to the keys being held down.
   * @param {number} seconds - time since the last update
   * @param {{left:boolean,right:boolean,up:boolean,down:boolean}} keys
   * @param {{left:number,top:number,right:number,bottom:number}} bounds
   */
  update(seconds, keys, bounds) {
    this.clock += seconds;
    this.reversedTimer = Math.max(0, this.reversedTimer - seconds);
    this.safeTimer = Math.max(0, this.safeTimer - seconds);

    let moveX = 0;
    let moveY = 0;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;
    if (keys.up) moveY -= 1;
    if (keys.down) moveY += 1;

    // The bee-sting curse: left turns to the right and the other way around
    if (this.reversedTimer > 0) {
      moveX = -moveX;
    }

    const moving = moveX !== 0 || moveY !== 0;
    if (moving) {
      // Divide by the length so moving diagonally isn't faster
      const length = Math.hypot(moveX, moveY);
      this.x += (moveX / length) * SPEED * seconds;
      this.y += (moveY / length) * SPEED * seconds;

      if (moveX > 0) this.row = 0;
      if (moveX < 0) this.row = 1;
      this.animation.update(seconds);
    } else {
      this.animation.reset();
    }

    // Keep the cat inside the garden
    this.x = Math.min(bounds.right - this.radius, Math.max(bounds.left + this.radius, this.x));
    this.y = Math.min(bounds.bottom - this.radius, Math.max(bounds.top + this.radius, this.y));
  }

  /** Called when a bee stings the cat (and there is no shield). */
  getStung() {
    this.reversedTimer = REVERSED_SECONDS;
    this.safeTimer = SAFE_SECONDS;
  }

  /** Called when a shield absorbs a sting. */
  useShield() {
    this.hasShield = false;
    this.safeTimer = 1.5;
  }

  /** Puts the cat back in a fresh state (new game or new level). */
  resetStatus() {
    this.reversedTimer = 0;
    this.safeTimer = 0;
    this.hasShield = false;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    // Blink while protected from stings
    const blinkOff = this.safeTimer > 0 && Math.floor(this.clock * 12) % 2 === 0;
    if (!blinkOff) {
      this.sheet.draw(ctx, this.animation.frame, this.row, this.x, this.y - 8, 1);
    }

    if (this.hasShield) {
      ctx.save();
      ctx.strokeStyle = "rgba(229, 80, 80, 0.85)";
      ctx.fillStyle = "rgba(255, 140, 140, 0.18)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 6, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (this.reversedTimer > 0) {
      // Dizzy swirl above the head
      ctx.save();
      ctx.fillStyle = "#7a5c4a";
      ctx.font = "bold 20px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("@ ? @", this.x + Math.sin(this.clock * 8) * 4, this.y - 42);
      ctx.restore();
    }
  }
}
