import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopRated.css';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

const TopRated = () => {
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [yearRange, setYearRange] = useState(2000);
  
  useEffect(() => {
    // Fetch genres
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    
    fetchGenres();
  }, []);

  const fetchShows = async () => {
    try {
      const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : '';
      const yearParam = `&first_air_date.gte=${yearRange}-01-01`;
      
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US${genreParam}${yearParam}`
      );
      const data = await response.json();
      setShows(data.results);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleShowResults = () => {
    fetchShows();
  };

  return (
    <div className="top-rated-container">
      <div className="filters-sidebar">
        <div className="filter-section">
          <h3>Genre</h3>
          <select 
            className="genre-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h3>Year</h3>
          <input
            type="range"
            min="1990"
            max="2024"
            value={yearRange}
            onChange={(e) => setYearRange(e.target.value)}
            className="year-slider"
          />
          <div className="year-range">
            <span>From {yearRange}</span>
          </div>
        </div>

        <button className="button-30" onClick={handleShowResults}>
          Show Results
        </button>
      </div>

      <div className="shows-grid">
        {shows.map(show => (
          <Link to={`/show/${show.id}`} key={show.id} className="show-card">
            <img 
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
              alt={show.name}
            />
            <div className="show-rating">
              ★ {show.vote_average.toFixed(1)}
            </div>
            <div className="show-info">
              <h3>{show.name}</h3>
              <p>{new Date(show.first_air_date).getFullYear()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopRated;
