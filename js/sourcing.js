// Sourcing Phase - Hidden Object/Clutter Game
class SourcingPhase {
    constructor(canvas, ctx, gameState) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = gameState;

        // Scene data
        this.scenes = this.initializeScenes();
        this.currentScene = null;
        this.objectsFound = 0;
        this.totalObjects = 0;

        // Clutter elements (generated once per scene)
        this.clutterElements = [];

        // Click handling
        this.clickHandlers = [];
    }

    // Initialize scene data
    initializeScenes() {
        return [
            {
                id: 0,
                name: 'Workshop Storage',
                difficulty: 1,
                backgroundColor: '#3a2f2f',
                objects: [
                    { id: 'wood', x: 200, y: 150, size: 40, color: '#8B4513', material: 'wood', quantity: 3 },
                    { id: 'metal1', x: 500, y: 200, size: 30, color: '#C0C0C0', material: 'iron', quantity: 2 },
                    { id: 'gem1', x: 800, y: 300, size: 25, color: '#FF1493', material: 'ruby', quantity: 1 },
                    { id: 'leather', x: 350, y: 400, size: 35, color: '#8B4513', material: 'leather', quantity: 2 },
                    { id: 'wood2', x: 950, y: 450, size: 40, color: '#654321', material: 'wood', quantity: 2 },
                    { id: 'metal2', x: 650, y: 100, size: 28, color: '#FFD700', material: 'gold', quantity: 1 },
                    { id: 'gem2', x: 150, y: 550, size: 22, color: '#0000FF', material: 'sapphire', quantity: 1 },
                    { id: 'cloth', x: 1000, y: 250, size: 38, color: '#DDA0DD', material: 'silk', quantity: 2 }
                ]
            },
            {
                id: 1,
                name: 'Forest Clearing',
                difficulty: 2,
                backgroundColor: '#2d4a2b',
                objects: [
                    { id: 'herb1', x: 180, y: 180, size: 20, color: '#90EE90', material: 'herbs', quantity: 3 },
                    { id: 'stone1', x: 600, y: 300, size: 35, color: '#808080', material: 'stone', quantity: 4 },
                    { id: 'flower', x: 400, y: 450, size: 25, color: '#FF69B4', material: 'flowers', quantity: 2 },
                    { id: 'mushroom', x: 900, y: 500, size: 30, color: '#FF6347', material: 'mushroom', quantity: 2 },
                    { id: 'wood3', x: 250, y: 350, size: 45, color: '#8B4513', material: 'wood', quantity: 5 },
                    { id: 'crystal', x: 750, y: 150, size: 28, color: '#00CED1', material: 'crystal', quantity: 1 },
                    { id: 'herb2', x: 1050, y: 380, size: 20, color: '#32CD32', material: 'herbs', quantity: 2 },
                    { id: 'stone2', x: 450, y: 600, size: 32, color: '#696969', material: 'stone', quantity: 3 },
                    { id: 'feather', x: 850, y: 420, size: 22, color: '#FFFFFF', material: 'feather', quantity: 2 }
                ]
            }
        ];
    }

    // Start a scene
    startScene(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        if (!scene) return;

        // Check if scene is unlocked
        if (!this.gameState.state.progress.unlockedScenes.includes(sceneId)) {
            console.log('Scene not unlocked yet');
            return;
        }

        this.currentScene = scene;
        this.objectsFound = 0;
        this.totalObjects = scene.objects.length;

        // Mark all objects as not found
        scene.objects.forEach(obj => obj.found = false);

        // Generate clutter elements once for this scene
        this.generateClutterElements();

        // Update UI
        this.updateSceneUI();
        this.render();
    }

    // Generate clutter elements once per scene
    generateClutterElements() {
        this.clutterElements = [];
        const clutterCount = 100; // Increased from 30 to create real clutter

        // Get scene background to tint clutter colors appropriately
        const sceneHue = this.getSceneColorHue();

        for (let i = 0; i < clutterCount; i++) {
            // Avoid top and bottom UI areas
            const x = Math.random() * this.canvas.width;
            const y = 100 + Math.random() * (this.canvas.height - 200); // Keep away from UI bars
            const size = 15 + Math.random() * 60; // Larger range: 15-75px instead of 10-40px
            const shapeType = Math.floor(Math.random() * 4); // 4 different shape types
            const alpha = 0.3 + Math.random() * 0.5; // Varying opacity 0.3-0.8

            // Generate color based on scene theme
            let color;
            if (Math.random() > 0.3) {
                // 70% themed colors matching scene
                color = this.generateThemedColor(sceneHue);
            } else {
                // 30% grayscale for variety
                const shade = Math.floor(Math.random() * 150);
                color = `rgb(${shade}, ${shade}, ${shade})`;
            }

            this.clutterElements.push({
                x: x,
                y: y,
                size: size,
                color: color,
                shapeType: shapeType, // 0=rect, 1=circle, 2=triangle, 3=line
                alpha: alpha
            });
        }
    }

    // Get scene color hue for theming clutter
    getSceneColorHue() {
        if (!this.currentScene) return 'brown';

        // Different themes per scene
        if (this.currentScene.backgroundColor.includes('2f')) return 'brown'; // Workshop
        if (this.currentScene.backgroundColor.includes('4a')) return 'green'; // Forest
        return 'brown';
    }

    // Generate themed color for clutter
    generateThemedColor(hue) {
        if (hue === 'brown') {
            // Workshop browns, tans, dark reds
            const r = 60 + Math.floor(Math.random() * 100);
            const g = 40 + Math.floor(Math.random() * 70);
            const b = 20 + Math.floor(Math.random() * 50);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (hue === 'green') {
            // Forest greens, browns, dark yellows
            const r = 40 + Math.floor(Math.random() * 80);
            const g = 60 + Math.floor(Math.random() * 90);
            const b = 30 + Math.floor(Math.random() * 60);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return 'rgb(100, 100, 100)';
    }

    // Render the scene
    render() {
        if (!this.currentScene) return;

        // Clear canvas
        this.ctx.fillStyle = this.currentScene.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background clutter (random shapes for atmosphere)
        this.drawClutter();

        // Draw hidden objects
        this.currentScene.objects.forEach(obj => {
            if (!obj.found) {
                this.drawObject(obj);
            }
        });

        // Draw found objects counter - removed from canvas since it's shown in HTML overlay
        // The HTML UI overlay at the top left shows this information
    }

    // Draw background clutter
    drawClutter() {
        // Draw pre-generated clutter elements
        for (let clutter of this.clutterElements) {
            this.ctx.globalAlpha = clutter.alpha;
            this.ctx.fillStyle = clutter.color;

            switch (clutter.shapeType) {
                case 0: // Rectangle
                    this.ctx.fillRect(clutter.x, clutter.y, clutter.size, clutter.size);
                    break;
                case 1: // Circle
                    this.ctx.beginPath();
                    this.ctx.arc(clutter.x, clutter.y, clutter.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 2: // Triangle
                    this.ctx.beginPath();
                    this.ctx.moveTo(clutter.x, clutter.y - clutter.size / 2);
                    this.ctx.lineTo(clutter.x - clutter.size / 2, clutter.y + clutter.size / 2);
                    this.ctx.lineTo(clutter.x + clutter.size / 2, clutter.y + clutter.size / 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;
                case 3: // Line/Rectangle bar
                    this.ctx.fillRect(clutter.x, clutter.y, clutter.size * 2, clutter.size / 4);
                    break;
            }
        }

        this.ctx.globalAlpha = 1.0;
    }

    // Draw a hidden object
    drawObject(obj) {
        // Draw subtle outer glow to help object stand out slightly
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = obj.color;
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, obj.size / 2 + 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;

        // Draw shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 12;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;

        // Draw object
        this.ctx.fillStyle = obj.color;
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw bright highlight border to make it more findable
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    // Handle click on canvas
    handleClick(x, y) {
        if (!this.currentScene) return;

        // Check if click hit any object
        for (let obj of this.currentScene.objects) {
            if (obj.found) continue;

            const distance = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
            if (distance <= obj.size / 2) {
                this.onObjectFound(obj);
                return true;
            }
        }

        // Misclick - could add penalty here
        console.log('Misclick!');
        return false;
    }

    // Handle object found
    onObjectFound(obj) {
        obj.found = true;
        this.objectsFound++;

        // Add material to inventory
        this.gameState.addMaterial(obj.material, obj.quantity);

        // Visual feedback - glow effect
        this.drawFoundEffect(obj);

        // Update UI
        this.updateSceneUI();

        // Check if scene is complete
        if (this.objectsFound >= this.totalObjects) {
            setTimeout(() => this.onSceneComplete(), 500);
        } else {
            this.render();
        }
    }

    // Draw found effect
    drawFoundEffect(obj) {
        let alpha = 1.0;
        let radius = obj.size / 2;

        const animate = () => {
            this.render();

            // Draw expanding glow
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();

            alpha -= 0.05;
            radius += 2;

            if (alpha > 0) {
                requestAnimationFrame(animate);
            } else {
                this.ctx.globalAlpha = 1.0;
            }
        };

        animate();
    }

    // Handle scene completion
    onSceneComplete() {
        console.log('Scene complete!');

        // Add experience
        this.gameState.addExperience(this.currentScene.difficulty * 20);

        // Update statistics
        this.gameState.state.statistics.scenesCompleted++;

        // Clear scene
        this.currentScene = null;

        // Show completion message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Scene Complete!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('All materials collected', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.textAlign = 'left';
    }

    // Update scene UI
    updateSceneUI() {
        const foundCount = document.getElementById('objects-found-count');
        const totalCount = document.getElementById('objects-total-count');

        if (foundCount) foundCount.textContent = this.objectsFound;
        if (totalCount) totalCount.textContent = this.totalObjects;
    }

    // Get available scenes for player
    getAvailableScenes() {
        return this.scenes.filter(scene =>
            this.gameState.state.progress.unlockedScenes.includes(scene.id)
        );
    }
}
