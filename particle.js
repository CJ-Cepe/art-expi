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
      // locate where the particle is in the grid cells
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;

      // get the vector from the flow field
      const forceVector = this.effect.flowField[index];

      if (forceVector) {
        // cause particles gets squished & stretch when rotating curls
        const vector = { x: forceVector.x, y: forceVector.y };

        // normalize
        const mag = Math.hypot(vector.x, vector.y);
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

        // apply to particle
        this.x += vector.x * this.speed;
        this.y += vector.y * this.speed;
      }

      // push new x and y
      this.history.push({ x: this.x, y: this.y });

      if (this.history.length > this.maxLength) {
        this.history.shift();
      }

      // SETTING CURL COLOR -------------
      for (const curlPoint of this.effect.curlPoints) {
        // compute distance
        const curlPointX = curlPoint.x * this.effect.width;
        const curlPointY = curlPoint.y * this.effect.height;
        const distance = Math.hypot(this.x - curlPointX, this.y - curlPointY);

        // 1. for curls that are star
        if (distance <= curlPoint.innerRadius && curlPoint.isStar) {
          this.color = this.colors.yellowCore; // inner core
          break;
        } else if (distance <= curlPoint.radius && curlPoint.isStar) {
          //blended color calc
          if (distance <= curlPoint.innerRadius) {
            this.color = this.colors.yellowCore; // inner core
            break;
          } else if (distance <= curlPoint.radius) {
            const t =
              1 -
              (distance - curlPoint.innerRadius) /
                (curlPoint.radius - curlPoint.innerRadius);
            // interpolate between yellow (center) and blue (edge)
            const r = 72 + (255 - 72) * t; // 72→255
            const g = 136 + (238 - 136) * t; // 136→238
            const b = 200 + (80 - 200) * t; // 200→80
            this.color = `rgba(${r}, ${g}, ${b}, 1.0)`;
          } else {
            this.color = "rgba(18, 63, 119, 1.0)"; // Dark blue
          }
          break;
        }

        // 2. for curls that are not start -> wind
        if (distance <= curlPoint.innerRadius && !curlPoint.isStar) {
          this.color = this.colors.blueCore; // inner core
          break;
        } else if (distance <= curlPoint.radius && !curlPoint.isStar) {
          //blended color calc
          if (distance <= curlPoint.innerRadius) {
            this.color = this.colors.blueCore; // inner core
            break;
          } else if (distance <= curlPoint.radius) {
            const t =
              1 -
              (distance - curlPoint.innerRadius) /
                (curlPoint.radius - curlPoint.innerRadius);
            // interpolate between yellow (center) and blue (edge)
            const r = 72 + (255 - 72) * t; // 72→255
            const g = 136 + (238 - 136) * t; // 136→238
            const b = 200 + (80 - 200) * t; // 200→80
            this.color = `rgba(${r}, ${g}, ${b}, 1.0)`;
          } else {
            this.color = "rgba(18, 63, 119, 1.0)"; // Dark blue
          }
          break;
        }
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }
}
