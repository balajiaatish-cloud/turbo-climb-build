const STORAGE_KEYS = {
    coins: 'hillclimb.coins',
    diamonds: 'hillclimb.diamonds',
    bestDistance: 'hillclimb.bestDistance',
    highRecords: 'hillclimb.highRecords',
    soundMuted: 'hillclimb.soundMuted',
    garage: 'hillclimb.garage',
    rewards: 'hillclimb.rewards',
    progress: 'hillclimb.progress'
};

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const WORLD_HEIGHT = 220000;
const PLAYTIME_REWARD_SECONDS = 30 * 60;
const HEIGHT_REWARD_START = 200;
const HEIGHT_REWARD_STEP = 100;
const HEIGHT_REWARD_BASE_COINS = 20;

const REWARD_DEFS = {
    dailyLogin: {
        baseCoins: 50,
        diamonds: 5
    },
    playtime: {
        requiredSeconds: PLAYTIME_REWARD_SECONDS,
        coins: 100,
        diamonds: 10
    }
};

const MISSION_DEFS = [
    {
        id: 'first_run',
        name: 'First Run',
        description: 'Complete your first climb.',
        metric: 'totalRuns',
        target: 1,
        rewardCoins: 25,
        rewardDiamonds: 0
    },
    {
        id: 'climb_200',
        name: 'Hill Scout',
        description: 'Reach 200 m in a single run.',
        metric: 'bestDistance',
        target: 200,
        rewardCoins: 40,
        rewardDiamonds: 0
    },
    {
        id: 'coins_50',
        name: 'Coin Catcher',
        description: 'Collect 50 coins across all runs.',
        metric: 'totalCoinsCollected',
        target: 50,
        rewardCoins: 60,
        rewardDiamonds: 1
    },
    {
        id: 'diamonds_5',
        name: 'Gem Pocket',
        description: 'Collect 5 diamonds across all runs.',
        metric: 'totalDiamondsCollected',
        target: 5,
        rewardCoins: 50,
        rewardDiamonds: 2
    },
    {
        id: 'moon_run',
        name: 'Moon Rookie',
        description: 'Finish a run on the Moon map.',
        metric: 'moonRuns',
        target: 1,
        rewardCoins: 80,
        rewardDiamonds: 2
    },
    {
        id: 'garage_growth',
        name: 'Garage Growth',
        description: 'Own 2 vehicles.',
        metric: 'ownedVehicles',
        target: 2,
        rewardCoins: 90,
        rewardDiamonds: 0
    }
];

const ACHIEVEMENT_DEFS = [
    {
        id: 'peak_500',
        name: 'Peak 500',
        description: 'Reach 500 m in a single run.',
        metric: 'bestDistance',
        target: 500,
        rewardCoins: 120,
        rewardDiamonds: 2
    },
    {
        id: 'peak_1000',
        name: 'Peak 1000',
        description: 'Reach 1000 m in a single run.',
        metric: 'bestDistance',
        target: 1000,
        rewardCoins: 260,
        rewardDiamonds: 4
    },
    {
        id: 'map_master',
        name: 'Map Master',
        description: 'Unlock every map.',
        metric: 'unlockedMaps',
        target: 3,
        rewardCoins: 120,
        rewardDiamonds: 3
    },
    {
        id: 'garage_legend',
        name: 'Garage Legend',
        description: 'Own every vehicle.',
        metric: 'ownedVehicles',
        target: 4,
        rewardCoins: 180,
        rewardDiamonds: 4
    },
    {
        id: 'road_veteran',
        name: 'Road Veteran',
        description: 'Complete 10 runs.',
        metric: 'totalRuns',
        target: 10,
        rewardCoins: 150,
        rewardDiamonds: 2
    }
];

const BALANCE = {
    gravity: 880,
    moveAcceleration: 1700,
    airAcceleration: 980,
    moveDampingGround: 0.16,
    moveDampingAir: 0.08,
    maxSpeedX: 340,
    jumpVelocity: -500,
    airBoostVelocity: -300,
    maxFallSpeed: 920,
    boostCooldown: 210,
    groundBoostCost: 10,
    airBoostCost: 15,
    fuelRechargeGround: 19,
    fuelRechargeAir: 8,
    healthRegen: 1.4,
    invulnerabilityMs: 950,
    maxFuel: 100,
    maxHealth: 100,
    minPlatformWidth: 130,
    maxPlatformWidth: 280,
    minGapY: 86,
    maxGapY: 138,
    maxHorizontalShift: 220,
    terrainBuffer: 1900
};

