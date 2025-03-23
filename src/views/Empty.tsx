import { Devvit } from '@devvit/public-api';

/**
 * View for empty game posts (typically shouldn't happen)
 */
export function Empty() {
  return (
    <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">

      <text>Something went wrong</text>
    </vstack>
  );
} 