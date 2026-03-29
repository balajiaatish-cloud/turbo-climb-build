class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create() {
        const { width, height } = this.scale;
        SoundManager.init();

        this.cameras.main.setBackgroundColor('#07111e');

        this.add.rectangle(width / 2, height / 2, width, height, 0x07111e);
        this.add.circle(width * 0.78, height * 0.2, 56, 0xffc857, 1);
        this.add.circle(width * 0.78, height * 0.2, 84, 0xffffff, 0.1);

        const title = this.add.text(width / 2, height / 2 - 68, 'HILL CLIMB RACER', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '48px',
            color: '#f8fbff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, height / 2 - 14, 'Turbo ascent edition', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '22px',
            color: '#ffd166'
        }).setOrigin(0.5);

        const status = this.add.text(width / 2, height / 2 + 74, 'Generating world...', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '20px',
            color: '#d7e3f4'
        }).setOrigin(0.5);

        const progressTrack = this.add.rectangle(width / 2, height / 2 + 126, 280, 14, 0x12304f, 1).setOrigin(0.5);
        const progressFill = this.add.rectangle(width / 2 - 136, height / 2 + 126, 8, 14, 0xffb703, 1).setOrigin(0, 0.5);

        this.tweens.add({
            targets: [title, subtitle],
            y: '-=6',
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        GameGraphics.createAll(this);

        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 650,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
                const value = tween.getValue();
                progressFill.displayWidth = 8 + ((value / 100) * 272);
                status.setText(value >= 100 ? 'Ready to climb' : `Generating world... ${Math.round(value)}%`);
            },
            onComplete: () => {
                this.time.delayedCall(160, () => {
                    this.scene.start('TitleScene');
                });
            }
        });

        progressTrack.setStrokeStyle(2, 0xffffff, 0.12);
    }
}
