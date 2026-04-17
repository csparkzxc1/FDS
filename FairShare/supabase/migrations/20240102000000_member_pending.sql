-- Phase 2: pending member state
-- Allows members to join in 'pending' status until an admin approves and assigns a role

-- Make role nullable (null = pending, not yet assigned)
ALTER TABLE household_members ALTER COLUMN role DROP NOT NULL;

-- Add status column
ALTER TABLE household_members
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('pending', 'active'));

-- Update is_household_member() to exclude pending members
CREATE OR REPLACE FUNCTION is_household_member(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = hid
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Helper: check if current user is a pending member of household
CREATE OR REPLACE FUNCTION is_pending_member(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = hid
      AND user_id = auth.uid()
      AND status = 'pending'
  );
$$;

-- Helper: check if current user is a parent/admin of household
CREATE OR REPLACE FUNCTION is_household_admin(hid uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = hid
      AND user_id = auth.uid()
      AND role = 'parent'
      AND status = 'active'
  );
$$;

-- RLS update for household_members:
-- Pending members can only see their own row (not others)
-- Active members can see all active members in their household
DROP POLICY IF EXISTS "Members can view household members" ON household_members;

CREATE POLICY "Active members can view household members"
  ON household_members FOR SELECT
  USING (
    -- Active member of same household
    (status = 'active' AND is_household_member(household_id))
    OR
    -- Pending member can see their own row
    (user_id = auth.uid())
  );

-- Only active members can insert (join via invite code)
DROP POLICY IF EXISTS "Users can join households" ON household_members;

CREATE POLICY "Users can join households"
  ON household_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins (parents) can update members in their household (approve/reject)
-- Users can update their own row (leave)
DROP POLICY IF EXISTS "Members can update own record" ON household_members;

CREATE POLICY "Members can update own or admin can update household members"
  ON household_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR is_household_admin(household_id)
  );

-- Admins can delete (reject) pending members
DROP POLICY IF EXISTS "Members can leave household" ON household_members;

CREATE POLICY "Members can leave or admin can remove"
  ON household_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR is_household_admin(household_id)
  );
