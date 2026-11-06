// sprite.js - draws pictures from a sprite sheet and animates them.
// A sprite sheet is ONE image that holds many frames side by side.

/** Loads a sprite sheet and draws single frames from it. */
export class SpriteSheet {
  /**
   * @param {string} src - image path, e.g. "images/bee-sheet.png"
   * @param {number} frameWidth - width of one frame in pixels
   * @param {number} frameHeight - height of one frame in pixels
   */
  constructor(src, frameWidth, frameHeight) {
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.loaded = false;

    this.image = new Image();
    this.image.addEventListener("load", () => {
      this.loaded = true;
    });
    this.image.src = src;
  }

  /**
   * Draws one frame so that its centre sits at (x, y).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame - column in the sheet (0 = first)
   * @param {number} row - row in the sheet (0 = first)
   * @param {number} x - centre x on the canvas
   * @param {number} y - centre y on the canvas
   * @param {number} [scale=1] - make the picture bigger or smaller
   */
  draw(ctx, frame, row, x, y, scale = 1) {
    if (!this.loaded) {
      return;
    }
    const width = this.frameWidth * scale;
    const height = this.frameHeight * scale;
    ctx.drawImage(
      this.image,
      frame * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      x - width / 2,
      y - height / 2,
      width,
      height
    );
  }
}

/** Steps through the frames of a sprite sheet over time. */
export class Animation {
  /**
   * @param {number} frameCount - how many frames to cycle through
   * @param {number} secondsPerFrame - how long each frame is shown
   */
  constructor(frameCount, secondsPerFrame) {
    this.frameCount = frameCount;
    this.secondsPerFrame = secondsPerFrame;
    this.timer = 0;
    this.frame = 0;
  }

  /** Call every game tick with the seconds that have passed. */
  update(seconds) {
    this.timer += seconds;
    while (this.timer >= this.secondsPerFrame) {
      this.timer -= this.secondsPerFrame;
      this.frame = (this.frame + 1) % this.frameCount;
    }
  }

  /** Back to the first frame (used when the player stands still). */
  reset() {
    this.timer = 0;
    this.frame = 0;
  }
}
