import { runGame, stopGame, canvas, ctx, isRunning } from "./play.js";

(function() {
  canvas.width = innerWidth * 0.56
  canvas.height = innerHeight * 0.5

  const canvasImageData = ctx.createImageData(canvas.width, canvas.height);

  let loaded = false
  const preload = new Image();
  preload.src = "/static/img/default.jpg";
  preload.addEventListener("load", () => {
    if (loaded) return false

    preload.sizes = ""
    ctx.drawImage(preload, 0, 0, canvas.width, canvas.height);
    loaded = true
  })

  const go = new Go();

  WebAssembly.instantiateStreaming(fetch("/static/wasm/raycasting.wasm"), go.importObject).then((result) => {
    go.run(result.instance);

    const exports = result.instance.exports;

    const renderMap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      exports.getPixels();

      canvasImageData.data.set(new Uint8ClampedArray(exports.memory.buffer, pixelPoiner, canvas.width * canvas.height * 4));

      ctx.putImageData(canvasImageData, 0, 0);
    }

    exports.setScreen(canvas.width, canvas.height)

    const pixelPoiner = exports.getMemoryBufferPointer();

    document.querySelectorAll("aside .map button").forEach((el) => {
      el.addEventListener("click", () => {
        stopGame();

        const mapName = el.dataset.map;
        fetch(`/map/${mapName}`)
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
