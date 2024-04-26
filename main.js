/*************************************************
 * setup
 *************************************************/

// parameters
const spaceBetweenOceans = 30;
const gameBackground = "white";
const oceanBackground = "#61cffa";
const shotMissColor = "white";
const shotHitColor = "red";
const maxDamage = 2 + 3 + 5;
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
// initialize sound effects
const uWin = new Audio("Sounds/uWin.mp3");
const uLose = new Audio("Sounds/uLoseAlt.mp3");
const uHit = new Audio("Sounds/uHit.mp3");
const cHit = new Audio("Sounds/cHit.mp3");

// html elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.addEventListener("click", processRound);

// Ball Div follows mouse
// (Dr. White modifies Samuel's implementation.)

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
  ball.style.left = `${parseInt(x - bombRadius)}px`;
  ball.style.top = `${parseInt(y - bombRadius)}px`;
  // make sure no margins or padding puts the ball off-center:
  ball.style.margin = "0px";
  ball.style.padding = "0px";
  ball.style.visibility = mouseOnCanvas & !state.winner ? "visible" : "hidden";
});

const pHistory = document.getElementById("user-shots");
pHistory.addEventListener("change", drawOcean);

const cHistory = document.getElementById("computer-shots");
cHistory.addEventListener("change", drawOcean);

const shipReport = document.getElementById("ship-report");
const narrative = document.getElementById("narrative");

const audio = document.getElementById("audio-preference");
audio.addEventListener("change", function() { // set volume of sound effects when user changes preference
  uWin.volume = audio.checked ? 0.01 : 0;
  uLose.volume = audio.checked ? 0.5 : 0;
  uHit.volume = audio.checked ? 0.01 : 0;
  cHit.volume = audio.checked ? 0.025 : 0;
});
window.addEventListener("DOMContentLoaded", function() { // set volume of sound effects when page loads
  uWin.volume = audio.checked ? 0.01 : 0;
  uLose.volume = audio.checked ? 0.5 : 0;
  uHit.volume = audio.checked ? 0.01 : 0;
  cHit.volume = audio.checked ? 0.025 : 0;
});

const bombRadiusSlider = document.getElementById("shotSize");
const bombDamageSlider = document.getElementById("shotPower");

// the following globals will be changed at game outset:
let maxBombRadius = 100;
let bombRadius = 40;
let firePower = 3;
let computerBombRadius;

function lethalityFromRadius(r) {
  return (-5/maxBombRadius) * r + 5;
}


function radiusFromLethality(l) {
  return maxBombRadius - maxBombRadius / 5 * l;
}

bombRadiusSlider.addEventListener("input", function() {
  bombRadius = parseFloat(this.value);
  lethality = lethalityFromRadius(bombRadius);
  bombDamageSlider.value = lethality;
  bombRadiusSlider.value = bombRadius;

  const ballElement = document.getElementById('ball');
  ballElement.style.height = 2 * bombRadius + 'px';
  ballElement.style.width = 2 * bombRadius + 'px';
  ballElement.style.marginTop = -bombRadius + 'px';
  ballElement.style.marginLeft = -bombRadius + 'px';
 
  document.getElementById("shotPowerDisplay")
    .innerText = lethality.toFixed(2);
  document.getElementById("shotSizeDisplay")
    .innerText = `${bombRadius.toFixed(1)}%`;
});

bombDamageSlider.addEventListener("input", function() {
  lethality = parseFloat(this.value);
  bombRadius = radiusFromLethality(lethality);
  bombRadiusSlider.value = bombRadius;
  bombDamageSlider.value = lethality;
  document.getElementById("shotPowerDisplay")
    .innerText = lethality.toFixed(2);
  document.getElementById("shotSizeDisplay")
    .innerText = `${bombRadius.toFixed(1)}%`;

  const ballElement = document.getElementById('ball');
  ballElement.style.height = 2 * bombRadius + 'px';
  ballElement.style.width = 2 * bombRadius + 'px'; 
  ballElement.style.marginTop = -bombRadius + 'px';
  ballElement.style.marginLeft = -bombRadius + 'px';
});

// UI team: canvas resizing function
// See line 198 for called function and 665 for button stuff

let screenBox = document.getElementById("screen-box");

function resizeCanvas() {
  canvas.width = screenBox.clientWidth - 10;
  canvas.height = screenBox.clientHeight - 10;
  // set maximum bomb radius:
  maxBombRadius = canvas.width * 0.125;
  bombRadiusSlider.max = radiusFromLethality(0.01);
  bombRadiusSlider.min = radiusFromLethality(5);
  bombDamageSlider.max = 5;
  bombDamageSlider.min = 0.01;
  bombRadiusSlider.value = radiusFromLethality(0.01);
  bombDamageSlider.value = 0.01;
  bombRadius = radiusFromLethality(0.01);
}

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
  cShots: [],
  // array to hold shot that finds new ships, plus
  // subsequent shots taken to destroy said ships:
  destroyShots: [],
  // array to hold ships to be attacked:
  shipsUnderAttack: [],
  // does computer need to repeat its previous shot?
  repeatShot: false
};

