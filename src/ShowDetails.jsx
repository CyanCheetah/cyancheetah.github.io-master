import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ShowDetails.css';
import { useAuth } from './context/AuthContext';
import { authService } from './services/auth';
// ADD COMMENTS!!!!!!
const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

function ShowDetails() {
  const [showDetails, setShowDetails] = useState(null);
  const [actors, setActors] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [watched, setWatched] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistError, setWatchlistError] = useState('');
  const [isWatched, setIsWatched] = useState(false);
  const [showProgress, setShowProgress] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [status, setStatus] = useState('');
  const [currentSeason, setCurrentSeason] = useState(1);
  const [score, setScore] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        setShowDetails(data);

        // Set the page title to the name of the current show
        if (data.name) {
          document.title = `${data.name} - CyanBase`; // Set dynamic title
        }

        const actorsResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${TMDB_API_KEY}`
        );
        const actorsData = await actorsResponse.json();
        setActors(actorsData.cast);
      } catch (error) {
        console.error('Error fetching show details:', error);
      }
    };

    if (id) fetchShowDetails();
  }, [id]);

  useEffect(() => {
    const checkWatchlist = async () => {
      if (user && showDetails) {
        try {
          const watchlist = await authService.getWatchlist();
          setIsInWatchlist(watchlist.some(item => item.show_id === showDetails.id));
        } catch (error) {
          console.error('Failed to check watchlist:', error);
        }
      }
    };

    checkWatchlist();
  }, [user, showDetails]);

  useEffect(() => {
    const checkShowStatus = async () => {
      if (user && showDetails) {
        try {
          // Get show progress
          const progressData = await authService.getShowProgress();
          const currentProgress = progressData.find(show => show.show_id === parseInt(id));
          if (currentProgress) {
            setStatus('watching');
            setShowProgress(currentProgress);
            setCurrentSeason(currentProgress.current_season || 1);
          }

          // Check if show is completed
          const watchedShows = await authService.getWatchedShows();
          const isCompleted = watchedShows.some(show => show.show_id === parseInt(id));
          if (isCompleted) {
            setStatus('completed');
          }

          // Check if show is in watchlist
          const watchlist = await authService.getWatchlist();
          const inWatchlist = watchlist.some(show => show.show_id === parseInt(id));
          if (inWatchlist) {
            setStatus('plan_to_watch');
          }

          // Get show score if exists
          const showScore = await authService.getShowScore(id);
          if (showScore) {
            setScore(showScore);
          }
        } catch (error) {
          console.error('Error checking show status:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkShowStatus();
  }, [user, showDetails, id]);

  const handleActorClick = async (actorId) => {
    const isMobile = window.innerWidth <= 768;
    
    try {
      // Fetch actor details
      const response = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const actorData = await response.json();
      
      // Fetch actor's TV shows
      const showsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}/tv_credits?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const showsData = await showsResponse.json();

      // Filter and sort shows by popularity
      const latestShows = showsData.cast
        .filter(show => show.poster_path) // Only shows with posters
        .sort((a, b) => b.popularity - a.popularity) // Sort by popularity
        .slice(0, 8); // Limit to 8 shows

      if (isMobile) {
        navigate(`/actor/${actorId}`, { state: { actorData, shows: latestShows } });
      } else {
        setSelectedActor(actorData);
        setActorMovies(latestShows);
      }
    } catch (error) {
      console.error('Error fetching actor details:', error);
    }
  };


  const closeActorModal = () => {
    setSelectedActor(null);
    setActorMovies([]);
  };

  const handleMarkAsWatched = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await authService.markAsWatched(
        showDetails.id,
        showDetails.name,
        showDetails.poster_path
      );
      setIsWatched(true);
    } catch (error) {
      console.error('Error marking as watched:', error);
    }
  };

  const handleUpdateProgress = async (season, episode) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await authService.updateShowProgress(
        showDetails.id,
        season,
        episode,
        'watching'
      );
      setShowProgress({ current_season: season, current_episode: episode });
      setShowProgressModal(false);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await authService.addToWatchlist(
        showDetails.id,
        showDetails.name || showDetails.title,
        showDetails.poster_path
      );
      setIsInWatchlist(true);
      // Optional: Show a success message
      alert('Added to watchlist!');
    } catch (error) {
      setWatchlistError(error.message);
      console.error('Failed to add to watchlist:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await authService.updateShowStatus(
        showDetails.id,
        showDetails.name,
        showDetails.poster_path,
        newStatus,
        score,
        showProgress?.current_episode || 0
      );
      setStatus(newStatus);
      
      // Remove from other lists when status changes
      if (newStatus === 'watching') {
        await authService.removeFromWatchlist(showDetails.id);
        await authService.removeFromWatched(showDetails.id);
      } else if (newStatus === 'completed') {
        await authService.removeFromWatchlist(showDetails.id);
        await authService.removeFromProgress(showDetails.id);
      } else if (newStatus === 'plan_to_watch') {
        await authService.removeFromProgress(showDetails.id);
        await authService.removeFromWatched(showDetails.id);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEpisodeUpdate = async (season, episode) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const episodeNum = parseInt(episode);
      if (isNaN(episodeNum)) return;

      await authService.updateShowProgress(
        showDetails.id,
        showDetails.name,
        showDetails.poster_path,
        season,
        episodeNum
      );

      setShowProgress(prev => ({
        ...prev,
        current_season: season,
        current_episode: episodeNum
      }));

      // Also update the status to watching if it's not already
      if (status !== 'watching') {
        setStatus('watching');
        await authService.updateShowStatus(
          showDetails.id,
          showDetails.name,
          showDetails.poster_path,
          'watching',
          score,
          episodeNum
        );
      }
    } catch (error) {
      console.error('Error updating episode progress:', error);
    }
  };

  const handleScoreChange = async (newScore) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await authService.updateShowScore(
        showDetails.id,
        newScore
      );
      setScore(newScore);
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  // Progress Modal Component
  const ProgressModal = () => (
    <div className="progress-modal">
      <div className="progress-modal-content">
        <h3>Update Progress</h3>
        <div className="progress-inputs">
          <div className="input-group">
            <label>Season</label>
            <input
              type="number"
              min="1"
              value={showProgress?.current_season || 1}
              onChange={(e) => handleUpdateProgress(
                parseInt(e.target.value),
                showProgress?.current_episode || 1
              )}
            />
          </div>
          <div className="input-group">
            <label>Episode</label>
            <input
              type="number"
              min="1"
              value={showProgress?.current_episode || 1}
              onChange={(e) => handleUpdateProgress(
                showProgress?.current_season || 1,
                parseInt(e.target.value)
              )}
            />
          </div>
        </div>
        <button onClick={() => setShowProgressModal(false)}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="show-details">

      {/* Show Details Content */}
      {showDetails && !isSearchActive && (
        <div className="show-details-content">
          <div className="show-details-left">
            <img
              src={`https://image.tmdb.org/t/p/w500${showDetails.poster_path}`}
              alt={showDetails.name}
              className="show-poster-img"
            />
            {watchlistError && <div className="error-message">{watchlistError}</div>}
          </div>
          
          <div className="show-details-right">
            <div className="show-header">
              <span className="show-title">{showDetails.name}</span>
              <span className="show-year">({new Date(showDetails.first_air_date).getFullYear()})</span>
            </div>
            
            <div className="show-meta">
              <div className="show-rating">
                ★ {showDetails.vote_average.toFixed(1)}
              </div>
              <div className="show-genres">
                {showDetails.genres.map(genre => genre.name).join(' • ')}
              </div>
            </div>
            
            <div className="show-overview-section">
              <h3 className="section-title">Synopsis</h3>
              <p className="show-overview">{showDetails.overview}</p>
            </div>

            <div className="show-tracking-section">
              {user ? (
                <div className="tracking-controls">
                  <div className="tracking-group">
                    <label>Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="status-select"
                    >
                      <option value="">Select Status</option>
                      <option value="watching">Currently Watching</option>
                      <option value="completed">Completed</option>
                      <option value="plan_to_watch">Plan to Watch</option>
                    </select>
                  </div>

                  {status === 'watching' && (
                    <>
                      <div className="tracking-group">
                        <label>Season</label>
                        <input
                          type="number"
                          min="1"
                          value={currentSeason}
                          onChange={(e) => setCurrentSeason(parseInt(e.target.value))}
                          className="season-input"
                        />
                      </div>
                      <div className="tracking-group">
                        <label>Episode</label>
                        <div className="episode-progress">
                          <input
                            type="number"
                            min="0"
                            max={showDetails.number_of_episodes || 999}
                            value={showProgress?.current_episode || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d+$/.test(value)) {
                                const episodeNum = value === '' ? 0 : parseInt(value);
                                handleEpisodeUpdate(currentSeason, episodeNum);
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                handleEpisodeUpdate(currentSeason, 0);
                              }
                            }}
                          />
                          <span>/ {showDetails.number_of_episodes || '?'}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="tracking-group">
                    <label>Score</label>
                    <select 
                      value={score} 
                      onChange={(e) => {
                        const newScore = Number(e.target.value);
                        if (!isNaN(newScore)) {
                          handleScoreChange(newScore);
                        }
                      }}
                      className="score-select"
                    >
                      <option value="0">Rate</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="login-required">
                  Please <Link to="/login">log in</Link> to track your shows
                </div>
              )}
            </div>
            
            <div className="cast-section">
              <h3 className="section-title">Cast</h3>
              <div className="actors-list">
                {actors.slice(0, 12).map((actor) => (
                  <div key={actor.id} className="actor-item">
                    {/* Character Section */}
                    <div className="character-section" onClick={() => handleActorClick(actor.id)}>
                      <p className="char-name">{actor.character || 'Unknown Character'}</p>
                    </div>

                    {/* Actor Section */}
                    <div className="actor-section" onClick={() => handleActorClick(actor.id)}>
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                          alt={actor.name}
                          className="actor-image"
                        />
                      ) : (
                        <div className="missing-actor-image">
                          <img src="https://media.istockphoto.com/id/1155863389/vector/old-ripped-missing-paper-poster-wild-west-style-brochure.jpg?s=612x612&w=0&k=20&c=WI2stQLQhc1DhKoTsbfT3aiemqikXOYuhez2UND3sjM=" alt="Actor Not Available" className="missing-actor-image" />
                        </div>
                      )}
                      <p className="actor-name">{actor.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actor Details Modal */}
{selectedActor && (
  <div className="actor-details-modal">
    <div className="actor-details-content">
      <button className="close-button" onClick={closeActorModal}>×</button>

      <div className="actor-details-left">
        <img
          src={`https://image.tmdb.org/t/p/w300${selectedActor.profile_path}`}
          alt={selectedActor.name}
          className="actor-details-image"
        />
        <h2>{selectedActor.name}</h2>
      </div>

      <div className="actor-details-right">
        <div className="actor-details-bio">
          <p><strong>Born:</strong> {selectedActor.birthday || 'N/A'}</p>
          <p>{selectedActor.biography || 'No biography available.'}</p>
        </div>

        <div className="actor-shows-section">
          <h3>Latest TV Shows</h3>
          <div className="actor-shows-grid">
            {actorMovies && actorMovies.map((show) => (
              <Link
                to={`/show/${show.id}`}
                key={show.id}
                className="actor-show-card"
                onClick={closeActorModal}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
                />
                <h3>{show.name}</h3>
                <p>({show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A'})</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{showProgressModal && <ProgressModal />}

    </div>
  );
}

export default ShowDetails;
