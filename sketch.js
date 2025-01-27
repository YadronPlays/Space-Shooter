// Controlling the game
let stage = "startScreen"; // The game stage 



// Elements for the game
let player;
let pressedKeys = {};
let fallingObjects = [];
let projectiles = [];
let explosions = [];
let musicOn = true; // making music on
let toggleButton = { x: 150, y: 170, width: 60, height: 30 }; // button position and size
let hitEffects = []; // Global variable for hit effects

let health = 5; // Start with 5 lives
const maxProjectiles = 3; // Limit the number of projectiles (shots)
let paused = false; // If the game is paused
let fallingObjectImg; // image for asteroid
let explosionImg; // image for asteroid explosion
let explosionSound; //  audio for asteroid explosion
let gameOver = false; 
let restartKey = 'r';
let mainMenuKey = 'm';
let spawnBossChance = 0.045; // 4.5% chance per frame 
let boss = null; // Boss object
let bossImg; // image for boss
let invincibilityFrames = 0; 
let powerUps = []; // power up array 
let activePowerUps = { // active powerups
  shield: 0
};
let powerUpSound; // sound for powerup




// Score and difficulty variables
let score = 0; // score at start
let fallingSpeed = 0.5; // Base speed for falling objects
let lastFallingObjectTime = 0; // Tracking the last falling object generation time
const difficultyIncreaseInterval = 10000; // Interval to increase difficulty
// Button properties
const buttonWidth = 160;
const buttonHeight = 50;
const buttonYPositions = [200, 270, 340, 410]; // Y positions for PLAY, HELP, SETTINGS, ABOUT buttons
const buttonLabels = ["PLAY", "HELP", "SETTINGS", "ABOUT"];
const GRAVITY = 0.1; // Gravity
const INVINCIBILITY_DURATION = 60; // 1 second of invincibility
const POWERUP_TYPES = { // type of powerup
  SHIELD: {
    color: '#00ffff',
    duration: 400, 
    symbol: '❋',
  }
};
const GROUND_Y = 450;




// Load images and sounds
let playerImg, groundImg, skyImg, backgroundmusic;
let shootSound, collisionSound, hearts;

let sciFiBg; // Background image




let menuButtons = {
  play: { x: 150, y: 20, width: 100, height: 40 },
  help: { x: 150, y: 290, width: 100, height: 40 },
  settings: { x: 150, y: 350, width: 100, height: 40 },
  about: { x: 150, y: 410, width: 100, height: 40 }
};

// Setup function
function preload() {
  // Load images and sounds
  playerImg = loadImage('Images/spaceship.png'); // image of spaceship
  groundImg = loadImage('Images/ground.jpeg'); // image for ground
  shootSound = loadSound('Audios/laser.mp3'); // sound for shooting
  backgroundmusic = loadSound('Audios/music.mp3'); // background music
  hearts = loadImage ('Images/heart.png'); // minecrafts hearts as health
  sciFiBg = loadImage ('Images/space2.jpg'); // image for menu background image
  fallingObjectImg = loadImage ('Images/asteroid.png'); // image of falling objects (asteroids)
  myfont = loadFont('arcadeclassic/ARCADECLASSIC.TTF'); // font for the game
  explosionImg = loadImage('Images/explosion-b6.png'); // explosion image wehn asteroid hits the ground
  explosionSound = loadSound('Audios/asteroidground.mp3'); // explosion sound when asteroid hits the ground
  bossImg = loadImage('Images/boss.png'); // image of the boss
  powerUpSound = loadSound('Audios/powerup.mp3'); // sound for powerups
}




