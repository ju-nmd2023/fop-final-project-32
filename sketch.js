let player;
let obstacles = [];
let fishes = [];
let gameIsOver = false;
let gameStarted = false;
let obstacleInterval = 1000;
let fishInterval = 1000;
let lastObstacleTime = 0;
let lastFishTime = 0;
let maxObstacles = 30;
let playerGif;
let obstacleGif;
let obstacleGif1;
let obstacleGif2;
let obstacleGif3;
let fishGifs = [];
let textColor = 0;
let score = 0;
let customFont;
let backgroundImage;
let startScreenImage;
let endScreenImage; // Add a variable for the end screen image
let gameTime = 0; // Track in-game time (milliseconds)
let gameOverTime = 0; // Track the time when the game is over
let arrowKeysEnabled = true; // Track whether arrow keys are enabled or not

function preload() {
    playerGif = loadImage('penguin2.gif');
    obstacleGif1 = loadImage('obstacle1.gif');
    obstacleGif2 = loadImage('obstacle2.gif');
    obstacleGif3 = loadImage('obstacle3.gif');
    fishGifs[0] = loadImage('fish1.gif');
    fishGifs[1] = loadImage('fish2.gif');
    fishGifs[2] = loadImage('fish3.gif');
    customFont = loadFont('pixelfont.ttf');
    backgroundImage = loadImage('background.gif');
    startScreenImage = loadImage('penguin-start-screen.gif');
    endScreenImage = loadImage('penguin-end-screen.gif');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    player = new Player();
    textFont(customFont);
    imageMode(CENTER);
}

function draw() {
    image(backgroundImage, width / 2, height / 2, width, height);

    if (!gameStarted) {
        drawStartPage();
    } else if (gameIsOver) {
        drawEndPage();
    } else {
        drawGamePage();
    }

    // Increment gameTime by the frame duration (in milliseconds)
    gameTime += deltaTime; //deltaTime indicates the time it took for the previous frame to execute and it adds to gameTime

    // arrow keys will be enabled after 1 sec
    if (gameIsOver && millis() - gameOverTime > 1000) {
     arrowKeysEnabled = true;
     }
}

function drawStartPage() {
    image(startScreenImage, width / 2, height / 2, width, height); // Start screen image as background
    textAlign(CENTER, CENTER);
    if (millis() % 1000 < 500) {
        fill(255);
    } else {
        fill(0);
    }
    textSize(42);
    text('Press LEFT or RIGHT arrow key to START', width / 2, height / 2 + 100);
}

function drawEndPage() {
    image(endScreenImage, width / 2, height / 2, width, height); //Display end screen image
    textAlign(CENTER, CENTER);
    if (millis() % 1000 < 500) {
        fill(255);
    } else {
        fill(0);
    }
    textSize(82);
    text('GAME OVER', width / 2, height / 2 - 100);
    textSize(64);
    text('SCORE: ' + score, width / 2, height / 2);
    textSize(34);
    text('Press LEFT or RIGHT arrow key to RESTART', width / 2, height / 2 + 100);
}

function drawGamePage() {
    player.show();
    player.move();

    let currentTime = millis();
    if (!gameIsOver) {
        // Toggle text color every half a second
        if (currentTime % 1000 < 500) {
            textColor = 255;
        } else {
            textColor = 0;
        }
    }

    if (currentTime - lastFishTime > fishInterval) {
        generateFish();
        lastFishTime = currentTime;
        fishInterval = random(100, 1000);
    }

    if (currentTime - lastObstacleTime > obstacleInterval) { //Checking if it's time to generate a new obstacle
        if (obstacles.length < maxObstacles) {//if there are less obstacles than the maximum set amount
            generateObstacle(); //a new obstacle is generated
        }
        lastObstacleTime = currentTime;
        obstacleInterval = random(100, 1000); //a random value between 800-1200 millis for the next obstacle generation
    }

    for (let i = obstacles.length - 1; i >= 0; i--) { //Loops through all the obstacles currently on the screen
        obstacles[i].show();
        obstacles[i].move();

        if (player.hits(obstacles[i])) {
            gameIsOver = true;
            gameOverTime = millis(); // Record the time when the game is over
            arrowKeysEnabled = false; // Disable arrow keys
        }

        if (obstacles[i].offscreen()) { //Removes obstacles that have moved off-screen
            obstacles.splice(i, 1);
        }
    }

    for (let i = fishes.length - 1; i >= 0; i--) { //Loops through all the fish currently on the screen
        fishes[i].show();
        fishes[i].move();

        if (player.collects(fishes[i])) { //If a fish is collected, its points are added to the player's score
            score += fishes[i].points;
            fishes.splice(i, 1); //fish is removed from the fishes array
        }

        if (fishes[i].offscreen()) { //Removes fish that have moved off-screen
            fishes.splice(i, 1);
        }
    }

    textAlign(CENTER, TOP);
    textSize(56);
    fill(textColor);
    text('Score: ' + score, width / 2, 20);

    let currentSpeed = obstacles.length > 0 ? obstacles[0].speed : 0;
    textSize(36);
    text('Speed: ' + currentSpeed.toFixed(2), 200, 20);
}

