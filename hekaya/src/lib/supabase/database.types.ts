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
          emirate: string
          full_name: string
          id: string
          is_default: boolean
          phone: string
          postal_code: string | null
          user_id: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          emirate: string
          full_name: string
          id?: string
          is_default?: boolean
          phone: string
          postal_code?: string | null
          user_id: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          emirate?: string
          full_name?: string
          id?: string
          is_default?: boolean
          phone?: string
          postal_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          data: Json
          id: number
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: Json | null
          id: string
          image: string | null
          name: Json
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: Json | null
          id: string
          image?: string | null
          name: Json
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: Json | null
          id?: string
          image?: string | null
          name?: Json
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: Json
          id: string
          image: string | null
          is_active: boolean
          name: Json
          slug: string | null
          sort_order: number
          tone: string
        }
        Insert: {
          created_at?: string
          description: Json
          id?: string
          image?: string | null
          is_active?: boolean
          name: Json
          slug?: string | null
          sort_order?: number
          tone?: string
        }
        Update: {
          created_at?: string
          description?: Json
          id?: string
          image?: string | null
          is_active?: boolean
          name?: Json
          slug?: string | null
          sort_order?: number
          tone?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          locale: string
          message: string
          name: string
          topic: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          locale?: string
          message: string
          name: string
          topic: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          locale?: string
          message?: string
          name?: string
          topic?: string
          user_id?: string | null
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          failed_pin_attempts: number
          message: string
          order_id: string | null
          photos: string[]
          pin_hash: string
          pin_locked_until: string | null
          product_id: string | null
          product_label: string | null
          title: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          failed_pin_attempts?: number
          message?: string
          order_id?: string | null
          photos?: string[]
          pin_hash: string
          pin_locked_until?: string | null
          product_id?: string | null
          product_label?: string | null
          title?: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          failed_pin_attempts?: number
          message?: string
          order_id?: string | null
          photos?: string[]
          pin_hash?: string
          pin_locked_until?: string | null
          product_id?: string | null
          product_label?: string | null
          title?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: Json
          order_id: string
          price: number
          product_id: string | null
          qty: number
          variation_label: Json | null
        }
        Insert: {
          id?: string
          name: Json
          order_id: string
          price: number
          product_id?: string | null
          qty: number
          variation_label?: Json | null
        }
        Update: {
          id?: string
          name?: Json
          order_id?: string
          price?: number
          product_id?: string | null
          qty?: number
          variation_label?: Json | null
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
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: number
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          email: string
          emails_sent_at: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          qr_choice: Database["public"]["Enums"]["qr_choice"]
          qr_token_labels: string[]
          qr_token_product_ids: string[]
          qr_tokens: string[]
          shipping: number
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          email: string
          emails_sent_at?: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          qr_choice: Database["public"]["Enums"]["qr_choice"]
          qr_token_labels?: string[]
          qr_token_product_ids?: string[]
          qr_tokens?: string[]
          shipping: number
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string
          emails_sent_at?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          qr_choice?: Database["public"]["Enums"]["qr_choice"]
          qr_token_labels?: string[]
          qr_token_product_ids?: string[]
          qr_tokens?: string[]
          shipping?: number
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          age_range: Json | null
          available_ages: string[] | null
          available_sizes: string[] | null
          category_id: string | null
          collection_id: string | null
          compare_at_price: number | null
          created_at: string
          description: Json | null
          id: string
          images: string[]
          is_active: boolean
          is_bestseller: boolean
          is_featured: boolean
          is_new: boolean
          is_qr_eligible: boolean
          material: Json | null
          name: Json
          placeholder_tone: string | null
          price: number
          short_description: Json | null
          slug: string
          variations: Json | null
        }
        Insert: {
          age_range?: Json | null
          available_ages?: string[] | null
          available_sizes?: string[] | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: Json | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_qr_eligible?: boolean
          material?: Json | null
          name: Json
          placeholder_tone?: string | null
          price: number
          short_description?: Json | null
          slug: string
          variations?: Json | null
        }
        Update: {
          age_range?: Json | null
          available_ages?: string[] | null
          available_sizes?: string[] | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: Json | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_qr_eligible?: boolean
          material?: Json | null
          name?: Json
          placeholder_tone?: string | null
          price?: number
          short_description?: Json | null
          slug?: string
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_allowlist: { Args: never; Returns: string[] }
      admin_reset_memory_pin: {
        Args: { p_pin: string; p_token: string }
        Returns: undefined
      }
      check_memory_pin: {
        Args: { p_pin: string; p_token: string }
        Returns: {
          attempts_left: number
          minutes_left: number
          status: string
        }[]
      }
      delete_collection_cascade: { Args: { p_id: string }; Returns: string[] }
      get_memory: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          order_id: string
          product_id: string
          product_label: string
          token: string
          updated_at: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      mint_qr_token: { Args: { p_len?: number }; Returns: string }
      place_order: {
        Args: {
          p_customer_name: string
          p_email: string
          p_items: Json
          p_locale?: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_qr_choice: Database["public"]["Enums"]["qr_choice"]
          p_shipping_address: Json
        }
        Returns: string
      }
      save_memory: {
        Args: {
          p_message: string
          p_order_id: string
          p_photos: string[]
          p_pin: string
          p_product_id: string
          p_product_label: string
          p_title: string
          p_token: string
        }
        Returns: {
          attempts_left: number
          minutes_left: number
          status: string
        }[]
      }
      unlock_memory: {
        Args: { p_pin: string; p_token: string }
        Returns: {
          attempts_left: number
          created_at: string
          message: string
          minutes_left: number
          order_id: string
          photos: string[]
          product_id: string
          product_label: string
          status: string
          title: string
          token: string
          updated_at: string
        }[]
      }
      verify_memory_pin: {
        Args: { p_pin: string; p_token: string }
        Returns: boolean
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method: "card" | "apple_pay" | "paypal"
      qr_choice: "per_order" | "per_piece"
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
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["card", "apple_pay", "paypal"],
      qr_choice: ["per_order", "per_piece"],
    },
  },
} as const
