import FlowFieldEffect from "./effect.js";

window.onload = async function () {
  const canvas = document.querySelector("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const artGenerator = new FlowFieldEffect(canvas.getContext("2d"));
  await artGenerator.init("./shapes.jpg");
  artGenerator.render();
  // TO DO: add catch
};

// ---------------------------------------------------
