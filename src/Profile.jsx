import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { authService } from './services/auth';
import './Profile.css';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient.jsx';

const Profile = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    description: '',
    profile_picture: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Get watchlist (plan_to_watch)
        const { data: watchlistData, error: watchlistError } = await supabase
          .from('show_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'plan_to_watch');
        
        if (watchlistError) throw watchlistError;
        setWatchlist(watchlistData);

        // Get currently watching shows
        const { data: watchingData, error: watchingError } = await supabase
          .from('show_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'watching');

        if (watchingError) throw watchingError;
        setCurrentlyWatching(watchingData);

        // Get completed shows
        const { data: completedData, error: completedError } = await supabase
          .from('show_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(8);

        if (completedError) throw completedError;
        setRecentlyWatched(completedData);

      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfileData({
          username: data.username || '',
          description: data.description || '',
          profile_picture: data.profile_picture || null
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleUpdateProgress = async (showId, season, episode) => {
    try {
      // Validate inputs
      const newSeason = Math.max(1, parseInt(season) || 1);
      const newEpisode = Math.max(1, parseInt(episode) || 1);

      // First update the local state immediately for better UX
      setCurrentlyWatching(prev =>
        prev.map(show =>
          show.show_id === showId
            ? { 
                ...show, 
                current_season: newSeason, 
                current_episode: newEpisode 
              }
            : show
        )
      );

      // Then update the database
      const { error } = await supabase
        .from('show_status')
        .update({
          current_season: newSeason,
          current_episode: newEpisode,
          updated_at: new Date().toISOString()
        })
        .eq('show_id', showId)
        .eq('user_id', user.id)
        .eq('status', 'watching');

      if (error) {
        throw error;
      }

    } catch (err) {
      console.error('Failed to update progress:', err);
      // Revert the local state if the update failed
      const { data } = await supabase
        .from('show_status')
        .select('*')
        .eq('show_id', showId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCurrentlyWatching(prev =>
          prev.map(show =>
            show.show_id === showId ? { ...show, ...data } : show
          )
        );
      }
    }
  };

  const handleRemoveFromWatchlist = async (showId) => {
    try {
      const { error } = await supabase
        .from('show_status')
        .delete()
        .eq('show_id', showId)
        .eq('user_id', user.id)
        .eq('status', 'plan_to_watch');

      if (error) throw error;
      setWatchlist(prev => prev.filter(show => show.show_id !== showId));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const handleMarkAsCompleted = async (showId) => {
    try {
      const show = currentlyWatching.find(s => s.show_id === showId);
      if (show) {
        // Update status to completed
        const { error: updateError } = await supabase
          .from('show_status')
          .update({ status: 'completed' })
          .eq('show_id', showId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Remove from currently watching list
        setCurrentlyWatching(prev => prev.filter(s => s.show_id !== showId));

        // Refresh recently watched
        const { data: completedData, error: fetchError } = await supabase
          .from('show_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(8);

        if (fetchError) throw fetchError;
        setRecentlyWatched(completedData);
      }
    } catch (err) {
      console.error('Failed to mark as completed:', err);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Check file size (limit to 1MB)
        if (file.size > 1024 * 1024) {
          throw new Error('Image size should be less than 1MB');
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64String = event.target.result;
          setProfileData(prev => ({
            ...prev,
            profile_picture: base64String
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling profile picture:', error);
        alert(error.message);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      // First, update the profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          description: profileData.description,
          profile_picture: profileData.profile_picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      setEditing(false);

      // Refresh the profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData({
        username: data.username || '',
        description: data.description || '',
        profile_picture: data.profile_picture || null
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
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
          <div className="profile-picture-container">
            {editing ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="profile-picture-input"
              />
            ) : (
              <img
                src={profileData.profile_picture || '/default-avatar.png'}
                alt="Profile"
                className="profile-picture"
              />
            )}
          </div>
          <div className="profile-text">
            <h1>{profileData.username}</h1>
            {editing ? (
              <textarea
                value={profileData.description}
                onChange={e => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                className="description-input"
              />
            ) : (
              <p className="description">{profileData.description || 'No description added yet.'}</p>
            )}
            <button 
              className="edit-button"
              onClick={editing ? handleSaveProfile : handleEditToggle}
            >
              {editing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="section-container">
          <h2>Currently Watching</h2>
          <div className="show-grid">
            {currentlyWatching.length > 0 ? (
              currentlyWatching.map(show => (
                <div key={show.show_id} className="show-item">
                  <Link to={`/show/${show.show_id}`} className="show-link">
                    <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.show_title} />
                  </Link>
                  <div className="show-item-overlay">
                    <h3>{show.show_title}</h3>
                    <p>Season {show.current_season || 1} Episode {show.current_episode || 1}</p>
                    <div className="progress-controls">
                      <div className="season-input">
                        <label>Season</label>
                        <input
                          type="number"
                          value={show.current_season || 1}
                          onChange={(e) => {
                            const newValue = Math.max(1, parseInt(e.target.value) || 1);
                            handleUpdateProgress(show.show_id, newValue, show.current_episode || 1);
                          }}
                          min="1"
                          onClick={(e) => e.target.select()}
                        />
                      </div>
                      <div className="episode-input">
                        <label>Episode</label>
                        <input
                          type="number"
                          value={show.current_episode || 1}
                          onChange={(e) => {
                            const newValue = Math.max(1, parseInt(e.target.value) || 1);
                            handleUpdateProgress(show.show_id, show.current_season || 1, newValue);
                          }}
                          min="1"
                          onClick={(e) => e.target.select()}
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
              ))
            ) : (
              <p className="empty-message">No shows currently watching</p>
            )}
          </div>
        </div>

        <div className="section-container">
          <h2>Watchlist</h2>
          <div className="show-grid">
            {watchlist.length > 0 ? (
              watchlist.map(show => (
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
              ))
            ) : (
              <p className="empty-message">No shows in watchlist</p>
            )}
          </div>
        </div>

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
                    <p>Completed {new Date().toLocaleDateString()}</p>
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