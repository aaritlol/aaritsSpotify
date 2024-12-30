import React, { useState, useEffect } from 'react';
import { setCookie, getCookie, eraseCookie } from './cookies';  // Import cookie functions
import { Navigate, useParams, useNavigate } from 'react-router-dom';

export default function AlbumDisplay() {
  const apiKey = 'AIzaSyDiS-hUEyJKKVWukuvYwpIGPmAC20yOVYA';
  const params = useParams()
  const navigate = useNavigate(); 
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [queue, setQueue] = useState([]);  // State for the queue
  const [handlePlay, setHandlePlay] = useState(null);
  const albumId = params.albumid;  // Get albumId from URL params
  console.log(albumId)
  const accessToken = params.accesstoken; // Get the access token from cookies or local storage
  console.log(accessToken)
  // Handle click for track
  const handleClick = async (trackName, artist, album, albumCoverUrl) => {
    console.log(trackName, artist, album);

    // Fetch YouTube video ID
    const videoId = await getVideoID(trackName, artist, album);
    console.log('Fetched Video ID:', videoId);

    // Add the clicked track and video ID to the queue along with the album cover
    const newQueue = [
      ...queue,
      { trackName, artist, album, videoId, albumCoverUrl }  // Add album cover URL here
    ];
    setQueue(newQueue);

    // Store the updated queue in cookies
    setCookie('queue', JSON.stringify(newQueue), 7);  // Save queue for 7 days
  };
  
  // Get video ID based on the track
  const getVideoID = async (trackName, artist, album) => {
    try {
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${trackName} ${artist} ${album} official song&key=${apiKey}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId; // Return the video ID
      } else {
        return ''; // If no video is found
      }
    } catch (error) {
      console.error('Error fetching YouTube video ID:', error);
      return ''; // Return empty string if there's an error
    }
  };
  
  useEffect(() => {
    // Check if albumId and accessToken are available
    console.log('Album ID:', albumId);
    console.log('Access Token:', accessToken);

    if (!albumId || !accessToken) {
      console.log('Missing albumId or accessToken. Exiting useEffect.');
      setError('Missing albumId or accessToken');
      setLoading(false);
      return;
    }

    const fetchAlbumData = async () => {
      try {
        console.log('Fetching album data for albumId:', albumId);

        const searchParameters = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        };

        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, searchParameters);
        const responseTracks = await fetch(
          `https://api.spotify.com/v1/albums/${albumId}/tracks`,
          searchParameters
        );

        console.log('Album response:', response);
        console.log('Tracks response:', responseTracks);

        if (!response.ok || !responseTracks.ok) {
          throw new Error('Failed to fetch album details');
        }

        const data = await response.json();
        const trackData = await responseTracks.json();
        setAlbumData(data);
        setTracks(trackData.items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching album data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId, accessToken]); // Dependency array to re-fetch when albumId or accessToken changes

  useEffect(() => {
    const savedQueue = getCookie('queue');
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));  // Parse the cookie value to an array
    }
  }, []);

  // Clear the queue
  const clearQueue = () => {
    setQueue([]);  // Clear the queue in state
    eraseCookie('queue');  // Remove the queue from cookies
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }
  if (handlePlay){
    return <Navigate to='/player'/>
  }
  return (
    <div>
      <h1>{albumData?.name}</h1>
      <img src={albumData?.images[1].url} alt={albumData?.name} />
      <p>Track List (add to queue)</p>

      <div>
        {tracks.map((track, index) => (
          <div key={index}>
            <button
              onClick={() =>
                handleClick(
                  track.name,
                  albumData.artists[0].name,
                  albumData.name,
                  albumData.images[0].url  // Pass the album cover URL here
                )
              }
            >
              {track.name}
              <br />
            </button>
          </div>
        ))}
      </div>

      <h3>Current Queue:</h3>
      <ul>
        {queue.length > 0 ? (
          queue.map((track, index) => (
            <li key={index}>
              {track.trackName} - {track.artist} - {track.album}
              <br />
              <img src={track.albumCoverUrl} alt={`${track.album} cover`} width="50" />
            </li>
          ))
        ) : (
          <li>No tracks in the queue</li>
        )}
      </ul>

      <button onClick={clearQueue}>Clear Queue</button>
      <button onClick={() => navigate('/player')}>Play Tracks</button>
    </div>
  );
}
