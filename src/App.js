import './App.css';
import firebase from './firebase';
import axios from 'axios';
import {useState, useEffect} from 'react';
import Header from './Header';
import MovieForm from './MovieForm';
import SpecialAside from './SpecialAside'
import Footer from './Footer';

function App() {
  const [movies, setMovies] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [movieData, setMovieData] = useState({});
  const dbRef = firebase.database().ref();

  const handleChange = (event) => {
    setUserInput(event.target.value);
  }

  const handleClick = (event) => {
    event.preventDefault();
    if (userInput === "") {
      return;
    }  
    dbRef.push(userInput);
    setUserInput('');
  }

  // Function to remove a movie from the list.
  const removeMovie = (movieId) => {
    dbRef.child(movieId).remove();
  }
  
  useEffect(() => {
    const dbRef = firebase.database().ref(); 
    
    dbRef.on('value', (response) => {
      // clearing state and adding firebase data
      setMovieData({});
      const data = response.val();
      const movieArray = [];
      
      for (let key in data) {
        movieArray.push({key: key, name: data[key]});
        getMovie(key, data[key]);
      }
      // Update state with the new movieArray.
      setMovies(movieArray);
    })
  }, [])
  
  // Function for the API call. Gathers movie data based on firebase keys
  const getMovie = (key, eachMovie) => {
    axios({
      url: "https://api.themoviedb.org/3/search/movie",
      method: "GET",
      dataResponse: "json",
      params: {
        api_key: "2503d965513c21249b0b22f41e666138",
        query: eachMovie,
        include_adult: false
      }
    }).then((res) => { 
      setMovieData((originalState) => {
        // Copying/cloning state
        const movieDataObject = {...originalState};
        // Adding new data from API into the copy/clone
        movieDataObject[key] = res.data.results[0];
        // Setting the movieData state to the copy/clone
        return movieDataObject;
      })
    })
  }

  return (
    <div className="App">
      <Header/>
      <MovieForm
        handleChange={handleChange}
        value={userInput}
        handleClick={handleClick}
      />
      <ul className="wrapper">
        {movies.map((movie) => {
          return (
            <li key={movie.key}>
              <div className="movieImage">
                {/* Since two states are being changed asynchronously, movieData may be undefined at this point, so we require a ternary operator. This happens throughout the render and I will clean this up in the future when time allows. */}
                <img 
                  src={movieData[movie.key] === undefined 
                      ? "" 
                      : `https://image.tmdb.org/t/p/w500/${movieData[movie.key].poster_path}`} 
                  alt={movieData[movie.key] === undefined
                      ? ""
                      : movieData[movie.key].title} 
                />
              </div>
              <div className="movieInfo">
                <h3>
                  {movieData[movie.key] === undefined
                    ? ""
                    : movieData[movie.key].title}
                </h3>
                <p>
                  {movieData[movie.key] === undefined
                    ? ""
                    : movieData[movie.key].overview}
                </p>
                <button onClick={() => removeMovie(movie.key)}>Remove!</button>
              </div>
            </li>
          );
        })}
      </ul>
      <SpecialAside/>
      <Footer/>
    </div>
  );
}

export default App;
