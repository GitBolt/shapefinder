import { Devvit } from '@devvit/public-api';
import type { Post } from '@devvit/public-api';

// Add a menu item to create the Shape Seeker game creator hub post
Devvit.addMenuItem({
  label: '🎮 Create Shape Seeker Hub',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const post = await reddit.submitPost({
      title: 'Shape Seeker Game Hub',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor="#f8f9ff" padding="large" cornerRadius="medium">
          <hstack alignment="middle center" gap="medium">
            <text size="xxlarge" weight="bold" color="#1a1a2e">Shape Seeker</text>
          </hstack>
          
          <spacer size="large" />
          
          <vstack 
            width="80%" 
            backgroundColor="#1a1a2e20" 
            padding="medium" 
            cornerRadius="medium" 
            alignment="middle center"
          >
            <text size="xlarge" weight="bold" color="#1a1a2e">Loading Game Hub...</text>
            <spacer size="medium" />
            <hstack gap="small">
              <vstack width="16px" height="16px" backgroundColor="#ff5252" cornerRadius="full" />
              <vstack width="16px" height="16px" backgroundColor="#4caf50" />
              <vstack width="16px" height="16px" backgroundColor="#2196f3" cornerRadius="full" />
              <vstack width="16px" height="16px" backgroundColor="#ffeb3b" />
            </hstack>
          </vstack>
          
          <spacer size="large" />
          
        </vstack>
      ),
    });

    try {
      await post.sticky();
      ui.showToast({ text: '🎮 Shape Seeker Hub Created and Stickied!' });
    } catch (error) {
      ui.showToast({ text: '🎮 Shape Seeker Hub Created! (Note: Unable to sticky)' });
    }

    ui.navigateTo(post);
  },
});
