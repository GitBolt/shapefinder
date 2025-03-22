import { getColorValue } from './utils.js';

export class GameModes {
  constructor(elements) {
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
    this.gameInstructions.textContent = '';
    
    this.hubControls.style.display = 'flex';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'none';
    
    this.createNewGameBtn.disabled = true;
  }
  
  showCreatorMode() {
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
  
  showWaldoGuesserMode(hiddenShape, guessCount) {
    const shapeName = hiddenShape.shapeType.charAt(0).toUpperCase() + hiddenShape.shapeType.slice(1);
    const colorName = hiddenShape.color.charAt(0).toUpperCase() + hiddenShape.color.slice(1);
    
    this.gameInstructions.textContent = `Find the hidden ${colorName} ${shapeName} among the other shapes! You have 10 seconds to find it.`;
    
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
  
  showWaldoResultsMode(hiddenShape, guessCount) {
    const shapeName = hiddenShape.shapeType.charAt(0).toUpperCase() + hiddenShape.shapeType.slice(1);
    const colorName = hiddenShape.color.charAt(0).toUpperCase() + hiddenShape.color.slice(1);
    
    this.gameInstructions.textContent = `The hidden ${colorName} ${shapeName} has been revealed! See how everyone did at finding it.`;
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    this.revealedShapeName.textContent = `${colorName} ${shapeName}`;
    this.revealedShapeName.style.fontWeight = 'bold';
    this.revealedShapeName.style.color = getColorValue(hiddenShape.color);
    this.totalGuessesDisplay.textContent = `Total guesses: ${guessCount}`;
  }
  
  showPersonalResultsMode(hiddenShape, guessCount, isCorrect = false) {
    const shapeName = hiddenShape.shapeType.charAt(0).toUpperCase() + hiddenShape.shapeType.slice(1);
    const colorName = hiddenShape.color.charAt(0).toUpperCase() + hiddenShape.color.slice(1);
    
    const resultText = isCorrect
      ? `You found the ${colorName} ${shapeName}! Here's how your guess compares to the hidden shape!`
      : `Not quite! Here's where the ${colorName} ${shapeName} was actually hidden.`;
    
    this.gameInstructions.textContent = resultText;
    
    this.hubControls.style.display = 'none';
    this.creatorControls.style.display = 'none';
    this.guesserControls.style.display = 'none';
    this.resultsControls.style.display = 'flex';
    
    this.revealedShapeName.textContent = `${colorName} ${shapeName}`;
    this.revealedShapeName.style.fontWeight = 'bold';
    this.revealedShapeName.style.color = getColorValue(hiddenShape.color);
    this.totalGuessesDisplay.textContent = `Total guesses: ${guessCount}`;
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