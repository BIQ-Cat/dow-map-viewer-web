import Movement from "./movement.js";
import { downButton, heightController, joystickContainer, joystickHandle, swipeStartElement, upButton } from "./elements.js";

export default class TouchMovement extends Movement {
  constructor() {
    super();

    this.numberOfTouches = 0;

    this.swipeTouch = 0;
    this.joystickTouch = 0;

    this.swipeStartX = 0;
    this.swipeStartY = 0;
  }

  enable() {
    joystickContainer.hidden = false;
    heightController.hidden = false;
    swipeStartElement.hidden = false;
    
    joystickContainer.addEventListener("touchstart", this.onJoystickStart);
    swipeStartElement.addEventListener("touchstart", this.onSwipeStart);

    upButton.addEventListener("touchstart", () => {
      upButton.style.opacity = 1;
      this.moveHeight += 1;
    })

    upButton.addEventListener("touchend", () => {
      upButton.style.opacity = 0.4;
      this.moveHeight -= 1;
    })


    downButton.addEventListener("touchstart", () => {
      downButton.style.opacity = 1;
      this.moveHeight -= 1;
    })

    downButton.addEventListener("touchend", () => {
      downButton.style.opacity = 0.4;
      this.moveHeight += 1;
    })
  }
  

  #calculateJoystickAngle(centerX, centerY, pointX, pointY) {
    const deltaX = pointX - centerX;
    const deltaY = pointY - centerY;

    return Math.atan2(deltaY, deltaX);
  }

  #calculateAngleCSS(angle) {
    let angleInDegrees = angle * 180 / Math.PI + 90;
    if (angleInDegrees < 0)
      angleInDegrees += 360;

    return angleInDegrees;
  }

  #calculateJoystickData(clientX, clientY) {
    const { x, y, width, height } = joystickContainer.getBoundingClientRect();

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    let distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) +
      Math.pow(clientY - centerY, 2)
    )

    distance = Math.min(Math.max(distance, 0), height / 2);

    const angle = this.#calculateJoystickAngle(centerX, centerY, clientX, clientY)

    this.moveX = -distance * Math.sin(angle) / (width / 2)
    this.moveY = -distance * Math.cos(angle) / (height / 2)

    return {
      angle: this.#calculateAngleCSS(angle),
      distance: -distance,
    }
  }
  

  onJoystickStart = (ev) => {
    this.joystickTouch = this.numberOfTouches;
    this.numberOfTouches++;

    console.log(this)

    this.onJoystickMove(ev);

    document.addEventListener("touchmove", this.onJoystickMove);
    document.addEventListener("touchend", this.onJoystickEnd);
  }

  onJoystickMove = (ev) => {
    const { angle, distance } = this.#calculateJoystickData(
      ev.touches[this.joystickTouch].clientX,
      ev.touches[this.joystickTouch].clientY,
    )

    joystickHandle.style.transform = `translateY(${distance}px)`;
    joystickHandle.parentElement.style.transform = `rotate(${angle}deg)`;
  }

  onJoystickEnd = () => {
    this.numberOfTouches--;

    document.removeEventListener("touchmove", this.onJoystickMove);
    document.removeEventListener("touchend", this.onJoystickEnd);

    joystickHandle.style.transform = "";
    joystickHandle.parentElement.style.transform = "";

    this.moveX = 0;
    this.moveY = 0;
  }

  
  onSwipeStart = (ev) => {
    this.swipeTouch = this.numberOfTouches;
    this.numberOfTouches++;

    const { clientX, clientY } = ev.touches[this.swipeTouch];
    this.swipeStartX = clientX;
    this.swipeStartY = clientY;

    document.addEventListener("touchmove", this.onSwipeMove);
    document.addEventListener("touchend", this.onSwipeEnd);
  }

  onSwipeMove = (ev) => {
    const { clientX, clientY } = ev.touches[this.swipeTouch];
    
    const deltaX = clientX - this.swipeStartX;
    const deltaY = clientY - this.swipeStartY;

    this.moveAngle = deltaX / 3;
    this.movePitch = deltaY / 3;

    this.swipeStartX = clientX;
    this.swipeStartY = clientY;
  }

  onSwipeEnd = () => {
    this.numberOfTouches--;

    document.removeEventListener("touchmove", this.onSwipeMove);
    document.removeEventListener("touchend", this.onSwipeEnd);

    this.moveAngle = 0;
    this.movePitch = 0;
  }


  
}