const LEVEL_BANDS = [
    {
        id: 'foothills',
        name: 'Base Climb',
        tagline: 'The opening stretch feels forgiving.',
        startDistance: 0,
        backgroundTint: 0xffffff,
        farTint: 0xffffff,
        nearTint: 0xffffff,
        cloudTint: 0xffffff,
        overlayColor: 0x10263f,
        overlayAlpha: 0,
        accentColor: '#ffd166',
        platformTexture: 'platform-meadow',
        hazardTint: 0xffffff,
        difficultyBonus: 0,
        gapBonusY: 0,
        widthPenalty: 0,
        shiftBonus: 0,
        hazardBonus: 0,
        diamondBonus: 0,
        fuelBonus: 0.04,
        repairBonus: 0.03
    },
    {
        id: 'sunset',
        name: 'Steep Rise',
        tagline: 'Gaps widen and platform control matters more.',
        startDistance: 450,
        backgroundTint: 0xffd3a1,
        farTint: 0xffc27a,
        nearTint: 0xe38b5b,
        cloudTint: 0xffe7cf,
        overlayColor: 0x6d2e14,
        overlayAlpha: 0.14,
        accentColor: '#ffb36b',
        platformTexture: 'platform-desert',
        hazardTint: 0xffd0a6,
        difficultyBonus: 0.22,
        gapBonusY: 10,
        widthPenalty: 14,
        shiftBonus: 26,
        hazardBonus: 0.08,
        diamondBonus: 0.03,
        fuelBonus: -0.02,
        repairBonus: -0.01
    },
    {
        id: 'alpine',
        name: 'Thin Air',
        tagline: 'Tighter landings and harsher recovery windows.',
        startDistance: 1000,
        backgroundTint: 0xd9f3ff,
        farTint: 0xd7e8ff,
        nearTint: 0x9ec4ea,
        cloudTint: 0xf4fbff,
        overlayColor: 0x3c7fb5,
        overlayAlpha: 0.18,
        accentColor: '#8ce6ff',
        platformTexture: 'platform-ice',
        hazardTint: 0xbfe5ff,
        difficultyBonus: 0.45,
        gapBonusY: 18,
        widthPenalty: 26,
        shiftBonus: 44,
        hazardBonus: 0.14,
        diamondBonus: 0.05,
        fuelBonus: -0.04,
        repairBonus: -0.02
    },
    {
        id: 'midnight',
        name: 'Summit Rush',
        tagline: 'Late-run pressure with the toughest hazards.',
        startDistance: 1700,
        backgroundTint: 0xbfc7ff,
        farTint: 0x7b84d8,
        nearTint: 0x3b447b,
        cloudTint: 0xd8ddff,
        overlayColor: 0x090612,
        overlayAlpha: 0.3,
        accentColor: '#cdb8ff',
        platformTexture: 'platform-night',
        hazardTint: 0xff8fa3,
        difficultyBonus: 0.74,
        gapBonusY: 28,
        widthPenalty: 40,
        shiftBonus: 70,
        hazardBonus: 0.22,
        diamondBonus: 0.08,
        fuelBonus: -0.06,
        repairBonus: -0.04
    }
];

const MAP_DEFS = [
    {
        id: 'mountains',
        name: 'Mountains',
        description: 'Classic rocky climb with normal gravity and balanced footing.',
        priceCoins: 0,
        gravity: BALANCE.gravity,
        backgroundTint: 0xffffff,
        farTint: 0xe8f0ff,
        nearTint: 0xaec6e0,
        cloudTint: 0xffffff,
        overlayColor: 0x10263f,
        overlayAlpha: 0.06,
        accentColor: '#ffd166',
        platformTexture: 'platform-mountain',
        hazardTexture: 'hazard-rock',
        hazardName: 'Rock Spike',
        hazardDamage: 24,
        hazardKnockbackX: 180,
        hazardKnockbackY: -240,
        hazardMotion: 'steady',
        hazardTint: 0xffffff,
        tip: 'Mountain routes reward steady pacing. Watch for rock spikes on landings.',
        previewColor: 0x6da4f7
    },
    {
        id: 'greenland',
        name: 'Greenland',
        description: 'Frozen ledges, cold light, and slippery-looking heights.',
        priceCoins: 10,
        gravity: BALANCE.gravity,
        backgroundTint: 0xe8fbff,
        farTint: 0xdbf3ff,
        nearTint: 0x96cbe6,
        cloudTint: 0xf7fdff,
        overlayColor: 0x2d7fa6,
        overlayAlpha: 0.14,
        accentColor: '#8ce6ff',
        platformTexture: 'platform-greenland',
        hazardTexture: 'hazard-ice',
        hazardName: 'Ice Shard',
        hazardDamage: 20,
        hazardKnockbackX: 220,
        hazardKnockbackY: -270,
        hazardMotion: 'shiver',
        hazardTint: 0xbfe5ff,
        tip: 'Greenland has normal gravity but icy shards kick harder sideways.',
        previewColor: 0x8ce6ff
    },
    {
        id: 'moon',
        name: 'Moon',
        description: 'Low gravity jumps, dark sky, and wide floating movement.',
        priceCoins: 10,
        gravity: 620,
        backgroundTint: 0xdeddf1,
        farTint: 0x8e8cb8,
        nearTint: 0x58567d,
        cloudTint: 0xe7e6ff,
        overlayColor: 0x08070f,
        overlayAlpha: 0.28,
        accentColor: '#d6d0ff',
        platformTexture: 'platform-moon',
        hazardTexture: 'hazard-orb',
        hazardName: 'Plasma Orb',
        hazardDamage: 18,
        hazardKnockbackX: 140,
        hazardKnockbackY: -320,
        hazardMotion: 'float',
        hazardTint: 0xff9ebb,
        tip: 'Moon mode uses lower gravity, but plasma orbs can pop you high into the air.',
        previewColor: 0xd6d0ff
    }
];

