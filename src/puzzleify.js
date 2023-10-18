export class Puzzleify {
    constructor(imgElement, piecesX, piecesY, mode = 'default') {
        this.imgElement = imgElement;
        this.canvas = document.createElement('canvas');
        this.canvas.width = imgElement.width;
        this.canvas.height = imgElement.height;
        imgElement.parentNode.replaceChild(this.canvas, imgElement);
        imgElement.style.display = 'none';
        this.ctx = this.canvas.getContext('2d');
        this.img = new Image();
        this.img.src = imgElement.src;
        this.piecesX = piecesX;
        this.piecesY = piecesY;
        this.pieceWidth = this.canvas.width / this.piecesX;
        this.pieceHeight = this.canvas.height / this.piecesY;
        this.pieces = [];
        this.draggingPiece = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.mode = mode;

        this.img.onload = () => {
            this.createPieces();
            this.shufflePieces();
            this.drawPuzzle();
            this.addEventListeners();
        };

        this.imgElement.puzzleInstance = this;
    }
}