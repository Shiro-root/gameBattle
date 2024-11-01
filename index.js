const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: "blue",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

console.log(player);

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement

  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = -20;
        break;
      case " ":
        player.attack();
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();

        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  // enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});

function resetGame() {
  // Reset health
  player.health = 100;
  enemy.health = 100;
  gsap.to("#playerHealth", { width: "100%" });
  gsap.to("#enemyHealth", { width: "100%" });

  // Reset posisi dan kecepatan
  player.position = { x: 0, y: canvas.height - player.height }; // posisikan player di permukaan
  enemy.position = { x: 400, y: canvas.height - enemy.height }; // posisikan enemy di permukaan
  player.velocity = { x: 0, y: 0 };
  enemy.velocity = { x: 0, y: 0 };

  // Reset animasi
  player.dead = false;
  enemy.dead = false;
  player.framesCurrent = 0;
  enemy.framesCurrent = 0;
  player.switchSprite("idle");
  enemy.switchSprite("idle");

  // Reset variabel dan state yang lain
  keys.a.pressed = false;
  keys.d.pressed = false;
  keys.ArrowRight.pressed = false;
  keys.ArrowLeft.pressed = false;

  // Reset timer
  timer = 60;
  clearTimeout(timerId);
  decreaseTimer();

  // Sembunyikan display text
  document.querySelector("#displayText").style.display = "none";
}

// Deklarasikan variabel ronde
let round = 1;
const maxRounds = 2; // Maksimal 2 ronde

// Fungsi untuk mengatur reset dengan kontrol ronde
function resetGame() {
  if (round > maxRounds) {
    // Jika sudah mencapai ronde maksimal, akhir permainan
    document.querySelector("#displayText").innerHTML = "Game Over";
    document.querySelector("#resetButton").disabled = true; // Nonaktifkan tombol reset
    return;
  }

  // Reset health
  player.health = 100;
  enemy.health = 100;
  gsap.to("#playerHealth", { width: "100%" });
  gsap.to("#enemyHealth", { width: "100%" });

  // Reset posisi dan kecepatan
  player.position = { x: 0, y: canvas.height - player.height };
  enemy.position = { x: 400, y: canvas.height - enemy.height };
  player.velocity = { x: 0, y: 0 };
  enemy.velocity = { x: 0, y: 0 };

  // Reset animasi
  player.dead = false;
  enemy.dead = false;
  player.framesCurrent = 0;
  enemy.framesCurrent = 0;
  player.switchSprite("idle");
  enemy.switchSprite("idle");

  // Reset variabel dan state lainnya
  keys.a.pressed = false;
  keys.d.pressed = false;
  keys.ArrowRight.pressed = false;
  keys.ArrowLeft.pressed = false;

  // Reset timer
  timer = 60;
  clearTimeout(timerId);
  decreaseTimer();

  // Sembunyikan display text
  document.querySelector("#displayText").style.display = "none";

  // Tingkatkan ronde setelah reset
  if (round < maxRounds) round++;
}

// Modifikasi determineWinner untuk mendukung ronde berganda
function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);
  document.querySelector("#displayText").style.display = "flex";

  if (player.health === enemy.health) {
    document.querySelector("#displayText").innerHTML = "Tie";
  } else if (player.health > enemy.health) {
    document.querySelector("#displayText").innerHTML =
      "Player 1 Wins Round " + round;
  } else if (player.health < enemy.health) {
    document.querySelector("#displayText").innerHTML =
      "Player 2 Wins Round " + round;
  }

  // Tunda reset untuk ronde berikutnya
  setTimeout(() => {
    if (round < maxRounds) {
      resetGame();
    } else {
      document.querySelector("#displayText").innerHTML += "<br>Game Over";
    }
  }, 3000); // Tunda 3 detik sebelum ronde berikutnya atau akhir game
}

// Tambahkan event listener untuk tombol reset manual
document.querySelector("#resetButton").addEventListener("click", resetGame);
