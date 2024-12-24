import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const results = location.state?.results || [];
  const query = location.state?.query || '';
  const [sourceFilter, setSourceFilter] = useState('all');

  // Remove duplicates and Jikan entries if they exist in TMDB
  const processedResults = results.reduce((acc, current) => {
    // Check if this is a TMDB entry
    if (current.type === 'tv' || current.type === 'movie') {
      // If it's a TMDB show, check if it's an anime
      const isAnime = current.origin_country?.includes('JP') || 
                     current.original_language === 'ja' ||
                     current.genres?.some(g => g.name === 'Animation');
      
      if (isAnime) {
        current.isAnime = true;
      }
      acc.push(current);
    } else if (current.type === 'anime') {
      // For Jikan entries, check if there's no TMDB equivalent
      const tmdbEquivalent = acc.find(item => 
        item.name?.toLowerCase() === current.title?.toLowerCase() ||
        item.original_name?.toLowerCase() === current.title?.toLowerCase()
      );
      
      if (!tmdbEquivalent) {
        acc.push(current);
      }
    }
    return acc;
  }, []);

  // Filter results based on source and type
  const filteredResults = processedResults.filter(item => {
    if (sourceFilter === 'all') return true;
    if (sourceFilter === 'tv') return item.type === 'tv' && !item.isAnime;
    if (sourceFilter === 'movie') return item.type === 'movie';
    if (sourceFilter === 'anime') return item.type === 'anime' || (item.type === 'tv' && item.isAnime);
    return true;
  });

  // Helper function to determine the correct link for each show
  const getShowLink = (item) => {
    if (item.type === 'anime') {
      return `/anime/${item.id}`; // Route to AnimeDetails for Jikan results
    }
    return `/show/${item.id}`; // Route to ShowDetails for TMDB results
  };

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
            All Results
          </button>
          <button 
            className={`filter-button ${sourceFilter === 'tv' ? 'active' : ''}`}
            onClick={() => setSourceFilter('tv')}
          >
            TV Shows
          </button>
          <button 
            className={`filter-button ${sourceFilter === 'movie' ? 'active' : ''}`}
            onClick={() => setSourceFilter('movie')}
          >
            Movies
          </button>
          <button 
            className={`filter-button ${sourceFilter === 'anime' ? 'active' : ''}`}
            onClick={() => setSourceFilter('anime')}
          >
            Anime Only
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
              <Link to={getShowLink(item)}>
                <img 
                  src={
                    item.type === 'tv' 
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : item.image_url
                  } 
                  alt={item.type === 'tv' ? item.name : item.title}
                />
                <div className="result-info">
                  <h3>{item.type === 'tv' ? item.name : item.title}</h3>
                  <p>{item.type === 'tv' 
                        ? (item.first_air_date || '').split('-')[0] 
                        : item.year}</p>
                  <span className="result-type">
                    {item.isAnime ? 'ANIME' : item.type.toUpperCase()}
                  </span>
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
