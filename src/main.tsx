import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, ShapeData, GuessData, HeatmapGuessData, CanvasConfig } from './message.js';

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
        switch (message.type) {
          case 'webViewReady':
            // Get user's previous guess if available
            const userGuessData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
            const userGuess = userGuessData ? JSON.parse(userGuessData) : null;
            
            // Calculate game stats if available
            let stats = undefined;
            if (!isHubPost && guessCount > 0) {
              const guessesJson = await context.redis.get(`hiddenshape_allguesses_${context.postId}`);
              const allGuesses = guessesJson ? JSON.parse(guessesJson) : [];
              const correctGuesses = allGuesses.filter((g: HeatmapGuessData) => g.isCorrect).length;
              
              stats = {
                correctGuesses,
                totalGuesses: guessCount,
                successRate: Math.round((correctGuesses / guessCount) * 100)
              };
            }
            
            // Send initial data to the web view
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
            // Hub post: Create a new game post with a shape to find
            if (!isHubPost) {
              // This shouldn't happen, but just in case
              context.ui.showToast({ text: 'Cannot create game from a game post!' });
              return;
            }
            
            // Create a new post for this game with a Where's Waldo style title
            const gamePost = await context.reddit.submitPost({
              title: `Find the Hidden ${message.data.shapeType} - ${new Date().toLocaleString()}`,
              subredditName: await (await context.reddit.getCurrentSubreddit()).name,
              preview: (
                <vstack height="100%" width="100%" alignment="middle center">
                  <text size="large">Creating Hidden Shape Game...</text>
                </vstack>
              ),
            });
            
            // Save the shape data for the new post
            const shapeData = {
              ...message.data,
              postId: gamePost.id,  // Use the new post ID
            };
            
            // Store shape data in Redis
            await context.redis.set(
              `hiddenshape_data_${gamePost.id}`,
              JSON.stringify(shapeData)
            );
            
            // Store canvas configuration in Redis
            await context.redis.set(
              `hiddenshape_canvas_${gamePost.id}`,
              JSON.stringify(message.canvasConfig)
            );
            
            // Initialize guess count for the new post
            await context.redis.set(
              `hiddenshape_guesscount_${gamePost.id}`,
              "0"
            );
            
            // Initialize empty guesses array for the new post
            await context.redis.set(
              `hiddenshape_allguesses_${gamePost.id}`,
              "[]"
            );
            
            // Notify the web view that the game was created
            webView.postMessage({
              type: 'gameCreated',
              data: {
                postId: gamePost.id,
                message: 'New Where\'s Waldo style game created!'
              }
            });
            
            // Navigate the user to the new post
            context.ui.showToast({ text: 'Hidden Shape game created!' });
            context.ui.navigateTo(gamePost);
            break;
            
          case 'recordGuess':
            // Record a user's guess in a game post (not the hub)
            if (isHubPost) {
              context.ui.showToast({ text: 'Cannot make guesses on the hub post!' });
              return;
            }
            
            const existingUserData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
            
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

            // For Where's Waldo gameplay, we need to check if guess is close to target
            // We'll consider it correct if within a small distance of the actual shape
            const guessX = message.data.x;
            const guessY = message.data.y;
            
            const targetX = gameData?.x ?? 0;
            const targetY = gameData?.y ?? 0;
            
            // Calculate distance between guess and target (using Euclidean distance)
            const distance = Math.sqrt(Math.pow(guessX - targetX, 2) + Math.pow(guessY - targetY, 2));
            
            // Consider it correct if within 15 pixels of target center
            const isCorrect = distance <= 15;

            // Save user's guess
            await context.redis.set(
              `hiddenshape_user_${context.postId}_${username}`,
              JSON.stringify({
                ...message.data,
                isCorrect
              })
            );
            
            // Increment guess count
            const newCount = guessCount + 1;
            await context.redis.set(
              `hiddenshape_guesscount_${context.postId}`,
              newCount.toString()
            );

            // Add user's guess to the list of all guesses for the heatmap
            const newGuess: HeatmapGuessData = {
              username,
              x: message.data.x,
              y: message.data.y,
              timestamp: Date.now(),
              secondsTaken: message.data.secondsTaken,
              isCorrect
            };
            
            // Store guesses as a JSON array in Redis
            const updatedGuesses = [...allGuesses, newGuess];
            setAllGuesses(updatedGuesses);
            
            // Save updated guesses list
            await context.redis.set(
              `hiddenshape_allguesses_${context.postId}`,
              JSON.stringify(updatedGuesses)
            );

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
            // Trigger reveal of the hidden shape and show the heatmap
            if (isHubPost) {
              context.ui.showToast({ text: 'Cannot reveal shape on hub post!' });
              return;
            }
            
            await context.redis.set(
              `hiddenshape_revealed_${context.postId}`,
              'true'
            );
            
            // Get all guesses for the heatmap
            const allGuessesForHeatmap = await context.redis.get(
              `hiddenshape_allguesses_${context.postId}`
            );
            
            const guesses = allGuessesForHeatmap ? JSON.parse(allGuessesForHeatmap) : [];
            
            // Get user's own guess if available
            const userOwnGuessData = await context.redis.get(`hiddenshape_user_${context.postId}_${username}`);
            const userOwnGuess = userOwnGuessData ? JSON.parse(userOwnGuessData) : null;
            
            // Calculate game stats
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
            // Use type assertion to handle unknown message type
            throw new Error(`Unknown message type: ${(message as WebViewMessage).type}`);
        }
      },
      onUnmount() {
        context.ui.showToast({ text: 'Hidden Shape closed!' });
      },
    });

    // If this is a hub post for creating games
    if (isHubPost) {
      return (
        <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
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
                onPress={() => context.ui.showToast({ text: 'Coming soon: Game History!' })}
              >
                Game Stats
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
                Create a new game by hiding a shape among many others, then share it with friends to see if they can find it!
              </text>
            </vstack>
          </vstack>
        </vstack>
      );
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
          <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
            <vstack grow alignment="middle center">
              <text size="xxlarge" weight="bold" color="#1a1a2e">
                Game Complete!
              </text>
              <text size="medium" color="#455a64" alignment="middle center">
                The hidden <text weight="bold" color={gameData.color}>{gameData.shapeType}</text> has been revealed
              </text>
              
              <spacer size="medium" />
              
              <hstack gap="medium" alignment="center middle" width="100%">
                <vstack backgroundColor="#e8f6ff" padding="medium" cornerRadius="medium" grow>
                  <text size="xlarge" weight="bold" color="#0d47a1">
                    {guessCount}
                  </text>
                  <text size="small" color="#455a64">Total Guesses</text>
                </vstack>
                
                <vstack backgroundColor="#e8f5e9" padding="medium" cornerRadius="medium" grow>
                  <text size="xlarge" weight="bold" color="#2e7d32">
                    {successRate}%
                  </text>
                  <text size="small" color="#455a64">Success Rate</text>
                </vstack>
                
                {userGuess && (
                  <vstack backgroundColor="#fff8e1" padding="medium" cornerRadius="medium" grow>
                    <text weight="bold" color="#ed6c02">Your Guess</text>
                    <text size="small" weight="bold" color={(userGuess as any).isCorrect ? "#2e7d32" : "#c62828"}>
                      {(userGuess as any).isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
                      {(userGuess as any).secondsTaken !== undefined && (
                        <text size="xsmall" color="#455a64">
                          {" "}{(userGuess as any).secondsTaken}s
                        </text>
                      )}
                    </text>
                  </vstack>
                )}
              </hstack>
              
              <spacer size="medium" />
              
              <vstack backgroundColor="white" padding="medium" cornerRadius="medium" width="95%">
                <hstack alignment="start middle" gap="small">
                  <text weight="bold" color="#1a1a2e">Game Results</text>
                  <text size="small" color="#78909c">• Target Location</text>
                </hstack>
                <spacer size="xsmall" />
                
                {/* Simple visual representation of guess vs target with all guesses */}
                <hstack width="100%" height="260px" backgroundColor="#f8fafc" cornerRadius="small">
                  <zstack width="100%" height="100%" alignment="middle center">
                    {/* Coordinate axes for reference */}
                    <hstack width="90%" height="1px" backgroundColor="#e0e0e0" alignment="middle center" />
                    <vstack width="1px" height="90%" backgroundColor="#e0e0e0" alignment="middle center" />
                    
                    {/* Target position marker */}
                    <hstack width="100%" height="100%">
                      <spacer 
                        width={`${Math.max(0, Math.min(100, (gameData.x / canvasConfig.width) * 100))}%`} 
                        height={`${Math.max(0, Math.min(100, (gameData.y / canvasConfig.height) * 100))}%`}
                      />
                      <vstack width="24px" height="24px" backgroundColor="#2e7d32" cornerRadius="full" />
                      <spacer grow />
                    </hstack>
                    
                    {/* User guess position marker (if user has guessed) */}
                    {userGuess && (
                      <hstack width="100%" height="100%">
                        <spacer 
                          width={`${Math.max(0, Math.min(100, (userGuess.x / canvasConfig.width) * 100))}%`} 
                          height={`${Math.max(0, Math.min(100, (userGuess.y / canvasConfig.height) * 100))}%`}
                        />
                        <vstack width="24px" height="24px" backgroundColor="#c62828" cornerRadius="full" />
                        <spacer grow />
                      </hstack>
                    )}
                  </zstack>
                </hstack>
                
                <spacer size="small" />
                <hstack gap="medium" alignment="middle center">
                  <hstack gap="small" alignment="center middle">
                    <vstack width="14px" height="14px" backgroundColor="#2e7d32" cornerRadius="full" />
                    <text size="xsmall">Target</text>
                  </hstack>
                  {userGuess && (
                    <hstack gap="small" alignment="center middle">
                      <vstack width="14px" height="14px" backgroundColor="#c62828" cornerRadius="full" />
                      <text size="xsmall">Your Guess</text>
                    </hstack>
                  )}
                  {userGuess && (
                    <hstack gap="small" alignment="center middle">
                      <text size="xsmall" color="#78909c">
                        Distance: {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)} pixels
                      </text>
                    </hstack>
                  )}
                </hstack>
              </vstack>
              
              <spacer size="medium" />
              
              <button 
                appearance="primary"
                onPress={() => webView.mount()}
                icon="search"
              >
                View All Guesses
              </button>
            </vstack>
          </vstack>
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
          <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
            <vstack grow alignment="middle center">
              <text size="xxlarge" weight="bold" color="#1a1a2e">
                Where's the{" "}
                <text color={gameData.color}>
                  {gameData.shapeType}
                </text>
                ?
              </text>
              <text size="medium" color="#455a64" alignment="middle center">
                Find the hidden shape among the others!
              </text>
              
              <spacer size="medium" />
              
              <hstack gap="medium" alignment="center middle" width="100%">
                <vstack backgroundColor="#e8f6ff" padding="medium" cornerRadius="medium" grow>
                  <text size="xlarge" weight="bold" color="#0d47a1">
                    {guessCount}
                  </text>
                  <text size="small" color="#455a64">Guesses So Far</text>
                </vstack>
                
                <vstack backgroundColor="#e8f5e9" padding="medium" cornerRadius="medium" grow>
                  <text size="xlarge" weight="bold" color="#2e7d32">
                    {successRate}%
                  </text>
                  <text size="small" color="#455a64">Success Rate</text>
                </vstack>
                
                {userGuess && (
                  <vstack backgroundColor="#fff8e1" padding="medium" cornerRadius="medium" grow>
                    <text weight="bold" color="#ed6c02">Your Guess</text>
                    {userGuessResult.isCorrect !== undefined && (
                      <text size="small" weight="bold" color={userGuessResult.isCorrect ? "#2e7d32" : "#c62828"}>
                        {userGuessResult.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
                        {(userGuess as any).secondsTaken !== undefined && (
                          <text size="xsmall" color="#455a64">
                            {" "}{(userGuess as any).secondsTaken}s
                          </text>
                        )}
                      </text>
                    )}
                  </vstack>
                )}
              </hstack>
              
              <spacer size="medium" />
              
              {userGuess ? (
                <vstack backgroundColor="white" padding="medium" cornerRadius="medium" width="95%">
                  <hstack alignment="start middle" gap="small">
                    <text weight="bold" color="#1a1a2e">Game Board Visualization</text>
                    <text size="small" color="#78909c">• Your Guess</text>
                  </hstack>
                  <spacer size="xsmall" />
                  
                  {/* Simple visual representation of guess vs target */}
                  <hstack width="100%" height="260px" backgroundColor="#f8fafc" cornerRadius="small">
                    <zstack width="100%" height="100%" alignment="middle center">
                      {/* Coordinate axes for reference */}
                      <hstack width="90%" height="1px" backgroundColor="#e0e0e0" alignment="middle center" />
                      <vstack width="1px" height="90%" backgroundColor="#e0e0e0" alignment="middle center" />
                      
                      {/* Target position marker (only visible to cheat for demo purposes) */}
                      <hstack width="100%" height="100%">
                        <spacer 
                          width={`${Math.max(0, Math.min(100, (gameData.x / canvasConfig.width) * 100))}%`} 
                          height={`${Math.max(0, Math.min(100, (gameData.y / canvasConfig.height) * 100))}%`}
                        />
                        <vstack width="24px" height="24px" backgroundColor="#2e7d32" cornerRadius="full" />
                        <spacer grow />
                      </hstack>
                      
                      {/* User guess position marker */}
                      <hstack width="100%" height="100%">
                        <spacer 
                          width={`${Math.max(0, Math.min(100, (userGuess.x / canvasConfig.width) * 100))}%`} 
                          height={`${Math.max(0, Math.min(100, (userGuess.y / canvasConfig.height) * 100))}%`}
                        />
                        <vstack width="24px" height="24px" backgroundColor="#c62828" cornerRadius="full" />
                        <spacer grow />
                      </hstack>
                    </zstack>
                  </hstack>
                  
                  <spacer size="small" />
                  <hstack gap="medium" alignment="middle center">
                    <hstack gap="small" alignment="center middle">
                      <vstack width="14px" height="14px" backgroundColor="#c62828" cornerRadius="full" />
                      <text size="xsmall">Your Guess</text>
                    </hstack>
                    <hstack gap="small" alignment="center middle">
                      <text size="xsmall" color="#78909c">
                        Distance: {Math.sqrt(Math.pow(userGuess.x - gameData.x, 2) + Math.pow(userGuess.y - gameData.y, 2)).toFixed(0)} pixels
                      </text>
                    </hstack>
                  </hstack>
                </vstack>
              ) : (
                <vstack padding="medium" backgroundColor="rgba(59, 130, 246, 0.05)" cornerRadius="medium" width="85%">
                  <text size="medium" weight="bold" color="#1a1a2e" alignment="middle center">
                    Ready to play?
                  </text>
                  <text size="small" color="#455a64" alignment="middle center">
                    Click the button below to find the hidden shape among many others.
                  </text>
                  <spacer size="medium" />
                  <button 
                    appearance="primary"
                    onPress={() => webView.mount()}
                    icon="add"
                  >
                    Play Game
                  </button>
                </vstack>
              )}
            </vstack>
          </vstack>
        );
      }
    } else {
      // Render the creator state for a new empty game post (shouldn't typically happen)
      return (
        <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
          <vstack grow alignment="middle center">
            <image 
              url="https://i.imgur.com/wqtUCyq.png"
              imageWidth={250}
              imageHeight={80}
            />
            <text size="xxlarge" weight="bold" color="#1a1a2e">
              Create a Hidden Shape
            </text>
            <text size="medium" color="#455a64" alignment="middle center">
              Hide a shape among many others for players to find!
            </text>
            <spacer size="large" />
            
            <vstack 
              backgroundColor="rgba(59, 130, 246, 0.05)"
              padding="medium"
              cornerRadius="medium"
              width="80%"
            >
              <text size="small" color="#64748b" alignment="middle center">
                This tool lets you create an interactive game where other users try to spot your carefully hidden shape.
              </text>
              <spacer size="medium" />
              <button 
                appearance="primary"
                onPress={() => webView.mount()}
                icon="add"
              >
                Create Hidden Shape
              </button>
            </vstack>
          </vstack>
        </vstack>
      );
    }
  },
});

// Remove the old menu item that creates individual game posts - we'll now use the hub
export default Devvit;
