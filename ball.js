
const canvas = document.querySelector('#canvas');
const ctx= canvas.getContext('2d');

const ball = {
    x: canvas.width / 2, 
    y: canvas.height - 30, 
    color: 'red',
    radius: 20,
    direction: { x: 0, y: -4 } 
};

const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 20,
    speed:8,
    color:'blue',
    width:120,
    height:10,
    direction:0
};

const game = {
    width: canvas.width,
    height: canvas.height,
    color: 'lightblue',
    gameOver : false,
    start: false,
    pause: false,
    score:0,
    lives: 3,
    winner:false
};

const brickRowCount = 3; 
const brickColumnCount = 6; 
const brickWidth = 80;
const brickHeight = 20;
const brickPadding = 10; 
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];

for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
        bricks.push({
            x: c * (brickWidth + brickPadding) + brickOffsetLeft,
            y: r * (brickHeight + brickPadding) + brickOffsetTop,
            width: brickWidth,
            height: brickHeight,
            active: true
        });
    }
}


function displayGame() {
    
    ctx.clearRect(0, 0, game.width, game.height);
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + game.score, 10, 20);
    ctx.fillText('Score: ' + game.score, 10, 20);
    ctx.fillText('Lives: ' + game.lives, canvas.width - 100, 20);

    if (game.gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        if (game.winner) {
            ctx.fillText('Winner!', canvas.width / 2 - 70, canvas.height / 2);
        } else {
            ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        }
        return; 
    }

    bricks.forEach(brick => {
        if (brick.active) {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.closePath();
        }
    });

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function initGame() {
    document.addEventListener('keydown', keyboardEvent);
    document.addEventListener('keyup', keyboardEvent);
    initPositions();
    playGame();
}   

function initPositions() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.direction = { x: 0, y: -1 };
    paddle.x = canvas.width / 2 - 60;
    paddle.y = canvas.height - 20;
    game.gameOver = false;
    game.start = false;
    game.pause = false;
}

function toggleGame() {
    if (game.gameOver) {
        initPositions();
        game.start = true;
        game.gameOver = false;
        playGame();
    } else {
        game.start = !game.start;
        game.pause = !game.pause;
    }
} 

function keyboardEvent(event) {
    if (event.type === 'keydown') {
        if (event.key === 'ArrowRight') {
            paddle.direction = 1;
        } else if (event.key === 'ArrowLeft') {
            paddle.direction = -1;
        } else if (event.key === ' ' && !game.start) {
            toggleGame();
        } else if (event.key === ' ' && game.start) {
            game.pause = !game.pause;
        }
    } else if (event.type === 'keyup') {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            paddle.direction = 0;
        }
    }

    
    if (event.type === 'keydown' && event.key === ' ' && game.gameOver) {
        toggleGame();
    }
}

function updateBallDirection() {
    if (ball.y + ball.radius > canvas.height - paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        let relativeIntersectX = ball.x - (paddle.x + paddle.width / 2);
        let normalizedRelativeIntersectionX = relativeIntersectX / (paddle.width / 2);

        if (normalizedRelativeIntersectionX < -1 / 3) {
           
            let angle = -Math.PI / 4;
            ball.direction.x = Math.sin(angle) * 4;
            ball.direction.y = -Math.cos(angle) * 4;
        } else if (normalizedRelativeIntersectionX > 1 / 3) {
            
            let angle = Math.PI / 4;
            ball.direction.x = Math.sin(angle) * 4;
            ball.direction.y = -Math.cos(angle) * 4;
        } else {
            
            let angle = 0;
            ball.direction.x = Math.sin(angle) * 4;
            ball.direction.y = -Math.cos(angle) * 4;
        }

      
        let randomAngle = (Math.random() - 0.5) * Math.PI / 6; 
        ball.direction.x += Math.sin(randomAngle);
        ball.direction.y -= Math.cos(randomAngle);

        
        let magnitude = Math.sqrt(ball.direction.x ** 2 + ball.direction.y ** 2);
        ball.direction.x /= magnitude;
        ball.direction.y /= magnitude;
    }
}

function detectBrickCollisions() {
    let activeBrickCount = 0;

    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        if (brick.active) {
            activeBrickCount++;
            if (
                ball.x > brick.x &&
                ball.x < brick.x + brick.width &&
                ball.y > brick.y &&
                ball.y < brick.y + brick.height
            ) {
                ball.direction.y = -ball.direction.y;
                brick.active = false; 
                game.score+=10;
            }
        }
    }
    if (activeBrickCount === 0) {
        game.gameOver = true;
        game.winner = true;
    }
}

function detectCollisions() {
    if (ball.y - ball.radius < 0) {
        ball.direction.y = -ball.direction.y;
    }

    if (
        ball.y + ball.direction.y > canvas.height - ball.radius - paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.direction.y = -ball.direction.y;
        
        
        let relativeIntersectX = ball.x - (paddle.x + paddle.width / 2);
        let normalizedRelativeIntersectionX = relativeIntersectX / (paddle.width / 2);

        if (normalizedRelativeIntersectionX < -1 / 3) {
            let angle = -Math.PI / 4;
            ball.direction.x = Math.sin(angle) * 4;
            ball.direction.y = -Math.cos(angle) * 4;
        } else if (normalizedRelativeIntersectionX > 1 / 3) {
            let angle = Math.PI / 4;
            ball.direction.x = Math.sin(angle) * 4;
            ball.direction.y = -Math.cos(angle) * 4;
        } else {
            let angle = 0;
            ball.direction.x = Math.sin(angle) * 4;
            ball.direction.y = -Math.cos(angle) * 4;
        }

        let randomAngle = (Math.random() - 0.5) * Math.PI / 6;
        ball.direction.x += Math.sin(randomAngle);
        ball.direction.y -= Math.cos(randomAngle);

        let magnitude = Math.sqrt(ball.direction.x ** 2 + ball.direction.y ** 2);
        ball.direction.x /= magnitude;
        ball.direction.y /= magnitude;
    }

    if (ball.y + ball.direction.y > canvas.height + ball.radius) {
        game.lives--;  
        if (game.lives === 0) {
            game.gameOver = true;
        } else {
            initPositions();
        }
    }


    
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.direction.x = -ball.direction.x;
    }
    detectBrickCollisions();
    updateBallDirection();
}


function playGame() {
    ctx.clearRect(0, 0, game.width, game.height);
    displayGame();

    if (!game.start || game.gameOver) {
        if (!game.gameOver) {
            requestAnimationFrame(playGame);
        }
        return;
    }

    if (game.pause) {
        requestAnimationFrame(playGame);
        return;
    }

    if (paddle.direction === 1 && paddle.x + paddle.width < game.width) {
        paddle.x += paddle.speed;
    } else if (paddle.direction === -1 && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    ball.x += ball.direction.x * 4;
    ball.y += ball.direction.y * 4;

    detectCollisions();

    if (game.gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
    } else {
        requestAnimationFrame(playGame);
    }
}


initGame();
playGame();