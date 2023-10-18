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

    createPieces() {
        for (let y = 0; y < this.piecesY; y++) {
            for (let x = 0; x < this.piecesX; x++) {
                let piece = {
                    sx: x * (this.img.width / this.piecesX), 
                    sy: y * (this.img.height / this.piecesY),
                    sWidth: this.img.width / this.piecesX,
                    sHeight: this.img.height / this.piecesY,
                    dx: x * this.pieceWidth,
                    dy: y * this.pieceHeight,
                    dWidth: this.pieceWidth,
                    dHeight: this.pieceHeight,
                    offsetX: 0, 
                    offsetY: 0,
                    placed: false
                };
                this.pieces.push(piece);
            }
        }
    }

    shufflePieces() {
        if (this.mode === 'chaos') {
            this.pieces.forEach(piece => {
                piece.offsetX = Math.random() * (this.canvas.width - this.pieceWidth);
                piece.offsetY = Math.random() * (this.canvas.height - this.pieceHeight);
            });
        } else if (this.mode === 'default') {
            let shuffledPieces = [...this.pieces].sort(() => 0.5 - Math.random());
            shuffledPieces.forEach((piece, index) => {
                piece.offsetX = this.pieces[index].dx;
                piece.offsetY = this.pieces[index].dy;
            });
        }
    }

    checkPuzzle() {
        const epsilon = 0.01;
        this.pieces.forEach(piece => {
            if (Math.abs(piece.offsetX - piece.dx) < epsilon && Math.abs(piece.offsetY - piece.dy) < epsilon) {
                piece.incorrect = false;
            } else {
                piece.incorrect = true;
            }
        });
        this.drawPuzzle();
    }
    
    drawPuzzle() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pieces.forEach(piece => {
            this.ctx.drawImage(
                this.img, 
                piece.sx, piece.sy, piece.sWidth, piece.sHeight,
                piece.offsetX, piece.offsetY, piece.dWidth, piece.dHeight
            );
            
            if (piece.incorrect) {
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctx.fillRect(piece.offsetX, piece.offsetY, piece.dWidth, piece.dHeight);
            }
            
            this.ctx.strokeRect(piece.offsetX, piece.offsetY, piece.dWidth, piece.dHeight);
        });
    }

    addEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.resetIncorrectPieces();

            let x = e.offsetX;
            let y = e.offsetY;
            
            for (let i = this.pieces.length - 1; i >= 0; i--) {
                let piece = this.pieces[i];
                if (x > piece.offsetX && x < piece.offsetX + piece.dWidth && 
                    y > piece.offsetY && y < piece.offsetY + piece.dHeight && 
                    !piece.placed) {
                    this.draggingPiece = piece;
                    this.canvas.addEventListener('mousemove', this.handleMouseMove);
                    break;
                }
            }
        });
    
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.mode === 'default' && this.draggingPiece) {
                let x = e.offsetX;
                let y = e.offsetY;
                let targetPiece = this.pieces.find(piece => 
                    x > piece.offsetX && x < piece.offsetX + piece.dWidth && 
                    y > piece.offsetY && y < piece.offsetY + piece.dHeight
                );
        
                if (targetPiece && targetPiece !== this.draggingPiece) {
                    let tempX = this.draggingPiece.offsetX;
                    let tempY = this.draggingPiece.offsetY;
        
                    this.animatePiece(this.draggingPiece, targetPiece.offsetX, targetPiece.offsetY);
                    this.animatePiece(targetPiece, tempX, tempY);
                }
            }
        
            this.draggingPiece = null;
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.drawPuzzle();
        });
    }

    handleMouseMove = (e) => {
        if (this.draggingPiece) {
            if (this.mode === 'chaos') {
                this.draggingPiece.offsetX = e.offsetX - this.pieceWidth / 2;
                this.draggingPiece.offsetY = e.offsetY - this.pieceHeight / 2;
                
                if (Math.abs(this.draggingPiece.offsetX - this.draggingPiece.dx) < 15 && 
                    Math.abs(this.draggingPiece.offsetY - this.draggingPiece.dy) < 15) {
                    this.draggingPiece.offsetX = this.draggingPiece.dx;
                    this.draggingPiece.offsetY = this.draggingPiece.dy;
                    this.draggingPiece.placed = true;
                    this.draggingPiece = null;
                    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
                }
            }
    
            this.drawPuzzle();
        }
    }

    animatePiece(piece, targetX, targetY) {
        piece.animating = true;
        piece.animProgress = 0;
        piece.targetX = targetX;
        piece.targetY = targetY;
    
        const animate = () => {
            piece.animProgress += 0.01;
            if (piece.animProgress >= 1) {
                piece.animProgress = 1;
                piece.animating = false;
            }
            piece.offsetX += (piece.targetX - piece.offsetX) * piece.animProgress;
            piece.offsetY += (piece.targetY - piece.offsetY) * piece.animProgress;
            this.drawPuzzle();
            if (piece.animating) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }

    resetIncorrectPieces() {
        this.pieces.forEach(piece => {
            piece.incorrect = false;
        });
    }

    shuffleAndDraw() {
        this.shufflePieces();
        this.drawPuzzle();
    }
}

export function initializePuzzles() {
    const puzzleImages = document.querySelectorAll('img[data-puzzle]');

    puzzleImages.forEach(img => {
        const pieces = parseInt(img.getAttribute('data-puzzle'), 10);
        const mode = img.getAttribute('data-mode-puzzle') || 'default';
        new Puzzleify(img, pieces, pieces, mode);
    });
}

export function attachCheckButtonEvents() {
    const checkButtons = document.querySelectorAll('button[data-puzzle-check]');
    checkButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const puzzleImages = document.querySelectorAll('img[data-puzzle]');
            puzzleImages.forEach(img => {
                const puzzle = img.puzzleInstance;
                if (puzzle) {
                    puzzle.checkPuzzle();
                }
            });
        });
    });
}

export function attachShuffleButtonEvents() {
    const shuffleButtons = document.querySelectorAll('button[data-puzzle-shuffle]');
    shuffleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const puzzleImages = document.querySelectorAll('img[data-puzzle]');
            puzzleImages.forEach(img => {
                const puzzle = img.puzzleInstance;
                if (puzzle) {
                    puzzle.shuffleAndDraw();
                }
            });
        });
    });
}