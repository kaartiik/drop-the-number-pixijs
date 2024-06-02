class ThunderCloudPowerUp extends PIXI.Sprite {
  constructor(imageURL, x) {
    super(imageURL);
    this.x = x;
    this.y = 100;
    this.width = 100;
    this.height = 80;
    this.destinationX = 0;
    this.interactive = true;
    this.buttonMode = true;
    this.clicked = false;
  }

  setButtonClicked(bool) {
    this.clicked = bool;

    if (bool === false) {
      this.buttonMode = true;
      this.interactive = true;
    } else {
      this.interactive = false;
      this.buttonMode = false;
    }
  }

  getButtonClicked() {
    return this.clicked;
  }

  showThunderCloudPowerUp() {
    const probability = Math.floor(Math.random() * 100);

    if (probability < 20) {
      // console.log('SHOW STORM');
      return true;
    } else {
      // console.log('HIDE STORM');
      return false;
    }
  }

  flyAcross(delta, removeFn, removeChild, redisplayAfterSomeMs) {
    // use delta to create frame-independent transform
    let balance = this.destinationX - this.x;

    let balanceAbs = Math.abs(balance);
    if (balanceAbs >= 1) {
      this.x += (balance / balanceAbs) * delta * 2;
    } else {
      this.x += balance * delta;
      removeFn();
      removeChild();
      redisplayAfterSomeMs();
    }
  }

  //Used for end rocket fly animation
  disappearDown(yDistance) {
    this.y += yDistance;
  }
}
