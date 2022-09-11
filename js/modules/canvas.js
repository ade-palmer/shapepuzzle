import { ROWS, COLS, BLOCK_SIZE, CANVAS_PADDING } from './constants.js';


export default class Canvas {
    ctx;

    constructor(canvas, blockSize) {
        this.canvas = canvas;
        this.blockSize = blockSize;
        this.init();
    }

    init() {
        // Configure Canvas
        this.ctx = this.canvas.getContext('2d')
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;
        // Set scale dependent on canvas type
        this.ctx.scale(this.blockSize, this.blockSize);

        // Style Canvas Container (parent element)
        this.canvas.parentElement.style.width = `${COLS * BLOCK_SIZE + CANVAS_PADDING * 2}px`;
        this.canvas.parentElement.style.height = `${ROWS * BLOCK_SIZE + CANVAS_PADDING * 2}px`;
        this.canvas.parentElement.style.padding = `${CANVAS_PADDING}px`;
    }

    boundaries() {
        return this.canvas.getBoundingClientRect();
    }

    clear(multiplier = 1) {
        this.ctx.clearRect(0, 0, COLS * multiplier, ROWS * multiplier);
    }
}