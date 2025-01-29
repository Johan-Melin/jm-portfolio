const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
	player.startX = canvas.width / 2 - player.w / 2;
    player.startY = canvas.height / 2 - player.w / 2;
}

window.addEventListener('resize', resizeCanvas, false);
window.addEventListener('load', resizeCanvas, false);

const background = {
    rows: 3,
    cols: 3,
    thick: 4,
    spacing: 24,
	bg: []
};
const { rows, cols, thick, spacing, bg } = background;

const playerCenter = spacing / 2;
const player = {
	x: 1,
	y: 1,
	w: playerCenter,
	startX: canvas.width / 2 - playerCenter,
	startY: canvas.height / 2 - playerCenter,
};
const { startX, startY } = player;

let score;
let highscore;
let proj = [];
let colorCounter;
let enemySpawning;
let enemySpeed;
let bgColor;
let frontColor;
let strokeEffect = true;
let paused = false;
let xDown = null;
let yDown = null;

window.onload = function(){
	if(localStorage.getItem("avoidRhighscore") == null){
		localStorage.setItem("avoidRhighscore", 0);
	}
	highscore = localStorage.getItem("avoidRhighscore");
	highscore = parseFloat(highscore);
	
	var w = (rows*spacing+thick)/2;

	initBg();
	restart();
	
	setInterval(function(){
		drawCRT();
	}, 1000/60);
	
	setInterval(scoreCounter, 100);
	document.addEventListener('keydown', handleMovement);

	canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);

	function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    }

    function handleTouchMove(evt) {
		evt.preventDefault(); // Prevent default behavior (e.g., page scroll or refresh)
        if (!xDown || !yDown) {
            return;
        }

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;

        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                movePlayer('left');
            } else {
                movePlayer('right');
            }
        } else {
            if (yDiff > 0) {
                movePlayer('up');
            } else {
                movePlayer('down');
            }
        }

        // Reset values
        xDown = null;
        yDown = null;
    }

	function movePlayer(direction) {
        switch (direction) {
            case 'left':
				if (player.x > 0) player.x-=1;
                break;
            case 'right':
				if (player.x < cols-1) player.x+=1;
                break;
            case 'up':
				if (player.y > 0) player.y-=1;
                break;
            case 'down':
				if (player.y < rows-1) player.y+=1;
                break;
        }
    }
};

function drawScanlines(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.1; // Adjust transparency
    ctx.fillStyle = 'black';
    for (let y = 0; y < height; y += 2) {
        ctx.fillRect(0, y, width, 1); // Thin black line
    }
    ctx.restore();
}

function drawWithColorBleeding(ctx, canvas, offset = 2) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create separate color channels
    const redChannel = new Uint8ClampedArray(data);
    const blueChannel = new Uint8ClampedArray(data);
    const greenChannel = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
        redChannel[i + 1] = redChannel[i + 2] = 0; // Red only
        greenChannel[i] = greenChannel[i + 2] = 0; // Green only
        blueChannel[i] = blueChannel[i + 1] = 0; // Blue only
    }

    // Apply channels with offset
    ctx.putImageData(new ImageData(redChannel, canvas.width, canvas.height), -offset, 0);
    ctx.putImageData(new ImageData(greenChannel, canvas.width, canvas.height), offset, 0);
    ctx.putImageData(new ImageData(blueChannel, canvas.width, canvas.height), 0, offset);
}

function applyVignette(ctx, width, height) {
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) / 2.5,
        width / 2, height / 2, Math.min(width, height) / 1.2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function addNoise(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 50 - 25; // Adjust range
        data[i] += noise; // Red
        data[i + 1] += noise; // Green
        data[i + 2] += noise; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawCRT() {
    const { width, height } = canvas;

    // Apply CRT effects
    drawScanlines(ctx, width, height);
    drawEverything();
    //drawWithColorBleeding(ctx, canvas); //makes all blue
    applyVignette(ctx, width, height);
    //addNoise(ctx, width, height); // halves fps
	drawFPS();
}

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function drawFPS() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    frameCount++;
    if (frameCount >= 10) { // Update FPS every 10 frames
        fps = Math.round(1000 / deltaTime);
        frameCount = 0;
    }

    // Draw the FPS counter on the canvas
    ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white'; // Adjust for visibility
    ctx.fillText(`FPS: ${fps}`, 10, 20); // Position the text
    ctx.restore();
}

function restart(){
	score = 0.0;
	enemySpawning = 500;
	enemySpeed = 5;
	colorCounter = 0;
	paused = false;
	setColors();
	player.x = 1;
	player.y = 1;
	var i = proj.length;
	while (i--){
		proj[i].inMotion = false;
		proj[i].x = -100;
		proj[i].y = -100;
	}
	fireEnemy();
}


function scoreCounter(){
	if(paused)
		return
	score += .1;
	score = (Math.round(score * 10)/10);
	colorCounter++;
	if(colorCounter >= 100){
		setColors();
		colorCounter = 0;
		if(enemySpawning > 200)
			enemySpawning -= 50;
			enemySpeed += 1;
	}
}

function setColors(){
	bgColor = '#'+Math.random().toString(16).slice(-6);
	frontColor = '#'+Math.random().toString(16).slice(-6);
}

