export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      creations: {
        Row: {
          created_at: string | null
          creation_data: Json
          creation_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creation_data: Json
          creation_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          creation_data?: Json
          creation_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_tracks: {
        Row: {
          created_at: string | null
          description: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          order_index: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content_text: string | null
          content_type: string
          created_at: string | null
          id: string
          order_index: number
          title: string
          track_id: string
          video_url: string | null
        }
        Insert: {
          content_text?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          order_index: number
          title: string
          track_id: string
          video_url?: string | null
        }
        Update: {
          content_text?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          order_index?: number
          title?: string
          track_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "learning_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string
          icon_url: string | null
          id: string
          title: string
          track_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon_url?: string | null
          id?: string
          title: string
          track_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          title?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "learning_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_creations: {
        Row: {
          audio_url: string | null
          completed_at: string | null
          created_at: string
          duration: number | null
          id: string
          image_url: string | null
          instrumental: boolean
          prompt: string
          status: string
          style: string | null
          suno_track_id: string | null
          tags: string | null
          task_id: string
          title: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          image_url?: string | null
          instrumental?: boolean
          prompt: string
          status?: string
          style?: string | null
          suno_track_id?: string | null
          tags?: string | null
          task_id: string
          title: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          image_url?: string | null
          instrumental?: boolean
          prompt?: string
          status?: string
          style?: string | null
          suno_track_id?: string | null
          tags?: string | null
          task_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string | null
          has_seen_intro: boolean
          id: string
          request_count_today: number | null
          subscription_status: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url: string
          created_at?: string | null
          has_seen_intro?: boolean
          id: string
          request_count_today?: number | null
          subscription_status?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string
          created_at?: string | null
          has_seen_intro?: boolean
          id?: string
          request_count_today?: number | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer_key: string
          created_at: string | null
          id: string
          options: Json
          order_index: number
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer_key: string
          created_at?: string | null
          id?: string
          options: Json
          order_index: number
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer_key?: string
          created_at?: string | null
          id?: string
          options?: Json
          order_index?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      site_assets: {
        Row: {
          asset_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          url: string
          usage_context: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          url: string
          usage_context: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          url?: string
          usage_context?: string
        }
        Relationships: []
      }
      user_achieved_milestones: {
        Row: {
          achieved_at: string | null
          milestone_id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          milestone_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achieved_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          lesson_id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          lesson_id: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          lesson_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_attempts: {
        Row: {
          attempted_at: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
