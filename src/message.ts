// Shape data type definition
export type ShapeData = {
  shapeType: string;
  color: string;
  x: number;
  y: number;
  postId: string;
};

// Guess data definition
export type GuessData = {
  x: number;
  y: number;
};

// Combined guess data with user info for the heatmap
export type HeatmapGuessData = {
  username: string;
  x: number;
  y: number;
  timestamp: number;
};

/** Message from Devvit to the web view. */
export type DevvitMessage =
  | { 
      type: 'initialData'; 
      data: { 
        username: string; 
        gameData: ShapeData | null;
        isRevealed: boolean;
        guessCount: number;
        postId: string;
        isHub?: boolean;
      }
    }
  | { 
      type: 'guessResponse'; 
      data: { 
        success: boolean; 
        message: string;
        // Optional fields for immediate results
        showResults?: boolean;
        gameData?: ShapeData | null;
        guesses?: HeatmapGuessData[];
      } 
    }
  | {
      type: 'revealResults';
      data: {
        isRevealed: boolean;
        guesses: HeatmapGuessData[];
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
  | { type: 'saveHiddenShape'; data: ShapeData }
  | { type: 'recordGuess'; data: GuessData }
  | { type: 'revealShape' }
  | { type: 'createGamePost'; data: ShapeData };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
  type?: 'devvit-message' | string;
};
