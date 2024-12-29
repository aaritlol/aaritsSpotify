import React from 'react';
import pause from './pause.png'
import play from './play.png'
import {useState} from 'react'
export default function PlayButton({ player }) {
  const [buttonClicked, setButtonClicked] = useState(0)
  const [shouldPlay, setShouldPlay] = useState(true)
  const handlePlayPause = () => {
    setButtonClicked(buttonClicked + 1);
    if (buttonClicked%2 === 0 && buttonClicked != 1) {
        player.pauseVideo();
        setShouldPlay(true)
      } else {
        player.playVideo();
        setShouldPlay(false)
      }
    }

  return (
    <button onClick={handlePlayPause} style={{ marginTop: '20px' }}>
      {player && shouldPlay == false ? <img src={pause} style={{width:'40px',height:'40px'}}></img> : <img src={play} style={{width:'40px',height:'40px'}}></img>}
    </button>
  );
}
