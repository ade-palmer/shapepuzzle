import { GAMES } from './games.js';
import { BLOCK_SIZE, ROWS, COLS, COOKIE_CONSENT } from './constants.js';
import { getCookie, setCookie } from './cookies.js';
import Canvas from './canvas.js'
import GamePiece from './gamePiece.js'

export default class Game {
    gamePieces = [];
    activeBlocks = [];
    gameBoard;
    availablePieces;

    constructor(game) {
        this.game = game;
        this.init();
    }

    init() {
        GAMES[this.game].forEach((piece, index) => {
            this.gamePieces.push(new GamePiece(piece, index));
        });

        this.gameBoard = new Canvas(gameBoardCanvas, BLOCK_SIZE);
        this.availablePieces = new Canvas(availablePiecesCanvas, BLOCK_SIZE / 2);
    }

    setPieceOrder(piece) {
        // Place active piece at end of array so its displayed on top
        let activePieceIndex = this.gamePieces.findIndex(gamePiece => gamePiece === piece);
        this.gamePieces = this.gamePieces.concat(this.gamePieces.splice(activePieceIndex, 1));
    }

    draw() {
        // Clear canvas prior to refresh
        this.gameBoard.clear();
        this.availablePieces.clear(2);

        // Clear activeBlocks array
        this.activeBlocks = []

        let offset = [0, 0];

        this.gamePieces.forEach(piece => {
            let canvasCtx = this.gameBoard.ctx;
            // Set positions of available pieces
            if (!piece.inPlay && piece.mutable) {
                canvasCtx = this.availablePieces.ctx;
                piece.offset = [...offset];
                offset[0] += 4;
                if (offset[0] > 16) offset = [0, 7];
            }
            // Add pieces to Canvas
            canvasCtx.globalAlpha = (piece.isPositionOk) ? 1.0 : 0.6;
            canvasCtx.fillStyle = piece.color;
            piece.shape.forEach((row, rowCount) => {
                row.forEach((block, colCount) => {
                    if (block != 0) {
                        let blockX = piece.offset[0] + colCount;
                        let blockY = piece.offset[1] + rowCount;
                        canvasCtx.fillRect(blockX, blockY, 1, 1);
                        if (canvasCtx === this.gameBoard.ctx) {
                            this.activeBlocks.push({ index: piece.index, offset: [blockX, blockY] });
                        }
                    }
                })
            });
        });

        this.checkComplete();
    }

    checkComplete() {
        if (incorrectPiecePosition(this.gamePieces)) {
            return;
        }

        if (this.activeBlocks.length == ROWS * COLS) {
            let gamePlayArray = JSON.parse(getCookie("gameplay"));
            if (gamePlayArray.indexOf(this.game) === -1) gamePlayArray.push(this.game);
            setCookie("gameplay", JSON.stringify(gamePlayArray), COOKIE_CONSENT);

            const modalBackground = document.getElementById("modalContainer");
            setTimeout(() => { modalBackground.style.display = "block"; }, 300);
        }

        function incorrectPiecePosition(pieces) {
            return pieces.some(piece => {
                return piece.isPositionOk == false
            });
        }
    }
}