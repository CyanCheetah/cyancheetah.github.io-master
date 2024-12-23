import { supabase } from '../supabaseClient.jsx';

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async register(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getWatchlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'plan_to_watch');
    if (error) throw error;
    return data;
  },

  async addToWatchlist(show_id, show_title, poster_path) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_status')
      .insert([{ 
        show_id, 
        show_title, 
        poster_path, 
        user_id: user.id,
        status: 'plan_to_watch'
      }]);
    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(show_id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('show_status')
      .delete()
      .eq('show_id', show_id)
      .eq('user_id', user.id)
      .eq('status', 'plan_to_watch');
    if (error) throw error;
  },

  async updateShowProgress(show_id, show_title, poster_path, season, episode) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_progress')
      .upsert({
        show_id,
        show_title,
        poster_path,
        current_season: season,
        current_episode: episode,
        user_id: user.id
      });
    if (error) throw error;
    return data;
  },

  async getShowProgress() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_progress')
      .select('*')
      .eq('user_id', user.id);
    if (error) throw error;
    return data;
  },

  async updateShowStatus(show_id, show_title, poster_path, status, score, current_episode) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_status')
      .upsert({
        show_id,
        show_title,
        poster_path,
        status,
        score,
        current_episode,
        user_id: user.id
      });
    if (error) throw error;
    return data;
  },

  async updateShowScore(show_id, score) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_status')
      .update({ score })
      .eq('show_id', show_id)
      .eq('user_id', user.id);
    if (error) throw error;
    return data;
  },

  async getWatchedShows() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('show_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed');
    if (error) throw error;
    return data;
  }
}; 