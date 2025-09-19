export default class Effect {
  particles = [];
  flowField = [];
  particleCount = 1000;
  cellSize = 50;
  rows = 0;
  cols = 0;

  constructor(ctx) {
    this.canvas = ctx.canvas;
    this.context = ctx.context;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.initialize();
  }

  // initialize
  initialize() {
    // 1. calc # of rows/cells by dividing window size by set cellsize
    rows = Math.floor(this.height / this.cellSize);
    cols = Math.floor(this.width / this.cellSize);

    // 2. draw image to trace

    // 3. scan for pixel data
    // set grid cell angles

    // 4. create particles & push to particles collection
    for (let i = 0; i < this.particleCount; i++) {
      particles.push(new Particle(this));
    }
  }

  // render
}
