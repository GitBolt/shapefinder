import { Devvit } from '@devvit/public-api';
import type { GuessData } from '../message.js';

type GameStatsProps = {
  guessCount: number;
  successRate: number;
  userGuess?: GuessData & { isCorrect?: boolean; secondsTaken?: number };
};

/**
 * A reusable component for displaying game statistics
 */
export function GameStats({ guessCount, successRate, userGuess }: GameStatsProps) {
  return (
    <hstack gap="medium" alignment="center middle" width="100%">
      <vstack backgroundColor="#e8f6ff" padding="medium" cornerRadius="medium" grow>
        <text size="xlarge" weight="bold" color="#0d47a1">
          {guessCount}
        </text>
        <text size="small" color="#455a64">Guesses So Far</text>
      </vstack>
      
      <vstack backgroundColor="#e8f5e9" padding="medium" cornerRadius="medium" grow>
        <text size="xlarge" weight="bold" color="#2e7d32">
          {successRate}%
        </text>
        <text size="small" color="#455a64">Success Rate</text>
      </vstack>
      
      {userGuess && userGuess.isCorrect !== undefined ? (
        <vstack backgroundColor="#fff8e1" padding="medium" cornerRadius="medium" grow>
          <text weight="bold" color="#ed6c02">Your Guess</text>
          <text size="small" weight="bold" color={userGuess.isCorrect ? "#2e7d32" : "#c62828"}>
            {userGuess.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
            {userGuess.secondsTaken !== undefined ? ` ${userGuess.secondsTaken}s` : ""}
          </text>
        </vstack>
      ) : <spacer />}
    </hstack>
  );
} 