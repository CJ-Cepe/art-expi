import FlowFieldEffect from "./flow-field-effect.js";

let artGenerator;
let resizeTimer;

function initArtGenerator(context) {
  if (artGenerator) {
    artGenerator.stop();
  }

  const canvas = context.canvas;
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  canvas.width = newWidth;
  canvas.height = newHeight;

  artGenerator = new FlowFieldEffect(context, newWidth, newHeight);

  artGenerator.init();
  artGenerator.render();
}

const handleResize = (context) => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    initArtGenerator(context);
  }, 250);
};

window.onload = async function () {
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");

  initArtGenerator(context);

  window.addEventListener("resize", () => {
    handleResize(context);
  });
};
