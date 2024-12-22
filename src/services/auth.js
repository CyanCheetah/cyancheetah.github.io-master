const API_URL = 'http://localhost:5001/api';

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    return data;
  },

  async register(username, email, password) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return data;
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get user data');
    return response.json();
  },

  async addToWatchlist(showId, showTitle, posterPath) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ showId, showTitle, posterPath })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add to watchlist');
    }
    return response.json();
  },

  async getWatchlist() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/watchlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get watchlist');
    return response.json();
  },

  async removeFromWatchlist(showId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/watchlist/${showId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to remove from watchlist');
    return response.json();
  },

  async updateProfile(profileData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async getWatchedShows() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/watched`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get watched shows');
    return response.json();
  },

  async markAsWatched(showId, showTitle, posterPath) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/watched`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ showId, showTitle, posterPath })
    });

    if (!response.ok) throw new Error('Failed to mark as watched');
    return response.json();
  },

  async getShowProgress() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get show progress');
    return response.json();
  },

  async updateShowProgress(showId, season, episode, status = 'watching') {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/progress/${showId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ season, episode, status })
    });

    if (!response.ok) throw new Error('Failed to update progress');
    return response.json();
  },

  async removeFromProgress(showId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/progress/${showId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to remove from progress');
    return response.json();
  },

  async removeFromWatched(showId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/watched/${showId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to remove from watched');
    return response.json();
  },

  async updateShowStatus(showId, showTitle, posterPath, status, score, episodesWatched) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/shows/${showId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        showTitle,
        posterPath,
        status,
        score,
        episodesWatched
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update show status');
    }
    return response.json();
  }
}; 