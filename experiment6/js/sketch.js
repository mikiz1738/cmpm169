'use strict';

let font = 'sans-serif';
let letters = [];
let spawn = false;
let randomFalling = false;
let currentWord = 'A';
let inputBox, spawnButton;
let explosionSound;

function preload() {
  explosionSound = loadSound('explosion.wav'); // Load explosion sound
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textAlign(CENTER, CENTER);
  
  inputBox = createInput('A');
  inputBox.position(10, 10);
  inputBox.input(() => currentWord = inputBox.value());
  
  spawnButton = createButton('Toggle Random Fall');
  spawnButton.position(10, 40);
  spawnButton.mousePressed(toggleRandomFall);
}

function draw() {
  background(255);
  stroke(0);
  noFill();
  rect(0, 0, width - 1, height - 1); // Outline canvas corners
  fill(0);
  noStroke();
  
  if (randomFalling && frameCount % 10 === 0) {
    randomFall();
  }
  
  for (let i = letters.length - 1; i >= 0; i--) {
    let letterObj = letters[i];
    
    // Update position
    letterObj.y += letterObj.speed;
    
    // Trigger explosion slightly before reaching the bottom
    if (letterObj.y >= height - 50 && !letterObj.exploding) {
      letterObj.exploding = true;
      explosionSound.play(); // Play explosion sound only once per letter
    }
    
    // Handle explosion effect
    if (letterObj.exploding) {
      letterObj.size += letterObj.growth * 5; // Make explosion much larger
      letterObj.alpha -= 10;
    }
    
    // Draw letter with fading effect
    fill(0, letterObj.alpha);
    textSize(letterObj.size * 2);
    text(letterObj.char, letterObj.x, letterObj.y);
    
    // Remove letter if it fully fades
    if (letterObj.alpha <= 0) {
      letters.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    spawn = true;
  }
}

function keyReleased() {
  if (key === ' ') {
    spawn = false;
  }
}

function mouseMoved() {
  if (spawn) {
    spawnWord();
  }
}

function spawnWord() {
  let baseX = mouseX;
  let baseSpeed = random(2, 5); // Assign a common speed
  for (let i = 0; i < currentWord.length; i++) {
    let newLetter = {
      char: currentWord[i],
      x: baseX + i * 15,
      y: 0,
      size: 10,
      speed: baseSpeed, // All letters move at the same speed
      growth: random(5, 10), // Increase growth rate for larger explosion
      alpha: 255,
      exploding: false
    };
    letters.push(newLetter);
  }
}

function randomFall() {
  let baseSpeed = random(2, 5); // Assign a common speed
  let word = currentWord.length > 0 ? currentWord : 'A';
  let startX = random(width - word.length * 15);
  for (let i = 0; i < word.length; i++) {
    let newLetter = {
      char: word[i],
      x: startX + i * 15,
      y: 0,
      size: 10,
      speed: baseSpeed, // All letters move at the same speed
      growth: random(5, 10),
      alpha: 255,
      exploding: false
    };
    letters.push(newLetter);
  }
}

function toggleRandomFall() {
  randomFalling = !randomFalling;
}
