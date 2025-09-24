export default class VectorField {
  waveAmplitude = 0.09; // how tall the waves are
  waveFrequency = 0.01; // how frequent the waves are (smaller = smoother)

  constructor(effect, x, y) {
    this.effect = effect;
    this.x = x;
    this.y = y;
  }

  calculateVector() {
    const { cellSize, width, height, curlPoints, flowStrength } = this.effect;

    // pixel coords of the grid cell's center
    const cellScreenX = this.x * cellSize + cellSize / 2;
    const cellScreenY = this.y * cellSize + cellSize / 2;

    let summedCurlVector = { x: 0, y: 0 };

    for (const curlPoint of curlPoints) {
      // 1. calcylate distance between curl center & current grid cell's center
      const curlPointX = curlPoint.x * width;
      const curlPointY = curlPoint.y * height;

      const distance = Math.hypot(
        cellScreenX - curlPointX,
        cellScreenY - curlPointY
      );

      // 2. calculate falloffFactor
      let falloffFactor = 0;
      if (distance < curlPoint.innerRadius) {
        // within inner radius
        falloffFactor = 1;
      } else if (distance < curlPoint.radius) {
        // between inner radius and radius
        const normalizedDistance =
          (distance - curlPoint.innerRadius) /
          (curlPoint.radius - curlPoint.innerRadius);
        falloffFactor = Math.pow(
          1 - normalizedDistance,
          curlPoint.falloffExponent
        );
      }

      // 3. calculate curlVector
      if (falloffFactor > 0) {
        // if affected by the curl
        const cellCurlX = cellScreenX - curlPointX;
        const cellCurlY = cellScreenY - curlPointY;

        const curlVector = this.vectorField(
          cellCurlX,
          cellCurlY,
          curlPoint.rotateClockwise
        );

        // scale curlvector by the strenght and falloffFactor
        summedCurlVector.x +=
          curlVector.x * curlPoint.curlScale * falloffFactor;
        summedCurlVector.y +=
          curlVector.y * curlPoint.curlScale * falloffFactor;
      }
    }

    // add base - wavy left to right
    const baseVector = {
      x: flowStrength,
      y: -Math.sin(cellScreenX * this.waveFrequency) * this.waveAmplitude,
    };

    return {
      x: baseVector.x + summedCurlVector.x,
      y: baseVector.y + summedCurlVector.y,
    };
  }

  vectorField(x, y, rotateClockwise) {
    return rotateClockwise ? { x: y, y: -x } : { x: -y, y: x };
  }
}
