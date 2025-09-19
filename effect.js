import Particle from "./particle.js";

export default class Effect {
  particles = [];
  flowField = [];
  particleCount = 1000;
  cellSize = 50;
  rows = 0;
  cols = 0;

  constructor(ctx) {
    this.canvas = ctx.canvas;
    this.context = ctx;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.prepareBoard();
    this.drawBase();
    this.calculateField();
  }

  // --------------
  prepareBoard() {
    // 1. calc # of rows/cells by dividing window size by set cellsize
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);

    // 2. create particles & push to particles collection
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new Particle(this));
    }
  }

  // --------------
  drawBase() {
    // draw image to trace
    const img = new Image();
    img.src = "shapes.jpg";
    img.onload = () => {
      this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    };
  }

  // --------------
  calculateField() {
    // get pixels data
    const pixels = this.context.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;

    // extract equivalent pixel for each cell
    // calculate brightness based on pixel (rgba)
    // map brightness to an angle
    //  a dark pixel (brightness close to 0) will have an angle close to 0
    //  a bright pixel (brightness close to 255) will have an angle close to 2π
    // determine vector components
    for (let y = 0; y < this.height; y += this.cellSize) {
      for (let x = 0; x < this.width; x += this.cellSize) {
        const index = (y * this.width + x) * 4;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];

        // 1. Calculate Brightness
        const brightness = (red + green + blue) / 3;

        // 2. Map Brightness to an Angle
        // This maps brightness (0-255) to an angle (0-2 * PI radians)
        const angle = (brightness / 255) * Math.PI * 2;

        // 3. Determine Vector Components
        const vx = Math.cos(angle);
        const vy = Math.sin(angle);

        // Use brightness to set the magnitude (strength) of the vector
        const magnitude = brightness / 255;

        this.flowField.push({
          x: vx * magnitude,
          y: vy * magnitude,
          alpha: alpha,
          angle: angle,
        });
      }
    }
  }

  // --------------
  render() {
    this.particles.forEach((particle) => {
      particle.draw();
      particle.update();
    });
  }
}
