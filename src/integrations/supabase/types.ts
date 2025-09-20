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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      jobs: {
        Row: {
          active: boolean | null
          category: string
          contact_info: string
          created_at: string
          description: string
          expires_at: string | null
          featured: boolean | null
          id: string
          location: string
          requirements: string | null
          salary_range: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category: string
          contact_info: string
          created_at?: string
          description: string
          expires_at?: string | null
          featured?: boolean | null
          id?: string
          location: string
          requirements?: string | null
          salary_range?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string
          contact_info?: string
          created_at?: string
          description?: string
          expires_at?: string | null
          featured?: boolean | null
          id?: string
          location?: string
          requirements?: string | null
          salary_range?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          description: string
          featured: boolean | null
          id: string
          severity: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          description: string
          featured?: boolean | null
          id?: string
          severity?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          description?: string
          featured?: boolean | null
          id?: string
          severity?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_resources: {
        Row: {
          active: boolean | null
          address: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          needs: string[] | null
          schedule: string | null
          type: string
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          active?: boolean | null
          address: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          needs?: string[] | null
          schedule?: string | null
          type: string
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          active?: boolean | null
          address?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          needs?: string[] | null
          schedule?: string | null
          type?: string
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      transport_lines: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string
          id: string
          name: string
          number: string
          route_description: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          number: string
          route_description?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          number?: string
          route_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transport_reports: {
        Row: {
          created_at: string
          id: string
          line_id: string
          message: string
          severity: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_id: string
          message: string
          severity?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          line_id?: string
          message?: string
          severity?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_reports_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "transport_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_stops: {
        Row: {
          created_at: string
          id: string
          latitude: number
          line_id: string
          longitude: number
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          line_id: string
          longitude: number
          name: string
          order_index: number
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          line_id?: string
          longitude?: number
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "transport_stops_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "transport_lines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
