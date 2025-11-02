// Main Game Controller
class CraftingShopGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.gameState = new GameStateManager();

        // UI Manager
        this.uiManager = new UIManager(this.gameState);

        // Phase managers
        this.sourcingPhase = new SourcingPhase(this.canvas, this.ctx, this.gameState);
        this.craftingPhase = new CraftingPhase(this.canvas, this.ctx, this.gameState);
        this.shopPhase = new ShopPhase(this.canvas, this.ctx, this.gameState);

        // Game loop
        this.lastFrameTime = 0;
        this.isRunning = false;

        // Setup
        this.init();
    }

    // Initialize game
    init() {
        console.log('Initializing Crafting Shop Game...');

        // Initialize game state
        this.gameState.init();

        // Setup canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Start game loop
        this.start();

        // Initial render based on current phase
        this.onPhaseChange();

        console.log('Game initialized successfully!');
    }

    // Start game loop
    start() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    // Main game loop
    gameLoop(timestamp = 0) {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Update current phase
        this.update(deltaTime);

        // Render current phase
        this.render();

        // Continue loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // Update game state
    update(deltaTime) {
        const currentPhase = this.gameState.getCurrentPhase();

        switch (currentPhase) {
            case 'sourcing':
                // Sourcing phase is event-driven (clicks)
                break;
            case 'crafting':
                // Crafting phase is event-driven (clicks)
                break;
            case 'shop':
                // Shop phase needs continuous updates for simulation
                this.shopPhase.update(deltaTime);
                break;
        }
    }

    // Render current phase
    render() {
        const currentPhase = this.gameState.getCurrentPhase();

        switch (currentPhase) {
            case 'sourcing':
                if (this.sourcingPhase.currentScene) {
                    this.sourcingPhase.render();
                } else {
                    this.renderSourcingMenu();
                }
                break;
            case 'crafting':
                this.craftingPhase.render();
                break;
            case 'shop':
                this.shopPhase.render();
                break;
        }
    }

    // Render sourcing menu (scene selection)
    renderSourcingMenu() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Top bar is about 80px, so start below it
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('Select a Scene', 50, 120);

        const availableScenes = this.sourcingPhase.getAvailableScenes();

        availableScenes.forEach((scene, index) => {
            const y = 180 + index * 100;

            // Scene box
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
            this.ctx.fillRect(50, y, 1180, 80);

            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(50, y, 1180, 80);

            // Scene name
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(scene.name, 70, y + 35);

            // Difficulty
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText(`Difficulty: ${scene.difficulty}`, 70, y + 65);

            // Objects count
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillText(`Objects: ${scene.objects.length}`, 400, y + 65);
        });

        // Instructions - bottom bar is about 80px, so place above it
        this.ctx.fillStyle = '#888';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click on a scene to start searching for materials', 50, this.canvas.height - 100);
    }

    // Handle canvas clicks
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const currentPhase = this.gameState.getCurrentPhase();

        switch (currentPhase) {
            case 'sourcing':
                if (this.sourcingPhase.currentScene) {
                    this.sourcingPhase.handleClick(x, y);
                } else {
                    // Check scene selection
                    const availableScenes = this.sourcingPhase.getAvailableScenes();
                    availableScenes.forEach((scene, index) => {
                        const sceneY = 180 + index * 100;
                        if (x >= 50 && x <= 1230 && y >= sceneY && y <= sceneY + 80) {
                            this.sourcingPhase.startScene(scene.id);
                            // Show the sourcing UI overlay when scene starts
                            if (this.uiManager) {
                                this.uiManager.showSourcingSceneUI();
                            }
                        }
                    });
                }
                break;
            case 'crafting':
                this.craftingPhase.handleClick(x, y);
                break;
            case 'shop':
                this.shopPhase.handleClick(x, y);
                break;
        }
    }

    // Handle phase changes
    onPhaseChange() {
        const currentPhase = this.gameState.getCurrentPhase();

        // Phase-specific initialization
        switch (currentPhase) {
            case 'sourcing':
                // Reset sourcing phase and hide UI overlay
                this.sourcingPhase.currentScene = null;
                if (this.uiManager) {
                    this.uiManager.hideSourcingSceneUI();
                }
                break;
            case 'crafting':
                // Reset crafting phase
                this.craftingPhase.currentRecipe = null;
                break;
            case 'shop':
                // Start shop simulation
                this.shopPhase.start();
                break;
        }

        // Render initial state
        this.render();
    }

    // Stop game loop
    stop() {
        this.isRunning = false;
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, starting game...');

    // Create game instance
    window.game = new CraftingShopGame();

    // Listen for phase changes from UI
    window.game.gameState.addListener((event, data) => {
        if (event === 'phaseChange') {
            window.game.onPhaseChange();
        }
    });

    console.log('Game ready!');
    console.log('Use window.game to access the game instance from console');
});
