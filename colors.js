export default class Colors {
  colors = {
    blue: [
      "rgba(23, 31, 52, 1.0)", // #171f34ff
      "rgba(7, 9, 115, 1.0)", // #070973
      "rgba(29, 54, 110, 1.0)", // #1d366e
      "rgba(119, 148, 204, 1.0)", // #7794cc
      /* "rgba(81, 173, 224, 1.0)", // #51ade0 */
      "rgba(50, 67, 119, 1.0)", // #324377
    ],
    yellow: [
      "rgba(250, 145, 0, 1.0)", // #fa9100
      "rgba(241, 172, 33, 1.0)", // #f1ac21
      "rgba(236, 204, 44, 1.0)", // #eccc2c
      "rgba(246, 247, 177, 1.0)", // #f6f7b1
    ],
    highlight: [
      "rgba(82, 135, 131, 1.0)", // #528783
      "rgba(122, 201, 224, 1.0)", // #7ac9e0
      "rgba(236, 204, 44, 1.0)", // #f6f7b1
      "rgba(255, 255, 255, 1.0)", // White
      /* "rgba(0, 0, 0, 1.0)", */ // Black
      "rgba(191, 253, 200, 1.0)", // #bffdc8
      "rgba(73, 28, 152, 1.0)", // #491c98
    ],
  };

  getRandomColor() {
    const roll = Math.random();
    if (roll < 0.9) return this.pickRandom(this.colors.blue);
    return this.pickRandom(this.colors.highlight);
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  get yellowCore() {
    return this.colors.yellow[1];
  }

  get blueCore() {
    return this.colors.blue[3];
  }
}
