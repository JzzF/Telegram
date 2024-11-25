const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        startOffset: { x: 3, y: -1 }
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        startOffset: { x: 4, y: 0 }
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { x: 3, y: 0 }
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        startOffset: { x: 3, y: 0 }
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { x: 3, y: 0 }
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { x: 3, y: 0 }
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { x: 3, y: 0 }
    }
};

class TetrominoGenerator {
    constructor() {
        this.bag = [];
        this.nextPiece = null;
        this.fillBag();
    }

    fillBag() {
        this.bag = Object.keys(TETROMINOS);
        // Fisher-Yates shuffle
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    getNext() {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        if (!this.nextPiece) {
            this.nextPiece = this.bag.pop();
        }
        const current = this.nextPiece;
        this.nextPiece = this.bag.pop();
        return {
            type: current,
            ...TETROMINOS[current],
            x: TETROMINOS[current].startOffset.x,
            y: TETROMINOS[current].startOffset.y
        };
    }

    peekNext() {
        if (!this.nextPiece) {
            if (this.bag.length === 0) {
                this.fillBag();
            }
            this.nextPiece = this.bag.pop();
        }
        return {
            type: this.nextPiece,
            ...TETROMINOS[this.nextPiece]
        };
    }
}
