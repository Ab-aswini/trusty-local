-- Add category column to products table
ALTER TABLE public.products ADD COLUMN category text;

-- Create an index for faster filtering
CREATE INDEX idx_products_category ON public.products(category);

-- Update existing RLS policies are fine, no changes needed