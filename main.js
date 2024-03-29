/*************************************************
 * setup
 *************************************************/

// parameters
const oceanBackground = "#7FFFD4"; // aquamarine
const shotMissColor = "AntiqueWhite";
const shotHitColor = "coral";
const bombRadius = 30;
const shipSizes = {
  destroyer: 3,
  cruiser: 6,
  battleship: 9
};
const shipCapacities = {
  destroyer: 2,
  cruiser: 3,
  battleship: 5
};
const showCircleTime = 1000;
const tempCircleInfo = {
  x : undefined,
  y : undefined,
  r : undefined
};

// html elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.addEventListener("click", processRound);

const pHistory = document.getElementById("user-shots");
pHistory.addEventListener("change", drawOcean);

const cHistory = document.getElementById("computer-shots");
cHistory.addEventListener("change", drawOcean);

const shipReport = document.getElementById("ship-report");
const narrative = document.getElementById("narrative");

// game state:
const state = {
  shooting : "u",
  winner : undefined,
  cShips : [
    {
      type : "destroyer",
      size: shipSizes.destroyer,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.destroyer
    },
    {
      type : "cruiser",
      size: shipSizes.cruiser,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.cruiser
    },
    {
      type : "battleship",
      size: shipSizes.battleship,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.battleship
    }
  ],
  pShips : [
    {
      type : "destroyer",
      size: shipSizes.destroyer,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.destroyer
    },
    {
      type : "cruiser",
      size: shipSizes.cruiser,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.cruiser
    },
    {
      type : "battleship",
      size: shipSizes.battleship,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.battleship
    }
  ],
  pShots: [],
  cShots: [],
  previousHits: [], // array to hold the coordinates for a hit
  shipsUnderAttack: [] // array to hold damaged ships to be attacked
};

/*************************************************
 * run game
 *************************************************/

populateNarrative(
  `Shoot by clicking in my field (upper half).<br>
  I will shoot back.`
);
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

function contains (arr,obj) {
  isThere = false;
  for (let elem of arr) {
      if (elem === obj) {
          isThere = true;
      }
  }
  return(isThere);
}

function remove (arr,obj) {
  let result = arr.filter(function (elem) {
          return(elem !== obj);
  }
);
return(result);
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

function search() {
  // simple choice for now:
  let computerBombRadius = bombRadius;

  let newSpot = false;
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - bombRadius) / 2;
  let x, y;
  while(!newSpot) {
    x = Math.random() * w;
    y = bh + computerBombRadius + Math.random() * bh;
    const closePreviousShots = state.cShots.filter(function(shot) {
      let distance = dist(x, y, shot.x, shot.y);
      return distance < shot.r;
    });
    if (closePreviousShots.length === 0) {
      newSpot = true;
    }
  }
  return({x: x, y : y, r: computerBombRadius})
}

function computerShot() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - bombRadius) / 2;
  if (state.previousHits.length > 0) { 
    // if there is something in the previousHits array 
      let hit = state.previousHits[0];
      return {x: hit.x, y : hit.y, r : bombRadius};
    } else { // if no previous hit do random attack
    return search();
    }
  }
    // fix and clean up
    /* future plans, create array of areas hit and check against it */
// }

function remove(arr, elem) {
  return arr.filter(e => e !== elem);
}

function assessDamages(x, y, radius) {
  let hit = false;
  let message = "";
  // let sunk = (ships.damage >= ships.capacity);
  if (state.shooting == "u") {
    message += `Your bomb explodes at (${Math.round(x)}, ${Math.round(y)}). `
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
    // computer is shooting:
    message += `My bomb explodes at (${Math.round(x)}, ${Math.round(y)}). `
    let ships = state.pShips.filter(s => s.damage < s.capacity);
    for (let ship of ships) {
      let cd = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (cd > 0) {
        hit = true;
        state.previousHits.push({ x: x, y: y, r : bombRadius});
        if (!state.shipsUnderAttack.includes(ship)) {
          state.shipsUnderAttack.push(ship);
        }
        console.log(state.shipsUnderAttack);
        ship.damage += cd;
        message += `I hit your ${ship.type}. `;
        if (ship.damage >= ship.capacity) {
          message += `I sunk your ${ship.type}! `;
          drawShip(ship.x, ship.y, ship.size, true);
          state.shipsUnderAttack = remove(state.shipsUnderAttack, ship);
          if (state.shipsUnderAttack.length === 0) {
            state.previousHits = [];
          }
        }
      }
    }
    if (!hit) {
      message += "I did not hit anything."
    }
  }
  console.log(message);
  return {hit: hit, message : message};
} 
// update and add helper functions, 
// need to check if there is an object in previousHits, 
// push to previous, and remove from


//update ship report:
function populateShipReport() {
  let contents = "";
  contents += "<tbody>";
  contents += 
    `
    <tr><th>Ship</th><th>Capacity</th><th>Damage (You)
    </th><th>Damage (Computer)</th></tr>
    `
  let l = state.cShips.length;
  for (let i = 0; i < l; i++) {
    contents += 
      `<tr>
        <td>${state.pShips[i].type}</td>
        <td>${state.pShips[i].capacity}</td>
        <td>${state.pShips[i].damage}</td>
        <td>${state.cShips[i].damage}</td>
      </tr>`;
  }
  contents += "</tbody>";
  shipReport.innerHTML = contents;
}

// update narrative:
function populateNarrative(message) {
  narrative.innerHTML = message;
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

// modifies state:
function checkForWinner() {
  let playerDoneFor = allShipsSunk("u");
  let computerDoneFor = allShipsSunk("c");
  if (playerDoneFor || computerDoneFor) {
    state.winner = state.shooting == "u" ? "c" : "u";
  }
}

function allShipsSunk(player) {
  let ships = (player == "u") ? state.pShips : state.cShips;
  let sunkCount = 0;
  for (let ship of ships) {
    sunkCount += ship.damage >= ship.capacity ? 1 : 0;
  }
  return sunkCount == ships.length;
}

function processRound(event) {
  checkForWinner();
  if (!state.winner) {
    let pos = getMousePos(canvas, event);
    state.pShots.push({x: pos.x, y: pos.y, r : bombRadius});
    drawCircle(pos.x, pos.y, bombRadius);
    let userResults = assessDamages(pos.x, pos.y, bombRadius);
    let hit = userResults.hit;
    let message = userResults.message;
    state.pShots.push({x: pos.x, y: pos.y, r : bombRadius, hit: hit});
    state.shooting = "c";
    checkForWinner();
    if (!state.winner) {
      let cPos = computerShot();
      state.cShots.push({x: cPos.x, y: cPos.y, r : bombRadius});  
      // problem with cPos  (HSW:  Sean, what is the problem?)
      drawCircle(cPos.x, cPos.y, bombRadius);
      let computerResults = assessDamages(cPos.x, cPos.y, bombRadius);
      let chit = computerResults.hit;
      if (chit == true) {
        console.log("it's true");
      } else {
        console.log("it's false");
      }
      message += `<br>${computerResults.message}`;
      state.cShots.push({x: cPos.x, y: cPos.y, r : bombRadius, hit: chit});
      state.shooting = "u";
      checkForWinner();
    }
    if (state.winner) {
      if (state.winner == "u") {
        message += `<br>You sunk all my ships.  You win!`;
      } else {
        message += `<br>I sunk all your ships.  I win!`;
      }
    }
    populateShipReport();
    populateNarrative(message);
    window.setTimeout(drawOcean, 2000);
  }
}