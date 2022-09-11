import { BLOCK_SIZE } from './modules/constants.js';
import { cookieOptions, acceptCookies, getCookie, checkCookieConsent, nextGame } from './modules/cookies.js';
import Game from './modules/game.js'

// Context Menu
const contextMenu = document.querySelector(".contextMenu");

const scroll = document.getElementById("scroll")
const scrollDistance = 315;

// Get the modalBackGround
const modalBackground = document.getElementById("modalContainer");
const modalClose = document.getElementsByClassName("close")[0];

// Configure Canvas
const gameBoardCanvas = document.getElementById('gameBoardCanvas');
const availablePiecesCanvas = document.getElementById('availablePiecesCanvas');

// Cookie check
document.onload = checkCookieConsent();

// True or false if piece is bing moved
let isPieceMoving = false;
let mouseDownX, mouseDownY;

// New Game
let game = new Game(nextGame());
styleGameButtons(game.game + 1);
game.draw();

// Event Listeners
addEventListeners();


function addEventListeners() {
    document.oncontextmenu = handleRightClick;
    document.onmousedown = handleMouseDown;
    document.onmousemove = handleMouseMove;
    document.onmouseup = handleMouseUpOrOut;
    document.onmouseout = handleMouseUpOrOut;

    // TODO: Add touch options for mobile devices
    // Try this: http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html

    document.getElementById("rotate").onclick = rotatePiece;
    document.getElementById("flip").onclick = flipPiece;
    document.getElementById("remove").onclick = removePiece;

    document.querySelector(".cookieConsentOK").onclick = acceptCookies;
    document.querySelector(".cookieConsentClose").onclick = () => { cookieOptions.style.opacity = 0; };

    document.querySelector(".right").onclick = () => { scroll.scrollLeft += scrollDistance; };
    document.querySelector(".left").onclick = () => { scroll.scrollLeft -= scrollDistance; };

    scroll.onmousedown = gameSelection;
}


function gameSelection(e) {
    e.preventDefault();
    e.stopPropagation();

    setTimeout(toggleMenu, 200);

    const selectedGame = e.target;
    
    if (selectedGame.id != "") {
        game = new Game(selectedGame.id - 1);
        styleGameButtons(selectedGame.id);
        game.draw();
    }
}

function styleGameButtons(gameNumber) {
    // Reset all game buttons
    const gameItems = document.querySelectorAll(".scroll li");
    gameItems.forEach(g => {
        g.style.color = "#333";
        g.style.backgroundColor = "white";
    });
    // Grey out played games
    const gamesPlayed = getCookie("gameplay");
    const sortGamePlayArray = JSON.parse(gamesPlayed).sort((a, b) => { return a - b });
    sortGamePlayArray.forEach(g => {
        let playedGame = document.getElementById(g + 1);
        playedGame.style.color = "#a8a8a8";
        playedGame.style.backgroundColor = "#d1d1d1";
        playedGame.style.border = "5px solid #d1d1d1";
    });
    // Set color of active game
    const selectedGame = document.getElementById(gameNumber);
    selectedGame.style.color = "white";
    selectedGame.style.backgroundColor = "#525252";
    selectedGame.style.border = "4px solid #525252";

    // Scroll to correct location
    scroll.scrollLeft = Math.floor((gameNumber - 1) / 7) * scrollDistance;
}

function rotatePiece() {
    //game.rotatePiece();
    let activePiece = game.gamePieces.slice(-1)[0];
    activePiece.rotate();
    activePiece.isPositionOk = isPiecePostionOk(activePiece);
    game.draw();
}

function flipPiece() {
    let activePiece = game.gamePieces.slice(-1)[0];
    activePiece.flip();
    activePiece.isPositionOk = isPiecePostionOk(activePiece);
    game.draw();
}

function removePiece() {
    let activePiece = game.gamePieces.slice(-1)[0];
    activePiece.remove();
    game.draw();
}

function handleRightClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    const gbBoundary = game.gameBoard.boundaries();

    if (x < gbBoundary.left || x > gbBoundary.right ||
        y < gbBoundary.top || y > gbBoundary.bottom) {
        return;
    }

    const xBlock = Math.floor((x - gbBoundary.left) / BLOCK_SIZE);
    const yBlock = Math.floor((y - gbBoundary.top) / BLOCK_SIZE);

    const pieces = checkForSelectedPiece(xBlock, yBlock);
    pieces.forEach(piece => {
        if (piece.inPlay) {
            game.setPieceOrder(piece);
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            toggleMenu("show");
        }
    });
}

