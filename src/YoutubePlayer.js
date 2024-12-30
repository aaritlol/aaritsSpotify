import React, { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, setPlayer, width = '0', height = '0' }) => {
  const playerRef = useRef(null);  // Ref to store player instance
  const scriptLoaded = useRef(false);  // To track script loading status

  useEffect(() => {
    // Load YouTube API script if it doesn't already exist
    if (!window.YT && !scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);

      script.onload = () => {
        scriptLoaded.current = true;
      };
    }

    const onYouTubeIframeAPIReady = () => {
      if (playerRef.current && !playerRef.current.player) {
        const player = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          width: width,
          height: height,
          events: {
            onReady: (event) => {
              setPlayer(event.target);  // Pass player instance back to the parent
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                console.log('Video has ended');
              }
            },
          },
        });
      }
    };

    // Initialize player when the API is ready
    if (window.YT) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    // Cleanup player on unmount
    return () => {
      if (playerRef.current && playerRef.current.player) {
        playerRef.current.player.destroy(); // Destroy player instance
      }
    };
  }, [videoId, setPlayer, width, height]);  // Dependencies to re-create the player when videoId changes

  useEffect(() => {
    if (playerRef.current && playerRef.current.player && videoId) {
      playerRef.current.player.loadVideoById(videoId);  // Load new video when videoId changes
    }
  }, [videoId]);

  return <div ref={playerRef} id="youtube-player" style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default YouTubePlayer;
