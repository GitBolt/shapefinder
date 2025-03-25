# Shape Seeker

Shape Seeker is a Reddit game where players create and find a hidden shape within a visually complex background made up of other random shapes.

![Shape Seeker Game](assets/title_text.png)

## Table of Contents
- [Quick Start](#quick-start)
- [Game Overview](#game-overview)
- [Features](#features)
- [Detailed Usage](#detailed-usage)
  - [Game Creation](#game-creation)
  - [Playing Games](#playing-games)
  - [Game Results and Statistics](#game-results-and-statistics)
- [Technical Architecture](#technical-architecture)
- [Development Setup](#development-setup)
- [Contributing](#contributing)

## Quick Start

### Game Creators
1. Open the pinned Hub post and click **Create Game**
2. Select a shape, color, and size for your hidden target
3. Place your shape strategically on the canvas
4. Generate background shapes to create visual complexity
5. Click "Create Game" to publish your puzzle to the subreddit

### Players
1. Find the hidden shape described in the post (e.g., "Find the Blue Square")
2. Tap where you think it's located within the 5-second time limit
3. See your results compared to other players' performance

## Game Overview

Shape Seeker operates through a central Hub post where new games are created and shared. Each game is a Reddit post on its own and consists of a single hidden target shape that players must locate within a complex visual background. Games track metrics such as:

- Success rate (average of players who found the shape)
- Time to find the shape
- Distance from the target for incorrect guesses

One player can only attempt a game once

## Detailed Usage

### Game Creation

1. **Creating the Hub Post (Moderator Only)**
    - From the subreddit menu, click on "🎮 Create Shape Seeker Hub"
    - This creates a pinned post that serves as the control center for all Shape Seeker games
    - The Hub post contains a guide, finding a game by id, stats, and the "Create Game" button
    - Only moderators can create the Hub, but any user in the subreddit can create games

2. **Start Game Creation from the Hub**
   - Navigate to the Hub post pinned at the top of the subreddit
   - Click the **Create Game** button to open the game creation interface
   - The creation interface provides a complete set of tools for designing your puzzle
   
3. **Design Your Puzzle**
   - **Shape Selection**: Choose from four different shapes (square, circle, triangle, and star)
   
   - **Color Selection**: Pick from five distinct colors (red, blue, green, yellow, and purple)
   
   - **Size Adjustment**: Use the slider to set your shape's size (range: 30-60 pixels)
   
   - **Background Generation**: Create complex visual noise:
     - Click "Generate Background Shapes" to create a random field of shapes
     - Each generation creates 50-100 random shapes of various colors and sizes.
     - Generate as many times as needed to achieve desired complexity
     - Shapes have a little opacity, allowing overlap that ensures two shapes do not combine to form a whole new solid shape, which may hide the target shape completely, making it impossible to find it.
   
   - **Cleanup and Refinement**:
     - Click "Remove Repeated Shapes" to ensure your target shape is unique
     - This tool scans the canvas and removes any shapes identical to your chosen target
     - This step is necessary to avoid confusion about which shape is the target. When you click "Generate Background Shapes," it automatically creates a background where no shape matches the type and color of the shape you want to hide. However, if you change the type or color of the shape to be hidden after generating the background, there's a chance that the background already contains a shape with the same type and color as the new hidden shape. In that case, you'll need to clean up the background to ensure the target remains distinct

4. **Shape Placement**
   - Click anywhere on the canvas to place your target shape
   - Strategic placement considerations:
     - Near edges: Makes the shape harder to find
     - Near similar colors: Creates natural camouflage
     - Behind other shapes: Partial occlusion increases difficulty
   - You can reposition your shape as many times as needed before publishing

5. **Publish Your Game**
   - Click "Create Game" to publish to the subreddit
   - Your game post will automatically include:
     - A title describing what to find (e.g., "Find the Blue Square")
     - The generated canvas with hidden shape
     - Statistics of number of people who tried to guess and percentage of them who succeeded
     - Play button for users to begin the challenge

### Playing Games

1. **Exploring Games**
   - Browse the subreddit for Shape Seeker game posts
   - Game posts are tagged with [Shape Seeker] and indicate the target shape
   - Alternatively, players can "find" a particular game using it's ID by going to the pinned Hub post and clicking the "Find Game by ID" button

2. **Find the Shape**
   - Game posts clearly indicate what to find (e.g., "Find the Blue Square")
   - Click "Play" to begin the challenge
   - A 5-second timer starts automatically when the game loads
   - The target shape is displayed in the corner as a reference
   - Carefully scan the canvas for the hidden shape
   - Tap/click where you believe the shape is located
   - Remember: There is exactly one instance of the target shape in the puzzle

3. **Game Interface Elements**
   - **Timer**: Prominently displayed countdown showing remaining seconds
   - **Target Display**: Clear visual indicator of which shape/color to find
   - **Stats Display**: Shows current success metrics (players who found it, average time)
   - **Canvas**: The main game area where the puzzle is displayed

4. **Results and Feedback**
   - Immediately after submitting your guess, you'll see your results:
     - **Success/Failure Indicator**: Clear visual feedback on whether you found the shape
     - **Distance Metric**: If you missed, shows how far away your guess was (in pixels)
     - **Time Used**: Displays how many seconds (to 2 decimal places) you took to find the shape
     - **Target Reveal**: Shows the actual location of the hidden shape
     - **Your Guess**: Highlights where you clicked/tapped
   
   - Results are persistent and accessible by:
     - Returning to the game post
     - Refreshing the page after playing
     - Checking your player profile (coming soon!)

### Game Results and Statistics

1. **Individual Game Results**
   - Each game post transforms into a results page after you've played
   - Results show:
     - Whether you found the shape successfully
     - Your reaction time (how quickly you found the shape)
     - Distance from target (if you missed)
     - A simplified game board that shows where you tapped and where target shape location was

2. **Community Statistics**
   - Each game displays aggregated statistics:
     - Success rate: Percentage of players who found the shape
     - Average find time: How long it takes most players to find the shape
     - Heat map: Visual representation of where players clicked (coming soon!)

3. **Player Statistics** (coming soon!)
   - Personal dashboard showing:
     - Games played and success rate
     - Average reaction time
     - Performance trends over time
     - Achievements and badges
     - Comparison with community averages