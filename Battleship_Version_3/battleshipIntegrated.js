/*************************************************
 * setup
 *************************************************/



// parameters
const gameBackground = "white";
const oceanBackground = "#61cffa";
const shotMissColor = "white";
const shotHitColor = "red";
const shipSizes = {
  Destroyer: 3,
  Cruiser: 6,
  Battleship: 9
};
const shipCapacities = {
  Destroyer: 2,
  Cruiser: 3,
  Battleship: 5
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


const bombRadiusSlider = document.getElementById("shotSize");
const bombDamageSlider = document.getElementById("shotPower");

let bombRadius = 30;
let firePower = 3.5;

bombRadiusSlider.addEventListener("input", function() {
  bombRadius = parseFloat(this.value);
  firePower = Math.round((10-(bombRadius/10))*5)/10;
  bombDamageSlider.value = firePower;
  bombRadiusSlider.value = bombRadius;

  const ballElement = document.getElementById('ball');
  ballElement.style.height = 2 * bombRadius + 'px';
  ballElement.style.width = 2 * bombRadius + 'px';
  ballElement.style.marginTop = -bombRadius + 'px';
  ballElement.style.marginLeft = -bombRadius + 'px';
 
  document.getElementById("shotPowerDisplay").innerText = firePower;
  
});

bombDamageSlider.addEventListener("input", function() {
  firePower = parseFloat(this.value);
  bombRadius = Math.round((100-(firePower*20))*10)/10;
  bombRadiusSlider.value = bombRadius;
  bombDamageSlider.value = firePower;
  document.getElementById("shotSizeDisplay").innerText = bombRadius;

  const ballElement = document.getElementById('ball');
  ballElement.style.height = 2 * bombRadius + 'px';
  ballElement.style.width = 2 * bombRadius + 'px'; 
  ballElement.style.marginTop = -bombRadius + 'px';
  ballElement.style.marginLeft = -bombRadius + 'px';
});

// game state:
const state = {
  shooting : "u",
  winner : undefined,
  cShips : [
    {
      type : "Destroyer",
      size: shipSizes.Destroyer,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.Destroyer
    },
    {
      type : "Cruiser",
      size: shipSizes.Cruiser,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.Cruiser
    },
    {
      type : "Battleship",
      size: shipSizes.Battleship,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.Battleship
    }
  ],
  pShips : [
    {
      type : "Destroyer",
      size: shipSizes.Destroyer,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.Destroyer
    },
    {
      type : "Cruiser",
      size: shipSizes.Cruiser,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.Cruiser
    },
    {
      type : "Battleship",
      size: shipSizes.Battleship,
      x : undefined,
      y : undefined,
      damage : 0,
      capacity : shipCapacities.Battleship
    }
  ],
  pShots: [],
  cShots: []
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
  ctx.fillStyle = sunk ? "#c90d00" : "blue";
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
  let bh = (h - 30) / 2;
  ctx.fillStyle = oceanBackground;
  // top border of computer area:
  ctx.fillRect(0, 0, w, bh);
  // bottom border of user area:


  // removed code '+ bombRadius' for smaller dividing rectangle
  ctx.fillRect(0, bh + 10, w, h);



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
  populateShipReport()
}

function damage(xs, ys, xb, yb, size, radius) {
  let distance = dist(xs, ys, xb, yb);
  let close = distance < (radius + size);
  let damage = close ? firePower : 0;
  return damage;
}

function placeShips() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - 30) / 2;
  for (let ship of state.cShips) {
    ship.x = Math.random() * w;
    ship.y = Math.random() * bh;
  };
  for (let ship of state.pShips) {
    ship.x = Math.random() * w;
    ship.y = h/2 + 30 + Math.random() * bh;
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
    message += `My bomb explodes at (${Math.round(x)}, ${Math.round(y)}). `
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
  return {hit: hit, message : message};
}

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
      drawCircle(cPos.x, cPos.y, bombRadius);
      let computerResults = assessDamages(cPos.x, cPos.y, bombRadius);
      hit = computerResults.hit;
      message += `<br>${computerResults.message}`;
      state.cShots.push({x: cPos.x, y: cPos.y, r : bombRadius, hit: hit});
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

// Ball Div follows mouse

// These event listeners keep track of whether the mouse is on the canvas.
// In a subsequent event listener we will set the ball visibility to 
// hidden or visible, depending on whether or not we are in the canvas.
let mouseOnCanvas = false;
canvas.addEventListener("mouseover", function (){
  console.log("entered canvas");
  mouseOnCanvas = true;
});
canvas.addEventListener("mouseout", function (){
  console.log("exited canvas");
  mouseOnCanvas = false;
});

// this listener makes the ball follow the mouse:
window.addEventListener('mousemove', function (e) {
  let x = e.clientX || e.pageX;
  let y = e.clientY || e.pageY;

  const ball = document.getElementById('ball');
  ball.style.width = `${parseInt(2 * bombRadius)}px`;
  ball.style.height = `${parseInt(2 * bombRadius)}px`;
  // I messed around a bit and found that an extra 8 pixels
  // makes the following ball center on the mouse:
  ball.style.left = `${parseInt(x - bombRadius - 8)}px`;
  ball.style.top = `${parseInt(y - bombRadius) - 8}px`;
  // make sure no margins or padding puts the ball off-center:
  ball.style.margin = "0px";
  ball.style.padding = "0px";
  // check the global vartiable mouseOnCanvas
  // to determine whether to show the ball.
  // Note that the ball will show, and shots are recorded,
  // even if the user is in his/her own ocean.  If we want
  // this behavior, should be not also make it possible
  // to damage one's own ship?
  ball.style.visibility = mouseOnCanvas ? "visible" : "hidden";
});


