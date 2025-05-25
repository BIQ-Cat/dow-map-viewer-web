import { fps, heightController, joystickContainer, settingsController, toggleSettingsButton } from "./elements.js"

export function setupSettingsButtons() {
  fps.hidden = true;
  document.getElementById('toggle-fps').onclick = () => {
    fps.hidden = !fps.hidden;
  }
  document.getElementById('toggle-passability').onclick = () => { showPassable = !showPassable }

  toggleSettingsButton.onclick = () => {
    settingsController.hidden = !settingsController.hidden;
    joystickContainer.hidden = !joystickContainer.hidden;
    heightController.hidden = !heightController.hidden;
  }
}

export let showPassable = false;
