const rings = [];
let lastRingTime = 0;

function onMouseMove(e){
    const now = performance.now();
    if (now - lastRingTime >= 1000 / 60) { 
        const ring = { x: e.clientX, y: e.clientY, radius: 5, alpha: 1 };
        rings.push(ring);
        lastRingTime = now;
    }
}

function drawData(){
	let i = rings.length;
	while (i--){
		drawCircle(rings[i]);
		rings[i].alpha -=0.0025;
		rings[i].radius++;
		if(rings[i].alpha <= 0) {
			rings.splice(i, 1);
		}
	}		
}

