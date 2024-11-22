class Controls {
    constructor(game) {
        this.game = game;
        this.touchStartX = null;
        this.touchStartY = null;
        this.setupControls();
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Touch controls
        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        gameCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        gameCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Button controls
        document.getElementById('left-btn').addEventListener('click', () => this.game.movePiece(-1, 0));
        document.getElementById('right-btn').addEventListener('click', () => this.game.movePiece(1, 0));
        document.getElementById('rotate-btn').addEventListener('click', () => this.game.rotatePiece());
        document.getElementById('soft-drop-btn').addEventListener('click', () => this.game.movePiece(0, 1));
        document.getElementById('hard-drop-btn').addEventListener('click', () => this.game.hardDrop());

        // Telegram WebApp back button
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.onClick(() => {
                if (this.game.state === 'playing') {
                    this.game.pause();
                } else {
                    window.Telegram.WebApp.close();
                }
            });
        }
    }

    handleKeyDown(event) {
        if (this.game.gameState.gameOver || this.game.gameState.paused) return;

        switch (event.code) {
            case 'ArrowLeft':
                event.preventDefault();
                this.game.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.game.movePiece(1, 0);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.game.rotatePiece();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.game.movePiece(0, 1);
                break;
            case 'Space':
                event.preventDefault();
                this.game.hardDrop();
                break;
            case 'Escape':
                event.preventDefault();
                this.game.pause();
                break;
        }
    }

    handleTouchStart(event) {
        if (this.game.gameState.gameOver || this.game.gameState.paused) return;
        
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.lastMoveTime = Date.now();
    }

    handleTouchMove(event) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touch = event.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const now = Date.now();

        // Require minimum movement to trigger action
        const minSwipeDistance = 30;
        
        // Handle horizontal swipes
        if (Math.abs(deltaX) > minSwipeDistance && now - this.lastMoveTime > 100) {
            if (deltaX > 0) {
                this.game.movePiece(1, 0);
            } else {
                this.game.movePiece(-1, 0);
            }
            this.touchStartX = touch.clientX;
            this.lastMoveTime = now;
        }

        // Handle vertical swipes (soft drop)
        if (deltaY > minSwipeDistance && now - this.lastMoveTime > 50) {
            this.game.movePiece(0, 1);
            this.touchStartY = touch.clientY;
            this.lastMoveTime = now;
        }
    }

    handleTouchEnd(event) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Tap detection for rotation
        if (moveDistance < 10) {
            this.game.rotatePiece();
        }
        // Quick swipe up for hard drop
        else if (deltaY < -50 && Math.abs(deltaY) > Math.abs(deltaX)) {
            this.game.hardDrop();
        }

        this.touchStartX = null;
        this.touchStartY = null;
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.removeEventListener('touchstart', this.handleTouchStart);
        gameCanvas.removeEventListener('touchmove', this.handleTouchMove);
        gameCanvas.removeEventListener('touchend', this.handleTouchEnd);
    }
}
