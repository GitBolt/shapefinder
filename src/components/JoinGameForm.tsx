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
        <vstack grow alignment="middle center" padding='medium'>

            <vstack
                backgroundColor="#4985ff"
                padding="medium"
                cornerRadius="large"
                width="100%"
                gap="small"
                alignment='center middle'
            >
                <hstack width="100%" alignment="center middle">
                    <text size="xxlarge" weight="bold" color="white">Join Game by ID</text>
                    <spacer grow />
                    <button
                        appearance="secondary"
                        size="large"
                        onPress={onClose}
                    >
                        Close
                    </button>
                </hstack>

                <text color="white" alignment="center" size="large">
                    Enter a 4-digit game ID to join an existing game.
                </text>
                <spacer size="large" />
                <button
                    appearance="primary"
                    onPress={() => context.ui.showForm(gameIdForm)}
                    width="80%"
                    height="40px"
                    icon="search"

                >
                    Enter Game ID
                </button>
            </vstack>
        </vstack>
    );
} 