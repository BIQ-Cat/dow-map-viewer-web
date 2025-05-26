import { GameLoop } from "./gameLoop.js"
import { canvas, ctx, fps } from "./elements.js";
import { setupMovement, setupSettingsButtons, isPassable, getMovement } from "./settings.js";
import { Preload } from "./canvas.js";
import { removeLoader } from "./fadeOut.js";
import { resize } from "./adaptive.js";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/js/sw.js')
    .then((reg) => {
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker version available.');
          }
        };  
      };
    })
    .catch((err) => console.log(err));
}


const go = new Go();
WebAssembly.instantiateStreaming(fetch("/static/wasm/raycasting.wasm"), go.importObject).then((result) => {
  GameLoop.renderFPS = (frames) => {
    fps.textContent = `FPS: ${frames}`;
  }
  GameLoop.enableFPS = true;

  
  go.run(result.instance);

  const exports = result.instance.exports;

  const preload = new Preload("/static/img/default.jpg")

  const searchMap = document.getElementById("search_map")
  searchMap.value = ""
  searchMap.oninput = () => {
    document.querySelectorAll("aside .map").forEach((el) => {
      const name = el.querySelector("h3").textContent;

      el.hidden = searchMap.value && !name.toLowerCase().includes(searchMap.value.toLowerCase())
    })
  }

  resize(exports.setScreen, preload)
  window.addEventListener('resize', () => resize(exports.setScreen, preload))


  document.getElementById('map-menu').onclick = () => {
    const panel = document.querySelector('aside')
    panel.hidden = !panel.hidden
  }

  setupMovement();
  setupSettingsButtons();

  const pixelPoiner = exports.getMemoryBufferPointer();

  GameLoop.onFrame = () => {
    const movement = getMovement();
    // console.log(movement.moveX, movement.moveY, movement.moveAngle, movement.movePitch, movement.moveHeight)
    exports.moveCamera(movement.moveX, movement.moveY, movement.moveAngle, movement.movePitch, movement.moveHeight)

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    exports.loadPixels(isPassable());

    const canvasImageData = ctx.createImageData(canvas.width, canvas.height)
    canvasImageData.data.set(new Uint8ClampedArray(exports.memory.buffer, pixelPoiner, canvas.width * canvas.height * 4));

    ctx.putImageData(canvasImageData, 0, 0);
  }

  document.querySelectorAll("aside .map button").forEach((el) => {
    el.addEventListener("click", () => {
      GameLoop.stop();

      const mapName = el.dataset.map;
      const id = el.dataset.uid;
      fetch(`/map/${mapName}?id=${id}`)
        .then((response) => response.text())
        .then((gameMap) => {
          setGameMap(gameMap);

          GameLoop.start()
        })
        .catch((err) => console.log(err));
    }, false);
  })

  removeLoader();
});
