/**
 * @author 
 * @date 
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

const Home = () => {
  document.title = "CyanBase"; // Set the page title

  const [randomShows, setRandomShows] = useState([]); // State for storing randomly fetched TV shows
  const [query, setQuery] = useState(''); // State for the search bar query
  const navigate = useNavigate(); // For programmatic navigation

  // Fetch random shows on component mount
  useEffect(() => {
    const fetchRandomShows = async () => {
      try {
        const page = Math.floor(Math.random() * 500) + 1; // Generate a random page number
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

  // Handle input changes for the search bar
  const handleSearchInput = (e) => {
    setQuery(e.target.value);
  };

  // Navigate to the search results page when searching
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate(`/search?query=${query}`); // Pass the search query to the SearchResults component via the URL
    }
  };

  // Truncate long titles to fit in UI
  const truncateTitle = (title, length = 25) => {
    return title.length > length ? title.substring(0, length) + '...' : title;
  };

  return (
    <div className="home">
      

      

      {/* Show Carousel */}
      <div className="show-carousel-container">
        <div className="show-carousel">
          {/* Duplicate the array of shows to create a continuous scrolling effect */}
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
      {/* Carousel for Random TV Shows */}
      <div className="content">
        <h1>Welcome to CyanBase</h1>
        <p>Your ultimate source for TV shows</p>
      </div>
      {/* Search Bar */}
      <div className="search-container2">
        <input
          type="text"
          className="search-bar2"
          placeholder="Search..."
          value={query}
          onChange={handleSearchInput}
          onKeyPress={handleSearch} // Trigger search on Enter key press
        />
        <button className="button2" type="submit" onClick={handleSearch}>
          <i className="fa fa-search"></i>
        </button>
      </div>
    </div>
  );
};

export default Home;