const VEHICLE_DEFS = [
    {
        id: 'buggy',
        name: 'Trail Buggy',
        texture: 'buggy',
        priceCoins: 0,
        priceDiamonds: 0,
        description: 'Balanced starter ride for steady climbs.',
        modifiers: {}
    },
    {
        id: 'rally',
        name: 'Rally GT',
        texture: 'vehicle-rally',
        priceCoins: 180,
        priceDiamonds: 0,
        description: 'Faster takeoff and stronger top speed.',
        modifiers: {
            moveAcceleration: 180,
            airAcceleration: 90,
            maxSpeedX: 34,
            jumpVelocity: -16,
            airBoostVelocity: -12,
            maxHealth: -8
        }
    },
    {
        id: 'hauler',
        name: 'Dust Hauler',
        texture: 'vehicle-hauler',
        priceCoins: 320,
        priceDiamonds: 3,
        description: 'A heavy truck with extra fuel and armor.',
        modifiers: {
            moveAcceleration: -110,
            airAcceleration: -90,
            maxSpeedX: -22,
            jumpVelocity: 12,
            maxFuel: 18,
            maxHealth: 34,
            fuelRechargeGround: 4
        }
    },
    {
        id: 'hopper',
        name: 'Sky Hopper',
        texture: 'vehicle-hopper',
        priceCoins: 460,
        priceDiamonds: 5,
        description: 'Built for vertical leaps and nimble recovery.',
        modifiers: {
            moveAcceleration: 70,
            airAcceleration: 120,
            maxSpeedX: 12,
            jumpVelocity: -42,
            airBoostVelocity: -34,
            maxFuel: 10
        }
    }
];

const UPGRADE_DEFS = {
    engine: {
        id: 'engine',
        name: 'Engine',
        currency: 'coins',
        costs: [70, 140, 260, 420],
        description: 'More drive power and top speed.',
        modifiers: {
            moveAcceleration: [110, 230, 360, 520],
            maxSpeedX: [10, 22, 34, 48]
        }
    },
    fuel: {
        id: 'fuel',
        name: 'Fuel Tank',
        currency: 'coins',
        costs: [60, 130, 230, 360],
        description: 'Longer boosting and faster fuel recovery.',
        modifiers: {
            maxFuel: [12, 24, 38, 54],
            fuelRechargeGround: [2, 4, 6, 9],
            fuelRechargeAir: [1, 2, 3, 5]
        }
    },
    armor: {
        id: 'armor',
        name: 'Armor',
        currency: 'coins',
        costs: [90, 180, 300, 460],
        description: 'More durability against hazards.',
        modifiers: {
            maxHealth: [14, 28, 44, 62]
        }
    },
    thrust: {
        id: 'thrust',
        name: 'Booster',
        currency: 'diamonds',
        costs: [1, 2, 4, 6],
        description: 'Improves vertical boost and lowers fuel costs.',
        modifiers: {
            jumpVelocity: [-8, -16, -26, -38],
            airBoostVelocity: [-10, -18, -28, -40],
            groundBoostCost: [-1, -2, -3, -4],
            airBoostCost: [-1, -2, -3, -4]
        }
    }
};

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#08111f',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: BALANCE.gravity },
            debug: false
        }
    }
};

const gameState = {
    totalCoins: 0,
    totalDiamonds: 0,
    currentCoins: 0,
    currentDiamonds: 0,
    distance: 0,
    bestDistance: 0,
    previousBestDistance: 0,
    highRecords: [],
    garage: createDefaultGarage(),
    rewards: createDefaultRewardsState(),
    progress: createDefaultProgressState(),
    audio: {
        muted: false
    },
    lastRun: {
        distance: 0,
        coins: 0,
        diamonds: 0,
        outcome: 'Ready to climb.',
        newBest: false,
        recordRank: null,
        heightRewardCoins: 0,
        unlockedGoals: []
    },
    supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    car: {
        fuel: BALANCE.maxFuel,
        maxFuel: BALANCE.maxFuel,
        health: BALANCE.maxHealth,
        maxHealth: BALANCE.maxHealth
    }
};

function clamp(value, min, max) {
    return Phaser.Math.Clamp(value, min, max);
}

function getViewportProfile() {
    const viewportWidth = window.innerWidth || GAME_WIDTH;
    const viewportHeight = window.innerHeight || GAME_HEIGHT;
    const shortestSide = Math.min(viewportWidth, viewportHeight);
    const longestSide = Math.max(viewportWidth, viewportHeight);
    const isPortrait = viewportHeight > viewportWidth;
    const isPhone = shortestSide <= 430;
    const isCompact = viewportWidth <= 980 || viewportHeight <= 680;
    const isTouch = gameState.supportsTouch || longestSide <= 1280;

    return {
        viewportWidth,
        viewportHeight,
        shortestSide,
        longestSide,
        isPortrait,
        isPhone,
        isCompact,
        isTouch,
        audioFontSize: isPhone ? '16px' : '18px',
        audioPaddingX: isPhone ? 10 : 12,
        audioPaddingY: isPhone ? 7 : 8,
        touchRadius: isPhone ? 60 : (isTouch ? 54 : 50),
        touchBottomInset: isPhone ? 86 : (isCompact ? 80 : 72),
        tipBottomInset: isTouch ? 70 : 22
    };
}

