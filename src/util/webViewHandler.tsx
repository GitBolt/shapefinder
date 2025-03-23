import { Context, Devvit } from '@devvit/public-api';
import type { WebViewMessage, DevvitMessage, ShapeData, GuessData, HeatmapGuessData } from '../message.js';
import { LoadingScreen } from '../components/LoadingScreen.js';

/**
 * Handles the WebView message communication
 */
export async function handleWebViewMessage(
  message: WebViewMessage, 
  webView: any,
  context: Context,
  state: {
    username: string;
    gameData: ShapeData | null;
    isHubPost: boolean;
    guessCount: number;
    isRevealed: boolean;
    postId: string;
    allGuesses: HeatmapGuessData[];
    setAllGuesses: (guesses: HeatmapGuessData[]) => void;
  }
) {
  switch (message.type) {
    case 'webViewReady':
      // Use caching for userGuess data to avoid repeated lookups
      const userGuessKey = `hiddenshape_user_${state.postId}_${state.username}`;
      
      // Get canvas configuration and user guess in parallel
      const [cachedUserGuessData, canvasConfigData] = await Promise.all([
        // Cache the user's guess data for 5 minutes
        context.cache(
          async () => {
            const data = await context.redis.get(userGuessKey);
            return data ? JSON.parse(data) : null;
          },
          {
            key: `cache_${userGuessKey}`,
            ttl: 5 * 60 * 1000, // 5 minutes
          }
        ),
        // Cache the canvas config for 30 minutes (it rarely changes)
        context.cache(
          async () => {
            const data = await context.redis.get(`hiddenshape_canvas_${state.postId}`);
            return data ? JSON.parse(data) : undefined;
          },
          {
            key: `cache_canvas_${state.postId}`,
            ttl: 30 * 60 * 1000, // 30 minutes
          }
        )
      ]);
      
      // Only calculate stats if needed (not hub post and has guesses)
      let stats = undefined;
      if (!state.isHubPost && state.guessCount > 0) {
        // Cache the guess statistics for 1 minute
        stats = await context.cache(
          async () => {
            const guessesJson = await context.redis.get(`hiddenshape_allguesses_${state.postId}`);
            const allGuesses = guessesJson ? JSON.parse(guessesJson) : [];
            const correctGuesses = allGuesses.filter((g: HeatmapGuessData) => g.isCorrect).length;
            
            return {
              correctGuesses,
              totalGuesses: state.guessCount,
              successRate: Math.round((correctGuesses / state.guessCount) * 100)
            };
          },
          {
            key: `cache_stats_${state.postId}`,
            ttl: 60 * 1000, // 1 minute
          }
        );
      }
      
      // Send initial data to the web view
      webView.postMessage({
        type: 'initialData',
        data: {
          username: state.username,
          gameData: state.gameData,
          canvasConfig: canvasConfigData,
          isRevealed: state.isRevealed,
          guessCount: state.guessCount,
          postId: state.postId,
          isHub: state.isHubPost,
          userGuess: cachedUserGuessData?.x !== undefined ? cachedUserGuessData : undefined,
          stats
        },
      });
      break;
    
    case 'createGamePost':
      // Create a new game post with a shape to find
      if (!state.isHubPost) {
        // This shouldn't happen, but just in case
        context.ui.showToast({ text: 'Cannot create game from a game post!' });
        return;
      }
      
      // Create a new post for this game
      const gamePost = await context.reddit.submitPost({
        title: `Find the Hidden ${message.data.shapeType} - ${new Date().toLocaleString()}`,
        subredditName: await (await context.reddit.getCurrentSubreddit()).name,
        preview: (
          <LoadingScreen text='Loading Game...'/>
        ),
      });
      
      // Save the shape data for the new post
      const shapeData = {
        ...message.data,
        postId: gamePost.id,  // Use the new post ID
      };
      
      // Store multiple pieces of data in Redis in parallel
      await Promise.all([
        // Store shape data
        context.redis.set(
          `hiddenshape_data_${gamePost.id}`,
          JSON.stringify(shapeData)
        ),
        
        // Store canvas configuration
        context.redis.set(
          `hiddenshape_canvas_${gamePost.id}`,
          JSON.stringify(message.canvasConfig)
        ),
        
        // Initialize guess count
        context.redis.set(
          `hiddenshape_guesscount_${gamePost.id}`,
          "0"
        ),
        
        // Initialize empty guesses array
        context.redis.set(
          `hiddenshape_allguesses_${gamePost.id}`,
          "[]"
        )
      ]);
      
      // Update global games list and count (also in parallel)
      const [gamesListJson, totalGamesStr] = await Promise.all([
        context.redis.get('hiddenshape_games_list'),
        context.redis.get('hiddenshape_total_games')
      ]);
      
      const gamesList = gamesListJson ? JSON.parse(gamesListJson) : [];
      gamesList.push(gamePost.id);
      
      const totalGames = totalGamesStr ? parseInt(totalGamesStr) : 0;
      
      // Update global counters in parallel
      await Promise.all([
        context.redis.set('hiddenshape_games_list', JSON.stringify(gamesList)),
        context.redis.set('hiddenshape_total_games', (totalGames + 1).toString())
      ]);
      
      // Notify the web view that the game was created
      webView.postMessage({
        type: 'gameCreated',
        data: {
          postId: gamePost.id,
          message: 'New game created!'
        }
      });
      
      // Navigate the user to the new post
      context.ui.showToast({ text: 'Game created!' });
      context.ui.navigateTo(gamePost);
      break;
      
    case 'recordGuess':
      // Record a user's guess in a game post (not the hub)
      if (state.isHubPost) {
        context.ui.showToast({ text: 'Cannot make guesses on the hub post!' });
        return;
      }
      
      const existingUserData = await context.redis.get(`hiddenshape_user_${state.postId}_${state.username}`);
      
      // Check if user has already guessed
      if (existingUserData) {
        webView.postMessage({
          type: 'guessResponse',
          data: {
            success: false,
            message: 'You have already made a guess on this post!'
          }
        });
        return;
      }

      // For Shape Seeker gameplay, we need to check if guess is close to target
      // We'll consider it correct if within a small distance of the actual shape
      const guessX = message.data.x;
      const guessY = message.data.y;
      
      const targetX = state.gameData?.x ?? 0;
      const targetY = state.gameData?.y ?? 0;
      
      // Calculate distance between guess and target (using Euclidean distance)
      const distance = Math.sqrt(Math.pow(guessX - targetX, 2) + Math.pow(guessY - targetY, 2));
      
      // Consider it correct if within 15 pixels of target center
      const isCorrect = distance <= 15;

      // Prepare the new guess object
      const newGuess: HeatmapGuessData = {
        username: state.username,
        x: message.data.x,
        y: message.data.y,
        timestamp: Date.now(),
        secondsTaken: message.data.secondsTaken,
        isCorrect
      };
      
      // Prepare user's guess data
      const userGuessData = {
        ...message.data,
        isCorrect
      };
      
      // Updated guess list
      const updatedGuesses = [...state.allGuesses, newGuess];
      
      // Update everything in parallel
      await Promise.all([
        // Save user's guess
        context.redis.set(
          `hiddenshape_user_${state.postId}_${state.username}`,
          JSON.stringify(userGuessData)
        ),
        
        // Increment guess count
        context.redis.set(
          `hiddenshape_guesscount_${state.postId}`,
          (state.guessCount + 1).toString()
        ),
        
        // Save updated guesses list
        context.redis.set(
          `hiddenshape_allguesses_${state.postId}`,
          JSON.stringify(updatedGuesses)
        ),
        
        // Update global counters
        context.redis.get('hiddenshape_total_guesses')
          .then(totalGuessesStr => {
            const totalGuesses = totalGuessesStr ? parseInt(totalGuessesStr) : 0;
            return context.redis.set('hiddenshape_total_guesses', (totalGuesses + 1).toString());
          }),
        
        // Update correct guesses counter if applicable
        isCorrect ? context.redis.get('hiddenshape_total_correct_guesses')
          .then(totalCorrectGuessesStr => {
            const totalCorrectGuesses = totalCorrectGuessesStr ? parseInt(totalCorrectGuessesStr) : 0;
            return context.redis.set('hiddenshape_total_correct_guesses', (totalCorrectGuesses + 1).toString());
          }) : Promise.resolve()
      ]);
      
      // Update local state
      state.setAllGuesses(updatedGuesses);

      // Now immediately show results to the user after guessing
      webView.postMessage({
        type: 'guessResponse',
        data: {
          success: true,
          message: isCorrect 
            ? 'Congratulations! You found the hidden shape!' 
            : 'Your guess has been recorded, but it\'s not correct.',
          isCorrect,
          showResults: true,
          gameData: state.gameData,
          guesses: updatedGuesses,
          userGuess: {
            x: message.data.x,
            y: message.data.y,
            secondsTaken: message.data.secondsTaken,
            isCorrect
          }
        }
      });
      break;
      
    case 'revealShape':
      // Trigger reveal of the hidden shape and show the heatmap
      if (state.isHubPost) {
        context.ui.showToast({ text: 'Cannot reveal shape on hub post!' });
        return;
      }
      
      await context.redis.set(
        `hiddenshape_revealed_${state.postId}`,
        'true'
      );
      
      // Get user's own guess and all guesses in parallel
      const [allGuessesForHeatmap, userOwnGuessData] = await Promise.all([
        context.redis.get(`hiddenshape_allguesses_${state.postId}`),
        context.redis.get(`hiddenshape_user_${state.postId}_${state.username}`)
      ]);
      
      const guesses = allGuessesForHeatmap ? JSON.parse(allGuessesForHeatmap) : [];
      const userOwnGuess = userOwnGuessData ? JSON.parse(userOwnGuessData) : null;
      
      // Calculate game stats
      let revealStats = undefined;
      if (state.guessCount > 0) {
        const correctGuesses = guesses.filter((g: HeatmapGuessData) => g.isCorrect).length;
        
        revealStats = {
          correctGuesses,
          totalGuesses: state.guessCount,
          successRate: Math.round((correctGuesses / state.guessCount) * 100)
        };
      }
      
      webView.postMessage({
        type: 'revealResults',
        data: {
          isRevealed: true,
          guesses,
          stats: revealStats,
          userGuess: userOwnGuess
        }
      });
      break;
      
    case 'refreshPost':
      // Handle refresh post request from webview
      try {
        if (!state.isHubPost) {
          const post = await context.reddit.getPostById(state.postId);
          if (post) {
            context.ui.navigateTo(post);
          }
        }
      } catch (error) {
        console.error('Error refreshing post view:', error);
      }
      break;
      
    default:
      // Use type assertion to handle unknown message type
      throw new Error(`Unknown message type: ${(message as WebViewMessage).type}`);
  }
} 