/**
 * Supabase Database Types
 * Auto-generated from schema definition.
 * Run: npx supabase gen types typescript --local > types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type HouseholdMode = 'couple' | 'family' | 'roommate';
export type MemberRole = 'parent' | 'child' | 'partner' | 'roommate';
export type MemberStatus = 'pending' | 'active';
export type ChoreCategory = 'cleaning' | 'cooking' | 'laundry' | 'invisible' | 'care' | 'etc';
export type ChoreLogStatus = 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          mode: HouseholdMode;
          invite_code: string;
          invite_expires_at: string | null;
          point_to_currency: number;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mode: HouseholdMode;
          invite_code?: string;
          invite_expires_at?: string | null;
          point_to_currency?: number;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mode?: HouseholdMode;
          invite_code?: string;
          invite_expires_at?: string | null;
          point_to_currency?: number;
          created_by?: string;
          created_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role: MemberRole | null;
          status: MemberStatus;
          nickname: string | null;
          birth_year: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role?: MemberRole | null;
          status?: MemberStatus;
          nickname?: string | null;
          birth_year?: number | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          role?: MemberRole | null;
          status?: MemberStatus;
          nickname?: string | null;
          birth_year?: number | null;
          joined_at?: string;
        };
      };
      chores: {
        Row: {
          id: string;
          household_id: string;
          title: string;
          icon: string;
          category: ChoreCategory;
          points: number;
          requires_photo: boolean;
          requires_approval: boolean;
          is_invisible_labor: boolean;
          estimated_minutes: number | null;
          created_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          title: string;
          icon?: string;
          category?: ChoreCategory;
          points?: number;
          requires_photo?: boolean;
          requires_approval?: boolean;
          is_invisible_labor?: boolean;
          estimated_minutes?: number | null;
          created_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          household_id?: string;
          title?: string;
          icon?: string;
          category?: ChoreCategory;
          points?: number;
          requires_photo?: boolean;
          requires_approval?: boolean;
          is_invisible_labor?: boolean;
          estimated_minutes?: number | null;
          created_at?: string;
          archived_at?: string | null;
        };
      };
      chore_logs: {
        Row: {
          id: string;
          household_id: string;
          chore_id: string;
          performed_by: string;
          performed_at: string;
          points_awarded: number;
          photo_url: string | null;
          note: string | null;
          status: ChoreLogStatus;
          approved_by: string | null;
          approved_at: string | null;
          rejected_reason: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          chore_id: string;
          performed_by: string;
          performed_at?: string;
          points_awarded: number;
          photo_url?: string | null;
          note?: string | null;
          status?: ChoreLogStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
        };
        Update: {
          id?: string;
          household_id?: string;
          chore_id?: string;
          performed_by?: string;
          performed_at?: string;
          points_awarded?: number;
          photo_url?: string | null;
          note?: string | null;
          status?: ChoreLogStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
        };
      };
      allowance_settlements: {
        Row: {
          id: string;
          household_id: string;
          child_id: string;
          period_start: string;
          period_end: string;
          total_points: number;
          total_amount: number;
          paid_at: string | null;
          paid_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          child_id: string;
          period_start: string;
          period_end: string;
          total_points?: number;
          total_amount?: number;
          paid_at?: string | null;
          paid_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          child_id?: string;
          period_start?: string;
          period_end?: string;
          total_points?: number;
          total_amount?: number;
          paid_at?: string | null;
          paid_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
      reward_goals: {
        Row: {
          id: string;
          child_id: string;
          household_id: string;
          title: string;
          target_points: number;
          image_url: string | null;
          achieved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          household_id: string;
          title: string;
          target_points: number;
          image_url?: string | null;
          achieved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          household_id?: string;
          title?: string;
          target_points?: number;
          image_url?: string | null;
          achieved_at?: string | null;
          created_at?: string;
        };
      };
      notification_settings: {
        Row: {
          user_id: string;
          daily_reminder: boolean;
          daily_reminder_time: string;
          weekly_report: boolean;
          approval_requests: boolean;
          imbalance_warning: boolean;
          push_token: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          daily_reminder?: boolean;
          daily_reminder_time?: string;
          weekly_report?: boolean;
          approval_requests?: boolean;
          imbalance_warning?: boolean;
          push_token?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          daily_reminder?: boolean;
          daily_reminder_time?: string;
          weekly_report?: boolean;
          approval_requests?: boolean;
          imbalance_warning?: boolean;
          push_token?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_household_ids: {
        Args: Record<string, never>;
        Returns: { household_id: string }[];
      };
      is_household_member: {
        Args: { hid: string };
        Returns: boolean;
      };
      is_household_parent: {
        Args: { hid: string };
        Returns: boolean;
      };
      refresh_invite_code: {
        Args: { hid: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type HouseholdRow = Database['public']['Tables']['households']['Row'];
export type HouseholdMemberRow = Database['public']['Tables']['household_members']['Row'];
export type ChoreRow = Database['public']['Tables']['chores']['Row'];
export type ChoreLogRow = Database['public']['Tables']['chore_logs']['Row'];
export type AllowanceSettlementRow = Database['public']['Tables']['allowance_settlements']['Row'];
export type RewardGoalRow = Database['public']['Tables']['reward_goals']['Row'];
export type NotificationSettingsRow = Database['public']['Tables']['notification_settings']['Row'];

// Extended types with joins
export interface ChoreLogWithDetails extends ChoreLogRow {
  chore: ChoreRow;
  performer: UserRow;
  approver?: UserRow | null;
}

export interface HouseholdMemberWithUser extends HouseholdMemberRow {
  user: UserRow;
}

export interface ChoreWithStats extends ChoreRow {
  logCount?: number;
  lastPerformedAt?: string | null;
}
