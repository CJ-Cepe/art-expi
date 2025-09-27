export default class Colors {
  colors = {
    base: [
      //"rgba(23, 31, 52, 1.0)", // #171f34ff
      "rgba(7, 9, 115, 1.0)", // #070973
      "rgba(18, 63, 119, 1.0)", // #123F77
      "rgba(24, 47, 92, 1.0)", // #182F5C
      "rgba(40, 89, 156, 1.0)", // #28599C
      "rgba(32, 72, 156, 1.0)", // #20489C
      "rgba(21, 52, 121, 1.0)", // #153479
    ],
    midtones: [
      "rgba(30, 64, 88, 1.0)", // #1E4058
      "rgba(77, 115, 143, 1.0)", // #4D738F
      "rgba(66, 122, 161, 1.0)", // #427AA1
      "rgba(72, 136, 200, 1.0)", // #4888C8
    ],

    highlights: [
      "rgba(236, 204, 44, 1.0)", // #f6f7b1
      "rgba(191, 253, 200, 1.0)", // #bffdc8
      "rgba(98, 23, 228, 1.0)", // #6217e4ff
      // "rgba(112, 177, 201, 1.0)", // #70B1C9
    ],
    windCurl: [
      "rgba(255, 255, 255, 1.0)", // #ffffff
      "rgba(81, 173, 224, 1.0)", // #51ade0,
      "rgba(122, 201, 224, 1.0)", // #7ac9e0
      "rgba(119, 148, 204, 1.0)", // #7794cc
    ],
    starCurl: [
      "rgba(250, 145, 0, 1.0)", // #fa9100
      "rgba(246, 247, 177, 1.0)", // #f6f7b1ff
      //"rgba(241, 172, 33, 1.0)", // #f1ac21
    ],
  };

  getRandomColor() {
    const roll = Math.random();
    if (roll < 0.7) return this._pickRandom(this.colors.base);
    if (roll < 0.9) return this._pickRandom(this.colors.midtones);
    return this._pickRandom(this.colors.highlights);
  }

  get windCurl() {
    return this._pickRandom(this.colors.windCurl);
  }

  get starCurl() {
    const inner = this._toRgbArray(this.colors.starCurl[0]);
    const outer = this._toRgbArray(this.colors.starCurl[1]);
    return { inner, outer };
  }

  _pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _toRgbArray(rgbString) {
    const rgba = rgbString;
    const match = rgba.match(/\d+/g);
    const rgbArray = match.slice(0, 3).map(Number);
    return rgbArray;
  }
}
