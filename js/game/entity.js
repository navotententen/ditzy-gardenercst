// entity.js - the base class for everything that lives in the garden.
// Player, Bee, Flower and Pickup all "extend" this class, so they share
// one position, one size and one way of checking if they touch.

export class Entity {
  /**
   * @param {number} x - centre x
   * @param {number} y - centre y
   * @param {number} radius - size of the invisible circle used for touching
   */
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  /**
   * Do this entity and another one overlap?
   * @param {Entity} other
   * @returns {boolean}
   */
  touches(other) {
    const distance = Math.hypot(this.x - other.x, this.y - other.y);
    return distance < this.radius + other.radius;
  }

  /** Distance from this entity's centre to another's. */
  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }
}
