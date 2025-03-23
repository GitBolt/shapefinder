import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, ShapeData, GuessData, HeatmapGuessData, CanvasConfig } from './message.js';
import { Empty } from './views/Empty.js';
import { handleWebViewMessage } from './components/WebViewHandler.js';
import { Start } from './views/Start.js';
import { Hub } from './views/Hub.js';
import { Complete } from './views/Complete.js';
import { Results } from './views/Results.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});


// Add a custom post type for Hidden Shape game
Devvit.addCustomPostType({
  name: 'Where\'s the Shape? Game Hub',
  height: 'tall',
  render: (context) => {

    const [username] = useState<string>(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const [postTitle] = useState<string>(async () => {
      const post = await context.reddit.getPostById(context.postId ?? '');
      return post?.title ?? '';
    });

    // Check if this is a hub post
    const isHubPost = postTitle === 'Where\'s the Shape? Game Hub';

    // Only load game data if not a hub post
    const [gameData] = useState<ShapeData | null>(async () => {
      if (isHubPost) return null;
      
      const hiddenShapeData = await context.redis.get(`hiddenshape_data_${context.postId}`);
      return hiddenShapeData ? JSON.parse(hiddenShapeData) : null;
    });

    // Load canvas configuration
    const [canvasConfig] = useState<CanvasConfig | null>(async () => {
      if (isHubPost) return null;
      
      const canvasConfigData = await context.redis.get(`hiddenshape_canvas_${context.postId}`);
      if (!canvasConfigData) return null;
      
      try {
        return JSON.parse(canvasConfigData) as CanvasConfig;
      } catch (e) {
        console.error('Error parsing canvas config:', e);
        return null;
      }
    });

    // Track the reveal status (only for game posts, not hub)
    const [isRevealed] = useState<boolean>(async () => {
      if (isHubPost) return false;
      
      const revealStatus = await context.redis.get(`hiddenshape_revealed_${context.postId}`);
      return Boolean(revealStatus);
    });

    // Get user guess count (only for game posts)
    const [guessCount] = useState<number>(async () => {
      if (isHubPost) return 0;
      
      const countStr = await context.redis.get(`hiddenshape_guesscount_${context.postId}`);
      return Number(countStr ?? 0);
    });
    
    // Maintain list of guesses in state (only for game posts)
    const [allGuesses, setAllGuesses] = useState<HeatmapGuessData[]>(async () => {
      if (isHubPost) return [];
      
      // Try to get the guesses from Redis
      const guessesJson = await context.redis.get(`hiddenshape_allguesses_${context.postId}`);
      return guessesJson ? JSON.parse(guessesJson) : [];
    });

    // Setup the web view with message handlers
    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'index.html',

      // Handle messages sent from the web view
      async onMessage(message, webView) {
        // Use the extracted message handler
        await handleWebViewMessage(
          message, 
          webView, 
          context, 
          {
            username,
            gameData,
            isHubPost,
            guessCount,
            isRevealed,
            postId: context.postId ?? '',
            allGuesses,
            setAllGuesses,
          }
        );
      },
      onUnmount() {
        // Just show a toast that the game was closed
        context.ui.showToast({ text: 'Game closed' });
        
        // No longer need to force a refresh on unmount since we're handling
        // state updates in real-time through the WebView messaging
      },
    });

    // Determine which view to render based on the post type and game state
    const renderView = () => {

      // Hub post for creating games
      if (isHubPost) {
        return <Hub webView={webView} context={context} />;
      }
      
      // If not hub, it must be a game post
      if (gameData && canvasConfig) {
        const [userGuess, setUserGuess] = useState<GuessData | null>(async () => {
          // Check for user's guess data
          const userData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
          return userData ? JSON.parse(userData) : null;
        });
        
        const [stats] = useState<{correctGuesses: number, totalGuesses: number}>(async () => {
          if (guessCount === 0) return { correctGuesses: 0, totalGuesses: 0 };
          
          const guessesJson = await context.redis.get(`hiddenshape_allguesses_${context.postId}`);
          const guesses = guessesJson ? JSON.parse(guessesJson) : [];
          const correctGuesses = guesses.filter((g: HeatmapGuessData) => g.isCorrect).length;
          
          return {
            correctGuesses,
            totalGuesses: guessCount
          };
        });
        
        const successRate = stats.totalGuesses > 0 
          ? Math.round((stats.correctGuesses / stats.totalGuesses) * 100) 
          : 0;
        
        // Game has ended (revealed)
        if (isRevealed) {
          return (
            <Complete
              gameData={gameData}
              canvasConfig={canvasConfig}
              guessCount={guessCount}
              successRate={successRate}
              userGuess={userGuess}
              webView={webView}
            />
          );
        }
        
        // Active game, user has already guessed
        if (userGuess) {
          const [userGuessResult] = useState<{isCorrect?: boolean}>(async () => {
            const userGuessData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
            return userGuessData ? JSON.parse(userGuessData) : {};
          });
          
          return (
            <Results
              gameData={gameData}
              canvasConfig={canvasConfig}
              guessCount={guessCount}
              successRate={successRate}
              userGuess={userGuess}
              userGuessResult={userGuessResult}
            />
          );
        }
        
        // Active game, user has not guessed yet
        return (
          <Start
            gameData={gameData}
            canvasConfig={canvasConfig}
            guessCount={guessCount}
            successRate={successRate}
            webView={webView}
          />
        );
      }
      
      // When it is not a hub nor a game (Should not happen really)
      return <Empty/>;
    };

    return renderView();
  },
});

export default Devvit;
