import { Devvit } from '@devvit/public-api';
import type { ShapeData, GuessData, CanvasConfig } from '../message.js';

type GameResultsProps = {
  gameData: ShapeData;
  canvasConfig: CanvasConfig;
  guessCount: number;
  successRate: number;
  userGuess: GuessData;
  userGuessResult: { isCorrect?: boolean };
};

/**
 * Component for displaying game results after a guess
 */
export function Results({
  gameData,
  canvasConfig,
  guessCount,
  successRate,
  userGuess,
  userGuessResult
}: GameResultsProps) {
  // Create SVG representation of the game board
  const svgWidth = 280;
  const svgHeight = 280;

  // Calculate positions in the SVG viewport
  const targetX = Math.round((gameData.x / canvasConfig.width) * svgWidth);
  const targetY = Math.round((gameData.y / canvasConfig.height) * svgHeight);
  const guessX = Math.round((userGuess.x / canvasConfig.width) * svgWidth);
  const guessY = Math.round((userGuess.y / canvasConfig.height) * svgHeight);

  // Generate grid lines for SVG
  let gridLines = '';
  for (let i = 0; i < 10; i++) {
    const pos = (i * svgWidth / 10);
    gridLines += `<line x1="${pos}" y1="0" x2="${pos}" y2="${svgHeight}" stroke="#e2e8f0" stroke-width="0.5" opacity="0.5" />`;
    gridLines += `<line x1="0" y1="${pos}" x2="${svgWidth}" y2="${pos}" stroke="#e2e8f0" stroke-width="0.5" opacity="0.5" />`;
  }

  // Generate SVG string
  const guessColor = userGuessResult?.isCorrect ? "#38b2ac" : "#f56565";
  const targetColor = "#4299e1";

  const svgString = `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f8fa" />
      
      <!-- Grid lines -->
      <line x1="${svgWidth / 2}" y1="0" x2="${svgWidth / 2}" y2="${svgHeight}" stroke="#e2e8f0" stroke-width="1" />
      <line x1="0" y1="${svgHeight / 2}" x2="${svgWidth}" y2="${svgHeight / 2}" stroke="#e2e8f0" stroke-width="1" />
      
      <!-- Fine grid lines -->
      ${gridLines}
      
      <!-- Target position (blue circle) -->
      <circle cx="${targetX}" cy="${targetY}" r="12" fill="${targetColor}" />
      <circle cx="${targetX}" cy="${targetY}" r="5" fill="white" opacity="0.6" />
      
      <!-- User guess position (red/green circle) -->
      <circle cx="${guessX}" cy="${guessY}" r="12" fill="${guessColor}" />
      <circle cx="${guessX}" cy="${guessY}" r="5" fill="white" opacity="0.6" />
      
      <!-- Line connecting target and guess -->
      <line x1="${targetX}" y1="${targetY}" x2="${guessX}" y2="${guessY}" 
          stroke="#718096" stroke-width="1" stroke-dasharray="4,2" />
    </svg>
  `;

  // Convert SVG to data URI
  const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

  return (
    <vstack
      grow
      padding="medium"
      cornerRadius="large"
      backgroundColor="#f0f4f8"
    >
      <vstack grow alignment="middle center" gap="medium">

        <text size="xxlarge" weight="bold" color="#1a365d">
          Where's the {gameData.color.charAt(0).toUpperCase() + gameData.color.slice(1)} {gameData.shapeType.charAt(0).toUpperCase() + gameData.shapeType.slice(1)}?
        </text>

        <hstack gap="medium" alignment="center middle" width="100%">
          <vstack
            backgroundColor="#0084db"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#ffffff">
              {guessCount}
            </text>
            <text size="small" color="#c7e0ff">Guesses</text>
          </vstack>

          <vstack
            backgroundColor="#1ba300"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#ffffff">
              {successRate}%
            </text>
            <text size="small" color="#b8f0d4">Success Rate</text>
          </vstack>
        </hstack>

        {/* Game Board */}
        <vstack
          backgroundColor="#ffffff"
          padding="small"
          cornerRadius="medium"
          width="100%"
        >
          <hstack alignment="start middle" gap="small">
            <text weight="bold" color="#1a365d">Your Guess</text>
            <text size="small" color="#4a5568">• Game Board</text>
          </hstack>

          <hstack width="100%">
            <vstack padding="small" width="50%" alignment="middle start">
              <image
                url={svgDataUri}
                imageWidth={200}
                imageHeight={200}
                description="Game board showing target and guess positions"
              />

              <hstack gap="medium" alignment="center middle" padding="xsmall">
                <hstack gap="small" alignment="center middle">
                  <vstack
                    width="10px"
                    height="10px"
                    backgroundColor={userGuessResult?.isCorrect ? "#38b2ac" : "#f56565"}
                    cornerRadius="full"
                  />
                  <text size="xsmall" color="#2d3748">Your Guess</text>
                </hstack>

                <hstack gap="small" alignment="center middle">
                  <vstack
                    width="10px"
                    height="10px"
                    backgroundColor="#4299e1"
                    cornerRadius="full"
                  />
                  <text size="xsmall" color="#2d3748">Target</text>
                </hstack>
              </hstack>
            </vstack>

            {/* Stats section */}
            <vstack gap="medium" grow padding='small' width="60%">
              <vstack
                backgroundColor={userGuessResult?.isCorrect ? "#e6fff0" : "#fff2e6"}
                padding="small"
                cornerRadius="medium"
                width="100%"
              >
                <text weight="bold" color={userGuessResult?.isCorrect ? "#00875a" : "#cc5500"}>
                  {userGuessResult?.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
                </text>
                <text size="medium" color={userGuessResult?.isCorrect ? "#00b371" : "#ff8c42"}>
                  Your Guess
                </text>
              </vstack>

              <vstack
                backgroundColor="#e6f0ff"
                padding="small"
                cornerRadius="medium"
                width="100%"
              >
                <text size="large" weight="bold" color="#3366cc">
                  {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)}px
                </text>
                <text size="medium" color="#5588ee">Distance</text>
              </vstack>

              <vstack
                backgroundColor="#f0e6ff"
                padding="small"
                cornerRadius="medium"
                width="100%"
              >
                <text size="large" weight="bold" color="#8033cc">
                  {userGuess.secondsTaken !== undefined ? `${userGuess.secondsTaken}s` : "0s"}
                </text>
                <text size="medium" color="#a366ee">Time</text>
              </vstack>
            </vstack>
          </hstack>
        </vstack>
      </vstack>
    </vstack>
  );
} 