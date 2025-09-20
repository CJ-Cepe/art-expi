import Particle from "./particle.js";

export default class FlowFieldEffect {
  particles = [];
  flowField = [];
  particleCount = 1000;
  cellSize = 50;
  rows = 0;
  cols = 0;
  imageData = null;
  imgWidth = 0;
  imgHeight = 0;

  constructor(ctx) {
    this.canvas = ctx.canvas;
    this.context = ctx;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
  }

  // --------------
  async init(imageUrl) {
    const image = new Image();
    image.src = imageUrl;

    return new Promise((resolve, reject) => {
      // resolve
      image.onload = () => {
        this.imgWidth = image.width;
        this.imgHeight = image.height;

        // Create a temporary hidden canvas to read pixel data
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.imgWidth;
        tempCanvas.height = this.imgHeight;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(image, 0, 0, this.imgWidth, this.imgHeight);
        this.imageData = tempCtx.getImageData(
          0,
          0,
          this.imgWidth,
          this.imgHeight
        ).data;

        this.prepareBoard();
        this.calculateField();
        resolve();
      };

      //reject
      image.onerror = () => {
        reject(new Error("Image failed to load."));
      };
    });
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
  calculateField() {
    this.flowField = [];
    const rows = Math.ceil(this.canvas.height / this.cellSize);
    const cols = Math.ceil(this.canvas.width / this.cellSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const imgX = Math.floor((x / cols) * this.imgWidth);
        const imgY = Math.floor((y / rows) * this.imgHeight);
        const imgIndex = (imgY * this.imgWidth + imgX) * 4;

        const r = this.imageData[imgIndex];
        const g = this.imageData[imgIndex + 1];
        const b = this.imageData[imgIndex + 2];

        // calc brightness
        const brightness = (r + g + b) / 3;

        // map brightness to angle and magnitude
        const angle = (brightness / 255) * Math.PI * 2;
        const magnitude = brightness / 255;

        this.flowField.push({
          vx: Math.cos(angle) * magnitude,
          vy: Math.sin(angle) * magnitude,
        });
      }
    }
  }

  // --------------
  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();

      // boundary conditions: wrap around the canvas
      if (
        particle.x < 0 ||
        particle.x > this.canvas.width ||
        particle.y < 0 ||
        particle.y > this.canvas.height
      ) {
        particle.reset();
      }
    });

    requestAnimationFrame(this.render.bind(this));
  }
}

/* NOTES
calculateFIeld
  // extract equivalent pixel for each cell
  // calculate brightness based on pixel (rgba)
  // map brightness to an angle
  //  a dark pixel (brightness close to 0) will have an angle close to 0
  //  a bright pixel (brightness close to 255) will have an angle close to 2π
  // determine vector components

// OLD code chunk
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
          //  x and y - components of a vector that tells the particle which direction to move and with what strength
          x: vx * magnitude,
          y: vy * magnitude,
          alpha: alpha,
          angle: angle,
        });
      }
    }
*/
