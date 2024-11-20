// SearchResults.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Home.css';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {//i hate javascript
    if (query) {
      const fetchSearchResults = async () => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US`
          );
          const data = await response.json();
          setSearchResults(data.results.filter((show) => show.poster_path));
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      };

      fetchSearchResults();
    }
  }, [query]);

  const truncateTitle = (title, length = 25) => {
    return title.length > length ? title.substring(0, length) + '...' : title;
  };

  return (
    <div className="search-results-container">
      <h2 className="search-res"><strong>Search Results For:</strong> {query}</h2>

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
                  <h3>{truncateTitle(show.name)}</h3>
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
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
