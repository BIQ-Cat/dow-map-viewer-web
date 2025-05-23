import Movement from "./movement.js";

export default class KeyboardMovement extends Movement {
  
  enable() {
    document.body.addEventListener("keydown", this.onKeyDown)
    document.body.addEventListener("keyup", this.onKeyUp)
  }

  reset() {
    document.body.removeEventListener("keydown", this.onKeyDown)
    document.body.removeEventListener("keyup", this.onKeyUp)
    super.reset()
  }

  onKeyDown = (ev) => { this.#changeKeys(ev.key.toLowerCase(), 1) }
  onKeyUp = (ev) => { this.#changeKeys(ev.key.toLowerCase(), 0) }

  #changeKeys(key, value) {
    switch(key) {
        case "shift":
            this.moveHeight = -value;
            break;
        case " ":
            this.moveHeight = value;
            break;
        case "w":
            this.moveX = value;
            break;
        case "s":
            this.moveX = -value;
            break;
        case "a":
            this.moveY = value;
            break;
        case "d":
            this.moveY = -value;
            break;
        case "arrowleft":
            this.moveAngle = -value;
            break;
        case "arrowright":
            this.moveAngle = value;
            break;
        case "arrowup":
            this.movePitch = value;
            break;
        case "arrowdown":
            this.movePitch = -value;
            break;
    }
}
}

