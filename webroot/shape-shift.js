/** @typedef {import('../src/message.js').DevvitSystemMessage} DevvitSystemMessage */
/** @typedef {import('../src/message.js').WebViewMessage} WebViewMessage */
/** @typedef {import('../src/message.js').ShapeData} ShapeData */
/** @typedef {import('../src/message.js').GuessData} GuessData */
/** @typedef {import('../src/message.js').HeatmapGuessData} HeatmapGuessData */

class ShapeShiftGame {
  constructor() {
    // Game state
    this.gameMode = null; // 'hub', 'creator', 'guesser', 'results', 'personal-results'
    this.username = '';
    this.postId = '';
    this.guessCount = 0;
    this.selectedShape = 'circle';
    this.selectedColor = 'red';
    this.hiddenShape = null;
    this.userGuess = null;
    this.isRevealed = false;
    this.allGuesses = [];
    this.userClick = null;
    
    // DOM elements
    this.shapeCloudCanvas = document.getElementById('shape-cloud');
    this.interactionLayer = document.getElementById('interaction-layer'); 
    this.heatmapLayer = document.getElementById('heatmap-layer');
    this.gameInstructions = document.getElementById('game-instructions');
    this.hubControls = document.getElementById('hub-controls');
    this.creatorControls = document.getElementById('creator-controls');
    this.guesserControls = document.getElementById('guesser-controls');
    this.resultsControls = document.getElementById('results-controls');
    this.guessCountDisplay = document.getElementById('guess-count');
    this.totalGuessesDisplay = document.getElementById('total-guesses');
    this.hiddenShapeName = document.getElementById('hidden-shape-name');
    this.revealedShapeName = document.getElementById('revealed-shape-name');
    this.submitHiddenShapeBtn = document.getElementById('submit-hidden-shape');
    this.createNewGameBtn = document.getElementById('create-new-game');
    this.submitGuessBtn = document.getElementById('submit-guess');
    this.notificationElement = document.getElementById('notification');
    this.closestGuessDisplay = document.getElementById('closest-guess');
    this.wildestMissDisplay = document.getElementById('wildest-miss');
    
    // Initialize the canvases
    this.shapeCloudCtx = this.shapeCloudCanvas.getContext('2d');
    this.interactionCtx = this.interactionLayer.getContext('2d');
    this.heatmapCtx = this.heatmapLayer.getContext('2d');
    
    // Draw the shape cloud
    this.drawShapeCloud();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Wait a moment for everything to load, then signal ready
    setTimeout(() => {
      this.sendWebViewMessage({ type: 'webViewReady' });
    }, 100);
  }
  
  /**
   * Initialize the game based on data from Devvit
   * @param {object} data - Game data from Devvit
   */
  initializeGame(data) {
    this.username = data.username;
    this.postId = data.postId;
    this.isRevealed = data.isRevealed;
    
    if (data.isHub) {
      // Hub post - used to create new games
      this.gameMode = 'hub';
      this.showHubMode();
    }
    else if (data.gameData) {
      // Game exists - user can guess or view results
      this.hiddenShape = data.gameData;
      this.guessCount = data.guessCount;
      
      if (this.isRevealed) {
        // Game is already revealed - show results
        this.gameMode = 'results';
        this.showResultsMode();
      } else {
        // Game is active - show guesser mode
        this.gameMode = 'guesser';
        this.showGuesserMode();
      }
    } else {
      // Game creator mode (this is now less common as we use hub to create games)
      this.gameMode = 'creator';
      this.showCreatorMode();
    }
  }
  
