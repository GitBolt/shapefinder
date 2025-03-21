import { getColorValue } from './utils.js';

export class Renderer {
  constructor(canvases) {
    this.shapeCloudCanvas = canvases.shapeCloudCanvas;
    this.interactionLayer = canvases.interactionLayer;
    this.heatmapLayer = canvases.heatmapLayer;
    
    this.shapeCloudCtx = this.shapeCloudCanvas.getContext('2d');
    this.interactionCtx = this.interactionLayer.getContext('2d');
    this.heatmapCtx = this.heatmapLayer.getContext('2d');
    
    // Canvas configuration for Where's Waldo style game
    this.canvasConfig = null;
  }
  
  generateRandomShapesCanvas(width, height, targetShape) {
    // Generate a new canvas configuration for Where's Waldo style game
    console.log('Generating random shapes for canvas', width, height);
    
    const backgroundShapes = [];
    const shapeTypes = ['circle', 'square', 'triangle', 'star'];
    const colors = ['red', 'green', 'blue', 'purple', 'yellow', 'orange', 'teal'];
    
    // Create shapes for layer 1 (background)
    const layer1Count = Math.floor(Math.random() * 20) + 30; // 30-50 shapes
    console.log(`Generating ${layer1Count} layer 1 shapes`);
    
    for (let i = 0; i < layer1Count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 40 + 30; // 30-70px - INCREASED SIZE
      
      // Avoid generating the exact combination of target shape and color
      let shapeType, color;
      do {
        shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
      } while (shapeType === targetShape.shapeType && color === targetShape.color);
      
      const opacity = Math.random() * 0.3 + 0.4; // 0.4-0.7 opacity - INCREASED
      
      backgroundShapes.push({
        shapeType,
        color,
        x,
        y,
        size,
        opacity,
        layer: 1
      });
    }
    
    // Create shapes for layer 2 (mid-layer)
    const layer2Count = Math.floor(Math.random() * 15) + 15; // 15-30 shapes
    console.log(`Generating ${layer2Count} layer 2 shapes`);
    
    for (let i = 0; i < layer2Count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 30 + 25; // 25-55px - INCREASED SIZE
      
      // Avoid generating the exact combination of target shape and color
      let shapeType, color;
      do {
        shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
      } while (shapeType === targetShape.shapeType && color === targetShape.color);
      
      const opacity = Math.random() * 0.3 + 0.5; // 0.5-0.8 opacity - INCREASED
      
      backgroundShapes.push({
        shapeType,
        color,
        x,
        y,
        size,
        opacity,
        layer: 2
      });
    }
    
    // Create shapes for layer 3 (foreground) - fewer shapes with higher opacity
    const layer3Count = Math.floor(Math.random() * 10) + 10; // 10-20 shapes
    console.log(`Generating ${layer3Count} layer 3 shapes`);
    
    for (let i = 0; i < layer3Count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 25 + 20; // 20-45px - INCREASED SIZE
      
      // For these shapes, have some be either the same TYPE or COLOR as the target
      // but never the same combination of both
      let shapeType, color;
      const useTargetType = Math.random() < 0.3; // 30% chance to use target shape type
      const useTargetColor = Math.random() < 0.3 && !useTargetType; // 30% chance to use target color (never both)
      
      if (useTargetType) {
        shapeType = targetShape.shapeType;
        // Ensure we don't use the target color
        const availableColors = colors.filter(c => c !== targetShape.color);
        color = availableColors[Math.floor(Math.random() * availableColors.length)];
      } else if (useTargetColor) {
        color = targetShape.color;
        // Ensure we don't use the target shape
        const availableShapes = shapeTypes.filter(s => s !== targetShape.shapeType);
        shapeType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      } else {
        // Use random shape and color, but never the target combination
        do {
          shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
          color = colors[Math.floor(Math.random() * colors.length)];
        } while (shapeType === targetShape.shapeType && color === targetShape.color);
      }
      
      const opacity = Math.random() * 0.2 + 0.8; // 0.8-1.0 opacity - INCREASED
      
      backgroundShapes.push({
        shapeType,
        color,
        x,
        y,
        size,
        opacity,
        layer: 3
      });
    }
    
    console.log(`Total shapes generated: ${backgroundShapes.length}`);
    
    // Return the canvas configuration
    return {
      width,
      height,
      backgroundShapes,
      targetShape
    };
  }
  
