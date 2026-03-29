class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const { width, height } = this.scale;
        SoundManager.playMusic('title');
        this.noticeMessage = this.noticeMessage || '';
        this.scrollOffset = 0;
        this.minScrollOffset = 0;
        this.draggingScroll = false;
        this.lastPointerY = 0;

        this.add.image(width / 2, height / 2, 'backdrop');
        this.add.image(width / 2, height / 2 + 44, 'mountain-far').setAlpha(0.85);
        this.add.image(width / 2, height / 2 + 86, 'mountain-near').setAlpha(0.95);
        this.add.rectangle(width / 2, height / 2, width, height, 0x050b16, 0.26);

        this.add.text(width / 2, 48, 'GARAGE AND SHOP', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '44px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 84, 'Buy new rides, tune your build, and choose your next climb setup.', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#ffd166'
        }).setOrigin(0.5);

        this.scrollView = {
            x: 22,
            y: 112,
            width: 916,
            height: 332
        };

        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(this.scrollView.x, this.scrollView.y, this.scrollView.width, this.scrollView.height);
        this.scrollMask = maskGraphics.createGeometryMask();

        this.scrollHint = this.add.text(width / 2, 452, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '13px',
            color: '#9db4d0'
        }).setOrigin(0.5);

        this.noticeText = this.add.text(width / 2, 474, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '16px',
            color: '#9fe870',
            wordWrap: { width: 420 },
            align: 'center'
        }).setOrigin(0.5);

        this.scrollbarTrack = this.add.rectangle(this.scrollView.x + this.scrollView.width + 8, this.scrollView.y + (this.scrollView.height / 2), 6, this.scrollView.height, 0xffffff, 0.08);
        this.scrollbarThumb = this.add.rectangle(this.scrollbarTrack.x, this.scrollView.y + 40, 6, 54, 0xffd166, 0.9);

        createAudioToggle(this, width - 24, 20);
        this.createButton(116, 498, 'BACK', () => this.scene.start('TitleScene'), 164, 50, false, null);
        this.createButton(844, 498, 'PLAY', () => this.scene.start('GameScene'), 164, 50, false, null);
        this.attachScrollControls();
        this.render();
    }

    render() {
        if (this.screenRoot) {
            this.screenRoot.destroy(true);
        }

        this.screenRoot = this.add.container(0, 0);
        this.screenRoot.setMask(this.scrollMask);
        const addChild = (gameObject) => {
            this.screenRoot.add(gameObject);
            return gameObject;
        };

        const selectedVehicle = getSelectedVehicle();
        const runStats = getAppliedRunStats();
        const vehicleCards = [
            { x: 308, y: 126 },
            { x: 620, y: 126 },
            { x: 308, y: 296 },
            { x: 620, y: 296 }
        ];

        addChild(this.add.image(148, 220, 'panel').setDisplaySize(252, 196).setAlpha(0.95));
        addChild(this.add.text(36, 124, 'Wallet and Build', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }));
        addChild(this.add.text(36, 164, `Coins: ${gameState.totalCoins}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '20px',
            color: '#ffe38d'
        }));
        addChild(this.add.text(36, 192, `Diamonds: ${gameState.totalDiamonds}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '20px',
            color: '#8ce6ff'
        }));
        addChild(this.add.text(36, 220, `Garage: ${getOwnedVehicleCount()}/${VEHICLE_DEFS.length} vehicles`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '16px',
            color: '#d7e3f4'
        }));
        addChild(this.add.sprite(82, 282, selectedVehicle.texture).setScale(1.18));
        addChild(this.add.text(126, 252, selectedVehicle.name, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '21px',
            fontStyle: 'bold',
            color: '#ffd166'
        }));
        addChild(this.add.text(126, 278, `Speed ${runStats.maxSpeedX}  Fuel ${runStats.maxFuel}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '15px',
            color: '#d7e3f4'
        }));
        addChild(this.add.text(126, 302, `Health ${runStats.maxHealth}  Jump ${Math.abs(runStats.jumpVelocity)}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '15px',
            color: '#d7e3f4'
        }));

        addChild(this.add.image(148, 410, 'panel').setDisplaySize(252, 176).setAlpha(0.95));
        addChild(this.add.text(36, 330, 'Upgrades', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }));
        Object.values(UPGRADE_DEFS).forEach((upgrade, index) => {
            this.renderUpgradeCard(addChild, upgrade, 34, 352 + (index * 36));
        });

        addChild(this.add.text(308, 100, 'Vehicle Collection', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }));
        VEHICLE_DEFS.forEach((vehicle, index) => {
            const position = vehicleCards[index];
            this.renderVehicleCard(addChild, vehicle, position.x, position.y);
        });

        this.contentHeight = 470;
        this.noticeText.setText(this.noticeMessage || '');
        this.noticeText.setColor(this.noticeColor || '#9fe870');
        this.updateScrollMetrics();
    }

    renderVehicleCard(addChild, vehicle, x, y) {
        const isOwned = gameState.garage.ownedVehicles.includes(vehicle.id);
        const isSelected = gameState.garage.selectedVehicle === vehicle.id;
        const card = addChild(this.add.image(x + 146, y + 74, 'panel').setDisplaySize(292, 148).setAlpha(0.95));
        if (isSelected) {
            card.setTint(0xfef3c7);
        }

        addChild(this.add.sprite(x + 62, y + 74, vehicle.texture).setScale(1.14));
        addChild(this.add.text(x + 116, y + 18, vehicle.name, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '21px',
            fontStyle: 'bold',
            color: isSelected ? '#ffd166' : '#f8fbff'
        }));
        addChild(this.add.text(x + 116, y + 46, vehicle.description, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: '#9db4d0',
            wordWrap: { width: 156 }
        }));

        const priceLabel = vehicle.priceCoins === 0 && vehicle.priceDiamonds === 0
            ? 'Starter vehicle'
            : `${vehicle.priceCoins > 0 ? `${vehicle.priceCoins}c` : ''}${vehicle.priceCoins > 0 && vehicle.priceDiamonds > 0 ? ' + ' : ''}${vehicle.priceDiamonds > 0 ? `${vehicle.priceDiamonds}d` : ''}`;
        addChild(this.add.text(x + 18, y + 118, isOwned ? 'Owned' : `Price: ${priceLabel}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: isOwned ? '#9fe870' : '#d7e3f4'
        }));

        let actionLabel = 'BUY';
        if (isSelected) {
            actionLabel = 'SELECTED';
        } else if (isOwned) {
            actionLabel = 'SELECT';
        } else {
            actionLabel = 'BUY';
        }

        const disabled = isSelected;
        this.createButton(x + 236, y + 118, actionLabel, () => this.handleVehicleAction(vehicle), 104, 38, disabled, addChild);
    }

    renderUpgradeCard(addChild, upgrade, x, y) {
        const level = getUpgradeLevel(upgrade.id);
        const nextCost = getNextUpgradeCost(upgrade.id);
        const card = addChild(this.add.image(x + 103, y + 17, 'panel').setDisplaySize(214, 34).setAlpha(0.95));
        if (nextCost === null) {
            card.setTint(0xdaf5cf);
        }

        addChild(this.add.text(x + 10, y + 3, `${upgrade.name} Lv ${level}/${upgrade.costs.length}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }));
        addChild(this.add.text(x + 10, y + 18, nextCost === null ? 'Fully tuned' : `${nextCost} ${upgrade.currency === 'diamonds' ? 'diamonds' : 'coins'}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '12px',
            color: nextCost === null ? '#9fe870' : '#ffd166'
        }));

        this.createButton(x + 171, y + 17, nextCost === null ? 'MAX' : 'UP', () => this.handleUpgradeAction(upgrade), 70, 26, nextCost === null, addChild);
    }

    createButton(x, y, label, onClick, width = 180, height = 48, disabled = false, addChild = null) {
        const viewport = getViewportProfile();
        const button = this.add.image(x, y, 'button')
            .setDisplaySize(width, height)
            .setAlpha(disabled ? 0.45 : 1);
        const buttonLabel = this.add.text(x, y, label, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: viewport.isTouch ? (width <= 112 ? '17px' : '22px') : (width <= 112 ? '16px' : '24px'),
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5).setAlpha(disabled ? 0.75 : 1);
        const baseScaleX = button.scaleX;
        const baseScaleY = button.scaleY;
        const labelBaseScaleX = buttonLabel.scaleX;
        const labelBaseScaleY = buttonLabel.scaleY;

        if (addChild) {
            addChild(button);
            addChild(buttonLabel);
        }

        if (disabled) {
            return { button, buttonLabel };
        }

        const hitArea = this.add.zone(x, y, width, height)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        if (addChild) {
            addChild(hitArea);
        }

        hitArea.on('pointerover', () => {
            button.setScale(baseScaleX * 1.02, baseScaleY * 1.02);
            buttonLabel.setScale(labelBaseScaleX * 1.02, labelBaseScaleY * 1.02);
        });
        hitArea.on('pointerout', () => {
            button.setScale(baseScaleX, baseScaleY);
            buttonLabel.setScale(labelBaseScaleX, labelBaseScaleY);
        });
        hitArea.on('pointerdown', () => {
            SoundManager.playSfx('button');
            onClick();
        });

        return { button, buttonLabel, hitArea };
    }

    attachScrollControls() {
        this.wheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
            if (!this.isInsideScrollView(pointer.x, pointer.y) || this.minScrollOffset === 0) {
                return;
            }

            this.setScrollOffset(this.scrollOffset - (deltaY * 0.45));
        };

        this.pointerDownHandler = (pointer) => {
            if (!this.isInsideScrollView(pointer.x, pointer.y) || this.minScrollOffset === 0) {
                return;
            }

            this.draggingScroll = true;
            this.lastPointerY = pointer.y;
        };

        this.pointerMoveHandler = (pointer) => {
            if (!this.draggingScroll || !pointer.isDown) {
                return;
            }

            const deltaY = pointer.y - this.lastPointerY;
            this.lastPointerY = pointer.y;
            this.setScrollOffset(this.scrollOffset + deltaY);
        };

        this.pointerUpHandler = () => {
            this.draggingScroll = false;
        };

        this.input.on('wheel', this.wheelHandler);
        this.input.on('pointerdown', this.pointerDownHandler);
        this.input.on('pointermove', this.pointerMoveHandler);
        this.input.on('pointerup', this.pointerUpHandler);
        this.input.on('pointerupoutside', this.pointerUpHandler);

        this.events.once('shutdown', () => {
            this.input.off('wheel', this.wheelHandler);
            this.input.off('pointerdown', this.pointerDownHandler);
            this.input.off('pointermove', this.pointerMoveHandler);
            this.input.off('pointerup', this.pointerUpHandler);
            this.input.off('pointerupoutside', this.pointerUpHandler);
        });
    }

    isInsideScrollView(x, y) {
        return x >= this.scrollView.x &&
            x <= this.scrollView.x + this.scrollView.width &&
            y >= this.scrollView.y &&
            y <= this.scrollView.y + this.scrollView.height;
    }

    setScrollOffset(nextOffset) {
        this.scrollOffset = clamp(nextOffset, this.minScrollOffset, 0);
        if (this.screenRoot) {
            this.screenRoot.y = this.scrollOffset;
        }
        this.updateScrollbarThumb();
    }

    updateScrollMetrics() {
        this.minScrollOffset = Math.min(0, this.scrollView.height - this.contentHeight);
        this.scrollHint.setText(this.minScrollOffset < 0 ? 'Scroll for more vehicles and upgrades' : '');
        this.setScrollOffset(this.scrollOffset);
        const showScrollbar = this.minScrollOffset < 0;
        this.scrollbarTrack.setVisible(showScrollbar);
        this.scrollbarThumb.setVisible(showScrollbar);
    }

    updateScrollbarThumb() {
        if (this.minScrollOffset === 0) {
            return;
        }

        const visibleRatio = clamp(this.scrollView.height / this.contentHeight, 0.2, 1);
        const thumbHeight = this.scrollView.height * visibleRatio;
        const scrollProgress = clamp(Math.abs(this.scrollOffset / this.minScrollOffset), 0, 1);
        const travel = this.scrollView.height - thumbHeight;

        this.scrollbarThumb.height = thumbHeight;
        this.scrollbarThumb.y = this.scrollView.y + (thumbHeight / 2) + (travel * scrollProgress);
    }

    handleVehicleAction(vehicle) {
        const isOwned = gameState.garage.ownedVehicles.includes(vehicle.id);
        const result = isOwned ? selectVehicle(vehicle.id) : buyVehicle(vehicle.id);

        if (result.ok) {
            SoundManager.playSfx(isOwned ? 'button' : (vehicle.priceDiamonds > 0 ? 'diamond' : 'coin'));
            this.noticeColor = '#9fe870';
            this.noticeMessage = isOwned
                ? `${vehicle.name} selected for the next run.`
                : `${vehicle.name} added to your garage.`;

            if (result.unlockedGoals?.length > 0) {
                this.noticeMessage += ` Goal cleared: ${result.unlockedGoals[0].name}.`;
            }
        } else {
            SoundManager.playSfx('hit');
            this.noticeColor = '#ff9ebb';
            this.noticeMessage = result.reason;
        }

        this.render();
    }

    handleUpgradeAction(upgrade) {
        const result = buyUpgrade(upgrade.id);
        if (result.ok) {
            SoundManager.playSfx(upgrade.currency === 'diamonds' ? 'diamond' : 'coin');
            this.noticeColor = '#9fe870';
            this.noticeMessage = `${upgrade.name} upgraded to Lv ${result.level}.`;
        } else {
            SoundManager.playSfx('hit');
            this.noticeColor = '#ff9ebb';
            this.noticeMessage = result.reason;
        }

        this.render();
    }
}
