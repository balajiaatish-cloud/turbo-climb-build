class GameGraphics {
    static createAll(scene) {
        this.createVehicles(scene);
        this.createPlatforms(scene);
        this.createCoin(scene);
        this.createDiamond(scene);
        this.createFuel(scene);
        this.createRepair(scene);
        this.createHazards(scene);
        this.createSpark(scene);
        this.createButton(scene);
        this.createPanel(scene);
        this.createBackdrop(scene);
        this.createMountain(scene, 'mountain-far', 0x24435d, 0x1d3147);
        this.createMountain(scene, 'mountain-near', 0x2e546d, 0x22394b);
        this.createCloud(scene);
    }

    static createVehicles(scene) {
        this.createVehicle(scene, 'buggy', {
            bodyColor: 0xf76f4f,
            roofColor: 0xffd166,
            windowColor: 0x8ecae6,
            accentColor: 0x121b31,
            exhaustColor: 0xfff3c4,
            cabOffsetY: 0,
            backLength: 0
        });

        this.createVehicle(scene, 'vehicle-rally', {
            bodyColor: 0x5dc2ff,
            roofColor: 0xffed8a,
            windowColor: 0xeaf9ff,
            accentColor: 0x10314a,
            exhaustColor: 0xffffff,
            cabOffsetY: -1,
            backLength: 4
        });

        this.createVehicle(scene, 'vehicle-hauler', {
            bodyColor: 0xff9f43,
            roofColor: 0xfaf3dd,
            windowColor: 0xbde0fe,
            accentColor: 0x2a1c11,
            exhaustColor: 0xffd6a5,
            cabOffsetY: 2,
            backLength: 14,
            heavyWheels: true
        });

        this.createVehicle(scene, 'vehicle-hopper', {
            bodyColor: 0xc77dff,
            roofColor: 0x80ffdb,
            windowColor: 0xf1f5ff,
            accentColor: 0x1f1147,
            exhaustColor: 0xe0fbfc,
            cabOffsetY: -3,
            backLength: -2,
            raisedNose: true
        });
    }

    static createVehicle(scene, key, options) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        const bodyY = 20 + (options.cabOffsetY || 0);
        const roofY = 8 + (options.cabOffsetY || 0);
        const backLength = options.backLength || 0;

        graphics.fillStyle(options.accentColor, 1);
        graphics.fillRoundedRect(10, bodyY + 2, 64 + backLength, 14, 6);

        graphics.fillStyle(options.bodyColor, 1);
        graphics.fillRoundedRect(14, bodyY - 2, 60 + backLength, 16, 6);

        graphics.fillStyle(options.roofColor, 1);
        graphics.fillRoundedRect(24, roofY, 28, 14, 6);

        graphics.fillStyle(options.windowColor, 1);
        graphics.fillRoundedRect(28, roofY + 3, 20, 8, 4);

        if (options.raisedNose) {
            graphics.fillStyle(options.bodyColor, 1);
            graphics.fillTriangle(68, bodyY - 2, 84, bodyY + 5, 68, bodyY + 12);
        } else {
            graphics.fillStyle(options.accentColor, 1);
            graphics.fillRect(56 + backLength, bodyY, 12, 6);
            graphics.fillStyle(options.exhaustColor, 1);
            graphics.fillCircle(68 + backLength, bodyY + 3, 4);
        }

        graphics.lineStyle(4, 0x0a0e1c, 1);
        graphics.lineBetween(20, bodyY, 30, roofY);
        graphics.lineBetween(54, bodyY - 2, 64, roofY);
        graphics.lineBetween(30, roofY, 64, roofY);

        const wheelRadius = options.heavyWheels ? 11 : 10;
        graphics.fillStyle(0x0a0e1c, 1);
        graphics.fillCircle(24, 38, wheelRadius);
        graphics.fillCircle(64 + Math.max(0, backLength - 2), 38, wheelRadius);
        graphics.fillStyle(0xa8b8d8, 1);
        graphics.fillCircle(24, 38, 4);
        graphics.fillCircle(64 + Math.max(0, backLength - 2), 38, 4);

        graphics.generateTexture(key, 98, 48);
    }

    static createPlatforms(scene) {
        this.createPlatformVariant(scene, 'platform', {
            grassTop: 0x6bbf59,
            grassMid: 0x5a8f3f,
            soilMain: 0x654321,
            soilHighlight: 0x845835,
            lineColor: 0x9a734d
        });

        this.createPlatformVariant(scene, 'platform-meadow', {
            grassTop: 0x6bbf59,
            grassMid: 0x5a8f3f,
            soilMain: 0x654321,
            soilHighlight: 0x845835,
            lineColor: 0x9a734d
        });

        this.createPlatformVariant(scene, 'platform-desert', {
            grassTop: 0xe9b44c,
            grassMid: 0xcf8f32,
            soilMain: 0x87542a,
            soilHighlight: 0xb06d3f,
            lineColor: 0xd79b5c
        });

        this.createPlatformVariant(scene, 'platform-ice', {
            grassTop: 0xdff6ff,
            grassMid: 0xb8e4fa,
            soilMain: 0x7a9cc6,
            soilHighlight: 0xaac9e6,
            lineColor: 0xf4fbff
        });

        this.createPlatformVariant(scene, 'platform-night', {
            grassTop: 0x8a78d6,
            grassMid: 0x6455a6,
            soilMain: 0x2d2448,
            soilHighlight: 0x433567,
            lineColor: 0xb9a7ff
        });

        this.createPlatformVariant(scene, 'platform-mountain', {
            grassTop: 0x8bc34a,
            grassMid: 0x628e34,
            soilMain: 0x6a4b32,
            soilHighlight: 0x8f6846,
            lineColor: 0xb98c63
        });

        this.createPlatformVariant(scene, 'platform-greenland', {
            grassTop: 0xe4fbff,
            grassMid: 0xbfe8f4,
            soilMain: 0x88a8c2,
            soilHighlight: 0xb4d1e4,
            lineColor: 0xf8fdff
        });

        this.createPlatformVariant(scene, 'platform-moon', {
            grassTop: 0xd6d4e4,
            grassMid: 0xb1aec5,
            soilMain: 0x6b687a,
            soilHighlight: 0x8a869d,
            lineColor: 0xf1efff
        });
    }

    static createPlatformVariant(scene, key, colors) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(colors.grassTop, 1);
        graphics.fillRoundedRect(0, 0, 256, 14, 8);
        graphics.fillStyle(colors.grassMid, 1);
        graphics.fillRect(0, 10, 256, 8);
        graphics.fillStyle(colors.soilMain, 1);
        graphics.fillRoundedRect(0, 14, 256, 34, 8);
        graphics.fillStyle(colors.soilHighlight, 1);
        graphics.fillRect(0, 14, 256, 10);
        graphics.lineStyle(2, colors.lineColor, 0.82);
        graphics.lineBetween(18, 28, 238, 28);
        graphics.lineBetween(48, 40, 198, 40);

        graphics.generateTexture(key, 256, 48);
    }

    static createCoin(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0xf4b400, 1);
        graphics.fillCircle(12, 12, 11);
        graphics.fillStyle(0xffe082, 1);
        graphics.fillCircle(9, 9, 4);
        graphics.lineStyle(2, 0xfff4c2, 0.9);
        graphics.strokeCircle(12, 12, 8);

        graphics.generateTexture('coin', 24, 24);
    }

    static createDiamond(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0x7ee7ff, 1);
        graphics.beginPath();
        graphics.moveTo(14, 0);
        graphics.lineTo(26, 12);
        graphics.lineTo(14, 28);
        graphics.lineTo(2, 12);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(0xdff9ff, 0.9);
        graphics.beginPath();
        graphics.moveTo(14, 2);
        graphics.lineTo(22, 11);
        graphics.lineTo(14, 19);
        graphics.lineTo(6, 11);
        graphics.closePath();
        graphics.fillPath();

        graphics.generateTexture('diamond', 28, 28);
    }

    static createFuel(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0x0f172c, 1);
        graphics.fillRoundedRect(2, 2, 28, 32, 6);
        graphics.fillStyle(0x2dc653, 1);
        graphics.fillRoundedRect(5, 8, 22, 20, 5);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(14, 4, 4, 6);
        graphics.fillRect(10, 14, 12, 4);
        graphics.fillRect(14, 10, 4, 12);

        graphics.generateTexture('fuel', 32, 36);
    }

    static createRepair(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0xff8fab, 1);
        graphics.fillRoundedRect(0, 4, 30, 24, 8);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(12, 0, 6, 8);
        graphics.fillRect(7, 12, 16, 4);
        graphics.fillRect(13, 6, 4, 16);

        graphics.generateTexture('repair', 30, 28);
    }

    static createHazards(scene) {
        this.createHazardVariant(scene, 'hazard', 'rock');
        this.createHazardVariant(scene, 'hazard-rock', 'rock');
        this.createHazardVariant(scene, 'hazard-ice', 'ice');
        this.createHazardVariant(scene, 'hazard-orb', 'orb');
    }

    static createHazardVariant(scene, key, variant) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        if (variant === 'ice') {
            graphics.fillStyle(0xdff8ff, 1);
            graphics.fillTriangle(6, 30, 14, 2, 22, 30);
            graphics.fillTriangle(18, 30, 28, 8, 36, 30);
            graphics.fillStyle(0x8edcf4, 0.95);
            graphics.fillTriangle(10, 28, 14, 10, 18, 28);
            graphics.fillTriangle(22, 28, 28, 14, 33, 28);
            graphics.lineStyle(2, 0xf8fdff, 0.9);
            graphics.lineBetween(14, 6, 14, 28);
            graphics.lineBetween(28, 12, 27, 28);
        } else if (variant === 'orb') {
            graphics.fillStyle(0x4e406b, 1);
            graphics.fillCircle(19, 19, 15);
            graphics.fillStyle(0xff8fab, 1);
            graphics.fillCircle(19, 19, 11);
            graphics.fillStyle(0xffffff, 0.9);
            graphics.fillCircle(15, 14, 4);
            graphics.lineStyle(2, 0xd6d0ff, 0.8);
            graphics.strokeCircle(19, 19, 15);
            graphics.lineStyle(2, 0xffd6ea, 0.5);
            graphics.strokeCircle(19, 19, 18);
        } else {
            graphics.fillStyle(0x5c677d, 1);
            graphics.beginPath();
            graphics.moveTo(4, 28);
            graphics.lineTo(12, 8);
            graphics.lineTo(18, 22);
            graphics.lineTo(26, 4);
            graphics.lineTo(34, 28);
            graphics.closePath();
            graphics.fillPath();

            graphics.fillStyle(0xb56576, 1);
            graphics.fillTriangle(11, 8, 15, 2, 19, 12);
            graphics.fillTriangle(24, 4, 29, 0, 34, 11);
        }

        graphics.generateTexture(key, 38, 38);
    }

    static createSpark(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 3);
        graphics.fillStyle(0xffd166, 0.9);
        graphics.fillCircle(4, 4, 2);

        graphics.generateTexture('spark', 8, 8);
    }

    static createButton(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0x13213a, 1);
        graphics.fillRoundedRect(0, 0, 260, 68, 22);
        graphics.fillStyle(0x1c3557, 1);
        graphics.fillRoundedRect(6, 6, 248, 56, 18);
        graphics.lineStyle(3, 0xffb703, 1);
        graphics.strokeRoundedRect(6, 6, 248, 56, 18);

        graphics.generateTexture('button', 260, 68);
    }

    static createPanel(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0x08111f, 0.88);
        graphics.fillRoundedRect(0, 0, 340, 190, 26);
        graphics.fillStyle(0x10223c, 0.92);
        graphics.fillRoundedRect(6, 6, 328, 178, 20);
        graphics.lineStyle(2, 0xffffff, 0.14);
        graphics.strokeRoundedRect(6, 6, 328, 178, 20);

        graphics.generateTexture('panel', 340, 190);
    }

    static createBackdrop(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0x07111e, 1);
        graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        graphics.fillStyle(0x0b1f33, 1);
        graphics.fillRect(0, 90, GAME_WIDTH, 180);
        graphics.fillStyle(0x14304d, 1);
        graphics.fillRect(0, 270, GAME_WIDTH, 270);
        graphics.fillStyle(0xffc857, 0.95);
        graphics.fillCircle(780, 110, 54);
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillCircle(780, 110, 76);

        for (let index = 0; index < 24; index += 1) {
            const x = 40 + (index * 38);
            const y = 34 + ((index % 5) * 9);
            graphics.fillStyle(0xffffff, 0.35 + ((index % 3) * 0.12));
            graphics.fillCircle(x, y, 2);
        }

        graphics.generateTexture('backdrop', GAME_WIDTH, GAME_HEIGHT);
    }

    static createMountain(scene, key, primaryColor, secondaryColor) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(primaryColor, 1);
        graphics.beginPath();
        graphics.moveTo(0, GAME_HEIGHT);
        graphics.lineTo(0, 320);
        graphics.lineTo(110, 210);
        graphics.lineTo(230, 320);
        graphics.lineTo(380, 170);
        graphics.lineTo(520, 330);
        graphics.lineTo(650, 220);
        graphics.lineTo(820, 340);
        graphics.lineTo(GAME_WIDTH, 250);
        graphics.lineTo(GAME_WIDTH, GAME_HEIGHT);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(secondaryColor, 1);
        graphics.beginPath();
        graphics.moveTo(0, GAME_HEIGHT);
        graphics.lineTo(0, 380);
        graphics.lineTo(130, 300);
        graphics.lineTo(250, 370);
        graphics.lineTo(390, 260);
        graphics.lineTo(520, 390);
        graphics.lineTo(680, 310);
        graphics.lineTo(840, 400);
        graphics.lineTo(GAME_WIDTH, 340);
        graphics.lineTo(GAME_WIDTH, GAME_HEIGHT);
        graphics.closePath();
        graphics.fillPath();

        graphics.generateTexture(key, GAME_WIDTH, GAME_HEIGHT);
    }

    static createCloud(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0xffffff, 0.92);
        graphics.fillCircle(24, 26, 22);
        graphics.fillCircle(52, 20, 26);
        graphics.fillCircle(82, 26, 22);
        graphics.fillRoundedRect(22, 24, 64, 24, 14);

        graphics.generateTexture('cloud', 108, 64);
    }
}
