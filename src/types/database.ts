// Database types for TrustLocal

export type AppRole = 'consumer' | 'vendor' | 'admin' | 'super_admin';
export type TrustState = 'new' | 'active' | 'reliable' | 'trusted';
export type AvailabilityStatus = 'open' | 'closing_soon' | 'closed';
export type PriceType = 'fixed' | 'range' | 'discount' | 'enquiry';
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type WarningLevel = 'warning' | 'ai_limit' | 'visibility_reduced' | 'suspended';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  area: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  parent_id: string | null;
  is_system: boolean;
  suggested_by: string | null;
  approved: boolean;
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  category_id: string | null;
  sub_category: string | null;
  area: string;
  city: string;
  whatsapp_number: string;
  story: string | null;
  image_url: string | null;
  availability_status: AvailabilityStatus;
  closing_time: string | null;
  availability_updated_at: string | null;
  trust_state: TrustState;
  interaction_count: number;
  positive_tag_count: number;
  gst_number: string | null;
  udyam_number: string | null;
  vendor_status: VendorStatus;
  warning_level: WarningLevel | null;
  warning_reason: string | null;
  ai_usage_count: number;
  ai_usage_reset_at: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_type: PriceType;
  price_fixed: number | null;
  price_min: number | null;
  price_max: number | null;
  price_original: number | null;
  price_discounted: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  consumer_id: string | null;
  shop_id: string;
  interaction_type: string;
  created_at: string;
  rating_expires_at: string;
  rated: boolean;
}

export interface Rating {
  id: string;
  interaction_id: string;
  shop_id: string;
  is_honest: boolean;
  is_respectful: boolean;
  is_helpful: boolean;
  is_calm: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  shop_id: string;
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface SavedShop {
  id: string;
  user_id: string;
  shop_id: string;
  created_at: string;
  shop?: Shop;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

// AI Studio types
export interface AIStudioRequest {
  type: 'enhance_image' | 'generate_description' | 'generate_story';
  imageUrl?: string;
  productDetails?: {
    name: string;
    bulletPoints: string[];
  };
  shopDetails?: {
    name: string;
    yearStarted?: string;
    isFamily?: boolean;
    locality?: string;
    specialty?: string;
  };
}

export interface AIStudioResponse {
  success: boolean;
  result?: string;
  error?: string;
}