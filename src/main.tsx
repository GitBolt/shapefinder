import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, ShapeData, GuessData, HeatmapGuessData, CanvasConfig } from './message.js';
import { Empty } from './views/Empty.js';
import { handleWebViewMessage } from './util/webViewHandler.js';
import { Start } from './views/Start.js';
import { Hub } from './views/Hub.js';
import { Complete } from './views/Complete.js';
import { Results } from './views/Results.js';
import { generateGameId } from './util/gameId.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Shape Seeker Game Hub',
  height: 'tall',
  render: (context) => {
    type GameInfo = {
      username: string;
      title: string;
      isHubPost: boolean;
      gameData: any;
      canvasConfig: any;
      isRevealed: boolean;
      guessCount: number;
    };

    const [gameInfo] = useState<GameInfo | null>(async () => {
      const [username, postInfo] = await Promise.all([
        context.reddit.getCurrentUsername().then(name => name ?? 'anon'),
        context.reddit.getPostById(context.postId ?? '').then(post => ({
          title: post?.title ?? '',
          isHubPost: post?.title === 'Shape Seeker Game Hub'
        }))
      ]);
      
      const { title, isHubPost } = postInfo;
      
      // Only load game data if not a hub post (optimization)
      if (isHubPost) {
        return { 
          username, 
          title, 
          isHubPost, 
          gameData: null, 
          canvasConfig: null, 
          isRevealed: false, 
          guessCount: 0 
        };
      }
      
      // For game posts, load all necessary game data in parallel
      const [
        hiddenShapeData, 
        canvasConfigData, 
        revealStatus,
        countStr
      ] = await Promise.all([
        context.redis.get(`hiddenshape_data_${context.postId}`),
        context.redis.get(`hiddenshape_canvas_${context.postId}`),
        context.redis.get(`hiddenshape_revealed_${context.postId}`),
        context.redis.get(`hiddenshape_guesscount_${context.postId}`)
      ]);
      
      let gameData = null;
      let canvasConfig = null;
      
      try {
        if (hiddenShapeData) {
          gameData = JSON.parse(hiddenShapeData) as ShapeData;
          
          // Add gameId if it doesn't exist (for backwards compatibility)
          if (!gameData.gameId) {
            gameData.gameId = generateGameId();
            
            // Store updated data and create an index for the game ID
            if (context.postId) {
              await Promise.all([
                context.redis.set(
                  `hiddenshape_data_${context.postId}`,
                  JSON.stringify(gameData)
                ),
                context.redis.set(
                  `hiddenshape_id_index_${gameData.gameId}`,
                  context.postId
                )
              ]);
            }
          } else if (context.postId) {
            // Make sure the ID index exists even for games that already have an ID
            await context.redis.set(
              `hiddenshape_id_index_${gameData.gameId}`,
              context.postId
            );
          }
        }
        
        if (canvasConfigData) canvasConfig = JSON.parse(canvasConfigData) as CanvasConfig;
      } catch (e) {
        console.error('Error parsing data:', e);
      }
      
      return {
        username,
        title,
        isHubPost,
        gameData,
        canvasConfig,
        isRevealed: Boolean(revealStatus),
        guessCount: Number(countStr ?? 0)
      };
    });
    
    const username = gameInfo?.username ?? 'anon';
    const isHubPost = gameInfo?.isHubPost ?? false;
    const gameData = gameInfo?.gameData ?? null;
    const canvasConfig = gameInfo?.canvasConfig ?? null;
    const isRevealed = gameInfo?.isRevealed ?? false;
    const guessCount = gameInfo?.guessCount ?? 0;
    
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
        context.ui.showToast({ text: 'Game closed' });
      },
    });

    const renderView = () => {
      // Hub post for creating games
      if (isHubPost) {
        return <Hub webView={webView} context={context} />;
      }
      
      // If not hub, it must be a game post
      if (gameData && canvasConfig) {
        type UserGuessAndStats = {
          userGuess: any;
          stats: {
            correctGuesses: number;
            totalGuesses: number;
          };
        };
        
        const [userGuessAndStats] = useState<UserGuessAndStats | null>(async () => {
          // Get user's guess and stats in parallel
          const [userData, guessesJson] = await Promise.all([
            context.redis.get(`hiddenshape_user_${context.postId}_${username}`),
            guessCount > 0 ? context.redis.get(`hiddenshape_allguesses_${context.postId}`) : null
          ]);
          
          const userGuess = userData ? JSON.parse(userData) : null;
          
          let stats = { correctGuesses: 0, totalGuesses: 0 };
          if (guessCount > 0 && guessesJson) {
            const guesses = JSON.parse(guessesJson);
            stats = {
              correctGuesses: guesses.filter((g: HeatmapGuessData) => g.isCorrect).length,
              totalGuesses: guessCount
            };
          }
          
          return { userGuess, stats };
        });
        
        // Extract strongly typed values
        const userGuess = userGuessAndStats?.userGuess ?? null;
        const stats = userGuessAndStats?.stats ?? { correctGuesses: 0, totalGuesses: 0 };
        
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
          return (
            <Results
              gameData={gameData}
              canvasConfig={canvasConfig}
              guessCount={guessCount}
              successRate={successRate}
              userGuess={userGuess}
              userGuessResult={userGuess}
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
