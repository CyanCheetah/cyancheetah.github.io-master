import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Popular.css";

const TMDB_API_KEY = "7ceb22d73d90c1567ca77b9aedb51cd8";

const Popular = () => {
  document.title = "CyanBase - Popular";
  const [popularShows, setPopularShows] = useState([]);
  const [timeWindow, setTimeWindow] = useState("week");
  const [language, setLanguage] = useState("en-US");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch genres
  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=${language}`
      );
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  // Fetch popular shows
  const fetchPopularShows = async () => {
    try {
      const genreQuery = selectedGenre ? `&with_genres=${selectedGenre}` : "";
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=${language}&sort_by=popularity.desc&page=1&time_window=${timeWindow}${genreQuery}`
      );
      const data = await response.json();
      setPopularShows(data.results.filter((show) => show.poster_path));
    } catch (error) {
      console.error("Error fetching popular shows:", error);
    }
  };
  const handleLogoClick = () => {
    setQuery('');
    setSearchResults([]);
    navigate('/');
  };
  useEffect(() => {
    fetchGenres();
  }, [language]);

  useEffect(() => {
    fetchPopularShows();
  }, [timeWindow, language, selectedGenre]);

  const truncateDescription = (description, length = 400) => {
    return description.length > length ? description.substring(0, length) + "..." : description;
  };
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

  return (
    <div className="popular-container">
      
      {/* Main Content */}
      <div className="main-content">
        <div className="dropdown-container">
          <h3>Filter Options</h3>
          <div className="dropdown-item">
            <label htmlFor="time-window">Sort by: </label>
            <select
              id="time-window"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="dropdown-item">
            <label htmlFor="language">Language: </label>
            <select
              id="language"
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
          <div className="dropdown-item">
            <label htmlFor="genres">Genre: </label>
            <select
              id="genres"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Shows */}
        <div className="popular-shows-items">
          {popularShows.map((show) => (
            <Link to={`/show/${show.id}`} key={show.id} className="show-item">
              <div className="popular-shows-posters">
                <img
                  src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                  alt={show.name}
                  className="poster-img"
                />
              </div>
              <div className="show-info">
                <h4>{show.name}</h4>
                <h5>Date: {show.first_air_date}</h5>
                <p>{truncateDescription(show.overview)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>


  );

};

export default Popular;
