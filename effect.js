import Particle from "./particle.js";

export default class FlowFieldEffect {
  particles = [];
  flowField = [];

  particleCount = 1000;
  cellSize = 50;

  imageData = null;
  imgWidth = 0;
  imgHeight = 0;

  constructor(context) {
    this.canvas = context.canvas;
    this.context = context;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.rows = Math.ceil(this.height / this.cellSize);
    this.cols = Math.ceil(this.width / this.cellSize);
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

        this.generateParticles();
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
  generateParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new Particle(this));
    }
  }

  // --------------
  calculateField() {
    this.flowField = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const imgX = Math.floor((x / this.cols) * this.imgWidth);
        const imgY = Math.floor((y / this.rows) * this.imgHeight);
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
