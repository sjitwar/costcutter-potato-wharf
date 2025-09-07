import { createClient } from '@supabase/supabase-js';

// Supabase configuration with actual values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zusrhahxxnqchfqnqrgy.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1c3JoYWh4eG5xY2hmcW5xcmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTAzMDIsImV4cCI6MjA3MjY2NjMwMn0.bZwg-zzpeA6_Sr5Hs7iaZuyl4HfLHTSaHs2WI8NCc7A';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  cost_price: number;
  retail_price: number;
  pack_quantity: number;
  unit_size: string;
  unit_description: string;
  barcode: string;
  supplier_code: string;
  created_at?: string;
}

export interface ProductVote {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}

export interface ProductWithVotes extends Product {
  vote_count: number;
  user_has_voted: boolean;
}
