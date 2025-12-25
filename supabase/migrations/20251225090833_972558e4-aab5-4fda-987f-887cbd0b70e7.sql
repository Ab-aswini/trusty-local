-- Create role enum for user roles
CREATE TYPE public.app_role AS ENUM ('consumer', 'vendor', 'admin', 'super_admin');

-- Create trust state enum
CREATE TYPE public.trust_state AS ENUM ('new', 'active', 'reliable', 'trusted');

-- Create availability status enum
CREATE TYPE public.availability_status AS ENUM ('open', 'closing_soon', 'closed');

-- Create price type enum
CREATE TYPE public.price_type AS ENUM ('fixed', 'range', 'discount', 'enquiry');

-- Create vendor application status enum
CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create warning level enum for vendor abuse system
CREATE TYPE public.warning_level AS ENUM ('warning', 'ai_limit', 'visibility_reduced', 'suspended');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'consumer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  area TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table (hybrid system)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_system BOOLEAN NOT NULL DEFAULT true,
  suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sub_category TEXT,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  story TEXT,
  image_url TEXT,
  availability_status availability_status NOT NULL DEFAULT 'closed',
  closing_time TIMESTAMP WITH TIME ZONE,
  availability_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trust_state trust_state NOT NULL DEFAULT 'new',
  interaction_count INTEGER NOT NULL DEFAULT 0,
  positive_tag_count INTEGER NOT NULL DEFAULT 0,
  gst_number TEXT,
  udyam_number TEXT,
  vendor_status vendor_status NOT NULL DEFAULT 'pending',
  warning_level warning_level,
  warning_reason TEXT,
  ai_usage_count INTEGER NOT NULL DEFAULT 0,
  ai_usage_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_type price_type NOT NULL DEFAULT 'enquiry',
  price_fixed DECIMAL(10,2),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  price_original DECIMAL(10,2),
  price_discounted DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interactions table
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'whatsapp_click',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rating_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  rated BOOLEAN NOT NULL DEFAULT false
);

-- Create ratings table (behavioral tags)
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID REFERENCES public.interactions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  is_honest BOOLEAN NOT NULL DEFAULT false,
  is_respectful BOOLEAN NOT NULL DEFAULT false,
  is_helpful BOOLEAN NOT NULL DEFAULT false,
  is_calm BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for consumer safety
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_shops table for consumer favorites
CREATE TABLE public.saved_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, shop_id)
);

-- Create audit_log table for admin actions
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view approved categories"
  ON public.categories FOR SELECT
  USING (is_system = true OR approved = true);

CREATE POLICY "Authenticated users can suggest categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (is_system = false AND suggested_by = auth.uid());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for shops (public read for approved)
CREATE POLICY "Anyone can view approved shops"
  ON public.shops FOR SELECT
  USING (vendor_status = 'approved' AND (warning_level IS NULL OR warning_level != 'suspended'));

CREATE POLICY "Owners can view their own shops"
  ON public.shops FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage their own shops"
  ON public.shops FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create shops"
  ON public.shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all shops"
  ON public.shops FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for products (public read for active in approved shops)
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id
      AND shops.vendor_status = 'approved'
    )
  );

CREATE POLICY "Shop owners can manage their products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- RLS Policies for interactions
CREATE POLICY "Users can view their own interactions"
  ON public.interactions FOR SELECT
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can create interactions"
  ON public.interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Shop owners can view interactions for their shops"
  ON public.interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = interactions.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings for their interactions"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interactions
      WHERE interactions.id = ratings.interaction_id
      AND interactions.consumer_id = auth.uid()
      AND interactions.rated = false
      AND interactions.rating_expires_at > now()
    )
  );

-- RLS Policies for reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
  ON public.reports FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for saved_shops
CREATE POLICY "Users can manage their saved shops"
  ON public.saved_shops FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for audit_log
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create audit log entries"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND auth.uid() = admin_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default consumer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consumer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update trust state based on ratings
CREATE OR REPLACE FUNCTION public.update_trust_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  shop_record RECORD;
  new_trust_state trust_state;
  positive_tags INTEGER;
BEGIN
  -- Count positive tags for this rating
  positive_tags := 0;
  IF NEW.is_honest THEN positive_tags := positive_tags + 1; END IF;
  IF NEW.is_respectful THEN positive_tags := positive_tags + 1; END IF;
  IF NEW.is_helpful THEN positive_tags := positive_tags + 1; END IF;
  IF NEW.is_calm THEN positive_tags := positive_tags + 1; END IF;

  -- Update shop stats
  UPDATE public.shops
  SET 
    interaction_count = interaction_count + 1,
    positive_tag_count = positive_tag_count + positive_tags,
    updated_at = now()
  WHERE id = NEW.shop_id
  RETURNING * INTO shop_record;

  -- Derive trust state
  IF shop_record.interaction_count >= 20 AND 
     (shop_record.positive_tag_count::float / (shop_record.interaction_count * 4)) >= 0.8 THEN
    new_trust_state := 'trusted';
  ELSIF shop_record.interaction_count >= 10 AND 
        (shop_record.positive_tag_count::float / (shop_record.interaction_count * 4)) >= 0.6 THEN
    new_trust_state := 'reliable';
  ELSIF shop_record.interaction_count >= 3 THEN
    new_trust_state := 'active';
  ELSE
    new_trust_state := 'new';
  END IF;

  -- Update trust state if changed
  IF shop_record.trust_state != new_trust_state THEN
    UPDATE public.shops
    SET trust_state = new_trust_state
    WHERE id = NEW.shop_id;
  END IF;

  -- Mark interaction as rated
  UPDATE public.interactions
  SET rated = true
  WHERE id = NEW.interaction_id;

  RETURN NEW;
END;
$$;

-- Trigger for trust state updates
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_trust_state();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, icon, is_system, approved) VALUES
('Grocery', '🛒', true, true),
('Fruits & Vegetables', '🍎', true, true),
('Clothing', '👕', true, true),
('Electronics', '📱', true, true),
('Services', '🔧', true, true),
('Food & Restaurants', '🍽️', true, true),
('Health & Wellness', '💊', true, true),
('Home & Living', '🏠', true, true),
('Beauty & Personal Care', '💄', true, true),
('Education & Training', '📚', true, true),
('Automotive', '🚗', true, true),
('Professional Services', '💼', true, true);