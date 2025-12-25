/**
 * SEED DATA FILE - DELETE THIS FILE WHEN READY FOR PRODUCTION
 * 
 * This file contains sample data for testing the TrustLocal app.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create 4 test accounts by signing up through the app:
 *    - superadmin@test.com (Super Admin)
 *    - admin@test.com (Admin)
 *    - vendor@test.com (Vendor)
 *    - user@test.com (Consumer)
 * 
 * 2. After creating accounts, run the seed function from browser console:
 *    - Import and call: seedTestData()
 * 
 * 3. To clean up all test data:
 *    - Call: cleanupTestData()
 */

import { supabase } from '@/integrations/supabase/client';

// Test account emails - create these accounts first via the Auth page
export const TEST_ACCOUNTS = {
  superAdmin: 'superadmin@test.com',
  admin: 'admin@test.com',
  vendor: 'vendor@test.com',
  consumer: 'user@test.com',
};

// Category IDs from existing database
const CATEGORY_IDS = {
  grocery: '01f49e4e-6750-456a-b242-05d9f35d7824',
  fruitsVegetables: '16a0d831-c344-4417-b544-d175f065f2a9',
  clothing: 'e36a878b-a51e-4115-be9a-d146bc64e932',
  electronics: 'c8f47e21-5f91-4416-8648-948356d70edc',
  services: '2b10af4a-1737-4bfc-9c45-0b0b9d5435b4',
  foodRestaurants: 'f050fb4d-c5c5-457f-a288-9c1507b8d5bc',
  healthWellness: '3cd2a652-099b-4bb6-894d-b7bc024daeaa',
  homeLiving: 'c45c51c1-d0a0-4f84-bbd8-03abb252343f',
  beautyPersonalCare: '478b9a05-4702-40ae-afe4-bb2f2f023704',
  educationTraining: 'e60547c4-d30a-480a-a588-c29227f7f334',
};

// Helper to get user ID by email
async function getUserIdByEmail(email: string): Promise<string | null> {
  // Query profiles to find user by checking auth
  const { data } = await supabase.auth.admin.listUsers();
  // Since we can't use admin API from client, we'll use a different approach
  // We'll query the profiles table after users sign up
  
  // For now, return null - users need to be created first
  console.log(`Looking for user: ${email}`);
  return null;
}

// Sample shops data
const getSampleShops = (vendorId: string) => [
  {
    owner_id: vendorId,
    name: 'Fresh Mart Grocery',
    category_id: CATEGORY_IDS.grocery,
    sub_category: 'General Store',
    city: 'Mumbai',
    area: 'Andheri West',
    whatsapp_number: '919876543210',
    story: 'Family-run grocery store serving the community for over 20 years. We believe in quality products at fair prices.',
    vendor_status: 'approved' as const,
    trust_state: 'reliable' as const,
    interaction_count: 15,
    positive_tag_count: 45,
    availability_status: 'open' as const,
  },
  {
    owner_id: vendorId,
    name: 'TechZone Electronics',
    category_id: CATEGORY_IDS.electronics,
    sub_category: 'Mobile & Accessories',
    city: 'Mumbai',
    area: 'Bandra',
    whatsapp_number: '919876543211',
    story: 'Your one-stop shop for all electronics needs. Authorized dealer for major brands with genuine warranty.',
    vendor_status: 'approved' as const,
    trust_state: 'trusted' as const,
    interaction_count: 25,
    positive_tag_count: 85,
    availability_status: 'open' as const,
  },
  {
    owner_id: vendorId,
    name: 'Green Garden Vegetables',
    category_id: CATEGORY_IDS.fruitsVegetables,
    sub_category: 'Organic Produce',
    city: 'Mumbai',
    area: 'Juhu',
    whatsapp_number: '919876543212',
    story: 'Fresh organic vegetables directly from farms. Supporting local farmers and sustainable agriculture.',
    vendor_status: 'approved' as const,
    trust_state: 'active' as const,
    interaction_count: 8,
    positive_tag_count: 24,
    availability_status: 'closing_soon' as const,
  },
  {
    owner_id: vendorId,
    name: 'Style Studio Fashion',
    category_id: CATEGORY_IDS.clothing,
    sub_category: 'Men & Women Wear',
    city: 'Delhi',
    area: 'Connaught Place',
    whatsapp_number: '919876543213',
    story: 'Trendy fashion at affordable prices. New collections every week!',
    vendor_status: 'approved' as const,
    trust_state: 'new' as const,
    interaction_count: 2,
    positive_tag_count: 6,
    availability_status: 'open' as const,
  },
  {
    owner_id: vendorId,
    name: 'Spice Kitchen Restaurant',
    category_id: CATEGORY_IDS.foodRestaurants,
    sub_category: 'North Indian',
    city: 'Bangalore',
    area: 'Koramangala',
    whatsapp_number: '919876543214',
    story: 'Authentic North Indian cuisine made with love. Home delivery available within 5km.',
    vendor_status: 'approved' as const,
    trust_state: 'reliable' as const,
    interaction_count: 12,
    positive_tag_count: 38,
    availability_status: 'open' as const,
  },
];

