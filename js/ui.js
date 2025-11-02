// UI Framework - Manages all UI updates and interactions
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.initializeElements();
        this.setupEventListeners();
    }

    // Cache DOM elements
    initializeElements() {
        this.elements = {
            currentPhase: document.getElementById('current-phase'),
            dayNumber: document.getElementById('day-number'),
            moneyAmount: document.getElementById('money-amount'),
            reputationAmount: document.getElementById('reputation-amount'),
            phaseUI: document.getElementById('phase-ui'),
            nextPhaseBtn: document.getElementById('next-phase-btn'),
            saveBtn: document.getElementById('save-btn'),
            loadBtn: document.getElementById('load-btn'),
            notificationArea: document.getElementById('notification-area')
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Next phase button
        this.elements.nextPhaseBtn.addEventListener('click', () => {
            this.onNextPhase();
        });

        // Save button
        this.elements.saveBtn.addEventListener('click', () => {
            if (this.gameState.save()) {
                this.showNotification('Game saved successfully!', 'success');
            } else {
                this.showNotification('Failed to save game', 'error');
            }
        });

        // Load button
        this.elements.loadBtn.addEventListener('click', () => {
            this.gameState.load();
            this.updateAllUI();
            this.showNotification('Game loaded!', 'success');
        });

        // Listen to game state changes
        this.gameState.addListener((event, data) => {
            this.handleStateChange(event, data);
        });
    }

    // Handle state changes from game state manager
    handleStateChange(event, data) {
        switch (event) {
            case 'init':
            case 'load':
                this.updateAllUI();
                break;
            case 'phaseChange':
                this.updatePhaseDisplay();
                this.updatePhaseUI(data);
                break;
            case 'moneyChange':
                this.updateMoney();
                break;
            case 'reputationChange':
                this.updateReputation();
                break;
            case 'levelUp':
                this.showNotification(`Level Up! You are now level ${data}`, 'success');
                break;
            case 'itemCrafted':
                this.showNotification(`Crafted ${data.itemId} (${data.quality})`, 'success');
                break;
            case 'sceneUnlocked':
                this.showNotification(`New scene unlocked!`, 'info');
                break;
            case 'recipeUnlocked':
                this.showNotification(`New recipe unlocked!`, 'info');
                break;
        }
    }

    // Update all UI elements
    updateAllUI() {
        this.updatePhaseDisplay();
        this.updateDayCounter();
        this.updateMoney();
        this.updateReputation();
        this.updatePhaseUI(this.gameState.getCurrentPhase());
    }

    // Update phase indicator
    updatePhaseDisplay() {
        const phase = this.gameState.getCurrentPhase();
        this.elements.currentPhase.textContent = phase.charAt(0).toUpperCase() + phase.slice(1);
        this.elements.currentPhase.style.color = this.getPhaseColor(phase);
    }

    // Get color for phase
    getPhaseColor(phase) {
        switch (phase) {
            case 'sourcing': return '#4CAF50';
            case 'crafting': return '#2196F3';
            case 'shop': return '#9C27B0';
            default: return '#FFF';
        }
    }

    // Update day counter
    updateDayCounter() {
        this.elements.dayNumber.textContent = this.gameState.state.progress.currentDay;
    }

    // Update money display
    updateMoney() {
        this.elements.moneyAmount.textContent = Math.floor(this.gameState.state.player.money);
    }

    // Update reputation display
    updateReputation() {
        this.elements.reputationAmount.textContent = Math.floor(this.gameState.state.player.reputation);
    }

    // Update phase-specific UI
    updatePhaseUI(phase) {
        this.elements.phaseUI.innerHTML = '';

        switch (phase) {
            case 'sourcing':
                this.createSourcingUI();
                break;
            case 'crafting':
                this.createCraftingUI();
                break;
            case 'shop':
                this.createShopUI();
                break;
        }
    }

    // Create sourcing phase UI
    createSourcingUI() {
        // Don't show overlay UI during scene selection - it will be shown when a scene starts
        const container = document.createElement('div');
        container.id = 'sourcing-overlay';
        container.className = 'sourcing-ui';
        container.style.display = 'none'; // Hidden by default
        container.innerHTML = `
            <div class="scene-info">
                <h3>Sourcing Phase</h3>
                <p class="objects-found">Click on hidden objects to collect materials!</p>
                <p>Objects Found: <span id="objects-found-count">0</span> / <span id="objects-total-count">0</span></p>
            </div>
        `;
        this.elements.phaseUI.appendChild(container);
    }

    // Show sourcing scene UI
    showSourcingSceneUI() {
        const overlay = document.getElementById('sourcing-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    // Hide sourcing scene UI
    hideSourcingSceneUI() {
        const overlay = document.getElementById('sourcing-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Create crafting phase UI
    createCraftingUI() {
        const container = document.createElement('div');
        container.className = 'crafting-ui';

        const materials = this.gameState.state.inventory.materials;
        const materialsList = Object.entries(materials)
            .map(([id, qty]) => `<div>${id}: ${qty}</div>`)
            .join('');

        container.innerHTML = `
            <div class="materials-panel">
                <h3>Materials</h3>
                <div id="materials-list">
                    ${materialsList || '<p>No materials yet</p>'}
                </div>
            </div>
            <div class="crafting-workspace">
                <h3>Crafting Phase</h3>
                <p>Use your materials to craft items!</p>
                <p>Click on recipes to craft items.</p>
                <div id="craft-result"></div>
            </div>
        `;
        this.elements.phaseUI.appendChild(container);
    }

    // Create shop phase UI
    createShopUI() {
        const container = document.createElement('div');
        container.className = 'shop-ui';

        const stock = this.gameState.state.shop.currentStock;
        const stockList = stock
            .map(item => `<div class="stat-item">${item.itemId} (${item.quality})</div>`)
            .join('');

        container.innerHTML = `
            <div class="inventory-panel">
                <h3>Shop Inventory</h3>
                <div id="shop-stock">
                    ${stockList || '<p>No items in stock</p>'}
                </div>
            </div>
            <div class="stats-panel">
                <h3>Shop Stats</h3>
                <div class="stat-item">Items in Stock: ${stock.length}</div>
                <div class="stat-item">Total Sold: ${this.gameState.state.statistics.totalItemsSold}</div>
                <div class="stat-item">Total Earned: ${Math.floor(this.gameState.state.statistics.totalMoneyEarned)}</div>
            </div>
        `;
        this.elements.phaseUI.appendChild(container);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.borderColor = this.getNotificationColor(type);
        notification.textContent = message;

        this.elements.notificationArea.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.5s ease reverse';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Get notification color
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            case 'info': return '#2196F3';
            default: return '#FFF';
        }
    }

    // Handle next phase button click
    onNextPhase() {
        const currentPhase = this.gameState.getCurrentPhase();

        // Perform phase-specific actions before transitioning
        if (currentPhase === 'crafting') {
            // Stock the shop with crafted items
            this.gameState.stockShop();
        }

        // Advance to next phase
        this.gameState.nextPhase();

        // Update day counter if we cycled back to sourcing
        if (this.gameState.getCurrentPhase() === 'sourcing') {
            this.updateDayCounter();
            this.showNotification(`Day ${this.gameState.state.progress.currentDay} begins!`, 'info');
        }
    }
}
