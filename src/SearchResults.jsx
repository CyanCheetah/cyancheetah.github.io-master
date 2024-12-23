// SearchResults.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const results = location.state?.results || [];
  const query = location.state?.query || '';
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'tv', or 'anime'

  // Filter results based on source
  const filteredResults = results.filter(item => {
    if (sourceFilter === 'all') return true;
    return item.type === sourceFilter;
  });

  if (!query) {
    return (
      <div className="search-results-container">
        <div className="no-results">
          Please enter a search term to find shows
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h2>Search Results for "{query}"</h2>
        <div className="source-filter">
          <button 
            className={`filter-button ${sourceFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSourceFilter('all')}
          >
            All Sources
          </button>
          <button 
            className={`filter-button ${sourceFilter === 'tv' ? 'active' : ''}`}
            onClick={() => setSourceFilter('tv')}
          >
            TMDB Only
          </button>
          <button 
            className={`filter-button ${sourceFilter === 'anime' ? 'active' : ''}`}
            onClick={() => setSourceFilter('anime')}
          >
            MAL Only
          </button>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="no-results">
          No results found for "{query}"
        </div>
      ) : (
        <div className="results-grid">
          {filteredResults.map(item => (
            <div key={item.id} className="result-card" data-source={item.type}>
              <Link to={item.type === 'tv' ? `/show/${item.id}` : `/anime/${item.id}`}>
                <img 
                  src={
                    item.type === 'tv' 
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : item.image_url
                  } 
                  alt={item.type === 'tv' ? item.name : item.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-poster.png';
                  }}
                />
                <div className="result-info">
                  <h3>{item.type === 'tv' ? item.name : item.title}</h3>
                  <p>{item.year || (item.first_air_date || '').split('-')[0]}</p>
                  <span className="result-type">{item.type.toUpperCase()}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