function getLevelBandForDistance(distance) {
    for (let index = LEVEL_BANDS.length - 1; index >= 0; index -= 1) {
        if (distance >= LEVEL_BANDS[index].startDistance) {
            return LEVEL_BANDS[index];
        }
    }

    return LEVEL_BANDS[0];
}

function getStoredNumber(primaryKey, fallbackKeys = []) {
    const rawValue = localStorage.getItem(primaryKey);
    if (rawValue !== null) {
        return parseInt(rawValue, 10) || 0;
    }

    for (const fallbackKey of fallbackKeys) {
        const fallbackValue = localStorage.getItem(fallbackKey);
        if (fallbackValue !== null) {
            return parseInt(fallbackValue, 10) || 0;
        }
    }

    return 0;
}

function createDefaultGarage() {
    return {
        selectedVehicle: 'buggy',
        selectedMap: 'mountains',
        ownedVehicles: ['buggy'],
        unlockedMaps: ['mountains'],
        upgrades: {
            engine: 0,
            fuel: 0,
            armor: 0,
            thrust: 0
        }
    };
}

function createDefaultRewardsState() {
    return {
        dailyStreak: 0,
        lastDailyClaimDay: '',
        totalPlaySeconds: 0,
        claimedPlaytimeBlocks: 0
    };
}

function createDefaultProgressState() {
    return {
        stats: {
            totalRuns: 0,
            totalCoinsCollected: 0,
            totalDiamondsCollected: 0,
            totalDistanceClimbed: 0,
            bestDistance: 0,
            moonRuns: 0
        },
        completedMissions: [],
        completedAchievements: [],
        recentUnlocks: []
    };
}

function sanitizeGarage(rawGarage) {
    const defaults = createDefaultGarage();
    const ownedVehicles = Array.isArray(rawGarage?.ownedVehicles)
        ? rawGarage.ownedVehicles.filter((vehicleId) => VEHICLE_DEFS.some((vehicle) => vehicle.id === vehicleId))
        : ['buggy'];
    const unlockedMaps = Array.isArray(rawGarage?.unlockedMaps)
        ? rawGarage.unlockedMaps.filter((mapId) => MAP_DEFS.some((map) => map.id === mapId))
        : ['mountains'];

    if (!ownedVehicles.includes('buggy')) {
        ownedVehicles.unshift('buggy');
    }

    if (!unlockedMaps.includes('mountains')) {
        unlockedMaps.unshift('mountains');
    }

    const upgrades = { ...defaults.upgrades };
    Object.values(UPGRADE_DEFS).forEach((upgrade) => {
        const rawLevel = parseInt(rawGarage?.upgrades?.[upgrade.id] ?? 0, 10) || 0;
        upgrades[upgrade.id] = clamp(rawLevel, 0, upgrade.costs.length);
    });

    const selectedVehicle = ownedVehicles.includes(rawGarage?.selectedVehicle)
        ? rawGarage.selectedVehicle
        : ownedVehicles[0];
    const selectedMap = unlockedMaps.includes(rawGarage?.selectedMap)
        ? rawGarage.selectedMap
        : unlockedMaps[0];

    return {
        selectedVehicle,
        ownedVehicles,
        selectedMap,
        unlockedMaps,
        upgrades
    };
}

function sanitizeRewards(rawRewards) {
    const defaults = createDefaultRewardsState();
    return {
        dailyStreak: Math.max(0, parseInt(rawRewards?.dailyStreak ?? defaults.dailyStreak, 10) || 0),
        lastDailyClaimDay: typeof rawRewards?.lastDailyClaimDay === 'string' ? rawRewards.lastDailyClaimDay : '',
        totalPlaySeconds: Math.max(0, parseFloat(rawRewards?.totalPlaySeconds ?? defaults.totalPlaySeconds) || 0),
        claimedPlaytimeBlocks: Math.max(0, parseInt(rawRewards?.claimedPlaytimeBlocks ?? defaults.claimedPlaytimeBlocks, 10) || 0)
    };
}

function sanitizeProgress(rawProgress) {
    const defaults = createDefaultProgressState();
    const completedMissions = Array.isArray(rawProgress?.completedMissions)
        ? rawProgress.completedMissions.filter((goalId) => MISSION_DEFS.some((goal) => goal.id === goalId))
        : [];
    const completedAchievements = Array.isArray(rawProgress?.completedAchievements)
        ? rawProgress.completedAchievements.filter((goalId) => ACHIEVEMENT_DEFS.some((goal) => goal.id === goalId))
        : [];
    const recentUnlocks = Array.isArray(rawProgress?.recentUnlocks)
        ? rawProgress.recentUnlocks
            .filter((entry) => typeof entry?.id === 'string' && typeof entry?.kind === 'string')
            .slice(0, 8)
        : [];

    return {
        stats: {
            totalRuns: Math.max(0, parseInt(rawProgress?.stats?.totalRuns ?? defaults.stats.totalRuns, 10) || 0),
            totalCoinsCollected: Math.max(0, parseInt(rawProgress?.stats?.totalCoinsCollected ?? defaults.stats.totalCoinsCollected, 10) || 0),
            totalDiamondsCollected: Math.max(0, parseInt(rawProgress?.stats?.totalDiamondsCollected ?? defaults.stats.totalDiamondsCollected, 10) || 0),
            totalDistanceClimbed: Math.max(0, parseInt(rawProgress?.stats?.totalDistanceClimbed ?? defaults.stats.totalDistanceClimbed, 10) || 0),
            bestDistance: Math.max(0, parseInt(rawProgress?.stats?.bestDistance ?? defaults.stats.bestDistance, 10) || 0),
            moonRuns: Math.max(0, parseInt(rawProgress?.stats?.moonRuns ?? defaults.stats.moonRuns, 10) || 0)
        },
        completedMissions,
        completedAchievements,
        recentUnlocks
    };
}

