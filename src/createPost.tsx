import { Devvit } from '@devvit/public-api';
import type { Post } from '@devvit/public-api';

// Add a menu item to create the Where's the Shape game creator hub post
Devvit.addMenuItem({
  label: '🎮 Create Where\'s the Shape? Hub',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const post = await reddit.submitPost({
      title: 'Where\'s the Shape? Game Hub',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor="#f8f9ff" padding="large" cornerRadius="large">

          <spacer size="medium" />

          <text size="xlarge" weight="bold" color="#1a1a2e">
            Creating Where's the Shape? Hub...
          </text>
          <spacer size="large" />

        </vstack>
      ),
    });

    try {
      await post.sticky();
      ui.showToast({ text: '🎮 Where\'s the Shape? Hub Created and Stickied!' });
    } catch (error) {
      ui.showToast({ text: '🎮 Where\'s the Shape? Hub Created! (Note: Unable to sticky)' });
    }

    ui.navigateTo(post);
  },
});
