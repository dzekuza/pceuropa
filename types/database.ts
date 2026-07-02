export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Weekly revenue breakdown — 5 weeks per month
export interface WeekData {
  tx_count: number
  amount_eur: number
}

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      articles: {
        Row: {
          category: 'Naujiena' | 'Akcija' | 'Renginys'
          content: string
          cover_image: string | null
          created_at: string | null
          featured: boolean
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: 'Naujiena' | 'Akcija' | 'Renginys'
          content?: string
          cover_image?: string | null
          created_at?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: 'Naujiena' | 'Akcija' | 'Renginys'
          content?: string
          cover_image?: string | null
          created_at?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          attachments: string[]
          created_at: string | null
          id: string
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          attachments?: string[]
          created_at?: string | null
          id?: string
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          attachments?: string[]
          created_at?: string | null
          id?: string
          question?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      moderan_sync_log: {
        Row: {
          id: string
          month: string
          results: Json
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          id?: string
          month: string
          results: Json
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          id?: string
          month?: string
          results?: Json
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content_key: string
          id: string
          page_slug: string
          section_key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          content_key: string
          id?: string
          page_slug: string
          section_key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          content_key?: string
          id?: string
          page_slug?: string
          section_key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      puck_pages: {
        Row: {
          data: Json
          id: string
          page_slug: string
          updated_at: string | null
        }
        Insert: {
          data?: Json
          id?: string
          page_slug: string
          updated_at?: string | null
        }
        Update: {
          data?: Json
          id?: string
          page_slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_reports: {
        Row: {
          amount_eur: number
          id: string
          month: string
          submitted_at: string | null
          submitted_by: string | null
          tenant_id: string | null
          tx_count: number | null
          user_id: string | null
          weeks: WeekData[] | null
        }
        Insert: {
          amount_eur: number
          id?: string
          month: string
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id?: string | null
          tx_count?: number | null
          user_id?: string | null
          weeks?: WeekData[] | null
        }
        Update: {
          amount_eur?: number
          id?: string
          month?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id?: string | null
          tx_count?: number | null
          user_id?: string | null
          weeks?: WeekData[] | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          category: string | null
          company_code: string | null
          created_at: string | null
          description: string | null
          gallery_images: string[] | null
          id: string
          login_password: string | null
          logo_url: string | null
          operator: string | null
          rent_eur: number | null
          space_m2: number | null
          store_name: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          company_code?: string | null
          created_at?: string | null
          description?: string | null
          gallery_images?: string[] | null
          id?: string
          login_password?: string | null
          logo_url?: string | null
          operator?: string | null
          rent_eur?: number | null
          space_m2?: number | null
          store_name: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          company_code?: string | null
          created_at?: string | null
          description?: string | null
          gallery_images?: string[] | null
          id?: string
          login_password?: string | null
          logo_url?: string | null
          operator?: string | null
          rent_eur?: number | null
          space_m2?: number | null
          store_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      tenants_public: {
        Row: {
          category: string | null
          description: string | null
          gallery_images: string[] | null
          id: string
          logo_url: string | null
          store_name: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          gallery_images?: string[] | null
          id?: string
          logo_url?: string | null
          store_name?: string
        }
        Update: {
          category?: string | null
          description?: string | null
          gallery_images?: string[] | null
          id?: string | null
          logo_url?: string | null
          store_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_admin_monthly_stats: {
        Args: { start_month_str: string }
        Returns: {
          month_date: string
          submission_count: number
          total_revenue: number
          total_tx: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Convenience type aliases for common usage patterns
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type RevenueReport = Database['public']['Tables']['revenue_reports']['Row']
export type RevenueReportInsert = Database['public']['Tables']['revenue_reports']['Insert']
export type RevenueReportUpdate = Database['public']['Tables']['revenue_reports']['Update']

export type FaqItem = Database['public']['Tables']['faq_items']['Row']
export type FaqItemInsert = Database['public']['Tables']['faq_items']['Insert']
export type FaqItemUpdate = Database['public']['Tables']['faq_items']['Update']

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>
export type ArticleUpdate = Partial<ArticleInsert>

export interface PageSection {
  id: string
  page_slug: string
  section_key: string
  content_key: string
  value: string | null
  updated_at: string | null
}

// Nested map: { [section_key]: { [content_key]: value } }
export type PageContentMap = Record<string, Record<string, string>>
