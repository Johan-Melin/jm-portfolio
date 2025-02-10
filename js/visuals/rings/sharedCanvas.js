const touches = [];
let lastRingTime = 0;

let lastTime = performance.now();
let frameCount = 0;
let fps = 60;

const touchObj = {
    name: "Rings",
    screenAlpha: 0.2,
    strokeColor: 'rgb(255, 0, 0)',
    isntances: 10,
    randomMovement: 0,
    radius: 1,
    growth: 0,
    alpha: 1,
    alphaChange: -0
};

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = canvas.clientWidth;
    offscreenCanvas.height = canvas.clientHeight;
    offscreenCtx.fillStyle = `rgba(255, 255, 255, ${touchObj.screenAlpha})`;

    window.requestAnimationFrame(draw);
    canvas.onmousemove = function(e) {
        typeof onMouseMove === 'function' && onMouseMove(e);
    }
    canvas.ontouchmove = function(e) {
        typeof onMouseMove === 'function' && onMouseMove(e.touches[0]);
    }

    // Add event listeners for menu inputs
    document.getElementById('strokeColor').addEventListener('input', function(e) {
        touchObj.strokeColor = hexToRgb(e.target.value);
    });
	
	document.getElementById('radius').addEventListener('input', function(e) {
		touchObj.radius = parseFloat(e.target.value);
		document.getElementById('radius-value').textContent = e.target.value;
	});
	
	document.getElementById('growth').addEventListener('input', function(e) {
		touchObj.growth = parseFloat(e.target.value);
		document.getElementById('growth-value').textContent = e.target.value;
	});
	
	document.getElementById('alpha').addEventListener('input', function(e) {
		touchObj.alpha = parseFloat(e.target.value);
		document.getElementById('alpha-value').textContent = e.target.value;
	});
	
	document.getElementById('alphaChange').addEventListener('input', function(e) {
		touchObj.alphaChange = parseFloat(e.target.value);
		document.getElementById('alphaChange-value').textContent = e.target.value;
	});
	
	document.getElementById('randomMovement').addEventListener('input', function(e) {
		touchObj.randomMovement = parseFloat(e.target.value);
		document.getElementById('randomMovement-value').textContent = e.target.value;
	});
	
	document.getElementById('isntances').addEventListener('input', function(e) {
		touchObj.isntances = parseFloat(e.target.value);
		document.getElementById('isntances-value').textContent = e.target.value;
	});
	
	document.getElementById('screenAlpha').addEventListener('input', function(e) {
		touchObj.screenAlpha = parseFloat(e.target.value);
		document.getElementById('screenAlpha-value').textContent = e.target.value;
	});
}

function draw() {
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const bgColor = '255, 255, 255';
    const alpha = touchObj.screenAlpha;
    const color = `rgba(${bgColor}, ${alpha})`;
    offscreenCtx.fillStyle = color;
    offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    drawData();
    drawFPS();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
    window.requestAnimationFrame(draw);
}

function onMouseMove(e) {
    const now = performance.now();
    if (now - lastRingTime >= 1000 / 60) {
        let isntance = touchObj.randomMovement ? touchObj.isntances : 1;
        for (let i = 0; isntance > i; i++) {
            const ring = {
                x: e.clientX,
                y: e.clientY,
                xv: 0,
                yv: 0,
                radius: touchObj.radius,
                alpha: touchObj.alpha
            };
            touches.push(ring);
        }
        lastRingTime = now;
    }
}

function drawData() {
    let i = touches.length;
    while (i--) {
        touches[i].xv += Math.random() * touchObj.randomMovement - touchObj.randomMovement / 2;
        touches[i].yv += Math.random() * touchObj.randomMovement - touchObj.randomMovement / 2;
        touches[i].x += touches[i].xv;
        touches[i].y += touches[i].yv;

        drawCircle(touches[i]);
        touches[i].alpha += touchObj.alphaChange;
        touches[i].radius += touchObj.growth;

        const maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
        if (touches[i].radius > maxRadius) {
            touches.splice(i, 1);
        }
    }
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
}

function drawCircle(ring) {
    const { x, y, radius, alpha } = ring;
    const [r, g, b] = touchObj.strokeColor.match(/\d+/g);
    const color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    offscreenCtx.strokeStyle = color;
    offscreenCtx.beginPath();
    offscreenCtx.arc(x, y, radius, 0, Math.PI * 2, true);
    offscreenCtx.stroke();
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
/*
document.addEventListener('touchstart', function(e) {
	e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function(e) {
	e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', function(e) {
	e.preventDefault();
}, { passive: false });
*/