// Sample products for each shop
const getSampleProducts = (shopId: string, shopName: string) => {
  if (shopName.includes('Grocery')) {
    return [
      { shop_id: shopId, name: 'Basmati Rice 5kg', description: 'Premium aged basmati rice', price_type: 'fixed' as const, price_fixed: 450 },
      { shop_id: shopId, name: 'Cooking Oil 1L', description: 'Refined sunflower oil', price_type: 'fixed' as const, price_fixed: 180 },
      { shop_id: shopId, name: 'Atta 10kg', description: 'Whole wheat flour', price_type: 'fixed' as const, price_fixed: 380 },
      { shop_id: shopId, name: 'Sugar 5kg', description: 'White crystal sugar', price_type: 'fixed' as const, price_fixed: 250 },
    ];
  }
  if (shopName.includes('Electronics')) {
    return [
      { shop_id: shopId, name: 'Smartphone Screen Guard', description: 'Tempered glass protection', price_type: 'range' as const, price_min: 199, price_max: 599 },
      { shop_id: shopId, name: 'Wireless Earbuds', description: 'Bluetooth 5.0 with charging case', price_type: 'discount' as const, price_original: 2999, price_discounted: 1499 },
      { shop_id: shopId, name: 'Phone Repair Service', description: 'Screen replacement, battery change', price_type: 'enquiry' as const },
      { shop_id: shopId, name: 'USB-C Cable', description: 'Fast charging cable 1m', price_type: 'fixed' as const, price_fixed: 299 },
    ];
  }
  if (shopName.includes('Vegetables')) {
    return [
      { shop_id: shopId, name: 'Organic Tomatoes 1kg', description: 'Farm fresh organic tomatoes', price_type: 'fixed' as const, price_fixed: 60 },
      { shop_id: shopId, name: 'Mixed Vegetable Box', description: 'Weekly subscription box', price_type: 'range' as const, price_min: 300, price_max: 500 },
      { shop_id: shopId, name: 'Seasonal Fruits Basket', description: 'Assorted seasonal fruits', price_type: 'enquiry' as const },
    ];
  }
  if (shopName.includes('Fashion')) {
    return [
      { shop_id: shopId, name: 'Cotton T-Shirt', description: '100% cotton, multiple colors', price_type: 'range' as const, price_min: 299, price_max: 599 },
      { shop_id: shopId, name: 'Denim Jeans', description: 'Slim fit, all sizes', price_type: 'discount' as const, price_original: 1999, price_discounted: 999 },
      { shop_id: shopId, name: 'Custom Tailoring', description: 'Made to measure suits', price_type: 'enquiry' as const },
    ];
  }
  if (shopName.includes('Kitchen')) {
    return [
      { shop_id: shopId, name: 'Butter Chicken', description: 'Creamy tomato-based curry', price_type: 'fixed' as const, price_fixed: 280 },
      { shop_id: shopId, name: 'Paneer Tikka', description: 'Grilled cottage cheese', price_type: 'fixed' as const, price_fixed: 220 },
      { shop_id: shopId, name: 'Family Meal Deal', description: '4 rotis, 2 curries, rice, raita', price_type: 'fixed' as const, price_fixed: 599 },
      { shop_id: shopId, name: 'Catering Services', description: 'For parties and events', price_type: 'enquiry' as const },
    ];
  }
  return [];
};

