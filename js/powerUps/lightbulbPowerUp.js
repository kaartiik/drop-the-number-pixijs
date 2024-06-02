class LightbulbPowerUp extends PIXI.Sprite {
  constructor(imageURL, x, y) {
    super(imageURL);
    super.anchor.set(0.5);
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 100;
    this.scaleTo = 0.6;
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

  grow(delta, removeFn, removeChild, redisplayAfterSomeMs) {
    // use delta to create frame-independent transform
    let balance = this.scaleTo - this.scale.x;

    let balanceAbs = Math.abs(balance);
    if (balanceAbs >= 0.001) {
      this.scale.x += 0.001;
      this.scale.y += 0.001;
    } else {
      this.scale.x += balance;
      this.scale.y += balance;

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
