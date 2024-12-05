import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './TopRated.css';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

const TopRated = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  //const [showNonAnimation, setShowNonAnimation] = useState(false);
  const observer = useRef();

  const fetchTopRatedShows = async (currentPage, isAnimation) => {
    try {
      setLoading(true);
      const genreFilter = isAnimation ? '16' : ''; // '16' is the genre ID for animation
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${currentPage}&sort_by=vote_average.desc&vote_count.gte=200&with_genres=${genreFilter}&api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setShows((prevShows) => [...prevShows, ...data.results]);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching top-rated TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShows([]);
    setPage(1);
    fetchTopRatedShows(1, showAnimation);
  }, [showAnimation]);

  useEffect(() => {
    if (page > 1) {
      fetchTopRatedShows(page, showAnimation);
    }
  }, [page]);

  const lastShowElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="top-rated-container">
      <h1>Top Rated TV Shows</h1>
      {/* Switch Container */}
      <div className="switch-container">
        <div className="checkbox-wrapper-51">
          <input
            type="checkbox"
            id="toggle-switch"
            checked={showAnimation}
            onChange={() => setShowAnimation((prev) => !prev)}
          />
          <label className="toggle" htmlFor="toggle-switch">
            <span></span>
          </label>
          <label className="switch-label">Animation Only</label>
        </div>
      </div>
      <div className="show-grid">
        {shows.map((show, index) => (
          <Link
            to={`/show/${show.id}`} // Linking to the show details page using the show's id
            key={show.id}
            className="show-card" // Apply styling to the card
            ref={shows.length === index + 1 ? lastShowElementRef : null}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              className="show-poster"
            />
            <h2>{show.name}</h2>
            <p>Rating: {show.vote_average}</p>
          </Link>
        ))}
      </div>
      {loading && <div className="loading">Loading...</div>}
      {!hasMore && <div className="end-message">No more shows to load.</div>}
    </div>
  );
};

export default TopRated;
