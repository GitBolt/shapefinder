import { UIClient, Devvit } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import type { Context } from '@devvit/public-api';
import { StatsView } from '../components/StatsView.js';
import { GuideView } from '../components/GuideView.js';
import { JoinGameForm } from '../components/JoinGameForm.js';

/**
 * HubView component for the game creator hub post
 */
export function Hub({ webView, context }: { webView: any, context: Context }) {
  const [showingStats, setShowingStats] = useState(false);
  const [showingGuide, setShowingGuide] = useState(false);
  const [showingJoinForm, setShowingJoinForm] = useState(false);

  // Fetch stats from Redis using the global counters with caching
  const [gameStats] = useState<{
    totalGames: number;
    totalGuesses: number;
    successRate: number;
  }>(async () => {
    try {
      // Use cache to reduce Redis calls and optimize performance
      return await context.cache(
        async () => {
          // Fetch all stats in parallel
          const [totalGamesStr, totalGuessesStr, totalCorrectGuessesStr] = await Promise.all([
            context.redis.get('hiddenshape_total_games'),
            context.redis.get('hiddenshape_total_guesses'),
            context.redis.get('hiddenshape_total_correct_guesses')
          ]);

          const totalGames = totalGamesStr ? parseInt(totalGamesStr) : 0;
          const totalGuesses = totalGuessesStr ? parseInt(totalGuessesStr) : 0;
          const totalCorrectGuesses = totalCorrectGuessesStr ? parseInt(totalCorrectGuessesStr) : 0;

          const successRate = totalGuesses > 0
            ? Math.round((totalCorrectGuesses / totalGuesses) * 100)
            : 0;

          return {
            totalGames,
            totalGuesses,
            successRate
          };
        },
        {
          // Cache stats for 30 seconds
          key: 'global_game_stats_cache',
          ttl: 30 * 1000 // 30 seconds
        }
      );
    } catch (error) {
      console.error('Error fetching game stats:', error);
      return {
        totalGames: 0,
        totalGuesses: 0,
        successRate: 0
      };
    }
  });

  // Function to handle joining a game by ID
  const handleJoinGame = async (gameId: string) => {
    try {
      // Use the index to look up the game directly by ID
      const postId = await context.redis.get(`hiddenshape_id_index_${gameId}`);
      
      if (postId) {
        // Get the post
        const post = await context.reddit.getPostById(postId);
        if (post) {
          context.ui.showToast({ text: `Found game with ID: ${gameId}!` });
          context.ui.navigateTo(post);
          return;
        }
      }
      
      // If no game was found through the index, try the old way (fallback for backwards compatibility)
      const gamesListJson = await context.redis.get('hiddenshape_games_list');
      const gamesList = gamesListJson ? JSON.parse(gamesListJson) : [];
      
      for (const gamePostId of gamesList) {
        const gameDataJson = await context.redis.get(`hiddenshape_data_${gamePostId}`);
        
        if (gameDataJson) {
          const gameData = JSON.parse(gameDataJson);
          
          // If we found a game with matching ID, navigate to it
          if (gameData.gameId === gameId) {
            // Index the game for future faster lookups
            await context.redis.set(`hiddenshape_id_index_${gameId}`, gamePostId);
            
            // Get the post
            const post = await context.reddit.getPostById(gamePostId);
            if (post) {
              context.ui.showToast({ text: `Found game with ID: ${gameId}!` });
              context.ui.navigateTo(post);
              return;
            }
          }
        }
      }
      
      // If no game was found
      context.ui.showToast({ text: `No game found with ID: ${gameId}` });
    } catch (error) {
      console.error('Error searching for game:', error);
      context.ui.showToast({ text: 'Error searching for game' });
    }
  };

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
            backgroundColor="#4299E1"
            width="100%"
            alignment="middle center"
            padding="medium"
            cornerRadius="full"
            onPress={() => setShowingJoinForm(true)}
          >
            <hstack width="100%" alignment="middle center">
              <text color="white" weight="bold" size="large">
                Join by Game ID
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
      {showingStats ? (
        <StatsView gameStats={gameStats} onBack={() => setShowingStats(false)} />
      ) : showingGuide ? (
        <GuideView onBack={() => setShowingGuide(false)} />
      ) : showingJoinForm ? (
        <JoinGameForm 
          onClose={() => setShowingJoinForm(false)} 
          onJoinGame={handleJoinGame}
          context={context} 
        />
      ) : (
        renderMainView()
      )}
    </vstack>
  );
} 