function getVehicleById(vehicleId) {
    return VEHICLE_DEFS.find((vehicle) => vehicle.id === vehicleId) || VEHICLE_DEFS[0];
}

function getSelectedVehicle() {
    return getVehicleById(gameState.garage.selectedVehicle);
}

function getMapById(mapId) {
    return MAP_DEFS.find((map) => map.id === mapId) || MAP_DEFS[0];
}

function getSelectedMap() {
    return getMapById(gameState.garage.selectedMap);
}

function getTodayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDayKey(dayKey) {
    if (typeof dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
        return null;
    }

    const [year, month, day] = dayKey.split('-').map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
}

function getDayDifference(previousDayKey, nextDayKey) {
    const previousDate = parseDayKey(previousDayKey);
    const nextDate = parseDayKey(nextDayKey);
    if (!previousDate || !nextDate) {
        return null;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round((nextDate.getTime() - previousDate.getTime()) / millisecondsPerDay);
}

function getUnlockedMapCount() {
    return gameState.garage.unlockedMaps.length;
}

function getCompletedMissionCount() {
    return gameState.progress.completedMissions.length;
}

function getCompletedAchievementCount() {
    return gameState.progress.completedAchievements.length;
}

function getHeightRewardCoinsForDistance(distance) {
    if (distance < HEIGHT_REWARD_START) {
        return 0;
    }

    const rewardIndex = Math.floor((distance - HEIGHT_REWARD_START) / HEIGHT_REWARD_STEP);
    return HEIGHT_REWARD_BASE_COINS * Math.pow(2, rewardIndex);
}

function getGoalDefinitions(kind) {
    return kind === 'achievement' ? ACHIEVEMENT_DEFS : MISSION_DEFS;
}

function getCompletedGoalIds(kind) {
    return kind === 'achievement' ? gameState.progress.completedAchievements : gameState.progress.completedMissions;
}

function getGoalMetricValue(metric) {
    switch (metric) {
        case 'totalRuns':
            return gameState.progress.stats.totalRuns;
        case 'bestDistance':
            return Math.max(gameState.progress.stats.bestDistance, gameState.bestDistance);
        case 'totalCoinsCollected':
            return gameState.progress.stats.totalCoinsCollected;
        case 'totalDiamondsCollected':
            return gameState.progress.stats.totalDiamondsCollected;
        case 'moonRuns':
            return gameState.progress.stats.moonRuns;
        case 'ownedVehicles':
            return getOwnedVehicleCount();
        case 'unlockedMaps':
            return getUnlockedMapCount();
        default:
            return 0;
    }
}

function getGoalProgress(definition) {
    const current = getGoalMetricValue(definition.metric);
    return {
        current,
        target: definition.target,
        complete: current >= definition.target
    };
}

function getRecentGoalUnlocks(limit = 4) {
    return gameState.progress.recentUnlocks.slice(0, limit);
}

function registerGoalUnlock(kind, definition) {
    gameState.totalCoins += definition.rewardCoins;
    gameState.totalDiamonds += definition.rewardDiamonds;

    const completedIds = getCompletedGoalIds(kind);
    completedIds.push(definition.id);

    const entry = {
        id: definition.id,
        kind,
        name: definition.name,
        rewardCoins: definition.rewardCoins,
        rewardDiamonds: definition.rewardDiamonds,
        unlockedAt: new Date().toISOString()
    };

    gameState.progress.recentUnlocks = [entry, ...gameState.progress.recentUnlocks]
        .filter((unlock, index, array) => array.findIndex((candidate) => candidate.id === unlock.id && candidate.kind === unlock.kind) === index)
        .slice(0, 8);

    return entry;
}

function evaluateGoals(kind) {
    const completedIds = getCompletedGoalIds(kind);
    const completedSet = new Set(completedIds);
    const unlockedNow = [];

    getGoalDefinitions(kind).forEach((definition) => {
        if (completedSet.has(definition.id)) {
            return;
        }

        if (getGoalMetricValue(definition.metric) >= definition.target) {
            unlockedNow.push(registerGoalUnlock(kind, definition));
            completedSet.add(definition.id);
        }
    });

    return unlockedNow;
}

function evaluateAllGoals() {
    return [
        ...evaluateGoals('mission'),
        ...evaluateGoals('achievement')
    ];
}

function recordRunProgress(mapInfo = getSelectedMap()) {
    gameState.progress.stats.totalRuns += 1;
    gameState.progress.stats.totalCoinsCollected += gameState.currentCoins;
    gameState.progress.stats.totalDiamondsCollected += gameState.currentDiamonds;
    gameState.progress.stats.totalDistanceClimbed += gameState.distance;
    gameState.progress.stats.bestDistance = Math.max(gameState.progress.stats.bestDistance, gameState.distance);

    if (mapInfo.id === 'moon') {
        gameState.progress.stats.moonRuns += 1;
    }

    return evaluateAllGoals();
}

function getDailyRewardInfo(date = new Date()) {
    const todayKey = getTodayKey(date);
    const lastClaimDay = gameState.rewards.lastDailyClaimDay;
    const dayDifference = getDayDifference(lastClaimDay, todayKey);
    const canClaim = lastClaimDay !== todayKey;
    const nextStreak = dayDifference === 1 ? gameState.rewards.dailyStreak + 1 : 1;
    const rewardCoins = REWARD_DEFS.dailyLogin.baseCoins * Math.pow(2, Math.max(0, nextStreak - 1));

    return {
        todayKey,
        canClaim,
        dayDifference,
        lastClaimDay,
        currentStreak: gameState.rewards.dailyStreak,
        nextStreak,
        rewardCoins,
        rewardDiamonds: REWARD_DEFS.dailyLogin.diamonds
    };
}

function claimDailyReward(date = new Date()) {
    const rewardInfo = getDailyRewardInfo(date);
    if (!rewardInfo.canClaim) {
        return { ok: false, reason: 'Daily reward already claimed.' };
    }

    gameState.totalCoins += rewardInfo.rewardCoins;
    gameState.totalDiamonds += rewardInfo.rewardDiamonds;
    gameState.rewards.dailyStreak = rewardInfo.nextStreak;
    gameState.rewards.lastDailyClaimDay = rewardInfo.todayKey;
    saveGameData();

    return {
        ok: true,
        coins: rewardInfo.rewardCoins,
        diamonds: rewardInfo.rewardDiamonds,
        streak: rewardInfo.nextStreak
    };
}

function getPlaytimeRewardInfo() {
    const requiredSeconds = REWARD_DEFS.playtime.requiredSeconds;
    const progressSeconds = Math.max(0, gameState.rewards.totalPlaySeconds - (gameState.rewards.claimedPlaytimeBlocks * requiredSeconds));
    const claimableBlocks = Math.floor(progressSeconds / requiredSeconds);

    return {
        requiredSeconds,
        progressSeconds,
        progressRatio: clamp(progressSeconds / requiredSeconds, 0, 1),
        claimableBlocks,
        canClaim: claimableBlocks > 0,
        rewardCoins: REWARD_DEFS.playtime.coins,
        rewardDiamonds: REWARD_DEFS.playtime.diamonds
    };
}

function addPlaytimeSeconds(seconds, shouldPersist = false) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return;
    }

    gameState.rewards.totalPlaySeconds += seconds;

    if (shouldPersist) {
        saveGameData();
    }
}

