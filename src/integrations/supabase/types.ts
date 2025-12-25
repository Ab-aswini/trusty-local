export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          reason: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          reason: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          reason?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          approved: boolean
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          parent_id: string | null
          suggested_by: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          parent_id?: string | null
          suggested_by?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          parent_id?: string | null
          suggested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          consumer_id: string | null
          created_at: string
          id: string
          interaction_type: string
          rated: boolean
          rating_expires_at: string
          shop_id: string
        }
        Insert: {
          consumer_id?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          rated?: boolean
          rating_expires_at?: string
          shop_id: string
        }
        Update: {
          consumer_id?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          rated?: boolean
          rating_expires_at?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_discounted: number | null
          price_fixed: number | null
          price_max: number | null
          price_min: number | null
          price_original: number | null
          price_type: Database["public"]["Enums"]["price_type"]
          shop_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_discounted?: number | null
          price_fixed?: number | null
          price_max?: number | null
          price_min?: number | null
          price_original?: number | null
          price_type?: Database["public"]["Enums"]["price_type"]
          shop_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_discounted?: number | null
          price_fixed?: number | null
          price_max?: number | null
          price_min?: number | null
          price_original?: number | null
          price_type?: Database["public"]["Enums"]["price_type"]
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          interaction_id: string
          is_calm: boolean
          is_helpful: boolean
          is_honest: boolean
          is_respectful: boolean
          shop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_id: string
          is_calm?: boolean
          is_helpful?: boolean
          is_honest?: boolean
          is_respectful?: boolean
          shop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_id?: string
          is_calm?: boolean
          is_helpful?: boolean
          is_honest?: boolean
          is_respectful?: boolean
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: true
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          shop_id: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_shops: {
        Row: {
          created_at: string
          id: string
          shop_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shop_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_shops_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          ai_usage_count: number
          ai_usage_reset_at: string | null
          area: string
          availability_status: Database["public"]["Enums"]["availability_status"]
          availability_updated_at: string | null
          category_id: string | null
          city: string
          closing_time: string | null
          created_at: string
          established_year: number | null
          facebook_url: string | null
          google_maps_url: string | null
          gst_number: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          interaction_count: number
          is_premium: boolean
          name: string
          owner_id: string
          positive_tag_count: number
          story: string | null
          sub_category: string | null
          trust_state: Database["public"]["Enums"]["trust_state"]
          udyam_number: string | null
          updated_at: string
          vendor_status: Database["public"]["Enums"]["vendor_status"]
          warning_level: Database["public"]["Enums"]["warning_level"] | null
          warning_reason: string | null
          whatsapp_number: string
        }
        Insert: {
          ai_usage_count?: number
          ai_usage_reset_at?: string | null
          area: string
          availability_status?: Database["public"]["Enums"]["availability_status"]
          availability_updated_at?: string | null
          category_id?: string | null
          city: string
          closing_time?: string | null
          created_at?: string
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          gst_number?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          interaction_count?: number
          is_premium?: boolean
          name: string
          owner_id: string
          positive_tag_count?: number
          story?: string | null
          sub_category?: string | null
          trust_state?: Database["public"]["Enums"]["trust_state"]
          udyam_number?: string | null
          updated_at?: string
          vendor_status?: Database["public"]["Enums"]["vendor_status"]
          warning_level?: Database["public"]["Enums"]["warning_level"] | null
          warning_reason?: string | null
          whatsapp_number: string
        }
        Update: {
          ai_usage_count?: number
          ai_usage_reset_at?: string | null
          area?: string
          availability_status?: Database["public"]["Enums"]["availability_status"]
          availability_updated_at?: string | null
          category_id?: string | null
          city?: string
          closing_time?: string | null
          created_at?: string
          established_year?: number | null
          facebook_url?: string | null
          google_maps_url?: string | null
          gst_number?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          interaction_count?: number
          is_premium?: boolean
          name?: string
          owner_id?: string
          positive_tag_count?: number
          story?: string | null
          sub_category?: string | null
          trust_state?: Database["public"]["Enums"]["trust_state"]
          udyam_number?: string | null
          updated_at?: string
          vendor_status?: Database["public"]["Enums"]["vendor_status"]
          warning_level?: Database["public"]["Enums"]["warning_level"] | null
          warning_reason?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "consumer" | "vendor" | "admin" | "super_admin"
      availability_status: "open" | "closing_soon" | "closed"
      price_type: "fixed" | "range" | "discount" | "enquiry"
      trust_state: "new" | "active" | "reliable" | "trusted"
      vendor_status: "pending" | "approved" | "rejected" | "suspended"
      warning_level: "warning" | "ai_limit" | "visibility_reduced" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["consumer", "vendor", "admin", "super_admin"],
      availability_status: ["open", "closing_soon", "closed"],
      price_type: ["fixed", "range", "discount", "enquiry"],
      trust_state: ["new", "active", "reliable", "trusted"],
      vendor_status: ["pending", "approved", "rejected", "suspended"],
      warning_level: ["warning", "ai_limit", "visibility_reduced", "suspended"],
    },
  },
} as const