/*************************************************
 * run game
 *************************************************/

resizeCanvas();

populateNarrative(
  `Shoot by clicking in my field (upper half).<br>
  I will shoot back.`
);
placeShips();
drawOcean();


/***********************************
 * utitlity functions
 ***********************************/

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  let radius = 5;
  function animateShot() {
    if (radius <= bombRadius) {
        radius += 2; // Adjust the expansion rate as needed
        requestAnimationFrame(animateShot); //tell window that animation will be used
        drawFilledCircle(clickX, clickY, radius, 0, false);
    }
  }
  animateShot();
});

function drawFilledCircle(x, y, r, damage, hit) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  let opacity = hit ? Math.max(damage / maxDamage, 0.1) : 0;
  ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
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
  let bh = (h - spaceBetweenOceans) / 2;
  ctx.fillStyle = oceanBackground;
  // top border of computer area:
  ctx.fillRect(0, 0, w, bh);
  // bottom border of user area:


  // removed code '+ bombRadius' for smaller dividing rectangle
  ctx.fillRect(0, bh + 10, w, h);



  // user shots (if requested):
  if (pHistory.checked) {
    for (let shot of state.pShots) {
      drawFilledCircle(shot.x, shot.y, shot.r, shot.damage, shot.hit);
    }
  }
  // user shots (if requested):
  if (cHistory.checked) {
    for (let shot of state.cShots) {
      drawFilledCircle(shot.x, shot.y, shot.r, shot.damage, shot.hit);
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
  let damage = close ? lethalityFromRadius(radius) : 0;
  return {damage : damage, close : close};
}

function placeShips() {
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let bh = (h - spaceBetweenOceans) / 2;
  let goodPlacementC = false;
  let goodPlacementP = false;
  
  // computer ships
  while(!goodPlacementC) {
    for (let ship of state.cShips) {
      ship.x = Math.random() * w;
      ship.y = Math.random() * bh;
  }
  let padding = 5;
  let farEnoughC = true;
  let farEnoughFromWallC = true;
  for (let ship of state.cShips) {
    // check if ship is to close to wall
    // compares size and position to see if the ship is to close to the wall
    if (ship.x - ship.size < padding || ship.x + ship.size > w - padding) {
      farEnoughFromWallC = false;
    } else if (ship.y - ship.size < padding || ship.y + ship.size > h - padding) {
      farEnoughFromWallC = false;
  } 
    let otherShipsC = state.cShips.filter(s => s !== ship);
      for(let os in otherShipsC) {
        let d = dist(ship.x ,ship.y ,os.x ,os.y);
        if (d < ship.size + os.size) {
          farEnoughC = false;
        }
      }
  }
  goodPlacementC = farEnoughC && farEnoughFromWallC;
}

  // player ships
  while(!goodPlacementP) {
    for (let ship of state.pShips) {
      ship.x = Math.random() * w;
      ship.y = h/2 + spaceBetweenOceans / 2 + Math.random() * bh;
  }
  let farEnoughP = true;
  let farEnoughFromWallP = true;
  for (let ship of state.pShips) {
  
    if (ship.x - ship.size < 0 || ship.x + ship.size > w) {
      farEnoughFromWallP = false;
    } else if (ship.y - ship.size < 0 || ship.y + ship.size > h) {
      farEnoughFromWallP = false;
  } 
    let otherShipsP = state.pShips.filter(s => s !== ship);
      for(let os in otherShipsP) {
        let d = dist(ship.x ,ship.y ,os.x ,os.y);
        if (d < ship.size + os.size) {
          farEnoughP = false;
        }
      }
  }
  goodPlacementP = farEnoughP && farEnoughFromWallP;
  }
}

/*****************************************
 * new computer-shot functions
 ******************************************/

function computerShot() {
  function search() {
    // simple choice for now:
    computerBombRadius = maxBombRadius;
  
    let newSpot = false;
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    let bh = (h - spaceBetweenOceans) / 2;
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

  if (state.repeatShot) {
    let s = state.cShots[state.cShots.length - 1];
    let shot = {x: s.x, y: s.y, r: s.r};
    state.repeatShot = false;
    return(shot);
  }

  if (state.destroyShots.length > 0) { 
    // find the search-circle 
    // (circle in which to search for ships detected but
    // not yet sunk):
    let hit = state.destroyShots[0];
    // get the radius of the circle in which to search:
    let searchRadius = hit.r;
    // select a radius so that >=1 unit of damage is done on a hit,
    // and is less than half the radius of search-circle:
    r = Math.min(searchRadius * 0.5, radiusFromLethality(1));
    computerBombRadius = r;
    // so that new shot does not go outside the search-circle,
    // its center should be no further than this amount
    // from the center of the search-circle:
    let maxFromCenter = searchRadius - r;
    // place the new shot randomly within the search-circle:
    let x, y, angle;
    angle = Math.random() * 2 * Math.PI;
    x = hit.x + maxFromCenter * Math.cos(angle);
    y = hit.y + maxFromCenter * Math.sin(angle);
    return {x : x, y : y, r : r};
  } else { 
    // if no previous hit then carry out random search:
    return search();
  }
}

function assessDamages(x, y, radius) {
  let hit = false;
  let message = "";
  let totalDamage = 0;
  if (state.shooting == "u") {
    message += `Your bomb explodes at (${Math.round(x)}, ${Math.round(y)}). `
    let ships = state.cShips.filter(s => s.damage < s.capacity);
    for (let ship of ships) {
      let d = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (d.close) {
        hit = true;
        ship.damage += d.damage;
        totalDamage += d.damage;
        message += `You hit my ${ship.type}. `;
        cHit.play();
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
    message += `My bomb explodes at (${Math.round(x)}, ${Math.round(y)}). `;
    let ships;
    let attacking = state.shipsUnderAttack.length > 0;
    if (attacking) {
      ships = state.shipsUnderAttack;
      // NOTE:  we are assuming that while in destroy-mode
      // no part of the shot goes outside of the search-area
    } else {
      ships = state.pShips.filter(s => s.damage < s.capacity);
    }
    for (let ship of ships) {
      let d = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (d.close) {
        hit = true;
        state.destroyShots.push({ x: x, y: y, r : radius});
        if (!attacking) {
          state.shipsUnderAttack.push(ship);
        }
        ship.damage += d.damage;
        totalDamage += d.damage;
        message += `I hit your ${ship.type}. `;
        uHit.play();
        if (ship.damage >= ship.capacity) {
          message += `I sunk your ${ship.type}! `;
          drawShip(ship.x, ship.y, ship.size, true);
          state.shipsUnderAttack = state.shipsUnderAttack
            .filter(s => s !== ship);
          if (state.shipsUnderAttack.length === 0) {
            state.destroyShots = [];
          }
        } else {
          if (attacking) {
            state.repeatShot = true;
          }
        }
      }
    }
    if (!hit) {
      message += "I did not hit anything."
    }
  }
  console.log(message);
  return {hit: hit, damage : totalDamage, message : message};
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
        <td>${state.pShips[i].damage.toFixed(2)}</td>
        <td>${state.cShips[i].damage.toFixed(2)}</td>
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

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function processRound(event) {
  checkForWinner();
  if (!state.winner) {
    let pos = getMousePos(canvas, event);
    let userResults = assessDamages(pos.x, pos.y, bombRadius);
    let hit = userResults.hit;
    let damage = userResults.damage;
    let message = userResults.message;
    state.pShots.push(
      {x: pos.x, y: pos.y, r : bombRadius, hit: hit, damage: damage}
    );
    //sleep(2000);
    state.shooting = "c";
    checkForWinner();
    if (!state.winner) {
      let cShot = computerShot();
      let cRadius = 5;

      function animateComputerShot() {
        if (cRadius < computerBombRadius) {
          cRadius += 2; //adjust the expansion rate as needed
          requestAnimationFrame(animateComputerShot); //tells window that animation will be used
          drawFilledCircle(cShot.x, cShot.y, cRadius, 0, false);
        }
      }
      animateComputerShot();
      let computerResults = assessDamages(cShot.x, cShot.y, cShot.r);
      hit = computerResults.hit;
      let damage = computerResults.damage;
      message += `<br>${computerResults.message}`;
      state.cShots.push(
        {x: cShot.x, y: cShot.y, r : cShot.r, hit: hit, damage: damage}
      );
      state.shooting = "u";
      checkForWinner();
    }
    if (state.winner) {
      if (state.winner == "u") {
        message += `<br>You sunk all my ships.  You win!`;
        uWin.play();
      } else {
        message += `<br>I sunk all your ships.  I win!`;
        uLose.play();
      }
    }
    populateShipReport();
    populateNarrative(message);
    window.setTimeout(drawOcean, 2000);
  }
}



// UI team button function
// See 113 for other UI stuff
let buttonGear = document.getElementById("button-gear");
let menuDiv = document.getElementById("menu-container");
let openClose = function() {
  if (menuDiv.style.display == "" || menuDiv.style.display == "none") {
    menuDiv.style.display = "flex";
  } else {
    menuDiv.style.display = "none";
  }
}

window.addEventListener('resize', resizeCanvas);
buttonGear.addEventListener("click", openClose);
