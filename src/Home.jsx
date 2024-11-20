/**
 * @author Sai Tanuj Karavadi
 * @date 11/19/2024
*/
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';
//Add comments PLEASE

const Home = () => {
  document.title = "CyanBase";
  document.images

  const [randomShows, setRandomShows] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandomShows = async () => {
      try {
        const page = Math.floor(Math.random() * 500) + 1; // Random page number
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );
        const data = await response.json();
        setRandomShows(data.results.filter((show) => show.poster_path).slice(0, 25));
      } catch (error) {
        console.error('Error fetching random shows:', error);
      }

    };

    fetchRandomShows();
  }, []);

  const handleSearchInput = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US`
        );
        const data = await response.json();
        setSearchResults(data.results.filter((show) => show.poster_path));
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  // logo
  const handleLogoClick = () => {
    setQuery('');
    setSearchResults([]);
    navigate(0);
  };


  const truncateTitle = (title, length = 15) => {
    return title.length > length ? title.substring(0, length) + '...' : title;
  };

  return (

    <div className="home">


      {/* Show Carousel */}
      {searchResults.length === 0 && (
        <div className="show-carousel-container">
          <div className="show-carousel">
            {/* Duplicate the array of shows to create an infinite scrolling effect */}
            {[...randomShows, ...randomShows].map((show) => (
              <div className="show-item" key={show.id}>
                <img
                  src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                  alt={show.name}
                  className="show-poster"
                />
                <p>{truncateTitle(show.name)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <div className="search-results">
          {searchResults.map((show) => (
            <Link to={`/show/${show.id}`} key={show.id} className="search-result-item">
              <div className="result-content">
                <div className="result-poster">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                    alt={show.name}
                    className="poster-img"
                  />
                </div>
                <div className="result-info">
                  <h3>{show.name}</h3>
                  <p>
                    <strong>First Air Date:</strong> {show.first_air_date || 'N/A'}
                  </p>
                  <p>
                    <strong>Description:</strong> {show.overview || 'No description available.'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <><div className="content">
          <h1>Welcome to CyanBase</h1>
          <p>Your ultimate source for TV shows</p>
        </div><div className="search-container2">
            <input
              type="text"
              className="search-bar2"
              placeholder="Search..."
              value={query}
              onChange={handleSearchInput}
              onKeyPress={handleSearch} />
            <button class="button2" type="submit" onClick={handleSearch}><i class="fa fa-search"></i></button>
          </div></>
      )}
    </div>
  );
};

export default Home;
