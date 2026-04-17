-- Add carryover flag to allowance_settlements (missing from initial schema)
ALTER TABLE public.allowance_settlements
  ADD COLUMN IF NOT EXISTS carryover boolean NOT NULL DEFAULT false;

-- Fix surviving old policy from migration 20240102000000_member_pending.sql
-- That migration tried to DROP "Members can view household members" but the policy
-- created in 20240101000000_initial_schema.sql was named "Members can view their household members"
-- so the old policy was never dropped.
DROP POLICY IF EXISTS "Members can view their household members" ON public.household_members;
