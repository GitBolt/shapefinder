import { Devvit } from '@devvit/public-api';
import { ShapeData, GuessData, CanvasConfig, HeatmapGuessData } from '../message.js';

type RevealedGamePostProps = {
  webView: any;
  gameData: ShapeData;
  canvasConfig: CanvasConfig;
  guessCount: number;
  successRate: number;
  userGuess: GuessData | null;
};

export const RevealedGamePost = ({
  webView,
  gameData,
  canvasConfig,
  guessCount,
  successRate,
  userGuess
}: RevealedGamePostProps) => {
  return (
    <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
      <vstack grow alignment="middle center">
        <text size="xxlarge" weight="bold" color="#1a1a2e">
          Game Complete!
        </text>
        <text size="medium" color="#455a64" alignment="middle center">
          The shape <text weight="bold" color={gameData.color || "#000000"}>
            {typeof gameData.shapeType === 'string' ? gameData.shapeType : 
            (gameData.shapeType && typeof gameData.shapeType === 'object' ? 
              JSON.stringify(gameData.shapeType) : 'Shape')}
          </text> has been found
        </text>
        
        <spacer size="medium" />
        
        <hstack gap="medium" alignment="center middle" width="100%">
          <vstack backgroundColor="#e8f6ff" padding="medium" cornerRadius="medium" grow>
            <text size="xlarge" weight="bold" color="#0d47a1">
              {guessCount}
            </text>
            <text size="small" color="#455a64">Total Guesses</text>
          </vstack>
          
          <vstack backgroundColor="#e8f5e9" padding="medium" cornerRadius="medium" grow>
            <text size="xlarge" weight="bold" color="#2e7d32">
              {successRate}%
            </text>
            <text size="small" color="#455a64">Success Rate</text>
          </vstack>
          
          {userGuess && (
            <vstack backgroundColor="#fff8e1" padding="medium" cornerRadius="medium" grow>
              <text weight="bold" color="#ed6c02">Your Guess</text>
              <text size="small" weight="bold" color={(userGuess as any).isCorrect ? "#2e7d32" : "#c62828"}>
                {(userGuess as any).isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
                {JSON.stringify(userGuess.secondsTaken)}s
              </text>
            </vstack>
          )}
        </hstack>
        
        <spacer size="medium" />
        
        <vstack backgroundColor="white" padding="medium" cornerRadius="medium" width="95%">
          <hstack alignment="start middle" gap="small">
            <text weight="bold" color="#1a1a2e">Game Results</text>
            <text size="small" color="#78909c">• Target Location</text>
          </hstack>
          <spacer size="xsmall" />
          
          <hstack width="100%" height="260px" backgroundColor="#f8fafc" cornerRadius="small">
            <zstack width="100%" height="100%" alignment="middle center">
              <hstack width="90%" height="1px" backgroundColor="#e0e0e0" alignment="middle center" />
              <vstack width="1px" height="90%" backgroundColor="#e0e0e0" alignment="middle center" />
              
              <hstack width="100%" height="100%">
                <spacer 
                  width={`${Math.max(0, Math.min(100, (gameData.x / canvasConfig.width) * 100))}%`} 
                  height={`${Math.max(0, Math.min(100, (gameData.y / canvasConfig.height) * 100))}%`}
                />
                <vstack width="24px" height="24px" backgroundColor="#2e7d32" cornerRadius="full" />
                <spacer grow />
              </hstack>
              
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
            <hstack gap="small" alignment="center middle">
              <vstack width="14px" height="14px" backgroundColor="#2e7d32" cornerRadius="full" />
              <text size="xsmall">Target</text>
            </hstack>
            {userGuess && (
              <hstack gap="small" alignment="center middle">
                <vstack width="14px" height="14px" backgroundColor="#c62828" cornerRadius="full" />
                <text size="xsmall">Your Guess</text>
              </hstack>
            )}
            {userGuess && (
              <hstack gap="small" alignment="center middle">
                <text size="xsmall" color="#78909c">
                  Distance: {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)} pixels
                </text>
              </hstack>
            )}
          </hstack>
        </vstack>
        
        <spacer size="medium" />
        
        <button 
          appearance="primary"
          onPress={() => webView.mount()}
          icon="search"
        >
          View All Guesses
        </button>
      </vstack>
    </vstack>
  );
}; 