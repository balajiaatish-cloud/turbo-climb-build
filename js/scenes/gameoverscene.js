class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.scale;
        const summary = gameState.lastRun;
        const mapId = summary.mapId || getSelectedMap().id;
        const mapName = summary.mapName || getMapById(mapId).name;
        SoundManager.playMusic('gameover');

        this.add.image(width / 2, height / 2, 'backdrop').setTint(0xdce8ff);
        this.add.image(width / 2, height / 2 + 44, 'mountain-far').setAlpha(0.82);
        this.add.image(width / 2, height / 2 + 86, 'mountain-near').setAlpha(0.92);
        this.add.rectangle(width / 2, height / 2, width, height, 0x050b16, 0.42);

        const panel = this.add.image(width / 2, height / 2 + 8, 'panel')
            .setDisplaySize(560, 388)
            .setAlpha(0.98);

        this.add.text(width / 2, panel.y - 126, 'RUN COMPLETE', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '46px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);

        this.add.text(width / 2, panel.y - 94, mapName, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '20px',
            color: '#8ce6ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, panel.y - 62, summary.outcome, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#ffd166',
            align: 'center',
            wordWrap: { width: 410 }
        }).setOrigin(0.5);

        [
            { label: 'Distance', value: `${summary.distance} m`, color: '#ffd166' },
            { label: 'Coins', value: String(summary.coins), color: '#ffe38d' },
            { label: 'Diamonds', value: String(summary.diamonds), color: '#8ce6ff' },
            { label: 'Best', value: `${gameState.bestDistance} m`, color: '#dce8f7' }
        ].forEach((entry, index) => {
            const y = panel.y - 20 + (index * 44);
            this.add.text(panel.x - 160, y, entry.label, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '24px',
                color: '#c8d7eb'
            }).setOrigin(0, 0.5);

            this.add.text(panel.x + 160, y, entry.value, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '24px',
                color: entry.color,
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
        });

        if (summary.heightRewardCoins > 0) {
            this.add.text(width / 2, panel.y + 74, `Height rewards earned: +${summary.heightRewardCoins} coins`, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '17px',
                color: '#ffd166',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        if (summary.recordRank !== null) {
            this.add.text(width / 2, panel.y + (summary.heightRewardCoins > 0 ? 100 : 90), `Saved in ${mapName} records: #${summary.recordRank}`, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '18px',
                color: '#9fe870',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        if (summary.newBest) {
            const ribbon = this.add.text(width / 2, panel.y + (summary.heightRewardCoins > 0 ? 138 : 128), 'NEW PERSONAL BEST', {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#8ff0a4',
                backgroundColor: '#0b3a24',
                padding: { left: 16, right: 16, top: 8, bottom: 8 }
            }).setOrigin(0.5);

            this.tweens.add({
                targets: ribbon,
                alpha: 0.55,
                duration: 700,
                yoyo: true,
                repeat: -1
            });
        }

        const hasUnlockedGoals = summary.unlockedGoals?.length > 0;

        if (hasUnlockedGoals) {
            const unlockSummary = summary.unlockedGoals
                .slice(0, 2)
                .map((entry) => `${entry.kind === 'achievement' ? 'Achievement' : 'Mission'}: ${entry.name}`)
                .join('  |  ');

            this.add.text(width / 2, panel.y + 172, unlockSummary, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '14px',
                color: '#8ce6ff',
                wordWrap: { width: 450 },
                align: 'center'
            }).setOrigin(0.5);
        }

        const records = getRecordsForMap(mapId, 3);
        if (records.length > 0 && !hasUnlockedGoals) {
            this.add.text(width / 2, panel.y + 176, `${mapName} Records`, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '20px',
                color: '#ffd166',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            records.forEach((record, index) => {
                this.add.text(width / 2, panel.y + 204 + (index * 22), `${index + 1}. ${record.distance} m  |  ${record.coins}c  ${record.diamonds}d`, {
                    fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                    fontSize: '15px',
                    color: '#d7e3f4'
                }).setOrigin(0.5);
            });
        }

        createAudioToggle(this, width - 24, 22);
        this.createButton(width / 2 - 255, height - 34, 'RUN AGAIN', () => this.scene.start('GameScene'), 150, 60);
        this.createButton(width / 2 - 85, height - 34, 'MAPS', () => this.scene.start('MapScene'), 150, 60);
        this.createButton(width / 2 + 85, height - 34, 'REWARDS', () => this.scene.start('RewardScene', { returnScene: 'GameOverScene' }), 150, 60);
        this.createButton(width / 2 + 255, height - 34, 'MAIN MENU', () => this.scene.start('TitleScene'), 150, 60);
    }

    createButton(x, y, label, onClick, width = 220, height = 62) {
        const viewport = getViewportProfile();
        const button = this.add.image(x, y, 'button').setDisplaySize(width, height);

        const buttonLabel = this.add.text(x, y, label, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: viewport.isTouch ? (width < 180 ? '20px' : '23px') : (width < 180 ? '21px' : '24px'),
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);
        const baseScaleX = button.scaleX;
        const baseScaleY = button.scaleY;
        const labelBaseScaleX = buttonLabel.scaleX;
        const labelBaseScaleY = buttonLabel.scaleY;
        const hitArea = this.add.zone(x, y, width, height)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            button.setScale(baseScaleX * 1.03, baseScaleY * 1.03);
            buttonLabel.setScale(labelBaseScaleX * 1.03, labelBaseScaleY * 1.03);
        });

        hitArea.on('pointerout', () => {
            button.setScale(baseScaleX, baseScaleY);
            buttonLabel.setScale(labelBaseScaleX, labelBaseScaleY);
        });

        hitArea.on('pointerdown', () => {
            SoundManager.playSfx('button');
            onClick();
        });
    }
}
