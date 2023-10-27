const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bombRadius = 10;
const shipSizes = [3, 5, 7];


// initial game state:
const state = {
  shooting : "u",
  cShips : [
    {
      type : "destroyer",
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 2
    },
    {
      type : "cruiser",
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 3
    },
    {
      type : "battleship",
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 5
    }
  ],
  pShips : [
    {
      type : "destroyer",
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 2
    },
    {
      type : "cruiser",
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 3
    },
    {
      type : "battleship",
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 5
    }
  ]
};



placeShips();
drawOcean();


/***********************************
 * utitlity functions
 ***********************************/

function drawCircle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.stroke();
}

function drawShip(x, y, size, sunk) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2, true);
  ctx.fillStyle = sunk ? "red" : "blue";
  ctx.fill();
  ctx.fillStyle = "black";
}
function dist(x1, y1, x2, y2) {
  let sX = x1 - x2;
  let sY = y1 - y2;
  return Math.sqrt(sX*sX+sY*sY);
}

function drawOcean() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - bombRadius) / 2;
  // bottom border of computer area:
  ctx.beginPath();
  ctx.moveTo(0, bh);
  ctx.lineTo(w, bh);
  ctx.stroke();
  // top border of user area:
  ctx.beginPath();
  ctx.moveTo(0, h - bh);
  ctx.lineTo(w, h - bh);
  ctx.stroke();
  // user ships:
  for (let i = 0; i < state.pShips.length; i++) {
    let ship = state.pShips[i];
    let sunk = ship.capacity <= ship.damage;
    drawShip(ship.x, ship.y, shipSizes[i],sunk);
  }
  for (let i = 0; i < state.cShips.length; i++) {
    let ship = state.cShips[i];
    let sunk = ship.capacity <= ship.damage;
    if (sunk) {
      drawShip(ship.x, ship.y, shipSizes[i],sunk);
    }
  }
}

function damage(xs, ys, xb, yb, radius) {
  let distance = dist(xs, ys, xb, yb);
  let damage = dist < radius ? 1 : 0;
  return damage;
}

function placeShips() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - bombRadius) / 2;
  for (let ship of state.cShips) {
    ship.x = Math.random() * w;
    ship.y = Math.random() * bh;
  };
  for (let ship of state.pShips) {
    ship.x = Math.random() * w;
    ship.y = h/2 + bombRadius + Math.random() * bh;
  };
}

// very simple, for now:
function computerMove() {
  let x = Math.random() * canvas.clientWidth;
  let y = Math.random() * canvas.clientHeight;
  return [x, y];
}

function assessDamages(x, y, player, radius) {
  let hit = false;
  let message = "";
  if (state.shooting == "u") {
    let ships = state.cShips;
    for (let ship of ships) {
      let d = damage(xs, ys, x, y, radius);
      if (d > 0) {
        hit = true;
        ship.damage += d;
        message += `You hit my {ship.type}. `;
      }
      if (ship.damage >= ship.capacity) {
        message += `You sunk my {ship.type}! `;
        drawShip(ship.x, ship.y, 5, true);
      }
    }
    if (!hit) {
      message = "You did not hit anything."
    }
  } else {
    let ships = state.cShips;
    for (let ship of ships) {
      let d = damage(xs, ys, x, y, radius);
      if (d > 0) {
        hit = true;
        ship.damage += d;
        message += `I hit your {ship.type}. `;
        if (ship.damage >= ship.capacity) {
          message += `I sunk your {ship.type}! `;
          drawShip(ship.x, ship.y, 5, true);
        }
      }
    }
    if (!hit) {
      message = "I did not hit anything."
    }
  }
  console.log(message);
}


