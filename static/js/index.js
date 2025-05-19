import { runGame, stopGame, canvas, ctx, isRunning } from "./play.js";

function resize(setScreen, preload, loaded) {
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

  if (!isRunning() && loaded) {
    ctx.drawImage(preload, 0, 0, canvas_width, canvas_height)
  }
}

function onJoystickStart(ev) {
  document.addEventListener("touchmove", onJoystickMove);
  document.addEventListener("touchend", onJoystickEnd);
}

function onJoystickMove(ev) {}

function onJoystickEnd() {
  document.removeEventListener("touchmove", onJoystickMove);
  document.removeEventListener("touchend", onJoystickEnd);
}

(function() {
  const go = new Go();
  WebAssembly.instantiateStreaming(fetch("/static/wasm/raycasting.wasm"), go.importObject).then((result) => {
    go.run(result.instance);

    const exports = result.instance.exports;

    let loaded = false
    const preload = new Image();
    preload.src = "/static/img/default.jpg";

    preload.addEventListener("load", () => {
      if (loaded) return false

      preload.sizes = ""
      ctx.drawImage(preload, 0, 0, canvas.width, canvas.height);
      loaded = true
    })

    const searchMap = document.getElementById("search_map")
    searchMap.value = ""
    searchMap.oninput = () => {
      document.querySelectorAll("aside .map").forEach((el) => {
        const name = el.querySelector("h3").textContent;

        el.hidden = searchMap.value && !name.toLowerCase().includes(searchMap.value.toLowerCase())
      })
    }


    resize(exports.setScreen)
    window.addEventListener('resize', () => resize(exports.setScreen, preload, loaded))


    document.getElementById('map-menu').onclick = () => {
      const panel = document.querySelector('aside')
      panel.hidden = !panel.hidden
    }
    
  
    const joystickHandle = document.querySelector('.joystick-handle')
    const joystickContainer = document.querySelector('.joystick')

    joystickContainer.addEventListener("touchstart", onJoystickStart)

    const renderMap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      exports.getPixels();

      const canvasImageData = ctx.createImageData(canvas.width, canvas.height)
      canvasImageData.data.set(new Uint8ClampedArray(exports.memory.buffer, pixelPoiner, canvas.width * canvas.height * 4));

      ctx.putImageData(canvasImageData, 0, 0);
    }


    const pixelPoiner = exports.getMemoryBufferPointer();

    document.querySelectorAll("aside .map button").forEach((el) => {
      el.addEventListener("click", () => {
        stopGame();

        const mapName = el.dataset.map;
        const id = el.dataset.uid;
        fetch(`/map/${mapName}?id=${id}`)
          .then((response) => response.text())
          .then((gameMap) => {
            loadGameMap(gameMap);

            runGame(renderMap)
          })
          .catch((err) => console.log(err));
      }, false);
  })
  });

}())
