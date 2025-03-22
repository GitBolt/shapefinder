import { Devvit } from '@devvit/public-api';
import type { ShapeData, GuessData, CanvasConfig } from '../message.js';

type ActiveGameViewProps = {
  gameData: ShapeData;
  canvasConfig: CanvasConfig;
  guessCount: number;
  successRate: number;
  userGuess?: GuessData | null;
  userGuessResult?: { isCorrect?: boolean };
  webView: any;
};

/**
 * View for active (ongoing) games
 */
export function ActiveGameView({
  gameData,
  canvasConfig,
  guessCount,
  successRate,
  userGuess,
  userGuessResult,
  webView
}: ActiveGameViewProps) {

  if (userGuess) {
    return (
      <vstack
        grow
        padding="large"
        cornerRadius="large"
        backgroundColor="#f0f4f8"
      >
        <vstack grow alignment="middle center" gap="medium">
          <text size="xxlarge" weight="bold" color="#1a365d">
            Where's the{" "}
            <text color={gameData.color}>
              {typeof(gameData.shapeType) == "string" ? gameData.shapeType : "Shape"}
            </text>?
          </text>

          <hstack gap="medium" alignment="center middle" width="100%">
            <vstack
              backgroundColor="#e6f7ff"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#0077cc">
                {guessCount}
              </text>
              <text size="small" color="#0099ff">Guesses</text>
            </vstack>

            <vstack
              backgroundColor="#e6fff0"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#00875a">
                {successRate}%
              </text>
              <text size="small" color="#00b371">Success Rate</text>
            </vstack>

            {userGuess && (
              <vstack
                backgroundColor={userGuessResult?.isCorrect ? "#e6fff0" : "#fff2e6"}
                padding="medium"
                cornerRadius="medium"
                grow
              >
                <text weight="bold" color={userGuessResult?.isCorrect ? "#00875a" : "#cc5500"}>
                  {userGuessResult?.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
                </text>
                <text size="small" color={userGuessResult?.isCorrect ? "#00b371" : "#ff8c42"}>
                  {userGuess.secondsTaken !== undefined ? `Your Guess (Took ${userGuess.secondsTaken}s)` : "Your Guess"}
                </text>
              </vstack>
            )}

            <vstack
              backgroundColor="#e6f0ff"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#3366cc">
                {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)}px
              </text>
              <text size="small" color="#5588ee">Distance from Shape</text>
            </vstack>
          </hstack>

          {/* Game Board */}
          <vstack
            backgroundColor="#ffffff"
            padding="small"
            cornerRadius="medium"
            width="80%"
          >
            <hstack alignment="start middle" gap="small">
              <text weight="bold" color="#1a365d">Game Board</text>
              <text size="small" color="#4a5568">• Visual Representation</text>
            </hstack>

            {/* Visual representation of guess vs target */}
            <vstack
              width="100%"
              height="280px"
              backgroundColor="#f5f8fa"
              cornerRadius="medium"
              padding="medium"
            >
              <zstack width="100%" height="100%" alignment="middle center">
                {/* Coordinate grid lines - simplified */}
                <hstack width="90%" height="1px" backgroundColor="#e2e8f0" alignment="middle center" />
                <vstack width="1px" height="90%" backgroundColor="#e2e8f0" alignment="middle center" />

                {/* Target position marker */}
                <hstack width="100%" height="100%">
                  <spacer
                    width={`${Math.max(0, Math.min(100, (gameData.x / canvasConfig.width) * 100))}%`}
                    height={`${Math.max(0, Math.min(100, (gameData.y / canvasConfig.height) * 100))}%`}
                  />
                  <vstack
                    width="24px"
                    height="24px"
                    backgroundColor="#4299e1"
                    cornerRadius="full"
                  />
                  <spacer grow />
                </hstack>

                {/* User guess position marker */}
                <hstack width="100%" height="100%">
                  <spacer
                    width={`${Math.max(0, Math.min(100, (userGuess.x / canvasConfig.width) * 100))}%`}
                    height={`${Math.max(0, Math.min(100, (userGuess.y / canvasConfig.height) * 100))}%`}
                  />
                  <vstack
                    width="24px"
                    height="24px"
                    backgroundColor={userGuessResult?.isCorrect ? "#38b2ac" : "#f56565"}
                    cornerRadius="full"
                  />
                  <spacer grow />
                </hstack>
              </zstack>
            </vstack>

            <hstack gap="medium" alignment="center middle" padding="medium">
              <hstack gap="small" alignment="center middle">
                <vstack
                  width="14px"
                  height="14px"
                  backgroundColor={userGuessResult?.isCorrect ? "#38b2ac" : "#f56565"}
                  cornerRadius="full"
                />
                <text size="xsmall" color="#2d3748">Your Guess</text>
              </hstack>

              <hstack gap="small" alignment="center middle">
                <vstack
                  width="14px"
                  height="14px"
                  backgroundColor="#4299e1"
                  cornerRadius="full"
                />
                <text size="xsmall" color="#2d3748">Target {gameData.shapeType}</text>
              </hstack>
            </hstack>
          </vstack>
        </vstack>
      </vstack>
    );
  }

  // If user hasn't guessed yet, show play prompt
  return (
    <vstack
      grow
      padding="large"
      cornerRadius="large"
      backgroundColor="#f0f4f8"
    >
      <vstack grow alignment="middle center" gap="medium">
        <text size="xxlarge" weight="bold" color="#1a365d">
          Where's the{" "}
          <text color={gameData.color}>
            {gameData.shapeType}
          </text>?
        </text>
        <text size="medium" color="#4a5568" alignment="middle center">
          Find the hidden shape among the others!
        </text>

        {/* Game Stats */}
        <hstack gap="medium" alignment="center middle" width="100%">
          <vstack
            backgroundColor="#e6f7ff"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#0077cc">
              {guessCount}
            </text>
            <text size="small" color="#0099ff">Guesses</text>
          </vstack>

          <vstack
            backgroundColor="#e6fff0"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#00875a">
              {successRate}%
            </text>
            <text size="small" color="#00b371">Success Rate</text>
          </vstack>
        </hstack>

        {/* Play button */}
        <vstack
          padding="large"
          backgroundColor="#ffffff"
          cornerRadius="medium"
          width="100%"
          gap="medium"
        >
          <text size="medium" weight="bold" color="#1a365d" alignment="middle center">
            Ready to play?
          </text>
          <text size="small" color="#4a5568" alignment="middle center">
            Click the button below to find the hidden shape among many others.
          </text>
          <button
            appearance="primary"
            onPress={() => webView.mount()}
            icon="play"
            size="large"
          >
            Play Game
          </button>
        </vstack>
      </vstack>
    </vstack>
  );
} 