import { canvas } from "./elements.js";

export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}


export function resize(setScreen, preload) {
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