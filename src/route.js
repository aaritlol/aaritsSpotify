import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { setCookie, getCookie, eraseCookie } from './cookies'; // Import cookie functions
import PaginationComponent from './Pagination.js';

const CLIENT_ID = '3b24104afd7e46969fa755cef7084b19';
const CLIENT_SECRET = '7902f8a7708747e6a3420e92276ac405';

function Routing() {
  const [clickedOnAlbum, setClickedOnAlbum] = useState(null);
  const navigate = useNavigate();
  const [goToAlbums, setGoToAlbums] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(8);
  const [searchInput, setSearchInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [albums, setAlbums] = useState([]);
  const [queue, setQueue] = useState([]); // State for the queue
  const [tokenExpiry, setTokenExpiry] = useState(0);

  useEffect(() => {
    // Fetch the access token on component mount
    fetchAccessToken();
  }, []);

  // Function to fetch access token from Spotify
  const fetchAccessToken = async () => {
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', authParameters);
      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.access_token);
        setTokenExpiry(Date.now() + 3600 * 1000); // Set token expiry (1 hour)
        console.log('Access token fetched:', data.access_token);
      } else {
        console.error('Failed to fetch access token:', data);
      }
    } catch (err) {
      console.error('Error fetching access token:', err);
    }
  };

  // Function to check if the token is expired
  const isTokenExpired = () => Date.now() > tokenExpiry;

  // Fetch albums based on search input
  async function search() {
    if (!accessToken || isTokenExpired()) {
      console.log('Token expired or invalid, fetching new token...');
      fetchAccessToken(); // Refresh token if expired
      return;
    }

    console.log('Search for ' + searchInput);

    const searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Properly format the Authorization header
      },
    };

    try {
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
        searchParameters
      );
      const artistData = await artistResponse.json();
      console.log('Artist search response:', artistData);

      if (artistResponse.ok && artistData.artists.items.length > 0) {
        const artistId = artistData.artists.items[0].id;
        console.log('Artist ID:', artistId);

        // Fetching albums
        const albumResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=US&limit=50`,
          searchParameters
        );
        const albumData = await albumResponse.json();
        console.log('Albums response:', albumData);

        if (albumResponse.ok) {
          setAlbums(albumData.items);
        } else {
          console.error('Failed to fetch albums:', albumData);
        }
      } else {
        console.error('Failed to find artist:', artistData);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  }

  // Get the queue from cookies
  useEffect(() => {
    const savedQueue = getCookie('queue');
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue)); // Parse the cookie value to an array
    }
  }, []);

  // Function to clear the queue
  const clearQueue = () => {
    setQueue([]); // Clear the queue in state
    eraseCookie('queue'); // Remove the queue from cookies
  };

  // Pagination logic
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = albums.slice(firstPostIndex, lastPostIndex);

  if (clickedOnAlbum != null) {
    console.log(clickedOnAlbum);
    return <Navigate to={'/album/' + clickedOnAlbum + '/' + accessToken} />;
  }

  return (
    <div className="App">
      <div>
        <h1>Aarits Spotify</h1>
      </div>

      {/* Search Bar */}
      <Container>
        <InputGroup name="mb-3" size="lg">
          <FormControl
            placeholder="Search for artist"
            type="input"
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      {/* Display Queue Below the Search Bar */}
      <Container>
        <h3>Current Queue:</h3>
        <ul>
          {queue.length > 0 ? (
            queue.map((track, index) => (
              <li key={index}>
                {track.trackName} - {track.artist} - {track.album}
                <br />
              </li>
            ))
          ) : (
            <li>No tracks in the queue</li>
          )}
        </ul>

        {/* Clear Queue Button */}
        <Button onClick={clearQueue}>Clear Queue</Button>
        <Button onClick={() =>navigate('/player')}>
        Play! 
        </Button>
      </Container>

      {/* Albums Display */}
      <Container>
        <Row className="g-3">
          {currentPosts.map((currentPost) => {
            return (
              <Card className="col-12 col-md-6 col-lg-3" key={currentPost.id}>
                <button
                  className="ohio"
                  onClick={() => setClickedOnAlbum(currentPost.id)}
                >
                  <Card.Img src={currentPost.images[0].url} />
                </button>
                <Card.Body>
                  <Card.Title>{currentPost.name}</Card.Title>
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>

      {/* Pagination */}
      <PaginationComponent
        totalPosts={albums.length}
        postsPerPage={postsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default Routing;
