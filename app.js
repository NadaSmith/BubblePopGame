//Canvas Setup
const canvas = document. getElementById('canvas1'); //grabs the canvas element and keeps reference to it 
const ctx = canvas.getContext('2d'); //gets access to drawing tool on canvas
canvas.width = 800; //gives the width of the canvas (must be the same width set in CSS)
canvas.height = 500; //gives the height of the canvas (must be the same height set in CSS )

let score = 0;
let gameFrame = 0;  //(will +1 for every animation loop)
ctx.font = '80 px Times New Roman';
let gameSpeed = 1;
let gameOver = false;

// Mouse Interactivity (captures mouse position) (this custom mouse object holds data)

let canvasPosition = canvas.getBoundingClientRect(); //measures current size and position of canvas element; contains distance from bottem, left, right, top, height, width, x, and y coordinates
const mouse = {
    x: canvas.width/2,  //middle of the screen horizontally
    y: canvas.height/2, //middle of the screen vertically
    click: false,     //at start; will see if mouse button has been pressed or released
}
canvas.addEventListener('mousedown', function(event) {   //will override propertes on tihs object w/current mouse information; takes two arguments (type of event to listen for: mousedown and callback fuction to run when that even occurs)
    mouse.x = event.x - canvasPosition.left;   //overrides line 13 with current mouse.x coordinates
    mouse.y = event.y - canvasPosition.top;   //overrides line 14 with current mouse.y coordinates
});
canvas.addEventListener('mouseup', function(event) {
    mouse.click = false;
})

// Player
const playerLeft = new Image();
playerLeft.src = "fish_swim_left.png"
const playerRight = new Image();
playerRight.src = "fish_swim_right.png"

class Player {    
    constructor(){  //contains blueprint for all properties for player
        this.x = canvas.width/2;  //initial starting coordinates; if different coordinates from line 15 then it will move from line 27 position to line 15 position
        this.y = canvas.height/2;
        this.radius = 50;  //player represented by simple circle
        this.angle = 20;  //use to rotate player towards current mouse position
        this.frameX = 0;   //currently displayed frame in fish sprite sheet (multiline sprite sheet)
        this.frameY = 0;   //currently displayed frame in fish sprite sheet (multiline sprite sheet)
        this.frame = 0;  //keeps track of overall number of frames on the sheet and current position
        this.spriteWidth = 498;  //the width of single frame from sprite sheet; sprite sheet single frame is 1992px wide w/ 4 columns (divide)
        this.spriteHeight = 327;  //the height of single frame from sprite sheet; sprite sheet single frame is 981px  high w/ 3 rows (divide)
    }
    update(){    //updates players position to move the player towards the mouse (to do this we need to compare players current position to current mouse position)
        const dx = this.x - mouse.x;   //distance on the horizontal x axis
        const dy = this.y - mouse.y;
        let theta = Math.atan2(dy,dx); //
        this.angle = theta;
        if (mouse.x != this.x) {    //want both of these things to run at the same time
            this.x -= dx/30;   //allows player to move both left and right; divide by 30 to slow down movement for better animation
        }
        if (mouse.y != this.y) {
            this.y -= dy/30;
        }
    }
    draw(){    //draws line from mouse position to player so we can see direction of movement
        if (mouse.click) {
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);   //set starts point for line; current players position 
            ctx.lineTO(mouse.x, mouse.y);  //end point for line
            ctx.stroke();
        }
        /*ctx.fillStyle = 'red';  //draws circle that represents player character
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);  //draws circle; first two are players coordinates, the radius for size, start angle 0, full circle
        ctx.fill(); //to draw the circle
        ctx.closePath();
        ctx.fillRect(this.x, this.y, this.radius, 10);*/

