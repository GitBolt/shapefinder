import { Devvit } from '@devvit/public-api';

type EmptyGameViewProps = {
  webView: any;
};

/**
 * View for empty game posts (typically shouldn't happen)
 */
export function EmptyGameView({ webView }: EmptyGameViewProps) {
  return (
    <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">

      <text>Something went wrong</text>
    </vstack>
  );
} 