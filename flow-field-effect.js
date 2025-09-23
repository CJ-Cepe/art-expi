import Particle from "./particle.js";

export default class FlowFieldEffect {
  particles = [];
  flowField = [];

  particleCount = 2000; // 500 - 2000
  cellSize = 5; // 5 - 50
  flowStrength = 0.2; // 0.1 - 1
  curlScale = 0.05; // 0.01 - 0.1

  imageData = null;
  imgWidth = 0;
  imgHeight = 0;

  curlPoints = [
    { x: 0.8, y: 0.3, innerRadius: 50, radius: 200, falloffExponent: 3 },
    { x: 0.2, y: 0.6, innerRadius: 10, radius: 400, falloffExponent: 4 },
    { x: 0.6, y: 0.7, innerRadius: 10, radius: 200, falloffExponent: 2 },
  ];

  constructor(context) {
    this.canvas = context.canvas;
    this.context = context;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.rows = Math.ceil(this.height / this.cellSize);
    this.cols = Math.ceil(this.width / this.cellSize);
  }

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
    const maxDistance = Math.hypot(this.width / 2, this.height / 2);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cellScreenX = x * this.cellSize + this.cellSize / 2;
        const cellScreenY = y * this.cellSize + this.cellSize / 2;

        let summedCurlVector = { x: 0, y: 0 };

        // Loop through each curl point and sum their influences
        for (const curlPoint of this.curlPoints) {
          const curlPointX = curlPoint.x * this.width;
          const curlPointY = curlPoint.y * this.height;

          const distance = Math.hypot(
            cellScreenX - curlPointX,
            cellScreenY - curlPointY
          );

          let falloffFactor = 0;
          if (distance < curlPoint.innerRadius) {
            // Full influence inside the inner radius
            falloffFactor = 1;
          } else if (distance < curlPoint.radius) {
            // Exponentially fade the influence in the transition zone
            const normalizedDistance =
              (distance - curlPoint.innerRadius) /
              (curlPoint.radius - curlPoint.innerRadius);
            falloffFactor = Math.pow(
              1 - normalizedDistance,
              curlPoint.falloffExponent
            );
          }

          if (falloffFactor > 0) {
            const cellCurlX = (cellScreenX - curlPointX) / this.cellSize;
            const cellCurlY = (cellScreenY - curlPointY) / this.cellSize;

            const curlVector = this.vectorField(cellCurlX, cellCurlY);

            summedCurlVector.x += curlVector.x * this.curlScale * falloffFactor;
            summedCurlVector.y += curlVector.y * this.curlScale * falloffFactor;
          }
        }

        // 1. Get the base vector (left to right)
        const baseVector = { x: this.flowStrength, y: 0 };

        // 2. Combine the base and summed curl vectors
        const finalVector = {
          x: baseVector.x + summedCurlVector.x,
          y: baseVector.y + summedCurlVector.y,
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
