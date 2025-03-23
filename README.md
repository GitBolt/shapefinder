# Shape Seeker

Shape Seeker is an interactive Reddit game where players attempt to find a hidden shape among a visually complex background of similar shapes.

## How to Play

### Game Objective
The goal of Shape Seeker is to find and click on a specific hidden shape (square, circle, triangle, or star) of a particular color that is camouflaged within a busy canvas of similar shapes. Your success is measured by how accurately and quickly you can spot the target shape.

### Gameplay Instructions

1. **Finding the Hidden Shape**
   - At the start of the game, you'll be shown which shape and color to find (e.g., "Find the Blue Square")
   - The shape is hidden within a canvas filled with many overlapping shapes of different colors and sizes
   - You have a 5-second timer for each attempt to find the shape
   - Click where you think the hidden shape is located on the canvas

2. **Timing and Accuracy**
   - The game tracks how quickly you find the shape
   - Your accuracy is measured by how close your click is to the center of the hidden shape
   - A successful find occurs when you click directly on the hidden shape

3. **Game Phases**
   - **Search Phase**: You are actively looking for the hidden shape while the timer counts down
   - **Results Phase**: After clicking or when the timer runs out, you'll see if your guess was correct
   - **Reveal Phase**: Eventually, the hidden shape will be revealed along with a heatmap showing where everyone guessed

4. **Game Stats**
   - The game tracks total number of guesses from all players
   - Success rate (percentage of correct guesses) is displayed after the shape is revealed
   - You can see your personal result compared to other players


### Game Modes

1. **Player Mode**
   - This is the standard game mode where you're trying to find the hidden shape

2. **Creator Mode** 
   - Select a shape (square, circle, triangle, or star)
   - Choose a color (red, blue, green, yellow, or purple)
   - Adjust the size of the shape
   - Create a background of random shapes
   - Place the shape on the canvas to hide it
   - Remove repeated shapes to clean up the background if needed

## Code Structure

- **src/** - Core application logic
  - **main.tsx** - Main application entry point and game state management
  - **message.ts** - Type definitions for game messaging
  - **createPost.tsx** - Logic for creating new game posts
  - **views/** - Game view components
  - **components/** - Reusable UI components

- **webroot/** - Web interface
  - **index.html** - Main game UI structure
  - **style.css** - Game styling
  - **js/** - Client-side game logic
    - **index.js** - Main client entry point
    - **game-modes.js** - Logic for different game modes
    - **renderer.js** - Canvas rendering logic
    - **event-handlers.js** - User interaction handlers
    - **utils.js** - Helper functions

- **assets/** - Game assets and resources 