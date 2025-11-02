// Crafting Phase - Decision-based crafting mechanics
class CraftingPhase {
    constructor(canvas, ctx, gameState) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = gameState;

        // Recipes
        this.recipes = this.initializeRecipes();
        this.currentRecipe = null;
        this.craftingProgress = 0;
        this.craftingStage = 0; // 0-3 decision points
        this.decisions = [];

        // Quality tiers
        this.qualityTiers = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    }

    // Initialize recipe data
    initializeRecipes() {
        return [
            {
                id: 0,
                name: 'Wooden Sword',
                requirements: { wood: 5, iron: 1 },
                baseValue: 20,
                stages: 3
            },
            {
                id: 1,
                name: 'Iron Dagger',
                requirements: { iron: 3, leather: 2 },
                baseValue: 35,
                stages: 3
            },
            {
                id: 2,
                name: 'Leather Armor',
                requirements: { leather: 8, iron: 2 },
                baseValue: 50,
                stages: 4
            },
            {
                id: 3,
                name: 'Ruby Ring',
                requirements: { gold: 2, ruby: 1 },
                baseValue: 100,
                stages: 4
            },
            {
                id: 4,
                name: 'Sapphire Necklace',
                requirements: { gold: 3, sapphire: 1, silk: 1 },
                baseValue: 150,
                stages: 4
            },
            {
                id: 5,
                name: 'Healing Potion',
                requirements: { herbs: 5, crystal: 1 },
                baseValue: 30,
                stages: 3
            }
        ];
    }

    // Start crafting a recipe
    startCrafting(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return false;

        // Check if recipe is unlocked
        if (!this.gameState.state.progress.unlockedRecipes.includes(recipeId)) {
            console.log('Recipe not unlocked yet');
            return false;
        }

        // Check if player has materials
        if (!this.gameState.hasMaterials(recipe.requirements)) {
            console.log('Not enough materials');
            return false;
        }

        // Consume materials
        this.gameState.consumeMaterials(recipe.requirements);

        // Start crafting
        this.currentRecipe = recipe;
        this.craftingProgress = 0;
        this.craftingStage = 0;
        this.decisions = [];

        this.render();
        return true;
    }

    // Render crafting interface
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.currentRecipe) {
            this.renderRecipeList();
        } else {
            this.renderCraftingProcess();
        }
    }

    // Render recipe list
    renderRecipeList() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('Available Recipes', 50, 60);

        const availableRecipes = this.getAvailableRecipes();

        availableRecipes.forEach((recipe, index) => {
            const y = 120 + index * 80;

            // Recipe box
            const canCraft = this.gameState.hasMaterials(recipe.requirements);
            this.ctx.fillStyle = canCraft ? 'rgba(76, 175, 80, 0.3)' : 'rgba(100, 100, 100, 0.3)';
            this.ctx.fillRect(50, y, 1180, 70);

            this.ctx.strokeStyle = canCraft ? '#4CAF50' : '#666';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(50, y, 1180, 70);

            // Recipe name
            this.ctx.fillStyle = canCraft ? 'white' : '#999';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(recipe.name, 70, y + 30);

            // Requirements
            this.ctx.font = '18px Arial';
            let reqText = 'Requires: ';
            for (let mat in recipe.requirements) {
                const has = this.gameState.state.inventory.materials[mat] || 0;
                const needs = recipe.requirements[mat];
                reqText += `${mat} (${has}/${needs})  `;
            }
            this.ctx.fillText(reqText, 70, y + 55);

            // Base value
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText(`Value: ${recipe.baseValue}`, 900, y + 40);

            // Store click area
            if (canCraft) {
                // Will be handled by click detection
            }
        });

        // Instructions
        this.ctx.fillStyle = '#888';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click on a recipe to start crafting', 50, this.canvas.height - 30);
    }

    // Render crafting process
    renderCraftingProcess() {
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`Crafting: ${this.currentRecipe.name}`, 50, 60);

        // Progress bar
        const progressWidth = 1180;
        const progressHeight = 40;
        const progressX = 50;
        const progressY = 100;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(progressX, progressY, progressWidth, progressHeight);

        const progress = this.craftingProgress / 100;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);

        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(progressX, progressY, progressWidth, progressHeight);

        // Stage indicator
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Stage ${this.craftingStage + 1} / ${this.currentRecipe.stages}`, 50, 180);

        // Decision buttons
        if (this.craftingProgress < 100) {
            this.renderDecisionButtons();
        } else {
            this.renderResult();
        }
    }

    // Render decision buttons
    renderDecisionButtons() {
        const y = 250;

        // Stabilize button (safer, lower risk)
        this.ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
        this.ctx.fillRect(100, y, 500, 100);
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(100, y, 500, 100);

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('STABILIZE', 250, y + 40);
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Safe choice - consistent quality', 150, y + 70);

        // Enhance button (risky, higher potential)
        this.ctx.fillStyle = 'rgba(156, 39, 176, 0.5)';
        this.ctx.fillRect(680, y, 500, 100);
        this.ctx.strokeStyle = '#9C27B0';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(680, y, 500, 100);

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('ENHANCE', 850, y + 40);
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Risky choice - higher quality', 730, y + 70);

        // Instructions
        this.ctx.fillStyle = '#888';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click to make your crafting decision', 400, y + 150);
    }

    // Handle decision
    makeDecision(choice) {
        if (this.craftingProgress >= 100) return;

        this.decisions.push(choice);
        this.craftingStage++;

        // Calculate progress
        const stageProgress = 100 / this.currentRecipe.stages;
        this.craftingProgress += stageProgress;

        if (this.craftingProgress >= 100) {
            this.craftingProgress = 100;
            this.completeCrafting();
        }

        this.render();
    }

    // Complete crafting and calculate quality
    completeCrafting() {
        // Calculate quality based on decisions
        let qualityScore = 0;

        this.decisions.forEach(decision => {
            if (decision === 'stabilize') {
                qualityScore += 0.4 + Math.random() * 0.2; // 0.4-0.6
            } else { // enhance
                qualityScore += Math.random() * 1.0; // 0.0-1.0 (risky!)
            }
        });

        // Average score
        qualityScore /= this.decisions.length;

        // Determine quality tier
        let quality;
        if (qualityScore >= 0.9) quality = 'legendary';
        else if (qualityScore >= 0.7) quality = 'epic';
        else if (qualityScore >= 0.5) quality = 'rare';
        else if (qualityScore >= 0.3) quality = 'uncommon';
        else quality = 'common';

        // Calculate value multiplier
        const multipliers = {
            common: 1.0,
            uncommon: 1.5,
            rare: 2.0,
            epic: 3.0,
            legendary: 5.0
        };

        const finalValue = this.currentRecipe.baseValue * multipliers[quality];

        // Add item to inventory
        this.gameState.addCraftedItem(this.currentRecipe.name, quality, finalValue);

        // Add experience
        this.gameState.addExperience(10 + multipliers[quality] * 10);

        // Store result for display
        this.craftResult = {
            name: this.currentRecipe.name,
            quality: quality,
            value: finalValue,
            qualityScore: qualityScore
        };
    }

    // Render crafting result
    renderResult() {
        if (!this.craftResult) return;

        const y = 250;

        // Result box
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(200, y, 880, 300);

        this.ctx.strokeStyle = this.getQualityColor(this.craftResult.quality);
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(200, y, 880, 300);

        // Title
        this.ctx.fillStyle = this.getQualityColor(this.craftResult.quality);
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Crafting Complete!', 640, y + 70);

        // Item name
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(this.craftResult.name, 640, y + 130);

        // Quality
        this.ctx.fillStyle = this.getQualityColor(this.craftResult.quality);
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(this.craftResult.quality.toUpperCase(), 640, y + 180);

        // Value
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText(`Value: ${Math.floor(this.craftResult.value)} gold`, 640, y + 230);

        this.ctx.textAlign = 'left';

        // Continue button hint
        this.ctx.fillStyle = '#888';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click anywhere to continue', 640, y + 280);
        this.ctx.textAlign = 'left';
    }

    // Get color for quality tier
    getQualityColor(quality) {
        switch (quality) {
            case 'legendary': return '#FF6B00';
            case 'epic': return '#A335EE';
            case 'rare': return '#0070DD';
            case 'uncommon': return '#1EFF00';
            case 'common': return '#9D9D9D';
            default: return '#FFF';
        }
    }

    // Handle click during crafting
    handleClick(x, y) {
        if (!this.currentRecipe) {
            // Check if clicked on a recipe
            const availableRecipes = this.getAvailableRecipes();
            availableRecipes.forEach((recipe, index) => {
                const recipeY = 120 + index * 80;
                if (x >= 50 && x <= 1230 && y >= recipeY && y <= recipeY + 70) {
                    this.startCrafting(recipe.id);
                }
            });
        } else if (this.craftingProgress >= 100) {
            // Reset after viewing result
            this.currentRecipe = null;
            this.craftResult = null;
            this.render();
        } else {
            // Decision buttons
            const buttonY = 250;
            if (y >= buttonY && y <= buttonY + 100) {
                if (x >= 100 && x <= 600) {
                    this.makeDecision('stabilize');
                } else if (x >= 680 && x <= 1180) {
                    this.makeDecision('enhance');
                }
            }
        }
    }

    // Get available recipes for player
    getAvailableRecipes() {
        return this.recipes.filter(recipe =>
            this.gameState.state.progress.unlockedRecipes.includes(recipe.id)
        );
    }
}
