



import ReactDom from 'react-dom';
import AlbumDisplay from './AlbumDisplay.js';
import './App.css';
import React from 'react';
import Player from './player.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
createBrowserRouter, 
createRoutesFromElements,
Route, 
RouterProvider,
} from 'react-router-dom'
import Routing from "./route.js"

const router = createBrowserRouter([
  {
    path:'/',
    element:<Routing />
  },
  {
    path : '/album/',
    element :<AlbumDisplay/>
  },
  {
    path : '/album/:albumid/:accesstoken',
    element :<AlbumDisplay/>

  },
  {
    path : '/player',
    element :<Player/>
  },
  {
    path: '/player/:songName/:albumName/:artistName/:albumCoverUrl',
    element: <Player/>
  }
]
)
function App(){
  return(
      <RouterProvider router = {router}/>
  )
}
export default App