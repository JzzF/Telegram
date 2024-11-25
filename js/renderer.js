class Renderer {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.gameCtx = gameCanvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        const scale = window.devicePixelRatio || 1;
        this.gameCanvas.width = CONFIG.BOARD.WIDTH * CONFIG.BOARD.BLOCK_SIZE * scale;
        this.gameCanvas.height = CONFIG.BOARD.HEIGHT * CONFIG.BOARD.BLOCK_SIZE * scale;
        this.gameCanvas.style.width = `${CONFIG.BOARD.WIDTH * CONFIG.BOARD.BLOCK_SIZE}px`;
        this.gameCanvas.style.height = `${CONFIG.BOARD.HEIGHT * CONFIG.BOARD.BLOCK_SIZE}px`;
        this.gameCtx.scale(scale, scale);
        
        // Enable crisp pixel rendering
        this.gameCtx.imageSmoothingEnabled = false;
    }

    clearCanvas() {
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    }

    drawBlock(x, y, type) {
        const blockSize = CONFIG.BOARD.BLOCK_SIZE;
        const color = CONFIG.COLORS[type];

        // Draw main block
        this.gameCtx.fillStyle = color;
        this.gameCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);

        // Draw highlight
        this.gameCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.gameCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize / 4);
        this.gameCtx.fillRect(x * blockSize, y * blockSize, blockSize / 4, blockSize);

        // Draw shadow
        this.gameCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.gameCtx.fillRect(x * blockSize, (y + 1) * blockSize - blockSize / 4, blockSize, blockSize / 4);
        this.gameCtx.fillRect((x + 1) * blockSize - blockSize / 4, y * blockSize, blockSize / 4, blockSize);
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
                    this.drawBlock(x, y, board[y][x]);
                }
            }
        }
    }

    drawPiece(piece) {
        if (!piece) return;
        
        const matrix = this.rotatePiece(piece.type, piece.rotation);
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    const drawX = piece.x + x;
                    const drawY = piece.y + y;
                    if (drawY >= 0) { // Only draw if block is within visible area
                        this.drawBlock(drawX, drawY, matrix[y][x]);
                    }
                }
            }
        }
    }

    rotatePiece(matrix, rotation) {
        let result = matrix;
        for (let i = 0; i < rotation; i++) {
            result = result[0].map((_, index) =>
                result.map(row => row[index]).reverse()
            );
        }
        return result;
    }

    render(gameState) {
        this.clearCanvas();
        this.drawGrid();
        this.drawBoard(gameState.board);
        if (gameState.currentPiece) {
            this.drawPiece(gameState.currentPiece);
        }
    }
}
