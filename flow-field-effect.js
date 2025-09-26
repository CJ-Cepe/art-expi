import Particle from "./particle.js";
import VectorCell from "./vector-cell.js";

export default class FlowFieldEffect {
  // 1. base vector fields
  flowField = [];
  cellSize = 20;
  waveAmplitude = 0.05; // how tall the waves are
  waveFrequency = 0.02; // how frequent the waves are (smaller = smoother)

  // 2. particle generation fields
  particleCount = 3000;
  particles = [];
  jitter = 2;

  // 3. particle movement fields
  flowStrength = 0.1;
  maxStrength = 0.5;

  constructor(context) {
    this.canvas = context.canvas;
    this.context = context;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.rows = Math.ceil(this.height / this.cellSize);
    this.cols = Math.ceil(this.width / this.cellSize);
    // TODO: fix clockwise
    this.curlPoints = [
      /* 
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
        y: 0.5,
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
      {
        x: 0.9,
        y: 0.75,
        innerRadius: 50,
        radius: 100,
        falloffExponent: 1,
        curlScale: 0.3,
        rotateClockwise: false,
      },
      {
        x: 0.1,
        y: 0.2,
        innerRadius: 30,
        radius: 60,
        falloffExponent: 1,
        curlScale: 0.3,
        rotateClockwise: false,
      },
      {
        x: 0.3,
        y: 0.5,
        innerRadius: 50,
        radius: 300,
        falloffExponent: 2,
        curlScale: 0.005,
        rotateClockwise: false,
      },
      {
        x: 0.45,
        y: 0.65,
        innerRadius: 50,
        radius: 100,
        falloffExponent: 2,
        curlScale: 0.01,
        rotateClockwise: true,
      }, */
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

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        cells.push({ x, y });
      }
    }

    // shuffle array
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const jitter = this.cellSize * this.jitter;

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
