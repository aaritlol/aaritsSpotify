import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from './cookies';
import YouTubePlayer from './YoutubePlayer';
import PlayButton from './PlayButton';
import Seekbar from './PlayerSeek.js';
import './spin.css';

export default function Player() {
  const params = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isSplit, setIsSplit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Store search results
  const albumImage = params.albumCover;

  const allOriginsUrl = 'https://api.allorigins.win/raw?url=';

  // Retrieve the queue from cookies on component mount
  useEffect(() => {
    const savedQueue = getCookie('queue');
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }
  }, []);

  const currentTrack = queue.length > 0 ? queue[0] : null;
  const albumCoverUrl = currentTrack ? currentTrack.albumCoverUrl : albumImage;

  // Fetch videoId for the current track
  useEffect(() => {
    if (currentTrack) {
      setLoading(true);
      setError(null);

      const apiKey = 'AIzaSyC_KS60oA2ULb7rQmHqOMF23DAl5cub_gY';  // Replaced API key here
      const link = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${currentTrack.trackName} ${currentTrack.artist} ${currentTrack.album} official song&key=${apiKey}`;

      const fetchWithAllOrigins = async () => {
        try {
          const response = await fetch(allOriginsUrl + encodeURIComponent(link));
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            setVideoId(data.items[0].id.videoId);
          } else {
            setError('No video found');
          }
          setLoading(false);
        } catch (err) {
          setError('Error fetching data');
          setLoading(false);
        }
      };

      fetchWithAllOrigins();
    }
  }, [currentTrack]);

  const skipTrack = () => {
    if (queue.length > 1) {
      const newQueue = [...queue];
      newQueue.shift();
      setQueue(newQueue);
    } else {
      setQueue([]);
    }
  };

  const onVideoEnd = () => {
    if (queue.length > 1) {
      const newQueue = [...queue];
      newQueue.shift();
      setQueue(newQueue);
    } else {
      setQueue([]);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    document.cookie = 'queue=; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Remove queue from cookies
  };

  // Remove a specific track from the queue
  const removeTrack = (trackIndex) => {
    const newQueue = queue.filter((_, index) => index !== trackIndex);
    setQueue(newQueue);
    document.cookie = `queue=${JSON.stringify(newQueue)}; path=/`; // Update cookies with the new queue
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // Handle the search functionality with Spotify API for album cover and YouTube search for videos
  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

    try {
      const authResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('3b24104afd7e46969fa755cef7084b19:7902f8a7708747e6a3420e92276ac405')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      if (!accessToken) {
        setError('Error authenticating with Spotify');
        return;
      }

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const searchData = await searchResponse.json();

      if (searchData.tracks.items.length > 0) {
        // Fetch YouTube videos for the top 5 Spotify tracks
        const youtubeApiKey = 'AIzaSyC_KS60oA2ULb7rQmHqOMF23DAl5cub_gY';  // Replaced API key here
        const youtubeResults = [];

        for (let track of searchData.tracks.items) {
          const youtubeLink = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${track.name} ${track.artists[0].name} official song&key=${youtubeApiKey}`;
          const youtubeResponse = await fetch(allOriginsUrl + encodeURIComponent(youtubeLink));
          const youtubeData = await youtubeResponse.json();

          if (youtubeData.items && youtubeData.items.length > 0) {
            youtubeResults.push({
              trackName: track.name,
              artist: track.artists[0].name,
              albumCoverUrl: track.album.images[1].url, // Medium size album cover
              videoId: youtubeData.items[0].id.videoId,
            });
          }
        }

        setSearchResults(youtubeResults); // Update the search results state
        setSearchQuery(""); // Clear the search input field
      } else {
        setError('No results found for the song');
      }
    } catch (err) {
      setError('Error fetching data from Spotify or YouTube');
    }
  };

  // Add the selected song to the queue
  const addToQueue = (selectedTrack) => {
    setQueue((prevQueue) => [...prevQueue, selectedTrack]);
    setSearchResults([]); // Clear search results after selection
  };

  // Function to remove features from track name if in non-split view
  const getTrackName = (trackName) => {
    if (!isSplit) {
      // Remove anything inside parentheses (i.e., featuring artists)
      return trackName.replace(/\s?\(.*\)/, '').trim();
    }
    return trackName;
  };

  return (
    <main>
      {/* Home Button */}
      <button onClick={() => navigate('/')}>Home</button>

      {/* Button to toggle split view */}
      <button onClick={() => setIsSplit(!isSplit)}>Queue</button>

      {/* Content Section */}
      <div
        style={{
          display: 'flex',
          height: '100%',
          flexDirection: isSplit ? 'row' : 'column',
          position: 'relative',
          flex: 1,
        }}
      >
        {/* Left side of the split: Controls and Player */}
        <div
          style={{
            width: isSplit ? '50%' : '100%',
            padding: '10px',
            textAlign: 'center',
            position: 'relative',
            flex: 1,
          }}
        >
          {currentTrack && albumCoverUrl && (
            <>
              {isSplit && (
                <div style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
                  <p>{getTrackName(currentTrack.trackName)}</p> {/* Apply the function to remove features in non-split view */}
                </div>
              )}
              <img
                src={albumCoverUrl}
                className={`albumCover ${isSplit ? 'splitView' : ''}`}
                alt="Album Cover"
                style={{ marginTop: isSplit ? '0px' : '0' }}
              />

              {!isSplit && (
                <div className="spin">
                  <div className="spinText">
                    <p>{getTrackName(currentTrack.trackName)}</p><br /> {/* Apply the function to remove features in non-split view */}
                    <p>{currentTrack.artist}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div
            style={{
              position: 'relative',
              flex: 1,
              textAlign: 'center',
              marginTop: isSplit ? '0px' : '0',
            }}
          >
            {videoId && (
              <YouTubePlayer videoId={videoId} setPlayer={setPlayer} onEnd={onVideoEnd} />
            )}
          </div>
        </div>

        {/* Right side of the split: Queue and Song Search */}
        <div
          style={{
            width: isSplit ? '50%' : '0%',
            padding: '10px',
            overflowY: 'auto',
            transition: 'all 0.3s ease',
            opacity: isSplit ? 1 : 0,
            pointerEvents: isSplit ? 'auto' : 'none',
          }}
        >
          <h3>Queue</h3>
          <ul>
            {queue.map((track, index) => (
              <li key={index}>
                {getTrackName(track.trackName)} - {track.artist} {/* Apply the function to remove features */}
                <button onClick={() => removeTrack(index)} style={{ color: 'red', marginLeft: '10px' }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button onClick={clearQueue} style={{ backgroundColor: 'red', color: 'white' }}>
            Clear Queue
          </button>

          <h3>Search for New Song</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a song..."
          />
          <button onClick={handleSearch}>Search</button>

          {/* Display search results */}
          {searchResults.length > 0 && (
            <div>
              <h4>Search Results:</h4>
              <ul>
                {searchResults.map((track, index) => (
                  <li key={index}>
                    <div>
                      <img src={track.albumCoverUrl} alt={track.trackName} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                      {getTrackName(track.trackName)} - {track.artist} {/* Apply the function to remove features */}
                      <button onClick={() => addToQueue(track)} style={{ marginLeft: '10px' }}>
                        Add to Queue
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Controls (Play, Skip, and Seekbar all pinned to the bottom) */}
      <div
        style={{
          position: 'absolute',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <button onClick={skipTrack}>Skip</button>
        {player && <PlayButton className="playButton" player={player} />}
      </div>

      {/* Seekbar */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          zIndex: 99,
        }}
      >
        {player && <Seekbar player={player} />}
      </div>
    </main>
  );
}
