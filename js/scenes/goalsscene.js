class GoalsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GoalsScene' });
    }

    create(data) {
        const { width, height } = this.scale;
        this.returnScene = data?.returnScene || 'TitleScene';
        this.viewport = getViewportProfile();
        this.scrollOffset = 0;
        this.minScrollOffset = 0;
        this.draggingScroll = false;
        this.lastPointerY = 0;
        SoundManager.playMusic('title');

        this.add.image(width / 2, height / 2, 'backdrop').setTint(0xeaf4ff);
        this.add.image(width / 2, height / 2 + 44, 'mountain-far').setAlpha(0.84);
        this.add.image(width / 2, height / 2 + 86, 'mountain-near').setAlpha(0.94);
        this.add.rectangle(width / 2, height / 2, width, height, 0x07111f, 0.42);

        this.add.text(width / 2, 54, 'GOALS', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '44px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 90, 'Complete missions, unlock achievements, and stack extra rewards.', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: this.viewport.isPhone ? '15px' : '18px',
            color: '#ffd166'
        }).setOrigin(0.5);

        this.add.text(width / 2, 122, `Missions ${getCompletedMissionCount()}/${MISSION_DEFS.length}  |  Achievements ${getCompletedAchievementCount()}/${ACHIEVEMENT_DEFS.length}`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '16px',
            color: '#dce8f7'
        }).setOrigin(0.5);

        this.scrollView = {
            x: 42,
            y: 144,
            width: 876,
            height: 304
        };

        this.add.image(width / 2, this.scrollView.y + (this.scrollView.height / 2), 'panel')
            .setDisplaySize(this.scrollView.width + 18, this.scrollView.height + 16)
            .setAlpha(0.95);

        this.scrollContent = this.add.container(0, 0);
        this.buildScrollableContent();

        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(this.scrollView.x, this.scrollView.y, this.scrollView.width, this.scrollView.height);
        this.scrollContent.setMask(maskGraphics.createGeometryMask());

        this.scrollHint = this.add.text(width / 2, 458, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '13px',
            color: '#9db4d0'
        }).setOrigin(0.5);

        this.scrollbarTrack = this.add.rectangle(this.scrollView.x + this.scrollView.width + 10, this.scrollView.y + (this.scrollView.height / 2), 6, this.scrollView.height, 0xffffff, 0.08);
        this.scrollbarThumb = this.add.rectangle(this.scrollbarTrack.x, this.scrollView.y + 40, 6, 54, 0xffd166, 0.9);

        createAudioToggle(this, width - 24, 22);
        this.createButton(width / 2 - 130, height - 28, 'BACK', () => this.scene.start(this.returnScene), 170, 54);
        this.createButton(width / 2 + 130, height - 28, 'PLAY', () => this.scene.start('GameScene'), 170, 54);

        this.attachScrollControls();
        this.updateScrollMetrics();
    }

    buildScrollableContent() {
        this.addPanelSection(252, 250, 420, 212, 'Missions');
        this.addPanelSection(708, 250, 420, 212, 'Achievements');

        this.renderGoalList('mission', MISSION_DEFS, 66, 178, 376);
        this.renderGoalList('achievement', ACHIEVEMENT_DEFS, 522, 178, 376);

        this.addPanelSection(480, 486, 876, 110, 'Recent Unlocks');
        this.renderRecentUnlocks(480, 486);

        this.contentHeight = 550;
    }

    addPanelSection(centerX, centerY, width, height, title) {
        const panel = this.add.image(centerX, centerY, 'panel')
            .setDisplaySize(width, height)
            .setAlpha(0.9);
        const heading = this.add.text(centerX - (width / 2) + 24, centerY - (height / 2) + 16, title, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f8fbff'
        });

        this.scrollContent.add([panel, heading]);
    }

    renderGoalList(kind, definitions, x, startY, wrapWidth) {
        const completedIds = getCompletedGoalIds(kind);

        definitions.forEach((definition, index) => {
            const progress = getGoalProgress(definition);
            const completed = completedIds.includes(definition.id);
            const y = startY + (index * 50);
            const progressLabel = completed
                ? 'Completed'
                : `${Math.min(progress.current, progress.target)}/${progress.target}`;
            const rewardLabel = `${definition.rewardCoins}c${definition.rewardDiamonds > 0 ? ` + ${definition.rewardDiamonds}d` : ''}`;

            const nameText = this.add.text(x, y, definition.name, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '18px',
                fontStyle: 'bold',
                color: completed ? '#9fe870' : '#f8fbff'
            });

            const descriptionText = this.add.text(x, y + 18, definition.description, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '12px',
                color: '#b7cae3',
                wordWrap: { width: wrapWidth }
            });

            const progressText = this.add.text(x + wrapWidth, y + 2, progressLabel, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '13px',
                color: completed ? '#9fe870' : '#ffd166'
            }).setOrigin(1, 0);

            const rewardText = this.add.text(x + wrapWidth, y + 20, rewardLabel, {
                fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                fontSize: '12px',
                color: '#8ce6ff'
            }).setOrigin(1, 0);

            this.scrollContent.add([nameText, descriptionText, progressText, rewardText]);
        });
    }

    renderRecentUnlocks(centerX, y) {
        const recentUnlocks = getRecentGoalUnlocks(4);

        if (recentUnlocks.length > 0) {
            recentUnlocks.forEach((entry, index) => {
                const columnX = centerX - 412 + (index * 214);
                const line1 = this.add.text(columnX, y - 4, `${entry.kind === 'achievement' ? 'Achievement' : 'Mission'}: ${entry.name}`, {
                    fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                    fontSize: '14px',
                    color: '#f8fbff',
                    wordWrap: { width: 190 }
                });
                const line2 = this.add.text(columnX, y + 24, `Rewarded ${entry.rewardCoins}c${entry.rewardDiamonds > 0 ? ` + ${entry.rewardDiamonds}d` : ''}`, {
                    fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
                    fontSize: '13px',
                    color: '#9fe870',
                    wordWrap: { width: 190 }
                });
                this.scrollContent.add([line1, line2]);
            });
            return;
        }

        const emptyState = this.add.text(centerX - 412, y + 6, 'Keep climbing, collecting, and unlocking rides to clear missions and achievements faster.', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '15px',
            color: '#d7e3f4',
            wordWrap: { width: 820 }
        });
        this.scrollContent.add(emptyState);
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
        this.scrollContent.y = this.scrollOffset;
        this.updateScrollbarThumb();
    }

    updateScrollMetrics() {
        this.minScrollOffset = Math.min(0, this.scrollView.height - this.contentHeight);
        this.scrollHint.setText(this.minScrollOffset < 0 ? 'Scroll for more missions, achievements, and unlock history' : '');
        this.setScrollOffset(this.scrollOffset);
        const showScrollbar = this.minScrollOffset < 0;
        this.scrollbarTrack.setVisible(showScrollbar);
        this.scrollbarThumb.setVisible(showScrollbar);
    }

    updateScrollbarThumb() {
        if (this.minScrollOffset === 0) {
            return;
        }

        const visibleRatio = clamp(this.scrollView.height / this.contentHeight, 0.18, 1);
        const thumbHeight = this.scrollView.height * visibleRatio;
        const scrollProgress = clamp(Math.abs(this.scrollOffset / this.minScrollOffset), 0, 1);
        const travel = this.scrollView.height - thumbHeight;

        this.scrollbarThumb.height = thumbHeight;
        this.scrollbarThumb.y = this.scrollView.y + (thumbHeight / 2) + (travel * scrollProgress);
    }

    createButton(x, y, label, onClick, width = 220, height = 62) {
        const button = this.add.image(x, y, 'button').setDisplaySize(width, height);
        const buttonLabel = this.add.text(x, y, label, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: this.viewport.isTouch ? '22px' : '24px',
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
