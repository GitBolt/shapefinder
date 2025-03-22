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
        backgroundColor="#f8fafc"
      >
        <vstack grow alignment="middle center" gap="medium">
          <text size="xxlarge" weight="bold" color="#0f172a">
            Where's the{" "}
            <text color={gameData.color}>
              {gameData.shapeType}
            </text>?
          </text>

          <hstack gap="medium" alignment="center middle" width="100%">
            <vstack
              backgroundColor="#eff6ff"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#1e40af">
                {guessCount}
              </text>
              <text size="small" color="#3b82f6">Guesses</text>
            </vstack>

            <vstack
              backgroundColor="#f0fdf4"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#15803d">
                {successRate}%
              </text>
              <text size="small" color="#22c55e">Success Rate</text>
            </vstack>

            {userGuess && (
              <vstack
                backgroundColor={userGuessResult?.isCorrect ? "#f0fdf4" : "#fff7ed"}
                padding="medium"
                cornerRadius="medium"
                grow
              >
                <text weight="bold" color={userGuessResult?.isCorrect ? "#15803d" : "#c2410c"}>
                  {userGuessResult?.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
                </text>
                <text size="small" color={userGuessResult?.isCorrect ? "#22c55e" : "#f97316"}>
                  {userGuess.secondsTaken !== undefined ? `${userGuess.secondsTaken}s` : "Your Guess"}
                </text>
              </vstack>
            )}

            <vstack
              backgroundColor="#f0fdf4"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#15803d">
                {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)}px
              </text>
              <text size="small" color="#22c55e">Distance from Shape</text>
            </vstack>
          </hstack>

          {/* Game Board */}
          <vstack
            backgroundColor="#ffffff"
            padding="medium"
            cornerRadius="medium"
            width="90%"
          >
            <hstack alignment="start middle" gap="small">
              <text weight="bold" color="#0f172a">Game Board</text>
              <text size="small" color="#64748b">• Visual Representation</text>
            </hstack>

            {/* Visual representation of guess vs target */}
            <vstack
              width="100%"
              height="260px"
              backgroundColor="#f1f5f9"
              cornerRadius="small"
              padding="small"
            >
              <zstack width="100%" height="100%" alignment="middle center">
                {/* Coordinate axes for reference */}
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
                    backgroundColor="#3b82f6"
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
                    backgroundColor={userGuessResult?.isCorrect ? "#22c55e" : "#ef4444"}
                    cornerRadius="full"
                  />
                  <spacer grow />
                </hstack>
              </zstack>
            </vstack>

            <hstack gap="medium" alignment="center middle" padding="small">
              <hstack gap="small" alignment="center middle">
                <vstack
                  width="14px"
                  height="14px"
                  backgroundColor={userGuessResult?.isCorrect ? "#22c55e" : "#ef4444"}
                  cornerRadius="full"
                />
                <text size="xsmall" color="#334155">Your Guess</text>
              </hstack>

              <hstack gap="small" alignment="center middle">
                <vstack
                  width="14px"
                  height="14px"
                  backgroundColor="#3b82f6"
                  cornerRadius="full"
                />
                <text size="xsmall" color="#334155">Target {gameData.shapeType}</text>
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
      backgroundColor="#f8fafc"
    >
      <vstack grow alignment="middle center" gap="medium">
        <text size="xxlarge" weight="bold" color="#0f172a">
          Where's the{" "}
          <text color={gameData.color}>
            {gameData.shapeType}
          </text>?
        </text>
        <text size="medium" color="#475569" alignment="middle center">
          Find the hidden shape among the others!
        </text>

        {/* Game Stats */}
        <hstack gap="medium" alignment="center middle" width="100%">
          <vstack
            backgroundColor="#eff6ff"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#1e40af">
              {guessCount}
            </text>
            <text size="small" color="#3b82f6">Guesses</text>
          </vstack>

          <vstack
            backgroundColor="#f0fdf4"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#15803d">
              {successRate}%
            </text>
            <text size="small" color="#22c55e">Success Rate</text>
          </vstack>
        </hstack>

        {/* Play button */}
        <vstack
          padding="medium"
          backgroundColor="#f1f5f9"
          cornerRadius="medium"
          width="100%"
          gap="medium"
        >
          <text size="medium" weight="bold" color="#0f172a" alignment="middle center">
            Ready to play?
          </text>
          <text size="small" color="#475569" alignment="middle center">
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