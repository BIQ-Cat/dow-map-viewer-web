const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;
let frames = 0;

let msPrev = performance.now();

let interval = -1

export const GameLoop = {
  isRunning: false,
  enableFPS: false,
  onFrame: () => {},
  renderFPS: (frames) => {},

  gameLoopWrapper:  () => {
    if (GameLoop.isRunning)
      requestAnimationFrame(GameLoop.gameLoopWrapper);

    const msNow = performance.now();
    const msPassed = msNow - msPrev;

    if (msPassed < MS_PER_FRAME) return;

    GameLoop.onFrame();
    
    const excessTime = msPassed % MS_PER_FRAME;
    msPrev = msNow - excessTime;

    frames++
  },

  start: () => {
    GameLoop.isRunning = true;

    if (GameLoop.enableFPS)
      interval = setInterval(() => {
        GameLoop.renderFPS(frames);
        frames = 0;
      }, 1000);
    
    gameLoopWrapper()
  },

  stop: () => {
    GameLoop.isRunning = false;

    if (GameLoop.enableFPS)
      clearInterval(interval);
  }
}