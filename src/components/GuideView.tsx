import { Devvit } from '@devvit/public-api';

interface GuideViewProps {
  onBack: () => void;
}

export function GuideView({ onBack }: GuideViewProps) {
  return (
    <vstack grow alignment="middle center" padding='medium'>
      <vstack
        backgroundColor="#4985ff"
        padding="medium"
        cornerRadius="large"
        width="100%"
        gap="small"
      >
        <hstack alignment="center middle" width="100%">
          <text size="xxlarge" weight="bold" color="white">How to Play</text>
          <spacer grow />
          <button
            appearance="secondary"
            size="medium"
            onPress={onBack}
          >
            Back
          </button>
        </hstack>

        <vstack gap="medium" padding="small">
          <vstack
            backgroundColor="#e6f7ff"
            padding="medium"
            cornerRadius="medium"
            width="100%"
          >
            <text size="medium" weight="bold" color="#0077cc" alignment="start" width="100%" wrap>
              1. Create a Game
            </text>
            <text size="small" color="#1d7aff" alignment="start" width="100%" wrap>
              Click "Create Game" in the menu to design your own challenge by placing a hidden shape on the canvas.
            </text>
          </vstack>
          
          <vstack
            backgroundColor="#e6fff0"
            padding="medium"
            cornerRadius="medium"
            width="100%"
          >
            <text size="medium" weight="bold" color="#00875a" alignment="start" width="100%" wrap>
              2. Share with Friends
            </text>
            <text size="small" color="#029413" alignment="start" width="100%" wrap>
              Others (or your friends!) can try finding the shape you hid in the canvas.
            </text>
          </vstack>
          
          <vstack
            backgroundColor="#fff2e6"
            padding="medium"
            cornerRadius="medium"
            width="100%"
          >
            <text size="medium" weight="bold" color="#cb940c" alignment="start" width="100%" wrap>
              3. Find the Shape
            </text>
            <text size="small" color="#c68500" alignment="start" width="100%" wrap>
              When playing, click anywhere on the canvas where you think the shape is hidden. You get one guess per game!
            </text>
          </vstack>
          
          <vstack
            backgroundColor="#ffebfd"
            padding="medium"
            cornerRadius="medium"
            width="100%"
          >
            <text size="medium" weight="bold" color="#a900b9" alignment="start" width="100%" wrap>
              4. See Results
            </text>
            <text size="small" color="#c100a2" alignment="start" width="100%" wrap>
              You'll see how close you were and whether you found the shape.
            </text>
          </vstack>
        </vstack>
      </vstack>
    </vstack>
  );
} 