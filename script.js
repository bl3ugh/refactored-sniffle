let canvas;
let ctx;
let flowfield;
let flowfieldAnimation;

window.onload = function () {
    canvas = document.getElementById("canvas-1");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowfield = new FlowFieldEffect(ctx, canvas.width, canvas.height);
    flowfield.animate(0);
};

window.addEventListener("resize", function () {
    this.cancelAnimationFrame(flowfieldAnimation);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowfield = new FlowFieldEffect(ctx, canvas.width, canvas.height);
    flowfieldAnimation = requestAnimationFrame(function (timestamp) {
        flowfield.animate(timestamp);
    });
});

const mouse = {
    x: 0,
    y: 0,
};

window.addEventListener("mousemove", function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

class FlowFieldEffect {
    #ctx;
    #width;
    #height;

    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#ctx.lineWidth = 1;
        this.#width = width;
        this.#height = height;
        this.lastTime = 0;
        this.interval = 1000 / 60;
        this.timer = 0;
        this.cellSize = 20;
        this.radius = 1;
        this.deltaRadius = 0.03;
        this.baseRadius = 1;
        this.maxRadius = 15;
        this.#ctx.strokeStyle = this.gradient;
    }

    #drawLine(angle, startX, startY, endX, endY) {
        const gradient = this.#ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(
            0,
            `rgb(${Math.abs(Math.sin(angle) * 255)}, ${Math.abs(Math.cos(angle + Math.PI) * 255)},  ${
                (Math.abs(Math.sin(angle) + Math.cos(angle + Math.PI)) / 2) * 255
            })`
        );
        gradient.addColorStop(
            1,
            `rgb(${Math.abs(Math.sin(angle) * 255)}, ${Math.abs(Math.cos(angle + Math.PI) * 255)}, ${
                (Math.abs(Math.sin(angle) + Math.cos(angle + Math.PI)) / 2) * 255
            })`
        );

        this.#ctx.strokeStyle = gradient;

        this.#ctx.beginPath();
        this.#ctx.moveTo(startX, startY);
        this.#ctx.lineTo(endX, endY);
        this.#ctx.stroke();
    }

    animate(timeStamp) {
        let deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (this.timer > this.interval) {
            this.#ctx.clearRect(0, 0, this.#width, this.#height);
            for (let y = 0; y < this.#height; y += this.cellSize) {
                for (let x = 0; x < this.#width; x += this.cellSize) {
                    const dx = mouse.x - x;
                    const dy = mouse.y - y;
                    const angle = Math.atan2(dy, dx);
                    const endPointX = x + Math.cos(angle) * this.cellSize;
                    const endPointY = y + Math.sin(angle) * this.cellSize;
                    this.#drawLine(angle, x, y, endPointX, endPointY);
                }
            }
            this.radius += this.deltaRadius;
            this.timer = 0;
            if (this.radius > this.maxRadius || this.radius < -this.maxRadius) {
                this.deltaRadius *= -1;
            }
        } else {
            this.timer += deltaTime;
        }

        flowfieldAnimation = requestAnimationFrame(this.animate.bind(this));
    }
}
