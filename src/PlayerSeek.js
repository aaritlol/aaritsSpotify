import React, { useState, useEffect } from 'react';

export default function Seekbar({ player }) {
  const [currentTime, setCurrentTime] = useState(0); // The current time of the video
  const [duration, setDuration] = useState(0); // The duration of the video
  const [isDragging, setIsDragging] = useState(false); // Whether the user is dragging the seekbar

  // Update the current time when the player state changes
  useEffect(() => {
    if (player) {
      const updateSeekbar = () => {
        if (!isDragging) {
          setCurrentTime(player.getCurrentTime());
          setDuration(player.getDuration());
        }
      };

      // Polling the player for time updates
      const interval = setInterval(updateSeekbar, 100);

      return () => clearInterval(interval); // Clean up the interval on unmount or changes
    }
  }, [player, isDragging]);

  // Handle seekbar change
  const handleSeekbarChange = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    if (player) {
      player.seekTo(newTime, true); // Seek to the new time
    }
  };

  // Handle when the user starts dragging the seekbar
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  // Handle when the user releases the seekbar
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ width: '60%', margin: '20px auto' }}>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeekbarChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          width: '100%',
          height: '8px',
          background: '#000', // Default background color
          borderRadius: '5px',
        }}
      />
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#555' }}>
        {Math.floor(currentTime)} / {Math.floor(duration)} seconds
      </div>
    </div>
  );
}
