import './createPost.js';

import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage, ShapeData, GuessData, HeatmapGuessData } from './message.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type for Shape Shift game
Devvit.addCustomPostType({
  name: 'Shape Shift',
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
    const isHubPost = postTitle === 'Shape Shift Game Hub';

    // Only load game data if not a hub post
    const [gameData] = useState<ShapeData | null>(async () => {
      if (isHubPost) return null;
      
      const hiddenShapeData = await context.redis.get(`shapeshift_data_${context.postId}`);
      return hiddenShapeData ? JSON.parse(hiddenShapeData) : null;
    });

    // Track the reveal status (only for game posts, not hub)
    const [isRevealed] = useState<boolean>(async () => {
      if (isHubPost) return false;
      
      const revealStatus = await context.redis.get(`shapeshift_revealed_${context.postId}`);
      return Boolean(revealStatus);
    });

    // Get user guess count (only for game posts)
    const [guessCount] = useState<number>(async () => {
      if (isHubPost) return 0;
      
      const countStr = await context.redis.get(`shapeshift_guesscount_${context.postId}`);
      return Number(countStr ?? 0);
    });
    
    // Maintain list of guesses in state (only for game posts)
    const [allGuesses, setAllGuesses] = useState<HeatmapGuessData[]>(async () => {
      if (isHubPost) return [];
      
      // Try to get the guesses from Redis
      const guessesJson = await context.redis.get(`shapeshift_allguesses_${context.postId}`);
      return guessesJson ? JSON.parse(guessesJson) : [];
    });

    // Setup the web view with message handlers
    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'shape-shift.html',

      // Handle messages sent from the web view
      async onMessage(message, webView) {
        switch (message.type) {
          case 'webViewReady':
            // Send initial data to the web view
            webView.postMessage({
              type: 'initialData',
              data: {
                username,
                gameData,
                isRevealed,
                guessCount,
                postId: context.postId ?? '',
                isHub: isHubPost,
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
            
            // Create a new post for this game
            const gamePost = await context.reddit.submitPost({
              title: `Shape Shift Game - ${new Date().toLocaleString()}`,
              subredditName: await (await context.reddit.getCurrentSubreddit()).name,
              preview: (
                <vstack height="100%" width="100%" alignment="middle center">
                  <text size="large">Creating Shape Shift Game...</text>
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
              `shapeshift_data_${gamePost.id}`,
              JSON.stringify(shapeData)
            );
            
            // Notify the web view that the game was created
            webView.postMessage({
              type: 'gameCreated',
              data: {
                postId: gamePost.id,
                message: 'New Shape Shift game created!'
              }
            });
            
            // Navigate the user to the new post
            context.ui.showToast({ text: 'Shape Shift game created!' });
            context.ui.navigateTo(gamePost);
            break;
            
          case 'saveHiddenShape':
            // This is used for editing an existing game's shape data
            // Creator is saving the hidden shape coordinates and data
            await context.redis.set(
              `shapeshift_data_${context.postId}`,
              JSON.stringify(message.data)
            );
            context.ui.showToast({ text: 'Shape hidden successfully!' });
            break;
            
          case 'recordGuess':
            // Record a user's guess
            const userData = await context.redis.get(`shapeshift_user_${context.postId}_${username}`);
            
            // Check if user has already guessed
            if (userData) {
              webView.postMessage({
                type: 'guessResponse',
                data: {
                  success: false,
                  message: 'You have already made a guess on this post!'
                }
              });
              return;
            }

            // Save user's guess
            await context.redis.set(
              `shapeshift_user_${context.postId}_${username}`,
              JSON.stringify(message.data)
            );
            
            // Increment guess count
            const newCount = guessCount + 1;
            await context.redis.set(
              `shapeshift_guesscount_${context.postId}`,
              newCount.toString()
            );

            // Add user's guess to the list of all guesses for the heatmap
            const newGuess: HeatmapGuessData = {
              username,
              x: message.data.x,
              y: message.data.y,
              timestamp: Date.now()
            };
            
            // Store guesses as a JSON array in Redis
            const updatedGuesses = [...allGuesses, newGuess];
            setAllGuesses(updatedGuesses);
            
            // Save updated guesses list
            await context.redis.set(
              `shapeshift_allguesses_${context.postId}`,
              JSON.stringify(updatedGuesses)
            );

            // Now immediately show results to the user after guessing
            webView.postMessage({
              type: 'guessResponse',
              data: {
                success: true,
                message: 'Your guess has been recorded!',
                showResults: true,
                gameData: gameData,
                guesses: updatedGuesses
              }
            });
            break;
            
          case 'revealShape':
            // Trigger reveal of the hidden shape and show the heatmap
            await context.redis.set(
              `shapeshift_revealed_${context.postId}`,
              'true'
            );
            
            // Get all guesses for the heatmap
            const allGuessesForHeatmap = await context.redis.get(
              `shapeshift_allguesses_${context.postId}`
            );
            
            const guesses = allGuessesForHeatmap ? JSON.parse(allGuessesForHeatmap) : [];
            
            webView.postMessage({
              type: 'revealResults',
              data: {
                isRevealed: true,
                guesses
              }
            });
            break;
            
          default:
            // Use type assertion to handle unknown message type
            throw new Error(`Unknown message type: ${(message as WebViewMessage).type}`);
        }
      },
      onUnmount() {
        context.ui.showToast({ text: 'Shape Shift closed!' });
      },
    });

    // If this is a hub post for creating games
    if (isHubPost) {
      return (
        <vstack grow padding="small">
          <vstack grow alignment="middle center">
            <text size="xlarge" weight="bold">
              Shape Shift Hub
            </text>
            <text size="medium">
              Welcome to Shape Shift! Create a new game for others to play.
            </text>
            <spacer />
            <button onPress={() => webView.mount()}>Create New Game</button>
          </vstack>
        </vstack>
      );
    }
    // If we're showing a game post that someone else created
    else if (gameData && !isRevealed) {
      // Render the Shape Shift game in guess mode
      return (
        <vstack grow padding="small">
          <vstack grow alignment="middle center">
            <text size="xlarge" weight="bold">
              Shape Shift
            </text>
            <text size="medium">
              Find the hidden shape! One guess per user.
            </text>
            <spacer />
            <text size="medium">
              Guesses so far: {guessCount}
            </text>
            <spacer />
            <button onPress={() => webView.mount()}>Make Your Guess</button>
          </vstack>
        </vstack>
      );
    } else if (gameData && isRevealed) {
      // Render the revealed state
      return (
        <vstack grow padding="small">
          <vstack grow alignment="middle center">
            <text size="xlarge" weight="bold">
              Shape Shift - Revealed!
            </text>
            <text size="medium">
              The hidden shape has been revealed! Check out the results.
            </text>
            <spacer />
            <text size="medium">
              Total guesses: {guessCount}
            </text>
            <spacer />
            <button onPress={() => webView.mount()}>View Results</button>
          </vstack>
        </vstack>
      );
    } else {
      // Render the creator state for a new empty game post (shouldn't typically happen)
      return (
        <vstack grow padding="small">
          <vstack grow alignment="middle center">
            <text size="xlarge" weight="bold">
              Create a Shape Shift
            </text>
            <text size="medium">
              Hide a shape for others to find!
            </text>
            <spacer />
            <button onPress={() => webView.mount()}>Create Shape Shift</button>
          </vstack>
        </vstack>
      );
    }
  },
});

// Remove the old menu item that creates individual game posts - we'll now use the hub
export default Devvit;
