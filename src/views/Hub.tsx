import { UIClient, Devvit } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import type { Context } from '@devvit/public-api';

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
          imageHeight={50}
          imageWidth={250}
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
          <text size="xlarge" color="#8A56E8" alignment="center top" weight="bold" wrap width="100%">
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

  const renderStatsView = () => (

    <vstack grow alignment="middle center">


      {/* Stats View */}
      <vstack
        backgroundColor="white"
        padding="large"
        cornerRadius="large"
        width="100%"
        gap="medium"
      >
        <hstack alignment="center middle" width="100%">
          <text size="xxlarge" weight="bold" color="#1a365d">Game Statistics</text>
          <spacer grow />
          <button
            appearance="secondary"
            size="large"
            onPress={() => setShowingStats(false)}
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

  const renderGuideView = () => (
    <vstack grow alignment="middle center">
      {/* Guide View */}
      <vstack
        backgroundColor="white"
        padding="medium"
        cornerRadius="large"
        width="100%"
        gap="medium"
      >
        <hstack alignment="center middle" width="100%">
          <text size="xxlarge" weight="bold" color="#1a365d">How to Play</text>
          <spacer grow />
          <button
            appearance="secondary"
            size="large"
            onPress={() => setShowingGuide(false)}
          >
            Back
          </button>
        </hstack>

        <vstack gap="medium" padding="none">
          <vstack
            backgroundColor="#e6f7ff"
            padding="small"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#0077cc">1.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#0077cc">Create a Game</text>
                <text
                  size="medium"
                  color="#1d7aff"
                  alignment="start"
                  width="100%"
                  wrap
                >
                  Click "Create Game" in the menu to design your own challenge by placing a hidden shape on the canvas.
                </text>
              </vstack>
            </hstack>
          </vstack>

          <vstack
            backgroundColor="#e6fff0"
            padding="small"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#00875a">2.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#00875a">Share with Friends</text>
                <text
                  size="medium"
                  color="#14ac25"
                  alignment="start"
                  width="100%"
                  wrap
                >
                  After your game is created, others can try finding the shape you hid in the canvas.
                </text>
              </vstack>
            </hstack>
          </vstack>

          <vstack
            backgroundColor="#fff2e6"
            padding="small"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#cb940c">3.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#cb940c">Find the Shape</text>
                <text
                  size="medium"
                  color="#c68500"
                  alignment="start"
                  width="100%"
                  wrap
                >
                  When playing, click anywhere on the canvas where you think the shape is hidden. You get one guess per game!
                </text>
              </vstack>
            </hstack>
          </vstack>

          <vstack
            backgroundColor="#ffebfd"
            padding="small"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#a900b9">4.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#a900b9">See Results</text>
                <text
                  size="medium"
                  color="#c100a2"
                  alignment="start"
                  width="100%"
                  wrap
                >
                  After guessing, you'll see how close you were and whether you found the shape!
                </text>
              </vstack>
            </hstack>
          </vstack>

        </vstack>
      </vstack>
    </vstack>
  );

  return (
    <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
      {showingStats ? renderStatsView() :
        showingGuide ? renderGuideView() :
          renderMainView()}
    </vstack>
  );
} 