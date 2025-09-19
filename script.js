import Effect from "./effect";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const effect = new Effect(ctx);

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
