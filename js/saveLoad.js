// Save/Load System for Crafting Shop Game
const SaveLoadSystem = {
    SAVE_KEY: 'craftingShopSave',

    // Create a default game state
    createDefaultState() {
        return {
            version: '1.0',
            player: {
                money: 100,
                reputation: 0,
                level: 1,
                experience: 0
            },
            progress: {
                currentDay: 1,
                currentPhase: 'sourcing', // sourcing, crafting, shop
                unlockedScenes: [0], // Indices of unlocked scenes
                unlockedRecipes: [0, 1, 2], // Indices of unlocked recipes
                unlockedUpgrades: []
            },
            inventory: {
                materials: {}, // { materialId: quantity }
                craftedItems: [] // Array of { itemId, quality, baseValue }
            },
            shop: {
                upgrades: [], // Array of purchased upgrade IDs
                salesHistory: [],
                currentStock: []
            },
            vipClients: {
                activeRequests: [],
                completedRequests: []
            },
            achievements: [],
            statistics: {
                totalItemsCrafted: 0,
                totalItemsSold: 0,
                totalMoneyEarned: 0,
                scenesCompleted: 0,
                vipRequestsFulfilled: 0
            },
            lastSaveTime: Date.now()
        };
    },

    // Save game state to localStorage
    save(gameState) {
        try {
            gameState.lastSaveTime = Date.now();
            const saveData = JSON.stringify(gameState);
            localStorage.setItem(this.SAVE_KEY, saveData);
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    },

    // Load game state from localStorage
    load() {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            if (saveData) {
                const gameState = JSON.parse(saveData);
                console.log('Game loaded successfully');
                return gameState;
            } else {
                console.log('No save data found, creating new game');
                return this.createDefaultState();
            }
        } catch (error) {
            console.error('Error loading game:', error);
            return this.createDefaultState();
        }
    },

    // Check if a save exists
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('Save data deleted');
            return true;
        } catch (error) {
            console.error('Error deleting save:', error);
            return false;
        }
    },

    // Auto-save functionality
    setupAutoSave(gameState, intervalMinutes = 5) {
        setInterval(() => {
            this.save(gameState);
            console.log('Auto-saved game');
        }, intervalMinutes * 60 * 1000);
    }
};
