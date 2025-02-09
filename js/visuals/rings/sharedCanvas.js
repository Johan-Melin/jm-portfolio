let canvas;
let ctx;
let offscreenCanvas;
let offscreenCtx;

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

window.onload = function(){
	canvas = document.getElementById('canvas');	
	ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

	offscreenCanvas = document.createElement('canvas');
	offscreenCtx = offscreenCanvas.getContext('2d');
	offscreenCanvas.width = canvas.clientWidth;
    offscreenCanvas.height = canvas.clientHeight;

	window.requestAnimationFrame(draw);
	canvas.onmousemove = function (e) {
		typeof onMouseMove === 'function' && onMouseMove(e);
	}
	canvas.ontouchmove = function (e) {
		typeof onMouseMove === 'function' && onMouseMove(e.touches[0]);
	}
}

function draw(){
	offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawData();
	drawFPS();
	ctx.drawImage(offscreenCanvas, 0, 0);
    window.requestAnimationFrame(draw);	
}

function drawFPS() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    frameCount++;
    if (frameCount >= 10) { 
        fps = Math.round(1000 / deltaTime);
        frameCount = 0;
    }

	ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red'; 
    ctx.fillText(`FPS: ${fps}`, 10, 20); 
    ctx.restore();
}

document.addEventListener('touchstart', function(e) {
	e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function(e) {
	e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', function(e) {
	e.preventDefault();
}, { passive: false });

function drawCircle(ring){
	const {x, y, radius, alpha} = ring;
	offscreenCtx.strokeStyle = `rgba(128, 128, 128, ${alpha})`;
	offscreenCtx.beginPath();
	offscreenCtx.arc(x, y, radius, 0, Math.PI*2, true); 
	offscreenCtx.stroke();
}
