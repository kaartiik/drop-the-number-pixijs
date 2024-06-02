class Toon extends PIXI.AnimatedSprite {
  constructor(x, y, width, height, toonTextures) {
    super(toonTextures['idle']);
    this.toonTextures = toonTextures;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.loop = true;
    this.animationSpeed = 0.06;
    this.play();
  }

  status() {
    return 'speed of toon is ' + this.animationSpeed;
  }

  //Used for end rocket fly animation
  disappearDown(yDistance) {
    this.y += yDistance;
  }

  idle() {
    this.textures = this.toonTextures.idle;
    this.loop = true;
    this.play();
  }

  jump() {
    this.textures = this.toonTextures.jump;
    this.loop = false;
    this.play();
    this.onComplete = function () {
      this.idle();
    };
  }

  build() {
    this.textures = this.toonTextures.build;
    this.loop = false;
    this.play();
    this.onComplete = function () {
      this.idle();
    };
  }

  goldenBuild() {
    this.textures = this.toonTextures.goldenBuild;
    this.loop = false;
    this.play();
    this.onComplete = function () {
      this.idle();
    };
  }

  eureka() {
    this.textures = this.toonTextures.eureka;
    this.loop = false;
    this.play();
    this.onComplete = function () {
      this.idle();
    };
  }
}
