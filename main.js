/*************************************************
 * setup
 *************************************************/

// parameters
const spaceBetweenOceans = 10;
const gameBackground = "white";
const oceanBackground = "#61cffa";
const shotMissColor = "white";
const shotHitColor = "red";
const maxDamage = 2 + 3 + 5;
const maxAttackShots = 6;
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
// for debugging:
// const shipCapacities = {
//   Destroyer: 0.01,
//   Cruiser: 0.01,
//   Battleship: 0.01
// };
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
canvas.addEventListener("click", processUserShot);

// Ball Div follows mouse
// (Dr. White modifies Samuel's implementation.)

// These event listeners keep track of whether the mouse is on the canvas.
// In a subsequent event listener we will set the ball visibility to 
// hidden or visible, depending on whether or not we are in the canvas.
let mouseOnCanvas = false;
canvas.addEventListener("mouseover", function (){
  mouseOnCanvas = true;
});
canvas.addEventListener("mouseout", function (){
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
  ball.style.visibility = mouseOnCanvas & !state.winner & !state.roundInProcess ? "visible" : "hidden";
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

const bombDamageSlider = document.getElementById("shotPower");

// the following globals will be changed at game outset:
let maxBombRadius = 100;
let bombRadius = 40;
let firePower = 3;
let computerBombRadius;
let narrativeContents = "";

function lethalityFromRadius(r) {
  return (-5/maxBombRadius) * r + 5;
}


function radiusFromLethality(l) {
  return maxBombRadius - maxBombRadius / 5 * l;
}

bombDamageSlider.addEventListener("input", function() {
  lethality = parseFloat(this.value);
  bombRadius = radiusFromLethality(lethality);
  bombDamageSlider.value = lethality;
  document.getElementById("shotPowerDisplay")
    .innerText = lethality.toFixed(2);

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
  bombDamageSlider.max = 5;
  bombDamageSlider.min = 0.01;
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
  attackShots: 0,
  // does computer need to repeat its previous shot?
  repeatShot: false,
  roundInProcess : false
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

function drawAnimatedCircle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.stroke();
}

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
  ctx.fillRect(0, bh + spaceBetweenOceans, w, h);

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

function computerSearch() {
  // simple choice for now:
  computerBombRadius = maxBombRadius;
  let candidateNumber = 200;
  let N = 1500;
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let candidates = [];
  for (i = 1; i <= candidateNumber; i++) {
    let newSpot = false;
    let x, y;
    while (!newSpot) {
      x = w * Math.random();
      let int = h / 2 + spaceBetweenOceans / 2;
      let slope = h / 2 - spaceBetweenOceans / 2;
      y = slope * Math.random() + int;
      const closePreviousShots = state.cShots.filter(function(shot) {
        let distance = dist(x, y, shot.x, shot.y);
        return distance < shot.r;
      });
      if (closePreviousShots.length === 0) {
        newSpot = true;
      }
    }
    let inRadius = 0;
    let uncovered = 0;
    for (j = 1; j <= N; j++) {
      let x1 = x + (2 * Math.random() - 1) * computerBombRadius;
      let y1 = y + (2 * Math.random() - 1) * computerBombRadius;
      let d = dist(x, y, x1, y1);
      if (d > computerBombRadius) {
        continue;
      }
      inRadius++;
      if (x1 < 0 || x1 > w) {
        continue;
      }
      if (y1 < h / 2 + spaceBetweenOceans / 2 || y1 > h) {
        continue;
      }
      let closePrev = state.cShots.filter(function(shot) {
        let distance = dist(x1, y1, shot.x, shot.y);
        return distance < shot.r;
      });
      if (closePrev.length === 0) {
        uncovered++;
      }
    }
    let propUncovered = uncovered / inRadius;
    candidates.push({x : x, y : y, propUncovered : propUncovered});
  }
  
  const best = candidates.reduce((max, current) => {
    return current.propUncovered > max.propUncovered ? current : max;
  }, candidates[0]);

  return({x: best.x, y : best.y, r: computerBombRadius})
}

function computerDestroy () {
  // amount to allow test-point to be outside search-circle:
  let fudge = 0;

  let hit = state.destroyShots[0];
  let searchRadius = hit.r;
  r = Math.min(searchRadius * 0.75, radiusFromLethality(1));
  let maxDistFromCenter = searchRadius - r;
  computerBombRadius = r;
  let candidateNumber = 200;
  let N = 1500;
  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  let candidates = [];
  for (i = 1; i <= candidateNumber; i++) {
    let x, y;
    let ok = false;
    while (!ok) {
      x = hit.x + (2 * Math.random() - 1) * searchRadius;
      y = hit.y + (2 * Math.random() - 1) * searchRadius;
      let d = dist(hit.x, hit.y, x, y);
      if (d < maxDistFromCenter) {
        ok = true;
      }
    }
    let inRadius = 0;
    let useful = 0;
    for (j = 1; j <= N; j++) {
      let x1 = x + (2 * Math.random() - 1) * r;
      let y1 = y + (2 * Math.random() - 1) * r;
      let d = dist(x, y, x1, y1);
      if (d > r) {
        continue;
      }
      inRadius++;
      let d2 = dist(hit.x, hit.y, x1, y1);
      if (d2 > searchRadius + fudge) {
        continue;
      }
      if (x1 < 0 || x1 > w) {
        continue;
      }
      if (y1 < h / 2 + spaceBetweenOceans / 2 || y1 > h) {
        continue;
      }
      if (state.destroyShots.length == 1) {
        useful++;
        continue;
      }
      let closePrev = state.destroyShots.filter(function(shot) {
        let distance = dist(x1, y1, shot.x, shot.y);
        return distance < shot.r;
      });
      if (closePrev.length === 0) {
        useful++;
      }
    }
    let propUseful = useful / inRadius;
    candidates.push({x : x, y : y, propUseful : propUseful});
  }
  // for debugging:
  // for (let c of candidates) {
  //   drawFilledCircle(c.x, c.y, 2, 3, true);
  // }
  const best = candidates.reduce((max, current) => {
    return current.propUseful > max.propUseful ? current : max;
  }, candidates[0]);
  return {x : best.x, y : best.y, r : r};
}
  
  

function computerShot() {

  if (state.repeatShot) {
    let s = state.cShots[state.cShots.length - 1];
    let shot = {x: s.x, y: s.y, r: s.r};
    state.repeatShot = false;
    return(shot);
  }

  if (state.destroyShots.length > 0) { 
    return computerDestroy();
  } else { 
    // if no previous hit then carry out random search:
    return computerSearch();
  }
}

function assessDamages(x, y, radius) {
  let hit = false;
  let message = "";
  let totalDamage = 0;
  if (state.shooting == "u") {
    let ships = state.cShips.filter(s => s.damage < s.capacity);
    for (let ship of ships) {
      let d = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (d.close) {
        hit = true;
        ship.damage += d.damage;
        totalDamage += d.damage;
        message += `You hit my ${ship.type}. `;
      }
      if (ship.damage >= ship.capacity) {
        message += `You sunk my ${ship.type}! `;
      }
    }
    if (!hit) {
      message += "You did not hit anything."
      let h = canvas.clientHeight;
      if (y > h / 2 - spaceBetweenOceans / 2 + radius) {
        message += " Surely you jest!";
      }
    }
  } else {
    let ships;
    let attacking = state.shipsUnderAttack.length > 0;
    if (attacking) {
      state.attackShots +=1;
      ships = state.shipsUnderAttack;
      // NOTE:  we are assuming that while in destroy-mode
      // no part of the shot goes outside of the search-area
    } else {
      ships = state.pShips.filter(s => s.damage < s.capacity);
    }
    for (let ship of ships) {
      let shotPushed = false;
      let d = damage(ship.x, ship.y, x, y, ship.size, radius);
      if (d.close) {
        hit = true;
        if (!shotPushed) {
          state.destroyShots.push({ x: x, y: y, r : radius});
          shotPushed = true;
        }
        if (!attacking) {
          state.shipsUnderAttack.push(ship);
        }
        ship.damage += d.damage;
        totalDamage += d.damage;
        message += `I hit your ${ship.type}. `;
        //uHit.play();
        //createHitShotDiv();
        if (ship.damage >= ship.capacity) {
          message += `I sunk your ${ship.type}! `;
          //createUShipSunkDiv();
          //drawShip(ship.x, ship.y, ship.size, true);
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
      if (state.attackShots >= maxAttackShots) {
        // give up and go back to searching:
        state.shipsUnderAttack = [];
        state.destroyShots = [];
      }
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
  if (playerDoneFor) {
    state.winner = "c";
  }
  if (computerDoneFor) {
    state.winner = "u";
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


function processUserShot(event) {
  if (state.roundInProcess) {
    return null;
  }
  if (state.winner) {
    return null;
  }
  state.roundInProcess = true;
  document.getElementById("ball").style.visibility = "hidden";
  state.shooting = "u";
  const div = document.getElementById("comp-results-display");
  div.innerHTML = "";
  div.style.display = "none";
  let pos = getMousePos(canvas, event);
  let userResults = assessDamages(pos.x, pos.y, bombRadius);
  let hit = userResults.hit;
  let damage = userResults.damage;
  let narrativeContents = userResults.message;
  state.pShots.push(
    {x: pos.x, y: pos.y, r : bombRadius, hit: hit, damage: damage}
  );

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  let radius = 5;
  function animateShot() {
    if (radius <= bombRadius) {
        radius += 2; // Adjust the expansion rate as needed
        requestAnimationFrame(animateShot); //tell window that animation will be used
        drawAnimatedCircle(clickX, clickY, radius);
    }
  }
  animateShot();
  setTimeout(postUserShot, 800, userResults);

}

function postUserShot(results) {
  const div = document.getElementById("results-display");
  div.innerHTML = results.message;
  checkForWinner();
  div.style.display = "block";
  if (state.winner) {
    div.innerHTML += "<br>You sunk all my ships.  You win!";
    uWin.play();
    drawOcean();
    return null;
  } 
  if (results.hit){
    cHit.play();
  }
  drawOcean();
  setTimeout(processComputerShot, 1000);
}

function processComputerShot() {
  state.shooting = "c";
  const div = document.getElementById("results-display");
  div.innerHTML = "";
  div.style.display = "none";
  let cShot = computerShot();
  let cRadius = 5;

  let computerResults = assessDamages(cShot.x, cShot.y, cShot.r);
  let hit = computerResults.hit;
  let damage = computerResults.damage;
  narrativeContents += `<br>${computerResults.message}`;
  state.cShots.push(
    {x: cShot.x, y: cShot.y, r : cShot.r, hit: hit, damage: damage}
  );

  function animateComputerShot() {
    if (cRadius < computerBombRadius) {
          cRadius += 2; 
          requestAnimationFrame(animateComputerShot);
          drawAnimatedCircle(cShot.x, cShot.y, cRadius);
      }
    }
  animateComputerShot();
  setTimeout(postComputerShot, 800, computerResults);
}

function postComputerShot(results) {
  drawOcean();
  checkForWinner();
  div = document.getElementById("comp-results-display");
  div.innerHTML = results.message;
  if (state.winner && state.winner == "c") {
    div.innerHTML += "<br>I sunk all your ships! I win!";
  }
  console.log(div.innerHTML);
  div.style.display = "block";
  if (state.winner && state.winner == "c") {
    uLose.play();
    
    return null;
  }
  if (results.hit) {
    uHit.play();
  }
  function transition() {
    div.style.display = "none";
    document.getElementById("ball").style.visibility = "visible";
    state.roundInProcess = false;
  }
  if (!state.winner) {
    setTimeout(transition, 1000);
  }
}



// UI team button stuff
// See 113 for other UI stuff

// First button (settings):
let buttonGear = document.getElementById("button-gear");
let menuDiv = document.getElementById("menuContainer");

// Second button (sliders):
let sliderButton = document.getElementById("button-slider");
let sliderMenu = document.getElementById("slider-menu");


let openClose = function(openContainer) {
  if (openContainer.style.display == "" || openContainer.style.display == "none") {
    openContainer.style.display = "grid";
  } else {
    openContainer.style.display = "none";
  }
}
window.addEventListener('resize', resizeCanvas);

buttonGear.addEventListener("click", function() {
  openClose(menuDiv);
});

sliderButton.addEventListener("click", function() {
  openClose(sliderMenu);
});


