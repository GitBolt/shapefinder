import { Devvit } from '@devvit/public-api';
import type { Post } from '@devvit/public-api';

// Add a menu item to create the Hidden Shape game creator hub post
Devvit.addMenuItem({
  label: '🎮 Create Where\'s the Shape? Hub',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    // Create a new hub post (we'll check for existing ones in the custom post renderer)
    const post = await reddit.submitPost({
      title: 'Hidden Shape Game Hub',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor="#f8f9ff" padding="large" cornerRadius="large">
          <image 
            url="https://i.imgur.com/wqtUCyq.png"
            imageWidth={320}
            imageHeight={110}
          />
          <spacer size="medium" />
          <text size="xxlarge" weight="bold" color="#1a1a2e">
            Creating Where's the Shape? Hub...
          </text>
          <text size="medium" color="#455a64" alignment="middle center">
            Setting up your game center...
          </text>
          
          <spacer size="large" />
          
          <vstack 
            backgroundColor="rgba(59, 130, 246, 0.05)"
            padding="medium"
            cornerRadius="medium"
            width="80%"
          >
            <text size="small" color="#64748b" alignment="middle center">
              This will create a central hub where users can create and play shape-finding games!
            </text>
          </vstack>
        </vstack>
      ),
    });
    
    // Sticky the post if possible (requires mod permission)
    try {
      await post.sticky();
      ui.showToast({ text: '🎮 Where\'s the Shape? Hub Created and Stickied!' });
    } catch (error) {
      ui.showToast({ text: '🎮 Where\'s the Shape? Hub Created! (Note: Unable to sticky)' });
    }
    
    ui.navigateTo(post);
  },
});
