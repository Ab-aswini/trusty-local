-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- RLS Policies
CREATE POLICY "Anyone can view product images for active products"
ON public.product_images
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON s.id = p.shop_id
  WHERE p.id = product_images.product_id
  AND p.is_active = true
  AND s.vendor_status = 'approved'
));

CREATE POLICY "Shop owners can manage their product images"
ON public.product_images
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON s.id = p.shop_id
  WHERE p.id = product_images.product_id
  AND s.owner_id = auth.uid()
));