// Player class 
class SpaceShip {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 8;
    this.radius = 15;
    this.shieldRadius = 25;
  }

  update() {
    let movement = createVector(0, 0);
    if (pressedKeys['a'] || pressedKeys['A']) movement.x -= 0.7; // move left   
    if (pressedKeys['d'] || pressedKeys['D']) movement.x += 0.7; // move right


    // Applying movement
    this.x += movement.x * this.speed;
    this.x = constrain(this.x, 10, width - 10); // Keeping the  player within bounds
  }

  draw() {
    image(playerImg, this.x - 10, this.y - 30, 20, 30);
    if (activePowerUps.shield > 0) {
      push();
      noFill();
      strokeWeight(2);
      // Pulsing shield effect
      let pulseSize = sin(frameCount * 0.1) * 2;
      stroke(0, 255, 255, 200); // Cyan color matching the power-up
      circle(this.x, this.y, this.shieldRadius * 2 + pulseSize);
      stroke(0, 255, 255, 100);
      circle(this.x, this.y, this.shieldRadius * 2.2 + pulseSize);
      pop();
    }
  }
}



class Boss {
  constructor() {
    this.x = random(100, width - 100); // Random position for the boss
    this.y = -50; // Start above the screen
    this.width = 100; // Boss width
    this.height = 100; // Boss height
    this.health = 800; // Boss health
    this.speed = 0.2; // Boss movement speed
    this.isAlive = true; // Whether the boss is alive
    this.attackPattern = 0; // Attack pattern index
    this.attackTimer = 0; // Timer for attack cooldown
  }



  update() {
    if (this.isAlive) {
            // Check if boss has hit the ground (y >= GROUND_Y - this.height / 2)
      if (this.y < 450 - this.height / 2) {
        this.y += this.speed; // Continue falling until the boss hits the ground
      } else {
        this.y = 450 - this.height / 2; // Stop at the ground (y = 450)
        this.isAlive = false;
        triggerExplosion (this.x, this.y);
        health = Math.max(0, health - 4);

        this.isAlive = false;
      }
      // Boss movement: move downwards slowly and left/right
      this.y += this.speed;
      this.x += sin(frameCount / 50) * 1; // boss moves side to side 

      // Boss attack logic
      this.attackTimer++;
      if (this.attackTimer >= 120) { // 120 frames = 2 seconds
        this.attackPattern++;
        this.attackTimer = 0; // Reset the timer
      }

      switch (this.attackPattern) {
        case 0: // Boss moves side to side
          this.x += sin(frameCount / 50) * 2; // Boss moves side to side slowly
          this.y += this.speed; // Boss moves downwards
          break;
        case 1: //charges at the player
        let dx = player.x - this.x;
        this.x += dx * 0.02;
        this.y += this.speed * 1.5;
          break;
        case 2:
          this.x += cos(frameCount / 20) * 3;
          this.y += this.speed * 0.5;
          
          break;
      } 
    }
  }
  draw() {
    if (this.isAlive) {
      // Draw the boss (you can use an image instead)
      image(bossImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      
      // Draw the health bar above the boss
      this.drawHealthBar();
    }
  }
  // Function to draw the health bar
  drawHealthBar() {
    let barWidth = 100; // Total width of the health bar
    let barHeight = 10; // Height of the health bar
    let currentHealthWidth = map(this.health, 0, 800, 0, barWidth); // Map health to the width of the bar

    // Draw the background of the health bar 
    fill(150);
    rect(this.x - barWidth / 2 + 50, this.y - this.height / 2 - barHeight - 5, barWidth, barHeight); // Adjusted for centering above the boss

    // Draw the foreground of the health bar 
    fill(255, 0, 0); // Red color for health
    rect(this.x - barWidth / 2 + 50, this.y - this.height / 2 - barHeight - 5, currentHealthWidth, barHeight); // Centered above the boss
  }

  takeDamage() {
    this.health -= 20; // Damage amount when hit by a projectile
    if (this.health <= 0) {
      this.isAlive = false; // Boss dies when health reaches 0
    }
  }
}




class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 25;
    this.height = 25;
    this.speed = 2;
    this.angle = 0;
  }

  update() {
    this.y += this.speed;
    this.angle += 0.05; // Rotation speed
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw background circle
    fill(POWERUP_TYPES[this.type].color);
    circle(0, 0, this.width);
    
    // Draw symbol
    fill(0);
    textSize(15);
    textAlign(CENTER, CENTER);
    text(POWERUP_TYPES[this.type].symbol, 0, 0);
    
    pop();
  }
}





