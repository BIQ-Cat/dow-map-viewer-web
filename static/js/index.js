import { GameLoop } from "./gameLoop.js"
import { canvas, ctx, joystickContainer, heightController, fps, settingsController, toggleSettingsButton } from "./elements.js";
import { setupSettingsButtons, showPassable } from "./settings.js";
import KeyboardMovement from "./keyboard.js";
import TouchMovement from "./touch.js";
import { Preload } from "./canvas.js";
import { removeLoader } from "./fadeOut.js";

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}


function resize(setScreen, preload) {
  const viewport_width = window.innerWidth || document.documentElement.clientWidth;
  const viewport_height = window.innerHeight || document.documentElement.clientHeight;

  const canvas_width = (viewport_width < 1000) ? viewport_width : viewport_width * 0.55
  const canvas_height = (viewport_height < 600) ? viewport_height : viewport_height * 0.5

  if (viewport_width < 1000) {
    document.getElementById('map-menu').style.display = 'inline-block'
  } else {
    document.getElementById('map-menu').style.display = 'none'
    document.querySelector('aside').hidden = false
  }

  if (viewport_width < 490) {
    document.querySelector('header h1').textContent = 'DMV'
  } else {
    document.querySelector('header h1').textContent = 'DoW Map Viewer'
  }

  canvas.width = canvas_width
  canvas.height = canvas_height

  setScreen(canvas_width, canvas_height);

  preload.render()
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
  setupSettingsButtons();


  resize(exports.setScreen, preload)
  window.addEventListener('resize', () => resize(exports.setScreen, preload))


  document.getElementById('map-menu').onclick = () => {
    const panel = document.querySelector('aside')
    panel.hidden = !panel.hidden
  }


  joystickContainer.hidden = true;
  heightController.hidden = true;
  toggleSettingsButton.hidden = true;

  let movement = new KeyboardMovement();

  if (isTouchDevice()) {
    settingsController.hidden = true;
    toggleSettingsButton.hidden = false;
    movement = new TouchMovement();
  }

  movement.enable();

  const pixelPoiner = exports.getMemoryBufferPointer();

  GameLoop.onFrame = () => {
    exports.moveCamera(movement.moveX, movement.moveY, movement.moveAngle, movement.movePitch, movement.moveHeight)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    exports.loadPixels(showPassable);

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
