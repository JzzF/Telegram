class GameState {
    constructor() {
        this.reset();
        this.tetrominoGenerator = new TetrominoGenerator();
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    }

    reset() {
        this.board = Array(CONFIG.BOARD.HEIGHT).fill().map(() => 
            Array(CONFIG.BOARD.WIDTH).fill(0)
        );
        this.currentPiece = null;
        this.gameOver = false;
        this.paused = false;
        this.score = 0;
        this.combo = 0;
        this.linesCleared = 0;
        this.timeRemaining = CONFIG.GAME.TOTAL_TIME;
        this.currentPhase = 1;
        this.lastMoveTime = 0;
        this.dropInterval = CONFIG.INITIAL_DELAY;
        this.piecesSincePreview = 0;
    }

    getCurrentPhase() {
        for (const [phase, config] of Object.entries(CONFIG.GAME.PHASES)) {
            if (this.timeRemaining <= config.START_TIME && this.timeRemaining > config.END_TIME) {
                return parseInt(phase);
            }
        }
        return 3; // Default to highest phase
    }

    updatePhase() {
        const newPhase = this.getCurrentPhase();
        if (newPhase !== this.currentPhase) {
            this.currentPhase = newPhase;
            this.dropInterval = CONFIG.INITIAL_DELAY / CONFIG.GAME.PHASES[newPhase].SPEED;
            return true;
        }
        return false;
    }

    canShowPreview() {
        const phaseConfig = CONFIG.GAME.PHASES[this.currentPhase];
        if (!phaseConfig.PREVIEW) return false;
        return this.piecesSincePreview % phaseConfig.PREVIEW_FREQUENCY === 0;
    }

    spawnPiece() {
        this.currentPiece = this.tetrominoGenerator.getNext();
        this.piecesSincePreview++;
        
        if (!this.isValidMove(this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver = true;
            this.updateHighScore();
            return false;
        }
        return true;
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore.toString());
        }
    }

    rotatePiece() {
        const rotated = {
            ...this.currentPiece,
            shape: this.currentPiece.shape[0].map((_, i) =>
                this.currentPiece.shape.map(row => row[i]).reverse()
            )
        };

        if (this.isValidMove(rotated.x, rotated.y, rotated.shape)) {
            this.currentPiece.shape = rotated.shape;
            return true;
        }
        return false;
    }

    isValidMove(x, y, shape = this.currentPiece.shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;

                    if (newX < 0 || newX >= CONFIG.BOARD.WIDTH || 
                        newY >= CONFIG.BOARD.HEIGHT ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (this.isValidMove(newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }
        return false;
    }

    getGhostPosition() {
        let ghostY = this.currentPiece.y;
        while (this.isValidMove(this.currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    hardDrop() {
        const ghostY = this.getGhostPosition();
        const distance = ghostY - this.currentPiece.y;
        this.currentPiece.y = ghostY;
        return distance;
    }

    lockPiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece.x + col] = this.currentPiece.type;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        let clearedRows = [];

        for (let row = CONFIG.BOARD.HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                clearedRows.push(row);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            // Remove cleared lines
            clearedRows.forEach(row => {
                this.board.splice(row, 1);
                this.board.unshift(Array(CONFIG.BOARD.WIDTH).fill(0));
            });

            // Update score
            const baseScore = CONFIG.SCORING.LINES[linesCleared];
            const phaseMultiplier = CONFIG.SCORING.PHASE_MULTIPLIER[this.currentPhase];
            let comboMultiplier = 1;

            if (this.combo > 0) {
                comboMultiplier = CONFIG.SCORING.COMBO_MULTIPLIER[Math.min(this.combo + 1, 4)] || 1;
            }

            const points = baseScore * phaseMultiplier * comboMultiplier;
            this.score += points;
            this.combo++;
            this.linesCleared += linesCleared;

            return {
                lines: linesCleared,
                points,
                combo: this.combo
            };
        } else {
            this.combo = 0;
            return null;
        }
    }

    calculateTimeBonus() {
        if (this.timeRemaining > 0) {
            return Math.floor(this.linesCleared * (this.timeRemaining / 10) * CONFIG.SCORING.TIME_BONUS_MULTIPLIER);
        }
        return 0;
    }
}
