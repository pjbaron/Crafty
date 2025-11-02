// Shop Phase - Automated sales simulation
class ShopPhase {
    constructor(canvas, ctx, gameState) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = gameState;

        // Shop simulation
        this.salesTimer = 0;
        this.salesInterval = 2000; // 2 seconds per sale attempt
        this.lastSaleTime = 0;

        // Visual elements
        this.customers = [];
        this.salesAnimations = [];

        // Shop metrics
        this.currentDaySales = 0;
        this.currentDayRevenue = 0;
    }

    // Start shop phase
    start() {
        this.currentDaySales = 0;
        this.currentDayRevenue = 0;
        this.lastSaleTime = Date.now();

        // Generate some customers
        this.generateCustomers();
    }

    // Generate customer sprites
    generateCustomers() {
        this.customers = [];
        const customerCount = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < customerCount; i++) {
            this.customers.push({
                x: 100 + i * 200 + Math.random() * 100,
                y: 400 + Math.random() * 100,
                size: 30,
                color: this.randomColor(),
                browsingTime: Math.random() * 5000,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }

    // Random color for customers
    randomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Update shop simulation
    update(deltaTime) {
        const currentTime = Date.now();

        // Animate customers
        this.customers.forEach(customer => {
            customer.x += (Math.random() - 0.5) * customer.speed;
            customer.y += (Math.random() - 0.5) * customer.speed;

            // Keep customers in bounds
            customer.x = Math.max(50, Math.min(this.canvas.width - 50, customer.x));
            customer.y = Math.max(300, Math.min(this.canvas.height - 50, customer.y));
        });

        // Update sale animations
        this.salesAnimations = this.salesAnimations.filter(anim => {
            anim.y -= 2;
            anim.alpha -= 0.02;
            return anim.alpha > 0;
        });

        // Attempt sales
        if (currentTime - this.lastSaleTime >= this.salesInterval) {
            this.attemptSale();
            this.lastSaleTime = currentTime;
        }
    }

    // Attempt to sell an item
    attemptSale() {
        const stock = this.gameState.state.shop.currentStock;

        if (stock.length === 0) {
            console.log('No items in stock');
            return;
        }

        // Random item from stock
        const itemIndex = Math.floor(Math.random() * stock.length);
        const item = stock[itemIndex];

        // Sale probability based on quality
        const qualityChances = {
            legendary: 0.95,
            epic: 0.85,
            rare: 0.75,
            uncommon: 0.65,
            common: 0.55
        };

        const saleChance = qualityChances[item.quality] || 0.5;

        if (Math.random() < saleChance) {
            // Sale successful!
            const salePrice = item.baseValue;

            // Remove from stock
            stock.splice(itemIndex, 1);

            // Add money
            this.gameState.addMoney(salePrice);

            // Update stats
            this.gameState.state.statistics.totalItemsSold++;
            this.currentDaySales++;
            this.currentDayRevenue += salePrice;

            // Add reputation based on quality
            const reputationGain = {
                legendary: 5,
                epic: 3,
                rare: 2,
                uncommon: 1,
                common: 0.5
            };
            this.gameState.addReputation(reputationGain[item.quality] || 0);

            // Create sale animation
            this.createSaleAnimation(item, salePrice);

            console.log(`Sold ${item.itemId} (${item.quality}) for ${salePrice} gold`);
        }
    }

    // Create sale animation
    createSaleAnimation(item, price) {
        // Random customer location
        const customer = this.customers[Math.floor(Math.random() * this.customers.length)];

        this.salesAnimations.push({
            x: customer.x,
            y: customer.y,
            text: `+${Math.floor(price)}g`,
            alpha: 1.0,
            color: '#FFD700'
        });
    }

    // Render shop
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2c1e1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw shop interior
        this.drawShopInterior();

        // Draw customers
        this.drawCustomers();

        // Draw sales animations
        this.drawSalesAnimations();

        // Draw shop info
        this.drawShopInfo();

        // Draw inventory display
        this.drawInventoryDisplay();
    }

    // Draw shop interior
    drawShopInterior() {
        // Floor
        this.ctx.fillStyle = '#3a2a2a';
        this.ctx.fillRect(0, 500, this.canvas.width, 220);

        // Counter
        this.ctx.fillStyle = '#5a4a4a';
        this.ctx.fillRect(400, 350, 480, 150);
        this.ctx.strokeStyle = '#8a7a7a';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(400, 350, 480, 150);

        // Shelves
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 400;
            this.ctx.fillStyle = '#4a3a3a';
            this.ctx.fillRect(x, 100, 200, 30);
            this.ctx.fillRect(x, 200, 200, 30);
        }

        // Display items on shelves
        const stock = this.gameState.state.shop.currentStock;
        stock.slice(0, 6).forEach((item, index) => {
            const shelfX = 100 + (index % 3) * 400;
            const shelfY = 100 + Math.floor(index / 3) * 100;

            // Item representation
            this.ctx.fillStyle = this.getQualityColor(item.quality);
            this.ctx.beginPath();
            this.ctx.arc(shelfX + 100, shelfY - 30, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow effect
            this.ctx.strokeStyle = this.getQualityColor(item.quality);
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.5;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        });
    }

    // Draw customers
    drawCustomers() {
        this.customers.forEach(customer => {
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(customer.x, customer.y + customer.size, customer.size * 0.6, customer.size * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Body
            this.ctx.fillStyle = customer.color;
            this.ctx.beginPath();
            this.ctx.arc(customer.x, customer.y, customer.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Eyes
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(customer.x - 8, customer.y - 5, 5, 0, Math.PI * 2);
            this.ctx.arc(customer.x + 8, customer.y - 5, 5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(customer.x - 8, customer.y - 5, 2, 0, Math.PI * 2);
            this.ctx.arc(customer.x + 8, customer.y - 5, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // Draw sale animations
    drawSalesAnimations() {
        this.salesAnimations.forEach(anim => {
            this.ctx.globalAlpha = anim.alpha;
            this.ctx.fillStyle = anim.color;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(anim.text, anim.x, anim.y);
        });
        this.ctx.globalAlpha = 1.0;
    }

    // Draw shop info
    drawShopInfo() {
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('Shop Phase - Automatic Sales', 50, 50);

        // Today's stats
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`Today's Sales: ${this.currentDaySales}`, 50, 650);
        this.ctx.fillText(`Today's Revenue: ${Math.floor(this.currentDayRevenue)}g`, 50, 680);

        // Stock level
        const stock = this.gameState.state.shop.currentStock;
        this.ctx.fillStyle = stock.length > 0 ? '#4CAF50' : '#F44336';
        this.ctx.fillText(`Items in Stock: ${stock.length}`, 400, 650);
    }

    // Draw inventory display
    drawInventoryDisplay() {
        const stock = this.gameState.state.shop.currentStock;

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';

        let displayY = 650;
        stock.slice(0, 5).forEach((item, index) => {
            const text = `${item.itemId} (${item.quality}) - ${Math.floor(item.baseValue)}g`;
            this.ctx.fillStyle = this.getQualityColor(item.quality);
            this.ctx.fillText(text, 700, displayY + index * 25);
        });

        if (stock.length > 5) {
            this.ctx.fillStyle = '#888';
            this.ctx.fillText(`... and ${stock.length - 5} more items`, 700, displayY + 125);
        }
    }

    // Get quality color
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

    // Handle click (could be used for upgrades later)
    handleClick(x, y) {
        console.log('Shop clicked', x, y);
        // Future: Shop upgrade interactions
    }
}
