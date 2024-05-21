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
let fishGifs = [];
let score = 0;
let customFont;
let backgroundImage;
let endScreenImage; // Add a variable for the end screen image
let gameTime = 0; // Track in-game time (milliseconds)
let gameOverTime = 0; // Track the time when the game is over
let arrowKeysEnabled = true; // Track whether arrow keys are enabled or not

function preload() {
    playerGif = loadImage('penguin2.gif');
    obstacleGif = loadImage('obstacle1.gif');
    fishGifs[0] = loadImage('fish1.gif');
    fishGifs[1] = loadImage('fish2.gif');
    fishGifs[2] = loadImage('fish3.gif');
    customFont = loadFont('pixelfont.ttf');
    backgroundImage = loadImage('background.gif');
    endScreenImage = loadImage('penguin-end-screen.gif'); //end screen image
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
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(38);
    text('Press LEFT or RIGHT arrow key to START', width / 2, height / 2);
}

function drawEndPage() {
    image(endScreenImage, width / 2, height / 2, width, height); //Display end screen image
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(62);
    text('GAME OVER', width / 2, height / 2 - 100);
    textSize(54);
    text('SCORE: ' + score, width / 2, height / 2);
    textSize(24);
    text('Press LEFT or RIGHT arrow key to RESTART', width / 2, height / 2 + 100);
}

function drawGamePage() {
    player.show();
    player.move();

    let currentTime = millis();
    if (currentTime - lastObstacleTime > obstacleInterval) { //Checking if it's time to generate a new obstacle
        if (obstacles.length < maxObstacles) {//if there are less obstacles than the maximum set amount
            generateObstacle(); //a new obstacle is generated
        }
        lastObstacleTime = currentTime;
        obstacleInterval = random(800, 1000); //a random value between 800-1200 millis for the next obstacle generation
    }

    if (currentTime - lastFishTime > fishInterval) {
        generateFish();
        lastFishTime = currentTime;
        fishInterval = random(100, 1000);
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
    textSize(46);
    fill(0);
    text('Score: ' + score, width / 2, 20);

    let currentSpeed = obstacles.length > 0 ? obstacles[0].speed : 0;
    textSize(24);
    text('Speed: ' + currentSpeed.toFixed(2), 140, 20);
}

function generateObstacle() {
    let obstacleSpeed = calculateObstacleSpeed();
    let obstacleType = random(1); // Randomly select between obstacle types
    if (obstacleType < 0.5) {
        obstacles.push(new Obstacle(obstacleSpeed, obstacleGif)); // Use obstacle1.gif
    } else {
        obstacles.push(new Obstacle(obstacleSpeed, loadImage('obstacle2.gif'))); // Use obstacle2.gif
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
    return 5 + 0.1 * (gameTime / 1000); // Increase speed gradually over time
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
        this.x = constrain(this.x, this.size / 2, width - this.size / 2);
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
    constructor(speed, obstacleImage) {
        this.size = obstacleImage === obstacleGif ? 200 : 100; // Set size based on the obstacle image
        this.x = random(this.size / 2, width - this.size / 2);
        this.y = 0 - this.size / 2;
        this.speed = speed;
        this.image = obstacleImage; // Store the obstacle image
    }

    move() {
        this.y += this.speed;
    }

    offscreen() {
        return (this.y > height + this.size / 2);
    }

    show() {
        let scaledWidth = this.image.width * 0.5;
        let scaledHeight = this.image.height * 0.5;
        image(this.image, this.x, this.y, scaledWidth, scaledHeight);
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
