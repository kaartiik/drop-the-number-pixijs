class UFOPowerUp extends PIXI.Sprite {
  constructor(imageURL, destinationX) {
    super(imageURL);
    this.x = 0;
    this.y = 50;
    this.width = 100;
    this.height = 300;
    this.destinationX = destinationX;
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

  showUFOPowerUp() {
    const probability = Math.floor(Math.random() * 100);

    if (probability < 20) {
      // console.log('SHOW UFO');
      return true;
    } else {
      // console.log('HIDE UFO');
      return false;
    }
  }

  flyAcross(delta, removeFn, removeChild) {
    // use delta to create frame-independent transform
    let balance = this.destinationX - this.x;

    let balanceAbs = Math.abs(balance);
    if (balanceAbs >= 1) {
      this.x += (balance / balanceAbs) * delta * 1;
    } else {
      this.x += balance * delta;
      removeFn();
      removeChild();
    }
  }

  //Used for end rocket fly animation
  disappearDown(yDistance) {
    this.y += yDistance;
  }
}
