import { getColorValue } from './utils.js';

export class Renderer {
  constructor(canvases) {
    this.shapeCloudCanvas = canvases.shapeCloudCanvas;
    this.interactionLayer = canvases.interactionLayer;
    this.heatmapLayer = canvases.heatmapLayer;
    
    this.shapeCloudCtx = this.shapeCloudCanvas.getContext('2d');
    this.interactionCtx = this.interactionLayer.getContext('2d');
    this.heatmapCtx = this.heatmapLayer.getContext('2d');
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
    const ctx = this.interactionCtx;
    const size = 30;
    
    ctx.clearRect(0, 0, this.interactionLayer.width, this.interactionLayer.height);
    
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
    });
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
    
    ctx.beginPath();
    ctx.arc(userGuess.x, userGuess.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 69, 0, 0.8)';
    ctx.fill();
    
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Your Guess', userGuess.x, userGuess.y - 15);
    
    allGuesses.forEach(guess => {
      if (Math.abs(guess.x - userGuess.x) < 5 && Math.abs(guess.y - userGuess.y) < 5) {
        return;
      }
      
      ctx.beginPath();
      ctx.arc(guess.x, guess.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
    });
  }
} 