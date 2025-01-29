'use strict';

var tileCount = 20;
var actRandomSeed = 0;

var circleAlpha = 130;
var baseCircleSize = 20;
var maxCircleSize = 100; // Maximum growth size

var shiftAmountX = 0;
var shiftAmountY = 0;

var isAnimating = false;
var circles = [];

var redCount = 0;
var blackCount = 0;
var growthTriggered = false;
var moveUpwards = false;
var inputEnabled = false; // New flag to enable input only after clicking
var bgWhiteness = 150; // Initialize background whiteness
var transitionToGreen = false; // Track transition back to green
var blueShownTime = 0; // Timer to track how long blue is shown
var blueDuration = 3000; // 3 seconds in milliseconds

function setup() {
  createCanvas(600, 600);
  noFill();
  noStroke();
  initializeCircles();
}

function draw() {
  translate(width / tileCount / 2, height / tileCount / 2);
  
  // Update background color
  if (!transitionToGreen) {
    let newBgWhiteness = map(getAverageCircleSize(), baseCircleSize, maxCircleSize, 150, 255);
    if (newBgWhiteness > bgWhiteness) {
      bgWhiteness = newBgWhiteness; // Ensure it doesn't revert until transition is triggered
      blueShownTime = millis(); // Reset timer when blue is shown
    }
  } else {
    bgWhiteness = max(150, bgWhiteness - 1); // Gradually shift back to green
  }

  // Check if 3 seconds have passed since blue was shown
  if (!transitionToGreen && bgWhiteness >= 255 && millis() - blueShownTime > blueDuration) {
    transitionToGreen = true;
  }

  background(135, map(bgWhiteness, 150, 255, 206, 150), bgWhiteness); // Sky blue to green transition

  if (isAnimating) {
    actRandomSeed = random(100000);
  }

  randomSeed(actRandomSeed);
  redCount = 0;
  blackCount = 0;

  // Continuous arrow key checks only if input is enabled
  if (inputEnabled && !growthTriggered) {
    if (keyIsDown(LEFT_ARROW)) {
      shiftAmountX = max(shiftAmountX - 0.5, 0); // Reduce increment for smoother changes
    }
    if (keyIsDown(RIGHT_ARROW)) {
      shiftAmountX += 0.5;
    }
    if (keyIsDown(UP_ARROW)) {
      shiftAmountY = max(shiftAmountY - 0.5, 0);
    }
    if (keyIsDown(DOWN_ARROW)) {
      shiftAmountY += 0.5;
    }
  }

  for (let i = 0; i < circles.length; i++) {
    if (moveUpwards) {
      circles[i].y -= 2;
    } else if (isAnimating) {
      var shiftX = random(-shiftAmountX, shiftAmountX) / 20;
      var shiftY = random(-shiftAmountY, shiftAmountY) / 20;
      circles[i].x += shiftX;
      circles[i].y += shiftY;
    }

    if (!moveUpwards) {
      circles[i].isIntersecting = false;
      for (let j = 0; j < circles.length; j++) {
        if (i !== j) {
          let d = dist(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
          if (d < circles[i].size) {
            circles[i].isIntersecting = true;
            break;
          }
        }
      }

      if (circles[i].isIntersecting) {
        fill(255, 0, 0, circleAlpha);
        redCount++;
      } else {
        fill(0, 0, 0, circleAlpha);
        blackCount++;
      }
    } else {
      fill(0, 0, 0, circleAlpha);
    }

    if (growthTriggered) {
      let whiteness = map(circles[i].size, baseCircleSize, maxCircleSize, 0, 255);
      fill(whiteness, whiteness, whiteness, circleAlpha); // Gradually turn white
    }

    ellipse(circles[i].x, circles[i].y, circles[i].size, circles[i].size);
  }

  if (moveUpwards) {
    circles = circles.filter(circle => circle.y + circle.size / 2 > 0);
  }

  if (redCount > blackCount) {
    growthTriggered = true;
    moveUpwards = true;
  }

  if (growthTriggered) {
    for (let i = 0; i < circles.length; i++) {
      circles[i].size = min(circles[i].size + 1, maxCircleSize);
    }
  }
}

function getAverageCircleSize() {
  let totalSize = 0;
  for (let i = 0; i < circles.length; i++) {
    totalSize += circles[i].size;
  }
  return circles.length > 0 ? totalSize / circles.length : baseCircleSize;
}

function initializeCircles() {
  circles = [];
  for (var gridY = 0; gridY < tileCount; gridY++) {
    for (var gridX = 0; gridX < tileCount; gridX++) {
      var posX = width / tileCount * gridX;
      var posY = height / tileCount * gridY;
      circles.push({ x: posX, y: posY, size: baseCircleSize, isIntersecting: false });
    }
  }
}

function keyPressed() {
  if (inputEnabled && key === ' ') {
    growthTriggered = false;
    moveUpwards = false;
    shiftAmountX = 0;
    shiftAmountY = 0;
    actRandomSeed = random(100000);
    initializeCircles();
    transitionToGreen = false;
    bgWhiteness = 150;
  }
}

function mousePressed() {
  inputEnabled = true; // Enable input only after clicking
  isAnimating = !isAnimating; // Toggle animation state
}

function keyReleased() {
  if (inputEnabled && (key == 's' || key == 'S')) saveCanvas('molecules', 'png');
}
