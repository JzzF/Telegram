class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array(CONFIG.BOARD.HEIGHT).fill().map(() => Array(CONFIG.BOARD.WIDTH).fill(0));
        this.currentPiece = null;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.gameOver = false;
        this.timeRemaining = CONFIG.GAME.TOTAL_TIME;
        this.currentPhase = 1;
        this.lastMoveTime = 0;
        this.dropInterval = 1000 / CONFIG.GAME.PHASES[1].SPEED;
        this.tetrominoGenerator = new TetrominoGenerator();
    }

    updatePhase() {
        const prevPhase = this.currentPhase;
        for (let phase = 3; phase >= 1; phase--) {
            if (this.timeRemaining <= CONFIG.GAME.PHASES[phase].START_TIME &&
                this.timeRemaining > CONFIG.GAME.PHASES[phase].END_TIME) {
                this.currentPhase = phase;
                break;
            }
        }
        
        if (prevPhase !== this.currentPhase) {
            this.dropInterval = 1000 / CONFIG.GAME.PHASES[this.currentPhase].SPEED;
            return true;
        }
        return false;
    }
}

class TetrominoGenerator {
    constructor() {
        this.pieces = [
            [ // I
                [1, 1, 1, 1]
            ],
            [ // O
                [1, 1],
                [1, 1]
            ],
            [ // T
                [0, 1, 0],
                [1, 1, 1]
            ],
            [ // S
                [0, 1, 1],
                [1, 1, 0]
            ],
            [ // Z
                [1, 1, 0],
                [0, 1, 1]
            ],
            [ // J
                [1, 0, 0],
                [1, 1, 1]
            ],
            [ // L
                [0, 0, 1],
                [1, 1, 1]
            ]
        ];
        this.nextPieces = [];
        this.fillBag();
    }

    fillBag() {
        const newPieces = [...this.pieces];
        for (let i = newPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
        }
        this.nextPieces.push(...newPieces);
    }

    getNextPiece() {
        if (this.nextPieces.length < 7) {
            this.fillBag();
        }
        return this.nextPieces.shift();
    }
}
