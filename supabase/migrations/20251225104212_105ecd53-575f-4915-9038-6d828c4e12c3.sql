-- Add established year column to shops table
ALTER TABLE public.shops 
ADD COLUMN established_year integer;