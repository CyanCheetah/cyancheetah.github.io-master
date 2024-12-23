// Note: You'll need to get a MAL API client ID
const MAL_CLIENT_ID = ' 4f7a5e919eeb86ea31324e7dd86f3634 ';

export const animeService = {
  async searchAnime(query) {
    try {
      const response = await fetch(
        `https://api.myanimelist.net/v2/anime?q=${query}&limit=10`,
        {
          headers: {
            'X-MAL-CLIENT-ID': MAL_CLIENT_ID
          }
        }
      );
      const data = await response.json();
      return data.data.map(item => ({
        id: item.node.id,
        title: item.node.title,
        image_url: item.node.main_picture?.large,
        type: 'anime',
        year: item.node.start_date?.split('-')[0],
        score: item.node.mean
      }));
    } catch (error) {
      console.error('Error fetching from MAL:', error);
      return [];
    }
  }
}; 