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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          bio: string | null
          location: string | null
          user_type: 'renter' | 'host' | 'both'
          stripe_customer_id: string | null
          stripe_account_id: string | null
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          location?: string | null
          user_type?: 'renter' | 'host' | 'both'
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          location?: string | null
          user_type?: 'renter' | 'host' | 'both'
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      studios: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string | null
          type: 'photo' | 'video' | 'podcast' | 'music' | 'dance' | 'creative'
          address: string | null
          city: string | null
          postal_code: string | null
          country: string
          latitude: number | null
          longitude: number | null
          price_per_hour: number
          minimum_hours: number
          capacity: number | null
          size_sqm: number | null
          rules: string | null
          cancellation_policy: 'flexible' | 'moderate' | 'strict'
          is_instant_book: boolean
          is_published: boolean
          is_verified: boolean
          avg_rating: number
          total_reviews: number
          total_bookings: number
          allow_extensions: boolean
          max_extension_hours: number | null
          extension_premium_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description?: string | null
          type: 'photo' | 'video' | 'podcast' | 'music' | 'dance' | 'creative'
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          price_per_hour: number
          minimum_hours?: number
          capacity?: number | null
          size_sqm?: number | null
          rules?: string | null
          cancellation_policy?: 'flexible' | 'moderate' | 'strict'
          is_instant_book?: boolean
          is_published?: boolean
          is_verified?: boolean
          avg_rating?: number
          total_reviews?: number
          total_bookings?: number
          allow_extensions?: boolean
          max_extension_hours?: number | null
          extension_premium_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string | null
          type?: 'photo' | 'video' | 'podcast' | 'music' | 'dance' | 'creative'
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          price_per_hour?: number
          minimum_hours?: number
          capacity?: number | null
          size_sqm?: number | null
          rules?: string | null
          cancellation_policy?: 'flexible' | 'moderate' | 'strict'
          is_instant_book?: boolean
          is_published?: boolean
          is_verified?: boolean
          avg_rating?: number
          total_reviews?: number
          total_bookings?: number
          allow_extensions?: boolean
          max_extension_hours?: number | null
          extension_premium_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      studio_images: {
        Row: {
          id: string
          studio_id: string
          image_url: string
          is_cover: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          studio_id: string
          image_url: string
          is_cover?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          studio_id?: string
          image_url?: string
          is_cover?: boolean
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      studio_amenities: {
        Row: {
          id: string
          studio_id: string
          amenity: string
        }
        Insert: {
          id?: string
          studio_id: string
          amenity: string
        }
        Update: {
          id?: string
          studio_id?: string
          amenity?: string
        }
        Relationships: []
      }
      studio_availability: {
        Row: {
          id: string
          studio_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
        }
        Insert: {
          id?: string
          studio_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
        }
        Update: {
          id?: string
          studio_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
        }
        Relationships: []
      }
      studio_blocked_dates: {
        Row: {
          id: string
          studio_id: string
          blocked_date: string
          reason: string | null
        }
        Insert: {
          id?: string
          studio_id: string
          blocked_date: string
          reason?: string | null
        }
        Update: {
          id?: string
          studio_id?: string
          blocked_date?: string
          reason?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          studio_id: string
          renter_id: string
          host_id: string
          project_id: string | null
          start_datetime: string
          end_datetime: string
          total_hours: number
          subtotal: number
          service_fee: number
          total_amount: number
          host_payout: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded'
          stripe_payment_id: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          cancelled_at: string | null
          notes: string | null
          original_end_datetime: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_number: string
          studio_id: string
          renter_id: string
          host_id: string
          project_id?: string | null
          start_datetime: string
          end_datetime: string
          total_hours: number
          subtotal: number
          service_fee: number
          total_amount: number
          host_payout: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          stripe_payment_id?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_at?: string | null
          notes?: string | null
          original_end_datetime?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_number?: string
          studio_id?: string
          renter_id?: string
          host_id?: string
          project_id?: string | null
          start_datetime?: string
          end_datetime?: string
          total_hours?: number
          subtotal?: number
          service_fee?: number
          total_amount?: number
          host_payout?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          stripe_payment_id?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_extensions: {
        Row: {
          id: string
          booking_id: string
          renter_id: string
          host_id: string
          studio_id: string
          extra_hours: number
          studio_extension_price: number
          equipment_extension_price: number
          total_extension_price: number
          commission_amount: number
          host_payout: number
          payment_status: 'pending' | 'paid' | 'failed'
          stripe_payment_id: string | null
          status: 'active' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          renter_id: string
          host_id: string
          studio_id: string
          extra_hours: number
          studio_extension_price: number
          equipment_extension_price?: number
          total_extension_price: number
          commission_amount: number
          host_payout: number
          payment_status?: 'pending' | 'paid' | 'failed'
          stripe_payment_id?: string | null
          status?: 'active' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          renter_id?: string
          host_id?: string
          studio_id?: string
          extra_hours?: number
          studio_extension_price?: number
          equipment_extension_price?: number
          total_extension_price?: number
          commission_amount?: number
          host_payout?: number
          payment_status?: 'pending' | 'paid' | 'failed'
          stripe_payment_id?: string | null
          status?: 'active' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_extension_items: {
        Row: {
          id: string
          extension_id: string
          equipment_id: string
          equipment_name: string
          price_per_hour: number
          hours: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          extension_id: string
          equipment_id: string
          equipment_name: string
          price_per_hour: number
          hours: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          extension_id?: string
          equipment_id?: string
          equipment_name?: string
          price_per_hour?: number
          hours?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          cover_image_url: string | null
          project_type: 'photoshoot' | 'video' | 'podcast' | 'film' | 'dance' | 'other'
          status: 'active' | 'completed' | 'archived'
          share_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          project_type: 'photoshoot' | 'video' | 'podcast' | 'film' | 'dance' | 'other'
          status?: 'active' | 'completed' | 'archived'
          share_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          project_type?: 'photoshoot' | 'video' | 'podcast' | 'film' | 'dance' | 'other'
          status?: 'active' | 'completed' | 'archived'
          share_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          email: string | null
          role: 'owner' | 'editor' | 'viewer'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          email?: string | null
          role: 'owner' | 'editor' | 'viewer'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          email?: string | null
          role?: 'owner' | 'editor' | 'viewer'
          invited_at?: string
          joined_at?: string | null
        }
        Relationships: []
      }
      project_storyboards: {
        Row: {
          id: string
          project_id: string
          title: string | null
          description: string | null
          image_url: string | null
          order_index: number
          linked_studio_id: string | null
          linked_booking_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title?: string | null
          description?: string | null
          image_url?: string | null
          order_index?: number
          linked_studio_id?: string | null
          linked_booking_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string | null
          description?: string | null
          image_url?: string | null
          order_index?: number
          linked_studio_id?: string | null
          linked_booking_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      project_moodboard_items: {
        Row: {
          id: string
          project_id: string
          image_url: string
          caption: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          caption?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          caption?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      project_shotlist: {
        Row: {
          id: string
          project_id: string
          shot_description: string
          is_completed: boolean
          linked_booking_id: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          shot_description: string
          is_completed?: boolean
          linked_booking_id?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          shot_description?: string
          is_completed?: boolean
          linked_booking_id?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      project_locations: {
        Row: {
          id: string
          project_id: string
          name: string
          address: string | null
          notes: string | null
          is_studio: boolean
          linked_studio_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          address?: string | null
          notes?: string | null
          is_studio?: boolean
          linked_studio_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          address?: string | null
          notes?: string | null
          is_studio?: boolean
          linked_studio_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          id: string
          project_id: string
          file_name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          folder: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          folder?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          folder?: string | null
          uploaded_by?: string
          created_at?: string
        }
        Relationships: []
      }
      project_notes: {
        Row: {
          id: string
          project_id: string
          title: string | null
          content: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title?: string | null
          content?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string | null
          content?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          studio_id: string
          reviewer_id: string
          reviewee_id: string
          review_type: 'renter_to_studio' | 'host_to_renter'
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          studio_id: string
          reviewer_id: string
          reviewee_id: string
          review_type: 'renter_to_studio' | 'host_to_renter'
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          studio_id?: string
          reviewer_id?: string
          reviewee_id?: string
          review_type?: 'renter_to_studio' | 'host_to_renter'
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          studio_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          studio_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          studio_id?: string
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          booking_id: string | null
          studio_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          studio_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          studio_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          last_read_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          last_read_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          last_read_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          id: string
          host_id: string
          booking_id: string
          amount: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          stripe_payout_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          host_id: string
          booking_id: string
          amount: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          stripe_payout_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          host_id?: string
          booking_id?: string
          amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          stripe_payout_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          stripe_payment_method_id: string
          card_brand: string | null
          card_last_four: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_method_id: string
          card_brand?: string | null
          card_last_four?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_method_id?: string
          card_brand?: string | null
          card_last_four?: string | null
          is_default?: boolean
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
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
