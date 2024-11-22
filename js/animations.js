class AnimationManager {
    constructor(game) {
        this.game = game;
        this.activeAnimations = new Set();
    }

    playLinesClearAnimation(rows, callback) {
        const animationId = Symbol('linesClear');
        this.activeAnimations.add(animationId);

        // Create flash effect for each row
        rows.forEach(row => {
            const rowBlocks = [];
            for (let x = 0; x < CONFIG.BOARD.WIDTH; x++) {
                const block = document.createElement('div');
                block.className = 'lines-clear';
                block.style.position = 'absolute';
                block.style.left = `${x * CONFIG.BOARD.BLOCK_SIZE}px`;
                block.style.top = `${row * CONFIG.BOARD.BLOCK_SIZE}px`;
                block.style.width = `${CONFIG.BOARD.BLOCK_SIZE}px`;
                block.style.height = `${CONFIG.BOARD.BLOCK_SIZE}px`;
                block.style.backgroundColor = '#fff';
                document.getElementById('game-canvas').appendChild(block);
                rowBlocks.push(block);
            }

            // Remove blocks after animation
            setTimeout(() => {
                rowBlocks.forEach(block => block.remove());
                if (callback) callback();
                this.activeAnimations.delete(animationId);
            }, 300);
        });
    }

    playScorePopup(points, x, y) {
        const animationId = Symbol('scorePopup');
        this.activeAnimations.add(animationId);

        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        document.body.appendChild(popup);

        // Remove popup after animation
        setTimeout(() => {
            popup.remove();
            this.activeAnimations.delete(animationId);
        }, 1000);
    }

    playComboAnimation(combo) {
        const animationId = Symbol('combo');
        this.activeAnimations.add(animationId);

        const comboCounter = document.getElementById('combo-counter');
        comboCounter.textContent = `Combo x${combo}`;
        comboCounter.classList.add('combo-flash');

        // Remove flash class after animation
        setTimeout(() => {
            comboCounter.classList.remove('combo-flash');
            this.activeAnimations.delete(animationId);
        }, 500);
    }

    playPhaseTransition(phase) {
        const animationId = Symbol('phaseTransition');
        this.activeAnimations.add(animationId);

        const transition = document.createElement('div');
        transition.className = 'phase-transition';
        transition.textContent = `Phase ${phase}`;
        document.body.appendChild(transition);

        // Remove transition after animation
        setTimeout(() => {
            transition.remove();
            this.activeAnimations.delete(animationId);
        }, 2000);
    }

    playGameOverAnimation(callback) {
        const animationId = Symbol('gameOver');
        this.activeAnimations.add(animationId);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        overlay.style.transition = 'background-color 1s ease-in-out';
        document.body.appendChild(overlay);

        // Fade in overlay
        requestAnimationFrame(() => {
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });

        // Remove overlay and execute callback
        setTimeout(() => {
            overlay.remove();
            if (callback) callback();
            this.activeAnimations.delete(animationId);
        }, 1000);
    }

    hasActiveAnimations() {
        return this.activeAnimations.size > 0;
    }

    cleanup() {
        this.activeAnimations.clear();
    }
}
