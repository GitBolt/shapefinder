import { Devvit } from '@devvit/public-api';

/**
 * View for empty game posts (typically shouldn't happen)
 */
export function Empty() {
  return (
    <vstack grow padding="large" cornerRadius="large" backgroundColor="#f8f9ff">
      <spacer size="large" />
      
      <vstack 
        backgroundColor="white" 
        padding="large" 
        cornerRadius="medium" 
        width="100%" 
        alignment="middle center"
        borderColor="#e2e8f0"
      >
        <vstack 
          width="64px" 
          height="64px" 
          backgroundColor="#fed7d7" 
          cornerRadius="full" 
          alignment="middle center"
        >
          <text size="xxlarge" color="#e53e3e">!</text>
        </vstack>
        
        <spacer size="medium" />
        
        <text size="xlarge" weight="bold" color="#1a365d">Something went wrong</text>
        <spacer size="small" />
        <text color="#4a5568" alignment="middle center" width="100%" wrap>
          The game data couldn't be loaded. Please try refreshing the page or contact the game creator.
        </text>
        
  
      </vstack>
      
      <spacer grow />
    </vstack>
  );
} 