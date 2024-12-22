/**
 * @author Sai Tanuj Karavadi
 * @date 11/19/2024
 */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import './App.css';
import Home from './Home';
import ShowDetails from './ShowDetails.jsx';
import Profile from './Profile.jsx';
import Popular from './Popular.jsx';
import About from './About.jsx';
import TopRated from './TopRated.jsx';
import SearchResults from './SearchResults.jsx'; // Import the SearchResults component
import './Home.css';
import Login from './Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import ActorPage from './ActorPage.jsx';

const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

// Top bar component with navigation and search functionality
const TopBar = ({ query, setQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add click outside handler to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navigation-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleSearchInput = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate(`/search?query=${query}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogoClick = () => {
    setQuery('');
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent click from immediately closing menu
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="top-bar">
      <div className="logo-container">
        <span onClick={handleLogoClick} className="logo-image">
          <img 
            src="/assets/PlsWork.png" 
            alt="logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </span>
      </div>
      
      <div className="navigation-container">
        <button className="mobile-menu-button" onClick={toggleMenu}>
          ☰
        </button>
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/popular" className="button-30" onClick={() => navigate('/popular')}>
            Popular
          </Link>
          <Link to="/top-rated" className="button-30" onClick={() => navigate('/top-rated')}>
            Top Rated
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="button-30" onClick={() => navigate('/profile')}>
                Profile
              </Link>
              <button 
                className="button-30" 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="button-30" onClick={() => navigate('/login')}>
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* Only show search on desktop */}
      <div className="search-container desktop-only">
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
    <AuthProvider>
      <Router>
        <div className="app-container">
          <TopBar query={query} setQuery={setQuery} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/show/:id" element={<ShowDetails />} />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route path="/popular" element={<Popular />} />
            <Route path="/about" element={<About />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/actor/:id" element={<ActorPage />} />
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
    </AuthProvider>
  );
}

// Rendering the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
