const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coordsEl = document.getElementById('coords'); 
const iterCountEl = document.getElementById('iter-count');
const resetBtn = document.getElementById('reset-btn');

// Canvas size
const WIDTH = 800
const HEIGHT = 600;
canvas.width = WIDTH;
canvas.height = HEIGHT; 

//View state - the region of the complex plane currently being displayed
let state = {
    xMin: -2.5,
    xMax: 1.0,
    yMin: -1.25,
    yMax: 1.25,
    maxIterations: 100
};

function mandelbrot(cx, cy, maxIter) {
    let zx = 0;
    let zy = 0;
    let iter = 0;

    //z^2 = (zx + zy*i)^2 = zx^2 - zy^2 + 2*zx*zy*i
    while (zx * zx + zy * zy <= 4 && iter < maxIter) {
        let newZx = zx * zx - zy * zy + cx;
        let newZy = 2 * zx * zy + cy;
        zx = newZx;
        zy = newZy;
        iter++;
    }

    return iter;
}

function iterToColor(iter, maxIter) {
    if (iter === maxIter) {
        return[0, 0, 0]; // black for points in the set
    }

    //Smooth color based on escape speed
    const t = iter / maxIter;

    //A simple blue-white-gold gradient
    const r = Math.floor(10 * (1 - t) * t * t * t * 255);
    const g = Math.floor(20 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    return [r, g, b];
}

function draw() {
    //ImageData lets us draw pixels directly faster than fillRect
    const imageData = ctx.createImageData(WIDTH, HEIGHT);
    const data = imageData.data; //flat array of RGBA values

    for (let px = 0; px < WIDTH; px++) {
        for (let py = 0; py < HEIGHT; py++) {
            //Convert pixel coordinates to complex plane coordinates
            const cx = state.xMin + (px / WIDTH) * (state.xMax - state.xMin);
            const cy = state.yMin + (py / HEIGHT) * (state.yMax - state.yMin);

            const iter = mandelbrot(cx, cy, state.maxIterations);
            const [r, g, b] = iterToColor(iter, state.maxIterations);

            //Each pixel is 4 values in the data array: R, G, B, Alpha
            const idx = (py * WIDTH + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255; // alpha for fully opaque
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;

    //Convert click coordinates to complex plane coordinates
    const clickX = state.xMin + (px / WIDTH) * (state.xMax - state.xMin);
    const clickY = state.yMin + (py / HEIGHT) * (state.yMax - state.yMin);

    //Zoom in by a factor of 2.5, centered on the click
    const zoomFactor = 2.5;
    const newWidth = (state.xMax - state.xMin) / zoomFactor;
    const newHeight = (state.yMax - state.yMin) / zoomFactor;

    state.xMin = clickX - newWidth / 2;
    state.xMax = clickX + newWidth / 2;
    state.yMin = clickY - newHeight / 2;
    state.yMax = clickY + newHeight / 2;

    //Update iteration count for deeper zooms
    state.maxIterations = Math.min(state.maxIterations + 20, 500);
    iterCountEl.textContent = state.maxIterations;

    //Show coordinates
    coordsEl.textContent = `Center: (${clickX.toFixed(6)}, ${clickY.toFixed(6)})`;

    draw();
});

resetBtn.addEventListener('click', function() {
    state = {
        xMin: -2.5,
        xMax: 1.0,
        yMin: -1.25,
        yMax: 1.25,
        maxIterations: 100
    };
    coordsEl.textContent = 'Click to zoom in';
    iterCountEl.textContent = state.maxIterations;
    draw();
});

//Draw the fractal on page load
draw();
