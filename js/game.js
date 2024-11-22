class Game {
    constructor() {
        this.gameState = new GameState();
        this.renderer = new Renderer(
            document.getElementById('game-canvas'),
            document.getElementById('preview-canvas')
        );
        this.audioManager = new AudioManager();
        this.animationManager = new AnimationManager(this);
        this.controls = new Controls(this);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => this.start());
        document.getElementById('retry-button').addEventListener('click', () => this.restart());
        document.getElementById('quit-button').addEventListener('click', () => {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.close();
            }
        });
    }

    start() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.gameState.reset();
        this.audioManager.startMusic();
        this.spawnPiece();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restart() {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.gameState.reset();
        this.audioManager.startMusic();
        this.spawnPiece();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    pause() {
        this.gameState.paused = !this.gameState.paused;
        if (this.gameState.paused) {
            // Show pause overlay
            const overlay = document.createElement('div');
            overlay.id = 'pause-overlay';
            overlay.className = 'screen';
            overlay.innerHTML = '<h2>Paused</h2><button id="resume-btn">Resume</button>';
            document.body.appendChild(overlay);
            
            document.getElementById('resume-btn').addEventListener('click', () => this.pause());
        } else {
            // Remove pause overlay
            const overlay = document.getElementById('pause-overlay');
            if (overlay) overlay.remove();
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    gameLoop(currentTime = performance.now()) {
        if (this.gameState.gameOver || this.gameState.paused) return;

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
        
        if (clearResult) {
            // Play line clear animation and sound
            this.animationManager.playLinesClearAnimation(clearResult.lines);
            this.audioManager.playLineClear(clearResult.lines);
            
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
        
        // Calculate final score with time bonus
        const timeBonus = this.gameState.calculateTimeBonus();
        const finalScore = this.gameState.score + timeBonus;
        
        // Update high score
        if (finalScore > this.gameState.highScore) {
            this.gameState.highScore = finalScore;
            localStorage.setItem('highScore', finalScore.toString());
        }
        
        // Play game over animation
        this.animationManager.playGameOverAnimation(() => {
            // Show game over screen
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('game-over-screen').classList.remove('hidden');
            
            // Update score displays
            document.getElementById('final-score').textContent = this.gameState.score;
            document.getElementById('time-bonus').textContent = timeBonus;
            document.getElementById('total-score').textContent = finalScore;
        });
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
