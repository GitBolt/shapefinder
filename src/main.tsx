import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, ShapeData, GuessData, HeatmapGuessData, CanvasConfig } from './message.js';
import { HubView } from './components/HubView.js';
import { ActiveGameView } from './components/ActiveGameView.js';
import { RevealedGameView } from './components/RevealedGameView.js';
import { EmptyGameView } from './components/EmptyGameView.js';
import { handleWebViewMessage } from './components/WebViewHandler.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type for Hidden Shape game
Devvit.addCustomPostType({
  name: 'Hidden Shape',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState<string>(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    // Get the post title
    const [postTitle] = useState<string>(async () => {
      const post = await context.reddit.getPostById(context.postId ?? '');
      return post?.title ?? '';
    });

    // Check if this is a hub post
    const isHubPost = postTitle === 'Hidden Shape Game Hub';

    // Only load game data if not a hub post
    const [gameData] = useState<ShapeData | null>(async () => {
      if (isHubPost) return null;
      
      const hiddenShapeData = await context.redis.get(`hiddenshape_data_${context.postId}`);
      return hiddenShapeData ? JSON.parse(hiddenShapeData) : null;
    });

    // Load canvas configuration for the Where's Waldo style game
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
      // URL of your web view content
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
        context.ui.showToast({ text: 'Hidden Shape closed!' });
      },
    });

    // If this is a hub post for creating games
    if (isHubPost) {
      return <HubView webView={webView} context={context} />;
    }
    // If we're showing a game post that someone else created
    else if (gameData && canvasConfig) {
      // Check if the user has already played
      const [userGuess] = useState<GuessData | null>(async () => {
        const userData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
        return userData ? JSON.parse(userData) : null;
      });
      
      // Calculate stats
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
      
      // Calculate success percentage (avoid division by zero)
      const successRate = stats.totalGuesses > 0 
        ? Math.round((stats.correctGuesses / stats.totalGuesses) * 100) 
        : 0;
      
      // For revealed games (ended games)
      if (isRevealed) {
        return (
          <RevealedGameView
            gameData={gameData}
            canvasConfig={canvasConfig}
            guessCount={guessCount}
            successRate={successRate}
            userGuess={userGuess}
            webView={webView}
          />
        );
      } 
      // For active games
      else {
        // Get user's own guess data
        const [userGuessResult] = useState<{isCorrect?: boolean}>(async () => {
          if (!userGuess) return {};
          
          const userGuessData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
          return userGuessData ? JSON.parse(userGuessData) : {};
        });
        
        return (
          <ActiveGameView
            gameData={gameData}
            canvasConfig={canvasConfig}
            guessCount={guessCount}
            successRate={successRate}
            userGuess={userGuess}
            userGuessResult={userGuessResult}
            webView={webView}
          />
        );
      }
    } else {
      // Render the creator state for a new empty game post (shouldn't typically happen)
      return <EmptyGameView webView={webView} />;
    }
  },
});

// Remove the old menu item that creates individual game posts - we'll now use the hub
export default Devvit;
