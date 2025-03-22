import { UIClient, Devvit } from '@devvit/public-api';

/**
 * HubView component for the game creator hub post
 */
export function HubView({ webView, context }: { webView: any, context: { ui: UIClient } }) {
  return (
    <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
      <vstack grow alignment="middle center">
        {/* Logo and Title */}
        <image 
          url="https://i.imgur.com/wqtUCyq.png"
          imageWidth={320}
          imageHeight={110}
        />
        
        <text size="xxlarge" weight="bold" color="#1a1a2e">
          Where's the Shape?
        </text>
        
        <text size="large" color="#455a64" alignment="middle center">
          A fun game of finding hidden shapes among many others
        </text>
        
        <spacer size="large" />
        
        {/* Action Buttons */}
        <hstack gap="medium">
          <button 
            appearance="primary"
            onPress={() => webView.mount()}
          >
            Create Game
          </button>
          <button 
            appearance="secondary"
            onPress={() => context.ui.showToast({ text: 'Coming soon: Game History!' })}
          >
            Game Stats
          </button>
        </hstack>
        
        <spacer size="large" />
        
        {/* Description Box */}
        <vstack 
          backgroundColor="rgba(59, 130, 246, 0.05)"
          padding="medium"
          cornerRadius="medium"
          width="80%"
        >
          <text 
            size="small" 
            color="#64748b"
            alignment="middle center"
          >
            Create a new game by hiding a shape among many others, then share it with friends to see if they can find it!
          </text>
        </vstack>
      </vstack>
    </vstack>
  );
} 