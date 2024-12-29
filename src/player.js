import React, { useState, useRef, useEffect } from 'react';
import { Navigate} from 'react-router-dom'
import { StyleShee, View} from 'react'
import { useParams } from 'react-router-dom';
import YouTubePlayer from './YoutubePlayer';
import PlayButton from './PlayButton';
import Seekbar from './PlayerSeek.js'
import vinyl from './vinyl image.png';
import './spin.css'
import vinyl2 from './vinylimage.png'

export default function Player() {
  const [player, setPlayer] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [home, handleHome] = useState(false);

  const [newName, setNewName] = useState('')
  const params = useParams();
  const name = params.songName;
  const album = params.albumName;
  const artist = params.artistName;
  const albumImage = decodeURIComponent(params.albumCoverUrl);
  const apiKey = 'AIzaSyDiS-hUEyJKKVWukuvYwpIGPmAC20yOVYA'; // Your API Key
  const link = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${name} ${artist} ${album} official song&key=${apiKey}`;

  // Use All Origins proxy to bypass CORS
  const allOriginsUrl = 'https://api.allorigins.win/raw?url=';

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetching video data through All Origins proxy to avoid CORS issues
    const fetchWithAllOrigins = async () => {
      try {
        const response = await fetch(allOriginsUrl + encodeURIComponent(link));
        const data = await response.json();
        console.log('API Response:', data);  // Log the API response
        if (data.items && data.items.length > 0) {
          setVideoId(data.items[0].id.videoId); // Set videoId from first item
        } else {
          setError('No video found');  // If no video found, set error
        }
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
        console.error('API Error:', err);
      }
    };

    fetchWithAllOrigins(); // Call the function to fetch data
  }, [params]);
  if (home){
    return <Navigate to='/'></Navigate>
  } 
  console.log(videoId)

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        flex: 1,            // Takes up available space
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}>
        <img src={albumImage} className="albumCover" alt="Album Cover" />
        <div className="spin">
          <div className="spinText">
            <p>{name}</p><br />
            <p>{artist}</p>
          </div>
        </div>
      </div>
  
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{
      position: 'absolute',    // Position the bottom section at the bottom of the screen
      bottom: '20px',          // Add some padding from the bottom
      left: '50%',             // Center horizontally
      transform: 'translateX(-50%)',  // Offset by 50% of its own width
      width: '100%',           // Ensure it spans the full width
      zIndex: 100,
      textAlign: 'center',     // Center the content (Play button, Seekbar)
    }}>
      {videoId && (
        <>
          {console.log(videoId)}
          <YouTubePlayer videoId={videoId} setPlayer={setPlayer} />
          {player && <PlayButton className='playButton'player={player} />}
          {player && <Seekbar player={player} />}
        </>
      )}
    </div>
  </main>
  )
  
  

}