  setCanvasConfig(config) {
    console.log('Setting canvas config', config);
    this.canvasConfig = config;
    this.renderWaldoStyleCanvas();
  }
  
  renderWaldoStyleCanvas() {
    if (!this.canvasConfig) {
      console.warn('No canvas config set');
      return;
    }
    
    console.log('Rendering Waldo style canvas, game mode:', this.gameMode);
    console.log('Canvas config has', this.canvasConfig.backgroundShapes.length, 'shapes');
    
    const ctx = this.shapeCloudCtx;
    const width = this.shapeCloudCanvas.width;
    const height = this.shapeCloudCanvas.height;
    
    console.log('Canvas dimensions:', width, height);
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw background shapes by layer
    const layerOrder = [1, 2, 3]; // Background to foreground
    
    layerOrder.forEach(layer => {
      // Get shapes for this layer
      const shapesForLayer = this.canvasConfig.backgroundShapes.filter(
        shape => shape.layer === layer
      );
      
      console.log(`Rendering ${shapesForLayer.length} shapes for layer ${layer}`);
      
      // Draw each shape in this layer
      shapesForLayer.forEach(shape => {
        ctx.globalAlpha = shape.opacity;
        ctx.fillStyle = getColorValue(shape.color);
        
        this.drawShape(ctx, shape.shapeType, shape.x, shape.y, shape.size);
      });
    });
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Always draw the target shape for guesser mode
    if (this.canvasConfig.targetShape) {
      // In creator or hub mode, don't draw the target shape - user will place it
      // In guesser or results mode, always draw the target shape
      if (this.gameMode === 'guesser' || 
          this.gameMode === 'results' || 
          this.gameMode === 'personal-results') {
        const target = this.canvasConfig.targetShape;
        console.log('Drawing target shape:', target);
        
        ctx.globalAlpha = target.opacity || 0.85;
        ctx.fillStyle = getColorValue(target.color);
        this.drawShape(ctx, target.shapeType, target.x, target.y, 30); // Fixed size for target
      } else {
        console.log('Not drawing target shape. Mode:', this.gameMode);
      }
    }
  }
  
  drawShapeCloud() {
    const ctx = this.shapeCloudCtx;
    const width = this.shapeCloudCanvas.width;
    const height = this.shapeCloudCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    const shapeTypes = ['circle', 'square', 'triangle', 'star'];
    const colors = ['#ff6b6b', '#51cf66', '#339af0', '#cc5de8', '#ffd43b'];
    
    const shapeCount = Math.floor(Math.random() * 6) + 15;
    
    for (let i = 0; i < shapeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 30 + 20;
      const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.5 + 0.3;
      
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      this.drawShape(ctx, shape, x, y, size);
    }
    
    ctx.globalAlpha = 1;
  }
  
  drawShape(ctx, shape, x, y, size) {
    console.log(`Drawing shape: ${shape}, at (${x}, ${y}) with size ${size}`);
    
    ctx.beginPath();
    
    switch (shape) {
      case 'circle':
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.rect(x - size / 2, y - size / 2, size, size);
        break;
      case 'triangle':
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.closePath();
        break;
      case 'star':
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.4;
        
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * i;
          const px = x + radius * Math.sin(angle);
          const py = y - radius * Math.cos(angle);
          
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        break;
    }
    
    ctx.fill();
  }
  
  drawHiddenShape(x, y, gameMode, selectedShape, selectedColor, hiddenShape, highlight = false) {
    this.gameMode = gameMode;
    
    const ctx = this.interactionCtx;
    const size = 30;
    
    // Only clear the interaction layer, not the shape cloud
    ctx.clearRect(0, 0, this.interactionLayer.width, this.interactionLayer.height);
    
    // Make sure we're drawing on the interaction layer
    if (highlight) {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.fill();
    }
    
    const color = gameMode === 'creator' || gameMode === 'hub'
      ? getColorValue(selectedColor)
      : getColorValue(hiddenShape.color);
    
    ctx.globalAlpha = highlight ? 1 : 0.8;
    ctx.fillStyle = color;
    
    const shapeType = gameMode === 'creator' || gameMode === 'hub' ? selectedShape : hiddenShape.shapeType;
    this.drawShape(ctx, shapeType, x, y, size);
    
    ctx.globalAlpha = 1;
    
    // Re-render the Waldo style canvas to ensure background shapes stay visible
    this.renderWaldoStyleCanvas();
  }
  