function claimPlaytimeReward() {
    const rewardInfo = getPlaytimeRewardInfo();
    if (!rewardInfo.canClaim) {
        return { ok: false, reason: 'Playtime reward not ready yet.' };
    }

    gameState.totalCoins += rewardInfo.rewardCoins;
    gameState.totalDiamonds += rewardInfo.rewardDiamonds;
    gameState.rewards.claimedPlaytimeBlocks += 1;
    saveGameData();

    return {
        ok: true,
        coins: rewardInfo.rewardCoins,
        diamonds: rewardInfo.rewardDiamonds,
        remainingBlocks: Math.max(0, rewardInfo.claimableBlocks - 1)
    };
}

function normalizeHighRecords(records) {
    if (!Array.isArray(records)) {
        return [];
    }

    const normalized = records
        .filter((record) => typeof record?.distance === 'number')
        .map((record) => {
            const map = getMapById(record.mapId || 'mountains');
            return {
                distance: record.distance,
                coins: typeof record.coins === 'number' ? record.coins : 0,
                diamonds: typeof record.diamonds === 'number' ? record.diamonds : 0,
                recordedAt: record.recordedAt || new Date(0).toISOString(),
                mapId: map.id,
                mapName: record.mapName || map.name
            };
        });

    const byMap = new Map();
    normalized.forEach((record) => {
        if (!byMap.has(record.mapId)) {
            byMap.set(record.mapId, []);
        }
        byMap.get(record.mapId).push(record);
    });

    const trimmed = [];
    byMap.forEach((recordsForMap) => {
        recordsForMap
            .sort((a, b) => {
                if (b.distance !== a.distance) {
                    return b.distance - a.distance;
                }
                if (b.diamonds !== a.diamonds) {
                    return b.diamonds - a.diamonds;
                }
                return b.coins - a.coins;
            })
            .slice(0, 5)
            .forEach((record) => trimmed.push(record));
    });

    return trimmed.sort((a, b) => {
        if (a.mapId !== b.mapId) {
            return a.mapId.localeCompare(b.mapId);
        }
        if (b.distance !== a.distance) {
            return b.distance - a.distance;
        }
        if (b.diamonds !== a.diamonds) {
            return b.diamonds - a.diamonds;
        }
        return b.coins - a.coins;
    });
}

function getRecordsForMap(mapId, limit = 5) {
    return gameState.highRecords
        .filter((record) => record.mapId === mapId)
        .sort((a, b) => {
            if (b.distance !== a.distance) {
                return b.distance - a.distance;
            }
            if (b.diamonds !== a.diamonds) {
                return b.diamonds - a.diamonds;
            }
            return b.coins - a.coins;
        })
        .slice(0, limit);
}

