export class EventHandlers {
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    this.timerInterval = null;
    this.timeRemaining = 5; // 5 seconds countdown
    this.startTime = null; // Add startTime to track when the timer starts
    this.repeatedShapesRemoved = false; // Track if repeated shapes have been removed
  }
  
  setupEventListeners() {
    this.game.interactionLayer.addEventListener('click', this.handleCanvasClick.bind(this));
    
    this.game.submitHiddenShapeBtn.addEventListener('click', this.submitHiddenShape.bind(this));
    
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
    
    // Buttons for removing repeated shapes
    const removeRepeatedShapesBtn = document.getElementById('remove-repeated-shapes');
    if (removeRepeatedShapesBtn) {
      removeRepeatedShapesBtn.addEventListener('click', this.removeRepeatedShapes.bind(this));
    }
    
    const removeRepeatedShapesCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
    if (removeRepeatedShapesCreatorBtn) {
      removeRepeatedShapesCreatorBtn.addEventListener('click', this.removeRepeatedShapes.bind(this));
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
      
      // Auto-submit the guess when clicked
      this.submitGuess();
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
    
    // Restart animation for the background shapes
    this.renderer.animateParticles();
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
      
      // Check if background shapes exist and shape has changed from initial setting
      if (this.game.canvasConfig) {
        // If shape changed after having been set and background exists, show remove button
        if (this.game.initialShape && shape !== this.game.initialShape) {
          // Reset the repeated shapes flag if shape changed after removal
          if (this.repeatedShapesRemoved) {
            this.repeatedShapesRemoved = false;
          }
          
          // Show the remove repeated shapes button
          const removeRepeatedBtn = document.getElementById('remove-repeated-shapes');
          const removeRepeatedCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
          
          if (this.game.gameMode === 'hub' && removeRepeatedBtn) {
            removeRepeatedBtn.style.display = 'block';
          } else if (this.game.gameMode === 'creator' && removeRepeatedCreatorBtn) {
            removeRepeatedCreatorBtn.style.display = 'block';
          }
        }
      }
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
      
      // Check if background shapes exist and color has changed from initial setting
      if (this.game.canvasConfig) {
        // If color changed after having been set and background exists, show remove button
        if (this.game.initialColor && color !== this.game.initialColor) {
          // Reset the repeated shapes flag if color changed after removal
          if (this.repeatedShapesRemoved) {
            this.repeatedShapesRemoved = false;
          }
          
          // Show the remove repeated shapes button
          const removeRepeatedBtn = document.getElementById('remove-repeated-shapes');
          const removeRepeatedCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
          
          if (this.game.gameMode === 'hub' && removeRepeatedBtn) {
            removeRepeatedBtn.style.display = 'block';
          } else if (this.game.gameMode === 'creator' && removeRepeatedCreatorBtn) {
            removeRepeatedCreatorBtn.style.display = 'block';
          }
        }
      }
    }
  }
  
  regenerateShapes() {
    // Cannot regenerate shapes if no shape is placed
    if (!this.game.userClick) {
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    // Play the popup sound for shape generation
    this.game.audioManager.playPopup();
    
    // Use the central method to generate background shapes
    this.generateBackgroundShapes();
    
    // Remove any active attention classes once the background is generated
    const regenerateButtons = document.querySelectorAll('.needs-attention');
    regenerateButtons.forEach(btn => {
      btn.classList.remove('active-attention');
    });
    
    // Reset the repeated shapes removed flag since we just generated new ones
    this.repeatedShapesRemoved = false;
    
    // Save the current shape and color to detect changes later
    this.game.initialShape = this.game.selectedShape;
    this.game.initialColor = this.game.selectedColor;
    
    // Initially hide the remove repeated shapes buttons after creating background
    const removeRepeatedBtn = document.getElementById('remove-repeated-shapes');
    const removeRepeatedCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
    
    if (removeRepeatedBtn) {
      removeRepeatedBtn.style.display = 'none';
      removeRepeatedBtn.disabled = false;
    }
    
    if (removeRepeatedCreatorBtn) {
      removeRepeatedCreatorBtn.style.display = 'none';
      removeRepeatedCreatorBtn.disabled = false;
    }
  }
  
  removeRepeatedShapes() {
    // Check if there's a canvas config and background shapes
    if (!this.game.canvasConfig || !this.game.canvasConfig.backgroundShapes || this.game.canvasConfig.backgroundShapes.length === 0) {
      this.game.showNotification('Please create background shapes first!');
      return;
    }
    
    // Filter out any shapes matching the current selection
    const currentShape = this.game.selectedShape;
    const currentColor = this.game.selectedColor;
    
    // Filter the background shapes to remove those matching current selection
    const originalCount = this.game.canvasConfig.backgroundShapes.length;
    this.game.canvasConfig.backgroundShapes = this.game.canvasConfig.backgroundShapes.filter(shape => {
      // Keep the shape if it's not the same type OR not the same color
      return !(shape.shapeType === currentShape && shape.color === currentColor);
    });
    
    // Update the canvas config and redraw
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
    
    // Restart animation after removing shapes
    this.renderer.animateParticles();
    
    // Set repeatedShapesRemoved to true for current shape/color
    this.repeatedShapesRemoved = true;
    
    // Update initialShape and initialColor to current values
    this.game.initialShape = this.game.selectedShape;
    this.game.initialColor = this.game.selectedColor;
    
    // Hide the remove buttons after use
    const removeRepeatedBtn = document.getElementById('remove-repeated-shapes');
    const removeRepeatedCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
    
    if (removeRepeatedBtn) {
      removeRepeatedBtn.style.display = 'none';
      removeRepeatedBtn.disabled = false; // Don't disable the button, just hide it
    }
    
    if (removeRepeatedCreatorBtn) {
      removeRepeatedCreatorBtn.style.display = 'none';
      removeRepeatedCreatorBtn.disabled = false; // Don't disable the button, just hide it
    }
    
    // Show notification about how many shapes were removed
    const removedCount = originalCount - this.game.canvasConfig.backgroundShapes.length;
    this.game.showNotification(`Removed ${removedCount} ${currentShape} ${currentColor} shapes!`);
  }
  
  createNewGame() {
    // We need a position to create a game
    const canvas = this.game.shapeCloudCanvas;
    
    if (!this.game.userClick) {
      // If no shape placed yet, have the user place a shape first
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    if (!this.game.canvasConfig) {
      // If no background shapes yet, notify the user instead of auto-generating
      this.game.showNotification('Please create background shapes first!');
      
      // Highlight the regenerate shapes button with animation
      const regenerateBtn = document.getElementById('regenerate-shapes');
      if (regenerateBtn) {
        regenerateBtn.classList.add('active-attention');
        // Remove the animation after a few seconds
        setTimeout(() => {
          regenerateBtn.classList.remove('active-attention');
        }, 3000);
      }
      return;
    }
    
    // Check if shape or color has changed since background creation, requiring removal of repeated shapes
    const shapeChanged = this.game.initialShape && this.game.selectedShape !== this.game.initialShape;
    const colorChanged = this.game.initialColor && this.game.selectedColor !== this.game.initialColor;
    
    if ((shapeChanged || colorChanged) && !this.repeatedShapesRemoved) {
      // If shape/color changed but repeated shapes not removed, block game creation
      this.game.showNotification('Please remove repeated shapes before creating the game!');
      
      // Highlight the remove repeated shapes button
      const removeRepeatedBtn = document.getElementById('remove-repeated-shapes');
      if (removeRepeatedBtn) {
        removeRepeatedBtn.style.display = 'block';
        removeRepeatedBtn.classList.add('active-attention');
        // Remove the animation after a few seconds
        setTimeout(() => {
          removeRepeatedBtn.classList.remove('active-attention');
        }, 3000);
      }
      return;
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
    // We need a position to create a game
    const canvas = this.game.shapeCloudCanvas;
    
    if (!this.game.userClick) {
      // If no shape placed yet, have the user place a shape first
      this.game.showNotification('Please place a shape first!');
      return;
    }
    
    if (!this.game.canvasConfig) {
      // If no background shapes yet, notify the user instead of auto-generating
      this.game.showNotification('Please create background shapes first!');
      
      // Highlight the regenerate shapes button with animation
      const regenerateBtn = document.getElementById('regenerate-shapes-creator');
      if (regenerateBtn) {
        regenerateBtn.classList.add('active-attention');
        // Remove the animation after a few seconds
        setTimeout(() => {
          regenerateBtn.classList.remove('active-attention');
        }, 3000);
      }
      return;
    }
    
    // Check if shape or color has changed since background creation, requiring removal of repeated shapes
    const shapeChanged = this.game.initialShape && this.game.selectedShape !== this.game.initialShape;
    const colorChanged = this.game.initialColor && this.game.selectedColor !== this.game.initialColor;
    
    if ((shapeChanged || colorChanged) && !this.repeatedShapesRemoved) {
      // If shape/color changed but repeated shapes not removed, block game creation
      this.game.showNotification('Please remove repeated shapes before creating the game!');
      
      // Highlight the remove repeated shapes button
      const removeRepeatedCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
      if (removeRepeatedCreatorBtn) {
        removeRepeatedCreatorBtn.style.display = 'block';
        removeRepeatedCreatorBtn.classList.add('active-attention');
        // Remove the animation after a few seconds
        setTimeout(() => {
          removeRepeatedCreatorBtn.classList.remove('active-attention');
        }, 3000);
      }
      return;
    }
    
    // Create shape data for submission
    const shapeData = {
      shapeType: this.game.selectedShape,
      color: this.game.selectedColor,
      x: this.game.userClick.x,
      y: this.game.userClick.y,
      postId: this.game.postId,
      opacity: 0.85,
      size: this.game.shapeSize
    };
    
    this.game.sendWebViewMessage({
      type: 'saveHiddenShape',
      data: shapeData
    });
    
    this.game.submitHiddenShapeBtn.disabled = true;
    this.game.submitHiddenShapeBtn.textContent = 'Saving...';
  }
  
  startTimer() {
    // Clear any existing timers
    this.clearTimer();
    
    // Reset the time remaining to 5 seconds
    this.timeRemaining = 5;
    
    // Play countdown sound
    this.game.audioManager.playCountdown();
    
    // Get the timer elements
    const timerProgress = document.getElementById('timer-progress');
    const timerText = document.getElementById('timer-text');
    const timerBar = document.getElementById('timer-bar');
    
    // Temporarily disable interaction with the canvas
    const interactionLayer = this.game.interactionLayer;
    interactionLayer.style.pointerEvents = 'none';
    
    // Make sure renderer knows we're in guesser mode
    this.renderer.gameMode = 'guesser';
    
    // Pause renderer animation
    this.renderer.pauseAnimation();
    
    // Hide canvas completely before showing countdown
    // First get canvas container
    const canvasContainer = document.getElementById('game-canvas-container');
    // Only create a canvas cover if one doesn't already exist
    if (canvasContainer && !document.getElementById('canvas-cover')) {
      // Add an opaque temporary cover over the game area
      const canvasCover = document.createElement('div');
      canvasCover.id = 'canvas-cover';
      canvasCover.style.position = 'absolute';
      canvasCover.style.top = '0';
      canvasCover.style.left = '0';
      canvasCover.style.width = '100%';
      canvasCover.style.height = '100%';
      canvasCover.style.backgroundColor = 'var(--canvas-bg)';
      canvasCover.style.zIndex = '10';
      canvasCover.style.borderRadius = 'var(--border-radius)';
      canvasContainer.style.position = 'relative';
      canvasContainer.appendChild(canvasCover);
    }
    
    // Create countdown overlay
    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'countdown-overlay';
    countdownOverlay.innerHTML = `
      <div class="countdown-container">
        <div class="countdown-number">3</div>
        <div class="countdown-shapes">
          <div class="countdown-shape shape-circle"></div>
          <div class="countdown-shape shape-square"></div>
          <div class="countdown-shape shape-triangle"></div>
          <div class="countdown-shape shape-star"></div>
        </div>
      </div>
    `;
    document.body.appendChild(countdownOverlay);
    
    // Start the countdown animation
    let count = 3;
    const countdownElement = countdownOverlay.querySelector('.countdown-number');
    
    const countdownInterval = setInterval(() => {
      count--;
      
      if (count > 0) {
        // Update the number with animation
        countdownElement.style.animation = 'none';
        countdownElement.offsetHeight; // Trigger reflow
        countdownElement.textContent = count;
        countdownElement.style.animation = 'countdownPulse 1s';
      } else if (count === 0) {
        // Show GO!
        countdownElement.textContent = 'GO!';
        countdownElement.style.color = '#4CAF50';
        countdownElement.style.animation = 'countdownGo 0.5s';
      } else {
        // Remove countdown and start the game timer
        clearInterval(countdownInterval);
        countdownOverlay.classList.add('fade-out');
        
        setTimeout(() => {
          countdownOverlay.remove();
          
          // Remove the canvas cover to show the game
          const canvasCover = document.getElementById('canvas-cover');
          if (canvasCover) {
            canvasCover.remove();
          }
          
          // Re-enable interaction with the canvas
          interactionLayer.style.pointerEvents = 'auto';
          
          // Resume renderer animation
          this.renderer.resumeAnimation();
          
          // Force redraw the canvas with the target shape visible
          if (this.game.canvasConfig && this.game.canvasConfig.targetShape) {
            this.renderer.renderShapeSeekerCanvas();
          }
          
          // Record the start time
          this.startTime = Date.now();
          
          // Initial timer display setup
          if (timerProgress) timerProgress.style.width = '100%';
          if (timerText) timerText.textContent = this.timeRemaining;
          
          // Start the actual game timer
          this.timerInterval = setInterval(() => {
            this.timeRemaining -= 1;
            
            // Update timer display
            if (timerText) timerText.textContent = this.timeRemaining;
            if (timerProgress) {
              const progressWidth = (this.timeRemaining / 5) * 100;
              timerProgress.style.width = `${progressWidth}%`;
              
              // Change color when time is running out
              if (this.timeRemaining <= 2) {
                timerProgress.style.backgroundColor = '#f44336';
                if (timerText) timerText.classList.add('timer-low');
              }
            }
            
            // Time's up
            if (this.timeRemaining <= 0) {
              this.clearTimer();
              
              // If no guess was made, make a random guess
              if (!this.game.userGuess) {
                // Create a random guess
                const x = Math.random() * this.game.shapeCloudCanvas.width;
                const y = Math.random() * this.game.shapeCloudCanvas.height;
                
                this.renderer.drawGuess(x, y);
                this.game.userGuess = { x, y };
              }
              
              // Automatically submit the guess
              this.submitGuess();
            }
          }, 1000);
        }, 500);
      }
    }, 1000);
  }
  
  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Remove any countdown overlay that might be present
    const existingOverlay = document.querySelector('.countdown-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Remove any canvas cover
    const canvasCover = document.getElementById('canvas-cover');
    if (canvasCover) {
      canvasCover.remove();
    }
    
    // Ensure renderer animation is resumed
    this.renderer.resumeAnimation();
  }
  
  submitGuess() {
    if (!this.game.userGuess) {
      this.game.showNotification('Please make a guess first!', 3000, 'error');
      return;
    }
    
    // Clear the timer when a guess is submitted
    this.clearTimer();
    
    // Calculate seconds taken to guess
    let secondsTaken = 0; // Default to 0 for instant guesses
    if (this.startTime) {
      // Calculate elapsed time in seconds (5 - remaining time)
      secondsTaken = Math.min(5, Math.round(5 - this.timeRemaining));
      console.log('Time taken to guess:', secondsTaken, 'seconds');
    }
    
    // Check if the guess is correct (approximate hit within tolerance)
    if (this.game.hiddenShape) {
      const dx = this.game.userGuess.x - this.game.hiddenShape.x;
      const dy = this.game.userGuess.y - this.game.hiddenShape.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Set a tolerance for "correct" guesses (e.g., within 25px of the hidden shape center)
      const isCorrect = distance <= 25;
      
      // Play correct sound effect if guess is correct, otherwise play incorrect sound
      if (isCorrect) {
        this.game.audioManager.playWin();
        this.showConfetti();
      } else {
        this.game.audioManager.playLose();
      }
    }
    
    this.game.sendWebViewMessage({
      type: 'recordGuess',
      data: {
        ...this.game.userGuess,
        secondsTaken: secondsTaken
      }
    });
  }
  
  showConfetti() {
    // Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    // Generate 50 confetti pieces
    const colors = ['#ff6b6b', '#4dabf7', '#69db7c', '#ffd43b', '#b197fc'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random position, color, rotation speed, and fall duration
      const left = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;
      const animationDuration = (Math.random() * 3) + 2; // 2-5 seconds
      
      // Random shape (square, circle, or rectangle)
      const shapeType = Math.floor(Math.random() * 3);
      
      confetti.style.left = `${left}vw`;
      confetti.style.backgroundColor = color;
      confetti.style.transform = `rotate(${rotation}deg)`;
      confetti.style.animationDuration = `${animationDuration}s`;
      
      if (shapeType === 1) {
        confetti.style.borderRadius = '50%'; // Circle
      } else if (shapeType === 2) {
        confetti.style.width = '5px';
        confetti.style.height = '15px';
      }
      
      confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation completes
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }
} 