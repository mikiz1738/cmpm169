'use strict';

var sketch = function (p) {
  var pointCount;
  var waveFreq = 4;
  var waveSpeed = 0.01;  // Slower wave speed
  var phase = 0;
  var waveHeight;
  var rippleFactor = 0.5;
  var trashObjects = [];
  var trashHeightFactor = 0.3;
  var trashImage;
  var wavePoints = [];
  var backWavePoints = [];
  var backWaveFreq = 3.5;
  var backWaveSpeed = 0.015;
  var backPhase = 0;
  var backWaveHeightFactor = 0.8;

  var clouds = []; // Array to hold the cloud objects

  p.preload = function () {
    trashImage = p.loadImage('soda_can.png');
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, 600);
    p.noFill();
    p.frameRate(60);
    pointCount = p.width;
    waveHeight = p.height / 20; // Smallest wave height

    // Initialize clouds with larger width and shorter height
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: p.random(-500, p.width),  // Start off-screen to the left
        y: p.random(50, 150),        // Random height
        size: p.random(150, 250),    // Larger and wider cloud size
        heightFactor: p.random(0.5, 0.8), // Adjust height factor for shorter clouds
        speed: p.random(0.05, 0.2)   // Slower speed for natural movement
      });
    }

    for (let i = 0; i < 5; i++) {
      trashObjects.push({
        x: (i / 5) * p.width,
        rotation: p.random(340, 380) % 360
      });
    }
  };

  p.draw = function () {
    p.background(247, 199, 64); // Sea Green background
    //p.noStroke();  // Remove stroke for clouds

    // **Draw Moving Clouds with Overlapping Layers**
    p.fill(167, 191, 57); // Green clouds
    for (let cloud of clouds) {
      // Draw clouds as overlapping ellipses (larger width and shorter height)
      p.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * cloud.heightFactor); // Shorter height
      cloud.x += cloud.speed; // Move cloud to the right

      // Reset cloud position to the left side if it moves off-screen
      if (cloud.x > p.width + cloud.size) {
        cloud.x = -cloud.size;
        cloud.y = p.random(50, 150); // Randomize the height
        cloud.size = p.random(150, 250); // Larger width
        cloud.heightFactor = p.random(0.5, 0.8); // Randomize the height factor
        cloud.speed = p.random(0.05, 0.2); // Randomize the speed for variety
      }
    }

    p.strokeWeight(1);
    p.translate(0, p.height / 2);

    let backWaveHeight = waveHeight * backWaveHeightFactor;

    // **Draw Back Waves**
    p.fill(0, 0, 180, 100);
    p.beginShape();
    for (let i = 0; i <= pointCount; i++) {
      let angle = p.map(i, 0, pointCount, 0, p.TWO_PI * backWaveFreq);
      let y = p.sin(angle + backPhase) * backWaveHeight;
      y += p.sin(angle * 2 + backPhase * 1.2) * backWaveHeight * rippleFactor * 0.7;
      p.vertex(i, y);
    }
    p.vertex(p.width, p.height / 2);
    p.vertex(0, p.height / 2);
    p.endShape(p.CLOSE);

    // **Draw Front Waves**
    p.fill(62, 119, 189);
    p.beginShape();
    for (let i = 0; i <= pointCount; i++) {
      let angle = p.map(i, 0, pointCount, 0, p.TWO_PI * waveFreq);
      let y = p.sin(angle + phase) * waveHeight;
      y += p.sin(angle * 2 + phase * 1.5) * waveHeight * rippleFactor;
      p.vertex(i, y);
    }
    p.vertex(p.width, p.height / 2);
    p.vertex(0, p.height / 2);
    p.endShape(p.CLOSE);

    // **Trash Objects Floating on the Front Wave**
    for (let obj of trashObjects) {
      let angle = p.map(obj.x, 0, pointCount, 0, p.TWO_PI * waveFreq);
      let y = p.sin(angle + phase) * waveHeight * trashHeightFactor;
      y += p.sin(angle * 2 + phase * 1.5) * waveHeight * rippleFactor * trashHeightFactor;
      y += waveHeight - 5;

      if (trashImage) {
        p.push();
        p.translate(obj.x, y);
        p.rotate(p.radians(obj.rotation));
        p.image(trashImage, -20, -20, 40, 40, 0, 0, trashImage.width, trashImage.height / 2);
        p.pop();
      }

      obj.x += 1;
      if (obj.x > p.width) obj.x = 0;
    }

    // Move both waves
    phase -= waveSpeed;
    backPhase -= backWaveSpeed;
  };

  p.keyPressed = function () {
    if (p.key == 's' || p.key == 'S') p.saveCanvas('wave_animation', 'png');
    if (p.key == '1') {
      waveFreq = p.max(1, waveFreq - 1);
      backWaveFreq = p.max(1, backWaveFreq - 1); // Adjust back wave frequency
    }
    if (p.key == '2') {
      waveFreq++;
      backWaveFreq++; // Adjust back wave frequency
    }
    if (p.key == '7') {
      waveSpeed = p.max(0.01, waveSpeed - 0.005);  // Decrease speed (but keep minimum)
      backWaveSpeed = p.max(0.008, backWaveSpeed - 0.004); // Decrease back wave speed
    }
    if (p.key == '8') {
      waveSpeed += 0.005;  // Increase speed
      backWaveSpeed += 0.004; // Increase back wave speed
    }
    if (p.key == 'r') rippleFactor = p.max(0, rippleFactor - 0.1);
    if (p.key == 't') rippleFactor += 0.1;

    // Add More Trash
    if (p.key == ' ') {
      trashObjects.push({
        x: p.random(p.width),
        rotation: p.random(340, 380) % 360
      });
    }
  };
};

var myp5 = new p5(sketch);