// Setup function
function setup() {
  createCanvas(300, 500);
  rectMode(CENTER);
  textAlign(CENTER);
  player = new SpaceShip(width / 2, 450 - 15);
  userStartAudio();

  if (musicOn) {
    backgroundmusic.setVolume(0.12); // volume of the background music
    backgroundmusic.loop(); // start background music if enabled
  }

  // Increase difficulty over time
  setInterval(increaseDifficulty, difficultyIncreaseInterval);

  // Update score every second if game is in play
  setInterval(() => {
    if (stage === "play" && !gameOver) score++;
  }, 1000);
}


// Draw code
function draw() {
  background(0);

  if (paused) { // when paused
    // Display pause message
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Paused", width / 2, height / 2 - 40);
    textSize(16);
    text("Press  P  to  resume", width / 2, height / 2 + 20);
    text("Press  M  to  return  to  Menu", width / 2, height / 2 + 40);
    return; // Skip the rest of the draw() function if the game is paused
  }

  if (gameOver) { // if the game finishes
    displayGameOverMenu();  // Show the Game Over screen
    return;  // Skip the rest of the game update logic
  }

  if (stage === "startScreen") { // start screen
    displayStartScreen();
  } else if (stage === "play") {
    if (!gameOver) {
      game();
      updateAndDrawElements();
      checkProjectileCollisions(); // checking if the shots are hitting the asteroids
      displayScore(); // the score
      Hearts(); // show the health bar
      checkGameOver(); // condition check if the game has ended
      updateAndDrawExplosions(); // for the asteroid explosion
      drawHitEffects(); // draw the hit effects
      Object.keys(activePowerUps).forEach(type => {
        if (activePowerUps[type] > 0) {
          activePowerUps[type]--;
        }
      });
    }
    generateGameElements();
  } else if (stage === "gameOver") { // game over menu screen
    displayGameOverMenu();
  } else if (stage === "help") { // help menu screen
    displayHelpMenu();
  } else if (stage === "settings") { // settings menu screen
    displaySettingsMenu();
  } else if (stage === "about") { // about menu screen
    displayAboutMenu();
  }
}




// Function for checking collisions between projectiles and falling objects
function checkProjectileCollisions() {
  // Loop through projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let proj = projectiles[i];

    // Check if the projectile is out of bounds and remove it if so
    if (proj.y < 0) {
      projectiles.splice(i, 1);
      continue;
    }

    // Loop through falling objects and check for collisions
    for (let j = fallingObjects.length - 1; j >= 0; j--) {
      let obj = fallingObjects[j];

      // Check if the projectile is inside the bounding box of the falling object
      if (
        proj.x + proj.width > obj.x - obj.width / 2 &&
        proj.x < obj.x + obj.width / 2 &&
        proj.y + proj.height > obj.y - obj.height / 2 &&
        proj.y < obj.y + obj.height / 2
      ) {
        // Collision detected - remove projectile and falling object
        projectiles.splice(i, 1); // Remove the projectile
        fallingObjects.splice(j, 1); // Remove the falling object
        score += 5; // Increase score

        generatePowerUp(obj.x, obj.y);

        if (random() < 0.1 && obj.width > 20) {
          let fragments = splitAsteroid(obj);
          fallingObjects.push(...fragments); // Add fragments
        }
        addHitEffect(obj.x, obj.y);
        break;
        // Exit inner loop as we don't need to check more falling objects
      }
    }
  }
}




