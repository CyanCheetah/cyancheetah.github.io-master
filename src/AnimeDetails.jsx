import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ShowDetails.css'; // We'll reuse the ShowDetails styling

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setAnime(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching anime details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!anime) return <div className="error">No anime found</div>;

  return (
    <div className="show-details-container">
      <div className="show-header">
        <div className="show-poster">
          <img 
            src={anime.images?.jpg?.large_image_url || '/placeholder-poster.png'} 
            alt={anime.title} 
          />
        </div>
        <div className="show-info">
          <h1>{anime.title}</h1>
          <h2>{anime.title_japanese}</h2>
          <div className="show-meta">
            <span className="year">
              {anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A'}
            </span>
            <span className="rating">★ {anime.score || 'N/A'}</span>
            <span className="episodes">{anime.episodes || '?'} Episodes</span>
          </div>
          <div className="genres">
            {anime.genres?.map(genre => (
              <span key={genre.mal_id} className="genre-tag">
                {genre.name}
              </span>
            ))}
          </div>
          <div className="synopsis">
            <h3>Synopsis</h3>
            <p>{anime.synopsis || 'No synopsis available.'}</p>
          </div>
          <div className="additional-info">
            <div className="info-item">
              <span className="label">Status:</span>
              <span className="value">{anime.status}</span>
            </div>
            <div className="info-item">
              <span className="label">Studio:</span>
              <span className="value">
                {anime.studios?.map(studio => studio.name).join(', ') || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Rating:</span>
              <span className="value">{anime.rating || 'Not rated'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails; 