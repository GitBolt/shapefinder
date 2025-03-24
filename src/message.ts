// Shape data type definition
export type ShapeData = {
  shapeType: string;
  color: string;
  x: number;
  y: number;
  postId: string;
  gameId: string; // 4-digit game ID
  opacity?: number;
};

// Background shape for creating the crowded canvas
export type BackgroundShape = {
  shapeType: string;
  color: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: number;
};

// Canvas configuration for the Shape Seeker style game
export type CanvasConfig = {
  width: number;
  height: number;
  backgroundShapes: BackgroundShape[];
  targetShape: ShapeData;
};

// Guess data definition
export type GuessData = {
  x: number;
  y: number;
  secondsTaken?: number;
  isCorrect?: boolean;
};

// Combined guess data with user info for the heatmap
export type HeatmapGuessData = {
  username: string;
  x: number;
  y: number;
  timestamp: number;
  secondsTaken?: number;
  isCorrect?: boolean;
};

/** Message from Devvit to the web view. */
export type DevvitMessage =
  | { 
      type: 'initialData'; 
      data: { 
        username: string; 
        gameData: ShapeData | null;
        canvasConfig?: CanvasConfig;
        isRevealed: boolean;
        guessCount: number;
        postId: string;
        isHub: boolean;
        userGuess?: GuessData;
        stats?: {
          correctGuesses: number;
          totalGuesses: number;
          successRate: number;
        };
      }
    }
  | { 
      type: 'guessResponse'; 
      data: { 
        success: boolean; 
        message: string;
        isCorrect?: boolean;
        // Optional fields for immediate results
        showResults?: boolean;
        gameData?: ShapeData | null;
        guesses?: HeatmapGuessData[];
        userGuess?: GuessData;
      } 
    }
  | {
      type: 'revealResults';
      data: {
        isRevealed: boolean;
        guesses: HeatmapGuessData[];
        stats?: {
          correctGuesses: number;
          totalGuesses: number;
          successRate: number;
        };
        userGuess?: GuessData;
      }
    }
  | {
      type: 'gameCreated';
      data: {
        postId: string;
        message: string;
      }
    };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'createGamePost'; data: ShapeData; canvasConfig: CanvasConfig }
  | { type: 'recordGuess'; data: GuessData }
  | { type: 'revealShape' }
  | { type: 'refreshPost'; data: { postId: string } };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
  type?: 'devvit-message' | string;
};
