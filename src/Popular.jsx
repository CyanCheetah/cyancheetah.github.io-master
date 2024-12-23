import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Popular.css";

const TMDB_API_KEY = "7ceb22d73d90c1567ca77b9aedb51cd8";

const Popular = () => {
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [yearRange, setYearRange] = useState(2000);
  const [language, setLanguage] = useState('en-US');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  const handleShowResults = async () => {
    try {
      const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : '';
      const yearParam = `&first_air_date.gte=${yearRange}-01-01`;
      
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=${language}&sort_by=${sortBy}${genreParam}${yearParam}`
      );
      const data = await response.json();
      setShows(data.results);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  const loadMoreShows = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : '';
      const yearParam = `&first_air_date.gte=${yearRange}-01-01`;
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=${language}&sort_by=${sortBy}&page=${page + 1}${genreParam}${yearParam}`
      );
      const data = await response.json();
      setShows(prev => [...prev, ...data.results]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more shows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        loadMoreShows();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, loading]);

  return (
    <div className="top-rated-container">
      <div className="filters-sidebar">
        <div className="filter-section">
          <h3>Language</h3>
          <select 
            className="genre-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en-US">English</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="ja-JP">Japanese</option>
          </select>
        </div>

        <div className="filter-section">
          <h3>Sort By</h3>
          <select 
            className="genre-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="first_air_date.desc">Newest First</option>
            <option value="first_air_date.asc">Oldest First</option>
            <option value="vote_average.desc">Highest Rated</option>
          </select>
        </div>

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

export default Popular;
