export default class Movement {
  constructor() {
    this.moveX = 0;
    this.moveY = 0;
    this.moveAngle = 0;
    this.movePitch = 0;
    this.moveHeight = 0;
  }

  reset() {
    this.moveAngle = 0;
    this.moveHeight = 0;
    this.movePitch = 0;
    this.moveX = 0;
    this.moveY = 0;
  }
}
