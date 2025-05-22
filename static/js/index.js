import { runGame, stopGame, canvas, ctx, isRunning } from "./play.js";

const joystickHandle = document.querySelector('.joystick-handle')
const joystickContainer = document.querySelector('.joystick')

let swipeStartX = 0
let swipeStartY = 0

let swipeTouch = 0
let joystickTouch = 0

let numberOfTouches = 0

let moveX = 0
let moveY = 0
let moveAngle = 0
let movePitch = 0
let moveUp = false
let moveDown = false


function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}


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


function calculateAngle(centerX, centerY, pointX, pointY) {
  const deltaX = pointX - centerX;
  const deltaY = pointY - centerY;

  const angleInRadians = Math.atan2(deltaY, deltaX);

  return angleInRadians;
}

function deg2rad(angle) {
  let angleInDegrees = (angle * 180) / Math.PI + 90;
  if (angleInDegrees < 0) 
    angleInDegrees += 360

  return angleInDegrees
}


function calculateCircleData(clientX, clientY) {
  const {x, y, width, height} = joystickContainer.getBoundingClientRect()

  const centerX = x + width / 2
  const centerY = y + height / 2
  let distance = Math.sqrt(
    Math.pow(clientX - centerX, 2) +
    Math.pow(clientY - centerY, 2)
  )

  distance = Math.min(Math.max(distance, 0), height / 2)

  const angle = calculateAngle(centerX, centerY, clientX, clientY)

  return {
    angle: deg2rad(angle),
    distance,
    percX: -distance * Math.sin(angle) / (width / 4),
    percY: -distance * Math.cos(angle) / (height / 2)
  }
}

function onSwipeStart(ev) {
  swipeTouch = numberOfTouches;
  numberOfTouches++;

  const { clientX, clientY } = ev.touches[swipeTouch]
  swipeStartX = clientX;
  swipeStartY = clientY;

  document.addEventListener("touchmove", onSwipeMove);
  document.addEventListener("touchend", onSwipeEnd);
}

function onSwipeMove(ev) {
  const { clientX, clientY } = ev.touches[swipeTouch];

  const deltaX = clientX - swipeStartX;
  const deltaY = clientY - swipeStartY;

  moveAngle = deltaX / 3
  movePitch = deltaY / 3

  swipeStartX = clientX
  swipeStartY = clientY
}

function onSwipeEnd() {
  numberOfTouches--;

  document.removeEventListener("touchmove", onSwipeMove)
  document.removeEventListener("touchend", onSwipeEnd)

  moveAngle = 0;
  movePitch = 0;
}

function onJoystickStart(ev) {
  joystickTouch = numberOfTouches;
  numberOfTouches++;

  onJoystickMove(ev);
  document.addEventListener("touchmove", onJoystickMove);
  document.addEventListener("touchend", onJoystickEnd);
}

function onJoystickMove(ev) {

  const { angle, distance, percX, percY } = calculateCircleData(
    ev.touches[joystickTouch].clientX,
    ev.touches[joystickTouch].clientY
  )

  joystickHandle.style.transform = `translateY(${-distance}px)`;
  joystickHandle.parentElement.style.transform = `rotate(${angle}deg)`;

  moveX = percX;
  moveY = percY;
}

function onJoystickEnd() {
  numberOfTouches--;

  document.removeEventListener("touchmove", onJoystickMove);
  document.removeEventListener("touchend", onJoystickEnd);

  joystickHandle.style.transform = "";
  joystickHandle.parentElement.style.transform = "";

  moveX = 0;
  moveY = 0;
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


    joystickContainer.hidden = !isTouchDevice()
    document.querySelector(".height-controller").hidden = !isTouchDevice()

    if (isTouchDevice()) {
      joystickContainer.addEventListener("touchstart", onJoystickStart)
      canvas.addEventListener("touchstart", onSwipeStart)
      
      const upBtn = document.getElementById("up")
      const downBtn = document.getElementById("down")

      upBtn.addEventListener("touchstart", () => {
        upBtn.style.opacity = 1;
        moveUp = true;
      })
      upBtn.addEventListener("touchend", () => {
        upBtn.style.opacity = 0.4;
        moveUp = false;
      })

      downBtn.addEventListener("touchstart", () => {
        downBtn.style.opacity = 1;
        moveDown = true;
      })
      downBtn.addEventListener("touchend", () => {
        downBtn.style.opacity = 0.4;
        moveDown = false;
      })
    }

    const renderMap = () => {
      exports.moveCameraByPerc(moveX, moveY, moveAngle, movePitch, moveUp, moveDown)

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
