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
      ai_personas: {
        Row: {
          created_at: string
          function: string
          icon: string | null
          id: string
          name: string
          prompt: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          function: string
          icon?: string | null
          id?: string
          name: string
          prompt: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          function?: string
          icon?: string | null
          id?: string
          name?: string
          prompt?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_training_jobs: {
        Row: {
          createdat: string | null
          domain: string | null
          error: string | null
          faqs: Json | null
          jobid: string
          pagecount: number | null
          progress: number | null
          status: string
          summary: string | null
          updatedat: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          createdat?: string | null
          domain?: string | null
          error?: string | null
          faqs?: Json | null
          jobid: string
          pagecount?: number | null
          progress?: number | null
          status: string
          summary?: string | null
          updatedat?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          createdat?: string | null
          domain?: string | null
          error?: string | null
          faqs?: Json | null
          jobid?: string
          pagecount?: number | null
          progress?: number | null
          status?: string
          summary?: string | null
          updatedat?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_attendees: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_attendees_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_link: string | null
          project_id: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_statistics: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          revenue: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          revenue?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_statistics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          postal_code: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          postal_code?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          postal_code?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_users: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          created_at_auth: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_admin: boolean
          is_manager_kpi_enabled: boolean
          is_primary_company: boolean | null
          last_name: string | null
          last_sign_in_at: string | null
          role: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          created_at_auth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_manager_kpi_enabled?: boolean
          is_primary_company?: boolean | null
          last_name?: string | null
          last_sign_in_at?: string | null
          role?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          created_at_auth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_manager_kpi_enabled?: boolean
          is_primary_company?: boolean | null
          last_name?: string | null
          last_sign_in_at?: string | null
          role?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_metrics: {
        Row: {
          booking_candidates: number
          conversion_rate: number
          created_at: string
          customer_id: string
          id: string
          previous_booking_candidates: number
          previous_conversion_rate: number
          updated_at: string
        }
        Insert: {
          booking_candidates?: number
          conversion_rate?: number
          created_at?: string
          customer_id: string
          id?: string
          previous_booking_candidates?: number
          previous_conversion_rate?: number
          updated_at?: string
        }
        Update: {
          booking_candidates?: number
          conversion_rate?: number
          created_at?: string
          customer_id?: string
          id?: string
          previous_booking_candidates?: number
          previous_conversion_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_metrics_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_revenue: {
        Row: {
          appointments_delivered: number | null
          comments: string | null
          created_at: string | null
          customer_id: string
          id: string
          month: number
          price_per_appointment: number | null
          recurring_fee: number | null
          setup_fee: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          appointments_delivered?: number | null
          comments?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          month: number
          price_per_appointment?: number | null
          recurring_fee?: number | null
          setup_fee?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          appointments_delivered?: number | null
          comments?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          month?: number
          price_per_appointment?: number | null
          recurring_fee?: number | null
          setup_fee?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_revenue_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_workflows: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          workflow_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          workflow_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_workflows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_workflows_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "n8n_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          appointments_per_month: number | null
          conditions: string | null
          created_at: string | null
          end_date: string | null
          id: string
          monthly_flat_fee: number | null
          monthly_revenue: number | null
          name: string
          price_per_appointment: number | null
          setup_fee: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          appointments_per_month?: number | null
          conditions?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          monthly_flat_fee?: number | null
          monthly_revenue?: number | null
          name: string
          price_per_appointment?: number | null
          setup_fee?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          appointments_per_month?: number | null
          conditions?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          monthly_flat_fee?: number | null
          monthly_revenue?: number | null
          name?: string
          price_per_appointment?: number | null
          setup_fee?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_analysis: {
        Row: {
          created_at: string
          email_id: string
          id: string
          persona_match: Json | null
          style_metrics: Json | null
          summary: string | null
          tone_analysis: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_id: string
          id?: string
          persona_match?: Json | null
          style_metrics?: Json | null
          summary?: string | null
          tone_analysis?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_id?: string
          id?: string
          persona_match?: Json | null
          style_metrics?: Json | null
          summary?: string | null
          tone_analysis?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_analysis_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          received_date: string | null
          recipient: string | null
          sender: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          received_date?: string | null
          recipient?: string | null
          sender?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          received_date?: string | null
          recipient?: string | null
          sender?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          campaign_id: string | null
          content: string
          created_at: string
          id: string
          project_id: string | null
          rating: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          content: string
          created_at?: string
          id?: string
          project_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics: {
        Row: {
          created_at: string | null
          id: string
          name: string
          previous_value: number
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          previous_value?: number
          updated_at?: string | null
          value?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          previous_value?: number
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          extra_data: Json | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          project_id: string | null
          score: number | null
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          extra_data?: Json | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          project_id?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          extra_data?: Json | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          project_id?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflows: {
        Row: {
          created_at: string
          data: Json
          description: string | null
          id: string
          is_active: boolean | null
          n8n_workflow_id: string
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          n8n_workflow_id: string
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          n8n_workflow_id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_to: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_to?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_to?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      outreach_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_excel_data: {
        Row: {
          approval_status: string | null
          created_at: string | null
          id: string
          project_id: string
          row_data: Json | null
          row_number: number
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          created_at?: string | null
          id?: string
          project_id: string
          row_data?: Json | null
          row_number: number
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          created_at?: string | null
          id?: string
          project_id?: string
          row_data?: Json | null
          row_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_excel_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_feedback: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          milestone_id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_to: string | null
          budget: number | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      social_integrations: {
        Row: {
          created_at: string | null
          id: string
          imap_host: string | null
          imap_port: string | null
          password: string | null
          platform: string
          smtp_host: string | null
          smtp_port: string | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          imap_host?: string | null
          imap_port?: string | null
          password?: string | null
          platform: string
          smtp_host?: string | null
          smtp_port?: string | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          imap_host?: string | null
          imap_port?: string | null
          password?: string | null
          platform?: string
          smtp_host?: string | null
          smtp_port?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      system_health: {
        Row: {
          created_at: string
          health_percentage: number
          id: string
          status_message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          health_percentage?: number
          id?: string
          status_message?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          health_percentage?: number
          id?: string
          status_message?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean
          secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          email_notifications: boolean
          id: string
          language: string
          push_notifications: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_notifications?: boolean
          id?: string
          language?: string
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_notifications?: boolean
          id?: string
          language?: string
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      customer_revenue_with_total: {
        Row: {
          appointments_delivered: number | null
          comments: string | null
          created_at: string | null
          customer_id: string | null
          id: string | null
          month: number | null
          price_per_appointment: number | null
          recurring_fee: number | null
          setup_fee: number | null
          total_revenue: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          appointments_delivered?: number | null
          comments?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string | null
          month?: number | null
          price_per_appointment?: number | null
          recurring_fee?: number | null
          setup_fee?: number | null
          total_revenue?: never
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          appointments_delivered?: number | null
          comments?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string | null
          month?: number | null
          price_per_appointment?: number | null
          recurring_fee?: number | null
          setup_fee?: number | null
          total_revenue?: never
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_revenue_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_kpi_metrics: {
        Row: {
          appointments_count: number | null
          campaigns_count: number | null
          company_id: string | null
          email: string | null
          full_name: string | null
          is_manager_kpi_enabled: boolean | null
          leads_count: number | null
          projects_active: number | null
          projects_completed: number | null
          projects_count: number | null
          projects_planning: number | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          appointments_count?: never
          campaigns_count?: never
          company_id?: string | null
          email?: string | null
          full_name?: string | null
          is_manager_kpi_enabled?: boolean | null
          leads_count?: never
          projects_active?: never
          projects_completed?: never
          projects_count?: never
          projects_planning?: never
          role?: string | null
          user_id?: string | null
        }
        Update: {
          appointments_count?: never
          campaigns_count?: never
          company_id?: string | null
          email?: string | null
          full_name?: string | null
          is_manager_kpi_enabled?: boolean | null
          leads_count?: never
          projects_active?: never
          projects_completed?: never
          projects_count?: never
          projects_planning?: never
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_total_revenue: {
        Args: {
          p_setup_fee: number
          p_price_per_appointment: number
          p_appointments_delivered: number
          p_recurring_fee: number
        }
        Returns: number
      }
      check_company_user_access: {
        Args: { company_id: string; user_id: string }
        Returns: boolean
      }
      check_company_users_population: {
        Args: { user_id: string }
        Returns: {
          company_id: string
          email: string
          role: string
        }[]
      }
      check_user_company_associations: {
        Args: { user_id_param: string }
        Returns: {
          company_id: string
          company_name: string
          role: string
          is_admin: boolean
          email: string
          is_manager_kpi_enabled: boolean
        }[]
      }
      get_aggregated_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_conversion_rate: number
          total_booking_candidates: number
          customer_count: number
        }[]
      }
      get_all_companies_with_users_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          postal_code: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }[]
      }
      get_campaign_tags: {
        Args: Record<PropertyKey, never>
        Returns: {
          campaign_id: string
          tags: string[]
        }[]
      }
      get_company_user_kpis: {
        Args: { company_id_param: string }
        Returns: {
          user_id: string
          full_name: string
          email: string
          role: string
          projects_count: number
          projects_planning: number
          projects_active: number
          projects_completed: number
          campaigns_count: number
          leads_count: number
          appointments_count: number
        }[]
      }
      get_customer_revenue_by_period: {
        Args: {
          p_start_year: number
          p_start_month: number
          p_end_year: number
          p_end_month: number
        }
        Returns: {
          customer_id: string
          customer_name: string
          year: number
          month: number
          setup_fee: number
          price_per_appointment: number
          appointments_delivered: number
          recurring_fee: number
          total_revenue: number
        }[]
      }
      get_instantly_campaigns: {
        Args: {
          page_from?: number
          page_to?: number
          search_term?: string
          sort_direction?: string
          sort_field?: string
        }
        Returns: {
          id: string
          campaign_id: string
          name: string
          description: string
          status: string
          is_active: boolean
          tags: string[]
          statistics: Json
          start_date: string
          end_date: string
          raw_data: Json
          created_at: string
          updated_at: string
          count: number
        }[]
      }
      get_instantly_config: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          api_key: string
          api_url: string
          created_at: string
          last_updated: string
        }[]
      }
      get_instantly_logs: {
        Args: { page_from?: number; page_to?: number }
        Returns: {
          id: string
          timestamp: string
          endpoint: string
          status: number
          duration_ms: number
          error_message: string
          count: number
        }[]
      }
      get_instantly_workflows: {
        Args: {
          search_term?: string
          sort_field?: string
          sort_direction?: string
          page_from?: number
          page_to?: number
        }
        Returns: {
          id: string
          workflow_id: string
          workflow_name: string
          description: string
          status: string
          is_active: boolean
          tags: string[]
          raw_data: Json
          created_at: string
          updated_at: string
          count: number
        }[]
      }
      get_revenue_metrics: {
        Args: { p_year?: number; p_month?: number }
        Returns: {
          total_revenue: number
          total_appointments: number
          avg_revenue_per_appointment: number
          total_recurring_revenue: number
          total_setup_revenue: number
          customer_count: number
        }[]
      }
      get_user_company_ids: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_user_company_ids_for_auth_user: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_users_with_multiple_companies: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          company_count: number
        }[]
      }
      has_role: {
        Args: { user_id: string; role: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_company_admin: {
        Args: { company_id: string }
        Returns: boolean
      }
      is_company_manager: {
        Args: { company_id: string }
        Returns: boolean
      }
      is_company_manager_for: {
        Args: { company_id: string }
        Returns: boolean
      }
      is_company_manager_safe: {
        Args: { company_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { company_id: string }
        Returns: boolean
      }
      is_special_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_email_domain_to_company: {
        Args: { user_email: string; current_company_id?: string }
        Returns: string
      }
      migrate_excel_to_leads: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      migrate_to_single_company_per_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          removed_associations: number
        }[]
      }
      repair_user_company_associations: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          old_company_id: string
          new_company_id: string
        }[]
      }
      update_faq_item: {
        Args: {
          p_job_id: string
          p_faq_id: string
          p_question: string
          p_answer: string
          p_category?: string
        }
        Returns: boolean
      }
      update_job_summary: {
        Args: { p_job_id: string; p_summary: string }
        Returns: boolean
      }
    }
    Enums: {
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
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
    Enums: {
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
    },
  },
} as const
