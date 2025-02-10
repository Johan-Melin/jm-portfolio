const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const worker = new Worker("worker.js");

let x = 0;

// Listen for messages from worker
worker.onmessage = function (event) {
    console.log("Worker finished computation:", event.data);
};

// Draw animation (runs smoothly)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.fillRect(x, 50, 50, 50);
    x = (x + 2) % canvas.width;

    worker.postMessage("start"); // Offload computation

    requestAnimationFrame(draw);
}

draw();
