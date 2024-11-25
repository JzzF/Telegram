class Controls {
    constructor(game) {
        this.game = game;
        this.touchStartX = null;
        this.touchStartY = null;
        this.lastMoveTime = null;
        this.hasMoved = false;
        this.setupControls();
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Touch controls
        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        gameCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        gameCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

        // Prevent default touch behaviors on game area
        document.getElementById('game-screen').addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Button controls
        document.getElementById('left-btn').addEventListener('click', () => this.game.movePiece(-1, 0));
        document.getElementById('right-btn').addEventListener('click', () => this.game.movePiece(1, 0));
        document.getElementById('rotate-btn').addEventListener('click', () => this.game.rotatePiece());
        document.getElementById('soft-drop-btn').addEventListener('click', () => this.game.movePiece(0, 1));
        document.getElementById('hard-drop-btn').addEventListener('click', () => this.game.hardDrop());

        // Initialize Telegram WebApp settings
        if (window.Telegram?.WebApp) {
            // Disable swipe to back gesture
            window.Telegram.WebApp.setBackgroundColor('#000000');
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.enableClosingConfirmation();
            
            // Handle back button
            window.Telegram.WebApp.BackButton.onClick(() => {
                window.Telegram.WebApp.close();
            });
        }
    }

    handleKeyDown(event) {
        if (this.game.gameState.gameOver) return;

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
        }
    }

    handleTouchStart(event) {
        if (this.game.gameState.gameOver) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.lastMoveTime = Date.now();
        this.hasMoved = false;
    }

    handleTouchMove(event) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const currentTime = Date.now();
        
        // Minimum distance required for a swipe (in pixels)
        const minSwipeDistance = 30;
        
        // Minimum time between moves (in milliseconds)
        const moveDelay = 100;
        
        if (currentTime - this.lastMoveTime > moveDelay) {
            // Horizontal movement
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.game.movePiece(1, 0);
                } else {
                    this.game.movePiece(-1, 0);
                }
                this.touchStartX = touch.clientX;
                this.lastMoveTime = currentTime;
                this.hasMoved = true;
            }
            // Vertical movement (downward for hard drop)
            else if (deltaY > minSwipeDistance && deltaY > Math.abs(deltaX)) {
                this.game.hardDrop();
                this.touchStartY = touch.clientY;
                this.lastMoveTime = currentTime;
                this.hasMoved = true;
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        // If no movement was made, treat it as a tap for rotation
        if (!this.hasMoved && this.touchStartX !== null) {
            this.game.rotatePiece();
        }
        this.touchStartX = null;
        this.touchStartY = null;
        this.hasMoved = false;
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.removeEventListener('touchstart', this.handleTouchStart);
        gameCanvas.removeEventListener('touchmove', this.handleTouchMove);
        gameCanvas.removeEventListener('touchend', this.handleTouchEnd);
    }
}
