-- Add new columns to ratings table for reviews
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5);
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS review_text VARCHAR(200);
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS is_patient BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS is_clear_communication BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'whatsapp';
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS reviewer_display_name TEXT;

-- Create consumer_trust table for internal trust tracking
CREATE TABLE IF NOT EXISTS public.consumer_trust (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  trust_score INTEGER NOT NULL DEFAULT 0,
  trust_level TEXT NOT NULL DEFAULT 'medium' CHECK (trust_level IN ('low', 'medium', 'high')),
  positive_interactions INTEGER NOT NULL DEFAULT 0,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on consumer_trust
ALTER TABLE public.consumer_trust ENABLE ROW LEVEL SECURITY;

-- Users can only view their own trust data
CREATE POLICY "Users can view their own trust" 
ON public.consumer_trust 
FOR SELECT 
USING (auth.uid() = user_id);

-- System/triggers can manage trust (insert)
CREATE POLICY "System can manage trust data" 
ON public.consumer_trust 
FOR ALL 
USING (auth.uid() = user_id);

-- Create vendor_feedback table (vendor rates consumer behavior only)
CREATE TABLE IF NOT EXISTS public.vendor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  consumer_id UUID NOT NULL,
  interaction_id UUID NOT NULL,
  is_calm BOOLEAN NOT NULL DEFAULT false,
  is_respectful BOOLEAN NOT NULL DEFAULT false,
  is_punctual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, consumer_id, interaction_id)
);

-- Enable RLS on vendor_feedback
ALTER TABLE public.vendor_feedback ENABLE ROW LEVEL SECURITY;

-- Vendors can view feedback they gave
CREATE POLICY "Vendors can view their feedback" 
ON public.vendor_feedback 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM shops WHERE shops.id = vendor_feedback.shop_id AND shops.owner_id = auth.uid()
));

-- Vendors can create feedback for interactions with their shop
CREATE POLICY "Vendors can create feedback" 
ON public.vendor_feedback 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM shops WHERE shops.id = vendor_feedback.shop_id AND shops.owner_id = auth.uid()
) AND EXISTS (
  SELECT 1 FROM interactions WHERE interactions.id = vendor_feedback.interaction_id AND interactions.shop_id = vendor_feedback.shop_id
));

-- Function to update consumer trust when they submit a review
CREATE OR REPLACE FUNCTION public.update_consumer_trust_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reviewer_user_id UUID;
  current_trust RECORD;
  new_trust_level TEXT;
BEGIN
  -- Get the consumer_id from the interaction
  SELECT consumer_id INTO reviewer_user_id 
  FROM interactions 
  WHERE id = NEW.interaction_id;
  
  IF reviewer_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert consumer trust record
  INSERT INTO consumer_trust (user_id, trust_score, positive_interactions, total_interactions)
  VALUES (reviewer_user_id, 10, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    trust_score = consumer_trust.trust_score + 10,
    positive_interactions = consumer_trust.positive_interactions + 1,
    total_interactions = consumer_trust.total_interactions + 1,
    updated_at = now();

  -- Update trust level based on score
  SELECT * INTO current_trust FROM consumer_trust WHERE user_id = reviewer_user_id;
  
  IF current_trust.trust_score >= 100 THEN
    new_trust_level := 'high';
  ELSIF current_trust.trust_score >= 30 THEN
    new_trust_level := 'medium';
  ELSE
    new_trust_level := 'low';
  END IF;

  UPDATE consumer_trust SET trust_level = new_trust_level WHERE user_id = reviewer_user_id;

  RETURN NEW;
END;
$$;

-- Create trigger for consumer trust update
DROP TRIGGER IF EXISTS update_consumer_trust_trigger ON ratings;
CREATE TRIGGER update_consumer_trust_trigger
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_consumer_trust_on_review();

-- Function to update consumer trust when vendor gives positive feedback
CREATE OR REPLACE FUNCTION public.update_consumer_trust_on_feedback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  feedback_score INTEGER := 0;
  current_trust RECORD;
  new_trust_level TEXT;
BEGIN
  -- Calculate feedback score (positive tags only)
  IF NEW.is_calm THEN feedback_score := feedback_score + 5; END IF;
  IF NEW.is_respectful THEN feedback_score := feedback_score + 5; END IF;
  IF NEW.is_punctual THEN feedback_score := feedback_score + 5; END IF;

  -- Upsert consumer trust record
  INSERT INTO consumer_trust (user_id, trust_score, total_interactions)
  VALUES (NEW.consumer_id, feedback_score, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    trust_score = consumer_trust.trust_score + feedback_score,
    total_interactions = consumer_trust.total_interactions + 1,
    updated_at = now();

  -- Update trust level based on score
  SELECT * INTO current_trust FROM consumer_trust WHERE user_id = NEW.consumer_id;
  
  IF current_trust.trust_score >= 100 THEN
    new_trust_level := 'high';
  ELSIF current_trust.trust_score >= 30 THEN
    new_trust_level := 'medium';
  ELSE
    new_trust_level := 'low';
  END IF;

  UPDATE consumer_trust SET trust_level = new_trust_level WHERE user_id = NEW.consumer_id;

  RETURN NEW;
END;
$$;

-- Create trigger for vendor feedback
DROP TRIGGER IF EXISTS update_consumer_trust_on_feedback_trigger ON vendor_feedback;
CREATE TRIGGER update_consumer_trust_on_feedback_trigger
AFTER INSERT ON vendor_feedback
FOR EACH ROW
EXECUTE FUNCTION update_consumer_trust_on_feedback();

-- Add trigger for updated_at on consumer_trust
CREATE TRIGGER update_consumer_trust_updated_at
BEFORE UPDATE ON public.consumer_trust
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();