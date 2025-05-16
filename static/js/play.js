export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext('2d');

const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;
let frames = 0;

let msPrev = performance.now();

let keys = new Set();


let gameStopped = true

function gameLoop(renderMap) {
  if (!gameStopped)
    requestAnimationFrame(() => gameLoop(renderMap));

  const msNow = performance.now();
  const msPassed = msNow - msPrev;

  if (msPassed < MS_PER_FRAME) return;

  keys.forEach((el) => moveCamera(el))
  renderMap();
  
  const excessTime = msPassed % MS_PER_FRAME;
  msPrev = msNow - excessTime;

  frames++
}

const setFPS = () => { 
  document.getElementById("fps").textContent = `FPS: ${frames}`;
  frames = 0;
}

const addKey = (ev) => { keys.add(ev.key) }
const delKey = (ev) => { keys.delete(ev.key) }

let interval = -1

export function runGame(renderMap) {
  gameStopped = false;

  document.body.addEventListener("keydown", addKey, false);
  document.body.addEventListener("keyup", delKey, false);

  //interval = setInterval(setFPS, 1000);

  gameLoop(renderMap);
}

export function isRunning() {
  return !gameStopped
}

export function stopGame() {
  gameStopped = true;

  document.body.removeEventListener("keydown", addKey, false)
  document.body.removeEventListener("keyup", delKey, false);

  keys.clear()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  //clearInterval(interval)
}
