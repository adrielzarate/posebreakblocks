const videoWidth = 600;
const videoHeight = 600;
const video = document.getElementById('myVideo');
const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = false;

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    video.width = videoWidth;
    video.height = videoHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
        facingMode: 'user',
        width: videoWidth,
        height: videoHeight,
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
        resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

loadVideo();

const DOMboxes = document.getElementById('boxes');
const DOMscore = document.getElementById('score');

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const upArrow = new Image();
upArrow.src = 'up.png';

const downArrow = new Image();
downArrow.src = 'down.png';

const leftArrow = new Image();
leftArrow.src = 'left.png';

const rightArrow = new Image();
rightArrow.src = 'right.png';

const w = canvas.width;
const h = canvas.height;
const centerX = w/2;
const centerY = h/2;

const breakableZoneStart = centerX;
const breakableRightZoneEnd = centerX + (centerX/1.5);
const breakableLeftZoneEnd = centerX - (centerX/1.5);

let boxes = 0;
let score = 0;

let oldX = 0;
let oldY = 0;
let xDirection = '';
let yDirection = '';
let movements = [];

let direction;

function mostDirection(arr) {
    var max = 1,
        m = [],
        val = arr[0],
        i, x;
    for( i = 0; i < arr.length; i ++ ) {
        x = arr[i]
        if (m[x]) {
            ++m[x] > max && (max = m[i], val = x);
        } else {
            m[x] = 1;
        }
    } return val;    
}

function getDirection(e) {
    xDirection = (oldX < e.x) ? 'right' : 'left' ;
    yDirection = (oldY < e.y) ? 'down' : 'up' ;
    ( Math.abs((e.y - oldY)) > Math.abs((e.x - oldX )) ) ? movements.push(yDirection) : movements.push(xDirection);
    oldX = e.x;
    oldY = e.y;
}

const breakDirections = ['cutDown', 'cutUp', 'cutLeft', 'cutRight'];
const directions = ['right', 'left'];

function showGameData() {
    DOMboxes.textContent = boxes;
    DOMscore.textContent = score;
}

function drawScene() {
    ctx.lineWidth = '1';
    ctx.strokeStyle = '#999999';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.stroke();
}

function ctxDrawImage(img, x, y, w, h) {
    ctx.drawImage(img, x, y, w, h);
}

function Box() {
    this.x = centerX;
    this.y = centerY;
    this.breakDirection = breakDirections[Math.floor(Math.random() * breakDirections.length)];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
    // this.speed = Math.round(Math.random() * 3) + 2; // Random speed ?
    this.speed = 4;
    this.w = this.h = 1;
    this.isHandInside = false;
}

Box.prototype.updatePosition = function() {
    if ( this.direction === 'right' ) {
        this.x += this.speed;
    } else {
        this.x -= this.speed * 2;
    }
    this.w += this.speed;
    this.y = centerY - (this.h / 2);
    this.h += this.speed;
    this.drawBox();
};

Box.prototype.drawBox = function() {
    ctx.beginPath();
    ctx.fillStyle = 'transparent';
    let image = null;
    switch ( this.breakDirection ) {
        case 'cutDown':
            image = downArrow;
            break;
        case 'cutUp':
            image = upArrow;
            break;
        case 'cutLeft':
            image = leftArrow;
            break;
        case 'cutRight':
            image = rightArrow;
            break;
    }
    ctxDrawImage(image, this.x, this.y, this.w, this.h);
    ctx.fillRect(this.x, this.y, this.w, this.h);

    if ( this.isBreakable() ) {
        ctx.lineWidth = '4';
        ctx.strokeStyle = 'black';
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.stroke();
    }

};

Box.prototype.isBreakable = function(e) {
    if ( this.direction === 'right' ) {
        return true;
        // return this.x > breakableZoneStart && this.x < breakableRightZoneEnd;
    } else {
        return true;
        // return this.x < breakableZoneStart && this.x > breakableLeftZoneEnd;
    }
};

Box.prototype.isOutOfScreen = function() {
    return this.x > w || this.x + this.w < 0;
};

let aBox = new Box();

const rightHandPosition = {
    x: null,
    y: null
};

const leftHandPosition = {
    x: null,
    y: null
};

