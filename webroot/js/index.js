import { Renderer } from './renderer.js';
import { GameModes } from './game-modes.js';
import { EventHandlers } from './event-handlers.js';
import { showNotification } from './utils.js';
import { AudioManager } from './audio-manager.js';

class ShapeSeekerGame {
  constructor() {
    // Game state
    this.gameMode = null;
    this.username = '';
    this.postId = '';
    this.guessCount = 0;
    this.selectedShape = 'square';
    this.selectedColor = 'red';
    this.shapeSize = 30; // Default size for shapes
    this.hiddenShape = null;
    this.userGuess = null;
    this.isRevealed = false;
    this.allGuesses = [];
    this.userClick = null;
    this.canvasConfig = null; // For storing the background shapes configuration
    this.repeatedShapesRemoved = false; // Track if repeated shapes have been removed
    this.initialShape = null; // Track initial shape used for background generation
    this.initialColor = null; // Track initial color used for background generation
    
    // Initialize audio manager
    this.audioManager = new AudioManager();
    
    // DOM elements
    this.shapeCloudCanvas = document.getElementById('shape-cloud');
    this.interactionLayer = document.getElementById('interaction-layer'); 
    this.heatmapLayer = document.getElementById('heatmap-layer');
    
    console.log('Canvas elements found:', 
      !!this.shapeCloudCanvas, 
      !!this.interactionLayer, 
      !!this.heatmapLayer
    );
    
    // Check canvas dimensions
    if (this.shapeCloudCanvas) {
      console.log('Shape cloud canvas dimensions:', 
        this.shapeCloudCanvas.width, 
        this.shapeCloudCanvas.height
      );
    }
    
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
    this.notificationElement = document.getElementById('notification');
    this.closestGuessDisplay = document.getElementById('closest-guess');
    this.wildestMissDisplay = document.getElementById('wildest-miss');
    this.regenerateShapesBtn = document.getElementById('regenerate-shapes');
    this.removeRepeatedShapesBtn = document.getElementById('remove-repeated-shapes');
    this.removeRepeatedShapesCreatorBtn = document.getElementById('remove-repeated-shapes-creator');
    this.selectedShapeText = document.getElementById('selected-shape');
    this.selectedColorText = document.getElementById('selected-color');
    this.shapeSizeInput = document.getElementById('shape-size-input');
    this.shapeSizeValue = document.getElementById('shape-size-value');
    
    // Initialize components
    this.renderer = new Renderer({
      shapeCloudCanvas: this.shapeCloudCanvas,
      interactionLayer: this.interactionLayer,
      heatmapLayer: this.heatmapLayer
    });
    
    this.gameModes = new GameModes({
      gameInstructions: this.gameInstructions,
      hubControls: this.hubControls,
      creatorControls: this.creatorControls,
      guesserControls: this.guesserControls,
      resultsControls: this.resultsControls,
      createNewGameBtn: this.createNewGameBtn,
      submitHiddenShapeBtn: this.submitHiddenShapeBtn,
      hiddenShapeName: this.hiddenShapeName,
      guessCountDisplay: this.guessCountDisplay,
      revealedShapeName: this.revealedShapeName,
      totalGuessesDisplay: this.totalGuessesDisplay,
      selectedShapeText: this.selectedShapeText,
      selectedColorText: this.selectedColorText
    }, this);
    
    this.eventHandlers = new EventHandlers(this, this.renderer);
    
    // Draw clean canvas - don't auto-generate shapes
    const ctx = this.shapeCloudCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.shapeCloudCanvas.width, this.shapeCloudCanvas.height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.shapeCloudCanvas.width, this.shapeCloudCanvas.height);
    
    // Set up event listeners
    this.eventHandlers.setupEventListeners();
    