function getOwnedVehicleCount() {
    return gameState.garage.ownedVehicles.length;
}

function getUpgradeLevel(upgradeId) {
    return gameState.garage.upgrades[upgradeId] || 0;
}

function getNextUpgradeCost(upgradeId) {
    const upgrade = UPGRADE_DEFS[upgradeId];
    const level = getUpgradeLevel(upgradeId);
    return level >= upgrade.costs.length ? null : upgrade.costs[level];
}

function unlockMap(mapId) {
    const map = getMapById(mapId);
    if (gameState.garage.unlockedMaps.includes(map.id)) {
        return { ok: false, reason: 'Map already unlocked.' };
    }

    if (gameState.totalCoins < map.priceCoins) {
        return { ok: false, reason: 'Not enough coins.' };
    }

    gameState.totalCoins -= map.priceCoins;
    gameState.garage.unlockedMaps.push(map.id);
    gameState.garage.selectedMap = map.id;
    const unlockedGoals = evaluateAllGoals();
    saveGameData();
    return { ok: true, map, unlockedGoals };
}

function selectMap(mapId) {
    if (!gameState.garage.unlockedMaps.includes(mapId)) {
        return { ok: false, reason: 'Map not unlocked.' };
    }

    gameState.garage.selectedMap = mapId;
    saveGameData();
    return { ok: true, map: getMapById(mapId) };
}

function getAppliedRunStats() {
    const selectedVehicle = getSelectedVehicle();
    const modifierTotals = {
        moveAcceleration: 0,
        airAcceleration: 0,
        maxSpeedX: 0,
        jumpVelocity: 0,
        airBoostVelocity: 0,
        groundBoostCost: 0,
        airBoostCost: 0,
        fuelRechargeGround: 0,
        fuelRechargeAir: 0,
        maxFuel: 0,
        maxHealth: 0
    };

    const applyModifierMap = (modifierMap) => {
        if (!modifierMap) {
            return;
        }

        Object.entries(modifierMap).forEach(([key, value]) => {
            modifierTotals[key] += value;
        });
    };

    applyModifierMap(selectedVehicle.modifiers);

    Object.values(UPGRADE_DEFS).forEach((upgrade) => {
        const level = getUpgradeLevel(upgrade.id);
        if (level <= 0) {
            return;
        }

        const cumulativeModifiers = {};
        Object.entries(upgrade.modifiers).forEach(([key, values]) => {
            cumulativeModifiers[key] = values[level - 1];
        });
        applyModifierMap(cumulativeModifiers);
    });

    return {
        moveAcceleration: Math.max(900, BALANCE.moveAcceleration + modifierTotals.moveAcceleration),
        airAcceleration: Math.max(600, BALANCE.airAcceleration + modifierTotals.airAcceleration),
        maxSpeedX: Math.max(240, BALANCE.maxSpeedX + modifierTotals.maxSpeedX),
        jumpVelocity: BALANCE.jumpVelocity + modifierTotals.jumpVelocity,
        airBoostVelocity: BALANCE.airBoostVelocity + modifierTotals.airBoostVelocity,
        groundBoostCost: clamp(BALANCE.groundBoostCost + modifierTotals.groundBoostCost, 4, 20),
        airBoostCost: clamp(BALANCE.airBoostCost + modifierTotals.airBoostCost, 6, 24),
        fuelRechargeGround: clamp(BALANCE.fuelRechargeGround + modifierTotals.fuelRechargeGround, 8, 40),
        fuelRechargeAir: clamp(BALANCE.fuelRechargeAir + modifierTotals.fuelRechargeAir, 4, 18),
        maxFuel: clamp(BALANCE.maxFuel + modifierTotals.maxFuel, 70, 190),
        maxHealth: clamp(BALANCE.maxHealth + modifierTotals.maxHealth, 70, 220)
    };
}

function buyVehicle(vehicleId) {
    const vehicle = getVehicleById(vehicleId);
    if (gameState.garage.ownedVehicles.includes(vehicle.id)) {
        return { ok: false, reason: 'Already owned.' };
    }

    if (gameState.totalCoins < vehicle.priceCoins || gameState.totalDiamonds < vehicle.priceDiamonds) {
        return { ok: false, reason: 'Not enough currency.' };
    }

    gameState.totalCoins -= vehicle.priceCoins;
    gameState.totalDiamonds -= vehicle.priceDiamonds;
    gameState.garage.ownedVehicles.push(vehicle.id);
    gameState.garage.selectedVehicle = vehicle.id;
    const unlockedGoals = evaluateAllGoals();
    saveGameData();
    return { ok: true, vehicle, unlockedGoals };
}

function selectVehicle(vehicleId) {
    if (!gameState.garage.ownedVehicles.includes(vehicleId)) {
        return { ok: false, reason: 'Vehicle not owned.' };
    }

    gameState.garage.selectedVehicle = vehicleId;
    saveGameData();
    return { ok: true, vehicle: getVehicleById(vehicleId) };
}