// Function for checking collisions between projectiles and the boss  
function checkProjectileCollisionsWithBoss() {
  // Loop through projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let proj = projectiles[i];

    // Check for collisions with the boss
    if (boss && boss.isAlive) {
      if (
        proj.x + proj.width > boss.x - boss.width / 2 &&
        proj.x < boss.x + boss.width / 2 &&
        proj.y + proj.height > boss.y - boss.height / 2 &&
        proj.y < boss.y + boss.height / 2
      ) {
        // Boss takes damage and projectile is destroyed
        boss.takeDamage();
        projectiles.splice(i, 1); // Remove projectile on hit
        score += 50; // Increase score for hitting the boss
        
        // Set boss to null if it dies so new ones can spawn
        if (!boss.isAlive) {
          boss = null;
        }
        
        break; // Exit loop once hit
      }
    }
  }
}



// Add effect after collision detection
function addHitEffect(x, y) {
  hitEffects.push({
    x: x,
    y: y,
    alpha: 255,
    size: 20
  });
}


// Draw the hit effects 
function drawHitEffects() {
  for (let i = hitEffects.length - 1; i >= 0; i--) {
    let effect = hitEffects[i];
    noFill();
    stroke(255, 255, 0, effect.alpha);
    circle(effect.x, effect.y, effect.size);
    effect.alpha -= 10;
    effect.size += 2;
    if (effect.alpha <= 0) {
      hitEffects.splice(i, 1);
    }
  }
}


// Function for the score
function displayScore() {
  fill(255);
  textSize(24);
  textAlign(RIGHT, TOP);
  text("Score" + score, width - 20, 30); 
}




// Function for the StartScreen
function displayStartScreen() {
  // Sci-fi gradient background if no image
  if (sciFiBg) {
    image(sciFiBg, 0, 0, width, height);
  } else {
    // Draw a space-themed gradient
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let c = lerpColor(color(0, 0, 30), color(0, 0, 0), inter); // Dark blue to black
      stroke(c);
      line(0, i, width, i);
    }
  }
  // Sci-fi title animation
  fill(0, 255, 255);
  textSize(40);
  textAlign(CENTER);
  textFont(myfont);
  textStyle(BOLD);
  text("Space Shooter", width / 2, 120 + sin(millis() / 500) * 5); // Pulsing title

  // Neon glow styled buttons
  textSize(24);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  for (let i = 0; i < buttonYPositions.length; i++) {
    const buttonY = buttonYPositions[i];
    const buttonX = width / 2; // Center of the screen

    // Button background with glow effect
    fill(0, 153, 255, 150);
    rect(buttonX, buttonY + buttonHeight / 2, buttonWidth, buttonHeight, 10);

    // Outer glow effect
    strokeWeight(3);
    stroke(0, 255, 255, 200);
    rect(buttonX, buttonY + buttonHeight / 2, buttonWidth + 8, buttonHeight + 8, 12);

    // Button text
    noStroke();
    fill(255);
    text(buttonLabels[i], buttonX, buttonY + buttonHeight / 2);
  }
}



// Function checking if the keys are pressed
function keyPressed() {
  pressedKeys[key] = true;

  if (stage === "startScreen") { // at the start screen
    if (keyCode === ENTER) { // enters the game
      resetGame(); // start the game
      stage = "play";
    } else if (key === 'h' || key === 'H') { // h or H for help menu
      stage = "help";
    } else if (key === 's' || key === 'S') { // s or S for settings menu
      stage = "settings";
    } else if (key === 'a' || key === 'A') { // a or A for about menu
      stage = "about";
    }
  } else if (stage === "play") {
    if (key === ' ') { // Space to shoot
      shootProjectile(); // Shoot projectile
    }
    if (key === 'p' || key === 'P') { // pause/unpause the game
      paused = !paused;
      if (paused) {
        backgroundmusic.stop(); // stop music when paused
      } else {
        if (musicOn) {
          backgroundmusic.loop(); // restart music when unpaused
        }
      }
    }
    if (key === 'm' || key === 'M') {
      if (paused) {
        paused = false; // Reset pause state
        backgroundmusic.stop();
        stage = "startScreen";
      }
    }
  }if (stage === "gameOver" && (key === 'r' || key === 'R')) { // r or R to restart the game when you are in game over menu
      resetGame();
        stage = "play";
  } if (stage === "gameOver" && (key === 'm' || key === 'M')) { // m or M to go to main menu when youre in game over menu
    resetGame();
      stage = "startScreen";
  } if (stage === "help" && (key === 'm' || key === 'M')) { // m or M to go to main menu when youre in help menu
      stage = "startScreen";
  } if (stage === "settings" && (key === 'm' || key === 'M')) { // m or M to go to main menu when youre in settings menu
    stage = "startScreen";
  } if (stage === "about" && (key === 'm' || key === 'M')) { // m or M to go to main menu when youre in  menu
    stage = "startScreen";
  } 
}