function toggleMenu(option) {
    contextMenu.style.display = (option === "show") ? "block" : "none";
};



function handleMouseDown(e) {
    // Check if right click (Context menu)
    if (e.which === 3 || e.button === 2) { return; }

    // Check if modal click
    if (e.target == modalBackground || e.target == modalClose) {
        const gamePlayArray = JSON.parse(getCookie("gameplay"));
        if (gamePlayArray.length < 30) {
            game = new Game(nextGame())
            styleGameButtons(game.game + 1);
            game.draw();
        }
        modalBackground.style.display = "none";
        return;
    }

    setTimeout(toggleMenu, 200)

    // Return if menu item selected
    if (e.target.id == "rotate" ||
        e.target.id == "flip" ||
        e.target.id == "remove") {
        return;
    }

    const x = e.clientX;
    const y = e.clientY;

    const gbBoundary = game.gameBoard.boundaries();
    const apBoundary = game.availablePieces.boundaries();

    if (x > gbBoundary.left && x < gbBoundary.right &&
        y > gbBoundary.top && y < gbBoundary.bottom) {
        mouseDownX = Math.floor((x - gbBoundary.left) / (BLOCK_SIZE));
        mouseDownY = Math.floor((y - gbBoundary.top) / (BLOCK_SIZE));
        const pieces = checkForSelectedPiece(mouseDownX, mouseDownY);
        pieces.forEach(piece => {
            if (piece.inPlay) {
                game.setPieceOrder(piece);
                isPieceMoving = true;
            }
        });
    } else if (x > apBoundary.left && x < apBoundary.right &&
        y > apBoundary.top && y < apBoundary.bottom) {
        const xBlock = Math.floor((x - apBoundary.left) / (BLOCK_SIZE / 2));
        const yBlock = Math.floor((y - apBoundary.top) / (BLOCK_SIZE / 2));
        addPiecetoBoard(xBlock, yBlock);
    }
}

function addPiecetoBoard(x, y) {
    const pieces = checkForSelectedPiece(x, y);
    pieces.forEach(piece => {
        if (!piece.inPlay) {
            piece.inPlay = true;
            piece.offset = [3, 0];
            piece.isPositionOk = isPiecePostionOk(piece);
            game.setPieceOrder(piece);
            game.draw();
        }
    });
}

function checkForSelectedPiece(x, y) {
    let selectedPieces = [];
    game.gamePieces.forEach(piece => {
        piece.shape.forEach((row, rowCount) => {
            row.forEach((block, colCount) => {
                if (block != 0 && piece.mutable &&
                    piece.offset[0] + colCount == x &&
                    piece.offset[1] + rowCount == y) {
                    selectedPieces.push(piece);
                }
            });
        });
    });
    return selectedPieces;
}

function isPiecePostionOk(piece) {
    let status = true;
    piece.shape.forEach((row, rowCount) => {
        row.forEach((block, colCount) => {
            if (block != 0) {
                let blockX = piece.offset[0] + colCount;
                let blockY = piece.offset[1] + rowCount;
               // TODO: Don't use magic numbers
                if (blockX < 0 || blockX > 9 || blockY < 0 || blockY > 5) {
                    status = false;
                }
                game.activeBlocks.forEach(block => {
                    if (block.index != piece.index) {
                        if (JSON.stringify(block.offset) === JSON.stringify([blockX, blockY])) {
                            status = false;
                        }
                    }
                });
            }
        })
    });
    return status;
} 

function handleMouseMove(e) {
    // Return if not dragging block
    if (!isPieceMoving) { return; }

    const x = e.clientX;
    const y = e.clientY;

    const gbBoundary = game.gameBoard.boundaries();

    const mouseMovedX = Math.floor((x - gbBoundary.left) / (BLOCK_SIZE));
    const mouseMovedY = Math.floor((y - gbBoundary.top) / (BLOCK_SIZE));

    if (mouseMovedX != mouseDownX || mouseMovedY != mouseDownY) {
        let activePiece = game.gamePieces.slice(-1)[0];
        if (Number.isInteger(mouseDownX) && Number.isInteger(mouseDownY)) {
            activePiece.offset[0] += (mouseMovedX - mouseDownX);
            activePiece.offset[1] += (mouseMovedY - mouseDownY);
        }
        activePiece.isPositionOk = isPiecePostionOk(activePiece);
        game.draw();
        mouseDownX = mouseMovedX;
        mouseDownY = mouseMovedY;
    } 
}


function handleMouseUpOrOut(e) {
   // Return if not dragging block
    if (!isPieceMoving) { return; }

    // Clear the isPieceMoving flag
    isPieceMoving = false;
}
