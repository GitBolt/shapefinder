import { Devvit } from '@devvit/public-api';
import { LoadingScreen } from './components/LoadingScreen.js';

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
      preview: <LoadingScreen text='Loading Hub...' />,
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
