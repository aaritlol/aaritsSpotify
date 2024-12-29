import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import './App.css'


export default function AlbumDisplay() {
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backButton, setBackButton] = useState();
  const [tracks, setTracks ] = useState([]);


  // Get album ID and access token from URL params
  const params = useParams()
  const albumid = params.albumid
  const accesstoken = params.accesstoken
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        if (!accesstoken) {
          throw new Error('No access token provided');
        }

        const searchParameters = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accesstoken}`, // Send the access token in Authorization header
          },
        };

        const response = await fetch(`https://api.spotify.com/v1/albums/${albumid}`, searchParameters);
        const responseTracks = await fetch(`https://api.spotify.com/v1/albums/${albumid}` + '/tracks', searchParameters);

        // Check for 401 Unauthorized error
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired access token');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch album details');
        }

        const data = await response.json();
        const trackData = await responseTracks.json();
        setAlbumData(data);  // Set album data to state
        //setTracks(albumData.tracks.items.name)
        setTracks(trackData)
        setLoading(false);    // Set loading to false when done
      } catch (error) {
        setError(error.message); // Handle errors
        setLoading(false);       // Stop loading if error

      }
    };

    fetchAlbumData();
  }, [albumid, accesstoken]); // Run effect when albumid or access_token changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }
  if (backButton){
    return(
      <Navigate to={'/'}/>
    ) 
  };
  
  console.log(albumData)
  console.log(tracks)
  const encodedCoverUrl = encodeURIComponent(albumData.images[0].url);
  
  return (
    <div className="about">
      <button className='ohio'onClick={() => setBackButton(true)}>     Back     </button>  
      <br></br>
      <img src={albumData.images[1].url}></img>
      <h1>{albumData.name}</h1>
      <h2>{albumData.artists[0].name}</h2>
      {console.log(albumData.artists[0].name)}
      <p>Track List</p>
      {tracks.items.map((track, index) => (
        <Link to={`/player/${track.name}/${albumData.name}/${albumData.artists[0].name}/${encodedCoverUrl}`}>
        <div key={index}>
          <li>{track.name}</li>
          
        </div>
        </Link>
      ))}




    </div>
  );
}
/*      <h2>Album Details</h2>
      <p>Album ID: {albumid}</p>
      <p>Album Name: {albumData.name}</p>
      <p>Release Date: {albumData.release_date}</p>
      <p>Total Tracks: {albumData.total_tracks}</p>*/