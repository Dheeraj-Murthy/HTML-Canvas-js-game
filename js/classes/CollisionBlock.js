// collision block
class CollisionBlock {
  constructor(x, y, height = 16) {
    this.position = {
      x: x,
      y: y,
    };
    this.width = 16;
    this.height = height;
  }

  draw() {
    context.fillStyle = "rgba(255, 0 , 0 , 0.5)";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.draw();
  }
}
