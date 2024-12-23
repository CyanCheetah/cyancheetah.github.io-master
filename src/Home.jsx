import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from './context/AuthContext.jsx';
import { supabase } from './supabaseClient.jsx';
import { animeService } from './services/animeService';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

const Home = () => {
  document.title = "CyanBase"; // Set the page title

  const [randomShows, setRandomShows] = useState([]); // State for storing randomly fetched TV shows
  const [query, setQuery] = useState(''); // State for the search bar query
  const [searchResults, setSearchResults] = useState([]); // State for storing search results
  const navigate = useNavigate(); // For programmatic navigation
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [combinedResults, setCombinedResults] = useState([]);

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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfileData();
  }, [user]);

  // Handle input changes for the search bar
  const handleSearchInput = (e) => {
    setQuery(e.target.value);
  };

  // Navigate to the search results page when searching
  const handleSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      try {
        // Fetch from TMDB
        const tmdbResponse = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US`
        );
        const tmdbData = await tmdbResponse.json();
        const tmdbResults = tmdbData.results.map(show => ({
          ...show,
          type: 'tv'
        }));

        // Fetch from MAL
        const malResults = await animeService.searchAnime(query);

        // Combine results
        const combined = [...tmdbResults, ...malResults];
        setCombinedResults(combined);

        // Navigate to search results with both types
        navigate('/search', { 
          state: { 
            results: combined,
            query: query 
          }
        });
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  // Navigate to the first result when the "I'm Feeling Lucky" button is clicked
  const handleLuckyClick = async () => {
    if (query.trim() !== '') {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US`
      );
      const data = await response.json();
      setSearchResults(data.results); // Store the search results

      if (data.results.length > 0) {
        navigate(`/show/${data.results[0].id}`); // Navigate to the first result
      }
    }
  };

  // Truncate long titles to fit in UI
  const truncateTitle = (title, length = 25) => {
    return title.length > length ? title.substring(0, length) + '...' : title;
  };

  return (
    <div className="home-container">
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
      {/* Content section - Update this */}
      <div className="content">
        {user ? (
          <h1>Welcome back to CyanBase, {profileData?.username || 'User'}!</h1>
        ) : (
          <>
            <h1>Welcome to CyanBase</h1>
            <p>Your ultimate source for TV shows</p>
          </>
        )}
      </div>
      {/* Search Bar */}
      <div className="search-container2">
        <input
          type="text"
          className="search-bar2"
          placeholder="Search..."
          value={query}
          onChange={handleSearchInput}
          onKeyPress={handleSearch}
        />
        <button className="button2" type="submit" onClick={handleSearch}>
          <i className="fa fa-search"></i>
        </button>
        <button className="button-30" onClick={handleLuckyClick}>
          I'm Feeling Lucky
        </button>
      </div>
    </div>
  );
};

export default Home;
