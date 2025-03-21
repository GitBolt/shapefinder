export class EventHandlers {
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
  }
  
  setupEventListeners() {
    this.game.interactionLayer.addEventListener('click', this.handleCanvasClick.bind(this));
    
    this.game.submitHiddenShapeBtn.addEventListener('click', this.submitHiddenShape.bind(this));
    this.game.submitGuessBtn.addEventListener('click', this.submitGuess.bind(this));
    
    if (this.game.createNewGameBtn) {
      this.game.createNewGameBtn.addEventListener('click', this.createNewGame.bind(this));
    }
    
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectShape(btn.dataset.shape));
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectColor(btn.dataset.color));
    });
    
    // Sliders for shape size
    const hubSizeSlider = document.getElementById('hub-shape-size');
    const creatorSizeSlider = document.getElementById('creator-shape-size');
    
    if (hubSizeSlider) {
      hubSizeSlider.addEventListener('input', this.updateShapeSize.bind(this, 'hub-shape-size-value'));
    }
    
    if (creatorSizeSlider) {
      creatorSizeSlider.addEventListener('input', this.updateShapeSize.bind(this, 'creator-shape-size-value'));
    }
    
    // Buttons for generating random shapes
    if (this.game.regenerateShapesBtn) {
      this.game.regenerateShapesBtn.addEventListener('click', this.regenerateShapes.bind(this));
    }
    
    const regenerateCreatorBtn = document.getElementById('regenerate-shapes-creator');
    if (regenerateCreatorBtn) {
      regenerateCreatorBtn.addEventListener('click', this.regenerateShapes.bind(this));
    }
  }
  
  handleCanvasClick(e) {
    const rect = this.game.interactionLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.game.gameMode === 'creator' || this.game.gameMode === 'hub') {
      // Store the user click position
      this.game.userClick = { x, y };
      
      // Draw the user's selected shape
      this.renderer.drawHiddenShape(
        x, y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape,
        false,
        this.game.shapeSize
      );
      
      // Do NOT generate background shapes automatically
      // Only enable the buttons after placing a shape
      if (this.game.gameMode === 'hub') {
        this.game.createNewGameBtn.disabled = false;
      } else {
        this.game.submitHiddenShapeBtn.disabled = false;
      }
    } else if (this.game.gameMode === 'guesser') {
      this.renderer.drawGuess(x, y);
      this.game.userGuess = { x, y };
      this.game.submitGuessBtn.disabled = false;
    }
  }
  
  updateShapeSize(valueElementId, event) {
    // Update the displayed value
    const valueElement = document.getElementById(valueElementId);
    if (valueElement) {
      valueElement.textContent = event.target.value;
    }
    
    // Update the game's shape size
    this.game.shapeSize = parseInt(event.target.value, 10);
    
    // If a shape has been placed, redraw it with the new size
    if (this.game.userClick) {
      this.renderer.drawHiddenShape(
        this.game.userClick.x, 
        this.game.userClick.y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape,
        false,
        this.game.shapeSize
      );
    }
  }
  
  generateBackgroundShapes() {
    // Get the canvas dimensions
    const canvas = this.game.shapeCloudCanvas;
    
    // Create target shape config from user selection
    const targetShape = {
      shapeType: this.game.selectedShape,
      color: this.game.selectedColor,
      x: this.game.userClick.x,
      y: this.game.userClick.y,
      size: this.game.shapeSize
    };
    
    // Generate random shapes avoiding the exact combination of target shape
    this.game.canvasConfig = this.renderer.generateRandomShapesCanvas(
      canvas.width,
      canvas.height,
      targetShape
    );
    
    // Apply the canvas configuration - this will draw background shapes
    this.renderer.setCanvasConfig(this.game.canvasConfig);
    
    // Re-draw the user's shape on top
    this.renderer.drawHiddenShape(
      this.game.userClick.x, 
      this.game.userClick.y, 
      this.game.gameMode, 
      this.game.selectedShape, 
      this.game.selectedColor, 
      this.game.hiddenShape,
      false,
      this.game.shapeSize
    );
  }
  
  selectShape(shape) {
    // Check if the shape type actually changed
    if (this.game.selectedShape === shape) return;
    
    this.game.selectedShape = shape;
    
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === shape);
    });
    
    // In creator mode, update the preview text
    if (this.game.gameMode === 'creator' || this.game.gameMode === 'hub') {
      if (this.game.selectedShapeText) {
        this.game.selectedShapeText.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
      }
    }
    
    // If the user has already placed a shape, redraw it
    if (this.game.userClick) {
      // Update the shape
      this.renderer.drawHiddenShape(
        this.game.userClick.x, 
        this.game.userClick.y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape,
        false,
        this.game.shapeSize
      );
    }
  }
  
  selectColor(color) {
    // Check if the color actually changed
    if (this.game.selectedColor === color) return;
    
    this.game.selectedColor = color;
    
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === color);
    });
    
    // In creator mode, update the preview text
    if (this.game.gameMode === 'creator' || this.game.gameMode === 'hub') {
      if (this.game.selectedColorText) {
        this.game.selectedColorText.textContent = color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    
    // If the user has already placed a shape, redraw it
    if (this.game.userClick) {
      // Update the shape
      this.renderer.drawHiddenShape(
        this.game.userClick.x, 
        this.game.userClick.y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape,
        false,
        this.game.shapeSize
      );
    }
  }
  
  regenerateShapes() {
    // Cannot regenerate shapes if no shape is placed
    if (!this.game.userClick) {
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    // Use the central method to generate background shapes
    this.generateBackgroundShapes();
    
    this.game.showNotification('Generated new random shapes!');
  }
  
  createNewGame() {
    // We need a position to create a game
    // If user hasn't clicked, use center of canvas
    const canvas = this.game.shapeCloudCanvas;
    
    if (!this.game.userClick) {
      // If no shape placed yet, have the user place a shape first
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    if (!this.game.canvasConfig) {
      // If no background shapes yet, generate them
      this.generateBackgroundShapes();
    }
    
    // Create shape data for submission
    const shapeData = {
      shapeType: this.game.selectedShape,
      color: this.game.selectedColor,
      x: this.game.userClick.x,
      y: this.game.userClick.y,
      postId: this.game.postId,
      opacity: 0.85, // Set a decent opacity for the hidden shape
      size: this.game.shapeSize // Include the custom size
    };
    
    // Send the message to create the game post
    this.game.sendWebViewMessage({
      type: 'createGamePost',
      data: shapeData,
      canvasConfig: this.game.canvasConfig
    });
    
    this.game.createNewGameBtn.disabled = true;
    this.game.createNewGameBtn.textContent = 'Creating...';
  }
  
  submitHiddenShape() {
    if (!this.game.userClick) {
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    const shapeData = {
      shapeType: this.game.selectedShape,
      color: this.game.selectedColor,
      x: this.game.userClick.x,
      y: this.game.userClick.y,
      postId: this.game.postId,
      size: this.game.shapeSize // Include the custom size
    };
    
    this.game.sendWebViewMessage({
      type: 'saveHiddenShape',
      data: shapeData
    });
    
    this.game.submitHiddenShapeBtn.disabled = true;
    this.game.submitHiddenShapeBtn.textContent = 'Saving...';
  }
  
  submitGuess() {
    if (!this.game.userGuess) {
      this.game.showNotification('Please make a guess first!');
      return;
    }
    
    this.game.sendWebViewMessage({
      type: 'recordGuess',
      data: this.game.userGuess
    });
    
    this.game.submitGuessBtn.disabled = true;
    this.game.submitGuessBtn.textContent = 'Submitting...';
  }
} 