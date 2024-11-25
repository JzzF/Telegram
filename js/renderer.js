class Renderer {
    constructor(gameCanvas, previewCanvas) {
        this.gameCanvas = gameCanvas;
        this.previewCanvas = previewCanvas;
        this.gameCtx = gameCanvas.getContext('2d');
        this.previewCtx = previewCanvas.getContext('2d');
        this.setupCanvases();
    }

    setupCanvases() {
        // Set game canvas size
        this.gameCanvas.width = CONFIG.BOARD.WIDTH * CONFIG.BOARD.BLOCK_SIZE;
        this.gameCanvas.height = CONFIG.BOARD.HEIGHT * CONFIG.BOARD.BLOCK_SIZE;

        // Set preview canvas size
        this.previewCanvas.width = 4 * CONFIG.BOARD.BLOCK_SIZE;
        this.previewCanvas.height = 4 * CONFIG.BOARD.BLOCK_SIZE;

        // Enable crisp pixel rendering
        this.gameCtx.imageSmoothingEnabled = false;
        this.previewCtx.imageSmoothingEnabled = false;
    }

    clearCanvas(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawBlock(ctx, x, y, type, opacity = 1) {
        const blockSize = CONFIG.BOARD.BLOCK_SIZE;
        const color = CONFIG.COLORS[type];

        ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);

        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize / 4);
        ctx.fillRect(x * blockSize, y * blockSize, blockSize / 4, blockSize);

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x * blockSize, (y + 1) * blockSize - blockSize / 4, blockSize, blockSize / 4);
        ctx.fillRect((x + 1) * blockSize - blockSize / 4, y * blockSize, blockSize / 4, blockSize);
    }

    drawGrid() {
        this.gameCtx.strokeStyle = CONFIG.GRID_LINE_COLOR;
        this.gameCtx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= CONFIG.BOARD.WIDTH; x++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(x * CONFIG.BOARD.BLOCK_SIZE, 0);
            this.gameCtx.lineTo(x * CONFIG.BOARD.BLOCK_SIZE, this.gameCanvas.height);
            this.gameCtx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= CONFIG.BOARD.HEIGHT; y++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, y * CONFIG.BOARD.BLOCK_SIZE);
            this.gameCtx.lineTo(this.gameCanvas.width, y * CONFIG.BOARD.BLOCK_SIZE);
            this.gameCtx.stroke();
        }
    }

    drawBoard(board) {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x]) {
                    this.drawBlock(this.gameCtx, x, y, board[y][x]);
                }
            }
        }
    }

    drawPiece(piece, ctx = this.gameCtx, offsetX = 0, offsetY = 0, opacity = 1) {
        if (!piece) return;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const drawX = piece.x + x + offsetX;
                    const drawY = piece.y + y + offsetY;
                    if (drawY >= 0) { // Only draw if block is within visible area
                        this.drawBlock(ctx, drawX, drawY, piece.type, opacity);
                    }
                }
            }
        }
    }

    drawGhostPiece(piece, ghostY) {
        const ghostPiece = {
            ...piece,
            y: ghostY
        };
        this.drawPiece(ghostPiece, this.gameCtx, 0, 0, CONFIG.GHOST_PIECE_OPACITY);
    }

    drawPreview(piece) {
        this.clearCanvas(this.previewCtx, this.previewCanvas);
        
        if (!piece) return;

        // Calculate centering offsets
        const pieceWidth = piece.shape[0].length;
        const pieceHeight = piece.shape.length;
        const offsetX = Math.floor((4 - pieceWidth) / 2);
        const offsetY = Math.floor((4 - pieceHeight) / 2);

        // Draw preview piece centered
        for (let y = 0; y < pieceHeight; y++) {
            for (let x = 0; x < pieceWidth; x++) {
                if (piece.shape[y][x]) {
                    this.drawBlock(this.previewCtx, x + offsetX, y + offsetY, piece.type);
                }
            }
        }
    }

    drawPhaseTransition(phase) {
        const element = document.createElement('div');
        element.className = 'phase-transition';
        element.textContent = `Phase ${phase}`;
        document.body.appendChild(element);

        // Remove the element after animation
        setTimeout(() => element.remove(), 2000);
    }

    drawScorePopup(points, x, y) {
        const element = document.createElement('div');
        element.className = 'score-popup';
        element.textContent = `+${points}`;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        document.body.appendChild(element);

        // Remove the element after animation
        setTimeout(() => element.remove(), 1000);
    }

    drawComboIndicator(combo) {
        const element = document.getElementById('combo-counter');
        element.textContent = `Combo: x${combo}`;
        element.classList.add('combo-flash');
        
        // Remove flash animation class after it completes
        setTimeout(() => element.classList.remove('combo-flash'), 500);
    }

    render(gameState) {
        this.clearCanvas(this.gameCtx, this.gameCanvas);
        this.drawGrid();
        this.drawBoard(gameState.board);
        
        if (gameState.currentPiece) {
            this.drawGhostPiece(gameState.currentPiece, gameState.getGhostPosition());
            this.drawPiece(gameState.currentPiece);
        }
        
        if (gameState.canShowPreview()) {
            this.drawPreview(gameState.tetrominoGenerator.peekNext());
        } else {
            this.clearCanvas(this.previewCtx, this.previewCanvas);
        }
    }
}
