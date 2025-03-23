import { getColorValue } from './utils.js';

export class GameModes {
  constructor(elements, game) {
    this.game = game;
    this.gameInstructions = elements.gameInstructions;
    this.hubControls = elements.hubControls;
    this.creatorControls = elements.creatorControls;
    this.guesserControls = elements.guesserControls;
    this.resultsControls = elements.resultsControls;
    this.createNewGameBtn = elements.createNewGameBtn;
    this.submitHiddenShapeBtn = elements.submitHiddenShapeBtn;
    this.hiddenShapeName = elements.hiddenShapeName;
    this.guessCountDisplay = elements.guessCountDisplay;
    this.revealedShapeName = elements.revealedShapeName;
    this.totalGuessesDisplay = elements.totalGuessesDisplay;
    this.selectedShapeText = elements.selectedShapeText;
    this.selectedColorText = elements.selectedColorText;
  }
  
  showHubMode() {
    // Reset the main headline to default state
    const mainHeadline = document.querySelector('.game-container h1');
    if (mainHeadline) {
      mainHeadline.textContent = 'Click anywhere on the canvas to place shape';
    }
    
    this.gameInstructions.textContent = '';
    
    this.hubControls.style.display = 'flex';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'none';
    
    this.createNewGameBtn.disabled = true;
  }
  
  showCreatorMode() {
    // Reset the main headline to default state
    const mainHeadline = document.querySelector('.game-container h1');
    if (mainHeadline) {
      mainHeadline.textContent = 'Click anywhere on the canvas to place shape';
    }
    
    this.gameInstructions.textContent = '';
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'flex';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'none';
    
    this.submitHiddenShapeBtn.disabled = true;
  }
  
  showGuesserMode(hiddenShape, guessCount) {
    this.gameInstructions.textContent = '';
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'flex';
    this.resultsControls.style.display = 'none';
    
    this.hiddenShapeName.textContent = hiddenShape.shapeType;
    this.guessCountDisplay.textContent = `Total guesses: ${guessCount}`;
  }
  
  showShapeSeekerGuesserMode(hiddenShape, guessCount) {
    const shapeName = hiddenShape.shapeType.charAt(0).toUpperCase() + hiddenShape.shapeType.slice(1);
    const colorName = hiddenShape.color.charAt(0).toUpperCase() + hiddenShape.color.slice(1);
    
    // Update the main h1 headline in the document to show the shape to find
    const mainHeadline = document.querySelector('.game-container h1');
    if (mainHeadline) {
      mainHeadline.innerHTML = `Find the <span style="color: ${getColorValue(hiddenShape.color)}; font-weight: bold;">${colorName} ${shapeName}</span>`;
    }
        
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'flex';
    this.resultsControls.style.display = 'none';
    
    this.hiddenShapeName.textContent = `${colorName} ${shapeName}`;
    this.hiddenShapeName.style.fontWeight = 'bold';
    this.hiddenShapeName.style.color = getColorValue(hiddenShape.color);
    this.guessCountDisplay.textContent = `Total guesses: ${guessCount}`;
  }
  
  showResultsMode(hiddenShape, guessCount) {
    this.gameInstructions.textContent = 'The hidden shape has been revealed! Check out how everyone did.';
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    this.revealedShapeName.textContent = hiddenShape.shapeType;
    this.totalGuessesDisplay.textContent = `Total guesses: ${guessCount}`;
  }
  
