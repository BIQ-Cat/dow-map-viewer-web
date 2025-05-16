import { runGame, stopGame, canvas, ctx } from "./play.js";

(function() {
  const bufferSize = canvas.width * canvas.height * 4;
  const canvasImageData = ctx.createImageData(canvas.width, canvas.height);

  const preload = new Image();
  preload.src = "/static/img/default.jpg";
  preload.addEventListener("load", () => {
    preload.sizes = ""
    ctx.drawImage(preload, 0, 0, canvas.width, canvas.height); 
  })

  const go = new Go();

  WebAssembly.instantiateStreaming(fetch("/static/wasm/raycasting.wasm"), go.importObject).then((result) => {
    go.run(result.instance);

    const exports = result.instance.exports;

    const buffer = exports.memory.buffer;
    const pixelPoiner = exports.getMemoryBufferPointer();

    document.querySelectorAll("aside .map button").forEach((el) => {
      el.addEventListener("click", () => {
        stopGame();
        ctx.drawImage(preload, 0, 0, canvas.width, canvas.height);

        const mapName = el.dataset.map;
        fetch(`/map/${mapName}`)
          .then((response) => response.text())
          .then((gameMap) => {
            console.log(gameMap);
            loadGameMap(gameMap);
            exports.setScreen(canvas.width, canvas.height);

            runGame(() => {
              exports.getPixels();

              canvasImageData.data.set(new Uint8ClampedArray(exports.memory.buffer, pixelPoiner, bufferSize));

              ctx.clearRect(0, 0, canvas.width, canvas.height)
              ctx.putImageData(canvasImageData, 0, 0);
            });
          })
          .catch((err) => console.log(err));
      }, false);
  })
  });

}())