// Function to see if the keys has been released
function keyReleased() {
  delete pressedKeys[key];
}


// Increase game difficulty over time
function increaseDifficulty() {
  if (stage === "play" && !gameOver) { // if the game is still going
    fallingSpeed += 0.5; // adjust to a smaller increment
  }
}



// Function for Help Menu
function displayHelpMenu() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Help", width / 2, 100);
  
  textSize(16);
  text(" Shoot the asteroids " , width / 2, 150);
  text("Use  A  to  move  left  and  D  to  move  right", width / 2, 180);
  text("Press  SPACE  to shoot", width / 2, 210);
  text("Press  P  to pause  and  unpause the game", width / 2, 240);
  text("You  can  shoot  3  shots  at  a  time", width / 2, 270);
  text("Press  M  to  return  to  the  main  menu", width / 2, 300);
}



// Function for Settings Menu
function displaySettingsMenu() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Settings", width / 2, 100);

  // Display music toggle button
  textSize(16);
  fill(255);
  text("Background Music", width / 2,  140);

  // Draw the toggle button - centered around its coordinates
  rectMode(CENTER); // Important: Center the rectangle drawing mode
  fill(musicOn ? 'green' : 'red');
  rect(toggleButton.x, toggleButton.y, toggleButton.width, toggleButton.height, 5);
  
  // Draw the text on top
  fill(255);
  textAlign(CENTER, CENTER); // Center align the text
  text(musicOn ? "ON" : "OFF", toggleButton.x, toggleButton.y);
  
  // Return to default rectMode for other elements
  rectMode(CORNER);
  
  // Bottom menu text
  textAlign(CENTER, CENTER);
  text("Press  M  to  return  to  the  main  menu", width / 2, 250);
}



// Function for About Menu
function displayAboutMenu() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("About", width / 2, 100);
  
  textSize(16);
  text("Space Shooter Game by Bimarsha Khanal", width / 2, 150);
  text("Press  M  to  return  to  the  main  menu", width / 2, 180);
}


// Game rendering
function game() {
  image(groundImg, 0, 400, width, 100);
}



// Update and draw all elements
function updateAndDrawElements() {
  player.update();
  player.draw();

  // Update and draw falling objects
  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    let obj = fallingObjects[i];
    obj.update();
    if (obj.y > height || obj.x < 0 || obj.x > width) {
      fallingObjects.splice(i, 1);
    }
    obj.draw();
  }

  // Update and draw projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let proj = projectiles[i];
    proj.update();
    if (proj.y < 0) {
      projectiles.splice(i, 1);
    } else {
      proj.draw();
    }
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    let powerUp = powerUps[i];
    powerUp.update();
    powerUp.draw();
    
    // Check collision with player
    if (checkPowerUpCollision(player, powerUp)) {
      activatePowerUp(powerUp.type);
      powerUps.splice(i, 1);
    }
    
    // Remove if off screen
    if (powerUp.y > height) {
      powerUps.splice(i, 1);
    }
  }


  // If the boss exists, update and draw it
  if (boss && boss.isAlive) {
    boss.update();
    boss.draw();
  }

  // Draw active power-up indicators
  drawPowerUpIndicators();

  // Check for collisions with the boss
  checkProjectileCollisionsWithBoss();
}


