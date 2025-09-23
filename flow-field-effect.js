import Particle from "./particle.js";
import VectorField from "./vector-field.js";

export default class FlowFieldEffect {
  particles = [];
  flowField = [];

  particleCount = 2000;
  cellSize = 10;
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
        x: 0.65,
        y: 0.5,
        innerRadius: 100,
        radius: 300,
        falloffExponent: 3,
        curlScale: 0.01,
        rotateClockwise: true,
      },
      {
        x: 0.3,
        y: 0.5,
        innerRadius: 100,
        radius: 300,
        falloffExponent: 3,
        curlScale: 0.01,
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
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new Particle(this));
    }
  }

  // --------------
  generateVectorField() {
    this.flowField = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const vector = new VectorField(this, x, y);
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
