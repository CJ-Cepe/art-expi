import Particle from "./particle.js";
import VectorCell from "./vector-cell.js";

export default class FlowFieldEffect {
  // 1. base vector fields
  flowField = [];
  cellSize = 5;
  waveAmplitude = 0.1; // how tall the waves are
  waveFrequency = 0.01; // how frequent the waves are (smaller = smoother)

  // 2. particle generation fields
  particleCount = 3000;
  particles = [];
  jitter = 2;

  // 3. particle movement fields
  flowStrength = 0.15;
  maxStrength = 2;

  constructor(context, width, height) {
    this.canvas = context.canvas;
    this.context = context;
    this.height = height;
    this.width = width;
    this.rows = Math.ceil(this.height / this.cellSize);
    this.cols = Math.ceil(this.width / this.cellSize);
    this.animationFrameId = null;
    this.curlPoints = [
      // left stars
      {
        x: 0.1,
        y: 0.2,
        innerRadius: 10,
        radius: 80,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: true,
        isStar: true,
      },
      {
        x: 0.25,
        y: 0.1,
        innerRadius: 20,
        radius: 40,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: true,
        isStar: true,
      },
      {
        x: 0.12,
        y: 0.6,
        innerRadius: 20,
        radius: 50,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: true,
        isStar: true,
      },
      // right stars
      {
        x: 0.55,
        y: 0.2,
        innerRadius: 10,
        radius: 90,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: true,
        isStar: true,
      },
      {
        x: 0.65,
        y: 0.43,
        innerRadius: 10,
        radius: 50,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: true,
        isStar: true,
      },
      {
        x: 0.85,
        y: 0.3,
        innerRadius: 80,
        radius: 125,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: false,
        isStar: true,
      },
      {
        x: 0.75,
        y: 0.8,
        innerRadius: 10,
        radius: 80,
        falloffExponent: 4,
        curlScale: 0.9,
        rotateClockwise: false,
        isStar: true,
      },

      // sky
      {
        x: 0.35,
        y: 0.5,
        innerRadius: 10,
        radius: 220,
        falloffExponent: 4,
        curlScale: 0.5,
        rotateClockwise: true,
        isStar: false,
      },
      {
        x: 0.5,
        y: 0.75,
        innerRadius: 10,
        radius: 130,
        falloffExponent: 3,
        curlScale: 0.5,
        rotateClockwise: false,
        isStar: false,
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

    this.animationFrameId = requestAnimationFrame(this.render.bind(this));
  }

  // --------------
  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
