//neon light fade colors the canvas
//colors like blue tone
const touches = [];
let lastRingTime = 0;

let lastTime = performance.now();
let frameCount = 0;
let fps = 60;

const touchObj = {
    name: "Rings",
    screenAlpha: 0.01,
    strokeColor: 'rgb(255, 0, 0)',
    instances: 1,
    randomMovement: 0.1,
    radius: 0.5,
    growth: 0,
    alpha: 0.1,
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
    const isDarkMode = document.body.classList.contains('dark-mode');
    const bgColor = isDarkMode ? `rgba(18, 18, 18, ${touchObj.screenAlpha})` : `rgba(255, 255, 255, ${touchObj.screenAlpha})`;
    offscreenCtx.fillStyle = bgColor;

    // Load presets from data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const presets = data;
            const presetsSelect = document.getElementById('presets');
            presets.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = preset.name;
                presetsSelect.appendChild(option);
            });

            // Add event listener for preset change
            presetsSelect.addEventListener('change', function(e) {
                const selectedPreset = presets[e.target.value];
                applyPreset(selectedPreset);
            });
        });

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

    document.getElementById('growth').addEventListener('input', function(e) {
        touchObj.growth = parseFloat(e.target.value);
        document.getElementById('growth-value').textContent = e.target.value;
    });

    document.getElementById('alpha').addEventListener('input', function(e) {
        touchObj.alpha = parseFloat(e.target.value);
        document.getElementById('alpha-value').textContent = e.target.value;
    });

    document.getElementById('randomMovement').addEventListener('input', function(e) {
        touchObj.randomMovement = parseFloat(e.target.value);
        document.getElementById('randomMovement-value').textContent = e.target.value;
    });

    document.getElementById('instances').addEventListener('input', function(e) {
        touchObj.instances = parseFloat(e.target.value);
        document.getElementById('instances-value').textContent = e.target.value;
    });

    document.getElementById('screenAlpha').addEventListener('input', function(e) {
        touchObj.screenAlpha = parseFloat(e.target.value);
        document.getElementById('screenAlpha-value').textContent = e.target.value;
    });

    document.getElementById('resetButton').addEventListener('click', function() {
        resetValues();
    });

    document.getElementById('clearButton').addEventListener('click', function() {
        clearAll();
    });

    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('change', function() {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}

function applyPreset(preset) {
    touchObj.name = preset.name;
    touchObj.screenAlpha = preset.screenAlpha;
    touchObj.strokeColor = preset.strokeColor;
    touchObj.instances = preset.instances;
    touchObj.randomMovement = preset.randomMovement;
    touchObj.growth = preset.growth;
    touchObj.alpha = preset.alpha;

    updateSlider('growth', touchObj.growth);
    updateSlider('alpha', touchObj.alpha);
    updateSlider('randomMovement', touchObj.randomMovement);
    updateSlider('instances', touchObj.instances);
    updateSlider('screenAlpha', touchObj.screenAlpha);
}

function resetValues() {
    touchObj.growth = Math.floor(Math.random() * 11);
    touchObj.alpha = parseFloat(Math.random() * 1).toFixed(1);
    touchObj.randomMovement = Math.floor(Math.random() * 6);
    touchObj.instances = Math.floor(Math.random() * 5 + 1);
    touchObj.screenAlpha = parseFloat((Math.random() * 0.1).toFixed(1));
    updateSlider('growth', touchObj.growth);
    updateSlider('alpha', touchObj.alpha);
    updateSlider('randomMovement', touchObj.randomMovement);
    updateSlider('instances', touchObj.instances);
    updateSlider('screenAlpha', touchObj.screenAlpha);
}

function clearAll() {
    touches.length = 0;
    offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateSlider(id, value) {
    document.getElementById(id).value = value;
    document.getElementById(`${id}-value`).textContent = value;
}

function draw() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const bgColor = isDarkMode ? `rgba(18, 18, 18, ${touchObj.screenAlpha})` : `rgba(255, 255, 255, ${touchObj.screenAlpha})`;
    offscreenCtx.fillStyle = bgColor;
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawData();
    ctx.drawImage(offscreenCanvas, 0, 0);
    drawFPS();
    window.requestAnimationFrame(draw);
}

function onMouseMove(e) {
    const now = performance.now();
    if (now - lastRingTime >= 1000 / 60) {
        let instance = touchObj.randomMovement ? touchObj.instances : 1;
        for (let i = 0; instance > i; i++) {
            const ring = {
                x: e.clientX,
                y: e.clientY,
                xv: 0,
                yv: 0,
                radius: touchObj.radius,
                color: getRandomColorWithAlpha(),
            };
            touches.push(ring);
        }
        lastRingTime = now;
    }
}

function getRandomColorWithAlpha() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${touchObj.alpha})`;
}

function drawData() {
    let i = touches.length;
    while (i--) {
        touches[i].xv += Math.random() * touchObj.randomMovement - touchObj.randomMovement / 2;
        touches[i].yv += Math.random() * touchObj.randomMovement - touchObj.randomMovement / 2;
        touches[i].x += touches[i].xv;
        touches[i].y += touches[i].yv;

        drawCircle(touches[i]);
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
    const { x, y, radius, color } = ring;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
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
    ctx.fillText(`FPS: ${fps} | Rings: ${touches.length}`, 10, 20);
    ctx.restore();
}

document.addEventListener('touchmove', function(e) {
    if (!e.target.classList.contains('slider')) {
        e.preventDefault();
    }
}, { passive: false });