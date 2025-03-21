import { Devvit } from '@devvit/public-api';

// Add a menu item to create the Hidden Shape game creator hub post
Devvit.addMenuItem({
  label: 'Create Hidden Shape Hub',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    // Create a new hub post (we'll implement the single hub post logic in main.tsx)
    const post = await reddit.submitPost({
      title: 'Hidden Shape Game Hub',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Creating Hidden Shape Hub...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Hidden Shape Hub Created!' });
    ui.navigateTo(post);
  },
});
