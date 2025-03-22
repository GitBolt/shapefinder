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
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor="#f7f9fc" padding="large" cornerRadius="large">
          <image 
            url="https://i.imgur.com/wqtUCyq.png"
            imageWidth={300}
            imageHeight={100}
          />
          <spacer size="medium" />
          <text size="xlarge" weight="bold" color="#1a1a2e">Creating Where's the Shape? Hub...</text>
          <text size="medium" color="#455a64">Setting up your game center...</text>
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
