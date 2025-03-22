import { Devvit } from '@devvit/public-api';
import type { ShapeData, GuessData, CanvasConfig } from '../message.js';

type GameBoardProps = {
  gameData: ShapeData;
  canvasConfig: CanvasConfig;
  userGuess?: GuessData;
  showTarget?: boolean;
};

/**
 * GameBoard component for visualizing the game and guesses
 */
export function GameBoard({ gameData, canvasConfig, userGuess, showTarget = false }: GameBoardProps) {
  return (
    <vstack backgroundColor="white" padding="medium" cornerRadius="medium" width="95%">
      <hstack alignment="start middle" gap="small">
        <text weight="bold" color="#1a1a2e">Game Board Visualization</text>
        <text size="small" color="#78909c">• {showTarget ? "Target Location" : "Your Guess"}</text>
      </hstack>
      <spacer size="xsmall" />
      
      {/* Simple visual representation of guess vs target */}
      <hstack width="100%" height="260px" backgroundColor="#f8fafc" cornerRadius="small">
        <zstack width="100%" height="100%" alignment="middle center">
          {/* Coordinate axes for reference */}
          <hstack width="90%" height="1px" backgroundColor="#e0e0e0" alignment="middle center" />
          <vstack width="1px" height="90%" backgroundColor="#e0e0e0" alignment="middle center" />
          
          {/* Target position marker (only visible if showTarget is true) */}
          {showTarget && (
            <hstack width="100%" height="100%">
              <spacer 
                width={`${Math.max(0, Math.min(100, (gameData.x / canvasConfig.width) * 100))}%`} 
                height={`${Math.max(0, Math.min(100, (gameData.y / canvasConfig.height) * 100))}%`}
              />
              <vstack width="24px" height="24px" backgroundColor="#2e7d32" cornerRadius="full" />
              <spacer grow />
            </hstack>
          )}
          
          {/* User guess position marker (if user has guessed) */}
          {userGuess && (
            <hstack width="100%" height="100%">
              <spacer 
                width={`${Math.max(0, Math.min(100, (userGuess.x / canvasConfig.width) * 100))}%`} 
                height={`${Math.max(0, Math.min(100, (userGuess.y / canvasConfig.height) * 100))}%`}
              />
              <vstack width="24px" height="24px" backgroundColor="#c62828" cornerRadius="full" />
              <spacer grow />
            </hstack>
          )}
        </zstack>
      </hstack>
      
      <spacer size="small" />
      <hstack gap="medium" alignment="middle center">
        {showTarget && (
          <hstack gap="small" alignment="center middle">
            <vstack width="14px" height="14px" backgroundColor="#2e7d32" cornerRadius="full" />
            <text size="xsmall">Target</text>
          </hstack>
        )}
        {userGuess && (
          <hstack gap="small" alignment="center middle">
            <vstack width="14px" height="14px" backgroundColor="#c62828" cornerRadius="full" />
            <text size="xsmall">Your Guess</text>
          </hstack>
        )}
        {userGuess && gameData && (
          <hstack gap="small" alignment="center middle">
            <text size="xsmall" color="#78909c">
              Distance: {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)} pixels
            </text>
          </hstack>
        )}
      </hstack>
    </vstack>
  );
} 