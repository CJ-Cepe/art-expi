export default class VectorField {
  constructor(effect, x, y) {
    this.effect = effect;
    this.x = x;
    this.y = y;
  }

  calculateVector() {
    const { cellSize, width, height, curlPoints, flowStrength } = this.effect;

    const cellScreenX = this.x * cellSize + cellSize / 2;
    const cellScreenY = this.y * cellSize + cellSize / 2;

    let summedCurlVector = { x: 0, y: 0 };

    // loop through each curl point and sum their influences
    for (const curlPoint of curlPoints) {
      const curlPointX = curlPoint.x * width;
      const curlPointY = curlPoint.y * height;

      const distance = Math.hypot(
        cellScreenX - curlPointX,
        cellScreenY - curlPointY
      );

      let falloffFactor = 0;
      if (distance < curlPoint.innerRadius) {
        // full influence inside the inner radius
        falloffFactor = 1;
      } else if (distance < curlPoint.radius) {
        // exponentially fade the influence in the transition zone
        const normalizedDistance =
          (distance - curlPoint.innerRadius) /
          (curlPoint.radius - curlPoint.innerRadius);
        falloffFactor = Math.pow(
          1 - normalizedDistance,
          curlPoint.falloffExponent
        );
      }

      if (falloffFactor > 0) {
        // the vector is based on relative coordinates from the curl point
        const cellCurlX = cellScreenX - curlPointX; /* / this.cellSize; */
        const cellCurlY = cellScreenY - curlPointY; /* / this.cellSize; */

        const curlVector = this.vectorField(
          cellCurlX,
          cellCurlY,
          curlPoint.rotateClockwise
        );

        summedCurlVector.x +=
          curlVector.x * curlPoint.curlScale * falloffFactor;
        summedCurlVector.y +=
          curlVector.y * curlPoint.curlScale * falloffFactor;
      }
    }

    // get the base vector (left to right)
    const baseVector = { x: flowStrength, y: 0 };

    // final vector to be pushed in the flowfield
    return {
      x: baseVector.x + summedCurlVector.x,
      y: baseVector.y + summedCurlVector.y,
    };
  }

  vectorField(x, y, rotateClockwise) {
    return rotateClockwise ? { x: y, y: -x } : { x: -y, y: x };
  }
}
