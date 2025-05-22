export const KeyboardMovement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    angleLeft: false,
    angleRight: false,
    angleUp: false,
    angleDown: false,

    enable: () => {
        document.body.addEventListener("keydown", (ev) => changeKeys(ev.key.toLowerCase(), true))
        document.body.addEventListener("keyup", (ev) => changeKeys(ev.key.toLowerCase(), false))
    },
}

const changeKeys = (key, value) => {
    switch(key) {
        case "shift":
            KeyboardMovement.up = value;
            break;
        case " ":
            KeyboardMovement.down = value;
            break;
        case "w":
            KeyboardMovement.forward = value;
        case "s":
            KeyboardMovement.backward = value;
        case "a":
            KeyboardMovement.left = value;
        case "d":
            KeyboardMovement.right = value;
        case "arrowleft":
            KeyboardMovement.angleLeft = value;
        case "arrowright":
            KeyboardMovement.angleRight = value;
        case "arrowup":
            KeyboardMovement.angleUp = value;
        case "arrowdown":
            KeyboardMovement.angleDown = value;
    }
}