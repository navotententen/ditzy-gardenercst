// bee.js - wandering bees that sting the player.
import { Entity } from "./entity.js";
import { SpriteSheet, Animation } from "./sprite.js";

// One shared sprite sheet for all bees (so the picture is only loaded once)
const BEE_SHEET = new SpriteSheet("images/bee-sheet.png", 40, 40);

export class Bee extends Entity {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} speed - pixels per second
   * @param {boolean} chases - if true the bee drifts towards a nearby player
   */
  constructor(x, y, speed, chases) {
    super(x, y, 14);
    this.speed = speed;
    this.chases = chases;

    this.angle = Math.random() * Math.PI * 2; // direction of travel (radians)
    this.turnTimer = 0; // seconds until the bee picks a new direction
    this.stunTimer = 0; // seconds the bee is dazed after hitting a shield
    this.animation = new Animation(2, 0.08);
  }

  /**
   * @param {number} seconds
   * @param {Entity} player - the bee may chase this
   * @param {{left:number,top:number,right:number,bottom:number}} bounds
   */
  update(seconds, player, bounds) {
    this.animation.update(seconds);
    this.stunTimer = Math.max(0, this.stunTimer - seconds);

    // Wander: pick a new random direction every now and then
    this.turnTimer -= seconds;
    if (this.turnTimer <= 0) {
      this.angle = Math.random() * Math.PI * 2;
      this.turnTimer = 1 + Math.random() * 1.5;
    }

    // Level 2 bees notice you when you get close
    if (this.chases && this.stunTimer === 0 && this.distanceTo(player) < 170) {
      this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    }

    // Dazed bees buzz around slowly
    const currentSpeed = this.stunTimer > 0 ? this.speed * 0.3 : this.speed;
    this.x += Math.cos(this.angle) * currentSpeed * seconds;
    this.y += Math.sin(this.angle) * currentSpeed * seconds;

    // Bounce off the garden edges
    if (this.x < bounds.left + this.radius) {
      this.x = bounds.left + this.radius;
      this.angle = Math.PI - this.angle;
    } else if (this.x > bounds.right - this.radius) {
      this.x = bounds.right - this.radius;
      this.angle = Math.PI - this.angle;
    }
    if (this.y < bounds.top + this.radius) {
      this.y = bounds.top + this.radius;
      this.angle = -this.angle;
    } else if (this.y > bounds.bottom - this.radius) {
      this.y = bounds.bottom - this.radius;
      this.angle = -this.angle;
    }
  }

  /** Sends the bee away from the player after its sting was blocked. */
  shoo(player) {
    this.angle = Math.atan2(this.y - player.y, this.x - player.x);
    this.turnTimer = 1.5;
    this.stunTimer = 1.5;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    // The picture faces right, so flip it when the bee flies left
    if (Math.cos(this.angle) < 0) {
      ctx.scale(-1, 1);
    }
    BEE_SHEET.draw(ctx, this.animation.frame, 0, 0, 0, 1);
    ctx.restore();
  }
}
