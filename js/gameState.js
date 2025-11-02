// Game State Manager - Handles state machine and phase transitions
class GameStateManager {
    constructor() {
        this.state = SaveLoadSystem.createDefaultState();
        this.phases = ['sourcing', 'crafting', 'shop'];
        this.currentPhaseIndex = 0;
        this.listeners = []; // Event listeners for state changes
    }

    // Initialize the game state
    init() {
        // Try to load saved game
        if (SaveLoadSystem.hasSave()) {
            this.state = SaveLoadSystem.load();
            this.currentPhaseIndex = this.phases.indexOf(this.state.progress.currentPhase);
        } else {
            this.state = SaveLoadSystem.createDefaultState();
        }

        // Setup auto-save
        SaveLoadSystem.setupAutoSave(this.state, 5);

        this.notifyListeners('init');
    }

    // Get current phase
    getCurrentPhase() {
        return this.state.progress.currentPhase;
    }

    // Advance to next phase
    nextPhase() {
        this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
        this.state.progress.currentPhase = this.phases[this.currentPhaseIndex];

        // If we're back to sourcing, increment the day
        if (this.state.progress.currentPhase === 'sourcing') {
            this.state.progress.currentDay++;
        }

        this.notifyListeners('phaseChange', this.state.progress.currentPhase);
        return this.state.progress.currentPhase;
    }

    // Add money to player
    addMoney(amount) {
        this.state.player.money += amount;
        this.state.statistics.totalMoneyEarned += amount;
        this.notifyListeners('moneyChange', this.state.player.money);
    }

    // Spend money
    spendMoney(amount) {
        if (this.state.player.money >= amount) {
            this.state.player.money -= amount;
            this.notifyListeners('moneyChange', this.state.player.money);
            return true;
        }
        return false;
    }

    // Add material to inventory
    addMaterial(materialId, quantity = 1) {
        if (!this.state.inventory.materials[materialId]) {
            this.state.inventory.materials[materialId] = 0;
        }
        this.state.inventory.materials[materialId] += quantity;
        this.notifyListeners('materialChange', { materialId, quantity: this.state.inventory.materials[materialId] });
    }

    // Check if player has enough materials
    hasMaterials(requirements) {
        for (let materialId in requirements) {
            const required = requirements[materialId];
            const available = this.state.inventory.materials[materialId] || 0;
            if (available < required) {
                return false;
            }
        }
        return true;
    }

    // Consume materials (for crafting)
    consumeMaterials(requirements) {
        if (!this.hasMaterials(requirements)) {
            return false;
        }

        for (let materialId in requirements) {
            this.state.inventory.materials[materialId] -= requirements[materialId];
        }

        this.notifyListeners('materialsConsumed', requirements);
        return true;
    }

    // Add crafted item to inventory
    addCraftedItem(itemId, quality, baseValue) {
        const item = { itemId, quality, baseValue, timestamp: Date.now() };
        this.state.inventory.craftedItems.push(item);
        this.state.statistics.totalItemsCrafted++;
        this.notifyListeners('itemCrafted', item);
    }

    // Move crafted items to shop stock
    stockShop() {
        this.state.shop.currentStock = [...this.state.inventory.craftedItems];
        this.state.inventory.craftedItems = [];
        this.notifyListeners('shopStocked', this.state.shop.currentStock);
    }

    // Add experience and level up if needed
    addExperience(amount) {
        this.state.player.experience += amount;

        // Simple level formula: level = floor(sqrt(experience / 100))
        const newLevel = Math.floor(Math.sqrt(this.state.player.experience / 100)) + 1;

        if (newLevel > this.state.player.level) {
            this.state.player.level = newLevel;
            this.notifyListeners('levelUp', newLevel);
            this.checkUnlocks();
        }
    }

    // Add reputation
    addReputation(amount) {
        this.state.player.reputation += amount;
        this.notifyListeners('reputationChange', this.state.player.reputation);
    }

    // Check for new unlocks based on level/reputation
    checkUnlocks() {
        // Unlock new scenes
        const maxScenes = 10;
        const scenesToUnlock = Math.min(Math.floor(this.state.player.level / 2) + 1, maxScenes);
        for (let i = 0; i < scenesToUnlock; i++) {
            if (!this.state.progress.unlockedScenes.includes(i)) {
                this.state.progress.unlockedScenes.push(i);
                this.notifyListeners('sceneUnlocked', i);
            }
        }

        // Unlock new recipes
        const maxRecipes = 15;
        const recipesToUnlock = Math.min(Math.floor(this.state.player.level / 1.5) + 3, maxRecipes);
        for (let i = 0; i < recipesToUnlock; i++) {
            if (!this.state.progress.unlockedRecipes.includes(i)) {
                this.state.progress.unlockedRecipes.push(i);
                this.notifyListeners('recipeUnlocked', i);
            }
        }
    }

    // Register a listener for state changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners of a state change
    notifyListeners(event, data) {
        this.listeners.forEach(listener => listener(event, data));
    }

    // Save game
    save() {
        return SaveLoadSystem.save(this.state);
    }

    // Load game
    load() {
        this.state = SaveLoadSystem.load();
        this.currentPhaseIndex = this.phases.indexOf(this.state.progress.currentPhase);
        this.notifyListeners('load', this.state);
    }

    // Get state for reading
    getState() {
        return this.state;
    }
}
