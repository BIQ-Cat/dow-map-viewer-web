import { isTouchDevice, resize } from "./adaptive.js";
import { canvas, fps, heightController, joystickContainer, settingsController, switchMovementButton, togglePassabilityButton, toggleSettingsButton } from "./elements.js"
import KeyboardMovement from "./keyboard.js";
import TouchMovement from "./touch.js";

export function setupSettingsButtons() {
  fps.hidden = true;
  toggleSettingsButton.hidden = !isTouchDevice()
  settingsController.hidden = isTouchDevice()
  switchMovementButton.hidden = !isTouchDevice()

  
  document.getElementById('toggle-fps').onclick = () => {
    fps.hidden = !fps.hidden;
  }

  document.getElementById('reset-camera').onclick = () => { 
    getMovement().reset();
  }

  toggleSettingsButton.onclick = () => {
    settingsController.hidden = !settingsController.hidden;
    joystickContainer.hidden = !joystickContainer.hidden;
    heightController.hidden = !heightController.hidden;
  }

  switchMovementButton.onclick = () => {
    getMovement().disable();

    isTouchMovement = !isTouchMovement;
    toggleSettingsButton.hidden = !isTouchMovement;
    settingsController.hidden = isTouchMovement;

    getMovement().enable();
    switchMovementButton.textContent = isTouchMovement ? 'keyboard' : 'joystick';

    canvas.hidden = false;
  }
  
  togglePassabilityButton.onclick = () => {
    showPassable = !showPassable;
    togglePassabilityButton.textContent = showPassable ? 'flip_to_front' : 'flip_to_back';
  }
}

export function setupMovement() {
  joystickContainer.hidden = true;
  heightController.hidden = true;

  getMovement().enable()
}

let showPassable = false;
let isTouchMovement = isTouchDevice();

let keyboardMovement = new KeyboardMovement();
let touchMovement = new TouchMovement();

export const isPassable = () => {
  return showPassable;

}
export const getMovement = () => isTouchMovement ? touchMovement : keyboardMovement;