// Function for mouse clicks
function mousePressed() {
  if (stage === "startScreen") {
    for (let i = 0; i < buttonYPositions.length; i++) {
      const buttonY = buttonYPositions[i];
      const buttonX = width / 2;

      // Check if mouse is within button bounds
      if (
        mouseX > buttonX - buttonWidth / 2 &&
        mouseX < buttonX + buttonWidth / 2 &&
        mouseY > buttonY &&
        mouseY < buttonY + buttonHeight
      ) {
        // Update stage based on button index
        if (i === 0) {
          resetGame();
          stage = "play";
        } else if (i === 1) {
          stage = "help";
        } else if (i === 2) {
          stage = "settings";
        } else if (i === 3) {
          stage = "about";
        }
      }
    }
  } else if (stage === "settings") {
    // Check if the mouse is within the music toggle button in settings
    if (
      mouseX > toggleButton.x - toggleButton.width / 6 &&
      mouseX < toggleButton.x + toggleButton.width  &&
      mouseY > toggleButton.y - toggleButton.height &&
      mouseY < toggleButton.y + toggleButton.height 
    ) {
      musicOn = !musicOn;
      if (musicOn) {
        backgroundmusic.loop();
      } else {
        backgroundmusic.stop();
      }
    }
  }
}


// Generate a falling object
function generateFallingObject() {
  let fallingObject = {
    x: random(30, width - 30), // randomize x position within bounds
    y: 0, // start falling from the top
    width: 40, // set a width for the object 
    height: 40, // set a height for the object
    speed: fallingSpeed + random(-0.5, 1), // speed of falling object
    update: function() {
      this.y += this.speed; // update vertical position based on speed
    },
    draw: function() {
      image(fallingObjectImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height); // draw the image at the correct position
    }
  };
  fallingObjects.push(fallingObject); // add to the array of falling objects
}



// Function for the hearts
function Hearts() {
  fill(255);
  textSize(24);

  for (let i = 0; i < health; i++ ) {
    image(hearts, 10 + i * 25, 10, 20, 20); // display multiple hearts based on health
  }
}


// Function to split the asteroid
function splitAsteroid(originalAsteroid) {
  const fragmentCount = floor(random(2, 4)); // Randomly 2 or 3 fragments
  const fragments = [];

  for (let i = 0; i < fragmentCount; i++) {
    const angle = random(-PI, PI); // Random angle for direction
    const speed = originalAsteroid.speed + random(0.5, 1); // Slightly faster speed
    const size = originalAsteroid.width / 2; // Halve the size for fragments

    const fragment = {
      x: originalAsteroid.x + random (-5, 5), // Spawn close to the original location
      y: originalAsteroid.y + random (-3, 3),
      width: size,
      height: size,
      vx: cos(angle) * speed * 0.3, // Calculate horizontal velocity
      vy: sin(angle) * speed * 0.2, // Calculate vertical velocity
      update: function () {
        this.vy += GRAVITY * 0.5; // Apply gravity
        this.x += this.vx;
        this.y += this.vy;
      },
      draw: function () {
        image(fallingObjectImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      }
    };

    fragments.push(fragment);
  }
  return fragments;
}




// Shoot a projectile
function shootProjectile() {
  if (projectiles.length < maxProjectiles) {
    let projectile = {
      x: player.x, // start from player's position
      y: player.y - 10, // slightly above the player
      width: 5, // width for collision checking
      height: 20, // height for collision checking
      speed: 8,
      update: function() {
        this.y -= this.speed; // move upwards
      },
      draw: function() {
        fill(255, 0, 0);
        rect(this.x, this.y, this.width, this.height); 
      }
    };
    projectiles.push(projectile);
    shootSound.play(); // play the shooting sound
  }
}

// Generate new game elements based on time
function generateGameElements() {
  if (millis() - lastFallingObjectTime > random(1000, 3000)) {
    if (random() < spawnBossChance && !boss) {
      // Spawn boss
      boss = new Boss();
    } else {
      // Spawn a normal falling object
      generateFallingObject();
    }
    lastFallingObjectTime = millis();
  }
}


// Generate a power-up
function generatePowerUp(x, y) {
  if (random() < 0.05) { // 5% chance to spawn power-up
    powerUps.push(new PowerUp(x, y, 'SHIELD'));
  }
}


// Check if the player collides with a power-up
function checkPowerUpCollision(player, powerUp) {
  return (
    player.x - player.radius < powerUp.x + powerUp.width/2 &&
    player.x + player.radius > powerUp.x - powerUp.width/2 &&
    player.y - player.radius < powerUp.y + powerUp.height/2 &&
    player.y + player.radius > powerUp.y - powerUp.height/2
  );
}


// Activate a power-up
function activatePowerUp(type) {
  activePowerUps[type.toLowerCase()] = POWERUP_TYPES[type].duration; // activate power-up
  
  // Play power-up sound
  powerUpSound.play();
}



function drawPowerUpIndicators() {
  if (activePowerUps.shield > 0) {
    let x = 10;
    let y = height - 30;
    
    fill(POWERUP_TYPES.SHIELD.color);
    circle(x, y, 20);
    
    // Draw duration bar
    const barWidth = 30;
    const remainingWidth = (activePowerUps.shield / POWERUP_TYPES.SHIELD.duration) * barWidth;
    fill(255);
    rect(x + 15, y, remainingWidth, 5);
  }
}


// Function to display explosion
function updateAndDrawExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    let explosion = explosions[i];
    
    // display the explosion image
    image(explosionImg, explosion.x - 20, explosion.y - 20, 40, 40);
    
    // remove explosion after timer expires
    if (millis() > explosion.timer) {
      explosions.splice(i, 1);
    }
  }
}


