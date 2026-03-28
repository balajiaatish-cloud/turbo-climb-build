class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
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

        this.add.text(width / 2, 48, 'MAPS', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '44px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 84, 'Pick your climb. New maps cost 10 coins each.', {
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

        const selectedMap = getSelectedMap();
        const mapCards = [
            { x: 286, y: 138 },
            { x: 598, y: 138 },
            { x: 442, y: 316 }
        ];

        addChild(this.add.image(146, 252, 'panel').setDisplaySize(250, 314).setAlpha(0.95));
        addChild(this.add.text(34, 128, 'Map Wallet', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }));
        addChild(this.add.text(34, 164, `Coins: ${gameState.totalCoins}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '22px',
            color: '#ffe38d'
        }));
        addChild(this.add.text(34, 196, `Unlocked maps: ${getUnlockedMapCount()}/${MAP_DEFS.length}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '16px',
            color: '#d7e3f4'
        }));
        addChild(this.add.circle(84, 266, 26, selectedMap.previewColor, 1).setStrokeStyle(3, 0xffffff, 0.3));
        addChild(this.add.text(126, 238, selectedMap.name, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: selectedMap.accentColor
        }));
        addChild(this.add.text(126, 270, `Gravity ${selectedMap.gravity}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '15px',
            color: '#d7e3f4'
        }));
        addChild(this.add.text(34, 318, selectedMap.description, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: '#a9bfd8',
            wordWrap: { width: 210 }
        }));
        addChild(this.add.text(34, 382, selectedMap.tip, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '13px',
            color: '#8ce6ff',
            wordWrap: { width: 212 }
        }));

        addChild(this.add.text(284, 108, 'Available Maps', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }));

        MAP_DEFS.forEach((map, index) => {
            const position = mapCards[index];
            this.renderMapCard(addChild, map, position.x, position.y);
        });

        this.contentHeight = 470;
        this.noticeText.setText(this.noticeMessage || '');
        this.noticeText.setColor(this.noticeColor || '#9fe870');
        this.updateScrollMetrics();
    }

    renderMapCard(addChild, map, x, y) {
        const isUnlocked = gameState.garage.unlockedMaps.includes(map.id);
        const isSelected = gameState.garage.selectedMap === map.id;
        const card = addChild(this.add.image(x + 138, y + 72, 'panel').setDisplaySize(276, 144).setAlpha(0.95));

        if (isSelected) {
            card.setTint(0xfef3c7);
        }

        addChild(this.add.circle(x + 54, y + 70, 28, map.previewColor, 1).setStrokeStyle(3, 0xffffff, 0.28));
        addChild(this.add.text(x + 100, y + 18, map.name, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: isSelected ? '#ffd166' : '#f8fbff'
        }));
        addChild(this.add.text(x + 100, y + 46, map.description, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '13px',
            color: '#9db4d0',
            wordWrap: { width: 160 }
        }));
        addChild(this.add.text(x + 16, y + 116, map.gravity < BALANCE.gravity ? 'Low gravity' : 'Normal gravity', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: map.gravity < BALANCE.gravity ? '#d6d0ff' : '#d7e3f4'
        }));

        let actionLabel = 'UNLOCK';
        if (isSelected) {
            actionLabel = 'SELECTED';
        } else if (isUnlocked) {
            actionLabel = 'SELECT';
        }

        const priceLabel = map.priceCoins === 0 ? 'Starter map' : `Unlock: ${map.priceCoins} coins`;
        addChild(this.add.text(x + 16, y + 92, isUnlocked ? 'Unlocked' : priceLabel, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: isUnlocked ? '#9fe870' : '#ffe38d'
        }));

        this.createButton(x + 220, y + 114, actionLabel, () => this.handleMapAction(map), 102, 38, isSelected, addChild);
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
        this.scrollHint.setText(this.minScrollOffset < 0 ? 'Scroll for more maps and details' : '');
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

    handleMapAction(map) {
        const isUnlocked = gameState.garage.unlockedMaps.includes(map.id);
        const result = isUnlocked ? selectMap(map.id) : unlockMap(map.id);

        if (result.ok) {
            SoundManager.playSfx(isUnlocked ? 'button' : 'coin');
            this.noticeColor = '#9fe870';
            this.noticeMessage = isUnlocked
                ? `${map.name} selected for the next run.`
                : `${map.name} unlocked and selected.`;

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
}
