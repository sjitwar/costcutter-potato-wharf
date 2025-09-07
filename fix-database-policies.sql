-- Fix database policies to allow product creation
-- Run this SQL in your Supabase SQL Editor

-- Add INSERT policy for products (allow anyone to create products)
CREATE POLICY "Users can create products" ON products
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for products (allow anyone to update products)
CREATE POLICY "Users can update products" ON products
  FOR UPDATE USING (true);

-- Add DELETE policy for products (allow anyone to delete products)
CREATE POLICY "Users can delete products" ON products
  FOR DELETE USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'product_votes');
