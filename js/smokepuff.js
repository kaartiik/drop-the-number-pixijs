class Smokepuff extends PIXI.AnimatedSprite {
  constructor(x, y, width, height, toonTextures) {
    super(toonTextures);
    this.toonTextures = toonTextures;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.loop = false;
    this.animationSpeed = 0.2;
  }
}
