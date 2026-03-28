# 🎮 Getting Started - Hill Climb Racer

## 🚀 Installation & Setup

### Option 1: Direct Open (Easiest)
1. Navigate to `d:\game development\game\`
2. Double-click `index.html`
3. Game launches in your default browser
4. Click **PLAY** to start!

### Option 2: Using Local Server (Recommended)
Windows:
```bash
cd "d:\game development\game"
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Option 3: Batch File Launcher (Windows)
Double-click `run.bat` in the game folder

## 🎮 Playing the Game

### Main Menu
- Shows your total coins and diamonds (saved from previous games)
- Shows your best distance record
- Click **PLAY** to start a new game

### Gameplay
1. **Objective**: Climb as high as possible
2. **Collect**: Coins (🪙) and diamonds (💎) along the way
3. **Avoid**: Obstacles that deal damage
4. **Manage**: Fuel and health bars
5. **Beat**: Your personal best distance

### Game Over
- View your stats for this run
- See floating text encouragement ("Great run!", "Awesome!", etc.)
- See your total coins and diamonds (permanent)
- Choose to **RESTART** or go to **MENU**

## 📊 Understanding the UI

### Top Left (Fixed Position)
```
Distance: XXX m           ← Current climbing height
Coins: XX                ← Collected this run
Diamonds: XX             ← Collected this run
```

### Top Right (Fixed Position)
```
Best: XXX m              ← Your all-time record
```

### Left Side (Fixed Position)
```
[====FUEL====]           ← Green bar (regenerates)
Fuel
[====HP======]           ← Red bar (takes damage)
HP
```

## 🎯 Game Mechanics Explained

### Climbing
- Your car is affected by gravity (falls down naturally)
- Use acceleration (UP/W) to push upward
- Acceleration uses **fuel** which regenerates automatically
- The terrain slopes randomly (more challenging as you go higher)

### Fuel System
- Green bar shows current fuel
- Depletes when you accelerate
- Regenerates automatically over time
- You can't boost without fuel

### Health System
- Red bar shows current health (starts at 100)
- Hit obstacles to take 10 damage
- Health regenerates slowly over time
- Game ends when health reaches 0

### Collectibles

**Coins** (Gold circles)
- Found scattered throughout the level
- Add to your score this run
- Saved permanently - never reset
- Multiple coins per run add up

**Diamonds** (Cyan diamonds)
- Rare collectibles (appear less frequently)
- More valuable than coins
- Also saved permanently
- Great for long-term progression

**Boosters** (Pink squares)
- Instant restoration items
- Restore fuel to max
- Restore health to max
- Great for extending your run

### Obstacles
- Brown spiky rocks
- Deal 10 damage if hit
- Knockback effect when hit
- More frequent at higher altitudes

## 🏆 Game Progression

### Each Session
1. Fresh start (no fuel/health carryover)
2. Climb the procedurally generated terrain
3. Encounter random obstacles and collectibles
4. Your session ends when your car is destroyed or falls

### Between Sessions
- Total coins persist ✓
- Total diamonds persist ✓
- Best distance record persists ✓
- Everything is automatically saved
- No manual save needed

### Long-term
Build up your lifetime statistics as you play more rounds!

## ⚙️ Customization Guide

### Change Game Difficulty

**Make it Easier:**
- Edit `js/gameconfig.js`
- Increase `maxFuel`: `gameState.car.maxFuel = 200`
- Increase `maxHealth`: `gameState.car.maxHealth = 200`
- Reduce gravity: physics config (advanced)

**Make it Harder:**
- In `js/scenes/gamescene.js`, find `generateTerrain()`
- Change `Math.random() < 0.2` to `0.4` (more obstacles)
- Change `Math.random() < 0.3` to `0.1` (fewer coins)

### Change Colors

**Car Color:**
Edit `js/graphics.js`, in `createCar()`:
```javascript
graphics.fillStyle(0xff3333, 1); // Red - change this
```

**Available Colors:**
```
0xff3333 = Red
0x0000ff = Blue  
0x00ff00 = Green
0xFFFF00 = Yellow
0xFF00FF = Magenta
0x00FFFF = Cyan
0xFF6600 = Orange
```

**Coin Color:**
Edit in `createCoin()`:
```javascript
graphics.fillStyle(0xFFD700, 1); // Gold
```

**Obstacle Color:**
Edit in `createObstacle()`:
```javascript
graphics.fillStyle(0x8B7355, 1); // Brown
```

### Change Spawn Rates

In `js/scenes/gamescene.js`, in `generateTerrain()`:

```javascript
// Coins (default 0.3 = 30% chance)
if (Math.random() < 0.3) { ... }

// Diamonds (default 0.1 = 10% chance)
if (Math.random() < 0.1) { ... }

// Obstacles (default 0.2 = 20% chance)
if (Math.random() < 0.2) { ... }

// Boosters (default 0.08 = 8% chance)
if (Math.random() < 0.08) { ... }
```

Lower numbers = less frequent
Higher numbers = more frequent

## 🛠️ Developer Information

### Key Game Objects

**gameState** (global)
```javascript
gameState.totalCoins        // Lifetime coins
gameState.totalDiamonds     // Lifetime diamonds
gameState.currentCoins      // This run
gameState.currentDiamonds   // This run
gameState.distance          // Current altitude
gameState.bestDistance      // Personal record
gameState.car.fuel          // Current fuel (0-100)
gameState.car.health        // Current health (0-100)
```

**Scene Functions**

| Scene | Purpose |
|-------|---------|
| PreloadScene | Initialize graphics, load data |
| TitleScene | Main menu |
| GameScene | Main gameplay loop |
| GameOverScene | Results and restart |

### Physics Constants

In `js/gameconfig.js`:
```javascript
physics.arcade.gravity.y = 500; // Gravity strength
```

In `js/scenes/gamescene.js`:
```javascript
this.car.setVelocityX(-250);    // Steering speed
this.car.setVelocityY(-300);    // Acceleration force
```

## 🐛 Common Issues

**Game loads blank:**
- Check browser console (F12)
- Ensure Phaser CDN loads (needs internet)
- Try refreshing page

**Controls don't respond:**
- Check you're clicking in the game window first
- Try keyboard: arrow keys or WASD
- Try clicking buttons on menu

**Data not persisting:**
- Browser localStorage must be enabled
- Check browser settings
- Try using Chrome/Firefox

**Performance issues:**
- Close other tabs
- Reduce number of spawned objects
- Works best on modern devices

## 📈 Tips for High Scores

1. **Save fuel** - Use acceleration strategically
2. **Grab boosters** - Look for pink items
3. **Minimize damage** - Avoid obstacles when possible
4. **Use health regen** - Health regenerates slowly
5. **Multiple runs** - Each run builds your total coins/diamonds
6. **Learn patterns** - Physics are consistent

## 🎓 Code Learning Path

1. Start with `index.html` - Simple structure
2. Read `js/gameconfig.js` - Game setup
3. Read `js/graphics.js` - Understand graphics generation
4. Read `js/scenes/titlescene.js` - Menu system
5. Read `js/scenes/gamescene.js` - Main game logic
6. Modify colors and values
7. Add your own features

## 🚀 Next Steps

1. ✅ Open and play `index.html`
2. 🎨 Customize colors in `js/graphics.js`
3. ⚙️ Adjust difficulty in `gameconfig.js`
4. 🛠️ Explore the code and understand it
5. 🎮 Add your own features

---

**Questions? Check README.md or explore the code! Happy gaming! 🏎️**
