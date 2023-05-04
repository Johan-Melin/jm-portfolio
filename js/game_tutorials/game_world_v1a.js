var groundHeight = 300;

function drawWorld(){
	//sky
	ctx.fillStyle="rgb(64, 128, 192)";
	ctx.fillRect(0, 0, canv.width, canv.height);
	
	//ground
	ctx.fillStyle="rgb(192, 64, 32)";
	ctx.fillRect(0, groundHeight, canv.width, canv.height);
	ctx.strokeRect(-1, groundHeight, canv.width+2, canv.height);
 }
 
