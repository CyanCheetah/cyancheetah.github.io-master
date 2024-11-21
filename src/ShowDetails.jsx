import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './App.css';
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
  const { id } = useParams();
  const navigate = useNavigate();

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

  const handleActorClick = async (actorId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const actorData = await response.json();
      setSelectedActor(actorData);

      // Fetch actor's TV show credits (use tv_credits instead of movie_credits)
      const showsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}/tv_credits?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const showsData = await showsResponse.json();

      // Filter and sort the latest TV shows based on first air date
      const latestShows = showsData.cast
        .filter((show) => show.first_air_date) // Filter TV shows with a first air date
        .sort((a, b) => new Date(b.first_air_date) - new Date(a.first_air_date)); // Sort by most recent first air date

      setActorMovies(latestShows); // Set the actor's latest TV shows
    } catch (error) {
      console.error('Error fetching actor details:', error);
    }
  };


  const closeActorModal = () => {
    setSelectedActor(null);
    setActorMovies([]);
  };

  const handleMarkAsWatched = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/account/{account_id}/watchlist?api_key=${TMDB_API_KEY}&session_id=YOUR_SESSION_ID`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_type: 'tv',
            media_id: id,
            watchlist: true,
          }),
        }
      );

      if (response.ok) {
        setWatched(true); // Update watched status
      } else {
        console.error('Error marking show as watched:', await response.json());
      }
    } catch (error) {
      console.error('Error marking show as watched:', error);
    }
  };

  return (
    <div className="show-details">

      {/* Show Details Content */}
      {showDetails && !isSearchActive && (
        <div className="show-details-content">
          <div className="show-details-left">
            <img
              src={`https://image.tmdb.org/t/p/w1280${showDetails.poster_path}`}
              alt={showDetails.name}
              className="show-poster-img"
            />
            {/* Mark as Watched Button */}
            <button className="watch-button" onClick={handleMarkAsWatched} disabled={watched}>
              {watched ? 'Watched' : 'Mark as Watched'}
            </button>
          </div>
          <div className="show-details-right">
            <span className="show-title">{showDetails.name}</span>
            <span className="show-year">{new Date(showDetails.first_air_date).getFullYear()}</span>
            <p>{showDetails.overview}</p>
            <h3>Genres: {showDetails.genres.map((genre) => genre.name).join(', ')}</h3>
            <h3>Average Rating: {showDetails.vote_average}</h3>
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
      )}

      {/* Actor Details Modal */}
      {selectedActor && (
        <div className="actor-details-modal">
          <div className="actor-details-content">
            <button className="close-button" onClick={closeActorModal}>
              ×
            </button>

            {/* Left side: Image and Name */}
            <div className="actor-details-left">
              <img
                src={`https://image.tmdb.org/t/p/w300${selectedActor.profile_path}`}
                alt={selectedActor.name}
                className="actor-details-image"
              />
              <h2>{selectedActor.name}</h2>
            </div>

            {/* Right side: Biography and Known For Movies */}
            <div className="actor-details-right">
              <div className="actor-details-bio">
                <p><strong>Born:</strong> {selectedActor.birthday || 'N/A'}</p>
                <p>{selectedActor.biography || 'No biography available.'}</p>
              </div>

              {/* Actor's Latest TV Shows */}
              <div className="latest-shows">
                <h3>Latest TV Shows</h3>
                {actorMovies && actorMovies.map((show) => (  // Display TV shows here
                  <Link
                    to={`/show/${show.id}`}
                    key={show.id}
                    onClick={() => closeActorModal()}  // Close the modal when a show is clicked
                  >
                    <div className="known-for-show">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                        alt={show.name}  // Use show.name for TV show
                      />
                      <div>
                        <p>{show.name}</p>  {/* Show name */}
                        <p>({show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A'})</p>  {/* Show first air date */}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ShowDetails;
