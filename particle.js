import Colors from "./colors.js";

export default class Particle {
  maxLength = Math.floor(Math.random() * (30 - 10 + 1)) + 50;
  timer = Math.floor(Math.random() * this.maxLength * 2);
  particleWidth = 1;
  speed = 5;
  colors = new Colors();

  constructor(effect, px, py) {
    this.effect = effect;
    this.context = effect.context;
    this.startingX = px;
    this.startingY = py;
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
    this.color = this.colors.getRandomColor();
  }

  // --------------
  draw() {
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.lineWidth = 5;

    // GRADIENT
    let baseColor = this.color;
    const gradient = this.context.createLinearGradient(
      this.history[0].x,
      this.history[0].y,
      this.history[this.history.length - 1].x,
      this.history[this.history.length - 1].y
    );
    gradient.addColorStop(0, baseColor.replace("1.0)", "0.0)"));
    gradient.addColorStop(1, baseColor.replace("1.0)", "0.8)"));
    this.context.strokeStyle = gradient;

    this.context.beginPath();
    this.context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 1; i < this.history.length; i++) {
      this.context.lineTo(this.history[i].x, this.history[i].y);
    }
    this.context.stroke();
  }

  // --------------
  reset() {
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
    this.timer = Math.floor(Math.random() * this.maxLength * 2);
  }

  // --------------
  update() {
    this.timer--;

    if (this.timer >= 1) {
      this._updatePosition();
      this._updateColor();
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

  // --------------
  _updatePosition() {
    // locate the particle in the grid
    const x = Math.floor(this.x / this.effect.cellSize);
    const y = Math.floor(this.y / this.effect.cellSize);
    const index = y * this.effect.cols + x;

    const forceVector = this.effect.flowField[index];

    if (forceVector) {
      const vector = { x: forceVector.x, y: forceVector.y };

      // normalize
      const mag = Math.hypot(vector.x, vector.y);
      // store the magnitude for potential use in draw() (dynamic line width)
      this.currentForceMag = mag;

      if (mag > 0) {
        vector.x /= mag;
        vector.y /= mag;
      }

      // scale
      const strength = this.effect.flowStrength ?? 1.0;
      vector.x *= strength;
      vector.y *= strength;

      // clamp
      const maxStrength = this.effect.maxStrength ?? 2.0;
      const newMag = Math.hypot(vector.x, vector.y);

      if (newMag > maxStrength) {
        vector.x = (vector.x / newMag) * maxStrength;
        vector.y = (vector.y / newMag) * maxStrength;
      }

      // apply to particle position
      this.x += vector.x * this.speed;
      this.y += vector.y * this.speed;
    }
  }

  // ------------
  _updateColor() {
    for (const curlPoint of this.effect.curlPoints) {
      const curlPointX = curlPoint.x * this.effect.width;
      const curlPointY = curlPoint.y * this.effect.height;
      const distance = Math.hypot(this.x - curlPointX, this.y - curlPointY);

      // check if the particle is within the radius of this curl point
      if (distance <= curlPoint.radius && curlPoint.isStar) {
        const innerRadius = curlPoint.innerRadius;
        // set inner and outer color
        let [coreR, coreG, coreB] = [241, 172, 33]; // Yellow Core
        let [edgeR, edgeG, edgeB] = [81, 173, 224]; // Yellow/White Edge

        if (distance <= innerRadius) {
          // inner Core - solid color
          this.color = `rgba(${coreR}, ${coreG}, ${coreB}, 1.0)`;
        } else {
          // inner to outer radius - blended zone (interpolation)
          const t =
            1 - (distance - innerRadius) / (curlPoint.radius - innerRadius);

          const r = edgeR + (coreR - edgeR) * t;
          const g = edgeG + (coreG - edgeG) * t;
          const b = edgeB + (coreB - edgeB) * t;

          this.color = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
            b
          )}, 1.0)`;
        }
        break;
      }
    }
  }
}
