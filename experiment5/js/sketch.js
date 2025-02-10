let cubes = [];
let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;
let easing = 0.1;

// Auto–move globals (for scramble/solve)
let currentMove = null;   // Currently animated move
let moveQueue = [];       // Queue for auto–moves (scramble/solve)
let scrambleMoves = [];   // Stores the scramble moves so we can invert them

// Flags for scramble/solve status
let wasScrambled = false;
let solvedAfterScramble = false;

// Explosion globals
let explosionActive = false;

function setup() {
  createCanvas(400, 400, WEBGL);
  // Initialize the cubes in solved state.
  initCubes();
  // Create UI buttons beneath the canvas.
  createUI();
}

function draw() {
  background(30);
  lights();
  
  // Smoothly interpolate global view rotations.
  rotX += (targetRotX - rotX) * easing;
  rotY += (targetRotY - rotY) * easing;
  rotateX(rotX);
  rotateY(rotY);
  
  // If explosion is active, update each cube’s position.
  if (explosionActive) {
    for (let cube of cubes) {
      cube.pos.add(cube.explosionVelocity);
      cube.explosionVelocity.mult(0.99); // Apply friction.
    }
  } else {
    // Process auto–moves (scramble/solve) only if not exploding.
    if (currentMove === null && moveQueue.length > 0) {
      currentMove = moveQueue.shift();
    }
  
    if (currentMove !== null) {
      currentMove.currentAngle += currentMove.speed;
      if (currentMove.currentAngle >= currentMove.targetAngle - 0.001) {
        currentMove.currentAngle = currentMove.targetAngle;
        // Finalize the move by updating each affected cube.
        for (let cube of cubes) {
          if (isCubeInMove(cube, currentMove)) {
            cube.rotateAround(currentMove.axis, currentMove.direction);
            cube.rotateFaces(currentMove.axis, currentMove.direction);
          }
        }
        currentMove = null;
      }
    }
  }
  
  // Draw all cubes.
  for (let cube of cubes) {
    if (currentMove !== null && isCubeInMove(cube, currentMove)) {
      drawCubeWithMove(cube, currentMove);
    } else {
      cube.show();
    }
  }
  
  // When auto–moves have finished and the cube was solved after a scramble,
  // trigger the explosion.
  if (!explosionActive && currentMove === null && moveQueue.length === 0 && solvedAfterScramble) {
    triggerExplosion();
    solvedAfterScramble = false; // Reset flag so explosion happens only once.
  }
}

// Initialize cubes to a solved state.
function initCubes() {
  cubes = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubes.push(new Cube(x, y, z));
      }
    }
  }
}

// Reset the cube back to its initial solved state.
function resetCube() {
  initCubes();
  currentMove = null;
  moveQueue = [];
  scrambleMoves = [];
  wasScrambled = false;
  solvedAfterScramble = false;
  explosionActive = false;
  targetRotX = 0;
  targetRotY = 0;
  rotX = 0;
  rotY = 0;
}

