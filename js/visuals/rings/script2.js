//fireworks
let particles = [];

function createParticle(x, y) {
    return {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        alpha: 1
    };
}

function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.01;
    });
    particles = particles.filter(particle => particle.alpha > 0);
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 0, 0, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawData() {
    updateParticles();
    drawParticles();
}

function onMouseMove(e){
    for (let i = 0; i < 100; i++) {
        particles.push(createParticle(e.clientX, e.clientY));
    }
}