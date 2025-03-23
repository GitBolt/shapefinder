import { Context, Devvit } from '@devvit/public-api';

interface GameStats {
  totalGames: number;
  totalGuesses: number;
  successRate: number;
}

interface StatsViewProps {
  gameStats: GameStats;
  onBack: () => void;
}

export function StatsView({ gameStats, onBack }: StatsViewProps) {
  return (
    <vstack grow alignment="middle center" padding='medium'>
      <vstack
        backgroundColor="#4985ff"
        padding="medium"
        cornerRadius="large"
        width="100%"
        gap="small"
      >
        <hstack alignment="center middle" width="100%">
          <text size="xxlarge" weight="bold" color="white">Game Stats</text>
          <spacer grow />
          <button
            appearance="secondary"
            size="large"
            onPress={onBack}
          >
            Back
          </button>
        </hstack>

        <vstack gap="medium" padding="small">
          <hstack gap="medium" alignment="center middle" width="100%">
            <vstack
              backgroundColor="#e6f7ff"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#0077cc" width="100%" wrap>
                {gameStats.totalGames}
              </text>
              <text size="small" color="#0099ff" width="100%" wrap>Total Games Created</text>
            </vstack>

            <vstack
              backgroundColor="#e6fff0"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#00875a" width="100%" wrap>
                {gameStats.totalGuesses}
              </text>
              <text size="small" color="#00b371" width="100%" wrap>Total Guesses Made</text>
            </vstack>
          </hstack>

          <vstack
            backgroundColor="#fff2e6"
            padding="medium"
            cornerRadius="medium"
          >
            <text size="medium" weight="bold" color="#cc5500" alignment="middle center" width="100%" wrap>
              Average Success Rate
            </text>
            <text size="xxlarge" weight="bold" color="#ff8c42" alignment="middle center" width="100%" wrap>
              {gameStats.successRate}%
            </text>
          </vstack>

          <vstack
            backgroundColor="#e6f0ff"
            padding="small"
            cornerRadius="medium"
          >
            <text size="medium" color="#3366cc" alignment="middle center" width="100%" wrap>
              Stats are calculated in real-time across all games
            </text>
          </vstack>
        </vstack>
      </vstack>
    </vstack>
  );
} 