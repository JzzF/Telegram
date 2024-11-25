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
            restartButton.addEventListener('click', () => this.restart());
        }

        // Share button
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => this.shareScore());
        }

        // Mobile controls
        const leftButton = document.getElementById('left-button');
        const rightButton = document.getElementById('right-button');
        const rotateButton = document.getElementById('rotate-button');
        const downButton = document.getElementById('down-button');

        if (leftButton) leftButton.addEventListener('touchstart', () => this.moveLeft());
        if (rightButton) rightButton.addEventListener('touchstart', () => this.moveRight());
        if (rotateButton) rotateButton.addEventListener('touchstart', () => this.rotate());
        if (downButton) downButton.addEventListener('touchstart', () => this.moveDown());
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
            canvas.width = 300;
            canvas.height = 600;
        }
    }

    start() {
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (startScreen) startScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        
        this.gameState.reset();
        this.audioManager.startMusic();
        this.spawnPiece();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restart() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (gameOverScreen) gameOverScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        
        this.gameState.reset();
        this.audioManager.startMusic();
        this.spawnPiece();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop(currentTime = performance.now()) {
        if (this.gameState.gameOver) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update time
        this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - deltaTime / 1000);
        document.getElementById('time-remaining').textContent = Math.ceil(this.gameState.timeRemaining);

        // Check phase change
        if (this.gameState.updatePhase()) {
            const newPhase = this.gameState.currentPhase;
            document.getElementById('phase-number').textContent = newPhase;
            this.audioManager.transitionToPhase(newPhase);
            this.animationManager.playPhaseTransition(newPhase);
        }

        // Move piece down
        if (currentTime - this.gameState.lastMoveTime > this.gameState.dropInterval) {
            this.gameState.lastMoveTime = currentTime;
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
        }

        // Update display
        this.renderer.render(this.gameState);
        document.getElementById('score').textContent = this.gameState.score;

        // Check game over conditions
        if (this.gameState.timeRemaining <= 0 || this.gameState.gameOver) {
            this.endGame();
            return;
        }

        requestAnimationFrame(time => this.gameLoop(time));
    }

    spawnPiece() {
        if (!this.gameState.spawnPiece()) {
            this.endGame();
            return false;
        }
        return true;
    }

    movePiece(dx, dy) {
        return this.gameState.movePiece(dx, dy);
    }

    rotatePiece() {
        return this.gameState.rotatePiece();
    }

    hardDrop() {
        const distance = this.gameState.hardDrop();
        this.lockPiece();
        return distance;
    }

    lockPiece() {
        this.gameState.lockPiece();
        const clearResult = this.gameState.clearLines();
        
        if (clearResult && clearResult.lines.length > 0) {
            // Play line clear animation and sound
            this.animationManager.playLinesClearAnimation(clearResult);
            this.audioManager.playLineClear(clearResult.lines.length);
            
            // Show score popup
            const canvas = document.getElementById('game-canvas');
            const rect = canvas.getBoundingClientRect();
            this.animationManager.playScorePopup(
                clearResult.points,
                rect.left + canvas.width / 2,
                rect.top + canvas.height / 2
            );
            
            // Show combo if applicable
            if (clearResult.combo > 1) {
                this.animationManager.playComboAnimation(clearResult.combo);
            }
        }
        
        this.spawnPiece();
    }

    endGame() {
        this.gameState.gameOver = true;
        this.audioManager.cleanup();
        
        // Play game over animation
        this.animationManager.playGameOverAnimation(() => {
            // Show game over screen
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('game-over-screen').classList.remove('hidden');
            
            // Update score display
            document.getElementById('final-score').textContent = this.gameState.score;
            document.getElementById('total-score').textContent = this.gameState.score;
            
            // Update high score if needed
            if (this.gameState.score > this.gameState.highScore) {
                this.gameState.highScore = this.gameState.score;
                localStorage.setItem('highScore', this.gameState.score.toString());
            }
        });
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

    cleanup() {
        this.controls.cleanup();
        this.audioManager.cleanup();
        this.animationManager.cleanup();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
});