  showShapeSeekerResultsMode(hiddenShape, guessCount) {
    const shapeName = hiddenShape.shapeType.charAt(0).toUpperCase() + hiddenShape.shapeType.slice(1);
    const colorName = hiddenShape.color.charAt(0).toUpperCase() + hiddenShape.color.slice(1);
    
    // Update the main headline to show the revealed shape
    const mainHeadline = document.querySelector('.game-container h1');
    if (mainHeadline) {
      mainHeadline.innerHTML = `The <span style="color: ${getColorValue(hiddenShape.color)}; font-weight: bold;">${colorName} ${shapeName}</span> is revealed`;
    }
    
    this.gameInstructions.innerHTML = `<span class="result-reveal">Revealed!</span> The hidden <span style="color: ${getColorValue(hiddenShape.color)}; font-weight: bold;">${colorName} ${shapeName}</span> is now visible! See how everyone did.`;
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    // Add animation class to the results controls
    this.resultsControls.classList.add('results-reveal');
    
    // Set a timeout to remove the class after animation completes
    setTimeout(() => {
      this.resultsControls.classList.remove('results-reveal');
    }, 1000);
    
    this.revealedShapeName.textContent = `${colorName} ${shapeName}`;
    this.revealedShapeName.style.fontWeight = 'bold';
    this.revealedShapeName.style.color = getColorValue(hiddenShape.color);
    
    // Enhanced display for total guesses
    this.totalGuessesDisplay.innerHTML = `
      <div class="guess-result">
        <span class="guess-icon">👥</span>
        <div class="guess-data">
          <span class="guess-label">Total Guesses</span>
          <span class="guess-value">${guessCount}</span>
        </div>
      </div>
    `;
    
    // Show the stats container for overall game results
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
      statsContainer.style.display = 'block';
    }
  }
  
  showPersonalResultsMode(hiddenShape, guessCount, isCorrect = false, userGuess = null) {
    const shapeName = hiddenShape.shapeType.charAt(0).toUpperCase() + hiddenShape.shapeType.slice(1);
    const colorName = hiddenShape.color.charAt(0).toUpperCase() + hiddenShape.color.slice(1);
    
    // Update the main headline with personalized result
    const mainHeadline = document.querySelector('.game-container h1');
    if (mainHeadline) {
      if (isCorrect) {
        mainHeadline.innerHTML = `You found the <span style="color: ${getColorValue(hiddenShape.color)}; font-weight: bold;">${colorName} ${shapeName}</span>!`;
      } else {
        mainHeadline.innerHTML = `The <span style="color: ${getColorValue(hiddenShape.color)}; font-weight: bold;">${colorName} ${shapeName}</span> was here!`;
      }
    }
    
    // Create more engaging result message
    let resultText;
    if (isCorrect) {
      resultText = `<span class="result-success">Great job!</span>!`;
    } else {
      resultText = `<span class="result-miss">Not quite!</span>`;
    }
    
    this.gameInstructions.innerHTML = resultText;
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    // Add a class to the results controls for animations
    this.resultsControls.classList.add('results-reveal');
    
    // Set a timeout to remove the class after animation completes
    setTimeout(() => {
      this.resultsControls.classList.remove('results-reveal');
    }, 1000);
    
    // Enhanced styling for the revealed shape name
    this.revealedShapeName.textContent = `${colorName} ${shapeName}`;
    this.revealedShapeName.style.fontWeight = 'bold';
    this.revealedShapeName.style.color = getColorValue(hiddenShape.color);
    
    // Enhanced time display with icon and animated value
    const secondsTaken = userGuess?.secondsTaken !== undefined ? userGuess.secondsTaken : 0;
    const speedEmoji = secondsTaken <= 3 ? '🚀' : secondsTaken <= 6 ? '⚡' : '⏱️';
    const timeColor = isCorrect ? 
      (secondsTaken <= 3 ? '#2e7d32' : '#1e88e5') : 
      '#e53935';
    
    this.totalGuessesDisplay.innerHTML = `
      <div class="time-result">
        <span class="time-icon">${speedEmoji}</span>
        <div class="time-data">
          <span class="time-label">Time to find:</span>
          <span class="time-value" style="color: ${timeColor};">${secondsTaken} seconds</span>
        </div>
      </div>
    `;
    
    // Hide the stats container (success rate) in personal results mode
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
      statsContainer.style.display = 'none';
    }
  }
  
  calculateStats(allGuesses, hiddenShape, closestGuessDisplay, wildestMissDisplay) {
    if (!allGuesses || allGuesses.length === 0) {
      return;
    }
    
    // Calculate success rate only
    const guessesWithDistance = allGuesses.map(guess => {
      const distance = Math.sqrt(
        Math.pow(guess.x - hiddenShape.x, 2) + 
        Math.pow(guess.y - hiddenShape.y, 2)
      );
      return { ...guess, distance };
    });
    
    const correctGuesses = guessesWithDistance.filter(guess => guess.isCorrect).length;
    const correctPercentage = allGuesses.length > 0 
      ? Math.round((correctGuesses / allGuesses.length) * 100) 
      : 0;
    
    // Update only the success rate
    const correctPercentageEl = document.getElementById('correct-percentage');
    
    if (correctPercentageEl) {
      correctPercentageEl.textContent = `${correctPercentage}%`;
    }
  }
} 