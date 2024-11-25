class GameState {
    constructor() {
        this.scoring = new ScoringSystem();
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
        this.score = 0;
        this.combo = 0;
        this.linesCleared = 0;
        this.timeRemaining = CONFIG.GAME.TOTAL_TIME;
        this.currentPhase = 1;
        this.lastMoveTime = 0;
        this.dropInterval = CONFIG.INITIAL_DELAY;
        this.piecesSincePreview = 0;
        this.scoring.reset();
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
        if (this.getScore() > this.getHighScore()) {
            this.scoring.setHighScore(this.getScore());
            localStorage.setItem('highScore', this.getHighScore().toString());
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
        let clearedRows = [];

        // Find completed lines from bottom to top
        for (let row = CONFIG.BOARD.HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                clearedRows.push(row);
            }
        }

        if (clearedRows.length === 0) return null;

        // Calculate score before modifying the board
        const scoreResult = this.scoring.calculateLinesClear(clearedRows.length);
        
        // Sort rows in descending order to remove from bottom to top
        clearedRows.sort((a, b) => b - a);
        
        // Remove all completed lines at once
        clearedRows.forEach(row => {
            this.board.splice(row, 1);
        });
        
        // Add new empty lines at the top
        for (let i = 0; i < clearedRows.length; i++) {
            this.board.unshift(Array(CONFIG.BOARD.WIDTH).fill(0));
        }

        // Update total lines cleared and score
        this.linesCleared += clearedRows.length;
        this.score = this.scoring.getScore();
        
        return {
            lines: clearedRows,
            count: clearedRows.length,
            points: scoreResult.points,
            combo: scoreResult.combo
        };
    }

    calculateTimeBonus() {
        return this.scoring.calculateTimeBonus(this.timeRemaining);
    }

    getScore() {
        return this.scoring.getScore();
    }

    getHighScore() {
        return this.scoring.getHighScore();
    }
}
