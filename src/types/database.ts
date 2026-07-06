// ============================================
// TypeScript types for Supabase Database tables
// ============================================

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_vip: boolean;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  category: string; // Slug of category/genre (e.g., 'hanh-dong', 'phieu-luu', 'nhap-vai')
  platform?: 'GBA' | 'JAR'; // Platform type for emulator (GBA or Java J2ME)
  thumbnail_url: string | null;
  file_url: string;
  is_vip_only: boolean;
  release_year: number | null;
  genre: string | null; // Readable name of category/genre (e.g., 'Hành Động', 'Phiêu Lưu')
  total_plays: number;
  rating: number;
  description: string | null;
  controls_info: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  amount: number;
  code: string | null;
  status: 'pending' | 'completed' | 'failed';
  gateway: string | null;
  transaction_date: string | null;
  content: string | null;
  created_at: string;
}

export interface PlayLog {
  id: string;
  user_id: string | null;
  game_id: string;
  duration_minutes: number;
  created_at: string;
}

// Supabase Database type definitions
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Category, 'id'>>;
      };
      games: {
        Row: Game;
        Insert: Omit<Game, 'id' | 'created_at' | 'total_plays' | 'rating'> & {
          id?: string;
          created_at?: string;
          total_plays?: number;
          rating?: number;
          platform?: 'GBA' | 'JAR';
        };
        Update: Partial<Omit<Game, 'id'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Transaction, 'id'>>;
      };
      play_logs: {
        Row: PlayLog;
        Insert: Omit<PlayLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PlayLog, 'id'>>;
      };
    };
  };
}
