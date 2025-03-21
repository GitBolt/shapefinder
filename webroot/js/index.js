import { Renderer } from './renderer.js';
import { GameModes } from './game-modes.js';
import { EventHandlers } from './event-handlers.js';
import { showNotification } from './utils.js';

class HiddenShapeGame {
  constructor() {
    // Game state
    this.gameMode = null;
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
      submitGuessBtn: this.submitGuessBtn,
      hiddenShapeName: this.hiddenShapeName,
      guessCountDisplay: this.guessCountDisplay,
      revealedShapeName: this.revealedShapeName,
      totalGuessesDisplay: this.totalGuessesDisplay
    });
    
    this.eventHandlers = new EventHandlers(this, this.renderer);
    
    // Draw the shape cloud
    this.renderer.drawShapeCloud();
    
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
    
    if (data.isHub) {
      this.gameMode = 'hub';
      this.gameModes.showHubMode();
    } else if (data.gameData) {
      this.hiddenShape = data.gameData;
      this.guessCount = data.guessCount;
      
      if (this.isRevealed) {
        this.gameMode = 'results';
        this.gameModes.showResultsMode(this.hiddenShape, this.guessCount);
        this.renderer.drawHiddenShape(
          this.hiddenShape.x, 
          this.hiddenShape.y, 
          this.gameMode, 
          this.selectedShape, 
          this.selectedColor, 
          this.hiddenShape, 
          true
        );
      } else {
        this.gameMode = 'guesser';
        this.gameModes.showGuesserMode(this.hiddenShape, this.guessCount);
      }
    } else {
      this.gameMode = 'creator';
      this.gameModes.showCreatorMode();
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
              this.hiddenShape = message.data.gameData;
              this.allGuesses = message.data.guesses;
              this.gameMode = 'personal-results';
              this.gameModes.showPersonalResultsMode(this.hiddenShape, this.guessCount);
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
            } else {
              this.showNotification(message.data.message);
            }
          } else {
            this.showNotification(message.data.message);
            this.submitGuessBtn.disabled = false;
          }
          break;
        case 'revealResults':
          this.isRevealed = message.data.isRevealed;
          this.allGuesses = message.data.guesses;
          this.gameMode = 'results';
          this.gameModes.showResultsMode(this.hiddenShape, this.guessCount);
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
  
  sendWebViewMessage(message) {
    parent.postMessage(message, '*');
  }
  
  showNotification(message) {
    showNotification(this.notificationElement, message);
  }
}

// Create the game instance
const game = new HiddenShapeGame();

// Listen for messages from Devvit
window.addEventListener('message', function(event) {
  game.processDevvitMessage(event);
}); 