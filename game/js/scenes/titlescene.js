class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const { width, height } = this.scale;
        const viewport = getViewportProfile();
        SoundManager.playMusic('title');
        const selectedVehicle = getSelectedVehicle();
        const selectedMap = getSelectedMap();
        const mapRecords = getRecordsForMap(selectedMap.id, 3);

        this.add.image(width / 2, height / 2, 'backdrop');
        this.add.image(width / 2, height / 2 + 44, 'mountain-far').setAlpha(0.85);
        this.add.image(width / 2, height / 2 + 86, 'mountain-near').setAlpha(0.95);

        this.createClouds();

        const buggy = this.add.sprite(802, 150, selectedVehicle.texture).setScale(viewport.isCompact ? 1 : 1.08).setAngle(-6);
        this.tweens.add({
            targets: buggy,
            y: '+=10',
            angle: 4,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const header = this.add.text(width / 2, 74, 'HILL CLIMB RACER', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '50px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 118, 'Boost upward, chase rare gems, and survive the climb.', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '20px',
            color: '#ffd166'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: header,
            scaleX: 1.015,
            scaleY: 1.015,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const statsPanel = this.add.image(178, 316, 'panel')
            .setDisplaySize(268, 256)
            .setAlpha(0.96);

        this.add.text(statsPanel.x - 106, statsPanel.y - 98, 'Garage Stats', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f8fbff'
        });

        const statLines = [
            `Best climb: ${gameState.bestDistance} m`,
            `Saved coins: ${gameState.totalCoins}`,
            `Saved diamonds: ${gameState.totalDiamonds}`,
            `Garage: ${getOwnedVehicleCount()}/${VEHICLE_DEFS.length} vehicles`,
            `Vehicle: ${selectedVehicle.name}`,
            `Map: ${selectedMap.name}`
        ];

        statLines.forEach((line, index) => {
            this.add.text(statsPanel.x - 106, statsPanel.y - 56 + (index * 24), line, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '15px',
                color: index === 0 || index >= 4 ? '#ffd166' : '#dce8f7'
            });
        });

        this.add.text(statsPanel.x - 106, statsPanel.y + 86, `Goals: ${getCompletedMissionCount()}/${MISSION_DEFS.length} missions  |  ${getCompletedAchievementCount()}/${ACHIEVEMENT_DEFS.length} achievements`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '12px',
            color: '#9fe870',
            wordWrap: { width: 212 }
        });

        this.add.text(statsPanel.x - 106, statsPanel.y + 114, 'Vehicle, map, and goal progress stay saved between runs.', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '12px',
            color: '#b9d1f0',
            wordWrap: { width: 212 }
        });

        const controlsPanel = this.add.image(480, 316, 'panel')
            .setDisplaySize(266, 256)
            .setAlpha(0.92);

        this.add.text(controlsPanel.x - 104, controlsPanel.y - 98, 'Controls', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f8fbff'
        });

        [
            'A / Left: steer left',
            'D / Right: steer right',
            'W / Up / Space: boost jump',
            'Higher climbs bring harder terrain'
        ].forEach((line, index) => {
            this.add.text(controlsPanel.x - 104, controlsPanel.y - 56 + (index * 24), line, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '15px',
                color: '#dce8f7'
            });
        });

        if (gameState.supportsTouch) {
            this.add.text(controlsPanel.x - 104, controlsPanel.y + 72, 'Touch mode adds on-screen steering and boost buttons.', {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '12px',
                color: '#9db4d0',
                wordWrap: { width: 210 }
            });
        }

        const recordsPanel = this.add.image(782, 316, 'panel')
            .setDisplaySize(268, 256)
            .setAlpha(0.94);

        this.add.text(recordsPanel.x - 104, recordsPanel.y - 98, `${selectedMap.name} Records`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffd166'
        });

        const records = mapRecords.length > 0
            ? mapRecords
            : [{ distance: 0, coins: 0, diamonds: 0, mapId: selectedMap.id }];

        records.forEach((record, index) => {
            const rank = index + 1;
            const y = recordsPanel.y - 56 + (index * 28);
            const label = record.distance > 0
                ? `${rank}. ${record.distance} m  |  ${record.coins}c  ${record.diamonds}d`
                : `${rank}. No saved run yet`;

            this.add.text(recordsPanel.x - 104, y, label, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '15px',
                color: rank === 1 ? '#f8fbff' : '#c7d8ef'
            });
        });

        if (gameState.lastRun.distance > 0) {
            this.add.text(recordsPanel.x - 104, recordsPanel.y + 52, `Last run: ${gameState.lastRun.mapName || selectedMap.name}`, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '14px',
                color: '#9db4d0'
            });
            this.add.text(recordsPanel.x - 104, recordsPanel.y + 74, `${gameState.lastRun.distance} m  |  ${gameState.lastRun.coins}c  ${gameState.lastRun.diamonds}d`, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '14px',
                color: '#b9d1f0'
            });
        }

        createAudioToggle(this, width - 24, 22);
        this.createButton(width / 2 - 336, height - 64, 'START', () => this.scene.start('GameScene'), 128, 58);
        this.createButton(width / 2 - 168, height - 64, 'GARAGE', () => this.scene.start('ShopScene'), 128, 58);
        this.createButton(width / 2, height - 64, 'MAPS', () => this.scene.start('MapScene'), 128, 58);
        this.createButton(width / 2 + 168, height - 64, 'REWARDS', () => this.scene.start('RewardScene', { returnScene: 'TitleScene' }), 128, 58);
        this.createButton(width / 2 + 336, height - 64, 'GOALS', () => this.scene.start('GoalsScene', { returnScene: 'TitleScene' }), 128, 58);

        const launchHint = gameState.supportsTouch
            ? 'Tap START to launch a run'
            : 'Press Enter or tap START to launch a run';

        this.add.text(width / 2, height - 20, launchHint, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: viewport.isPhone ? '15px' : '16px',
            color: '#8da7c7'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
        this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
    }

    createClouds() {
        const cloudPositions = [
            { x: 110, y: 90, scale: 0.9, duration: 22000 },
            { x: 440, y: 150, scale: 1.05, duration: 26000 },
            { x: 770, y: 110, scale: 0.8, duration: 21000 }
        ];

        cloudPositions.forEach((cloudData, index) => {
            const cloud = this.add.image(cloudData.x, cloudData.y, 'cloud')
                .setScale(cloudData.scale)
                .setAlpha(0.82 - (index * 0.08));

            this.tweens.add({
                targets: cloud,
                x: cloudData.x + 36,
                duration: cloudData.duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createButton(x, y, label, onClick, width = 260, height = 68) {
        const viewport = getViewportProfile();
        const button = this.add.image(x, y, 'button').setDisplaySize(width, height);
        const buttonLabel = this.add.text(x, y, label, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: viewport.isTouch ? (width < 250 ? '22px' : '26px') : (width < 250 ? '24px' : '28px'),
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
