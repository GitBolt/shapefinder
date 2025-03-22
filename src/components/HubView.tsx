import { UIClient, Devvit } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import type { Context } from '@devvit/public-api';

/**
 * HubView component for the game creator hub post
 */
export function HubView({ webView, context }: { webView: any, context: Context }) {
  const [showingStats, setShowingStats] = useState(false);
  const [showingGuide, setShowingGuide] = useState(false);
  
  // Fetch actual stats from Redis
  const [gameStats] = useState<{
    totalGames: number;
    totalGuesses: number;
    successRate: number;
  }>(async () => {
    try {
      // Get all posts created through the hub
      const gamesListJson = await context.redis.get('hiddenshape_games_list');
      const gamesList = gamesListJson ? JSON.parse(gamesListJson) : [];
      const totalGames = gamesList.length;
      
      // Calculate total guesses by summing across all games
      let totalGuesses = 0;
      let totalCorrectGuesses = 0;
      
      for (const gameId of gamesList) {
        // Get guess count for this game
        const guessCountStr = await context.redis.get(`hiddenshape_guesscount_${gameId}`);
        const gameGuessCount = Number(guessCountStr || 0);
        totalGuesses += gameGuessCount;
        
        // Get correct guesses for this game
        const guessesJson = await context.redis.get(`hiddenshape_allguesses_${gameId}`);
        if (guessesJson) {
          const guesses = JSON.parse(guessesJson);
          const correctGuesses = guesses.filter((g: any) => g.isCorrect).length;
          totalCorrectGuesses += correctGuesses;
        }
      }
      
      // Calculate success rate
      const successRate = totalGuesses > 0 
        ? Math.round((totalCorrectGuesses / totalGuesses) * 100) 
        : 0;
      
      return {
        totalGames: totalGames || 0,
        totalGuesses: totalGuesses || 0,
        successRate: successRate || 0
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
    <vstack grow alignment="middle center">
      {/* Logo and Title */}
      <image 
        url="https://i.imgur.com/wqtUCyq.png"
        imageWidth={320}
        imageHeight={110}
      />
      
      <text size="xxlarge" weight="bold" color="#1a1a2e">
        Where's the Shape?
      </text>
      
      <text size="large" color="#455a64" alignment="middle center">
        A fun game of finding hidden shapes among many others
      </text>
      
      <spacer size="large" />
      
      {/* Action Buttons */}
      <hstack gap="medium">
        <button 
          appearance="primary"
          onPress={() => webView.mount()}
        >
          Create Game
        </button>
        <button 
          appearance="secondary"
          onPress={() => setShowingStats(true)}
        >
          Game Stats
        </button>
        <button 
          appearance="secondary"
          onPress={() => setShowingGuide(true)}
        >
          Guide
        </button>
      </hstack>
      
      <spacer size="large" />
      
      {/* Description Box */}
      <vstack 
        backgroundColor="rgba(59, 130, 246, 0.05)"
        padding="medium"
        cornerRadius="medium"
        width="80%"
      >
        <text 
          size="small" 
          color="#64748b"
          alignment="middle center"
        >
          Create a new game by hiding a shape among many others!
        </text>
      </vstack>
    </vstack>
  );

  const renderStatsView = () => (
    <vstack grow alignment="middle center">
      {/* Stats View */}
      <vstack 
        backgroundColor="white" 
        padding="large" 
        cornerRadius="large" 
        width="90%"
        gap="medium"
      >
        <hstack alignment="center middle" width="100%">
          <text size="large" weight="bold" color="#1a365d">Game Statistics</text>
          <spacer grow />
          <button 
            appearance="secondary" 
            size="small" 
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
              <text size="xlarge" weight="bold" color="#0077cc">
                {gameStats.totalGames}
              </text>
              <text size="small" color="#0099ff">Total Games Created</text>
            </vstack>

            <vstack
              backgroundColor="#e6fff0"
              padding="medium"
              cornerRadius="medium"
              grow
            >
              <text size="xlarge" weight="bold" color="#00875a">
                {gameStats.totalGuesses}
              </text>
              <text size="small" color="#00b371">Total Guesses Made</text>
            </vstack>
          </hstack>

          <vstack 
            backgroundColor="#fff2e6"
            padding="medium"
            cornerRadius="medium"
          >
            <text size="medium" weight="bold" color="#cc5500" alignment="middle center">
              Average Success Rate
            </text>
            <text size="xxlarge" weight="bold" color="#ff8c42" alignment="middle center">
              {gameStats.successRate}%
            </text>
          </vstack>

          <vstack 
            backgroundColor="#e6f0ff"
            padding="small"
            cornerRadius="medium"
          >
            <text size="xsmall" color="#3366cc" alignment="middle center">
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
        padding="large" 
        cornerRadius="large" 
        width="90%"
        gap="medium"
      >
        <hstack alignment="center middle" width="100%">
          <text size="large" weight="bold" color="#1a365d">How to Play</text>
          <spacer grow />
          <button 
            appearance="secondary" 
            size="small" 
            onPress={() => setShowingGuide(false)}
          >
            Back
          </button>
        </hstack>

        <vstack gap="medium" padding="small">
          <vstack 
            backgroundColor="#e6f7ff"
            padding="medium"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#0077cc">1.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#0077cc">Create a Game</text>
                <text 
                  size="small" 
                  color="#334155"
                  alignment="start"
                >
                  Click "Create Game" to design your own challenge by placing a hidden shape on the canvas.
                </text>
              </vstack>
            </hstack>
          </vstack>
          
          <vstack 
            backgroundColor="#e6fff0"
            padding="medium"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#00875a">2.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#00875a">Share with Friends</text>
                <text 
                  size="small" 
                  color="#334155"
                  alignment="start"
                >
                  When your game is created, share the link with friends so they can try to find your hidden shape.
                </text>
              </vstack>
            </hstack>
          </vstack>
          
          <vstack 
            backgroundColor="#fff2e6"
            padding="medium"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#cc5500">3.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#cc5500">Find the Shape</text>
                <text 
                  size="small" 
                  color="#334155"
                  alignment="start"
                >
                  When playing, click anywhere on the canvas where you think the shape is hidden. You get one guess per game!
                </text>
              </vstack>
            </hstack>
          </vstack>
          
          <vstack 
            backgroundColor="#e6f0ff"
            padding="medium"
            cornerRadius="medium"
          >
            <hstack gap="small" alignment="start top" width="100%">
              <text size="medium" weight="bold" color="#3366cc">4.</text>
              <vstack alignment="start" width="90%">
                <text weight="bold" color="#3366cc">See Results</text>
                <text 
                  size="small" 
                  color="#334155"
                  alignment="start"
                >
                  After guessing, you'll see how close you were and whether you found the shape! The game will show you the distance from your guess to the actual location.
                </text>
              </vstack>
            </hstack>
          </vstack>
          
          <vstack 
            backgroundColor="rgba(59, 130, 246, 0.05)"
            padding="small"
            cornerRadius="medium"
          >
            <text 
              size="small" 
              color="#64748b" 
              alignment="middle center"
            >
              Have fun creating and playing Where's the Shape!
            </text>
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