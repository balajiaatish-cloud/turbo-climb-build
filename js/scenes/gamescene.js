class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.viewportProfile = getViewportProfile();
        this.runStats = getAppliedRunStats();
        resetRunState(this.runStats);
        SoundManager.playMusic('gameplay');

        this.selectedMap = getSelectedMap();
        this.activeLevelBand = getLevelBandForDistance(0);
        this.gameActive = true;
        this.touchState = { left: false, right: false, boost: false };
        this.nextBoostAt = 0;
        this.invulnerableUntil = 0;
        this.wasGrounded = false;
        this.lastAirVelocity = 0;
        this.startPlatformY = GAME_HEIGHT - 32;
        this.highestPlatformY = this.startPlatformY;
        this.lastPlatformX = GAME_WIDTH / 2;
        this.bestClimbY = this.startPlatformY - 62;
        this.failGraceUntil = 3500;
        this.hasLeftStartZone = false;
        this.pendingPlaytimeSeconds = 0;
        this.nextHeightRewardDistance = HEIGHT_REWARD_START;
        this.heightRewardCoins = 0;

        this.physics.world.gravity.y = this.selectedMap.gravity;
        this.physics.world.setBounds(0, -WORLD_HEIGHT, GAME_WIDTH, WORLD_HEIGHT + GAME_HEIGHT + 400);
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, GAME_WIDTH, WORLD_HEIGHT + GAME_HEIGHT + 400);

        this.createBackground();
        this.createWorld();
        this.createPlayer();
        this.createInput();
        this.createUI();

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.startPad);
        this.physics.add.collider(this.player, this.safetyFloor);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.diamonds, this.collectDiamond, null, this);
        this.physics.add.overlap(this.player, this.fuelCells, this.collectFuel, null, this);
        this.physics.add.overlap(this.player, this.repairs, this.collectRepair, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.hitHazard, null, this);

        this.events.once('shutdown', () => {
            this.flushPlaytimeProgress(true);
        });

        this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
        this.cameras.main.setDeadzone(GAME_WIDTH * 0.34, GAME_HEIGHT * 0.34);
        this.cameras.main.fadeIn(350, 5, 11, 22);
    }

    createBackground() {
        const { width, height } = this.scale;

        this.background = this.add.image(width / 2, height / 2, 'backdrop').setScrollFactor(0);
        this.mountainsFar = this.add.image(width / 2, height / 2 + 44, 'mountain-far').setScrollFactor(0.12);
        this.mountainsNear = this.add.image(width / 2, height / 2 + 84, 'mountain-near').setScrollFactor(0.2);
        this.atmosphere = this.add.rectangle(width / 2, height / 2, width, height, this.selectedMap.overlayColor, this.selectedMap.overlayAlpha)
            .setScrollFactor(0)
            .setDepth(1);

        this.clouds = [];
        for (let index = 0; index < 5; index += 1) {
            const cloud = this.add.image(
                Phaser.Math.Between(50, width - 50),
                70 + (index * 56),
                'cloud'
            )
                .setScrollFactor(0.05 + (index * 0.03))
                .setScale(0.75 + (index * 0.08))
                .setAlpha(0.78 - (index * 0.08));

            cloud.baseX = cloud.x;
            cloud.baseY = cloud.y;
            cloud.floatSpeed = 0.12 + (index * 0.03);
            cloud.floatOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
            this.clouds.push(cloud);
        }

        this.applyMapTheme(true);
    }

    createWorld() {
        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
        this.diamonds = this.physics.add.group({ allowGravity: false, immovable: true });
        this.fuelCells = this.physics.add.group({ allowGravity: false, immovable: true });
        this.repairs = this.physics.add.group({ allowGravity: false, immovable: true });
        this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });

        this.createStartZone();
        this.generatePlatformsUntil(this.startPlatformY - BALANCE.terrainBuffer);
    }

    createStartZone() {
        const top = this.add.rectangle(GAME_WIDTH / 2, this.startPlatformY - 8, 620, 18, 0x6bbf59).setDepth(9);
        const base = this.add.rectangle(GAME_WIDTH / 2, this.startPlatformY + 12, 620, 30, 0x654321).setDepth(8);
        const trim = this.add.rectangle(GAME_WIDTH / 2, this.startPlatformY - 14, 620, 4, 0xa7df7c).setDepth(10);

        this.startPad = this.add.rectangle(GAME_WIDTH / 2, this.startPlatformY + 4, 620, 44, 0xffffff, 0.001).setDepth(7);
        this.physics.add.existing(this.startPad, true);

        this.safetyFloor = this.add.rectangle(GAME_WIDTH / 2, this.startPlatformY + 200, GAME_WIDTH + 360, 84, 0xffffff, 0.001).setDepth(1);
        this.physics.add.existing(this.safetyFloor, true);

        this.startZoneDecor = [top, base, trim];
    }

    createPlayer() {
        this.player = this.physics.add.sprite(GAME_WIDTH / 2, this.startPlatformY - 62, getSelectedVehicle().texture);
        this.player.setDepth(12);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.05);
        this.player.setDrag(0, 0);
        this.player.setMaxVelocity(this.runStats.maxSpeedX, BALANCE.maxFallSpeed);
        this.player.body.setSize(64, 26);
        this.player.body.setOffset(12, 16);
    }

    createInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        this.pointerUpHandler = () => {
            this.touchState.left = false;
            this.touchState.right = false;
            this.touchState.boost = false;
        };

        this.input.on('pointerup', this.pointerUpHandler);
        this.events.once('shutdown', () => {
            this.input.off('pointerup', this.pointerUpHandler);
        });

        if (!gameState.supportsTouch) {
            return;
        }

        const radius = this.viewportProfile.touchRadius;
        const bottomInset = this.viewportProfile.touchBottomInset;
        this.createTouchButton(94, GAME_HEIGHT - bottomInset, radius, 'LEFT', 'left');
        this.createTouchButton(224, GAME_HEIGHT - bottomInset, radius, 'RIGHT', 'right');
        this.createTouchButton(GAME_WIDTH - 102, GAME_HEIGHT - bottomInset - 4, radius + 4, 'BOOST', 'boost');
    }

    createTouchButton(x, y, radius, label, key) {
        const button = this.add.circle(x, y, radius, 0x10223c, 0.56)
            .setStrokeStyle(2, 0xffffff, 0.2)
            .setScrollFactor(0)
            .setDepth(40)
            .setInteractive();

        const text = this.add.text(x, y, label, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: label === 'BOOST' ? '18px' : '16px',
            fontStyle: 'bold',
            color: '#f8fbff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(41);

        const setPressed = (pressed) => {
            this.touchState[key] = pressed;
            button.setFillStyle(pressed ? 0xffb703 : 0x10223c, pressed ? 0.75 : 0.56);
            text.setScale(pressed ? 1.04 : 1);
        };

        button.on('pointerdown', () => setPressed(true));
        button.on('pointerup', () => setPressed(false));
        button.on('pointerout', () => setPressed(false));
        button.on('pointercancel', () => setPressed(false));
    }

    createUI() {
        this.uiPanel = this.add.image(170, 96, 'panel')
            .setDisplaySize(308, 168)
            .setScrollFactor(0)
            .setDepth(30)
            .setAlpha(0.95);

        this.distanceText = this.add.text(32, 32, '0 m', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '34px',
            fontStyle: 'bold',
            color: '#ffd166'
        }).setScrollFactor(0).setDepth(31);

        this.bestText = this.add.text(32, 70, `Best ${gameState.bestDistance} m`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#dce8f7'
        }).setScrollFactor(0).setDepth(31);

        this.coinsText = this.add.text(32, 100, 'Coins 0', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#ffe38d'
        }).setScrollFactor(0).setDepth(31);

        this.diamondsText = this.add.text(32, 128, 'Diamonds 0', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#8ce6ff'
        }).setScrollFactor(0).setDepth(31);

        this.vehicleText = this.add.text(32, 154, getSelectedVehicle().name, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '16px',
            color: '#b9d1f0'
        }).setScrollFactor(0).setDepth(31);

        this.zoneText = this.add.text(GAME_WIDTH / 2, 30, this.selectedMap.name, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: this.selectedMap.accentColor
        }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

        this.zoneHintText = this.add.text(GAME_WIDTH / 2, 54, this.selectedMap.description, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '13px',
            color: '#dce8f7'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

        this.fuelLabel = this.add.text(GAME_WIDTH - 170, 34, 'Fuel', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#dce8f7'
        }).setScrollFactor(0).setDepth(31);

        this.healthLabel = this.add.text(GAME_WIDTH - 170, 76, 'Health', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            color: '#dce8f7'
        }).setScrollFactor(0).setDepth(31);

        this.bars = this.add.graphics().setScrollFactor(0).setDepth(31);

        this.tipText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - this.viewportProfile.tipBottomInset, `${this.selectedMap.tip} Difficulty still rises as you climb higher.`, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: this.viewportProfile.isTouch ? '14px' : '16px',
            color: '#c7d8ef'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

        this.zoneBanner = this.add.text(GAME_WIDTH / 2, 112, '', {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f8fbff',
            backgroundColor: '#08111f',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32).setAlpha(0);

        createAudioToggle(this, GAME_WIDTH - 24, 20);

        this.tweens.add({
            targets: this.tipText,
            alpha: 0,
            delay: 4500,
            duration: 1100
        });
    }

    addPlatform(x, y, width, levelBand) {
        const texture = this.selectedMap.platformTexture || 'platform';
        const platform = this.platforms.create(x, y, texture);
        platform.setScale(width / 256, 1);
        platform.refreshBody();
        platform.setDepth(8);
        platform.platformWidth = width;
        platform.platformTopY = y - 24;
        platform.levelBandId = levelBand?.id || LEVEL_BANDS[0].id;
        return platform;
    }

    generatePlatformsUntil(targetY) {
        while (this.highestPlatformY > targetY) {
            const nextDistance = Math.max(0, (this.startPlatformY - (this.highestPlatformY - BALANCE.minGapY)) / 10);
            const levelBand = getLevelBandForDistance(nextDistance);
            const difficulty = clamp((nextDistance / 2100) + levelBand.difficultyBonus, 0, 2.4);
            const gapY = Phaser.Math.Between(
                BALANCE.minGapY + levelBand.gapBonusY,
                BALANCE.maxGapY + levelBand.gapBonusY + Math.floor(difficulty * 24)
            );
            const minWidth = Math.max(98, BALANCE.minPlatformWidth - levelBand.widthPenalty - Math.floor(difficulty * 14));
            const maxWidth = Math.max(minWidth + 28, BALANCE.maxPlatformWidth - levelBand.widthPenalty - Math.floor(difficulty * 38));
            const width = Phaser.Math.Between(minWidth, maxWidth);
            const shiftRange = BALANCE.maxHorizontalShift + levelBand.shiftBonus + Math.floor(difficulty * 48);

            this.highestPlatformY -= gapY;
            this.lastPlatformX = clamp(
                this.lastPlatformX + Phaser.Math.Between(-shiftRange, shiftRange),
                (width / 2) + 44,
                GAME_WIDTH - (width / 2) - 44
            );

            const platform = this.addPlatform(this.lastPlatformX, this.highestPlatformY, width, levelBand);
            this.populatePlatform(platform, difficulty, levelBand);
        }
    }

    populatePlatform(platform, difficulty, levelBand) {
        const halfWidth = (platform.platformWidth / 2) - 22;
        const pickupY = platform.y - 54;

        if (Math.random() < clamp(0.88 - (difficulty * 0.04), 0.68, 0.9)) {
            const coinCount = Phaser.Math.Between(1, 3);
            for (let index = 0; index < coinCount; index += 1) {
                const x = platform.x - halfWidth + ((index + 1) * (platform.platformWidth / (coinCount + 1)));
                this.spawnCollectible(this.coins, x, pickupY - Phaser.Math.Between(-4, 8), 'coin', 18);
            }
        }

        if (Math.random() < clamp(0.12 + (difficulty * 0.08) + levelBand.diamondBonus, 0.1, 0.42)) {
            this.spawnCollectible(
                this.diamonds,
                platform.x + Phaser.Math.Between(-halfWidth + 18, halfWidth - 18),
                pickupY - 18,
                'diamond',
                17
            );
        }

        if (Math.random() < clamp(0.24 - (difficulty * 0.04) + levelBand.fuelBonus, 0.08, 0.28)) {
            this.spawnCollectible(
                this.fuelCells,
                platform.x + Phaser.Math.Between(-halfWidth + 20, halfWidth - 20),
                pickupY - 6,
                'fuel',
                17
            );
        }

        if (Math.random() < clamp(0.14 - (difficulty * 0.03) + levelBand.repairBonus, 0.06, 0.18)) {
            this.spawnCollectible(
                this.repairs,
                platform.x + Phaser.Math.Between(-halfWidth + 20, halfWidth - 20),
                pickupY - 4,
                'repair',
                17
            );
        }

        if (Math.random() < clamp(0.16 + (difficulty * 0.14) + levelBand.hazardBonus, 0.12, 0.56) && platform.platformWidth > 122) {
            this.spawnHazard(platform, halfWidth);
        }
    }

    spawnHazard(platform, halfWidth) {
        const texture = this.selectedMap.hazardTexture || 'hazard';
        const hazard = this.hazards.create(
            platform.x + Phaser.Math.Between(-halfWidth + 22, halfWidth - 22),
            platform.y - (this.selectedMap.hazardMotion === 'float' ? 42 : 34),
            texture
        );
        hazard.setDepth(10);
        hazard.setTint(this.selectedMap.hazardTint);
        hazard.body.setAllowGravity(false);
        hazard.body.setImmovable(true);
        hazard.damage = this.selectedMap.hazardDamage || 24;
        hazard.knockbackX = this.selectedMap.hazardKnockbackX || 180;
        hazard.knockbackY = this.selectedMap.hazardKnockbackY || -240;
        hazard.motionType = this.selectedMap.hazardMotion || 'steady';
        hazard.baseX = hazard.x;
        hazard.baseY = hazard.y;
        hazard.floatOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
        return hazard;
    }

    spawnCollectible(group, x, y, texture, depth) {
        const pickup = group.create(x, y, texture);
        pickup.setDepth(depth);
        pickup.body.setAllowGravity(false);
        pickup.body.setImmovable(true);
        pickup.baseY = y;
        pickup.floatOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
        return pickup;
    }

    update(time, delta) {
        if (!this.gameActive) {
            return;
        }

        const dt = delta / 1000;
        const grounded = this.isGrounded();
        const boostHeld = this.isBoostHeld();
        this.pendingPlaytimeSeconds += dt;

        if (this.pendingPlaytimeSeconds >= 5) {
            this.flushPlaytimeProgress(false);
        }

        this.applyMovement(dt, grounded);
        this.handleBoost(time, grounded, boostHeld);
        this.animatePickups(time);
        this.animateHazards(time);
        this.updateDistance();
        this.checkHeightRewards();
        this.updateLevelBand();
        this.updateResources(dt, grounded);
        this.updateParallax(time);
        this.updateUI();
        this.checkLanding(grounded);
        this.generatePlatformsUntil(this.player.y - BALANCE.terrainBuffer);
        this.cleanupObjects();
        this.bestClimbY = Math.min(this.bestClimbY, this.player.y);
        this.hasLeftStartZone = this.hasLeftStartZone || gameState.distance >= 35 || this.player.y < this.startPlatformY - 180;

        if (this.hasLeftStartZone && time > this.failGraceUntil && this.player.y > this.bestClimbY + 300) {
            this.endGame('Game over: the vehicle fell 30 m below its highest point.');
            return;
        }

        if (gameState.car.health <= 0) {
            this.endGame('Game over: the vehicle health reached zero.');
            return;
        }

        this.lastAirVelocity = this.player.body.velocity.y;
    }

    isGrounded() {
        return this.player.body.blocked.down || this.player.body.touching.down;
    }

    isBoostHeld() {
        return (
            this.cursors.up.isDown ||
            this.wasd.up.isDown ||
            this.wasd.space.isDown ||
            this.touchState.boost
        );
    }

    applyMovement(dt, grounded) {
        const moveLeft = this.cursors.left.isDown || this.wasd.left.isDown || this.touchState.left;
        const moveRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchState.right;
        const acceleration = grounded ? this.runStats.moveAcceleration : this.runStats.airAcceleration;
        const damping = grounded ? BALANCE.moveDampingGround : BALANCE.moveDampingAir;
        let velocityX = this.player.body.velocity.x;

        if (moveLeft && !moveRight) {
            velocityX -= acceleration * dt;
        } else if (moveRight && !moveLeft) {
            velocityX += acceleration * dt;
        } else {
            velocityX = Phaser.Math.Linear(velocityX, 0, damping);
        }

        this.player.setVelocityX(clamp(velocityX, -this.runStats.maxSpeedX, this.runStats.maxSpeedX));

        const targetAngle = clamp((this.player.body.velocity.x * 0.05) + (this.player.body.velocity.y * 0.015), -16, 16);
        this.player.setAngle(Phaser.Math.Linear(this.player.angle, targetAngle, grounded ? 0.22 : 0.08));
    }

    handleBoost(time, grounded, boostHeld) {
        if (!boostHeld || time < this.nextBoostAt) {
            return;
        }

        if (grounded && gameState.car.fuel >= this.runStats.groundBoostCost) {
            gameState.car.fuel -= this.runStats.groundBoostCost;
            this.player.setVelocityY(this.runStats.jumpVelocity);
            this.player.setAngle(-8);
            this.emitBurst(this.player.x, this.player.y + 18, 0xffd166, 7);
            SoundManager.playSfx('jump');
            this.nextBoostAt = time + BALANCE.boostCooldown;
            return;
        }

        if (!grounded && gameState.car.fuel >= this.runStats.airBoostCost) {
            gameState.car.fuel -= this.runStats.airBoostCost;
            this.player.setVelocityY(Math.min(this.player.body.velocity.y - 150, this.runStats.airBoostVelocity));
            this.emitBurst(this.player.x, this.player.y + 18, 0x8ce6ff, 5);
            SoundManager.playSfx('jump');
            this.nextBoostAt = time + BALANCE.boostCooldown + 70;
        }
    }

    animatePickups(time) {
        const bobGroups = [this.coins, this.diamonds, this.fuelCells, this.repairs];

        bobGroups.forEach((group) => {
            group.children.iterate((child) => {
                if (!child) {
                    return;
                }

                child.y = child.baseY + (Math.sin((time / 280) + child.floatOffset) * 5);
                child.angle += 0.7;
            });
        });
    }

    animateHazards(time) {
        this.hazards.children.iterate((hazard) => {
            if (!hazard) {
                return;
            }

            if (hazard.motionType === 'float') {
                hazard.x = hazard.baseX + (Math.sin((time / 680) + hazard.floatOffset) * 10);
                hazard.y = hazard.baseY + (Math.sin((time / 380) + hazard.floatOffset) * 6);
            } else if (hazard.motionType === 'shiver') {
                hazard.x = hazard.baseX + (Math.sin((time / 120) + hazard.floatOffset) * 3);
                hazard.y = hazard.baseY + (Math.sin((time / 260) + hazard.floatOffset) * 2);
            } else {
                hazard.x = hazard.baseX;
                hazard.y = hazard.baseY;
            }

            if (hazard.body) {
                hazard.body.reset(hazard.x, hazard.y);
            }
        });
    }

    updateDistance() {
        gameState.distance = Math.max(0, Math.floor((this.startPlatformY - this.player.y) / 10));

        if (gameState.distance > gameState.bestDistance) {
            gameState.bestDistance = gameState.distance;
        }
    }

    checkHeightRewards() {
        while (gameState.distance >= this.nextHeightRewardDistance) {
            const rewardCoins = getHeightRewardCoinsForDistance(this.nextHeightRewardDistance);
            gameState.currentCoins += rewardCoins;
            gameState.totalCoins += rewardCoins;
            this.heightRewardCoins += rewardCoins;

            this.showFloatingText(this.player.x, this.player.y - 44, `${this.nextHeightRewardDistance} m  +${rewardCoins} coins`, '#ffd166');
            this.emitBurst(this.player.x, this.player.y - 6, 0xffd166, 10);
            this.showLevelBandBanner({
                name: `${this.nextHeightRewardDistance} m`
            }, `Reward: +${rewardCoins} coins at`);
            SoundManager.playSfx('coin');

            this.nextHeightRewardDistance += HEIGHT_REWARD_STEP;
        }
    }

    updateResources(dt, grounded) {
        const fuelRecharge = grounded ? this.runStats.fuelRechargeGround : this.runStats.fuelRechargeAir;
        gameState.car.fuel = clamp(gameState.car.fuel + (fuelRecharge * dt), 0, gameState.car.maxFuel);
        gameState.car.health = clamp(gameState.car.health + (BALANCE.healthRegen * dt), 0, gameState.car.maxHealth);
    }

    updateParallax(time) {
        this.background.y = GAME_HEIGHT / 2;
        this.mountainsFar.y = (GAME_HEIGHT / 2) + 44;
        this.mountainsNear.y = (GAME_HEIGHT / 2) + 84;

        this.clouds.forEach((cloud, index) => {
            cloud.x = cloud.baseX + (Math.sin((time / 2800) + cloud.floatOffset) * (18 + (index * 4)));
            cloud.y = cloud.baseY + (Math.sin((time / 1600) + cloud.floatOffset) * 3);
        });
    }

    updateLevelBand() {
        const nextBand = getLevelBandForDistance(gameState.distance);
        if (this.activeLevelBand.id === nextBand.id) {
            return;
        }

        this.activeLevelBand = nextBand;
        this.showLevelBandBanner(nextBand);
    }

    applyMapTheme(immediate = false) {
        this.background.setTint(this.selectedMap.backgroundTint);
        this.mountainsFar.setTint(this.selectedMap.farTint);
        this.mountainsNear.setTint(this.selectedMap.nearTint);
        this.clouds.forEach((cloud) => cloud.setTint(this.selectedMap.cloudTint));
        this.atmosphere.setFillStyle(this.selectedMap.overlayColor, this.selectedMap.overlayAlpha);

        if (this.zoneText) {
            this.zoneText.setText(this.selectedMap.name);
            this.zoneText.setColor(this.selectedMap.accentColor);
        }

        if (this.zoneHintText) {
            this.zoneHintText.setText(this.selectedMap.description);
        }

        if (immediate) {
            this.atmosphere.setAlpha(this.selectedMap.overlayAlpha);
            return;
        }

        this.tweens.add({
            targets: this.atmosphere,
            alpha: this.selectedMap.overlayAlpha,
            duration: 450,
            ease: 'Sine.easeInOut'
        });
    }

    showLevelBandBanner(levelBand, prefix = 'Difficulty Up:') {
        this.zoneBanner.setText(`${prefix} ${levelBand.name}`);
        this.zoneBanner.setBackgroundColor('#08111f');
        this.zoneBanner.setColor(this.selectedMap.accentColor);
        this.zoneBanner.setAlpha(0);
        this.zoneBanner.y = 112;
        this.tweens.killTweensOf(this.zoneBanner);
        this.tweens.add({
            targets: this.zoneBanner,
            alpha: 1,
            y: 100,
            duration: 220,
            yoyo: true,
            hold: 900,
            ease: 'Sine.easeOut'
        });
    }

    checkLanding(grounded) {
        if (grounded && !this.wasGrounded && this.lastAirVelocity > 210) {
            this.emitBurst(this.player.x, this.player.y + 22, 0xffd166, 8);
            SoundManager.playSfx('land');
            this.player.setScale(1.08, 0.92);
        }

        this.wasGrounded = grounded;
    }

    cleanupObjects() {
        const removeBelowY = this.cameras.main.worldView.bottom + 180;

        const cleanupGroup = (group) => {
            group.children.iterate((child) => {
                if (child && child.y > removeBelowY) {
                    child.destroy();
                }
            });
        };

        cleanupGroup(this.platforms);
        cleanupGroup(this.coins);
        cleanupGroup(this.diamonds);
        cleanupGroup(this.fuelCells);
        cleanupGroup(this.repairs);
        cleanupGroup(this.hazards);
    }

    collectCoin(player, coin) {
        coin.destroy();
        gameState.currentCoins += 1;
        gameState.totalCoins += 1;
        SoundManager.playSfx('coin');
        this.showFloatingText(coin.x, coin.y - 10, '+1 coin', '#ffe38d');
    }

    collectDiamond(player, diamond) {
        diamond.destroy();
        gameState.currentDiamonds += 1;
        gameState.totalDiamonds += 1;
        gameState.car.fuel = clamp(gameState.car.fuel + 10, 0, gameState.car.maxFuel);
        SoundManager.playSfx('diamond');
        this.showFloatingText(diamond.x, diamond.y - 10, '+1 diamond', '#8ce6ff');
        this.emitBurst(diamond.x, diamond.y, 0x8ce6ff, 6);
    }

    collectFuel(player, fuelCell) {
        fuelCell.destroy();
        gameState.car.fuel = clamp(gameState.car.fuel + 34, 0, gameState.car.maxFuel);
        SoundManager.playSfx('fuel');
        this.showFloatingText(fuelCell.x, fuelCell.y - 10, 'fuel +34', '#90ee90');
    }

    collectRepair(player, repair) {
        repair.destroy();
        gameState.car.health = clamp(gameState.car.health + 28, 0, gameState.car.maxHealth);
        SoundManager.playSfx('repair');
        this.showFloatingText(repair.x, repair.y - 10, 'repair +28', '#ff9ebb');
    }

    hitHazard(player, hazard) {
        if (this.time.now < this.invulnerableUntil) {
            return;
        }

        this.invulnerableUntil = this.time.now + BALANCE.invulnerabilityMs;
        const damage = hazard.damage || 24;
        gameState.car.health = clamp(gameState.car.health - damage, 0, gameState.car.maxHealth);
        SoundManager.playSfx('hit');

        const knockback = player.x < hazard.x ? -(hazard.knockbackX || 180) : (hazard.knockbackX || 180);
        player.setVelocityX(knockback);
        player.setVelocityY(hazard.knockbackY || -240);
        player.setTint(0xff8094);
        this.time.delayedCall(140, () => player.clearTint());

        this.showFloatingText(hazard.x, hazard.y - 12, `-${damage} hp`, '#ff9ebb');
        this.emitBurst(hazard.x, hazard.y, 0xff8094, 8);

        if (gameState.car.health <= 0) {
            this.endGame('Game over: the vehicle health reached zero.');
        }
    }

    emitBurst(x, y, tint, count) {
        for (let index = 0; index < count; index += 1) {
            const particle = this.add.image(x, y, 'spark')
                .setDepth(20)
                .setTint(tint)
                .setScale(Phaser.Math.FloatBetween(0.8, 1.25));

            const destinationX = x + Phaser.Math.Between(-34, 34);
            const destinationY = y + Phaser.Math.Between(-36, 16);

            this.tweens.add({
                targets: particle,
                x: destinationX,
                y: destinationY,
                alpha: 0,
                duration: Phaser.Math.Between(240, 420),
                onComplete: () => particle.destroy()
            });
        }
    }

    showFloatingText(x, y, text, color) {
        const label = this.add.text(x, y, text, {
            fontFamily: '"Trebuchet MS", "Avenir Next", sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color
        }).setOrigin(0.5).setDepth(24);

        this.tweens.add({
            targets: label,
            y: y - 34,
            alpha: 0,
            duration: 600,
            onComplete: () => label.destroy()
        });
    }

    updateUI() {
        this.distanceText.setText(`${gameState.distance} m`);
        this.bestText.setText(`Best ${gameState.bestDistance} m`);
        this.coinsText.setText(`Coins ${gameState.currentCoins}`);
        this.diamondsText.setText(`Diamonds ${gameState.currentDiamonds}`);

        this.bars.clear();
        this.drawBar(GAME_WIDTH - 170, 56, 126, 14, gameState.car.fuel / gameState.car.maxFuel, 0x1b2b48, 0x4ad66d);
        this.drawBar(GAME_WIDTH - 170, 98, 126, 14, gameState.car.health / gameState.car.maxHealth, 0x1b2b48, 0xff758f);
    }

    drawBar(x, y, width, height, progress, backgroundColor, fillColor) {
        this.bars.fillStyle(backgroundColor, 0.92);
        this.bars.fillRoundedRect(x, y, width, height, 7);
        this.bars.fillStyle(fillColor, 1);
        this.bars.fillRoundedRect(x + 2, y + 2, (width - 4) * clamp(progress, 0, 1), height - 4, 6);
        this.bars.lineStyle(2, 0xffffff, 0.18);
        this.bars.strokeRoundedRect(x, y, width, height, 7);
    }

    flushPlaytimeProgress(shouldPersist) {
        if (this.pendingPlaytimeSeconds <= 0) {
            return;
        }

        addPlaytimeSeconds(this.pendingPlaytimeSeconds, shouldPersist);
        this.pendingPlaytimeSeconds = 0;
    }

    endGame(outcome) {
        if (!this.gameActive) {
            return;
        }

        this.gameActive = false;
        this.flushPlaytimeProgress(true);
        captureRunSummary(outcome, this.selectedMap, {
            heightRewardCoins: this.heightRewardCoins
        });
        saveGameData();
        SoundManager.playSfx(gameState.lastRun.newBest ? 'record' : 'gameover');
        this.cameras.main.fadeOut(280, 5, 11, 22);
        this.time.delayedCall(280, () => this.scene.start('GameOverScene'));
    }
}
