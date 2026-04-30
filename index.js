const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const scaledCanvas = {
  width: canvas.width / 4,
  height: canvas.height / 4,
};

const floorCollisions2d = [];
for (let i = 0; i < floorCollisions.length; i += 36) {
  floorCollisions2d.push(floorCollisions.slice(i, i + 36));
}

const floorCollisionBlocks = [];
floorCollisions2d.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol == 202) {
      console.log("draw a block");
      floorCollisionBlocks.push(new CollisionBlock(x * 16, y * 16));
    }
  });
});

const platformCollisions2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
  platformCollisions2D.push(platformCollisions.slice(i, i + 36));
}

const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol == 202) {
      console.log("draw a block");
      platformCollisionBlocks.push(new CollisionBlock(x * 16, y * 16, 5));
    }
  });
});

const netCollisions2D = [];
for (let i = 0; i < platformCollisions2D.length; i++) {
  const row = [];
  for (let j = 0; j < platformCollisions2D[i].length; j++) {
    let u = floorCollisions2d[i][j] + platformCollisions2D[i][j];
    if (u > 202) u = 202;
    row.push(u);
  }
  netCollisions2D.push(row);
}
// console.log(netCollisions2D);
const netCollisionBlocks = [];
netCollisions2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol == 202) {
      console.log("draw a block");
      netCollisionBlocks.push(new CollisionBlock(x * 16, y * 16, 5));
    }
  });
});

const gravity = 0.2;

// finish flag — sits on top-right platform (world x=480-528, y=64)
const finish = {
  x: 502,
  y: 64,
  poleHeight: 30,
  hitbox: { position: { x: 486, y: 30 }, width: 40, height: 34 },
};

let gameWon = false;

function drawFinishFlag() {
  const { x, y, poleHeight } = finish;
  // pole
  context.strokeStyle = "#ccc";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y - poleHeight);
  context.stroke();
  // flag triangle
  context.fillStyle = "#f7c948";
  context.beginPath();
  context.moveTo(x, y - poleHeight);
  context.lineTo(x + 14, y - poleHeight + 6);
  context.lineTo(x, y - poleHeight + 12);
  context.closePath();
  context.fill();
  // "FINISH" label
  context.fillStyle = "#f7c948";
  context.font = "bold 6px monospace";
  context.textAlign = "center";
  context.fillText("FINISH", x + 7, y - poleHeight - 3);
}

// background
context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

const background = new Sprite({
  x: 0,
  y: 0,
  imgSrc: "./assets/background.png",
});

const player = new Player({
  position: {
    x: 100,
    y: 300,
  },
  collisionsBlocks: netCollisionBlocks,
  imgSrc: "./assets/warrior/Idle.png",
  frameRate: 8,
  animations: {
    Idle: { imgSrc: "./assets/warrior/Idle.png", frameRate: 8, frameBuffer: 7 },
    Run: { imgSrc: "./assets/warrior/Run.png", frameRate: 8, frameBuffer: 5 },
    Jump: {
      imgSrc: "./assets/warrior/Jump.png",
      frameRate: 2,
      frameBuffer: 10,
    },
    Fall: {
      imgSrc: "./assets/warrior/Fall.png",
      frameRate: 2,
      frameBuffer: 10,
    },
    FallLeft: {
      imgSrc: "./assets/warrior/FallLeft.png",
      frameRate: 2,
      frameBuffer: 10,
    },
    JumpLeft: {
      imgSrc: "./assets/warrior/JumpLeft.png",
      frameRate: 2,
      frameBuffer: 10,
    },
    IdleLeft: {
      imgSrc: "./assets/warrior/IdleLeft.png",
      frameRate: 8,
      frameBuffer: 7,
    },
    RunLeft: {
      imgSrc: "./assets/warrior/RunLeft.png",
      frameRate: 8,
      frameBuffer: 5,
    },
    Attack1: {
      imgSrc: "./assets/warrior/Attack1.png",
      frameRate: 4,
      frameBuffer: 5,
    },
  },
});
const keys = {
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
};

let isFacingLeft = false;

const bgImgHt = 432;
const camera = {
  position: {
    x: 0,
    y: -bgImgHt + scaledCanvas.height,
  },
};

function animate() {
  window.requestAnimationFrame(animate);
  // refresh the canvas
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.scale(4, 4);
  context.translate(camera.position.x, camera.position.y);
  background.update();
  floorCollisionBlocks.forEach((collisionBlock) => {
    collisionBlock.update();
  });
  platformCollisionBlocks.forEach((collisionBlock) => {
    collisionBlock.update();
  });

  drawFinishFlag();

  if (!gameWon) {
    player.checkforHorizontalCanvasCollision();
    player.checkforVerticalCanvasCollision();
    player.update();
    player.velocity.x = 0;
    if (keys.d.pressed) {
      isFacingLeft = false;
      player.switchSprite("Run");
      player.velocity.x = 3;
      player.shouldPanCameraToLeft({ camera, canvas });
    } else if (keys.a.pressed) {
      isFacingLeft = true;
      player.switchSprite("RunLeft");
      player.velocity.x = -3;
      player.shouldPanCameraToRight({ camera, canvas });
    } else if (player.velocity.y === 0) {
      if (isFacingLeft) player.switchSprite("IdleLeft");
      else player.switchSprite("Idle");
    }
    if (player.velocity.y > 0) {
      if (isFacingLeft) player.switchSprite("FallLeft");
      else player.switchSprite("Fall");
      player.shouldPanCameraUp({ canvas, camera });
    } else if (player.velocity.y < 0) {
      player.shouldPanCameraDown({ camera, canvas });
    }
    if (collision({ object1: player.hitbox, object2: finish.hitbox })) {
      gameWon = true;
    }
  } else {
    player.draw();
  }
  context.restore();

  // HUD — drawn in screen space, unaffected by camera
  context.save();
  context.font = "bold 14px monospace";
  context.fillStyle = "rgba(255,255,255,0.85)";
  context.textAlign = "right";
  const lines = ["Use WASD or Arrow Keys to move"];
  lines.forEach((line, i) => {
    context.fillText(line, canvas.width - 16, 24 + i * 20);
  });
  context.restore();

  if (gameWon) {
    context.save();
    context.fillStyle = "rgba(0,0,0,0.55)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.textAlign = "center";
    context.fillStyle = "#f7c948";
    context.font = "bold 72px monospace";
    context.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2 - 20);
    context.fillStyle = "rgba(255,255,255,0.7)";
    context.font = "bold 24px monospace";
    context.fillText("Refresh to play again", canvas.width / 2, canvas.height / 2 + 40);
    context.restore();
  }
}
animate();

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      break;
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      break;
    case "w":
    case "ArrowUp":
      if (player.isOnGround) {
        player.velocity.y = -5;
        if (isFacingLeft) player.switchSprite("JumpLeft");
        else player.switchSprite("Jump");
      }
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      break;
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      break;
  }
});
