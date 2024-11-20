/**
 * @author Sai Tanuj Karavadi
 * @date 11/19/2024
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Home from './Home';
import ShowDetails from './ShowDetails.jsx';
import Profile from './Profile.jsx';
import Popular from './Popular.jsx';
import About from './About.jsx';
import SearchResults from './SearchResults.jsx'; // Import the SearchResults component
import './Home.css';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

// Top bar component with navigation and search functionality
const TopBar = ({ query, setQuery }) => {
  const navigate = useNavigate();

  const handleSearchInput = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate(`/search?query=${query}`); // Navigate to SearchResults with query as a parameter
    }
  };

  const handleLogoClick = () => {
    setQuery('');
    navigate('/');
  };

  return (
    <div className="top-bar">
      <div className="logo-container">
        <span onClick={handleLogoClick} className="logo-image">
          <img
            src="src/assets/CyanBase.png"
            alt="logo"
            className="logo-image"
          />
        </span>
      </div>
      <div className="navigation-container">
        <a className="button-30" href="#/popular">Popular</a>
        <a className="button-30" href="#/profile">Profile</a>
        <a className="button-30" href="#/about">About</a>
      </div>
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
          value={query}
          onChange={handleSearchInput}
          onKeyPress={handleSearch}
        />
        <button className="button" type="submit" onClick={handleSearch}>
          <i className="fa fa-search"></i>
        </button>
      </div>
    </div>
  );
};

function Main() {
  const [query, setQuery] = useState('');

  return (
    <Router>
      <div className="app-container">
        <TopBar query={query} setQuery={setQuery} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults />} /> {/* Add route for SearchResults */}
        </Routes>
        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            &copy; {new Date().getFullYear()}{' '}
            <a href="https://github.com/CyanCheetah" target="_blank" rel="noopener noreferrer">
              Sai Tanuj Karavadi
            </a>
          </div>
          <div className="footer-center">
            Film data from{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="tmdb-link"
            >
              TMDB
            </a>
          </div>
          <div className="footer-right">
            <a href="#/about" className="about-link">
              About
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Rendering the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
