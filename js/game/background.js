// background.js - paints the garden for a level once, ready to reuse every frame.

/**
 * @param {Object} theme - colours from levels.js
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement} an off-screen canvas holding the finished picture
 */

export function createBackground(theme, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // A tiny "random" generator with a fixed seed, so each level always
  let seed = theme.seed;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Base grass
  ctx.fillStyle = theme.grass;
  ctx.fillRect(0, 0, width, height);

  // Soft darker patches, like watercolour washes
  ctx.fillStyle = theme.grassDark;
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.ellipse(random() * width, random() * height, 30 + random() * 70, 15 + random() * 35, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Winding garden path
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.path;
  ctx.lineWidth = 80;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height + 30);
  ctx.bezierCurveTo(width * 0.1, height * 0.75, width * 0.9, height * 0.45, width * 0.5, 40);
  ctx.stroke();

  // Grass tufts
  ctx.strokeStyle = theme.grassDark;
  ctx.lineWidth = 2;
  for (let i = 0; i < 140; i++) {
    const x = random() * width;
    const y = 70 + random() * (height - 70);
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 1, y - 8);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 10);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 1, y - 8);
    ctx.stroke();
  }

  // Tiny faint dots of colour (smaller than the real flowers on purpose)
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = theme.accents[Math.floor(random() * theme.accents.length)];
    ctx.beginPath();
    ctx.arc(random() * width, 70 + random() * (height - 70), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Colour tint for the time of day
  ctx.fillStyle = theme.tint;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}
