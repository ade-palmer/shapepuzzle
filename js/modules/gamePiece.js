import { SHAPES, COLORS } from "./shapes.js";

export default class GamePiece {
    inPlay = false;
    isPositionOk = true;

    constructor(piece, index) {
        this.piece = piece;
        this.index = index;
        this.shapeId = piece.shapeId;
        this.offset = piece.offset;
        this.mutable = piece.mutable;
        this.shape = SHAPES[piece.shapeId];
        this.init();
    }

    get color() {
        return (!this.mutable) ? 'DimGray' : COLORS[this.index];
    }

    init() {
        if ('flip' in this.piece) {
                this.flip();
        };
        if ('rotate' in this.piece) {
            for (let i = 0; i < this.piece.rotate; i++) {
                this.rotate();
            }
        };
    }

    rotate() {
        let rotated = [];
        for (let i = 0; i < this.shape[0].length; i++) {
            rotated.push(this.shape.map(block => block[i]).reverse());
        }
        this.shape = rotated;
    }

    flip() {
        let flipped = [];
        this.shape.forEach(row => {
            flipped.push([...row].reverse());
        });
        this.shape = flipped;
    }

    remove() {
        this.inPlay = false;
    }
}