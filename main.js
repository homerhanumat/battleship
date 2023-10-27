/*************************************************
 * setup
 *************************************************/

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const oceanBackground = "#7FFFD4"; // aquamarine
const shotMissColor = "AntiqueWhite";
const shotHitColor = "coral";
const bombRadius = 30;
const shipSizes = {
  destroyer: 3,
  cruiser: 6,
  battleship: 9
};
const showCircleTime = 1000;
const tempCircleInfo = {
  x : undefined,
  y : undefined,
  r : undefined
};

canvas.addEventListener("click", processRound);
const pHistory = document.getElementById("user-shots");
pHistory.addEventListener("change", drawOcean);
const cHistory = document.getElementById("computer-shots");
cHistory.addEventListener("change", drawOcean);


// initial game state:
const state = {
  shooting : "u",
  cShips : [
    {
      type : "destroyer",
      size: shipSizes.destroyer,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 2
    },
    {
      type : "cruiser",
      size: shipSizes.cruiser,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 3
    },
    {
      type : "battleship",
      size: shipSizes.battleship,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 5
    }
  ],
  pShips : [
    {
      type : "destroyer",
      size: shipSizes.destroyer,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 2
    },
    {
      type : "cruiser",
      size: shipSizes.cruiser,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 3
    },
    {
      type : "battleship",
      size: shipSizes.battleship,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : 5
    }
  ],
  pShots: [],
  cShots: []
};

/*************************************************
 * run game
 *************************************************/

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

function drawFilledCircle(x, y, r, hit) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  let fill = hit ? shotHitColor : shotMissColor;
  ctx.fillStyle = fill;
  ctx.fill();
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
  ctx.clearRect(0, 0, w, h);
  let bh = (h - bombRadius) / 2;
  ctx.fillStyle = oceanBackground;
  // top border of computer area:
  ctx.fillRect(0, 0, w, bh);
  // bottom border of user area:
  ctx.fillRect(0, bh + bombRadius, w, h);
  // user shots (if requested):
  if (pHistory.checked) {
    for (let shot of state.pShots.filter(s => !s.hit)) {
      drawFilledCircle(shot.x, shot.y, shot.r, false);
    }
    for (let shot of state.pShots.filter(s => s.hit)) {
      drawFilledCircle(shot.x, shot.y, shot.r, true);
    }
  }
  // user shots (if requested):
  if (cHistory.checked) {
    for (let shot of state.cShots.filter(s => !s.hit)) {
      drawFilledCircle(shot.x, shot.y, shot.r, false);
    }
    for (let shot of state.cShots.filter(s => s.hit)) {
      drawFilledCircle(shot.x, shot.y, shot.r, true);
    }
  }
  // user ships:
  for (let ship of state.pShips) {
    let sunk = ship.capacity <= ship.damage;
    drawShip(ship.x, ship.y, ship.size,sunk);
  }
  for (let ship of state.cShips) {
    let sunk = ship.capacity <= ship.damage;
    if (sunk) {
      drawShip(ship.x, ship.y, ship.size,sunk);
    }
  }
}

function damage(xs, ys, xb, yb, size, radius) {
  let distance = dist(xs, ys, xb, yb);
  let close = distance < (radius + size);
  let damage = close ? 1 : 0;
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
function computerShot() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - bombRadius) / 2;
  let x = Math.random() * w;
  let y = bh + bombRadius + Math.random() * bh;
  return {x : x, y : y};
}

function assessDamages(x, y, radius) {
  let hit = false;
  let message = "";
  if (state.shooting == "u") {
    message += `Your bomb explodes at (${x}, ${y}). `
    let ships = state.cShips.filter(s => s.damage < s.capacity);
    for (let ship of ships) {
      let d = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (d > 0) {
        hit = true;
        ship.damage += d;
        message += `You hit my ${ship.type}. `;
      }
      if (ship.damage >= ship.capacity) {
        message += `You sunk my ${ship.type}! `;
        drawShip(ship.x, ship.y, ship.size, true);
      }
    }
    if (!hit) {
      message += "You did not hit anything."
    }
  } else {
    message += `My bomb explodes at (${x}, ${y}). `
    let ships = state.pShips.filter(s => s.damage < s.capacity);
    for (let ship of ships) {
      let d = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (d > 0) {
        hit = true;
        ship.damage += d;
        message += `I hit your ${ship.type}. `;
        if (ship.damage >= ship.capacity) {
          message += `I sunk your ${ship.type}! `;
          drawShip(ship.x, ship.y, ship.size, true);
        }
      }
    }
    if (!hit) {
      message += "I did not hit anything."
    }
  }
  console.log(message);
  return hit;
}

// get location of click on canvas
// source:  
// https://stackoverflow.com/questions/17130395/
// real-mouse-position-in-canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function processRound(event) {
  let pos = getMousePos(canvas, event);
  state.pShots.push({x: pos.x, y: pos.y, r : bombRadius});
  drawCircle(pos.x, pos.y, bombRadius);
  let hit = assessDamages(pos.x, pos.y, bombRadius);
  state.pShots.push({x: pos.x, y: pos.y, r : bombRadius, hit: hit});
  state.shooting = "c";
  let cPos = computerShot();
  state.cShots.push({x: cPos.x, y: cPos.y, r : bombRadius});
  drawCircle(cPos.x, cPos.y, bombRadius);
  hit = assessDamages(cPos.x, cPos.y, bombRadius);
  state.cShots.push({x: cPos.x, y: cPos.y, r : bombRadius, hit: hit});
  state.shooting = "u";
  window.setTimeout(drawOcean, 2000);
}


