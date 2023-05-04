var player = {
	color: "rgb(16, 32, 64)", 
	x: 200, 
	y: 250, 
	w: 20, 
	h: 20,
	xVel: 0,
	yVel: 0,
	speed: 6,
	jumpSpeed: 5,
	onGround: false,
	upGravity: 9.8,
	downGravity: 14.7,
	xScale: 1,
	yScale: 1
}

function drawPlayer(){
	ctx.fillStyle=player.color;
	var xCenter = player.w*player.xScale*0.5;
	var yBottom = player.h*(player.yScale-1);
	ctx.fillRect(player.x-xCenter, player.y-yBottom, player.w*player.xScale, player.h*player.yScale);
	player.xScale = lerp(player.xScale);
	player.yScale = lerp(player.yScale);
}

function movePlayer(){
	getControls();
	
	//gravity
	if(!player.onGround){
		player.y -= player.yVel;
		if(player.yVel > 0)
			player.yVel -= player.upGravity*(1/60);
		else
			player.yVel -= player.downGravity*(1/60);
	}
	//hold to jump higher
	if(!controls.jump && player.yVel>0)
		player.yVel *= 0.5;
	worldCollision();
}

function getControls(){
	if(controls.left)
		playerMove(-1);
	if(controls.right)
		playerMove(1);
	if(controls.jump)
		playerJump();	
}

function playerMove(xDir){
	player.x += player.speed*xDir;
}

function playerJump(){
	if(player.onGround){
		player.yVel = player.jumpSpeed;
		player.onGround = false;
		stretchAndSquash(0.75, 1.5)
	}
}

 function worldCollision(){
	var prevGround = player.onGround;
	player.onGround = false;

	if (player.y+player.h >= groundHeight){
		player.onGround = true;
		player.doubleJump = true;
		if(!prevGround)
			stretchAndSquash(1.25, 0.75);
	}
	
	//ground correction
	if(player.y+player.h >= groundHeight)
		player.y = groundHeight-player.h;		
}

function stretchAndSquash(x, y){
	player.xScale = x;
	player.yScale = y;
}

function lerp (current) {
	if (current > 0.99 && current < 1.01)
		return 1;
	return (1 - 0.2) * current + 0.2;
}