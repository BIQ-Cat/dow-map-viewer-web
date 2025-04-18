const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');

const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;
let frames = 0;

let msPrev = performance.now();

let keys = new Set()

document.body.addEventListener("keydown", (ev) => { keys.add(ev.key); }, false);
document.body.addEventListener("keyup", (ev) => { keys.delete(ev.key); }, false);

setScreen(canvas.width, canvas.height);


function renderMap() {
  keys.forEach((key) => { moveCamera(key); });
  ctx.putImageData(getPixels(), 0, 0);
}


function gameLoop() {
  requestAnimationFrame(gameLoop);

  const msNow = performance.now();
  const msPassed = msNow - msPrev;

  if (msPassed < MS_PER_FRAME) return;

  renderMap();
  
  const excessTime = msPassed % MS_PER_FRAME;
  msPrev = msNow - excessTime;

  frames++
}

setInterval(() => { 
  document.getElementById("fps").textContent = `FPS: ${frames}`;
  frames = 0;
}, 1000)
