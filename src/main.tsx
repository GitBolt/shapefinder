import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, ShapeData, GuessData, HeatmapGuessData, CanvasConfig } from './message.js';
import { HubPost, RevealedGamePost, ActiveGamePost, EmptyGamePost } from './components/index.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type for Where's the Shape? game
Devvit.addCustomPostType({
  name: 'Where\'s the Shape?',
  height: 'tall',
  render: (context) => {
    const [username] = useState<string>(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const [postTitle] = useState<string>(async () => {
      const post = await context.reddit.getPostById(context.postId ?? '');
      return post?.title ?? '';
    });

    // Determine if we're in the hub or a game post based on title
    const isHubPost = postTitle === 'Where\'s the Shape? Game Hub';

    const [gameData] = useState<ShapeData | null>(async () => {
      if (isHubPost) return null;
      
      const hiddenShapeData = await context.redis.get(`wheresshape_data_${context.postId}`);
      return hiddenShapeData ? JSON.parse(hiddenShapeData) : null;
    });

    const [canvasConfig] = useState<CanvasConfig | null>(async () => {
      if (isHubPost) return null;
      
      const canvasConfigData = await context.redis.get(`wheresshape_canvas_${context.postId}`);
      if (!canvasConfigData) return null;
      
      try {
        return JSON.parse(canvasConfigData) as CanvasConfig;
      } catch (e) {
        console.error('Error parsing canvas config:', e);
        return null;
      }
    });

    // Track if game has been revealed (game over state)
    const [isRevealed] = useState<boolean>(async () => {
      if (isHubPost) return false;
      
      const revealStatus = await context.redis.get(`wheresshape_revealed_${context.postId}`);
      return Boolean(revealStatus);
    });

    // Get total guess count for statistics
    const [guessCount] = useState<number>(async () => {
      if (isHubPost) return 0;
      
      const countStr = await context.redis.get(`wheresshape_guesscount_${context.postId}`);
      return Number(countStr ?? 0);
    });
    
    // Get all player guesses for heatmap visualization
    const [allGuesses, setAllGuesses] = useState<HeatmapGuessData[]>(async () => {
      if (isHubPost) return [];
      
      const guessesJson = await context.redis.get(`wheresshape_allguesses_${context.postId}`);
      return guessesJson ? JSON.parse(guessesJson) : [];
    });

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'index.html',

      async onMessage(message, webView) {
        switch (message.type) {
          case 'webViewReady':
            const userGuessData = await context.redis.get(`wheresshape_user_${context.postId}_${username}`);
            const userGuess = userGuessData ? JSON.parse(userGuessData) : null;
            
            let stats = undefined;
            if (!isHubPost && guessCount > 0) {
              const guessesJson = await context.redis.get(`wheresshape_allguesses_${context.postId}`);
              const allGuesses = guessesJson ? JSON.parse(guessesJson) : [];
              const correctGuesses = allGuesses.filter((g: HeatmapGuessData) => g.isCorrect).length;
              
              stats = {
                correctGuesses,
                totalGuesses: guessCount,
                successRate: Math.round((correctGuesses / guessCount) * 100)
              };
            }
            
            webView.postMessage({
              type: 'initialData',
              data: {
                username,
                gameData,
                canvasConfig: canvasConfig ?? undefined,
                isRevealed,
                guessCount,
                postId: context.postId ?? '',
                isHub: isHubPost,
                userGuess: userGuess?.x !== undefined ? userGuess : undefined,
                stats
              },
            });
            break;
          
          case 'createGamePost':
            if (!isHubPost) {
              context.ui.showToast({ text: 'Cannot create game from a game post!' });
              return;
            }
            
            const gamePost = await context.reddit.submitPost({
              title: `Where's the ${message.data.shapeType}? - ${new Date().toLocaleString()}`,
              subredditName: await (await context.reddit.getCurrentSubreddit()).name,
              preview: (
                <vstack height="100%" width="100%" alignment="middle center">
                  <text size="large">Creating Where's the Shape? game...</text>
                </vstack>
              ),
            });
            
            const shapeData = {
              ...message.data,
              postId: gamePost.id,
            };
            
            await context.redis.set(
              `wheresshape_data_${gamePost.id}`,
              JSON.stringify(shapeData)
            );
            
            await context.redis.set(
              `wheresshape_canvas_${gamePost.id}`,
              JSON.stringify(message.canvasConfig)
            );
            
            await context.redis.set(
              `wheresshape_guesscount_${gamePost.id}`,
              "0"
            );
            
            await context.redis.set(
              `wheresshape_allguesses_${gamePost.id}`,
              "[]"
            );
            
            webView.postMessage({
              type: 'gameCreated',
              data: {
                postId: gamePost.id,
                message: 'New Where\'s the Shape? game created!'
              }
            });
            
            context.ui.showToast({ text: 'Where\'s the Shape? game created!' });
            context.ui.navigateTo(gamePost);
            break;
            
          case 'recordGuess':
            if (isHubPost) {
              context.ui.showToast({ text: 'Cannot make guesses on the hub post!' });
              return;
            }
            
            const existingUserData = await context.redis.get(`wheresshape_user_${context.postId}_${username}`);
            
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

            const guessX = message.data.x;
            const guessY = message.data.y;
            
            const targetX = gameData?.x ?? 0;
            const targetY = gameData?.y ?? 0;
            
            const distance = Math.sqrt(Math.pow(guessX - targetX, 2) + Math.pow(guessY - targetY, 2));
            
            const isCorrect = distance <= 15;

            await context.redis.set(
              `wheresshape_user_${context.postId}_${username}`,
              JSON.stringify({
                ...message.data,
                isCorrect
              })
            );
            
            const newCount = guessCount + 1;
            await context.redis.set(
              `wheresshape_guesscount_${context.postId}`,
              newCount.toString()
            );

            const newGuess: HeatmapGuessData = {
              username,
              x: message.data.x,
              y: message.data.y,
              timestamp: Date.now(),
              secondsTaken: message.data.secondsTaken,
              isCorrect
            };
            
            const updatedGuesses = [...allGuesses, newGuess];
            setAllGuesses(updatedGuesses);
            
            await context.redis.set(
              `wheresshape_allguesses_${context.postId}`,
              JSON.stringify(updatedGuesses)
            );

            webView.postMessage({
              type: 'guessResponse',
              data: {
                success: true,
                message: isCorrect 
                  ? 'Congratulations! You found the shape!' 
                  : 'Your guess has been recorded, but it\'s not correct.',
                isCorrect,
                showResults: true,
                gameData: gameData,
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
            if (isHubPost) {
              context.ui.showToast({ text: 'Cannot reveal shape on hub post!' });
              return;
            }
            
            await context.redis.set(
              `wheresshape_revealed_${context.postId}`,
              'true'
            );
            
            const allGuessesForHeatmap = await context.redis.get(
              `wheresshape_allguesses_${context.postId}`
            );
            
            const guesses = allGuessesForHeatmap ? JSON.parse(allGuessesForHeatmap) : [];
            
            const userOwnGuessData = await context.redis.get(`wheresshape_user_${context.postId}_${username}`);
            const userOwnGuess = userOwnGuessData ? JSON.parse(userOwnGuessData) : null;
            
            let revealStats = undefined;
            if (guessCount > 0) {
              const correctGuesses = guesses.filter((g: HeatmapGuessData) => g.isCorrect).length;
              
              revealStats = {
                correctGuesses,
                totalGuesses: guessCount,
                successRate: Math.round((correctGuesses / guessCount) * 100)
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
            
          default:
            throw new Error(`Unknown message type: ${(message as WebViewMessage).type}`);
        }
      },
      onUnmount() {
        context.ui.showToast({ text: 'Where\'s the Shape? closed!' });
      },
    });

    // Hub screen - shows game creation UI
    if (isHubPost) {
      return <HubPost webView={webView} context={context} />;
    } 
    // Game screen - either active or revealed game
    else if (gameData && canvasConfig) {
      const [userGuess] = useState<GuessData | null>(async () => {
        const userData = await context.redis.get(`wheresshape_user_${context.postId}_${username}`);
        return userData ? JSON.parse(userData) : null;
      });
      
      const [stats] = useState<{correctGuesses: number, totalGuesses: number}>(async () => {
        if (guessCount === 0) return { correctGuesses: 0, totalGuesses: 0 };
        
        const guessesJson = await context.redis.get(`wheresshape_allguesses_${context.postId}`);
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
      
      // Revealed game (game over) - shows results and solution
      if (isRevealed) {
        return (
          <RevealedGamePost
            webView={webView}
            gameData={gameData}
            canvasConfig={canvasConfig}
            guessCount={guessCount}
            successRate={successRate}
            userGuess={userGuess}
          />
        );
      } 
      // Active game - allows player to make a guess
      else {
        const [userGuessResult] = useState<{isCorrect?: boolean}>(async () => {
          if (!userGuess) return {};
          
          const userGuessData = await context.redis.get(`wheresshape_user_${context.postId}_${username}`);
          return userGuessData ? JSON.parse(userGuessData) : {};
        });
        
        return (
          <ActiveGamePost
            webView={webView}
            gameData={gameData}
            canvasConfig={canvasConfig}
            userGuess={userGuess}
            userGuessResult={userGuessResult}
            guessCount={guessCount}
            successRate={successRate}
          />
        );
      }
    } 
    // Empty/new game - shows creator interface for new game
    else {
      return <EmptyGamePost webView={webView} />;
    }
  },
});

export default Devvit;
