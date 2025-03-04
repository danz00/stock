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
      products: {
        Row: {
          id: string
          name: string
          description: string
          quantity: number
          
          category: string
          brand: string | null
          model: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          quantity: number
          
          category: string
          brand?: string | null
          model?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          quantity?: number
          
          category?: string
          brand?: string | null
          model?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movements: {
        Row: {
          id: string
          product_id: string
          type: 'IN' | 'OUT'
          quantity: number
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          type: 'IN' | 'OUT'
          quantity: number
          date?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: 'IN' | 'OUT'
          quantity?: number
          date?: string
          user_id?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          name: string
          role: 'ADMIN' | 'OPERATOR'
          created_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          name: string
          role?: 'ADMIN' | 'OPERATOR'
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          name?: string
          role?: 'ADMIN' | 'OPERATOR'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          product_id: string
          mac_address: string
          gpon_sn: string
          customer: string
          description: string | null
          status: 'IN_STOCK' | 'DEPLOYED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          mac_address: string
          gpon_sn: string
          customer: string
          description?: string | null
          status?: 'IN_STOCK' | 'DEPLOYED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          mac_address?: string
          gpon_sn?: string
          customer?: string
          description?: string | null
          status?: 'IN_STOCK' | 'DEPLOYED'
          created_at?: string
          updated_at?: string
        }
      }
      equipment_movements: {
        Row: {
          id: string
          equipment_id: string
          type: 'IN' | 'OUT'
          date: string
          user_id: string
          notes: string | null
        }
        Insert: {
          id?: string
          equipment_id: string
          type: 'IN' | 'OUT'
          date?: string
          user_id: string
          notes?: string | null
        }
        Update: {
          id?: string
          equipment_id?: string
          type?: 'IN' | 'OUT'
          date?: string
          user_id?: string
          notes?: string | null
        }
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