// ─── Cube Class ─────────────────────────────────────────────
// Each Cube stores its logical grid position, face colors (stickers),
// and an explosion velocity.
class Cube {
  constructor(gridX, gridY, gridZ) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.gridZ = gridZ;
    this.pos = createVector(gridX * 50, gridY * 50, gridZ * 50);
    // Solved state stickers:
    // Front (F, +z): red, Back (B, -z): orange,
    // Right (R, +x): blue, Left (L, -x): green,
    // Up (U, -y): white, Down (D, +y): yellow.
    this.faces = {
      F: [255, 0, 0],
      B: [255, 165, 0],
      R: [0, 0, 255],
      L: [0, 255, 0],
      U: [255, 255, 255],
      D: [255, 255, 0]
    };
    // For explosion animation.
    this.explosionVelocity = createVector(0, 0, 0);
  }
  
  // Update grid position after a 90° rotation.
  rotateAround(axis, direction) {
    let temp;
    if (axis === 'X') {
      temp = this.gridY;
      this.gridY = direction * this.gridZ;
      this.gridZ = -direction * temp;
    } else if (axis === 'Y') {
      temp = this.gridX;
      this.gridX = direction * this.gridZ;
      this.gridZ = -direction * temp;
    } else if (axis === 'Z') {
      temp = this.gridX;
      this.gridX = direction * this.gridY;
      this.gridY = -direction * temp;
    }
    this.pos.set(this.gridX * 50, this.gridY * 50, this.gridZ * 50);
  }
  
  // Permanently update the face colors (stickers) after a rotation.
  rotateFaces(axis, direction) {
    if (axis === 'X') {
      // Rotation about the X-axis cycles U, F, D, and B.
      if (direction === 1) {
        let temp = this.faces.U;
        this.faces.U = this.faces.F;
        this.faces.F = this.faces.D;
        this.faces.D = this.faces.B;
        this.faces.B = temp;
      } else {
        let temp = this.faces.U;
        this.faces.U = this.faces.B;
        this.faces.B = this.faces.D;
        this.faces.D = this.faces.F;
        this.faces.F = temp;
      }
    } else if (axis === 'Y') {
      // Rotation about the Y-axis cycles F, L, B, and R.
      if (direction === 1) {
        let temp = this.faces.F;
        this.faces.F = this.faces.L;
        this.faces.L = this.faces.B;
        this.faces.B = this.faces.R;
        this.faces.R = temp;
      } else {
        let temp = this.faces.F;
        this.faces.F = this.faces.R;
        this.faces.R = this.faces.B;
        this.faces.B = this.faces.L;
        this.faces.L = temp;
      }
    } else if (axis === 'Z') {
      // Rotation about the Z-axis cycles U, L, D, and R.
      if (direction === 1) {
        let temp = this.faces.U;
        this.faces.U = this.faces.L;
        this.faces.L = this.faces.D;
        this.faces.D = this.faces.R;
        this.faces.R = temp;
      } else {
        let temp = this.faces.U;
        this.faces.U = this.faces.R;
        this.faces.R = this.faces.D;
        this.faces.D = this.faces.L;
        this.faces.L = temp;
      }
    }
  }
  
  // Draw the cube at its current position using its stickers.
  show() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    drawColoredBox(this.faces);
    pop();
  }
}

// ─── Drawing Functions ──────────────────────────────────────────

// Draw a cube (half–size 25) with the given face colors.
function drawColoredBox(faces) {
  push();
  stroke(0);
  strokeWeight(2);
  
  // Front face (+z)
  fill(...faces.F);
  beginShape();
  vertex(-25, -25, 25);
  vertex(25, -25, 25);
  vertex(25, 25, 25);
  vertex(-25, 25, 25);
  endShape(CLOSE);
  
  // Back face (-z)
  fill(...faces.B);
  beginShape();
  vertex(-25, -25, -25);
  vertex(25, -25, -25);
  vertex(25, 25, -25);
  vertex(-25, 25, -25);
  endShape(CLOSE);
  
  // Right face (+x)
  fill(...faces.R);
  beginShape();
  vertex(25, -25, -25);
  vertex(25, -25, 25);
  vertex(25, 25, 25);
  vertex(25, 25, -25);
  endShape(CLOSE);
  
  // Left face (-x)
  fill(...faces.L);
  beginShape();
  vertex(-25, -25, -25);
  vertex(-25, -25, 25);
  vertex(-25, 25, 25);
  vertex(-25, 25, -25);
  endShape(CLOSE);
  
  // Up face (-y)
  fill(...faces.U);
  beginShape();
  vertex(-25, -25, -25);
  vertex(25, -25, -25);
  vertex(25, -25, 25);
  vertex(-25, -25, 25);
  endShape(CLOSE);
  
  // Down face (+y)
  fill(...faces.D);
  beginShape();
  vertex(-25, 25, -25);
  vertex(25, 25, -25);
  vertex(25, 25, 25);
  vertex(-25, 25, 25);
  endShape(CLOSE);
  
  pop();
}

// Draw a cube that is part of an animated move (rotating layer).
function drawCubeWithMove(cube, move) {
  push();
  let pivot;
  if (move.axis === 'X') {
    pivot = createVector(move.index * 50, 0, 0);
    translate(pivot.x, pivot.y, pivot.z);
    rotateX(move.direction * move.currentAngle);
  } else if (move.axis === 'Y') {
    pivot = createVector(0, move.index * 50, 0);
    translate(pivot.x, pivot.y, pivot.z);
    rotateY(move.direction * move.currentAngle);
  } else if (move.axis === 'Z') {
    pivot = createVector(0, 0, move.index * 50);
    translate(pivot.x, pivot.y, pivot.z);
    rotateZ(move.direction * move.currentAngle);
  }
  translate(cube.pos.x - pivot.x, cube.pos.y - pivot.y, cube.pos.z - pivot.z);
  drawColoredBox(cube.faces);
  pop();
}