  /**
   * Set up event listeners for UI interactions
   */
  setupEventListeners() {
    // Canvas click event
    this.interactionLayer.addEventListener('click', this.handleCanvasClick.bind(this));
    
    // Submit buttons
    this.submitHiddenShapeBtn.addEventListener('click', this.submitHiddenShape.bind(this));
    this.submitGuessBtn.addEventListener('click', this.submitGuess.bind(this));
    if (this.createNewGameBtn) {
      this.createNewGameBtn.addEventListener('click', this.createNewGame.bind(this));
    }
    
    // Shape buttons
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectShape(btn.dataset.shape));
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectColor(btn.dataset.color));
    });
  }
  
  /**
   * Show the hub mode for creating new games
   */
  showHubMode() {
    // Set instructions
    this.gameInstructions.textContent = 'Create a new Shape Shift game! Pick a shape and color, then place it on the canvas.';
    
    // Show/hide controls
    this.hubControls.style.display = 'flex';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'none';
    
    // Disable submit button initially
    this.createNewGameBtn.disabled = true;
  }
  
  /**
   * Show the creator mode
   */
  showCreatorMode() {
    // Set instructions
    this.gameInstructions.textContent = 'Hide a shape in the cloud! Pick a shape and color, then place it on the canvas.';
    
    // Show/hide controls
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'flex';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'none';
    
    // Disable submit button initially
    this.submitHiddenShapeBtn.disabled = true;
  }
  
  /**
   * Show the guesser mode
   */
  showGuesserMode() {
    // Set instructions
    this.gameInstructions.textContent = 'Find the hidden shape! Click on the canvas where you think it is hidden.';
    
    // Show/hide controls
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'flex';
    this.resultsControls.style.display = 'none';
    
    // Update shape name
    this.hiddenShapeName.textContent = this.hiddenShape.shapeType;
    
    // Disable submit button initially
    this.submitGuessBtn.disabled = true;
    
    // Update guess count
    this.guessCountDisplay.textContent = `Total guesses: ${this.guessCount}`;
  }
  
  /**
   * Show the results mode
   */
  showResultsMode() {
    // Set instructions
    this.gameInstructions.textContent = 'The hidden shape has been revealed! Check out how everyone did.';
    
    // Show/hide controls
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    // Update revealed shape name and guess count
    this.revealedShapeName.textContent = this.hiddenShape.shapeType;
    this.totalGuessesDisplay.textContent = `Total guesses: ${this.guessCount}`;
    
    // Draw the hidden shape
    this.drawHiddenShape(this.hiddenShape.x, this.hiddenShape.y, true);
  }
  
  /**
   * Show personal results after guessing
   */
  showPersonalResultsMode() {
    // Set the game mode
    this.gameMode = 'personal-results';
    
    // Set instructions
    this.gameInstructions.textContent = 'Here\'s how your guess compares to the hidden shape!';
    
    // Show/hide controls
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    // Update the revealed shape name and guess count
    this.revealedShapeName.textContent = this.hiddenShape.shapeType;
    this.totalGuessesDisplay.textContent = `Total guesses: ${this.guessCount}`;
    
    // Draw the hidden shape and personal result
    this.drawHiddenShape(this.hiddenShape.x, this.hiddenShape.y, true);
    this.drawPersonalResultHeatmap();
  }
  
  /**
   * Process a message received from Devvit
   * @param {DevvitSystemMessage} event - The message event
   */
  processDevvitMessage(event) {
    // Check if this is a message from Devvit and has the expected format
    if (event.data && event.data.type === 'devvit-message' && event.data.data && event.data.data.message) {
      // Extract the message from the event
      const message = event.data.data.message;
      
      switch (message.type) {
        case 'initialData':
          // Initialize the game with the data received
          this.initializeGame(message.data);
          break;
        case 'guessResponse':
          // Handle response to a guess submission
          if (message.data.success) {
            if (message.data.showResults) {
              // Show immediate results
              this.hiddenShape = message.data.gameData;
              this.allGuesses = message.data.guesses;
              this.showPersonalResultsMode();
            } else {
              // Just show a message
              this.showNotification(message.data.message);
            }
          } else {
            // Show error message
            this.showNotification(message.data.message);
            this.submitGuessBtn.disabled = false;
          }
          break;
        case 'revealResults':
          // Show all results when revealed
          this.isRevealed = message.data.isRevealed;
          this.allGuesses = message.data.guesses;
          this.showResultsMode();
          this.drawHeatmap();
          this.calculateStats();
          break;
        case 'gameCreated':
          // Handle new game creation confirmation
          this.showNotification(message.data.message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } else {
      console.warn('Received non-Devvit message or improperly formatted message:', event.data);
    }
  }
  
  /**
   * Send a message to Devvit
   * @param {WebViewMessage} message - The message to send
   */
  sendWebViewMessage(message) {
    // Send message to parent window (Devvit)
    parent.postMessage(message, '*');
  }
  
  /**
   * Draw the shape cloud on the canvas
   */
  drawShapeCloud() {
    const ctx = this.shapeCloudCtx;
    const width = this.shapeCloudCanvas.width;
    const height = this.shapeCloudCanvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill with background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw 15-20 random shapes with semi-transparency
    const shapeTypes = ['circle', 'square', 'triangle', 'star'];
    const colors = ['#ff6b6b', '#51cf66', '#339af0', '#cc5de8', '#ffd43b'];
    
    const shapeCount = Math.floor(Math.random() * 6) + 15; // 15-20 shapes
    
    for (let i = 0; i < shapeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 30 + 20; // 20-50px
      const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8 opacity
      
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      this.drawShape(ctx, shape, x, y, size);
    }
    
    // Reset opacity
    ctx.globalAlpha = 1;
  }
  
  /**
   * Draw a shape on the given context
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} shape - Shape type
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} size - Shape size
   */
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
        // Draw a 5-point star
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
  
  /**
   * Draw the hidden shape on the interaction layer
   * @param {number} x - X coordinate 
   * @param {number} y - Y coordinate
   * @param {boolean} highlight - Whether to highlight the shape
   */
  drawHiddenShape(x, y, highlight = false) {
    const ctx = this.interactionCtx;
    const size = 30; // Fixed size for the hidden shape
    
    // Clear previous shape
    ctx.clearRect(0, 0, this.interactionLayer.width, this.interactionLayer.height);
    
    if (highlight) {
      // Draw highlight circle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.fill();
    }
    
    // Get color from the selected color (creator) or hidden shape (results)
    const color = this.gameMode === 'creator' || this.gameMode === 'hub'
      ? this.getColorValue(this.selectedColor)
      : this.getColorValue(this.hiddenShape.color);
    
    // Draw shape
    ctx.globalAlpha = highlight ? 1 : 0.8;
    ctx.fillStyle = color;
    
    const shapeType = this.gameMode === 'creator' || this.gameMode === 'hub' ? this.selectedShape : this.hiddenShape.shapeType;
    this.drawShape(ctx, shapeType, x, y, size);
    
    // Reset opacity
    ctx.globalAlpha = 1;
  }
  
  /**
   * Draw user's guess on the interaction layer
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate 
   */
  drawGuess(x, y) {
    const ctx = this.interactionCtx;
    
    // Clear previous guess
    ctx.clearRect(0, 0, this.interactionLayer.width, this.interactionLayer.height);
    
    // Draw crosshair
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff4500';
    ctx.stroke();
  }
  
  /**
   * Draw the heatmap of all guesses
   */
  drawHeatmap() {
    if (!this.allGuesses || this.allGuesses.length === 0) return;
    
    const ctx = this.heatmapCtx;
    const width = this.heatmapLayer.width;
    const height = this.heatmapLayer.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create the heatmap
    const heatmap = this.createHeatmapData();
    
    // Draw the heatmap
    const maxIntensity = Math.max(...heatmap.map(p => p.intensity));
    
    heatmap.forEach(point => {
      const intensity = point.intensity / maxIntensity;
      const radius = 20 * intensity + 10;
      
      // Draw gradient circle
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
    
    // Draw dots for each guess
    this.allGuesses.forEach(guess => {
      ctx.beginPath();
      ctx.arc(guess.x, guess.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
    });
  }
  
  /**
   * Create heatmap data by clustering guesses
   * @returns {Array} Heatmap data points
   */
  createHeatmapData() {
    const heatmapPoints = [];
    const gridSize = 20;
    const width = this.heatmapLayer.width;
    const height = this.heatmapLayer.height;
    
    // Initialize grid
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        heatmapPoints.push({
          x: x + gridSize / 2,
          y: y + gridSize / 2,
          intensity: 0
        });
      }
    }
    
    // Calculate intensity based on distance from guesses
    this.allGuesses.forEach(guess => {
      heatmapPoints.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - guess.x, 2) + Math.pow(point.y - guess.y, 2)
        );
        
        // Inverse square law (closer guesses have more impact)
        point.intensity += 1 / (1 + distance * 0.1);
      });
    });
    
    return heatmapPoints;
  }
  
  /**
   * Calculate stats based on all guesses
   */
  calculateStats() {
    if (!this.allGuesses || this.allGuesses.length === 0) {
      this.closestGuessDisplay.textContent = 'No guesses';
      this.wildestMissDisplay.textContent = 'No guesses';
      return;
    }
    
    // Calculate distances from the hidden shape
    const guessesWithDistance = this.allGuesses.map(guess => {
      const distance = Math.sqrt(
        Math.pow(guess.x - this.hiddenShape.x, 2) + 
        Math.pow(guess.y - this.hiddenShape.y, 2)
      );
      return { ...guess, distance };
    });
    
    // Find closest guess
    const closestGuess = guessesWithDistance.reduce(
      (closest, current) => current.distance < closest.distance ? current : closest,
      guessesWithDistance[0]
    );
    
    // Find wildest miss
    const wildestMiss = guessesWithDistance.reduce(
      (wildest, current) => current.distance > wildest.distance ? current : wildest,
      guessesWithDistance[0]
    );
    
    // Display stats
    this.closestGuessDisplay.textContent = `${closestGuess.username} (${Math.round(closestGuess.distance)}px)`;
    this.wildestMissDisplay.textContent = `${wildestMiss.username} (${Math.round(wildestMiss.distance)}px)`;
  }
  
  /**
   * Draw a simplified heatmap focused on this user's guess
   */
  drawPersonalResultHeatmap() {
    if (!this.userGuess) return;
    
    const ctx = this.heatmapCtx;
    
    // Clear the canvas
    ctx.clearRect(0, 0, this.heatmapLayer.width, this.heatmapLayer.height);
    
    // Draw a line connecting the guess to the hidden shape
    ctx.beginPath();
    ctx.moveTo(this.userGuess.x, this.userGuess.y);
    ctx.lineTo(this.hiddenShape.x, this.hiddenShape.y);
    ctx.strokeStyle = 'rgba(255, 69, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw the user's guess
    ctx.beginPath();
    ctx.arc(this.userGuess.x, this.userGuess.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 69, 0, 0.8)';
    ctx.fill();
    
    // Add a label for the guess
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Your Guess', this.userGuess.x, this.userGuess.y - 15);
    
    // If there are other guesses, show them as smaller dots
    this.allGuesses.forEach(guess => {
      // Skip if it's likely the current user's guess
      if (Math.abs(guess.x - this.userGuess.x) < 5 && Math.abs(guess.y - this.userGuess.y) < 5) {
        return;
      }
      
      ctx.beginPath();
      ctx.arc(guess.x, guess.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
    });
  }
  
  /**
   * Handle canvas click
   * @param {MouseEvent} e - Click event
   */
  handleCanvasClick(e) {
    const rect = this.interactionLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.gameMode === 'creator' || this.gameMode === 'hub') {
      // Show the hidden shape at the clicked position
      this.drawHiddenShape(x, y);
      this.userClick = { x, y };
      
      // Enable appropriate button based on mode
      if (this.gameMode === 'hub') {
        this.createNewGameBtn.disabled = false;
      } else {
        this.submitHiddenShapeBtn.disabled = false;
      }
    } else if (this.gameMode === 'guesser') {
      // Show the guess
      this.drawGuess(x, y);
      this.userGuess = { x, y };
      this.submitGuessBtn.disabled = false;
    }
  }
  
  /**
   * Handle shape selection
   * @param {string} shape - Selected shape
   */
  selectShape(shape) {
    this.selectedShape = shape;
    
    // Update active class
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === shape);
    });
    
    // Redraw hidden shape if placed
    if (this.userClick) {
      this.drawHiddenShape(this.userClick.x, this.userClick.y);
    }
  }
  
  /**
   * Handle color selection
   * @param {string} color - Selected color
   */
  selectColor(color) {
    this.selectedColor = color;
    
    // Update active class
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === color);
    });
    
    // Redraw hidden shape if placed
    if (this.userClick) {
      this.drawHiddenShape(this.userClick.x, this.userClick.y);
    }
  }
  
  /**
   * Create a new game from the hub
   */
  createNewGame() {
    if (!this.userClick) {
      this.showNotification('Please place a shape first!');
      return;
    }
    
    const shapeData = {
      shapeType: this.selectedShape,
      color: this.selectedColor,
      x: this.userClick.x,
      y: this.userClick.y,
      postId: this.postId  // This will be replaced on the backend
    };
    
    this.sendWebViewMessage({
      type: 'createGamePost',
      data: shapeData
    });
    
    this.createNewGameBtn.disabled = true;
    this.createNewGameBtn.textContent = 'Creating...';
  }
  
  /**
   * Submit the hidden shape
   */
  submitHiddenShape() {
    if (!this.userClick) {
      this.showNotification('Please place a shape first!');
      return;
    }
    
    const shapeData = {
      shapeType: this.selectedShape,
      color: this.selectedColor,
      x: this.userClick.x,
      y: this.userClick.y,
      postId: this.postId
    };
    
    this.sendWebViewMessage({
      type: 'saveHiddenShape',
      data: shapeData
    });
    
    this.submitHiddenShapeBtn.disabled = true;
    this.submitHiddenShapeBtn.textContent = 'Saving...';
  }
  
  /**
   * Submit user's guess
   */
  submitGuess() {
    if (!this.userGuess) {
      this.showNotification('Please make a guess first!');
      return;
    }
    
    this.sendWebViewMessage({
      type: 'recordGuess',
      data: this.userGuess
    });
    
    this.submitGuessBtn.disabled = true;
    this.submitGuessBtn.textContent = 'Submitting...';
  }
  
  /**
   * Show a notification
   * @param {string} message - Notification message
   */
  showNotification(message) {
    this.notificationElement.textContent = message;
    this.notificationElement.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.notificationElement.style.display = 'none';
    }, 3000);
  }
  
  /**
   * Get color value from color name
   * @param {string} colorName - Color name
   * @returns {string} Color value
   */
  getColorValue(colorName) {
    const colors = {
      red: '#ff6b6b',
      green: '#51cf66',
      blue: '#339af0',
      purple: '#cc5de8',
      yellow: '#ffd43b'
    };
    
    return colors[colorName] || '#ff6b6b';
  }
}

// Create the game instance
const game = new ShapeShiftGame();

// Listen for messages from Devvit
window.addEventListener('message', function(event) {
  game.processDevvitMessage(event);
}); 