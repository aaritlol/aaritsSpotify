import ReactDom from 'react-dom';
import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useContext } from 'react'
import { Navigate} from 'react-router-dom'
import { useState, useEffect} from 'react';
import PaginationComponent from './Pagination.js';
const CLIENT_ID = '3b24104afd7e46969fa755cef7084b19';
const CLIENT_SECRET = 'c7e580dcd8bf41739f8bb05a1b80f0c2';
const Buttons = document.getElementById('myButton')

function Routing() {


const [clickedOnAlbum, setClickedOnAlbum] = useState(null) 
const [goToAlbums, setGoToAlbums] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [postsPerPage, setPostsPerPage] = useState(8);
const [ searchInput, setSearchInput] = useState("");
const [ accessToken, setAccessToken] = useState("");
const [albums, setAlbums ] = useState([]);
let albumNumber = [];

useEffect(() => {
  var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body:'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
  }
  fetch('https://accounts.spotify.com/api/token', authParameters)
    .then(result => result.json())
    .then(data => setAccessToken(data.access_token))
}, [])
async function search() {
console.log('Search for ' + searchInput);
var searchParameters ={
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  }
}
var artistId = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
 .then(response => response.json())
 .then(data => { return data.artists.items[0].id })
 console.log("artist id is: " + artistId);
 var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistId + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
 .then(response => response.json())
 .then(data =>{
  console.log(data);
  setAlbums(data.items);
})}

console.log(albums);
console.log(albums.length);
console.log(albums.name);
console.log(albums.length);
const lastPostIndex = currentPage * postsPerPage;
const firstPostIndex = lastPostIndex - postsPerPage;
const currentPosts = albums.slice(firstPostIndex, lastPostIndex)
console.log(currentPosts);
console.log("above was current posts")
console.log(currentPosts.name);
console.log("above was current posts name")
if(clickedOnAlbum != null){
  console.log(clickedOnAlbum)
  return <Navigate to={'/album/'+clickedOnAlbum+'/'+accessToken}/>
}
return(

  <div className="App">
    <div><h1>Aarits Spotify</h1></div>

    <Container>
      <InputGroup name="mb-3" size ="lg">
        <FormControl
         placeholder="Search for artist"
         type="input" onKeyPress={event => {
          if (event.key === 'Enter') {
          search();
        }
      }}
      onChange={event => setSearchInput(event.target.value)}
      />
      <Button onClick={search}>
          Search
      </Button>
      </InputGroup>
    </Container>
    <Container>
      
      <Row className="g-3">
      {currentPosts.map( (currentPosts)  => {

          return(
          <Card className="col-12 col-md-6 col-lg-3">
          <button className='ohio'onClick={() =>   setClickedOnAlbum(currentPosts.id)}>
          <Card.Img src={currentPosts.images[0].url}/>
          </button>
          <Card.Body>
            <Card.Title>{currentPosts.name}</Card.Title>
          </Card.Body>
          </Card>

          )
      })}
      </Row>
  </Container>
  <PaginationComponent totalPosts={albums.length} postsPerPage={postsPerPage} setCurrentPage={setCurrentPage}/>
  </div>
)}
export default Routing;