function buyUpgrade(upgradeId) {
    const upgrade = UPGRADE_DEFS[upgradeId];
    const nextCost = getNextUpgradeCost(upgradeId);
    if (!upgrade || nextCost === null) {
        return { ok: false, reason: 'Upgrade maxed.' };
    }

    const currencyKey = upgrade.currency === 'diamonds' ? 'totalDiamonds' : 'totalCoins';
    if (gameState[currencyKey] < nextCost) {
        return { ok: false, reason: 'Not enough currency.' };
    }

    gameState[currencyKey] -= nextCost;
    gameState.garage.upgrades[upgradeId] += 1;
    saveGameData();
    return { ok: true, upgrade, level: gameState.garage.upgrades[upgradeId] };
}

function loadGameData() {
    gameState.totalCoins = getStoredNumber(STORAGE_KEYS.coins, ['coins', 'totalCoins']);
    gameState.totalDiamonds = getStoredNumber(STORAGE_KEYS.diamonds, ['diamonds', 'totalDiamonds']);
    gameState.bestDistance = getStoredNumber(STORAGE_KEYS.bestDistance, ['bestDist', 'bestDistance']);
    gameState.audio.muted = localStorage.getItem(STORAGE_KEYS.soundMuted) === 'true';

    try {
        const storedRecords = localStorage.getItem(STORAGE_KEYS.highRecords);
        const parsedRecords = storedRecords ? JSON.parse(storedRecords) : [];
        gameState.highRecords = normalizeHighRecords(parsedRecords);
    } catch (error) {
        console.warn('Failed to load high records:', error);
        gameState.highRecords = [];
    }

    try {
        const storedGarage = localStorage.getItem(STORAGE_KEYS.garage);
        const parsedGarage = storedGarage ? JSON.parse(storedGarage) : createDefaultGarage();
        gameState.garage = sanitizeGarage(parsedGarage);
    } catch (error) {
        console.warn('Failed to load garage data:', error);
        gameState.garage = createDefaultGarage();
    }

    try {
        const storedRewards = localStorage.getItem(STORAGE_KEYS.rewards);
        const parsedRewards = storedRewards ? JSON.parse(storedRewards) : createDefaultRewardsState();
        gameState.rewards = sanitizeRewards(parsedRewards);
    } catch (error) {
        console.warn('Failed to load rewards data:', error);
        gameState.rewards = createDefaultRewardsState();
    }

    try {
        const storedProgress = localStorage.getItem(STORAGE_KEYS.progress);
        const parsedProgress = storedProgress ? JSON.parse(storedProgress) : createDefaultProgressState();
        gameState.progress = sanitizeProgress(parsedProgress);
    } catch (error) {
        console.warn('Failed to load progress data:', error);
        gameState.progress = createDefaultProgressState();
    }

    const startupUnlocks = evaluateAllGoals();
    if (startupUnlocks.length > 0) {
        saveGameData();
    }
}

function saveGameData() {
    localStorage.setItem(STORAGE_KEYS.coins, String(gameState.totalCoins));
    localStorage.setItem(STORAGE_KEYS.diamonds, String(gameState.totalDiamonds));
    localStorage.setItem(STORAGE_KEYS.bestDistance, String(gameState.bestDistance));
    localStorage.setItem(STORAGE_KEYS.highRecords, JSON.stringify(gameState.highRecords));
    localStorage.setItem(STORAGE_KEYS.soundMuted, String(gameState.audio.muted));
    localStorage.setItem(STORAGE_KEYS.garage, JSON.stringify(gameState.garage));
    localStorage.setItem(STORAGE_KEYS.rewards, JSON.stringify(gameState.rewards));
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(gameState.progress));
}

function saveHighRecord(mapInfo = getSelectedMap()) {
    const entry = {
        distance: gameState.distance,
        coins: gameState.currentCoins,
        diamonds: gameState.currentDiamonds,
        recordedAt: new Date().toISOString(),
        mapId: mapInfo.id,
        mapName: mapInfo.name
    };

    gameState.highRecords = normalizeHighRecords([...gameState.highRecords, entry]);

    const mapRecords = getRecordsForMap(mapInfo.id, 5);
    const recordRank = mapRecords.findIndex((record) =>
        record.distance === entry.distance &&
        record.coins === entry.coins &&
        record.diamonds === entry.diamonds &&
        record.recordedAt === entry.recordedAt &&
        record.mapId === entry.mapId
    );

    return recordRank >= 0 ? recordRank + 1 : null;
}

function resetRunState(runStats = getAppliedRunStats()) {
    gameState.previousBestDistance = gameState.bestDistance;
    gameState.currentCoins = 0;
    gameState.currentDiamonds = 0;
    gameState.distance = 0;
    gameState.car.maxFuel = runStats.maxFuel;
    gameState.car.maxHealth = runStats.maxHealth;
    gameState.car.fuel = runStats.maxFuel;
    gameState.car.health = runStats.maxHealth;
}

function captureRunSummary(outcome, mapInfo = getSelectedMap(), extras = {}) {
    const recordRank = saveHighRecord(mapInfo);
    const unlockedGoals = recordRunProgress(mapInfo);
    gameState.lastRun = {
        distance: gameState.distance,
        coins: gameState.currentCoins,
        diamonds: gameState.currentDiamonds,
        outcome,
        mapId: mapInfo.id,
        mapName: mapInfo.name,
        newBest: gameState.distance > gameState.previousBestDistance,
        recordRank,
        heightRewardCoins: extras.heightRewardCoins || 0,
        unlockedGoals
    };
}
