import React, { useEffect } from 'react';

const YouTubePlayer = ({ videoId, setPlayer, width = '0', height = '0' }) => {
  useEffect(() => {
    // Load the YouTube API script if it doesn't already exist
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player('youtube-player', {
          videoId: videoId,
          width: width, // Set the width here
          height: height, // Set the height here
          events: {
            onReady: (event) => {
              setPlayer(event.target); // Pass player instance to the parent component
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                console.log('Video has ended');
              }
            },
          },
        });
      };
    }
  }, [videoId, setPlayer, width, height]);

  return <div id="youtube-player" style={{ width: `${width}px`, height: `${height}px` }}></div>;
};

export default YouTubePlayer;
