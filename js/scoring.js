class ScoringSystem {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    }

    calculateLinesClear(lines) {
        const basePoints = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };

        // Calculate points with combo multiplier
        let points = basePoints[lines] || 0;
        if (lines > 0) {
            this.combo++;
            points *= Math.min(this.combo, 5); // Cap combo multiplier at 5x
        } else {
            this.combo = 0;
        }

        this.addPoints(points);
        return {
            points,
            combo: this.combo
        };
    }

    calculateTimeBonus(timeRemaining) {
        const bonus = Math.floor(timeRemaining * 100); // 100 points per second remaining
        this.addPoints(bonus);
        return bonus;
    }

    addPoints(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore.toString());
        }
    }

    reset() {
        this.score = 0;
        this.combo = 0;
    }

    getScore() {
        return this.score;
    }

    getHighScore() {
        return this.highScore;
    }
}
