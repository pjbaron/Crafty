# Crafting Shop Game

A web-based crafting and shop management game with three distinct gameplay phases.

## Game Overview

Manage your crafting shop through three daily phases:

1. **Sourcing Phase** - Find hidden materials in clutter scenes
2. **Crafting Phase** - Use materials to craft items with quality-based decisions
3. **Shop Phase** - Watch your shop automatically sell items to customers

## How to Play

1. Open `index.html` in a web browser
2. **Sourcing**: Click on a scene, then find hidden objects to collect materials
3. **Crafting**: Select recipes and make decisions (Stabilize vs Enhance) to determine item quality
4. **Shop**: Watch as customers browse and purchase your crafted items
5. Use the "Next Phase" button to advance through the daily cycle
6. Save your progress anytime with the Save button

## Game Features

### Phase 1 Implementation (Current)
- ✅ Core game loop and state machine
- ✅ Save/load system using localStorage
- ✅ Three-phase gameplay cycle
- ✅ Basic UI framework
- ✅ Sourcing phase with hidden object mechanics
- ✅ Crafting phase with decision-based quality system
- ✅ Shop phase with automated sales simulation
- ✅ Player progression (money, reputation, level, experience)
- ✅ Material inventory system
- ✅ Quality tiers (common → legendary)
- ✅ Multiple scenes and recipes

### Quality Tiers
- **Common** (gray) - 1.0x value multiplier
- **Uncommon** (green) - 1.5x value multiplier
- **Rare** (blue) - 2.0x value multiplier
- **Epic** (purple) - 3.0x value multiplier
- **Legendary** (orange) - 5.0x value multiplier

### Crafting Strategy
- **Stabilize**: Safe choice, consistent mid-range quality (40-60% score)
- **Enhance**: Risky choice, can range from failure to legendary (0-100% score)

## Technical Details

- **Canvas-based rendering** using HTML5 Canvas API
- **No external dependencies** - pure HTML, CSS, and JavaScript
- **localStorage** for save/load persistence
- **Event-driven architecture** with state machine
- **Modular design** with separate phase managers

## File Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # Game styling
├── js/
│   ├── game.js         # Main game controller
│   ├── gameState.js    # State management
│   ├── saveLoad.js     # Save/load system
│   ├── ui.js           # UI framework
│   ├── sourcing.js     # Sourcing phase logic
│   ├── crafting.js     # Crafting phase logic
│   └── shop.js         # Shop phase logic
└── README.md           # This file
```

## Future Enhancements

See `crafty.txt` for the complete development roadmap including:
- VIP client system with special requests
- Shop upgrades and customization
- Achievement system
- Advanced progression mechanics
- Audio and enhanced visuals
- Tutorial system
- More scenes, recipes, and content

## Controls

- **Mouse Click**: Interact with all game elements
- **Save Button**: Manually save game progress
- **Load Button**: Load saved game
- **Next Phase Button**: Advance to the next phase

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- localStorage API

Recommended: Chrome, Firefox, Safari, or Edge (latest versions)

## Development Notes

This is a proof-of-concept implementation using canvas primitives. Images and enhanced artwork will be added in future iterations.

Game saves automatically every 5 minutes and when manually triggered.
