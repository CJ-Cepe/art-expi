export default class Particle {
  maxLength = Math.floor(Math.random() * (30 - 10 + 1)) + 50;
  maxTimer = Math.floor(Math.random() * this.maxLength * 2);
  timer = this.maxTimer;
  particleWidth = 1;
  vx = 5;
  vy = 5;

  constructor(effect, px, py) {
    this.effect = effect;
    this.context = effect.context;
    this.startingX = px;
    this.startingY = py;
    this.x = this.startingX;
    this.y = this.startingY;
    this.history = [{ x: this.x, y: this.y }];
    this.color = getRandomColor();
  }

  // --------------
  draw() {
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.lineWidth = 4;

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
        this.x += vector.x * this.vx;
        this.y += vector.y * this.vy;
      }

      // push new x and y
      this.history.push({ x: this.x, y: this.y });

      if (this.history.length > this.maxLength) {
        this.history.shift();
      }

      // SET COLOR
      for (const curlPoint of this.effect.curlPoints) {
        const curlPointX = curlPoint.x * this.effect.width;
        const curlPointY = curlPoint.y * this.effect.height;

        const distance = Math.hypot(this.x - curlPointX, this.y - curlPointY);

        // If within the inner radius, set to a bright color
        if (distance <= curlPoint.innerRadius) {
          this.color = "rgba(255, 238, 80, 1.0)";
          break;
        } else if (distance <= curlPoint.radius) {
          //blended color calc
          if (distance <= curlPoint.innerRadius) {
            this.color = "rgba(255, 238, 80, 1.0)"; // Bright yellow
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
            //this.color = "rgba(18, 63, 119, 1.0)"; // Dark blue
          }
          break;
        } else {
          //this.color = "rgba(18, 63, 119, 1.0)";
        }
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
    this.timer = this.maxTimer;
  }
}

function getRandomColor() {
  const colors = {
    blueColors: [
      "rgba(23, 31, 52, 1.0)", // #171f34ff
      "rgba(7, 9, 115, 1.0)", // #070973
      "rgba(29, 54, 110, 1.0)", // #1d366e
      "rgba(50, 67, 119, 1.0)", // #324377
      "rgba(81, 173, 224, 1.0)", // #51ade0
      "rgba(122, 201, 224, 1.0)", // #7ac9e0
      "rgba(119, 148, 204, 1.0)", // #7794cc
    ],
    yellowColors: [
      "rgba(241, 172, 33, 1.0)", // #f1ac21
      "rgba(236, 204, 44, 1.0)", // #eccc2c
      "rgba(246, 247, 177, 1.0)", // #f6f7b1
    ],
    otherColors: [
      "rgba(250, 145, 0, 1.0)", // #fa9100
      "rgba(82, 135, 131, 1.0)", // Green-bronze
      "rgba(255, 255, 255, 1.0)", // White
      "rgba(0, 0, 0, 1.0)", // Black
    ],
  };

  const roll = Math.random();
  if (roll < 0.5) return pickRandom(colors.blueColors);
  if (roll < 0.8) return pickRandom(colors.otherColors);
  return pickRandom(colors.yellowColors);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