function draw(kp) {
    ctx.clearRect(0, 0, w, h);
    drawScene();
    
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = '2';

    // eyes
    ctx.lineTo(kp[1].position.x, kp[1].position.y);
    ctx.lineTo(kp[2].position.x, kp[2].position.y);

    // shoulders
    ctx.moveTo(kp[5].position.x, kp[5].position.y);
    ctx.lineTo(kp[6].position.x, kp[6].position.y);

    // right arm
    ctx.moveTo(kp[6].position.x, kp[6].position.y);
    ctx.lineTo(kp[8].position.x, kp[8].position.y);
    ctx.lineTo(kp[10].position.x, kp[10].position.y);

    // left arm
    ctx.moveTo(kp[5].position.x, kp[5].position.y);
    ctx.lineTo(kp[7].position.x, kp[7].position.y);
    ctx.lineTo(kp[9].position.x, kp[9].position.y);

    // right leg
    ctx.moveTo(kp[12].position.x, kp[12].position.y);
    ctx.lineTo(kp[14].position.x, kp[14].position.y);
    ctx.lineTo(kp[16].position.x, kp[16].position.y);

    // left leg
    ctx.moveTo(kp[11].position.x, kp[11].position.y);
    ctx.lineTo(kp[13].position.x, kp[13].position.y);
    ctx.lineTo(kp[15].position.x, kp[15].position.y);

    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc(kp[10].position.x, kp[10].position.y, 10, 0, 2*Math.PI);
    ctx.arc(kp[9].position.x, kp[9].position.y, 10, 0, 2*Math.PI);
    ctx.fill();

    rightHandPosition.x = kp[10].position.x;
    rightHandPosition.y = kp[10].position.y;

    leftHandPosition.x = kp[9].position.x;
    leftHandPosition.y = kp[9].position.y;

    if ( aBox.direction === 'right' ) {
        getDirection(rightHandPosition);
    } else {
        getDirection(leftHandPosition);
    }

    direction = mostDirection(movements);
    movements = [];

    aBox.updatePosition();
    
    if ( aBox.direction === 'right' ) {
        tryToBreak(leftHandPosition);
    } else {
        tryToBreak(rightHandPosition);
    }
    if ( aBox.isOutOfScreen() ) {
        aBox = new Box();
        boxes++;
    }

    showGameData();
}

function resetGame(e) {
    aBox = new Box();
}

function boxBroken() {
    score++;
    boxes++;
    resetGame();
}

function tryToBreak(hand) {

    if( aBox.isHandInside === false 
        && hand.y > aBox.y
        && hand.y < aBox.y + aBox.h
        && hand.x > aBox.x
        && hand.x < aBox.x + aBox.w
        ) {
        aBox.isHandInside = true;
    }

    if( aBox.breakDirection === 'cutDown'
        && aBox.isBreakable()
        && aBox.isHandInside 
        && direction === 'down'
        && hand.y > aBox.y + aBox.h
        && hand.x > aBox.x 
        && hand.x < aBox.x + aBox.w
        ) {
        boxBroken();
    }
    
    if( aBox.breakDirection === 'cutUp'
        && aBox.isBreakable()
        && aBox.isHandInside 
        && direction === 'up'
        && hand.y < aBox.y
        && hand.x > aBox.x 
        && hand.x < aBox.x + aBox.w
        ) {
        boxBroken();
    }

    if( aBox.breakDirection === 'cutLeft'
        && aBox.isBreakable()
        && aBox.isHandInside 
        && direction === 'left'
        && hand.x < aBox.x
        && hand.y > aBox.y 
        && hand.y < aBox.y + aBox.h
        ) {
        boxBroken();
    }

    if( aBox.breakDirection === 'cutRight'
        && aBox.isBreakable()
        && aBox.isHandInside 
        && direction === 'right'
        && hand.x > aBox.x + aBox.w
        && hand.y > aBox.y 
        && hand.y < aBox.y + aBox.h
        ) {
        boxBroken();
    }
}

posenet
    .load()
    .then(function(net) {
        video.play();
        setInterval(() => {
            net
            .estimatePoses(video, flipHorizontal, outputStride)
            .then(function(pose) {
                draw(pose[0].keypoints);
            });
        }, 60);   
    }
)
.catch(err => {
    console.log(err.message);
});