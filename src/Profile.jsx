import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { authService } from './services/auth';
import './Profile.css';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const [watchlistData, watchedData, progressData] = await Promise.all([
          authService.getWatchlist(),
          authService.getWatchedShows(),
          authService.getShowProgress()
        ]);

        setWatchlist(watchlistData);
        setRecentlyWatched(watchedData.slice(0, 8));
        setCurrentlyWatching(
          progressData
            .filter(show => show.status === 'watching')
            .slice(0, 8)
        );
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProgress = async (showId, season, episode) => {
    try {
      await authService.updateShowProgress(showId, season, episode);
      // Refresh currently watching shows
      const progressData = await authService.getShowProgress();
      setCurrentlyWatching(
        progressData
          .filter(show => show.status === 'watching')
          .slice(0, 8)
      );
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleRemoveFromWatchlist = async (showId) => {
    try {
      await authService.removeFromWatchlist(showId);
      setWatchlist(prev => prev.filter(show => show.show_id !== showId));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const handleMarkAsCompleted = async (showId) => {
    try {
      const show = currentlyWatching.find(s => s.show_id === showId);
      if (show) {
        await authService.markAsWatched(showId, show.show_title, show.poster_path);
        setCurrentlyWatching(prev => prev.filter(s => s.show_id !== showId));
        // Refresh recently watched
        const watchedData = await authService.getWatchedShows();
        setRecentlyWatched(watchedData.slice(0, 8));
      }
    } catch (err) {
      console.error('Failed to mark as completed:', err);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>Error: {error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-text">
            <h1>{user.username}</h1>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{recentlyWatched.length}</span>
                <span className="stat-label">Total Shows</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {recentlyWatched.filter(show => 
                    new Date(show.watched_at).getFullYear() === new Date().getFullYear()
                  ).length}
                </span>
                <span className="stat-label">This Year</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        {currentlyWatching.length > 0 && (
          <div className="section-container">
            <h2>Currently Watching</h2>
            <div className="show-grid">
              {currentlyWatching.map(show => (
                <div key={show.show_id} className="show-item">
                  <Link to={`/show/${show.show_id}`} className="show-link">
                    <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.show_title} />
                  </Link>
                  <div className="show-item-overlay">
                    <h3>{show.show_title}</h3>
                    <div className="progress-controls">
                      <div className="season-input">
                        <label>Season</label>
                        <input
                          type="number"
                          value={show.current_season || 1}
                          onChange={(e) => handleUpdateProgress(show.show_id, parseInt(e.target.value), show.current_episode)}
                          min="1"
                        />
                      </div>
                      <div className="episode-input">
                        <label>Episode</label>
                        <input
                          type="number"
                          value={show.current_episode || 1}
                          onChange={(e) => handleUpdateProgress(show.show_id, show.current_season, parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                    <button 
                      className="show-action-button"
                      onClick={() => handleMarkAsCompleted(show.show_id)}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentlyWatched.length > 0 && (
          <div className="section-container">
            <h2>Recently Watched</h2>
            <div className="show-grid">
              {recentlyWatched.map(show => (
                <div key={show.show_id} className="show-item">
                  <Link to={`/show/${show.show_id}`} className="show-link">
                    <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.show_title} />
                  </Link>
                  <div className="show-item-overlay">
                    <h3>{show.show_title}</h3>
                    <p>Completed {new Date(show.watched_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="section-container">
            <h2>Watchlist</h2>
            <div className="show-grid">
              {watchlist.map(show => (
                <div key={show.show_id} className="show-item">
                  <Link to={`/show/${show.show_id}`} className="show-link">
                    <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.show_title} />
                  </Link>
                  <div className="show-item-overlay">
                    <h3>{show.show_title}</h3>
                    <button 
                      className="show-action-button"
                      onClick={() => handleRemoveFromWatchlist(show.show_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;