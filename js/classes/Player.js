// player
class Player extends Sprite {
  constructor({
    position,
    collisionsBlocks,
    imgSrc,
    frameRate,
    scale = 0.5,
    animations,
  }) {
    super({
      imgSrc,
      frameRate,
      scale,
    });
    this.position = position;
    this.velocity = {
      x: 0,
      y: 1,
    };

    this.collisionBlocks = collisionsBlocks;
    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 10,
      height: 10,
    };
    this.animations = animations;

    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imgSrc;

      this.animations[key].image = image;
    }

    this.cameraBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  switchSprite(key) {
    if (this.image === this.animations[key].image || !this.loaded) return;
    this.currentFrame = 0;

    this.image = this.animations[key].image;
    this.frameRate = this.animations[key].frameRate;
    this.frameBuffer = this.animations[key].frameBuffer;
  }

  update() {
    this.updateFrame();
    this.updateHitbox();
    this.position.x += this.velocity.x;
    this.updateHitbox();
    this.checkforHorizontalCollisions();
    this.applyGravity();
    this.updateHitbox();
    this.checkforVerticalCollisions();

    // // draws main image
    // context.fillStyle = "rgba(0, 155, 0, 0.5)";
    // context.fillRect(this.position.x, this.position.y, this.width, this.height);
    //
    // draws hitbox
    this.updateCameraBox();
    context.fillStyle = "rgba(0, 0, 155, 0)";
    context.fillRect(
      this.cameraBox.position.x,
      this.cameraBox.position.y,
      this.cameraBox.width,
      this.cameraBox.height,
    );
    this.draw();
  }

  checkforHorizontalCanvasCollision() {
    if (this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576) {
      this.velocity.x = 0;
    }
    if (this.hitbox.position.x + this.velocity.x < 0) {
      this.velocity.x = 0;
    }
  }

  checkforVerticalCanvasCollision() {
    if (this.hitbox.position.y + this.hitbox.height + this.velocity.y >= 576) {
      this.velocity.y = 0;
    }
    if (this.hitbox.position.y + this.velocity.y < -10) {
      this.velocity.y = 0;
    }
  }

  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x + 33,
        y: this.position.y + 25,
      },
      width: 16,
      height: 28,
    };
  }

  shouldPanCameraToLeft({ canvas, camera }) {
    const cameraBoxSide = this.cameraBox.position.x + this.cameraBox.width;
    const scaledCanvasWidth = canvas.width / 4;
    if (
      cameraBoxSide >= scaledCanvasWidth + Math.abs(camera.position.x) &&
      cameraBoxSide < 574
    ) {
      camera.position.x -= this.velocity.x;
    }
  }
  shouldPanCameraToRight({ canvas, camera }) {
    const cameraBoxSide = this.cameraBox.position.x;
    const scaledCanvasWidth = canvas.width / 4;
    if (cameraBoxSide <= Math.abs(camera.position.x) && cameraBoxSide > 0) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraDown({ canvas, camera }) {
    const cameraBoxSide = this.cameraBox.position.y;
    if (cameraBoxSide <= Math.abs(camera.position.y) && cameraBoxSide > 0) {
      camera.position.y -= this.velocity.y;
    }
    if (camera.position.y > 0) {
      camera.position.y = 0;
    }
  }

  shouldPanCameraUp({ canvas, camera }) {
    const cameraBoxSide = this.cameraBox.position.y + this.cameraBox.height;
    const scaledCanvasHeight = canvas.height / 4;
    if (
      cameraBoxSide >= scaledCanvasHeight + Math.abs(camera.position.y) &&
      cameraBoxSide < 576
    ) {
      camera.position.y -= this.velocity.y;
    }
    if (camera.position.y > 576) {
      camera.position.y = 576;
    }
  }

  updateCameraBox() {
    this.cameraBox = {
      position: {
        x: this.position.x - 50,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  applyGravity() {
    if (this.velocity.y < 3) this.velocity.y += gravity;
    this.position.y += this.velocity.y;
  }
  checkforVerticalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];
      // console.log(collisionBlock.position, this.position);
      if (
        collision({
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height;
          this.position.y = collisionBlock.position.y - offset - 0.0001;
          break;
        }

        if (this.velocity.y < 0) {
          this.velocity.y = 0;
          const offset = this.hitbox.position.y - this.position.y;

          this.position.y =
            collisionBlock.position.y + collisionBlock.height - offset + 0.01;
          break;
        }
      }
    }
  }

  checkforHorizontalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];
      // console.log(collisionBlock.position, this.position);
      if (
        collision({
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.x > 0) {
          this.velocity.x = 0;
          const offset =
            this.hitbox.position.x - this.position.x + this.hitbox.width;
          this.position.x = collisionBlock.position.x - offset - 0.01;
          break;
        }

        if (this.velocity.x < 0) {
          this.velocity.x = 0;
          const offset = this.hitbox.position.x - this.position.x;
          this.position.x =
            collisionBlock.position.x + collisionBlock.width - offset + 0.01;
          break;
        }
      }
    }
  }
}