/**
 * Main function to seed test data
 * Run this after creating test accounts
 */
export async function seedTestData() {
  console.log('🌱 Starting seed process...');
  
  // Get current user - they should be logged in as the vendor account
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No user logged in. Please log in first.');
    return { success: false, error: 'Not authenticated' };
  }
  
  console.log(`📧 Logged in as: ${user.email}`);
  
  try {
    // Step 1: Create sample shops
    console.log('🏪 Creating sample shops...');
    const shops = getSampleShops(user.id);
    
    const { data: createdShops, error: shopsError } = await supabase
      .from('shops')
      .insert(shops)
      .select();
    
    if (shopsError) {
      console.error('❌ Error creating shops:', shopsError);
      return { success: false, error: shopsError };
    }
    
    console.log(`✅ Created ${createdShops?.length} shops`);
    
    // Step 2: Create products for each shop
    console.log('📦 Creating sample products...');
    let totalProducts = 0;
    
    for (const shop of createdShops || []) {
      const products = getSampleProducts(shop.id, shop.name);
      if (products.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .insert(products);
        
        if (productsError) {
          console.error(`❌ Error creating products for ${shop.name}:`, productsError);
        } else {
          totalProducts += products.length;
        }
      }
    }
    
    console.log(`✅ Created ${totalProducts} products`);
    
    // Step 3: Add vendor role to current user
    console.log('👤 Adding vendor role...');
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'vendor' }, { onConflict: 'user_id,role' });
    
    if (roleError && !roleError.message.includes('duplicate')) {
      console.error('❌ Error adding vendor role:', roleError);
    } else {
      console.log('✅ Vendor role assigned');
    }
    
    console.log('🎉 Seed completed successfully!');
    return { success: true, shops: createdShops?.length, products: totalProducts };
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    return { success: false, error };
  }
}

/**
 * Assign admin roles to test accounts
 * Run this separately after creating admin accounts
 */
export async function assignAdminRoles() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No user logged in');
    return { success: false };
  }
  
  // This will only work if the current user already has admin privileges
  // For initial setup, you may need to manually insert via Supabase dashboard
  console.log(`Attempting to assign admin role to: ${user.email}`);
  
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: user.id, role: 'admin' });
  
  if (error) {
    console.error('❌ Error assigning admin role:', error);
    console.log('💡 Tip: You may need to manually assign admin roles via database');
    return { success: false, error };
  }
  
  console.log('✅ Admin role assigned');
  return { success: true };
}

/**
 * Cleanup all test data
 * Run this before going to production
 */
export async function cleanupTestData() {
  console.log('🧹 Starting cleanup...');
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No user logged in');
    return { success: false };
  }
  
  try {
    // Get all shops owned by current user
    const { data: shops } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);
    
    if (shops && shops.length > 0) {
      const shopIds = shops.map(s => s.id);
      
      // Delete products
      console.log('📦 Deleting products...');
      await supabase.from('products').delete().in('shop_id', shopIds);
      
      // Delete interactions
      console.log('🤝 Deleting interactions...');
      await supabase.from('interactions').delete().in('shop_id', shopIds);
      
      // Delete ratings
      console.log('⭐ Deleting ratings...');
      await supabase.from('ratings').delete().in('shop_id', shopIds);
      
      // Delete saved shops
      console.log('💾 Deleting saved shops...');
      await supabase.from('saved_shops').delete().in('shop_id', shopIds);
      
      // Delete reports
      console.log('🚨 Deleting reports...');
      await supabase.from('reports').delete().in('shop_id', shopIds);
      
      // Delete shops
      console.log('🏪 Deleting shops...');
      await supabase.from('shops').delete().eq('owner_id', user.id);
    }
    
    console.log('🎉 Cleanup completed!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error };
  }
}

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).seedTestData = seedTestData;
  (window as any).cleanupTestData = cleanupTestData;
  (window as any).assignAdminRoles = assignAdminRoles;
}
