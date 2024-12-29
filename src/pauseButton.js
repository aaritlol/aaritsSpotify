import React from 'react';
import { useState } from'react';

const PauseButton = ({ player }) => {
  const handlePause = () => {
    if (player) {
      player.pauseVideo();
// Pauses the video when the button is clicked
    }
  };


  return (
    <button onClick={handlePause} style={{ padding: '10px 20px', fontSize: '16px' }}>
      Pause Video
    </button>
  );
};

export default PauseButton;
