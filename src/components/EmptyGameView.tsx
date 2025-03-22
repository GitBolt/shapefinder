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