    // Signal ready to Devvit
    setTimeout(() => {
      this.sendWebViewMessage({ type: 'webViewReady' });
    }, 100);
  }
  
  initializeGame(data) {
    this.username = data.username;
    this.postId = data.postId;
    this.isRevealed = data.isRevealed;
    
    // Reset tracking variables for new game initiation
    this.initialShape = null;
    this.initialColor = null;
    this.repeatedShapesRemoved = false;
    
    // Handle Shape Seeker canvas configuration if available
    if (data.canvasConfig) {
      this.canvasConfig = data.canvasConfig;
      
      // Make sure the target shape is properly set in the canvas config
      if (data.gameData) {
        // Ensure the targetShape is set to the actual hidden shape
        this.canvasConfig.targetShape = {
          shapeType: data.gameData.shapeType,
          color: data.gameData.color,
          x: data.gameData.x,
          y: data.gameData.y,
          opacity: data.gameData.opacity || 0.85,
          size: data.gameData.size || 30 // Use provided size or default to 30
        };
      }
      
      this.renderer.setCanvasConfig(this.canvasConfig);
    } else if (!data.isHub) {
      // If we're not in hub mode and don't have canvas config, create one
      // We only auto-generate in guesser/results mode, not in creator or hub
      if (data.gameData) {
        const targetShape = {
          shapeType: data.gameData.shapeType,
          color: data.gameData.color,
          x: data.gameData.x,
          y: data.gameData.y,
          size: data.gameData.size || 30 // Use provided size or default to 30
        };
        
        this.canvasConfig = this.renderer.generateRandomShapesCanvas(
          this.shapeCloudCanvas.width,
          this.shapeCloudCanvas.height,
          targetShape
        );
        
        this.renderer.setCanvasConfig(this.canvasConfig);
      }
    }
    
    // Show the canvas-buttons container regardless of mode
    const canvasButtons = document.querySelector('.canvas-buttons');
    if (canvasButtons) {
      canvasButtons.style.display = 'flex';
    }
    
    if (data.isHub) {
      this.gameMode = 'hub';
      this.renderer.gameMode = 'hub'; // Set renderer's game mode
      this.gameModes.showHubMode();
      
      // Explicitly show hub buttons
      if (this.regenerateShapesBtn) this.regenerateShapesBtn.style.display = 'block';
      if (this.createNewGameBtn) this.createNewGameBtn.style.display = 'block';
      
      // Initially hide the remove repeated shapes button until background is created
      if (this.removeRepeatedShapesBtn) {
        this.removeRepeatedShapesBtn.style.display = 'none';
      }
      
      // For the hub, we should display the random shapes right away
      if (this.selectedShapeText) {
        this.selectedShapeText.textContent = this.selectedShape.charAt(0).toUpperCase() + this.selectedShape.slice(1);
      }
      if (this.selectedColorText) {
        this.selectedColorText.textContent = this.selectedColor.charAt(0).toUpperCase() + this.selectedColor.slice(1);
      }
    } else if (data.gameData) {
      this.hiddenShape = data.gameData;
      this.guessCount = data.guessCount;
      
      if (this.isRevealed) {
        this.gameMode = 'results';
        this.renderer.gameMode = 'results'; // Set renderer's game mode
        this.gameModes.showShapeSeekerResultsMode(this.hiddenShape, this.guessCount);
      } else {
        this.gameMode = 'guesser';
        this.renderer.gameMode = 'guesser'; // Set renderer's game mode
        
        // Immediately set counting down to true to prevent premature rendering
        this.renderer.isCountingDown = true;
        
        this.gameModes.showShapeSeekerGuesserMode(this.hiddenShape, this.guessCount);
        
        // Create canvas cover immediately to hide the canvas before countdown starts
        const canvasContainer = document.getElementById('game-canvas-container');
        if (canvasContainer) {
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
        
        // Start the timer for guessing mode
        setTimeout(() => {
          this.eventHandlers.startTimer();
        }, 100); // Reduced delay to ensure countdown starts quickly
      }
      
      // Ensure the renderer re-renders with the correct target shape
      this.renderer.renderShapeSeekerCanvas();
    } else {
      this.gameMode = 'creator';
      this.renderer.gameMode = 'creator'; // Set renderer's game mode
      this.gameModes.showCreatorMode();
      
      // Explicitly show creator buttons
      const regenerateCreatorBtn = document.getElementById('regenerate-shapes-creator');
      const submitHiddenShapeBtn = document.getElementById('submit-hidden-shape');
      if (regenerateCreatorBtn) regenerateCreatorBtn.style.display = 'block';
      if (submitHiddenShapeBtn) submitHiddenShapeBtn.style.display = 'block';
      
      // Initially hide the remove repeated shapes button until background is created
      if (this.removeRepeatedShapesCreatorBtn) {
        this.removeRepeatedShapesCreatorBtn.style.display = 'none';
      }
      
      // Initialize the selected shape and color text
      if (this.selectedShapeText) {
        this.selectedShapeText.textContent = this.selectedShape.charAt(0).toUpperCase() + this.selectedShape.slice(1);
      }
      if (this.selectedColorText) {
        this.selectedColorText.textContent = this.selectedColor.charAt(0).toUpperCase() + this.selectedColor.slice(1);
      }
    }
    
    // Make sure the canvas is re-rendered with the correct mode
    if (this.canvasConfig) {
      this.renderer.renderShapeSeekerCanvas();
    }
    
    // Force button visibility update
    setTimeout(() => {
      // Manually trigger the syncButtonVisibility function from our inline script
      const event = new Event('custom-mode-change');
      document.dispatchEvent(event);
      console.log('Dispatched custom event to update button visibility');
    }, 200);
    
    // Hide the loading overlay now that the game is initialized
    this.hideLoadingOverlay();
  }
  
  // Function to hide the loading overlay
  hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('fade-out');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 500); // Match this with the duration of the fade-out animation
    }
  }
  
  processDevvitMessage(event) {
    if (event.data && event.data.type === 'devvit-message' && event.data.data && event.data.data.message) {
      const message = event.data.data.message;
      
      switch (message.type) {
        case 'initialData':
          this.initializeGame(message.data);
          break;
        case 'guessResponse':
          if (message.data.success) {
            if (message.data.showResults) {
              // Make sure to clear any running timers
              this.eventHandlers.clearTimer();
              
              this.hiddenShape = message.data.gameData;
              this.allGuesses = message.data.guesses;
              this.gameMode = 'personal-results';
              this.renderer.gameMode = 'personal-results'; // Update the renderer's game mode
              
              // If the server sent back userGuess with secondsTaken, use it
              if (message.data.userGuess) {
                this.userGuess = {
                  ...this.userGuess,
                  ...message.data.userGuess
                };
              } else {
                // Add the isCorrect status to the user's guess
                this.userGuess.isCorrect = message.data.isCorrect;
              }
              
              // Show a notification first
              const resultMessage = message.data.isCorrect ? 
                'Congratulations! You found the hidden shape! 🎉' : 
                'Not quite! Here\'s where the shape was hidden.';
              this.showNotification(resultMessage, 2500);
              
              // Apply smooth transition to results view
              document.querySelector('.game-container').classList.add('results-transition');
              
              // Slight delay to ensure smooth transition before changing the UI
              setTimeout(() => {
                this.gameModes.showPersonalResultsMode(
                  this.hiddenShape, 
                  this.guessCount, 
                  message.data.isCorrect, 
                  this.userGuess
                );
                
                // For personal results, show the user's guess vs target
                this.renderer.drawHiddenShape(
                  this.hiddenShape.x, 
                  this.hiddenShape.y, 
                  this.gameMode, 
                  this.selectedShape, 
                  this.selectedColor, 
                  this.hiddenShape, 
                  true
                );
                this.renderer.drawPersonalResultHeatmap(this.userGuess, this.allGuesses, this.hiddenShape);
                
                // Remove transition class after animation completes
                setTimeout(() => {
                  document.querySelector('.game-container').classList.remove('results-transition');
                }, 500);
              }, 300);
            }
          } else {
            this.showNotification(message.data.message || 'Error recording your guess.');
          }
          break;
        case 'revealResults':
          this.isRevealed = message.data.isRevealed;
          this.allGuesses = message.data.guesses;
          this.gameMode = 'results';
          this.renderer.gameMode = 'results'; // Update the renderer's game mode
          this.gameModes.showShapeSeekerResultsMode(this.hiddenShape, this.guessCount);
          
          // Draw the revealed target
          this.renderer.drawHiddenShape(
            this.hiddenShape.x, 
            this.hiddenShape.y, 
            this.gameMode, 
            this.selectedShape, 
            this.selectedColor, 
            this.hiddenShape, 
            true
          );
          this.renderer.drawHeatmap(this.allGuesses, this.hiddenShape);
          this.gameModes.calculateStats(
            this.allGuesses, 
            this.hiddenShape,
            this.closestGuessDisplay,
            this.wildestMissDisplay
          );
          break;
        case 'gameCreated':
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
   * Shows a notification to the user
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds to show the notification
   * @param {string} type - Notification type: 'default', 'success', 'error', 'info'
   */
  showNotification(message, duration = 3000, type = 'default') {
    if (!this.notificationElement) {
      console.warn('Notification element not found');
      return;
    }
    
    // Use the utility function from utils.js
    showNotification(this.notificationElement, message, duration, type);
  }
  
  /**
   * Sends a message to the Devvit webView
   */
  sendWebViewMessage(message) {
    parent.postMessage(message, '*');
  }
}

// Create the game instance
const game = new ShapeSeekerGame();

// Listen for messages from Devvit
window.addEventListener('message', function(event) {
  game.processDevvitMessage(event);
}); 