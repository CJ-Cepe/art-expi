export default class Particle {
  vx = 0; // The particle's horizontal velocity
  vy = 0; // The particle's vertical velocity
  maxLength = Math.floor(Math.random() * (30 - 10 + 1)) + 50;
  timer = Math.floor(Math.random() * this.maxLength * 2);
  particleWidth = 1;
  speed = 4;

  constructor(effect, px, py) {
    this.effect = effect;
    this.context = effect.context;
    // TODO: edit fields
    this.startingX = px; /* Math.floor(Math.random() * this.effect.width); */
    this.startingY = py; /* Math.floor(Math.random() * this.effect.height); */
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
  }

  // --------------
  draw() {
    // drawing the line based on history
    this.context.beginPath();
    this.context.lineWidth = this.particleWidth;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.globalAlpha = 0.5;
    this.context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      this.context.lineTo(this.history[i].x, this.history[i].y);
    }
    this.context.stroke();
  }

  // --------------
  update() {
    this.timer--;

    if (this.timer >= 1) {
      // locate where the particle is in the grid cells
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;

      // get the vector from the flow field
      const forceVector = this.effect.flowField[index];

      if (forceVector) {
        // cause particles gets squished & stretch when rotating curls
        const v = { x: forceVector.x, y: forceVector.y };

        // normalize
        const mag = Math.hypot(v.x, v.y);
        if (mag > 0) {
          v.x /= mag;
          v.y /= mag;
        }

        // scale
        const strength = this.effect.flowStrength ?? 1.0;
        v.x *= strength;
        v.y *= strength;

        // clamp
        const maxStrength = this.effect.maxStrength ?? 2.0;
        const newMag = Math.hypot(v.x, v.y);
        if (newMag > maxStrength) {
          v.x = (v.x / newMag) * maxStrength;
          v.y = (v.y / newMag) * maxStrength;
        }

        // apply to particle
        this.x += v.x * this.speed;
        this.y += v.y * this.speed;
      }

      // push new x and y
      this.history.push({ x: this.x, y: this.y });

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
