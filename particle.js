export default class Particle {
  vx = 0; // The particle's horizontal velocity
  vy = 0; // The particle's vertical velocity
  maxLength = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
  timer = this.maxLength * 2;
  particleWidth = 0.5;
  speed = 5;

  constructor(effect) {
    this.effect = effect;
    this.context = effect.context;
    this.startingX = Math.floor(Math.random() * this.effect.width);
    this.startingY = Math.floor(Math.random() * this.effect.height);
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
  }

  // --------------
  draw() {
    // drawing the line based on history
    this.context.beginPath();
    this.context.lineWidth = this.particleWidth;
    this.context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      this.context.lineTo(this.history[i].x, this.history[i].y);
    }
    this.context.stroke();
  }

  // --------------
  update() {
    this.timer--;
    // 1 -
    if (this.timer >= 1) {
      // locate where the particle is in the grid cells
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x; //  standard way to look up a value in a 2D grid that is stored in a flat array.

      // get the vector from the flow field
      const forceVector = this.effect.flowField[index];

      // if the vector exists, add it to the particle's velocity
      if (forceVector) {
        this.x += forceVector.x * this.speed;
        this.y += forceVector.y * this.speed;
      }

      // push new x and y
      this.history.push({ x: this.x, y: this.y });

      // remove first elem if > than maxlength
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }

  // --------
  reset() {
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxLength * 2;
  }
}
