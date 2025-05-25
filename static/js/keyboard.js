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

  onKeyDown = (ev) => { this.#changeKeys(ev.code.toLowerCase(), 1) }
  onKeyUp = (ev) => { this.#changeKeys(ev.code.toLowerCase(), 0) }

  #changeKeys(key, value) {
    switch(key) {
        case "shiftleft":
            this.moveHeight = -value;
            break;
        case "space":
            this.moveHeight = value;
            break;
        case "keyw":
            this.moveX = value;
            break;
        case "keys":
            this.moveX = -value;
            break;
        case "keya":
            this.moveY = value;
            break;
        case "keyd":
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