function generateObstacle() {
    let obstacleSpeed = calculateObstacleSpeed();
    let obstacleType = random(100); //random obstacle generation 0-30 ; 30-80; 80-100
    if (obstacleType < 30) {
        obstacles.push(new Obstacle(obstacleSpeed, obstacleGif1));
    } else if (obstacleType < 80) {
        obstacles.push(new Obstacle(obstacleSpeed, obstacleGif2, true));
    } else {
        obstacles.push(new Obstacle(obstacleSpeed, obstacleGif3));
    }
}


function generateFish() {
    let fishSpeed = calculateFishSpeed();
    let randomValue = random(100); //random fish generation 0-60 ; 60-90; 90-100
    if (randomValue < 60) {
        fishes.push(new Fish(fishGifs[0], 1, fishSpeed));
    } else if (randomValue < 90) {
        fishes.push(new Fish(fishGifs[1], 2, fishSpeed));
    } else {
        fishes.push(new Fish(fishGifs[2], 3, fishSpeed));
    }
}

function calculateObstacleSpeed() {
    // Determine obstacle speed based on gameTime
    return 5 + 0.2 * (gameTime / 1000); // Increase speed gradually over time
}

function calculateFishSpeed() {
    // Determine fish speed based on gameTime (in seconds)
    return 5 + 0.2 * (gameTime / 1000); // Increase speed gradually over time
}

function keyPressed() {
    if (!gameStarted || gameIsOver) {
        if (arrowKeysEnabled && (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
            resetGame();
            gameStarted = true;
        }
    } else {
        player.setDirection(keyCode);
    }
}

function resetGame() {
    score = 0;
    obstacles = [];
    fishes = [];
    lastObstacleTime = 0;
    lastFishTime = 0;
    gameTime = 0; // Reset gameTime to 0
    gameIsOver = false;
    player = new Player();
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 100;
        this.speed = 10;
        this.size = 100;
        this.isMirrored = false;
    }

    show() {
        push();
        translate(this.x, this.y);
        if (this.isMirrored) {
            scale(-1, 1); // Flip horizontally when right arrow key pressed
        }
        image(playerGif, 0, 0, this.size, this.size);
        pop();
    }

    move() {
        if (keyIsDown(LEFT_ARROW)) {
            this.x -= this.speed;
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.x += this.speed;
        }
    
        // Wrap around the screen horizontally
        if (this.x < 0 - this.size / 2) {
            this.x = width + this.size / 2;
        } else if (this.x > width + this.size / 2) {
            this.x = 0 - this.size / 2;
        }
    }

    setDirection(keyCode) {
        if (keyCode === LEFT_ARROW) {
            this.isMirrored = false;
        } else if (keyCode === RIGHT_ARROW) {
            this.isMirrored = true;
        }
    }

    hits(obstacle) {
        let playerRadius = this.size / 2;
        let obstacleRadius = obstacle.size / 2;
        let d = dist(this.x, this.y, obstacle.x, obstacle.y);
        return (d < playerRadius + obstacleRadius);
    }

    collects(fish) {
        let playerRadius = this.size / 2;
        let fishRadius = fish.size / 2;
        let d = dist(this.x, this.y, fish.x, fish.y);
        return (d < playerRadius + fishRadius);
    }
}

class Obstacle {
    constructor(speed, obstacleImage, followsPlayer = false) {
        this.image = obstacleImage;
        this.followsPlayer = followsPlayer;
        if (obstacleImage === obstacleGif1) {
            this.size = 150; // Hitbox size for obstacle1
            this.imageSize = createVector(430, 199); // Original image size
        } else if (obstacleImage === obstacleGif2) {
            this.size = 200; // Hitbox size for obstacle2
            this.imageSize = createVector(206 * 1.5, 397 * 1.5); // Resized image size by x 150%
        } else if (obstacleImage === obstacleGif3) {
            this.size = 100; // Hitbox size for obstacle3
            this.imageSize = createVector(273 * 0.3, 517 * 0.3); // Resized image size by x 30%
        }
        this.x = random(this.size / 2, width - this.size / 2);
        this.y = 0 - this.size / 2;
        this.speed = speed;
    }

    move() {
        if (this.followsPlayer) {
            // The speed of obstacle following
            let followSpeed = 5; // Adjustable
            if (this.x < player.x) {
                this.x += followSpeed;
            } else if (this.x > player.x) {
                this.x -= followSpeed;
            }
        }
        this.y += this.speed;
    }

    offscreen() {
        return (this.y > height + this.size / 2);
    }

    show() {
        if (this.image === obstacleGif3) {
            imageMode(CENTER);
            image(this.image, this.x, this.y, this.imageSize.x, this.imageSize.y);
        } else {
            let angle = atan2(player.y - this.y, player.x - this.x) - HALF_PI; // - HALF_PI (90 degrees) to make the images' bottom face the player
            push();
            translate(this.x, this.y);
            rotate(angle);
            imageMode(CENTER);
            image(this.image, 0, 0, this.imageSize.x * 0.5, this.imageSize.y * 0.5);
            pop();
        }
    }
}



class Fish {
    constructor(img, points, speed) {
        this.size = 80;
        this.x = random(this.size / 2, width - this.size / 2);
        this.y = 0 - this.size / 2;
        this.img = img;
        this.points = points;
        this.speed = speed;
        this.rotationAngle = (this.img === fishGifs[0]) ? radians(135) : radians(90);
    }

    move() {
        this.y += this.speed;
    }

    offscreen() {
        return (this.y > height + this.size / 2);
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.rotationAngle);
        imageMode(CENTER);
        image(this.img, 0, 0, this.size, this.size);
        pop();
    }
}
