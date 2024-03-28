// I have a 100 by 100 field
function makeGrid(fieldWidth, fieldLength, nl, nw) {
  let pieceWidth = fieldWidth / nw;
  let pieceLength = fieldLength / nl;
  let arrW = [];
  let arrL = [];
  let placeW = 0;
  for (let i = 0; i < nw; i ++) {
    arrW[i] = placeW;
    placeW += pieceWidth;
  }
  let placeL = 0;
  for (let i = 0; i < nw; i ++) {
    arrL[i] = placeL;
    placeL += pieceLength;
  }
  let cells = [];
  for (let i = 0; i < arrW.length; i++) {
    for (let j = 0; j < arrL.length; j++) {
      cells.push({
        x: arrW[i],
        y: arrL[j],
        ships: [],
        shotAt: 0
      });
    }
  }
  return cells;
}

console.log(makeGrid(100, 100, 10, 10));

const numb = 112.3467;
console.log(Math.round(numb * 100) / 100);
console.log(numb.toFixed(3));