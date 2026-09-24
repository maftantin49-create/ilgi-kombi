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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line: string
          city: string
          created_at: string
          customer_id: string
          district: string
          first_name: string
          id: string
          is_default: boolean
          last_name: string
          neighborhood: string | null
          phone: string | null
          postal_code: string | null
          title: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          customer_id: string
          district: string
          first_name: string
          id?: string
          is_default?: boolean
          last_name: string
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          title: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          customer_id?: string
          district?: string
          first_name?: string
          id?: string
          is_default?: boolean
          last_name?: string
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
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
      customers: {
        Row: {
          auth_user_id: string | null
          company_name: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_guest: boolean
          last_name: string
          marketing_consent: boolean
          phone: string | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_guest?: boolean
          last_name: string
          marketing_consent?: boolean
          phone?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_guest?: boolean
          last_name?: string
          marketing_consent?: boolean
          phone?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      device_models: {
        Row: {
          brand_id: string
          category: string | null
          created_at: string
          family: string | null
          id: string
          is_active: boolean
          model: string
          model_norm: string
          series: string | null
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          brand_id: string
          category?: string | null
          created_at?: string
          family?: string | null
          id?: string
          is_active?: boolean
          model: string
          model_norm: string
          series?: string | null
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          brand_id?: string
          category?: string | null
          created_at?: string
          family?: string | null
          id?: string
          is_active?: boolean
          model?: string
          model_norm?: string
          series?: string | null
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "device_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          quantity: number
          reason: string | null
          type: Database["public"]["Enums"]["inventory_movement_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          type: Database["public"]["Enums"]["inventory_movement_type"]
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["inventory_movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          status: Database["public"]["Enums"]["reservation_status"]
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_snapshot: Json | null
          created_at: string
          currency: string
          customer_id: string | null
          discount_total: number
          grand_total: number
          id: string
          idempotency_key: string | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address_snapshot: Json
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          updated_at: string
        }
        Insert: {
          billing_address_snapshot?: Json | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_total?: number
          grand_total: number
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address_snapshot: Json
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          updated_at?: string
        }
        Update: {
          billing_address_snapshot?: Json | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_total?: number
          grand_total?: number
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address_snapshot?: Json
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          attempt_number: number
          completed_at: string | null
          conversation_id: string
          created_at: string
          currency: string
          id: string
          installment: number | null
          order_id: string
          provider: string
          provider_payment_id: string | null
          sanitized_response: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          token: string | null
        }
        Insert: {
          amount: number
          attempt_number: number
          completed_at?: string | null
          conversation_id: string
          created_at?: string
          currency?: string
          id?: string
          installment?: number | null
          order_id: string
          provider?: string
          provider_payment_id?: string | null
          sanitized_response?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          token?: string | null
        }
        Update: {
          amount?: number
          attempt_number?: number
          completed_at?: string | null
          conversation_id?: string
          created_at?: string
          currency?: string
          id?: string
          installment?: number | null
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          sanitized_response?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_device_models: {
        Row: {
          created_at: string
          device_model_id: string
          note: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          device_model_id: string
          note?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          device_model_id?: string
          note?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_device_models_device_model_id_fkey"
            columns: ["device_model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_device_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          storage_path: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          storage_path: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_oem_codes: {
        Row: {
          code: string
          code_norm: string
          created_at: string
          id: string
          manufacturer: string | null
          note: string | null
          product_id: string
          sort_order: number
        }
        Insert: {
          code: string
          code_norm: string
          created_at?: string
          id?: string
          manufacturer?: string | null
          note?: string | null
          product_id: string
          sort_order?: number
        }
        Update: {
          code?: string
          code_norm?: string
          created_at?: string
          id?: string
          manufacturer?: string | null
          note?: string | null
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_oem_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          id: string
          product_id: string
          sort_order: number
          spec_key: string
          spec_key_norm: string
          spec_value: string
          unit: string | null
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number
          spec_key: string
          spec_key_norm: string
          spec_value: string
          unit?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number
          spec_key?: string
          spec_key_norm?: string
          spec_value?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          compare_at_price: number | null
          compatible_brands: Json | null
          created_at: string
          description: string | null
          hover_image_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          name: string
          price: number
          same_day_shipping: boolean
          seo_description: string | null
          seo_title: string | null
          sku: string
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          compatible_brands?: Json | null
          created_at?: string
          description?: string | null
          hover_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          name: string
          price: number
          same_day_shipping?: boolean
          seo_description?: string | null
          seo_title?: string | null
          sku: string
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          compatible_brands?: Json | null
          created_at?: string
          description?: string | null
          hover_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          name?: string
          price?: number
          same_day_shipping?: boolean
          seo_description?: string | null
          seo_title?: string | null
          sku?: string
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      public_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_stock_adjustment: {
        Args: {
          p_actor_id: string
          p_operation: string
          p_product_id: string
          p_quantity: number
          p_reason: string
        }
        Returns: Json
      }
      bulk_adjust_stock: {
        Args: {
          p_actor_id: string
          p_operation: string
          p_product_ids: string[]
          p_reason: string
          p_value: number
        }
        Returns: Json
      }
      bulk_excel_product_update: {
        Args: { p_actor_id: string; p_operation_id: string; p_rows: Json }
        Returns: Json
      }
      bulk_import_products: {
        Args: { p_actor_id: string; p_rows: Json; p_session_id: string }
        Returns: Json
      }
      bulk_update_prices: {
        Args: {
          p_actor_id: string
          p_operation: string
          p_product_ids: string[]
          p_value: number
        }
        Returns: Json
      }
      bulk_update_product_classification: {
        Args: {
          p_actor_id: string
          p_field: string
          p_product_ids: string[]
          p_value: string
        }
        Returns: Json
      }
      bulk_update_product_flags: {
        Args: { p_actor_id: string; p_flags: Json; p_product_ids: string[] }
        Returns: Json
      }
      create_order_atomic: {
        Args: {
          p_billing_addr: Json
          p_customer_id: string
          p_items: Json
          p_shipping_addr: Json
        }
        Returns: Json
      }
      create_payment_attempt: {
        Args: {
          p_amount: number
          p_conversation_id: string
          p_order_id: string
          p_provider?: string
        }
        Returns: Json
      }
      create_pending_order: {
        Args: {
          p_billing_addr?: Json
          p_customer: Json
          p_expected_subtotal?: number
          p_idempotency_key?: string
          p_items: Json
          p_notes?: string
          p_shipping_addr: Json
        }
        Returns: Json
      }
      create_product_full: {
        Args: {
          p_actor_id: string
          p_device_ids: Json
          p_images: Json
          p_oem_codes: Json
          p_product: Json
          p_product_id: string
          p_specs: Json
        }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_product_full: {
        Args: {
          p_actor_id: string
          p_device_ids: Json
          p_images: Json
          p_oem_codes: Json
          p_product: Json
          p_product_id: string
          p_specs: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      address_type: "shipping" | "billing" | "both"
      admin_role: "super_admin" | "admin" | "staff"
      inventory_movement_type:
        | "sale"
        | "return"
        | "manual_adjustment"
        | "restock"
        | "reservation"
        | "reservation_release"
      order_status:
        | "draft"
        | "pending_payment"
        | "paid"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      payment_status:
        | "initialized"
        | "pending"
        | "success"
        | "failed"
        | "cancelled"
        | "refunded"
      reservation_status: "active" | "converted" | "released" | "expired"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Convenience aliases — do not delete (used across admin lib)
export type AdminProfile = Tables<"admin_profiles">
export type AdminRole = Enums<"admin_role">
export type Brand = Tables<"brands">
export type Category = Tables<"categories">
export type Product = Tables<"products">
export type OrderStatus = Enums<"order_status">
export type PaymentStatus = Enums<"payment_status">
export type InventoryMovementType = Enums<"inventory_movement_type">

export const Constants = {
  public: {
    Enums: {
      address_type: ["shipping", "billing", "both"],
      admin_role: ["super_admin", "admin", "staff"],
      inventory_movement_type: [
        "sale",
        "return",
        "manual_adjustment",
        "restock",
        "reservation",
        "reservation_release",
      ],
      order_status: [
        "draft",
        "pending_payment",
        "paid",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      payment_status: [
        "initialized",
        "pending",
        "success",
        "failed",
        "cancelled",
        "refunded",
      ],
      reservation_status: ["active", "converted", "released", "expired"],
    },
  },
} as const
