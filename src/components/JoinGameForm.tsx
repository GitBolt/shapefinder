import { Context, Devvit, useForm } from '@devvit/public-api';

type JoinGameFormProps = {
  onClose: () => void;
  onJoinGame: (gameId: string) => Promise<void>;
  context: Context;
};

export function JoinGameForm({ onClose, onJoinGame, context }: JoinGameFormProps) {
  // Create a form for entering game ID
  const gameIdForm = useForm(
    {
      title: 'Enter Game ID',
      acceptLabel: 'Join Game',
      cancelLabel: 'Cancel',
      fields: [
        {
          type: 'string',
          name: 'gameId',
          label: 'Game ID (4 digits)',
          placeholder: '0000',
          required: true,
          validations: [
            {
              validation: 'regex',
              value: '^[0-9]{4}$',
              errorMessage: 'Please enter exactly 4 digits'
            }
          ]
        }
      ]
    },
    async (values) => {
      const gameId = values.gameId as string;
      await onJoinGame(gameId);
    }
  );

  return (
    <vstack 
      backgroundColor="white" 
      width="100%" 
      cornerRadius="large" 
      padding="large" 
      gap="medium"
    >
      <hstack width="100%" alignment="center middle">
        <text size="xlarge" weight="bold" color="#1a365d">Join Game by ID</text>
        <spacer grow />
        <button 
          appearance="secondary"
          size="small"
          onPress={onClose}
        >
          Close
        </button>
      </hstack>

      <text color="#4a5568" alignment="center">
        Enter a 4-digit game ID to join an existing game.
      </text>

      <button
        appearance="primary"
        onPress={() => context.ui.showForm(gameIdForm)}
        width="100%"
        icon="search"
      >
        Enter Game ID
      </button>
    </vstack>
  );
} 