// Returns true if the cube is in the moving layer.
function isCubeInMove(cube, move) {
  if (move.axis === 'X' && cube.gridX === move.index) return true;
  if (move.axis === 'Y' && cube.gridY === move.index) return true;
  if (move.axis === 'Z' && cube.gridZ === move.index) return true;
  return false;
}

// ─── AUTO–MOVES: Scramble & Solve ──────────────────────────

// Convert a face move (by label) and direction (1 or -1) into a move object.
function createMove(face, dir) {
  let move = { currentAngle: 0, targetAngle: HALF_PI, speed: 0.1 };
  switch(face) {
    case 'F':
      move.axis = 'Z';
      move.index = 1;
      move.direction = dir;
      break;
    case 'B':
      move.axis = 'Z';
      move.index = -1;
      move.direction = -dir;
      break;
    case 'U':
      move.axis = 'Y';
      move.index = -1;
      move.direction = dir;
      break;
    case 'D':
      move.axis = 'Y';
      move.index = 1;
      move.direction = -dir;
      break;
    case 'R':
      move.axis = 'X';
      move.index = 1;
      move.direction = dir;
      break;
    case 'L':
      move.axis = 'X';
      move.index = -1;
      move.direction = -dir;
      break;
  }
  return move;
}

function scrambleCube() {
  if (currentMove !== null || moveQueue.length > 0) return;
  scrambleMoves = [];
  let faces = ['F', 'B', 'U', 'D', 'R', 'L'];
  let numMoves = 20;
  for (let i = 0; i < numMoves; i++) {
    let face = random(faces);
    let dir = random([1, -1]);
    let move = createMove(face, dir);
    scrambleMoves.push(move);
    moveQueue.push(move);
  }
  wasScrambled = true;
}

function solveCube() {
  if (currentMove !== null || moveQueue.length > 0 || scrambleMoves.length === 0) return;
  let solveMoves = [];
  for (let i = scrambleMoves.length - 1; i >= 0; i--) {
    let m = scrambleMoves[i];
    let invMove = { axis: m.axis, index: m.index, direction: -m.direction, currentAngle: 0, targetAngle: HALF_PI, speed: 0.1 };
    solveMoves.push(invMove);
  }
  moveQueue = moveQueue.concat(solveMoves);
  if (wasScrambled) {
    solvedAfterScramble = true;
    wasScrambled = false;
  }
  scrambleMoves = [];
}

// ─── Explosion Function ──────────────────────────────────────
// Trigger an explosion by assigning each cube an outward velocity.
function triggerExplosion() {
  explosionActive = true;
  for (let cube of cubes) {
    let dir = cube.pos.copy();
    if (dir.mag() === 0) {
      dir = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
    }
    dir.normalize();
    let speed = random(3, 6);
    cube.explosionVelocity = dir.mult(speed);
  }
}

// ─── UI BUTTONS ─────────────────────────────────────────────
// Create a container for the buttons and place it beneath the canvas.
function createUI() {
  let buttonContainer = createDiv();
  buttonContainer.class("button-container");
  
  let btnScramble = createButton('Scramble');
  btnScramble.parent(buttonContainer);
  btnScramble.mousePressed(scrambleCube);
  
  let btnSolve = createButton('Solve');
  btnSolve.parent(buttonContainer);
  btnSolve.mousePressed(solveCube);
  
  let btnReset = createButton('Reset');
  btnReset.parent(buttonContainer);
  btnReset.mousePressed(resetCube);
}


// ─── GLOBAL CUBE ROTATION (VIEW CONTROLS) ─────────────────
// Use arrow keys and mouse dragging to rotate the view.
function keyPressed() {
  let angleStep = HALF_PI;
  if (keyCode === LEFT_ARROW) {
    targetRotY -= angleStep;
  } else if (keyCode === RIGHT_ARROW) {
    targetRotY += angleStep;
  } else if (keyCode === UP_ARROW) {
    targetRotX -= angleStep;
  } else if (keyCode === DOWN_ARROW) {
    targetRotX += angleStep;
  }
}

function mouseDragged() {
  let sensitivity = 0.01;
  targetRotY += (mouseX - pmouseX) * sensitivity;
  targetRotX += (mouseY - pmouseY) * sensitivity;
}

function mouseReleased() {
  targetRotX = round(targetRotX / (HALF_PI)) * HALF_PI;
  targetRotY = round(targetRotY / (HALF_PI)) * HALF_PI;
}
