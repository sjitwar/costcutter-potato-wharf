-- Supabase Database Schema for CostCutter Products
-- Run this SQL in your Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cost_price DECIMAL(10,2),
  retail_price DECIMAL(10,2),
  pack_quantity INTEGER,
  unit_size TEXT,
  unit_description TEXT,
  barcode TEXT,
  supplier_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product votes table
CREATE TABLE IF NOT EXISTS product_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- Prevent duplicate votes from same user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_product_votes_product_id ON product_votes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_votes_user_id ON product_votes(user_id);

-- Create a view for products with vote counts
CREATE OR REPLACE VIEW products_with_votes AS
SELECT 
  p.*,
  COALESCE(v.vote_count, 0) as vote_count,
  COALESCE(v.last_vote, p.created_at) as last_vote
FROM products p
LEFT JOIN (
  SELECT 
    product_id,
    COUNT(*) as vote_count,
    MAX(created_at) as last_vote
  FROM product_votes
  GROUP BY product_id
) v ON p.id = v.product_id;

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_votes ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read access)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Policies for votes (users can vote, but only once per product)
CREATE POLICY "Users can vote on products" ON product_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all votes" ON product_votes
  FOR SELECT USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON product_votes TO anon, authenticated;
GRANT SELECT ON products_with_votes TO anon, authenticated;
