import Movement from "./movement.js";

export default class KeyboardMovement extends Movement {
  
  enable() {
    document.body.addEventListener("keydown", this.#onKeyDown)
    document.body.addEventListener("keyup", this.#onKeyUp)
  }

  reset() {
    document.body.removeEventListener("keydown", this.#onKeyDown)
    document.body.removeEventListener("keyup", this.#onKeyUp)
    super.reset()
  }

  #onKeyDown(ev) { this.#changeKeys(ev.key.toLowerCase(), 1) }
  #onKeyUp(ev) { this.#changeKeys(ev.key.toLowerCase(), 0) }

  #changeKeys(key, value) {
    switch(key) {
        case "shift":
            this.moveHeight = value;
            break;
        case " ":
            this.moveHeight = -value;
            break;
        case "w":
            this.moveX = value;
        case "s":
            this.moveX = -value;
        case "a":
            this.moveY = -value;
        case "d":
            this.moveY = value;
        case "arrowleft":
            this.moveAngle = -value;
        case "arrowright":
            this.moveAngle = value;
        case "arrowup":
            this.movePitch = value;
        case "arrowdown":
            this.movePitch = -value;
    }
}
}

