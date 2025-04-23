export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          location: string | null
          type: string | null
          status: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          location?: string | null
          type?: string | null
          status?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string | null
          type?: string | null
          status?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events_participants: {
        Row: {
          id: string
          event_id: string
          profile_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          profile_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          profile_id?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}