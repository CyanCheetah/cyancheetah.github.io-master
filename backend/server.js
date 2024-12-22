import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { pool } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Get current user
app.get('/api/user', authenticateToken, (req, res) => {
  // Remove sensitive information
  const { password, ...user } = req.user;
  res.json(user);
});

// Create watchlist table if it doesn't exist
const createWatchlistTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        show_id INTEGER NOT NULL,
        show_title VARCHAR(255) NOT NULL,
        poster_path VARCHAR(255),
        added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, show_id)
      )
    `);
    console.log('Watchlist table created or already exists');
  } catch (error) {
    console.error('Error creating watchlist table:', error);
  }
};

createWatchlistTable();

// Add to watchlist
app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { showId, showTitle, posterPath } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'INSERT INTO watchlist (user_id, show_id, show_title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, showId, showTitle, posterPath]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Show already in watchlist' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get watchlist
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching watchlist for user:', req.user.id); // Debug log
    const result = await pool.query(
      'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );
    console.log('Watchlist items found:', result.rows.length); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Watchlist fetch error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
});

// Remove from watchlist
app.delete('/api/watchlist/:showId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM watchlist WHERE user_id = $1 AND show_id = $2 RETURNING *',
      [req.user.id, req.params.showId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found in watchlist' });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    
    const token = jwt.sign({ userId: result.rows[0].id }, 'your_jwt_secret');
    const { password: _, ...userData } = result.rows[0];
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body); // Debug log
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User found:', result.rows.length > 0); // Debug log
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword); // Debug log
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret');
    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
});

// Add this near your other endpoints
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Update profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { description, profilePicture, favoriteShows } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE users SET description = $1, profile_picture = $2, favorite_shows = $3 WHERE id = $4 RETURNING *',
      [description, profilePicture, favoriteShows, userId]
    );

    const { password: _, ...userData } = result.rows[0];
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark show as watched
app.post('/api/watched', authenticateToken, async (req, res) => {
  try {
    const { showId, showTitle, posterPath } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'INSERT INTO watched_shows (user_id, show_id, show_title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, showId, showTitle, posterPath]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Show already marked as watched' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get watched shows
app.get('/api/watched', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM watched_shows WHERE user_id = $1 ORDER BY watched_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update show progress
app.put('/api/progress/:showId', authenticateToken, async (req, res) => {
  try {
    const { season, episode, status } = req.body;
    const { showId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO show_progress 
       (user_id, show_id, current_season, current_episode, status) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, show_id) 
       DO UPDATE SET 
         current_season = $3, 
         current_episode = $4, 
         status = $5,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, showId, season, episode, status]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get show progress
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM show_progress WHERE user_id = $1 ORDER BY last_updated DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update show status
app.put('/api/shows/:showId/status', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { showId } = req.params;
    const { showTitle, posterPath, status, score, episodesWatched } = req.body;
    const userId = req.user.id;

    // Remove from all lists first
    await client.query('DELETE FROM watchlist WHERE user_id = $1 AND show_id = $2', [userId, showId]);
    await client.query('DELETE FROM show_progress WHERE user_id = $1 AND show_id = $2', [userId, showId]);
    await client.query('DELETE FROM watched_shows WHERE user_id = $1 AND show_id = $2', [userId, showId]);

    // Add to appropriate list based on status
    let result;
    if (status === 'watching') {
      result = await client.query(
        'INSERT INTO show_progress (user_id, show_id, show_title, poster_path, current_episode) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, showId, showTitle, posterPath, episodesWatched]
      );
    } else if (status === 'completed') {
      result = await client.query(
        'INSERT INTO watched_shows (user_id, show_id, show_title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, showId, showTitle, posterPath]
      );
    } else if (status === 'plan_to_watch') {
      result = await client.query(
        'INSERT INTO watchlist (user_id, show_id, show_title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, showId, showTitle, posterPath]
      );
    }

    // Update score if provided
    if (score > 0) {
      await client.query(
        'INSERT INTO show_scores (user_id, show_id, score) VALUES ($1, $2, $3) ON CONFLICT (user_id, show_id) DO UPDATE SET score = $3',
        [userId, showId, score]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get show status
app.get('/api/shows/:showId/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM show_status WHERE user_id = $1 AND show_id = $2',
      [req.user.id, req.params.showId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from progress
app.delete('/api/progress/:showId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM show_progress WHERE user_id = $1 AND show_id = $2 RETURNING *',
      [req.user.id, req.params.showId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found in progress' });
    }

    res.json({ message: 'Removed from progress' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from watched
app.delete('/api/watched/:showId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM watched_shows WHERE user_id = $1 AND show_id = $2 RETURNING *',
      [req.user.id, req.params.showId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found in watched' });
    }

    res.json({ message: 'Removed from watched' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 