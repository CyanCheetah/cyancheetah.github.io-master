import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const ActorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actorData } = location.state || {};
  const [recentShows, setRecentShows] = useState([]);
  const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

  useEffect(() => {
    const fetchRecentShows = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${actorData.id}/tv_credits?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        const sortedShows = data.cast
          .filter(show => show.first_air_date)
          .sort((a, b) => new Date(b.first_air_date) - new Date(a.first_air_date))
          .slice(0, 10);
        setRecentShows(sortedShows);
      } catch (error) {
        console.error('Error fetching shows:', error);
      }
    };

    if (actorData?.id) {
      fetchRecentShows();
    }
  }, [actorData]);

  if (!actorData) {
    navigate('/');
    return null;
  }

  return (
    <div className="actor-page">
      <div className="actor-header">
        <img
          src={`https://image.tmdb.org/t/p/w300${actorData.profile_path}`}
          alt={actorData.name}
          className="actor-image"
        />
        <h1>{actorData.name}</h1>
      </div>
      <div className="actor-info">
        <p><strong>Born:</strong> {actorData.birthday || 'N/A'}</p>
        <p>{actorData.biography || 'No biography available.'}</p>
      </div>
      
      <div className="actor-recent-shows">
        <h2>Recent TV Shows</h2>
        <div className="shows-grid">
          {recentShows.map(show => (
            <Link to={`/show/${show.id}`} key={show.id} className="show-card">
              <img 
                src={`https://image.tmdb.org/t/p/w200${show.poster_path}`} 
                alt={show.name}
              />
              <div className="show-info">
                <h3>{show.name}</h3>
                <p>({show.first_air_date?.split('-')[0] || 'N/A'})</p>
                <p className="character">as {show.character}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default ActorPage; 