-- Create storage bucket for shop and product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true);

-- RLS policies for shop-images bucket
CREATE POLICY "Anyone can view shop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

CREATE POLICY "Authenticated users can upload shop images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-images');

CREATE POLICY "Users can update their own shop images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own shop images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);