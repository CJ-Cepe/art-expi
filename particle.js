export default class Particle {
  history = [];
  vx = 0; // The particle's horizontal velocity
  vy = 0; // The particle's vertical velocity
  maxLength = Math.floor(Math.random() * 200 + 10);

  constructor(effect) {
    this.effect = effect;
    this.context = effect.context;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
  }

  // --------------
  update() {
    // locate where the particle is in the grid cells
    let x = Math.floor(this.x / this.effect.cellSize);
    let y = Math.floor(this.y / this.effect.cellSize);
    let index = y * this.effect.cols + x; //  standard way to look up a value in a 2D grid that is stored in a flat array.

    // get the vector from the flow field
    const forceVector = this.effect.flowField[index];

    // if the vector exists, add it to the particle's velocity
    if (forceVector) {
      this.vx += forceVector.x;
      this.vy += forceVector.y;
    }

    // update particle position based on its velocity
    this.x += this.vx;
    this.y += this.vy;

    // apply friction to the velocity (this slows it down over time)
    this.vx *= 0.95;
    this.vy *= 0.95;

    // push new x and y
    this.history.push({ x: this.x, y: this.y });

    // remove first elem if > than maxlength
    if (this.history.length > this.maxLength) {
      this.history.shift();
    }
  }

  // --------------
  draw() {
    if (this.history.length === 0) return;
    // get color from the original image at the particle's location
    /*    const imgX = Math.floor(
      (this.x / this.effect.width) * this.effect.imgWidth
    );
    const imgY = Math.floor(
      (this.y / this.effect.height) * this.effect.imgHeight
    );
    const imgIndex = (imgY * this.effect.imgWidth + imgX) * 4;
    const r = this.effect.imageData[imgIndex];
    const g = this.effect.imageData[imgIndex + 1];
    const b = this.effect.imageData[imgIndex + 2];
    this.context.strokeStyle = `rgb(${r}, ${g}, ${b})`;
 */
    // drawing the line based on history
    this.context.beginPath();
    this.context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      this.context.lineTo(this.history[i].x, this.history[i].y);
    }
    this.context.stroke();
  }

  // --------
  reset() {
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.vx = 0; // reset velocity when the particle is out of bounds
    this.vy = 0;
    this.history = [];
  }
}
