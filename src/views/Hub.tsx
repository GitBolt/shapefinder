import { UIClient, Devvit } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import type { Context } from '@devvit/public-api';
import { StatsView } from '../components/StatsView.js';
import { GuideView } from '../components/GuideView.js';

/**
 * HubView component for the game creator hub post
 */
export function Hub({ webView, context }: { webView: any, context: Context }) {
  const [showingStats, setShowingStats] = useState(false);
  const [showingGuide, setShowingGuide] = useState(false);

  // Fetch stats from Redis using the global counters
  const [gameStats] = useState<{
    totalGames: number;
    totalGuesses: number;
    successRate: number;
  }>(async () => {
    try {
      const totalGamesStr = await context.redis.get('hiddenshape_total_games');
      const totalGames = totalGamesStr ? parseInt(totalGamesStr) : 0;

      const totalGuessesStr = await context.redis.get('hiddenshape_total_guesses');
      const totalGuesses = totalGuessesStr ? parseInt(totalGuessesStr) : 0;

      const totalCorrectGuessesStr = await context.redis.get('hiddenshape_total_correct_guesses');
      const totalCorrectGuesses = totalCorrectGuessesStr ? parseInt(totalCorrectGuessesStr) : 0;

      const successRate = totalGuesses > 0
        ? Math.round((totalCorrectGuesses / totalGuesses) * 100)
        : 0;

      return {
        totalGames,
        totalGuesses,
        successRate
      };
    } catch (error) {
      console.error('Error fetching game stats:', error);
      return {
        totalGames: 0,
        totalGuesses: 0,
        successRate: 0
      };
    }
  });

  const renderMainView = () => (
    <zstack width="100%" height="100%" alignment='center middle'>
      {/* Background image layer */}
      <image
        imageHeight={1024}
        imageWidth={1500}
        height="100%"
        width="100%"
        url="home_bg.png"
        description="Box line background"
        resizeMode="cover"
      />

      {/* Content layer */}
      <vstack
        grow
        alignment="middle center"
      >
        <image
          imageHeight={60}
          imageWidth={360}
          height="100%"
          width="100%"
          url="title_text.png"
          description="Title text"
          resizeMode="fit"
        />
        <vstack
          width="80%"
          alignment="middle center"
        >

          <spacer size="large" />
          <text size="xxlarge" color="#1a6af7" alignment="center top" weight="bold" wrap width="100%">
            Find a hidden shape amongst other shapes!
          </text>
        </vstack>

        <spacer size="large" />

        {/* Action Buttons */}
        <vstack gap="medium" width="70%">
          <vstack
            backgroundColor="#007AFF"
            width="100%"
            alignment="middle center"
            padding="medium"
            cornerRadius="full"
            onPress={() => webView.mount()}
          >
            <hstack width="100%" alignment="middle center">
              <text color="white" weight="bold" size="large">
                Create Game
              </text>
            </hstack>
          </vstack>

          <vstack
            backgroundColor="white"
            width="100%"
            alignment="middle center"
            padding="medium"
            cornerRadius="full"
            onPress={() => setShowingGuide(true)}
            borderColor="#007AFF"
          >
            <hstack width="100%" alignment="middle center">
              <text color="#007AFF" weight="bold" size="large">
                Guide
              </text>
            </hstack>
          </vstack>

          <vstack
            backgroundColor="white"
            width="100%"
            alignment="middle center"
            padding="medium"
            cornerRadius="full"
            onPress={() => setShowingStats(true)}
            borderColor="#007AFF"

          >
            <hstack width="100%" alignment="middle center">
              <text color="#007AFF" weight="bold" size="large">
                Game Stats
              </text>
            </hstack>
          </vstack>
        </vstack>

      </vstack>
    </zstack>
  );

  return (
    <vstack grow cornerRadius="large" backgroundColor="white">
      {showingStats ? 
        <StatsView gameStats={gameStats} onBack={() => setShowingStats(false)} /> :
        showingGuide ? 
        <GuideView onBack={() => setShowingGuide(false)} /> :
        renderMainView()
      }
    </vstack>
  );
} 