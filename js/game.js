class Game {
    constructor() {
        this.gameState = new GameState();
        this.renderer = new Renderer(document.getElementById('game-canvas'));
        this.audioManager = new AudioManager();
        this.setupEventListeners();
        this.initializeGame();
    }

    setupEventListeners() {
        // Start button
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.start());
        }

        // Restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.start());
        }

        // Share button
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => this.shareScore());
        }

        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.gameState.gameOver) return;
            
            switch (event.code) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case 'Space':
                    this.hardDrop();
                    break;
            }
        });

        // Mobile controls
        const leftButton = document.getElementById('left-button');
        const rightButton = document.getElementById('right-button');
        const rotateButton = document.getElementById('rotate-button');
        const downButton = document.getElementById('down-button');

        if (leftButton) leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); this.moveLeft(); });
        if (rightButton) rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); this.moveRight(); });
        if (rotateButton) rotateButton.addEventListener('touchstart', (e) => { e.preventDefault(); this.rotate(); });
        if (downButton) downButton.addEventListener('touchstart', (e) => { e.preventDefault(); this.moveDown(); });
    }

    initializeGame() {
        // Show start screen, hide others
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        const gameOverScreen = document.getElementById('game-over-screen');

        if (startScreen) startScreen.style.display = 'flex';
        if (gameScreen) gameScreen.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';

        // Initialize canvas
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const scale = window.devicePixelRatio || 1;
            canvas.width = CONFIG.BOARD.WIDTH * CONFIG.BOARD.BLOCK_SIZE * scale;
            canvas.height = CONFIG.BOARD.HEIGHT * CONFIG.BOARD.BLOCK_SIZE * scale;
            canvas.style.width = `${CONFIG.BOARD.WIDTH * CONFIG.BOARD.BLOCK_SIZE}px`;
            canvas.style.height = `${CONFIG.BOARD.HEIGHT * CONFIG.BOARD.BLOCK_SIZE}px`;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
        }
    }

    start() {
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        
        if (startScreen) startScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        if (gameOverScreen) gameOverScreen.style.display = 'none';
        
        this.gameState.reset();
        this.spawnPiece();
        this.lastTime = performance.now();
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnPiece() {
        this.gameState.currentPiece = this.gameState.tetrominoGenerator.getNextPiece();
        if (this.checkCollision(this.gameState.currentPiece)) {
            this.gameOver();
        }
    }

    moveLeft() {
        if (!this.gameState.currentPiece || this.gameState.gameOver) return;
        
        this.gameState.currentPiece.x--;
        if (this.checkCollision(this.gameState.currentPiece)) {
            this.gameState.currentPiece.x++;
        }
    }

    moveRight() {
        if (!this.gameState.currentPiece || this.gameState.gameOver) return;
        
        this.gameState.currentPiece.x++;
        if (this.checkCollision(this.gameState.currentPiece)) {
            this.gameState.currentPiece.x--;
        }
    }

    moveDown() {
        if (!this.gameState.currentPiece || this.gameState.gameOver) return;
        
        this.gameState.currentPiece.y++;
        if (this.checkCollision(this.gameState.currentPiece)) {
            this.gameState.currentPiece.y--;
            this.lockPiece();
        }
    }

    hardDrop() {
        if (!this.gameState.currentPiece || this.gameState.gameOver) return;
        
        while (!this.checkCollision(this.gameState.currentPiece)) {
            this.gameState.currentPiece.y++;
        }
        this.gameState.currentPiece.y--;
        this.lockPiece();
    }

    rotate() {
        if (!this.gameState.currentPiece || this.gameState.gameOver) return;
        
        const oldRotation = this.gameState.currentPiece.rotation;
        this.gameState.currentPiece.rotation = (this.gameState.currentPiece.rotation + 1) % 4;
        
        if (this.checkCollision(this.gameState.currentPiece)) {
            // Try wall kick
            const kicks = [-1, 1, -2, 2];
            let kicked = false;
            
            for (const kick of kicks) {
                this.gameState.currentPiece.x += kick;
                if (!this.checkCollision(this.gameState.currentPiece)) {
                    kicked = true;
                    break;
                }
                this.gameState.currentPiece.x -= kick;
            }
            
            if (!kicked) {
                this.gameState.currentPiece.rotation = oldRotation;
            }
        }
    }

    checkCollision(piece) {
        const matrix = this.renderer.rotatePiece(piece.shape, piece.rotation);
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardX < 0 || boardX >= CONFIG.BOARD.WIDTH ||
                        boardY >= CONFIG.BOARD.HEIGHT ||
                        (boardY >= 0 && this.gameState.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        const matrix = this.renderer.rotatePiece(this.gameState.currentPiece.shape, this.gameState.currentPiece.rotation);
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    const boardY = this.gameState.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.gameState.board[boardY][this.gameState.currentPiece.x + x] = this.gameState.currentPiece.type;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = CONFIG.BOARD.HEIGHT - 1; y >= 0; y--) {
            if (this.gameState.board[y].every(cell => cell)) {
                this.gameState.board.splice(y, 1);
                this.gameState.board.unshift(Array(CONFIG.BOARD.WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.gameState.score += linesCleared * 100;
            this.updateScore();
        }
    }

    updateScore() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${this.gameState.score}`;
        }
    }

    gameLoop(currentTime = performance.now()) {
        if (this.gameState.gameOver) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update time
        this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - deltaTime / 1000);
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `Time: ${Math.ceil(this.gameState.timeRemaining)}s`;
        }

        // Move piece down
        if (currentTime - this.gameState.lastMoveTime > this.gameState.dropInterval) {
            this.moveDown();
            this.gameState.lastMoveTime = currentTime;
        }

        // Render
        this.renderer.render(this.gameState);

        // Check game over
        if (this.gameState.timeRemaining <= 0) {
            this.gameOver();
            return;
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameOver() {
        this.gameState.gameOver = true;
        const gameScreen = document.getElementById('game-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const finalScore = document.getElementById('final-score');
        
        if (gameScreen) gameScreen.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'block';
        if (finalScore) finalScore.textContent = `Score: ${this.gameState.score}`;
        
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
            localStorage.setItem('highScore', this.gameState.score.toString());
        }
    }

    shareScore() {
        if (window.Telegram?.WebApp) {
            const score = this.gameState.score;
            const message = `🎮 I scored ${score} points in Time Attack Tetris!\n\nCan you beat my score? Try now:`;
            window.Telegram.WebApp.sendData(JSON.stringify({
                type: 'share_score',
                score: score,
                message: message
            }));
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
