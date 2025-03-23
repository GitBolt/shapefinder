import { Devvit } from '@devvit/public-api';


type LoadingScreenProps = {
  text?: string;
}

export const LoadingScreen = (
  { text = "Loading..." }: LoadingScreenProps
) => {
  return (
    <vstack height="100%" width="100%" alignment="middle center" backgroundColor="white">

      <image
        url="loading.gif"
        imageWidth="200px"
        imageHeight="100px"
        description="Loading..."
      />
      <spacer size="large" />
      <text size="xxlarge" weight="bold" color="#5eb3ff">{text}</text>

    </vstack>
  );
}; 