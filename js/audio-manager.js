class AudioManager {
    constructor() {
        this.currentPhase = 1;
        this.musicElements = {
            1: document.getElementById('music-phase1'),
            2: document.getElementById('music-phase2'),
            3: document.getElementById('music-phase3')
        };
        this.sfx = {
            clearLine: document.getElementById('clear-line'),
            tetris: document.getElementById('tetris-clear')
        };
        
        this.isMuted = false;
        this.setupAudioContext();
    }

    setupAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio sources and gains for each phase
        this.musicSources = {};
        this.musicGains = {};
        
        for (let phase = 1; phase <= 3; phase++) {
            const source = this.audioContext.createMediaElementSource(this.musicElements[phase]);
            const gain = this.audioContext.createGain();
            
            source.connect(gain);
            gain.connect(this.audioContext.destination);
            gain.gain.value = phase === 1 ? 1 : 0;
            
            this.musicSources[phase] = source;
            this.musicGains[phase] = gain;
            
            // Set initial volume
            this.musicElements[phase].volume = 0.5;
        }
    }

    startMusic() {
        if (this.isMuted) return;
        
        // Start all phases but only phase 1 will be audible initially
        Object.values(this.musicElements).forEach(music => {
            music.play().catch(e => console.log('Audio playback failed:', e));
        });
    }

    transitionToPhase(newPhase) {
        if (this.isMuted || newPhase === this.currentPhase) return;
        
        const fadeOutDuration = 1; // seconds
        const fadeInDuration = 1; // seconds
        
        // Fade out current phase
        const currentGain = this.musicGains[this.currentPhase].gain;
        currentGain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOutDuration);
        
        // Fade in new phase
        const newGain = this.musicGains[newPhase].gain;
        newGain.linearRampToValueAtTime(1, this.audioContext.currentTime + fadeInDuration);
        
        this.currentPhase = newPhase;
    }

    playLineClear(lines) {
        if (this.isMuted) return;
        
        if (lines === 4) {
            this.sfx.tetris.currentTime = 0;
            this.sfx.tetris.play().catch(e => console.log('SFX playback failed:', e));
        } else {
            this.sfx.clearLine.currentTime = 0;
            this.sfx.clearLine.play().catch(e => console.log('SFX playback failed:', e));
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            Object.values(this.musicGains).forEach(gain => {
                gain.gain.value = 0;
            });
            Object.values(this.sfx).forEach(sfx => {
                sfx.volume = 0;
            });
        } else {
            this.musicGains[this.currentPhase].gain.value = 1;
            Object.values(this.sfx).forEach(sfx => {
                sfx.volume = 1;
            });
        }
        
        return this.isMuted;
    }

    cleanup() {
        Object.values(this.musicElements).forEach(music => {
            music.pause();
            music.currentTime = 0;
        });
    }
}