function fireEnemy(){
	if(paused)
		return
	var enemy = {x: 0, y: 0, xVel: 0, yVel: 0, inMotion: true}
	var _dir = getInt(4);
	var offSet = thick+(spacing-thick-player.w)/2;
	var yPos = getInt(cols)*spacing+startY;
	var xPos = getInt(rows)*spacing+startX;
	switch(_dir){
	case 0: //left to right
		enemy.y = yPos+offSet;
		enemy.xVel = enemySpeed;
		break;
	case 1: //right to left
		enemy.x = canvas.width;
		enemy.y = yPos+offSet;
		enemy.xVel = -enemySpeed;
		break;
	case 2: //top to bottom
		enemy.x = xPos+offSet;
		enemy.yVel = enemySpeed;
		break;
	case 3: //bottom to top
		enemy.y = canvas.height;
		enemy.x = xPos+offSet;
		enemy.yVel = -enemySpeed;
		break;
	}
	if(proj.length < 10)
		proj.push(enemy);
	else{
		var i = proj.length;
		while (i--){
			if(proj[i].inMotion == false){
				proj[i].x = enemy.x;
				proj[i].y = enemy.y;
				proj[i].xVel = enemy.xVel;
				proj[i].yVel = enemy.yVel;
				proj[i].inMotion = true;
				break;
			}
		}
	}
	setTimeout(fireEnemy, enemySpawning);
}

function getInt(r){
	return Math.floor(Math.random()*r);
}

function handleMovement(evt){
	var keyPressed = String.fromCharCode(event.keyCode);
	if(paused){
		if(event.keyCode == 32 || event.keyCode == 0) {//space
			restart();
		}
	}else{
		if(event.keyCode == 37 || keyPressed == "A") {//left
			if (player.x > 0) player.x-=1;
		}
		if(event.keyCode == 38 || keyPressed == "W") {//up
			if (player.y > 0) player.y-=1;
		}
		if(event.keyCode == 39 || keyPressed == "D") {//right
			if (player.x < cols-1) player.x+=1;
		}
		if(event.keyCode == 40 || keyPressed == "S") {//down
			if (player.y < rows-1) player.y+=1;
		}
	}
}

function checkPos(){
	if(player.x < 0)
		player.x = cols-1;
	if(player.x > cols-1)
		player.x = 0;
	if(player.y < 0)
		player.y = rows-1;
	if(player.y > rows-1)
		player.y = 0;
}

function initBg(){
	for (var y = 0; y <= rows; y++) {
		for (var x = 0; x <= cols; x++) {
			var p = {x: startX+x*spacing, y: startY+y*spacing};
			bg.push(p);
		}
	}
}

function drawEnemies(){
	var i = proj.length;
	while (i--){
		ctx.fillRect(proj[i].x, proj[i].y, player.w, player.w);
		if(strokeEffect)
			ctx.strokeRect(proj[i].x, proj[i].y, player.w, player.w);
	}
}

function moveEnemies(){
	var i = proj.length;
	while (i--){
		if(proj[i].inMotion){
			proj[i].x += proj[i].xVel;
			proj[i].y += proj[i].yVel;
			
			if(proj[i].x < 0 || proj[i].x > canvas.width || proj[i].y < 0 || proj[i].y > canvas.height){
				proj[i].inMotion = false;
				proj[i].x = -100;
				proj[i].y = -100;
			}

			checkHit(proj[i]);
		}
	}
}

function drawEverything(){
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = frontColor;
	drawBg();
	drawPlayer();
	drawEnemies();
	
	ctx.font="16px Arial";
	ctx.textAlign = "right";
	ctx.fillStyle = 'black';
	ctx.fillText("Highcore: "+highscore.toFixed(1), canvas.width-10, 24);
	ctx.fillStyle = frontColor;
	
	ctx.font="36px Arial";
	ctx.textAlign = "center";
	ctx.fillText(score.toFixed(1), canvas.width/2, 210);
	if(strokeEffect)
		ctx.strokeText(score.toFixed(1), canvas.width/2, 210);
			
	if(paused){
		ctx.fillText("Press space to restart", canvas.width/2, 410);
		if(strokeEffect)
			ctx.strokeText("Press space to restart", canvas.width/2, 410);
		return;
	}	

	moveEnemies();
}

function drawBg(){
	var i = bg.length;
	while (i--){
		ctx.fillRect(bg[i].x, bg[i].y, thick, thick);
		if(strokeEffect)
			ctx.strokeRect(bg[i].x, bg[i].y, thick, thick);
	}
}

function drawPlayer(){
	var posX = startX+player.x*spacing+thick;
	var posY = startY+player.y*spacing+thick;
	ctx.fillRect(posX, posY, spacing-thick, spacing-thick);
	if(strokeEffect)
		ctx.strokeRect(posX, posY, spacing-thick, spacing-thick);
	ctx.fillStyle = bgColor;
	var offSet = (spacing-thick-player.w)/2;
	ctx.fillRect(posX+offSet, posY+offSet, player.w, player.w);
	if(strokeEffect)
		ctx.strokeRect(posX+offSet, posY+offSet, player.w, player.w);
	ctx.fillStyle = frontColor;
}

function checkHit(enemy){
	var posX = startX+player.x*spacing+thick;
	var posY = startY+player.y*spacing+thick;
	if (posX < enemy.x + player.w &&
		posX + spacing-thick > enemy.x &&
		posY < enemy.y + player.w &&
		posY + spacing-thick > enemy.y) {
		checkScore();
		paused = true;
	}
}

function checkScore(){
	if(score > highscore){
		highscore = score;
		localStorage.setItem("avoidRhighscore", highscore);
	}
}
