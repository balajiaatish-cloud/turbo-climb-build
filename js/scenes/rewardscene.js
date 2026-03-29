class RewardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RewardScene' });
    }

    create(data) {
        const { width, height } = this.scale;
        this.viewport = getViewportProfile();
        this.returnScene = data?.returnScene || 'TitleScene';
        this.scrollOffset = 0;
        this.minScrollOffset = 0;
        this.draggingScroll = false;
        this.lastPointerY = 0;
        SoundManager.playMusic('title');

        this.add.image(width / 2, height / 2, 'backdrop').setTint(0xf0f7ff);
        this.add.image(width / 2, height / 2 + 44, 'mountain-far').setAlpha(0.82);
        this.add.image(width / 2, height / 2 + 86, 'mountain-near').setAlpha(0.92);
        this.add.rectangle(width / 2, height / 2, width, height, 0x07111f, 0.46);

        this.add.image(width / 2, height / 2 + 4, 'panel')
            .setDisplaySize(780, 436)
            .setAlpha(0.98);

        this.add.text(width / 2, 70, 'REWARDS', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '46px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 108, 'Claim bonuses here and scroll for streak, climb, and reward progress details.', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: this.viewport.isPhone ? '15px' : '18px',
            color: '#ffd166'
        }).setOrigin(0.5);

        this.walletText = this.add.text(width / 2, 146, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '17px',
            color: '#dce8f7'
        }).setOrigin(0.5);

        this.scrollView = {
            x: width / 2 - 350,
            y: 184,
            width: 700,
            height: 224
        };

        this.add.rectangle(width / 2, this.scrollView.y + (this.scrollView.height / 2), this.scrollView.width + 6, this.scrollView.height + 6, 0xffffff, 0.03)
            .setStrokeStyle(1, 0xffffff, 0.08);

        this.scrollContent = this.add.container(this.scrollView.x, this.scrollView.y);
        this.buildScrollableRewards();

        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(this.scrollView.x, this.scrollView.y, this.scrollView.width, this.scrollView.height);
        this.scrollContent.setMask(maskGraphics.createGeometryMask());

        this.scrollHint = this.add.text(width / 2, 418, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '13px',
            color: '#9db4d0'
        }).setOrigin(0.5);

        this.scrollbarTrack = this.add.rectangle(this.scrollView.x + this.scrollView.width + 16, this.scrollView.y + (this.scrollView.height / 2), 6, this.scrollView.height, 0xffffff, 0.08);
        this.scrollbarThumb = this.add.rectangle(this.scrollbarTrack.x, this.scrollView.y + 40, 6, 54, 0xffd166, 0.9);

        this.feedbackText = this.add.text(width / 2, 446, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#8ff0a4'
        }).setOrigin(0.5).setAlpha(0);

        createAudioToggle(this, width - 24, 22);
        this.createButton(width / 2 - 130, height - 58, 'BACK', () => this.scene.start(this.returnScene), 170, 60);
        this.createButton(width / 2 + 130, height - 58, 'PLAY', () => this.scene.start('GameScene'), 170, 60);

        this.attachScrollControls();
        this.refreshRewardView();
        this.updateScrollMetrics();
    }

    buildScrollableRewards() {
        const contentCenterX = this.scrollView.width / 2;
        let y = 54;

        this.dailyCard = this.createRewardCard(
            contentCenterX,
            y,
            'Daily Login',
            '50 coins and 5 diamonds to start, with the coin reward doubling on each consecutive daily claim.',
            () => this.handleDailyClaim()
        );
        y += 130;

        this.playtimeCard = this.createRewardCard(
            contentCenterX,
            y,
            'Playtime Reward',
            'Earn 100 coins and 10 diamonds for every 30 minutes of active playtime.',
            () => this.handlePlaytimeClaim()
        );
        y += 130;

        this.streakInfoCard = this.createInfoCard(contentCenterX, y, 'Reward Streak', '');
        y += 110;

        this.climbInfoCard = this.createInfoCard(contentCenterX, y, 'Climb Milestones', '');
        y += 110;

        this.rewardNotesCard = this.createInfoCard(contentCenterX, y, 'Reward Notes', '');
        y += 92;

        this.contentHeight = y;
    }

    createRewardCard(x, y, title, description, onClaim) {
        const panel = this.add.image(x, y, 'panel')
            .setDisplaySize(700, 108)
            .setAlpha(0.92);
        const titleText = this.add.text(x - 320, y - 34, title, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '25px',
            fontStyle: 'bold',
            color: '#f8fbff'
        });
        const descriptionText = this.add.text(x - 320, y - 8, description, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: '#c9d8ee',
            wordWrap: { width: 470 }
        });
        const rewardText = this.add.text(x - 320, y + 28, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffd166'
        });
        const statusText = this.add.text(x - 24, y + 28, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: '#9db4d0'
        });
        const claimButton = this.createActionButton(x + 250, y + 2, 'CLAIM', onClaim, 150, 54);

        this.scrollContent.add([panel, titleText, descriptionText, rewardText, statusText]);

        return {
            rewardText,
            statusText,
            claimButton
        };
    }

    createInfoCard(x, y, title, body) {
        const panel = this.add.image(x, y, 'panel')
            .setDisplaySize(700, 88)
            .setAlpha(0.88);
        const titleText = this.add.text(x - 320, y - 24, title, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#f8fbff'
        });
        const bodyText = this.add.text(x - 320, y + 4, body, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '14px',
            color: '#c9d8ee',
            wordWrap: { width: 620 }
        });

        this.scrollContent.add([panel, titleText, bodyText]);

        return {
            bodyText
        };
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
        this.scrollContent.y = this.scrollView.y + this.scrollOffset;
        this.updateScrollbarThumb();
    }

    updateScrollMetrics() {
        this.minScrollOffset = Math.min(0, this.scrollView.height - this.contentHeight);
        this.scrollHint.setText(this.minScrollOffset < 0 ? 'Scroll for more reward details' : '');
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

    refreshRewardView() {
        const dailyInfo = getDailyRewardInfo();
        const playtimeInfo = getPlaytimeRewardInfo();
        const tomorrowCoins = REWARD_DEFS.dailyLogin.baseCoins * Math.pow(2, Math.max(0, gameState.rewards.dailyStreak));
        const dailyDisplayCoins = dailyInfo.canClaim ? dailyInfo.rewardCoins : tomorrowCoins;
        const playedMinutes = Math.floor(playtimeInfo.progressSeconds / 60);
        const climbRewards = [
            `200m: +${getHeightRewardCoinsForDistance(200)} coins`,
            `300m: +${getHeightRewardCoinsForDistance(300)} coins`,
            `400m: +${getHeightRewardCoinsForDistance(400)} coins`,
            `500m: +${getHeightRewardCoinsForDistance(500)} coins`
        ].join('  |  ');

        this.walletText.setText(`Wallet: ${gameState.totalCoins} coins  |  ${gameState.totalDiamonds} diamonds`);

        this.dailyCard.rewardText.setText(`Reward: ${dailyDisplayCoins} coins + ${dailyInfo.rewardDiamonds} diamonds`);
        if (dailyInfo.canClaim) {
            const dailyStatus = dailyInfo.dayDifference === 1
                ? `Streak day ${dailyInfo.nextStreak} is ready now.`
                : gameState.rewards.dailyStreak > 0
                    ? 'Streak reset after a missed day. Claim to start again.'
                    : 'Your first daily claim is ready.';

            this.dailyCard.statusText.setText(dailyStatus);
            this.setActionButtonState(this.dailyCard.claimButton, true, 'CLAIM');
        } else {
            this.dailyCard.statusText.setText(`Claimed today. Tomorrow pays ${tomorrowCoins} coins + ${REWARD_DEFS.dailyLogin.diamonds} diamonds.`);
            this.setActionButtonState(this.dailyCard.claimButton, false, 'CLAIMED');
        }

        this.playtimeCard.rewardText.setText(`Reward: ${playtimeInfo.rewardCoins} coins + ${playtimeInfo.rewardDiamonds} diamonds`);
        if (playtimeInfo.canClaim) {
            const claimText = playtimeInfo.claimableBlocks > 1
                ? `${playtimeInfo.claimableBlocks} rewards ready from saved playtime.`
                : '30 minutes reached. Reward is ready to claim.';

            this.playtimeCard.statusText.setText(claimText);
            this.setActionButtonState(this.playtimeCard.claimButton, true, 'CLAIM');
        } else {
            const remainingMinutes = Math.max(0, Math.ceil((playtimeInfo.requiredSeconds - playtimeInfo.progressSeconds) / 60));
            this.playtimeCard.statusText.setText(`${playedMinutes} / 30 minutes saved. ${remainingMinutes} minutes left.`);
            this.setActionButtonState(this.playtimeCard.claimButton, false, 'WAIT');
        }

        this.streakInfoCard.bodyText.setText(`Current streak: ${gameState.rewards.dailyStreak} day(s). Next daily reward is ${tomorrowCoins} coins + ${REWARD_DEFS.dailyLogin.diamonds} diamonds once a new day begins.`);
        this.climbInfoCard.bodyText.setText(`Milestone ladder: ${climbRewards}`);
        this.rewardNotesCard.bodyText.setText(`Active playtime saved: ${playedMinutes} minutes. Height, daily, and playtime rewards all stay saved in browser storage.`);

        this.updateScrollMetrics();
    }

    handleDailyClaim() {
        const result = claimDailyReward();
        if (!result.ok) {
            this.showFeedback(result.reason, '#ff9ebb');
            return;
        }

        SoundManager.playSfx('coin');
        this.showFeedback(`Daily claimed: +${result.coins} coins, +${result.diamonds} diamonds`, '#8ff0a4');
        this.refreshRewardView();
    }

    handlePlaytimeClaim() {
        const result = claimPlaytimeReward();
        if (!result.ok) {
            this.showFeedback(result.reason, '#ff9ebb');
            return;
        }

        SoundManager.playSfx('diamond');
        this.showFeedback(`Playtime claimed: +${result.coins} coins, +${result.diamonds} diamonds`, '#8ff0a4');
        this.refreshRewardView();
    }

    showFeedback(text, color) {
        this.feedbackText.setText(text);
        this.feedbackText.setColor(color);
        this.feedbackText.setAlpha(1);
        this.tweens.killTweensOf(this.feedbackText);
        this.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            duration: 1800,
            ease: 'Sine.easeOut'
        });
    }

    createActionButton(x, y, label, onClick, width = 160, height = 56) {
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

        this.scrollContent.add([button, buttonLabel, hitArea]);

        hitArea.on('pointerover', () => {
            if (!hitArea.input.enabled) {
                return;
            }

            button.setScale(baseScaleX * 1.03, baseScaleY * 1.03);
            buttonLabel.setScale(labelBaseScaleX * 1.03, labelBaseScaleY * 1.03);
        });

        hitArea.on('pointerout', () => {
            button.setScale(baseScaleX, baseScaleY);
            buttonLabel.setScale(labelBaseScaleX, labelBaseScaleY);
        });

        hitArea.on('pointerdown', () => {
            if (!hitArea.input.enabled) {
                return;
            }

            SoundManager.playSfx('button');
            onClick();
        });

        return {
            button,
            buttonLabel,
            hitArea,
            baseScaleX,
            baseScaleY,
            labelBaseScaleX,
            labelBaseScaleY
        };
    }

    setActionButtonState(buttonParts, enabled, label) {
        buttonParts.buttonLabel.setText(label);
        buttonParts.hitArea.disableInteractive();
        buttonParts.button.setScale(buttonParts.baseScaleX, buttonParts.baseScaleY);
        buttonParts.buttonLabel.setScale(buttonParts.labelBaseScaleX, buttonParts.labelBaseScaleY);

        if (enabled) {
            buttonParts.button.clearTint();
            buttonParts.button.setAlpha(1);
            buttonParts.buttonLabel.setColor('#f8fbff');
            buttonParts.hitArea.setInteractive({ useHandCursor: true });
            return;
        }

        buttonParts.button.setTint(0x7f8da3);
        buttonParts.button.setAlpha(0.84);
        buttonParts.buttonLabel.setColor('#d6deea');
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
