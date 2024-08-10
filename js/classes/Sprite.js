// sprite
class Sprite {
  constructor({ x, y, imgSrc, frameRate = 1, scale = 1 }) {
    this.position = {
      x: x,
      y: y,
    };
    this.scale = scale;
    this.loaded = false;
    this.image = new Image();
    this.image.src = imgSrc;
    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * scale;
      this.height = this.image.height * scale;
      this.loaded = true;
    };
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.elapsedFrames = 0;
    this.frameBuffer = 7;
  }

  draw() {
    if (!this.image) return;
    const cropbox = {
      position: {
        x: this.currentFrame * (this.image.width / this.frameRate),
        y: 0,
      },
      width: this.image.width / this.frameRate,
      height: this.image.height,
    };
    context.drawImage(
      this.image,
      cropbox.position.x,
      cropbox.position.y,
      cropbox.width,
      cropbox.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }
  update() {
    this.draw();
    this.updateFrame();
  }
  updateFrame() {
    this.elapsedFrames++;
    if (this.elapsedFrames % this.frameBuffer === 0)
      if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
      else this.currentFrame = 0;
  }
}