        ctx.save();
        ctx.translate(this.x, this.y); //Look up what translate method is used for here!
        ctx.rotate(this.angle);
        if (this.x >= mouse.x) {
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);     //(image we want to draw, next four arguments indicate area we ant to crop out from the source [only one frame at a time], last four arguments defines where on canvas I want to place cropped out image onto  )
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);     //(image we want to draw, next four arguments indicate area we ant to crop out from the source [only one frame at a time], last four arguments defines where on canvas I want to place cropped out image onto  )
        }
        ctx.restore();
    }
}
const player = new Player();  //creates new blank player object and assign properties based on class constructor blueprint



// Bubbles
const bubblesArray = [];
const bubbleImage =  new Image();
bubbleImage.src = 'bubble_pop_frame_01.png';


class Bubble {
    constructor(){
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;  // will be random number btw 500 and 1000
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? "sound1" : "sound2" //terminal operator (one line if else statement)
    }
    update(){
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx*dx +dy*dy);
    }
    draw(){
      /*  ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();*/
        ctx.drawImage(bubbleImage, this.x - 70, this.y - 70, this.radius * 2.8, this.radius * 2.8); 
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = "pop1.ogg";

const bubblePop2 = document.createElement('audio');
bubblePop2.src = "pop2.ogg";

function handleBubbles(){
    if (gameFrame % 50 == 0) {  //runs the game frame every 50 frames
        bubblesArray.push(new Bubble());
    }
    for (let i = 0; i < bubblesArray.length; i++){
        bubblesArray[i].update();
        bubblesArray[i].draw();
        if (bubblesArray[i].y < 0 - bubblesArray[i].radius * 2){
            bubblesArray.splice(i, 1);
            i--;
        } else if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius){
                if (!bubblesArray[i].counted) {
                    if (bubblesArray[i].sound == "sound1"){
                        bubblePop1.play();
                    } else {
                        bubblePop2.play();
                    }
                    score++;
                    bubblesArray[i].counted = true;
                    bubblesArray.splice(i, 1);
                    i--;
                }  
            }
        }
    }
    for (let i = 0; i < bubblesArray.length; i++) {
}

//Repeating Backgrounds
const background = new Image();
background.src = 'background1.png';

const BG = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height
}

function handleBackground(){
    BG.x1 -= gameSpeed;
    if (BG.x1 < -BG.width) BG.x1 = BG.width;
    BG.x2 -= gameSpeed;
    if (BG.x2 < -BG.width) BG.x2 = BG.width;
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

//Enemies
const enemyImage = new Image ();
enemyImage.src = 'enemy1.png';

class Enemy {
    constructor(){
        this.x = canvas.width - 100;
        this.y = Math.random() * (canvas.height - 150) + 110;
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameY = 0;
        this.frameX = 0;
        this.spriteWidth = 418;
        this.spriteHeight = 397;
    }
    draw(){
        /*ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);
        ctx.fill();*/
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth/3, this.spriteHeight/3);  //s stands for source
    }
    update(){
        this.x -= this.speed;
        if (this.x < 0 - this.radius * 2){
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random() * 2 + 2;
        }
        if (gameFrame % 5 == 0){  //if remainder of 
            this.frame++;
            if (this.frame >= 12) this.frame = 0;
            if (this.frame == 3 || this.frame == 7 || this.frame == 11){
                this.frameX = 0;
            } else {
                this.frameX++;
            }
            if (this.frame < 3) this.frameY = 0;
            else if (this.frame < 7) this.frameY = 1;
            else if (this.frame < 11) this.frameY = 2;
            else this.frameY = 0;
        }
        //collision with player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius + player.radius){
            handleGameOver();
        }
    }
}
const enemy1 = new Enemy();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
}

function handleGameOver(){
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, you reached score ' + score, 330, 250);
    gameOver = true;
}

//Animation Loop

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  //clears canvas btw every animation frame
    handleBackground();
    handleBubbles();
    player.update();  //calculates player's position
    player.draw();  //draws line between player and mouse and draws circle representing the player
    handleEnemies();
    ctx.fillStyle = 'black';
    ctx.fillText('score:' + score, 10, 15); 
    gameFrame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function(){  //this will keep everything working when resizing browswer window
    canvasPosition = canvas.getBoundingClientRect();
});
