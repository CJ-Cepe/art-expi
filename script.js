import FlowFieldEffect from "./flow-field-effect.js";

window.onload = async function () {
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const artGenerator = new FlowFieldEffect(context);
  artGenerator.init();
  artGenerator.render();
};