// Function to check if the game has ended
function checkGameOver() {
  if (health <= 0) { // if the health is 0
    gameOver = true;  // finish the game
    stage = "gameOver"; // now at Game Over menu
    return; // exit the function early if game is over
  }

  if (invincibilityFrames > 0) {
    invincibilityFrames--; // decrease invincibility frames
    return; // exit the function early if invincibility is active
  }

  // Loop through falling objects backwards to prevent issues when removing them
  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    let obj = fallingObjects[i];
    
    // Check if the object hits the ground
    if (obj.y + obj.height >= 450) { // Check if object reaches the ground (y = 450)
      triggerExplosion(obj.x, obj.y); // Trigger explosion at object position
        // Regular falling object collision
        if (activePowerUps.shield <= 0) {
          health = Math.max(0, health - 1); // Subtract 1 life for regular objects
          invincibilityFrames = INVINCIBILITY_DURATION; // Set invincibility
        }
        fallingObjects.splice(i, 1); // Remove regular object from falling objects array
      }
    }
  }




// Function for explosion
function triggerExplosion(x, y) {
  console.log(`Explosion triggered at (${x}, ${y})`);
  explosions.push({ x, y, timer: millis() + 500 }); // explosion lasts 500ms
  explosionSound.play(); // play the explosion sound
}



// Function for Game Over menu
function displayGameOverMenu() {
  document.body.style.backgroundColor = 'red'; // change the background color of the whole page

  fill('red'); // white text color for contrast
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2 - 40);

  textSize(16);
  text("Final Score " + score, width / 2, height / 2); // display final score

  text("Press  R  to  Restart", width / 2, height / 2 + 70);
  text("Press  M  to  return  to  Menu", width / 2, height / 2 + 100);
}


// Function for resetting the game in Game Over menu
function resetGame() {
  document.body.style.backgroundColor = '';
  score = 0;
  health = 5;
  fallingObjects = [];
  projectiles = [];
  gameOver = false;
  fallingSpeed = 0.8;
  lastFallingObjectTime = 0;
  boss = null;
  powerUps = [];
  activePowerUps = {
    shield: 0
  };
}


