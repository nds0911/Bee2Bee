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
          full_name: string
          role: 'employee' | 'manager'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'employee' | 'manager'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'employee' | 'manager'
          created_at?: string
        }
      }
      it_products: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          price: number
          image_url: string | null
          in_stock: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          price: number
          image_url?: string | null
          in_stock?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          price?: number
          image_url?: string | null
          in_stock?: boolean
          created_at?: string
        }
      }
      purchase_requests: {
        Row: {
          id: string
          product_id: string
          requester_id: string
          manager_id: string | null
          quantity: number
          justification: string
          status: 'pending' | 'approved' | 'rejected'
          manager_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          requester_id: string
          manager_id?: string | null
          quantity: number
          justification: string
          status?: 'pending' | 'approved' | 'rejected'
          manager_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          requester_id?: string
          manager_id?: string | null
          quantity?: number
          justification?: string
          status?: 'pending' | 'approved' | 'rejected'
          manager_comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
