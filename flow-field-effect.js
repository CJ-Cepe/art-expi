import Particle from "./particle.js";
import VectorCell from "./vector-cell.js";

export default class FlowFieldEffect {
  particles = [];
  flowField = [];

  particleCount = 3000;
  cellSize = 5;
  flowStrength = 0.1;

  constructor(context) {
    this.canvas = context.canvas;
    this.context = context;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.rows = Math.ceil(this.height / this.cellSize);
    this.cols = Math.ceil(this.width / this.cellSize);
    this.curlPoints = [
      {
        x: 0.3,
        y: 0.6,
        innerRadius: 100,
        radius: 200,
        falloffExponent: 3,
        curlScale: 0.9,
        rotateClockwise: false,
      },
      {
        x: 0.4,
        y: 0.8,
        innerRadius: 50,
        radius: 300,
        falloffExponent: 3,
        curlScale: 0.99,
        rotateClockwise: false,
      },
      {
        x: 0.8,
        y: 0.2,
        innerRadius: 80,
        radius: 100,
        falloffExponent: 1,
        curlScale: 0.4,
        rotateClockwise: true,
      },
      {
        x: 0.6,
        y: 0.4,
        innerRadius: 50,
        radius: 80,
        falloffExponent: 2,
        curlScale: 0.4,
        rotateClockwise: false,
      },
      {
        x: 0.5,
        y: 0.2,
        innerRadius: 50,
        radius: 100,
        falloffExponent: 1,
        curlScale: 0.3,
        rotateClockwise: false,
      },
    ];
  }

  // --------------
  init() {
    this.generateParticles();
    this.generateVectorField();
  }

  // --------------
  generateParticles() {
    this.particles = [];
    const cells = [];

    // to remove
    const cols = Math.floor(this.width / this.cellSize);
    const rows = Math.floor(this.height / this.cellSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells.push({ x, y });
      }
    }

    // shuffle array
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const jitter = this.cellSize * 0;

    // pick first N shuffled cells
    for (let i = 0; i < this.particleCount && i < cells.length; i++) {
      const cell = cells[i];
      const px = cell.x * this.cellSize + Math.random() * jitter;
      const py = cell.y * this.cellSize + Math.random() * jitter;
      this.particles.push(new Particle(this, px, py));
    }
  }

  // --------------
  generateVectorField() {
    this.flowField = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const vector = new VectorCell(this, x, y);
        const finalVector = vector.calculateVector();
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
