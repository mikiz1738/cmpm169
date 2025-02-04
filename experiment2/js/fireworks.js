'use strict';

let sliders = [];
let stars = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  sliders.push(new SliderRose(width / 2, height / 2));
  createStars(200); // Initialize stars
}

function draw() {
  background(255 - mouseY, 50, 100);

  // Update and style sliders dynamically
  sliders.forEach(sliderRose => {
    sliderRose.update();
    sliderRose.styleSliders();
  });

  // Update star sizes based on mouseY
  const maxSize = map(mouseY, 0, height, 2, 20); // Stars shrink as mouse moves up
  stars.forEach(star => star.updateSize(maxSize));
  stars.forEach(star => star.display());
}

// Add new SliderRose on mouse press
function mousePressed() {
  sliders.push(new SliderRose(mouseX, mouseY));
}

// Create a fixed number of stars randomly distributed across the canvas
function createStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star(random(width), random(height), random(2, 5)));
  }
}

function SliderRose(_x, _y) {
  this.x = _x;
  this.y = _y;
  this.sliders = [];
  const roseRadius = random(80, 150); // Circle radius
  const numSliders = 24; // Number of sliders
  const angleStep = TWO_PI / numSliders;

  // Create sliders in a circular pattern
  for (let i = 0; i < numSliders; i++) {
    const angle = i * angleStep;
    const x2 = cos(angle) * roseRadius;
    const y2 = sin(angle) * roseRadius;
    const slider = createSlider(0, 255, random(50, 200));
    slider.position(this.x + x2 - 50, this.y + y2); // Adjust position to center
    slider.style('width', '80px'); // Set slider width
    slider.style('transform', `rotate(${degrees(angle)}deg) scaleY(1)`); // Rotate and scale for thickness
    slider.style('transform-origin', 'center'); // Ensure scaling is centered
    this.sliders.push(slider);
  }

  // Update sliders based on a sine wave
  this.update = function () {
    let offset = 0;
    this.sliders.forEach(slider => {
      const value = map(sin(frameCount * 0.05 + offset), -1, 1, 0, 255);
      slider.value(value);
      offset += 0.2;

      // Dynamically adjust the slider length based on mouseY
      const newLength = map(mouseY, 0, height, 80, 200); // Change length based on mouseY
      slider.style('width', newLength + 'px');
    });
  };

  // Dynamically style sliders
  this.styleSliders = function () {
    this.sliders.forEach((slider, index) => {
      // Change background based on slider value
      const val = slider.value();
      const hue = map(val, 0, 255, 0, 360);
      slider.style('background', `hsl(${hue}, 100%, 50%)`);

      // Change thumb color dynamically
      slider.style(
        'box-shadow',
        `0 0 10px hsl(${(hue + 180) % 360}, 100%, 50%)`
      );
    });
  };
}

// Star class
class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.originalSize = size; // Save original size for dynamic scaling
    this.alpha = random(150, 255);
  }

  // Update star size dynamically
  updateSize(maxSize) {
    this.size = map(mouseY, 0, height, this.originalSize / 2, maxSize);
  }

  // Display the star
  display() {
    noStroke();
    fill(255, 255, 0, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}