  drawGuess(x, y) {
    const ctx = this.interactionCtx;
    
    ctx.clearRect(0, 0, this.interactionLayer.width, this.interactionLayer.height);
    
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff4500';
    ctx.stroke();
  }
  
  drawHeatmap(allGuesses, hiddenShape) {
    if (!allGuesses || allGuesses.length === 0) return;
    
    const ctx = this.heatmapCtx;
    const width = this.heatmapLayer.width;
    const height = this.heatmapLayer.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const heatmap = this.createHeatmapData(allGuesses);
    
    const maxIntensity = Math.max(...heatmap.map(p => p.intensity));
    
    heatmap.forEach(point => {
      const intensity = point.intensity / maxIntensity;
      const radius = 20 * intensity + 10;
      
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
    
    allGuesses.forEach(guess => {
      ctx.beginPath();
      ctx.arc(guess.x, guess.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      
      // If the guess is correct, highlight it
      if (guess.isCorrect) {
        ctx.beginPath();
        ctx.arc(guess.x, guess.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Draw a target indicator at the hidden shape location
    ctx.beginPath();
    ctx.arc(hiddenShape.x, hiddenShape.y, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(hiddenShape.x - 15, hiddenShape.y);
    ctx.lineTo(hiddenShape.x + 15, hiddenShape.y);
    ctx.moveTo(hiddenShape.x, hiddenShape.y - 15);
    ctx.lineTo(hiddenShape.x, hiddenShape.y + 15);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.stroke();
  }
  
  createHeatmapData(allGuesses) {
    const heatmapPoints = [];
    const gridSize = 20;
    const width = this.heatmapLayer.width;
    const height = this.heatmapLayer.height;
    
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        heatmapPoints.push({
          x: x + gridSize / 2,
          y: y + gridSize / 2,
          intensity: 0
        });
      }
    }
    
    allGuesses.forEach(guess => {
      heatmapPoints.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - guess.x, 2) + Math.pow(point.y - guess.y, 2)
        );
        
        point.intensity += 1 / (1 + distance * 0.1);
      });
    });
    
    return heatmapPoints;
  }
  
  drawPersonalResultHeatmap(userGuess, allGuesses, hiddenShape) {
    if (!userGuess) return;
    
    const ctx = this.heatmapCtx;
    
    ctx.clearRect(0, 0, this.heatmapLayer.width, this.heatmapLayer.height);
    
    ctx.beginPath();
    ctx.moveTo(userGuess.x, userGuess.y);
    ctx.lineTo(hiddenShape.x, hiddenShape.y);
    ctx.strokeStyle = 'rgba(255, 69, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    const distance = Math.sqrt(
      Math.pow(userGuess.x - hiddenShape.x, 2) + 
      Math.pow(userGuess.y - hiddenShape.y, 2)
    );
    
    // Draw the distance text
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    const midX = (userGuess.x + hiddenShape.x) / 2;
    const midY = (userGuess.y + hiddenShape.y) / 2;
    ctx.fillText(`${Math.round(distance)}px`, midX, midY - 5);
    
    ctx.beginPath();
    ctx.arc(userGuess.x, userGuess.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = userGuess.isCorrect 
      ? 'rgba(0, 255, 0, 0.8)' 
      : 'rgba(255, 69, 0, 0.8)';
    ctx.fill();
    
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Your Guess', userGuess.x, userGuess.y - 15);
    
    // Draw target indicator
    ctx.beginPath();
    ctx.arc(hiddenShape.x, hiddenShape.y, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(hiddenShape.x - 15, hiddenShape.y);
    ctx.lineTo(hiddenShape.x + 15, hiddenShape.y);
    ctx.moveTo(hiddenShape.x, hiddenShape.y - 15);
    ctx.lineTo(hiddenShape.x, hiddenShape.y + 15);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.stroke();
    
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Target', hiddenShape.x, hiddenShape.y - 25);
    
    allGuesses.forEach(guess => {
      if (Math.abs(guess.x - userGuess.x) < 5 && Math.abs(guess.y - userGuess.y) < 5) {
        return;
      }
      
      ctx.beginPath();
      ctx.arc(guess.x, guess.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      
      // If the guess is correct, highlight it
      if (guess.isCorrect) {
        ctx.beginPath();
        ctx.arc(guess.x, guess.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }
} 