const FUNCTION_COUNT = 3;
const COEFFICIENT_COUNT = 6;
const ITERATIONS_PER_FRAME = 50000;
const SCALE = 0.5;
const INTERP_START = -0.25;
const INTERP_END = 2;
const INTERP_STEP = 0.0000002;

let animationFrameRequestId;
let coeffs1, coeffs2;
let interp, x, y;
let canvas, context, pixels, pixelsSize;
let hWidth, hHeight, scale, intensity;

function init() {
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  scaleCanvas(canvas, context);
  scale = SCALE * (canvas.width + canvas.height) / 2;
  intensity = Math.max(Math.round(scale * scale / 100000), 1);

  // create a pixel manipulation buffer
  pixels = context.createImageData(canvas.width, canvas.height);
  pixelsSize = canvas.width * canvas.height * 4;

  hWidth = Math.floor(canvas.width / 2);
  hHeight = Math.floor(canvas.height / 2);

  reset();
}

function reset() {
  window.cancelAnimationFrame(animationFrameRequestId);

  pixels.data.fill(0);

  // all IFS coefficients are between -1 and 1 to constrain the rendering size
  coeffs1 = new Array(FUNCTION_COUNT);
  coeffs2 = new Array(FUNCTION_COUNT);
  for (let func = 0; func < FUNCTION_COUNT; func++) {
    coeffs1[func] = new Array(COEFFICIENT_COUNT);
    coeffs2[func] = new Array(COEFFICIENT_COUNT);
    for (let coeff = 0; coeff < COEFFICIENT_COUNT; coeff++) {
      coeffs1[func][coeff] = Math.random() * 2 - 1;
      coeffs2[func][coeff] = Math.random() * 2 - 1;
    }
  }

  x = 0;
  y = 0;
  interp = INTERP_START;

  animationFrameRequestId = window.requestAnimationFrame(draw);
}

function calculate() {
  // this is the linear interpolation of two interated function systems
  // in each IFS, we randomly choose a function to integrate
  // each function has a formula of (newX, newY) = (ax + by + c, dx + ey + f)
  const func = Math.floor(Math.random() * FUNCTION_COUNT);
  const x1 = coeffs1[func][0] * x + coeffs1[func][1] * y + coeffs1[func][2];
  const y1 = coeffs1[func][3] * x + coeffs1[func][4] * y + coeffs1[func][5];
  const x2 = coeffs2[func][0] * x + coeffs2[func][1] * y + coeffs2[func][2];
  const y2 = coeffs2[func][3] * x + coeffs2[func][4] * y + coeffs2[func][5];

  const invInterp = 1 - interp;
  x = invInterp * x1 + interp * x2;
  y = invInterp * y1 + interp * y2;

  // convert to pixel coordinates
  const pixelX = Math.round(x * scale) + hWidth;
  const pixelY = Math.round(y * scale) + hHeight;

  // render to pixel buffer
  const pixelIndex = 4 * (pixelY * canvas.width + pixelX) + 3;
  if (pixelIndex > 0 && pixelIndex < pixelsSize)
    pixels.data[pixelIndex] += intensity;

  interp += INTERP_STEP;
}

function draw(timestamp) {
  for (let i = 0; i < ITERATIONS_PER_FRAME; i++)
    calculate();

  context.putImageData(pixels, 0, 0);

  // if we're finished rendering, save some cpu cycles
  if (interp <= INTERP_END)
    animationFrameRequestId = window.requestAnimationFrame(draw);
}

function scaleCanvas(canvas, context) {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(init);
  document.getElementById('canvas').addEventListener('click', reset);
});
