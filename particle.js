import Colors from "./colors.js";

export default class Particle {
  maxLength = Math.floor(Math.random() * 21) + 10;
  minTime = 20;
  maxTime = 80;
  timer =
    Math.floor(Math.random() * (this.maxTime - this.minTime + 1)) +
    this.minTime;
  particleWidth = Math.floor(Math.random() * 4) + 2;
  speed = 4;

  // colors
  palette = new Colors();
  originalColor = this.palette.getRandomColor();
  currentColor = this.originalColor;
  changeCounter = 1;

  constructor(effect, px, py) {
    this.effect = effect;
    this.context = effect.context;
    this.startingX = px;
    this.startingY = py;
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
  }

  // --------------
  draw(ctx = this.context) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = this.particleWidth;

    let baseColor = this.currentColor;
    if (this.history.length < 2) return;
    ctx.strokeStyle = baseColor;
    ctx.beginPath();

    ctx.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 1; i < this.history.length; i++) {
      ctx.lineTo(this.history[i].x, this.history[i].y);
    }
    ctx.stroke();
  }

  // --------------
  reset() {
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
    this.particleWidth = Math.floor(Math.random() * 5) + 2;
    this.timer =
      Math.floor(Math.random() * (this.maxTime - this.minTime + 1)) +
      this.minTime;
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

  // ------------ update color when under influence of a curl
  _updateColor() {
    let foundCurl = false;

    for (const curlPoint of this.effect.curlPoints) {
      const curlPointX = curlPoint.x * this.effect.width;
      const curlPointY = curlPoint.y * this.effect.height;
      const distance = Math.hypot(this.x - curlPointX, this.y - curlPointY);

      if (distance <= curlPoint.radius) {
        // Inside a curl
        if (curlPoint.isStar) {
          let [coreR, coreG, coreB] = this.palette.starCurl.inner; // yellow core
          let [edgeR, edgeG, edgeB] = this.palette.starCurl.outer; // yellow/white edge

          // if within innerRadius or inner to outer radius
          if (distance <= curlPoint.innerRadius) {
            this.currentColor = `rgba(${coreR}, ${coreG}, ${coreB}, 1.0)`;
          } else {
            const t =
              1 -
              (distance - curlPoint.innerRadius) /
                (curlPoint.radius - curlPoint.innerRadius);

            const r = edgeR + (coreR - edgeR) * t;
            const g = edgeG + (coreG - edgeG) * t;
            const b = edgeB + (coreB - edgeB) * t;

            this.currentColor = `rgba(${Math.round(r)}, ${Math.round(
              g
            )}, ${Math.round(b)}, 1.0)`;
          }
        } else {
          if (this.changeCounter && Math.random() < 0.7) {
            this.currentColor = this.palette.windCurl;
          }
          this.changeCounter = 0;
        }

        foundCurl = true;
        break; // stop at the first curl that contains the particle
      }
    }

    if (!foundCurl) {
      // default color when not inside any curl
      this.currentColor = this.originalColor;
      this.changeCounter = 1;
    }
  }
}
