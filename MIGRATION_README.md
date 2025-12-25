# TrustLocal - Self-Hosting Migration Guide

Complete guide to migrate and self-host the TrustLocal application on your own cloud infrastructure.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Storage Configuration](#storage-configuration)
6. [Edge Functions](#edge-functions)
7. [Migration Steps](#migration-steps)
8. [Environment Variables](#environment-variables)
9. [Deployment Options](#deployment-options)
10. [Replacing Lovable AI](#replacing-lovable-ai)
11. [Post-Migration Checklist](#post-migration-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

TrustLocal is a vendor discovery and rating platform that connects consumers with local businesses. Key features include:

- **Vendor Management**: Shop registration, product catalog, availability status
- **Rating System**: Customer ratings with trust badges and review system
- **Consumer Trust**: Two-way trust scoring for both vendors and consumers
- **AI Features**: AI-powered text generation for descriptions and reviews
- **Admin Dashboard**: Vendor approval, reporting, and moderation tools

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| TanStack Query | Data fetching & caching |
| React Router | Client-side routing |
| Supabase | Backend (Auth, Database, Storage, Edge Functions) |
| Recharts | Analytics charts |

---

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # Custom components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── integrations/        # Supabase client & types
│   ├── types/               # TypeScript type definitions
│   └── lib/                 # Utility functions
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── ai-studio/       # AI image & description generation
│   │   ├── ai-text-helper/  # AI text generation helper
│   │   └── send-email-notification/  # Email notifications
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase configuration
└── public/                  # Static assets
```

---

## Database Schema

### Enums

```sql
-- User roles
CREATE TYPE app_role AS ENUM ('consumer', 'vendor', 'admin', 'super_admin');

-- Shop trust levels
CREATE TYPE trust_state AS ENUM ('new', 'active', 'reliable', 'trusted');

-- Shop availability
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'closed');

-- Vendor approval status
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected');

-- Warning levels for moderation
CREATE TYPE warning_level AS ENUM ('warning', 'suspended');

-- Product pricing types
CREATE TYPE price_type AS ENUM ('fixed', 'range', 'enquiry');
```

### Tables

#### 1. profiles
Stores user profile information.

```sql
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  area TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. user_roles
Maps users to their application roles.

```sql
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role DEFAULT 'consumer',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. categories
Product/shop categories (system and user-suggested).

```sql
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  is_system BOOLEAN DEFAULT true,
  approved BOOLEAN DEFAULT false,
  suggested_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. shops
Vendor shop information.

```sql
CREATE TABLE public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  sub_category TEXT,
  image_url TEXT,
  story TEXT,
  established_year INTEGER,
  gst_number TEXT,
  udyam_number TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  google_maps_url TEXT,
  availability_status availability_status DEFAULT 'closed',
  availability_updated_at TIMESTAMPTZ DEFAULT now(),
  closing_time TIMESTAMPTZ,
  trust_state trust_state DEFAULT 'new',
  interaction_count INTEGER DEFAULT 0,
  positive_tag_count INTEGER DEFAULT 0,
  vendor_status vendor_status DEFAULT 'pending',
  warning_level warning_level,
  warning_reason TEXT,
  is_premium BOOLEAN DEFAULT false,
  ai_usage_count INTEGER DEFAULT 0,
  ai_usage_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. products
Products offered by shops.

```sql
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price_type price_type DEFAULT 'enquiry',
  price_fixed NUMERIC,
  price_min NUMERIC,
  price_max NUMERIC,
  price_original NUMERIC,
  price_discounted NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 6. product_images
Multiple images per product.

```sql
CREATE TABLE public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 7. interactions
Tracks user interactions with shops.

```sql
CREATE TABLE public.interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id),
  consumer_id UUID,
  interaction_type TEXT DEFAULT 'whatsapp_click',
  rated BOOLEAN DEFAULT false,
  rating_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 8. ratings
Customer ratings and reviews.

```sql
CREATE TABLE public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID NOT NULL REFERENCES interactions(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  review_text VARCHAR(500),
  reviewer_display_name TEXT,
  is_honest BOOLEAN DEFAULT false,
  is_respectful BOOLEAN DEFAULT false,
  is_helpful BOOLEAN DEFAULT false,
  is_calm BOOLEAN DEFAULT false,
  is_patient BOOLEAN DEFAULT false,
  is_clear_communication BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 9. consumer_trust
Trust scores for consumers.

```sql
CREATE TABLE public.consumer_trust (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  trust_score INTEGER DEFAULT 0,
  trust_level TEXT DEFAULT 'medium',
  positive_interactions INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 10. vendor_feedback
Vendor feedback about consumers.

```sql
CREATE TABLE public.vendor_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id),
  consumer_id UUID NOT NULL,
  interaction_id UUID NOT NULL REFERENCES interactions(id),
  is_punctual BOOLEAN DEFAULT false,
  is_respectful BOOLEAN DEFAULT false,
  is_calm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 11. reports
Shop reports for moderation.

```sql
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id),
  reporter_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 12. saved_shops
User's saved/bookmarked shops.

```sql
CREATE TABLE public.saved_shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_id UUID NOT NULL REFERENCES shops(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, shop_id)
);
```

#### 13. audit_log
Admin action audit trail.

```sql
CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Database Functions

#### 1. has_role
Check if user has a specific role.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

#### 2. is_admin
Check if user is admin or super_admin.

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  )
$$;
```

#### 3. handle_new_user
Trigger function for new user registration.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consumer');
  
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 4. update_trust_state
Updates shop trust state when ratings are added.

```sql
CREATE OR REPLACE FUNCTION public.update_trust_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  shop_record RECORD;
  new_trust_state trust_state;
  positive_tags INTEGER;
BEGIN
  positive_tags := 0;
  IF NEW.is_honest THEN positive_tags := positive_tags + 1; END IF;
  IF NEW.is_respectful THEN positive_tags := positive_tags + 1; END IF;
  IF NEW.is_helpful THEN positive_tags := positive_tags + 1; END IF;
  IF NEW.is_calm THEN positive_tags := positive_tags + 1; END IF;

  UPDATE public.shops
  SET 
    interaction_count = interaction_count + 1,
    positive_tag_count = positive_tag_count + positive_tags,
    updated_at = now()
  WHERE id = NEW.shop_id
  RETURNING * INTO shop_record;

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

  IF shop_record.trust_state != new_trust_state THEN
    UPDATE public.shops SET trust_state = new_trust_state WHERE id = NEW.shop_id;
  END IF;

  UPDATE public.interactions SET rated = true WHERE id = NEW.interaction_id;

  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_trust_state();
```

#### 5. update_consumer_trust_on_review
Updates consumer trust when they leave reviews.

```sql
CREATE OR REPLACE FUNCTION public.update_consumer_trust_on_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reviewer_user_id UUID;
  current_trust RECORD;
  new_trust_level TEXT;
BEGIN
  SELECT consumer_id INTO reviewer_user_id 
  FROM interactions WHERE id = NEW.interaction_id;
  
  IF reviewer_user_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO consumer_trust (user_id, trust_score, positive_interactions, total_interactions)
  VALUES (reviewer_user_id, 10, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    trust_score = consumer_trust.trust_score + 10,
    positive_interactions = consumer_trust.positive_interactions + 1,
    total_interactions = consumer_trust.total_interactions + 1,
    updated_at = now();

  SELECT * INTO current_trust FROM consumer_trust WHERE user_id = reviewer_user_id;
  
  IF current_trust.trust_score >= 100 THEN new_trust_level := 'high';
  ELSIF current_trust.trust_score >= 30 THEN new_trust_level := 'medium';
  ELSE new_trust_level := 'low';
  END IF;

  UPDATE consumer_trust SET trust_level = new_trust_level WHERE user_id = reviewer_user_id;

  RETURN NEW;
END;
$$;
```

#### 6. update_consumer_trust_on_feedback
Updates consumer trust when vendors give feedback.

```sql
CREATE OR REPLACE FUNCTION public.update_consumer_trust_on_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  feedback_score INTEGER := 0;
  current_trust RECORD;
  new_trust_level TEXT;
BEGIN
  IF NEW.is_calm THEN feedback_score := feedback_score + 5; END IF;
  IF NEW.is_respectful THEN feedback_score := feedback_score + 5; END IF;
  IF NEW.is_punctual THEN feedback_score := feedback_score + 5; END IF;

  INSERT INTO consumer_trust (user_id, trust_score, total_interactions)
  VALUES (NEW.consumer_id, feedback_score, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    trust_score = consumer_trust.trust_score + feedback_score,
    total_interactions = consumer_trust.total_interactions + 1,
    updated_at = now();

  SELECT * INTO current_trust FROM consumer_trust WHERE user_id = NEW.consumer_id;
  
  IF current_trust.trust_score >= 100 THEN new_trust_level := 'high';
  ELSIF current_trust.trust_score >= 30 THEN new_trust_level := 'medium';
  ELSE new_trust_level := 'low';
  END IF;

  UPDATE consumer_trust SET trust_level = new_trust_level WHERE user_id = NEW.consumer_id;

  RETURN NEW;
END;
$$;
```

---

## Storage Configuration

### Bucket: shop-images

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true);

-- RLS Policies
CREATE POLICY "Anyone can view shop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

CREATE POLICY "Authenticated users can upload shop images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own shop images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own shop images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Edge Functions

### 1. ai-studio

AI-powered product description and image enhancement.

**Location**: `supabase/functions/ai-studio/index.ts`

**Purpose**:
- Generate product descriptions from images
- Enhance product images
- Daily usage limits per shop (10 requests/day)

**Required Secrets**:
- `LOVABLE_API_KEY` - For Lovable AI Gateway (or replace with your AI provider)

### 2. ai-text-helper

AI text generation for descriptions, stories, and reviews.

**Location**: `supabase/functions/ai-text-helper/index.ts`

**Purpose**:
- Generate product descriptions
- Create shop stories
- Suggest review text

**Required Secrets**:
- `LOVABLE_API_KEY` - For Lovable AI Gateway (or replace with your AI provider)

### 3. send-email-notification

Email notifications for shop status changes and new ratings.

**Location**: `supabase/functions/send-email-notification/index.ts`

**Purpose**:
- Shop approval notifications
- Shop rejection notifications
- New rating notifications

**Required Secrets**:
- `RESEND_API_KEY` - For Resend email service

---

## Migration Steps

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd trustlocal
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key
   - Service Role Key (for edge functions)

### Step 3: Run Database Migrations

Execute these migrations in order using the Supabase SQL Editor:

```bash
# Migration files in supabase/migrations/
1. 20250624172430_wild_garden.sql
2. 20250624180023_long_lagoon.sql
3. 20250624191147_withered_queen.sql
4. 20250625121620_shrill_palace.sql
5. 20250625122014_old_water.sql
6. 20250625124002_bronze_waterfall.sql
7. 20250625125929_silver_gate.sql
8. 20250625130151_golden_cloud.sql
```

Or run all at once:

```bash
# Using Supabase CLI
supabase db push
```

### Step 4: Configure Storage

Run this SQL in Supabase SQL Editor:

```sql
-- Create shop-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 5: Configure Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Step 6: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Deploy all functions
supabase functions deploy ai-studio
supabase functions deploy ai-text-helper
supabase functions deploy send-email-notification
```

### Step 7: Configure Edge Function Secrets

```bash
# Set secrets for edge functions
supabase secrets set LOVABLE_API_KEY=your-ai-api-key
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

### Step 8: Configure Authentication

In Supabase Dashboard → Authentication → Settings:

1. Enable Email provider
2. Enable "Confirm email" or disable for development
3. Configure Google OAuth (optional):
   - Add Google Client ID and Secret
   - Add redirect URL to Google Console

### Step 9: Build and Deploy Frontend

```bash
# Build for production
npm run build

# Preview locally
npm run preview
```

---

## Environment Variables

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Yes |

### Edge Function Secrets

| Secret | Description | Used By |
|--------|-------------|---------|
| `LOVABLE_API_KEY` | AI service API key | ai-studio, ai-text-helper |
| `RESEND_API_KEY` | Resend email API key | send-email-notification |
| `SUPABASE_URL` | Auto-provided by Supabase | All functions |
| `SUPABASE_ANON_KEY` | Auto-provided by Supabase | All functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | All functions |

---

## Deployment Options

### Option 1: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Docker

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /assets {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Build and run**:
```bash
docker build -t trustlocal .
docker run -p 80:80 trustlocal
```

### Option 4: Traditional VPS

```bash
# Build locally
npm run build

# Copy dist folder to server
scp -r dist/* user@server:/var/www/trustlocal/

# Nginx config on server
sudo nano /etc/nginx/sites-available/trustlocal
```

**Nginx config**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/trustlocal;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Replacing Lovable AI

To use OpenAI instead of Lovable AI Gateway:

### Update ai-text-helper/index.ts

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = 'You are a helpful assistant.';
    
    if (context === 'product_description') {
      systemPrompt = 'You are an expert at writing compelling product descriptions for local businesses. Write concise, engaging descriptions that highlight key features and benefits. Keep responses under 200 words.';
    } else if (context === 'shop_story') {
      systemPrompt = 'You are an expert at writing authentic business stories. Create warm, genuine narratives that connect with customers. Keep responses under 300 words.';
    } else if (context === 'review') {
      systemPrompt = 'You are helping customers write helpful reviews. Generate honest, balanced review text based on their experience. Keep responses under 150 words.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    return new Response(JSON.stringify({ 
      generatedText: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

Then set the OpenAI secret:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
```

---

## Post-Migration Checklist

- [ ] Database migrations executed successfully
- [ ] All tables created with correct schemas
- [ ] RLS policies applied to all tables
- [ ] Storage bucket created and configured
- [ ] Edge functions deployed
- [ ] All secrets configured
- [ ] Environment variables set
- [ ] Authentication providers configured
- [ ] Test user registration and login
- [ ] Test shop creation workflow
- [ ] Test rating submission
- [ ] Test AI text generation
- [ ] Test email notifications
- [ ] Frontend deployed and accessible
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

---

## Troubleshooting

### Common Issues

#### 1. "relation does not exist" error
- Ensure all migrations ran in correct order
- Check if table was created: `SELECT * FROM information_schema.tables WHERE table_name = 'table_name';`

#### 2. RLS policy blocking access
- Verify user is authenticated
- Check policy conditions match your use case
- Temporarily disable RLS for debugging: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

#### 3. Edge function not responding
- Check function logs: `supabase functions logs function-name`
- Verify secrets are set: `supabase secrets list`
- Test locally: `supabase functions serve`

#### 4. Storage upload failing
- Check bucket exists and is public
- Verify storage policies allow uploads
- Check file size limits

#### 5. Authentication not working
- Verify Supabase URL and anon key are correct
- Check if email provider is enabled
- Verify redirect URLs for OAuth

### Useful Commands

```bash
# Check Supabase status
supabase status

# View function logs
supabase functions logs ai-text-helper --tail

# Reset database (CAUTION: deletes all data)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Test edge function locally
supabase functions serve ai-text-helper --env-file .env.local
```

---

## Support

For issues specific to:
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **React/Vite**: [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

---

*Last updated: December 2024*
