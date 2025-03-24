import { Devvit } from '@devvit/public-api';
import type { ShapeData, CanvasConfig, BackgroundShape } from '../message.js';

type PlayGameProps = {
  gameData: ShapeData;
  canvasConfig: CanvasConfig;
  guessCount: number;
  successRate: number;
  webView: any;
};

/**
 * Creates an SVG representation of background shapes
 */
function createBackgroundShapesSVG(backgroundShapes: BackgroundShape[], svgWidth: number, svgHeight: number, canvasWidth: number, canvasHeight: number) {
  return backgroundShapes.slice(0, 40).map((shape, index) => {
    const x = Math.round((shape.x / canvasWidth) * svgWidth);
    const y = Math.round((shape.y / canvasHeight) * svgHeight);
    const size = Math.round((shape.size / canvasWidth) * svgWidth);

    let shapeElement = '';

    if (shape.shapeType === 'circle') {
      shapeElement = `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${shape.color}" opacity="${shape.opacity * 0.5}" />`;
    } else if (shape.shapeType === 'square') {
      shapeElement = `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${shape.color}" opacity="${shape.opacity * 0.5}" />`;
    } else if (shape.shapeType === 'triangle') {
      const h = size * 0.866; // height of equilateral triangle
      const points = `${x},${y - h / 2} ${x + size / 2},${y + h / 2} ${x - size / 2},${y + h / 2}`;
      shapeElement = `<polygon points="${points}" fill="${shape.color}" opacity="${shape.opacity * 0.5}" />`;
    } else if (shape.shapeType === 'star') {
      // Simple 5-point star
      const outerRadius = size / 2;
      const innerRadius = outerRadius * 0.4;
      let points = '';
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = Math.PI * i / 5;
        points += `${x + radius * Math.sin(angle)},${y - radius * Math.cos(angle)} `;
      }
      shapeElement = `<polygon points="${points}" fill="${shape.color}" opacity="${shape.opacity * 0.5}" />`;
    }

    return shapeElement;
  }).join('');
}


export function Start({
  gameData,
  canvasConfig,
  guessCount,
  successRate,
  webView
}: PlayGameProps) {
  // Create blurred background shapes SVG
  const svgWidth = 270;
  const svgHeight = 270;

  // Generate grid lines for SVG
  let gridLines = '';
  for (let i = 0; i < 10; i++) {
    const pos = (i * svgWidth / 10);
    gridLines += `<line x1="${pos}" y1="0" x2="${pos}" y2="${svgHeight}" stroke="#e2e8f0" stroke-width="0.5" opacity="0.5" />`;
    gridLines += `<line x1="0" y1="${pos}" x2="${svgWidth}" y2="${pos}" stroke="#e2e8f0" stroke-width="0.5" opacity="0.5" />`;
  }

  // Generate background shapes SVG
  let backgroundShapesSvg = '';
  if (canvasConfig && canvasConfig.backgroundShapes) {
    backgroundShapesSvg = createBackgroundShapesSVG(
      canvasConfig.backgroundShapes,
      svgWidth,
      svgHeight,
      canvasConfig.width,
      canvasConfig.height
    );
  }

  // Create blurred SVG with background shapes
  const blurredSvgString = `
    <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <filter id="blur" x="-90%" y="-90%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="#f5f8fa" />
      
      <!-- Grid lines -->
      <line x1="${svgWidth / 2}" y1="0" x2="${svgWidth / 2}" y2="${svgHeight}" stroke="#e2e8f0" stroke-width="1" />
      <line x1="0" y1="${svgHeight / 2}" x2="${svgWidth}" y2="${svgHeight / 2}" stroke="#e2e8f0" stroke-width="1" />
      
      <!-- Fine grid lines -->
      ${gridLines}
      
      <!-- Background shapes with blur -->
      <g filter="url(#blur)">
        ${backgroundShapesSvg}
      </g>
    </svg>
  `;

  // Convert SVG to data URI
  const blurredSvgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(blurredSvgString)}`;

  return (
    <zstack width="100%" height="100%" alignment="middle center" grow cornerRadius="large">
      {/* Blurred game preview as background */}
      <image
        url={blurredSvgDataUri}
        imageWidth={Math.max(400, svgWidth * 3)}
        imageHeight={Math.max(400, svgHeight * 3)}
        description="Blurred preview of game board with shapes"
      />

      {/* Content section */}
      <vstack
        padding="large"
        gap="medium"
        alignment="middle center"
        width="100%"
      >
        <vstack
          backgroundColor="rgb(255, 255, 255)"
          padding="large"
          cornerRadius="large"
          width="90%"
          alignment="middle center"
          gap="small"
        >
          <text size="xxlarge" weight="bold" color="#1a365d" width="100%" wrap alignment='middle center'>
            Where's the{" "}
            {gameData.color.charAt(0).toUpperCase() + gameData.color.slice(1)}{" "}
            {gameData.shapeType.charAt(0).toUpperCase() + gameData.shapeType.slice(1)}?
          </text>
          
          {/* Display game ID */}
          <hstack
            backgroundColor="#f0f8ff"
            padding="small"
            cornerRadius="medium"
            alignment="center middle"
          >
            <text size="large" weight="bold" color="#3e6b9d">Game ID:</text>
            <spacer size="small" />
            <text size="xlarge" weight="bold" color="#1e4b8a">{gameData.gameId || '----'}</text>
          </hstack>
        </vstack>

        <hstack gap="medium" alignment="center middle" width="90%">
          <vstack
            backgroundColor="rgb(0, 132, 219, 0.7)"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#ffffff">
              {guessCount}
            </text>
            <text size="small" color="#c7e0ff">Guesses</text>
          </vstack>

          <vstack
            backgroundColor="rgb(27, 163, 0, 0.7)"
            padding="medium"
            cornerRadius="medium"
            grow
          >
            <text size="xlarge" weight="bold" color="#ffffff">
              {successRate}%
            </text>
            <text size="small" color="#b8f0d4">Success Rate</text>
          </vstack>
        </hstack>

        <vstack
          padding="large"
          width="100%"
          gap="large"
        >

          <text size="xlarge" color="#4a5568" alignment="middle center" width="100%" wrap weight="bold">
            Click the button below to find the hidden shape among many others!
          </text>

          <vstack alignment="middle center" gap="medium">
            <button
              width="90%"
              appearance="primary"
              onPress={() => webView.mount()}
              icon="play-fill"
              size="large"
              grow
            >
              Start Game
            </button>
          </vstack>

        </vstack>
      </vstack>
    </zstack>
  );
} 