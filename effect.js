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

  constructor(context) {
    this.canvas = context.canvas;
    this.context = context;
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
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = this.imgWidth;
        tempCanvas.height = this.imgHeight;
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
    this.rows = Math.ceil(this.height / this.cellSize);
    this.cols = Math.ceil(this.width / this.cellSize);

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
          x: Math.cos(angle) * magnitude,
          y: Math.sin(angle) * magnitude,
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
