# Hill Climb Racer Turbo

A brighter, smoother, more playable arcade climbing game built with Phaser 3. The whole game still uses procedural graphics, but the main loop is now tuned around a cleaner upward run with better controls, clearer pickups, stronger UI, and a more polished menu flow.

## What's New

- Refreshed fullscreen shell with a more modern presentation
- Animated title, preload, and game-over scenes
- Stronger procedural art for the buggy, terrain, pickups, hazards, and backdrop
- Reworked climb loop with better platform generation and pacing
- Four altitude-based level zones with rising difficulty
- Separate map selection for `Mountains`, `Greenland`, and `Moon`
- Separate rewards tab for daily login streaks and playtime claims
- Height milestone coins that start at 200 m and double every extra 100 m
- Goals tab with missions and achievements
- Map-specific hazards for Mountains, Greenland, and Moon
- Installable PWA support for desktop and mobile browsers
- Fuel and health pickups separated for more readable decisions
- On-screen touch controls for mobile play
- Save migration for older `coins`, `diamonds`, and `bestDist` browser data
- Garage shop with upgrades and unlockable vehicles

## How To Play

1. Open `index.html` in a modern browser.
2. On phones, rotate to landscape for the best view and controls.
3. Press `Start`.
4. Open `Garage` any time from the main menu to buy vehicles and upgrades.
5. Open `Maps` to unlock or select the map you want.
6. Open `Rewards` to claim daily login and playtime bonuses.
7. Open `Goals` to track missions and achievements.
8. Keep moving upward from platform to platform.
9. Expect higher climbs to introduce tighter platforms, wider gaps, and more hazards.
10. Use the install button in supported browsers if you want the game on your home screen or desktop.

### Controls

- `A` / `Left Arrow`: steer left
- `D` / `Right Arrow`: steer right
- `W` / `Up Arrow` / `Space`: boost jump
- Mobile: use the on-screen `LEFT`, `RIGHT`, and `BOOST` buttons

## Pickups And Hazards

- `Coin`: adds to your saved coin total
- `Diamond`: adds to your saved diamond total and gives a small fuel bump
- `Fuel`: restores boost fuel
- `Repair`: restores health
- `Hazard`: deals damage and knocks the buggy back
- Mountains use rock spikes, Greenland uses ice shards, and Moon uses floating plasma orbs

## Garage And Shop

- Buy new vehicles with coins and diamonds
- Select your owned vehicle before starting a run
- Upgrade `Engine`, `Fuel Tank`, `Armor`, and `Booster`
- Garage progress is saved in browser local storage
- Maps can be unlocked with coins and stay saved in browser local storage
- `Moon` uses lower gravity than the other maps

## Rewards

- Daily login rewards start at 50 coins and 5 diamonds
- Consecutive daily claims double the coin reward
- Every 30 minutes of active playtime unlocks a 100 coin and 10 diamond reward
- Climb rewards start at 200 m with 20 coins and double every extra 100 m
- Reward progress is saved in browser local storage

## Goals

- Missions give early progression rewards for runs, coins, diamonds, Moon runs, and garage growth
- Achievements reward bigger milestones like 500 m, 1000 m, all maps, and all vehicles
- Goal progress is saved in browser local storage

## Project Structure

```text
game/
|- index.html
|- README.md
|- QUICKSTART.md
`- js/
   |- main.js
   |- gameconfig.js
   |- graphics.js
   |- audio.js
   `- scenes/
      |- preloadscene.js
      |- titlescene.js
      |- shopscene.js
      |- mapscene.js
      |- rewardscene.js
      |- goalsscene.js
      |- gamescene.js
      `- gameoverscene.js
```

## Notes

- Progress is saved in browser local storage.
- Older save keys are migrated automatically.
- Phaser is loaded from the jsDelivr CDN, so the browser needs network access the first time it loads the page.
- Desktop Chrome/Edge and Android browsers can install the game directly as a PWA.
- On iPhone or iPad, use Safari `Share > Add to Home Screen`.
