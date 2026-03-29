window.addEventListener('load', () => {
    loadGameData();
    SoundManager.attachUnlockListeners();
    gameConfig.scene = [PreloadScene, TitleScene, ShopScene, MapScene, RewardScene, GoalsScene, GameScene, GameOverScene];

    try {
        window.game = new Phaser.Game(gameConfig);
        window.addEventListener('resize', () => {
            if (window.game?.scale) {
                window.game.scale.refresh();
            }
        });
        console.log('Hill Climb Racer started');
    } catch (error) {
        console.error('Failed to create Phaser game:', error);
        const container = document.getElementById('game-container');
        if (container) {
            container.innerHTML = '<div style="padding:24px;color:#fff;font-family:Trebuchet MS, sans-serif;">Unable to start the game. Open the browser console for details.</div>';
        }
    }
});
