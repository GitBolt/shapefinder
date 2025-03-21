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
  }
  
  handleCanvasClick(e) {
    const rect = this.game.interactionLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.game.gameMode === 'creator' || this.game.gameMode === 'hub') {
      this.renderer.drawHiddenShape(
        x, y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape
      );
      this.game.userClick = { x, y };
      
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
  
  selectShape(shape) {
    this.game.selectedShape = shape;
    
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === shape);
    });
    
    if (this.game.userClick) {
      this.renderer.drawHiddenShape(
        this.game.userClick.x, 
        this.game.userClick.y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape
      );
    }
  }
  
  selectColor(color) {
    this.game.selectedColor = color;
    
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === color);
    });
    
    if (this.game.userClick) {
      this.renderer.drawHiddenShape(
        this.game.userClick.x, 
        this.game.userClick.y, 
        this.game.gameMode, 
        this.game.selectedShape, 
        this.game.selectedColor, 
        this.game.hiddenShape
      );
    }
  }
  
  createNewGame() {
    if (!this.game.userClick) {
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    const shapeData = {
      shapeType: this.game.selectedShape,
      color: this.game.selectedColor,
      x: this.game.userClick.x,
      y: this.game.userClick.y,
      postId: this.game.postId
    };
    
    this.game.sendWebViewMessage({
      type: 'createGamePost',
      data: shapeData
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
      postId: this.game.postId
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