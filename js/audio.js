const SoundManager = {
    context: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    unlocked: false,
    currentTrack: null,
    musicTimer: null,
    trackStartedAt: 0,
    trackIndex: 0,
    musicDefinitions: {
        title: {
            tempo: 112,
            wave: 'triangle',
            notes: [
                ['C5', 0.5], ['E5', 0.5], ['G5', 0.75], ['B4', 0.25],
                ['A4', 0.5], ['G4', 0.5], ['E5', 0.5], ['REST', 0.25],
                ['D5', 0.5], ['G5', 0.5], ['A5', 0.75], ['REST', 0.5]
            ]
        },
        gameplay: {
            tempo: 126,
            wave: 'square',
            notes: [
                ['C4', 0.5], ['G4', 0.25], ['A4', 0.25], ['C5', 0.5],
                ['A4', 0.25], ['G4', 0.25], ['E4', 0.5], ['REST', 0.25],
                ['G4', 0.5], ['A4', 0.25], ['C5', 0.25], ['D5', 0.5],
                ['C5', 0.5], ['A4', 0.5], ['G4', 0.5], ['REST', 0.5]
            ]
        },
        gameover: {
            tempo: 90,
            wave: 'sine',
            notes: [
                ['E4', 0.75], ['D4', 0.75], ['C4', 1],
                ['REST', 0.25], ['G3', 0.75], ['C4', 1.25]
            ]
        }
    },

    init() {
        if (this.context) {
            return;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }

        this.context = new AudioContextClass();
        this.masterGain = this.context.createGain();
        this.musicGain = this.context.createGain();
        this.sfxGain = this.context.createGain();

        this.masterGain.gain.value = gameState.audio.muted ? 0 : 0.6;
        this.musicGain.gain.value = 0.22;
        this.sfxGain.gain.value = 0.4;

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);
    },

    attachUnlockListeners() {
        const unlock = () => {
            this.resume();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };

        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    },

    resume() {
        this.init();
        if (!this.context) {
            return;
        }

        const wasUnlocked = this.unlocked;
        const wasSuspended = this.context.state === 'suspended';

        if (wasSuspended) {
            this.context.resume();
        }

        this.unlocked = true;

        if (this.currentTrack && (!wasUnlocked || wasSuspended)) {
            this.startTrack(this.currentTrack, true);
        }
    },

    setMuted(muted) {
        gameState.audio.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.6, this.context.currentTime + 0.08);
        }
        saveGameData();
    },

    toggleMuted() {
        this.setMuted(!gameState.audio.muted);
        if (!gameState.audio.muted) {
            this.resume();
        }
        return gameState.audio.muted;
    },

    playMusic(trackName) {
        this.currentTrack = trackName;
        if (gameState.audio.muted) {
            return;
        }

        this.resume();
        this.startTrack(trackName, false);
    },

    startTrack(trackName, restartEvenIfSame) {
        if (!this.context || gameState.audio.muted || !this.unlocked) {
            return;
        }

        if (!restartEvenIfSame && this.activeTrackName === trackName) {
            return;
        }

        this.stopMusic();
        this.activeTrackName = trackName;
        this.trackIndex = 0;
        this.trackStartedAt = this.context.currentTime + 0.02;
        this.scheduleTrackNotes(trackName);
    },

    scheduleTrackNotes(trackName) {
        const definition = this.musicDefinitions[trackName];
        if (!definition || !this.context || gameState.audio.muted) {
            return;
        }

        const beatDuration = 60 / definition.tempo;
        let scheduledTime = this.trackStartedAt;

        definition.notes.forEach(([note, beats]) => {
            if (note !== 'REST') {
                this.playTone({
                    note,
                    startTime: scheduledTime,
                    duration: beatDuration * beats * 0.92,
                    volume: 0.15,
                    type: definition.wave,
                    target: this.musicGain,
                    attack: 0.01,
                    release: 0.1
                });
            }
            scheduledTime += beatDuration * beats;
        });

        const loopDurationMs = Math.max(240, (scheduledTime - this.trackStartedAt) * 1000 - 120);
        this.musicTimer = window.setTimeout(() => {
            this.trackStartedAt = this.context.currentTime + 0.02;
            this.scheduleTrackNotes(trackName);
        }, loopDurationMs);
    },

    stopMusic() {
        if (this.musicTimer) {
            window.clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
        this.activeTrackName = null;
    },

    playSfx(name) {
        if (gameState.audio.muted) {
            return;
        }

        this.resume();
        if (!this.context || !this.unlocked) {
            return;
        }

        const now = this.context.currentTime + 0.01;
        switch (name) {
            case 'button':
                this.playTone({ note: 'C5', startTime: now, duration: 0.07, volume: 0.13, type: 'square', target: this.sfxGain });
                this.playTone({ note: 'E5', startTime: now + 0.03, duration: 0.09, volume: 0.1, type: 'triangle', target: this.sfxGain });
                break;
            case 'jump':
                this.playSweep(now, 250, 520, 0.13, 0.12, 'square');
                break;
            case 'coin':
                this.playTone({ note: 'C6', startTime: now, duration: 0.07, volume: 0.12, type: 'triangle', target: this.sfxGain });
                this.playTone({ note: 'E6', startTime: now + 0.05, duration: 0.09, volume: 0.1, type: 'triangle', target: this.sfxGain });
                break;
            case 'diamond':
                this.playTone({ note: 'G5', startTime: now, duration: 0.1, volume: 0.11, type: 'sine', target: this.sfxGain });
                this.playTone({ note: 'C6', startTime: now + 0.06, duration: 0.13, volume: 0.12, type: 'triangle', target: this.sfxGain });
                this.playTone({ note: 'E6', startTime: now + 0.11, duration: 0.16, volume: 0.11, type: 'triangle', target: this.sfxGain });
                break;
            case 'fuel':
                this.playSweep(now, 220, 400, 0.12, 0.16, 'triangle');
                break;
            case 'repair':
                this.playTone({ note: 'A4', startTime: now, duration: 0.08, volume: 0.1, type: 'sine', target: this.sfxGain });
                this.playTone({ note: 'D5', startTime: now + 0.05, duration: 0.12, volume: 0.12, type: 'sine', target: this.sfxGain });
                break;
            case 'hit':
                this.playNoise(now, 0.12, 0.12);
                this.playSweep(now, 180, 90, 0.09, 0.15, 'sawtooth');
                break;
            case 'land':
                this.playSweep(now, 180, 110, 0.06, 0.08, 'triangle');
                break;
            case 'gameover':
                this.playSweep(now, 260, 90, 0.18, 0.38, 'sawtooth');
                this.playTone({ note: 'C4', startTime: now + 0.08, duration: 0.22, volume: 0.08, type: 'sine', target: this.sfxGain });
                break;
            case 'record':
                this.playTone({ note: 'C5', startTime: now, duration: 0.08, volume: 0.11, type: 'triangle', target: this.sfxGain });
                this.playTone({ note: 'E5', startTime: now + 0.06, duration: 0.1, volume: 0.11, type: 'triangle', target: this.sfxGain });
                this.playTone({ note: 'G5', startTime: now + 0.12, duration: 0.15, volume: 0.11, type: 'triangle', target: this.sfxGain });
                break;
            default:
                break;
        }
    },

    playTone({ note, startTime, duration, volume, type, target, attack = 0.008, release = 0.08 }) {
        if (!this.context) {
            return;
        }

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(this.noteToFrequency(note), startTime);

        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

        oscillator.connect(gainNode);
        gainNode.connect(target);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + release + 0.02);
    },

    playSweep(startTime, fromFrequency, toFrequency, volume, duration, type) {
        if (!this.context) {
            return;
        }

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(fromFrequency, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, toFrequency), startTime + duration);

        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.06);

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.08);
    },

    playNoise(startTime, volume, duration) {
        if (!this.context) {
            return;
        }

        const bufferSize = Math.floor(this.context.sampleRate * duration);
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < bufferSize; index += 1) {
            data[index] = (Math.random() * 2 - 1) * (1 - (index / bufferSize));
        }

        const source = this.context.createBufferSource();
        const filter = this.context.createBiquadFilter();
        const gainNode = this.context.createGain();

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, startTime);

        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        source.start(startTime);
        source.stop(startTime + duration);
    },

    noteToFrequency(note) {
        const noteMap = {
            C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
            'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11
        };
        const [, pitch, octaveString] = note.match(/^([A-G]#?)(\d)$/);
        const midi = ((parseInt(octaveString, 10) + 1) * 12) + noteMap[pitch];
        return 440 * (2 ** ((midi - 69) / 12));
    }
};

function createAudioToggle(scene, x, y) {
    const viewport = getViewportProfile();
    const button = scene.add.text(x, y, gameState.audio.muted ? 'Sound: Off' : 'Sound: On', {
        fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
        fontSize: viewport.audioFontSize,
        color: '#dce8f7',
        backgroundColor: 'rgba(8, 17, 31, 0.75)',
        padding: {
            left: viewport.audioPaddingX,
            right: viewport.audioPaddingX,
            top: viewport.audioPaddingY,
            bottom: viewport.audioPaddingY
        }
    })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(60);

    let hitArea = null;
    const baseScaleX = button.scaleX;
    const baseScaleY = button.scaleY;

    const refreshLabel = () => {
        button.setText(gameState.audio.muted ? 'Sound: Off' : 'Sound: On');
        const bounds = button.getBounds();
        if (!hitArea) {
            hitArea = scene.add.zone(bounds.centerX, bounds.centerY, bounds.width, bounds.height)
                .setScrollFactor(0)
                .setDepth(61)
                .setInteractive({ useHandCursor: true });
        } else {
            hitArea.setPosition(bounds.centerX, bounds.centerY);
            hitArea.setSize(bounds.width, bounds.height);
            hitArea.input.hitArea.setTo(0, 0, bounds.width, bounds.height);
        }
    };

    refreshLabel();

    hitArea.on('pointerover', () => button.setScale(baseScaleX * 1.02, baseScaleY * 1.02));
    hitArea.on('pointerout', () => button.setScale(baseScaleX, baseScaleY));
    hitArea.on('pointerdown', () => {
        SoundManager.toggleMuted();
        if (!gameState.audio.muted) {
            SoundManager.playSfx('button');
        }
        refreshLabel();
    });

    return button;
}
