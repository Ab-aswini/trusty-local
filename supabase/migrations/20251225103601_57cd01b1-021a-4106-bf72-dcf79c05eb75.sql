-- Add social media link columns to shops table
ALTER TABLE public.shops 
ADD COLUMN instagram_url text,
ADD COLUMN facebook_url text,
ADD COLUMN google_maps_url text;