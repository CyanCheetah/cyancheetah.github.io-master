export const animeService = {
  /**
   * Searches for anime using the Jikan API (MyAnimeList unofficial API).
   * @param {string} query - The search query for the anime.
   * @returns {Promise<Array>} - A list of anime objects or an empty array if an error occurs.
   */
  async searchAnime(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      console.error('Error: Invalid search query.');
      return [];
    }

    try {
      // Use Jikan API v4
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`
      );

      if (!response.ok) {
        console.error(`Error: Jikan API returned status ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Ensure the response structure is valid
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('Error: Unexpected API response format.', data);
        return [];
      }

      return data.data.map(item => ({
        id: item.mal_id,
        title: item.title,
        image_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
        type: 'anime',
        year: item.aired?.from ? new Date(item.aired.from).getFullYear() : 'N/A',
        score: item.score || 'N/A',
        popularity: item.popularity || 'N/A',
        synopsis: item.synopsis || 'No synopsis available.',
        episodes: item.episodes || '?',
        status: item.status || 'Unknown',
        poster_path: null // Include this as a placeholder for compatibility
      }));
    } catch (error) {
      console.error('Error fetching data from Jikan API:', error.message);
      return [];
    }
  }
};
