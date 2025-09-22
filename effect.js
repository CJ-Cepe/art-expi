import Particle from "./particle.js";

export default class FlowFieldEffect {
  particles = [];
  flowField = [];

  particleCount = 2000; // number of particles (500 - 2000)
  cellSize = 10; // size of each grid cell (5 - 50)
  flowStrength = 0.1; // base leftto right flow speed (0.1 - 1)
  curlScale = 0.009; // how much the curl affects the flow (0.01 - 0.1)
  falloffExponent = 1.5; // controls how fast the curl influence drops off (1 - 5)

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

  // vector field definition for curl ---
  vectorField(x, y) {
    return {
      x: y,
      y: -x,
    };
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

        // create a temporary hidden canvas to read pixel data
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
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxDistance = Math.sqrt(
      (this.width / 2) ** 2 + (this.height / 2) ** 2
    );

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Calculate the cell's position in screen coordinates
        const cellScreenX = x * this.cellSize + this.cellSize / 2;
        const cellScreenY = y * this.cellSize + this.cellSize / 2;

        // Calculate the distance from the center
        const distance = Math.sqrt(
          (cellScreenX - centerX) ** 2 + (cellScreenY - centerY) ** 2
        );

        // Create a falloff factor: 1 at the center, approaching 0 at the edges
        const falloff = 1 - Math.min(distance / maxDistance, 1);
        const falloffFactor = Math.pow(falloff, this.falloffExponent);

        // The curl vector is based on relative coordinates from the center
        const cellCurlX = (cellScreenX - centerX) / this.cellSize;
        const cellCurlY = (cellScreenY - centerY) / this.cellSize;

        // 1. Get the base vector (left to right)
        const baseVector = { x: this.flowStrength, y: 0 };

        // 2. Get the raw curl vector
        const curlVector = this.vectorField(cellCurlX, cellCurlY);

        // 3. Combine the two vectors, applying both curlScale and the distance falloff
        const finalVector = {
          x: baseVector.x + curlVector.x * this.curlScale * falloffFactor,
          y: baseVector.y + curlVector.y * this.curlScale * falloffFactor,
        };

        this.flowField.push(finalVector);
      }
    }
  }

  // --------------
  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((particle) => {
      particle.draw();
      particle.update();
    });

    requestAnimationFrame(this.render.bind(this));
  }
}
