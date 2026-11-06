// home.js - the little animated story on the home page:
// the cat PICKS flowers, DODGES a bee, then DELIGHTS a customer. Then it loops.
// It re-uses the same sprite sheets and background as the real game.
import { SpriteSheet } from "./game/sprite.js";
import { createBackground } from "./game/background.js";
import { LEVELS } from "./game/levels.js";

const WIDTH = 720;
const HEIGHT = 440;
const LOOP_SECONDS = 15; // the whole story takes this long, then repeats
const GROUND_Y = 300; // the cat's and the flowers' height on screen

// Sprite sheets (the same pictures as the game)
const catSheet = new SpriteSheet("images/cat-sheet.png", 64, 64);
const beeSheet = new SpriteSheet("images/bee-sheet.png", 40, 40);
const flowerSheet = new SpriteSheet("images/flowers-sheet.png", 48, 48);
const customerSheet = new SpriteSheet("images/customer-sheet.png", 48, 48);

// The two flowers the cat will pick (column = position in flowers-sheet.png)
const FLOWERS = [
  { column: 0, x: 250 },
  { column: 1, x: 370 }
];

const CUSTOMER_X = 640;

class HomeScene {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.background = createBackground(LEVELS[0].theme, WIDTH, HEIGHT);
  }

  /**
   * Where is the cat at this moment of the story?
   * @param {number} t - seconds into the loop
   * @returns {{x:number, y:number, walking:boolean}}
   */
  catState(t) {
    if (t < 5) {
      // Part 1: walk right, picking flowers
      return { x: 90 + (310 * t) / 5, y: GROUND_Y, walking: true };
    }
    if (t < 9.5) {
      // Part 2: stand still, then hop over the bee
      let jump = 0;
      if (t > 6.9 && t < 7.6) {
        jump = Math.sin(((t - 6.9) / 0.7) * Math.PI) * 75;
      }
      return { x: 400, y: GROUND_Y - jump, walking: false };
    }
    if (t < 12) {
      // Part 3: walk to the customer
      return { x: 400 + (130 * (t - 9.5)) / 2.5, y: GROUND_Y, walking: true };
    }
    return { x: 530, y: GROUND_Y, walking: false };
  }

  /** Draws one picture of the story. */
  draw(t) {
    const ctx = this.ctx;
    const cat = this.catState(t);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(this.background, 0, 0);

    // Flowers that haven't been picked yet
    let picked = 0;
    FLOWERS.forEach((flower) => {
      // The moment the cat reaches this flower (the cat walks from x=90 to x=400 in 5 seconds)
      const pickedAt = (5 * (flower.x - 30 - 90)) / 310;
      if (t >= pickedAt) {
        picked += 1;
        // A little "+10" floats up when it is picked
        const age = t - pickedAt;
        if (age < 1) {
          this.drawText("+10", flower.x, GROUND_Y - 30 - age * 40, 22, "#3f8f4d", 1 - age);
        }
      } else {
        flowerSheet.draw(ctx, flower.column, 0, flower.x, GROUND_Y + 6, 1.6);
      }
    });

    // The customer
    const delighted = t >= 12;
    customerSheet.draw(ctx, delighted ? 0 : 1, 0, CUSTOMER_X, GROUND_Y - 6, 2.4);

    // The bee flies in from the right and zooms past the cat
    if (t > 5.2 && t < 9.6) {
      const beeX = 760 - ((t - 5.2) * 800) / 4.4;
      const beeY = GROUND_Y - 4 + Math.sin(t * 9) * 8;
      ctx.save();
      ctx.translate(beeX, beeY);
      ctx.scale(-1.6, 1.6); // flies left, so flip the picture
      beeSheet.draw(ctx, Math.floor(t * 14) % 2, 0, 0, 0, 1);
      ctx.restore();
    }

    // The cat (walking uses the 4 walking frames; standing uses the first)
    const frame = cat.walking ? Math.floor(t * 9) % 4 : 0;
    catSheet.draw(ctx, frame, 0, cat.x, cat.y - 6, 1.7);

    // The picked flowers float above the cat's head until the customer gets them
    if (t < 12) {
      for (let i = 0; i < picked; i++) {
        flowerSheet.draw(ctx, FLOWERS[i].column, 0, cat.x - 14 + i * 28, cat.y - 78, 0.8);
      }
    }

    // Hearts rise from the happy customer
    if (delighted) {
      for (let i = 0; i < 3; i++) {
        const age = ((t - 12 + i * 0.5) % 1.5) / 1.5;
        this.drawText("♥", CUSTOMER_X - 30 + i * 30, GROUND_Y - 90 - age * 60, 26, "#e05a85", 1 - age);
      }
    }

    // Part labels: Pick! Dodge! Delight!
    if (t < 5) {
      this.drawLabel("1. Pick!");
    } else if (t < 9.5) {
      this.drawLabel("2. Dodge!");
    } else {
      this.drawLabel("3. Delight!");
    }

    // Fade out at the very end so the loop restarts smoothly
    if (t > LOOP_SECONDS - 0.5) {
      ctx.fillStyle = `rgba(255, 248, 236, ${(t - (LOOP_SECONDS - 0.5)) / 0.5})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  /** Big title in the top-left corner. */
  drawLabel(text) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(255, 248, 236, 0.92)";
    ctx.strokeStyle = "#7a5c4a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(16, 16, 210, 62, 20);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    this.drawText(text, 121, 60, 36, "#e07a9e", 1);
  }

  /** Draws centred text, with a given size, colour and see-through amount. */
  drawText(text, x, y, size, colour, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = colour;
    ctx.textAlign = "center";
    ctx.font = `bold ${size}px "ButterflyFont", "Comic Sans MS", cursive`;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}

function startHomeScene() {
  const canvas = document.getElementById("home-canvas");
  const scene = new HomeScene(canvas);

  // People who prefer less motion get one still picture instead of the loop
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scene.draw(12.5);
    return;
  }

  const startTime = performance.now();
  function frame(now) {
    const t = ((now - startTime) / 1000) % LOOP_SECONDS;
    scene.draw(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

startHomeScene();
