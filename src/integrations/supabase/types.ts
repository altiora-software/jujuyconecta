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
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
      
          global_enabled: boolean;
      
          portal_noticias: boolean;
          agenda_comunitaria: boolean;
          marketplace_local: boolean;
          alertas_seguridad: boolean;
          cursos_talleres: boolean;
          mapa_turistico: boolean;
          rutas_recorridos: boolean;
          eventos_turisticos: boolean;
          recursos_sociales: boolean;
          transporte_mapas: boolean;
          bolsa_trabajo_local: boolean;
      
          created_at: string;
          updated_at: string;
        };
      
        Insert: {
          id?: string;
          user_id: string;
      
          global_enabled?: boolean;
      
          portal_noticias?: boolean;
          agenda_comunitaria?: boolean;
          marketplace_local?: boolean;
          alertas_seguridad?: boolean;
          cursos_talleres?: boolean;
          mapa_turistico?: boolean;
          rutas_recorridos?: boolean;
          eventos_turisticos?: boolean;
          recursos_sociales?: boolean;
          transporte_mapas?: boolean;
          bolsa_trabajo_local?: boolean;
      
          created_at?: string;
          updated_at?: string;
        };
      
        Update: {
          id?: string;
          user_id?: string;
      
          global_enabled?: boolean;
      
          portal_noticias?: boolean;
          agenda_comunitaria?: boolean;
          marketplace_local?: boolean;
          alertas_seguridad?: boolean;
          cursos_talleres?: boolean;
          mapa_turistico?: boolean;
          rutas_recorridos?: boolean;
          eventos_turisticos?: boolean;
          recursos_sociales?: boolean;
          transporte_mapas?: boolean;
          bolsa_trabajo_local?: boolean;
      
          created_at?: string;
          updated_at?: string;
        };
      
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      }      
      job_submissions: {
        Row: {
          id: string;
          title: string;
          type: "formal" | "informal";
          category: string;
          description: string;
          location: string;
          contact_info: string;
          salary_range: string | null;
          requirements: string | null;
          expires_at: string | null;
          submitted_by: string | null;
          submitted_email: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        }
        Insert: {
          id?: string;
          title: string;
          type: "formal" | "informal";
          category: string;
          description: string;
          location: string;
          contact_info: string;
          salary_range?: string | null;
          requirements?: string | null;
          expires_at?: string | null;
          submitted_by?: string | null;
          submitted_email?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        }
        Update: {
          id?: string;
          title?: string;
          type?: "formal" | "informal";
          category?: string;
          description?: string;
          location?: string;
          contact_info?: string;
          salary_range?: string | null;
          requirements?: string | null;
          expires_at?: string | null;
          submitted_by?: string | null;
          submitted_email?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        }
        Relationships: []
      }
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
      content_pages: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string | null
          type: "noticia" | "transporte_linea" | "transporte_parada" | "turismo_atractivo" | "turismo_localidad" | "turismo_ruta" | "recurso" | "obra" | "guia"
          cluster: "transporte" | "turismo" | "recursos" | "obras" | "noticias" | "general"
          municipio: string | null
          category: string | null
          tags: string[] | null
          summary: string | null
          body_md: string | null
          body_html: string | null
          schema_json: any | null
          related_slugs: string[] | null
          status: "draft" | "published"
          image_url: string | null
          source: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
      
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle?: string | null
          type: "noticia" | "transporte_linea" | "transporte_parada" | "turismo_atractivo" | "turismo_localidad" | "turismo_ruta" | "recurso" | "obra" | "guia"
          cluster: "transporte" | "turismo" | "recursos" | "obras" | "noticias" | "general"
          municipio?: string | null
          category?: string | null
          tags?: string[] | null
          summary?: string | null
          body_md?: string | null
          body_html?: string | null
          schema_json?: any | null
          related_slugs?: string[] | null
          status?: "draft" | "published"
          image_url?: string | null
          source?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          type?: "noticia" | "transporte_linea" | "transporte_parada" | "turismo_atractivo" | "turismo_localidad" | "turismo_ruta" | "recurso" | "obra" | "guia"
          cluster?: "transporte" | "turismo" | "recursos" | "obras" | "noticias" | "general"
          municipio?: string | null
          category?: string | null
          tags?: string[] | null
          summary?: string | null
          body_md?: string | null
          body_html?: string | null
          schema_json?: any | null
          related_slugs?: string[] | null
          status?: "draft" | "published"
          image_url?: string | null
          source?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      
        Relationships: []
      }
      internal_links: {
        Row: {
          id: string
          keyword: string
          target_slug: string
          priority: number | null
          created_at: string
        }
        Insert: {
          id?: string
          keyword: string
          target_slug: string
          priority?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          keyword?: string
          target_slug?: string
          priority?: number | null
          created_at?: string
        }
        Relationships: []
      }
      
      tourism_places: {
        Row: {
          id: string;
          name: string;
          region: string;
          category: string;
          description: string | null;
          latitude: number;
          longitude: number;
          altitude_meters: number | null;
          best_time_to_visit: string | null;
          image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          region: string;
          category: string;
          description?: string | null;
          latitude: number;
          longitude: number;
          altitude_meters?: number | null;
          best_time_to_visit?: string | null;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          region?: string;
          category?: string;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          altitude_meters?: number | null;
          best_time_to_visit?: string | null;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      tourism_routes: {
        Row: {
          id: string;
          name: string;
          difficulty: "facil" | "media" | "dificil" | null;
          duration_hours: number | null;
          distance_km: number | null;
          short_description: string | null;
          long_description: string | null;
          start_municipality: string | null;
          end_municipality: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          difficulty?: "facil" | "media" | "dificil" | null;
          duration_hours?: number | null;
          distance_km?: number | null;
          short_description?: string | null;
          long_description?: string | null;
          start_municipality?: string | null;
          end_municipality?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          difficulty?: "facil" | "media" | "dificil" | null;
          duration_hours?: number | null;
          distance_km?: number | null;
          short_description?: string | null;
          long_description?: string | null;
          start_municipality?: string | null;
          end_municipality?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };

      tourism_events: {
        Row: {
          id: string;
          title: string;
          municipality: string | null;
          date: string;
          category:
            | "fiesta_popular"
            | "festival"
            | "peña"
            | "feria"
            | "evento_cultural"
            | "evento_deportivo"
            | "otro"
            | null;
          location_detail: string | null;
          price_range: string | null;
          short_description: string | null;
          external_link: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          municipality?: string | null;
          date: string;
          category?:
            | "fiesta_popular"
            | "festival"
            | "peña"
            | "feria"
            | "evento_cultural"
            | "evento_deportivo"
            | "otro"
            | null;
          location_detail?: string | null;
          price_range?: string | null;
          short_description?: string | null;
          external_link?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          municipality?: string | null;
          date?: string;
          category?:
            | "fiesta_popular"
            | "festival"
            | "peña"
            | "feria"
            | "evento_cultural"
            | "evento_deportivo"
            | "otro"
            | null;
          location_detail?: string | null;
          price_range?: string | null;
          short_description?: string | null;
          external_link?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };

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
      transport_raw_stops: {
        Row: {
          id: string
          line_id: string | null
          line_code: string
          direction: string
          order_index: number
      
          stop_name: string
          direccion: string | null
      
          address_raw: string | null
          city: string | null
          province: string | null
          country: string | null
      
          latitude: number | null
          longitude: number | null
          precision_note: string | null
      
          source: string | null
          processed: boolean | null
      
          stop_id: string | null
      
          created_at: string
        }
      
        Insert: {
          id?: string
          line_id?: string | null
          line_code: string
          direction: string
          order_index: number
      
          stop_name: string
          direccion?: string | null
      
          address_raw?: string | null
          city?: string | null
          province?: string | null
          country?: string | null
      
          latitude?: number | null
          longitude?: number | null
          precision_note?: string | null
      
          source?: string | null
          processed?: boolean | null
      
          stop_id?: string | null
      
          created_at?: string
        }
      
        Update: {
          id?: string
          line_id?: string | null
          line_code?: string
          direction?: string
          order_index?: number
      
          stop_name?: string
          direccion?: string | null
      
          address_raw?: string | null
          city?: string | null
          province?: string | null
          country?: string | null
      
          latitude?: number | null
          longitude?: number | null
          precision_note?: string | null
      
          source?: string | null
          processed?: boolean | null
      
          stop_id?: string | null
      
          created_at?: string
        }
      
        Relationships: [
          {
            foreignKeyName: "transport_raw_stops_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "transport_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_raw_stops_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "transport_stops"
            referencedColumns: ["id"]
          }
        ]
      }
      
      ai_access_requests: {
        Row: {
          id: string
          email: string
          agreed: boolean
          source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          agreed: boolean
          source?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          agreed?: boolean
          source?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          source?: string | null
          created_at?: string
        }
        Relationships: []
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
