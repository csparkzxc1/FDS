import { supabase } from './supabase';
import { IS_DEV_BYPASS, MOCK_HOUSEHOLD, MOCK_MEMBERS } from '@/utils/devMode';
import type { HouseholdMode, MemberRole } from '@/types/database';

export interface CreateHouseholdInput {
  name: string;
  mode: HouseholdMode;
  pointToCurrency?: number;
  createdBy: string;
}

export interface HouseholdRow {
  id: string;
  name: string;
  mode: HouseholdMode;
  invite_code: string;
  invite_expires_at: string;
  point_to_currency: number;
  created_by: string;
  created_at: string;
}

export interface MemberRow {
  id: string;
  household_id: string;
  user_id: string;
  role: MemberRole | null;
  nickname: string | null;
  birth_year: number | null;
  joined_at: string;
  status: 'pending' | 'active';
  user?: { id: string; email: string; display_name: string | null; avatar_url: string | null };
}

export async function createHousehold(input: CreateHouseholdInput): Promise<HouseholdRow> {
  if (IS_DEV_BYPASS) return MOCK_HOUSEHOLD as HouseholdRow;

  const { data, error } = await (supabase.from('households') as any)
    .insert({
      name: input.name,
      mode: input.mode,
      point_to_currency: input.pointToCurrency ?? 100,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  const household = data as HouseholdRow;

  // Creator joins as parent with active status
  await (supabase.from('household_members') as any).insert({
    household_id: household.id,
    user_id: input.createdBy,
    role: 'parent',
    status: 'active',
  });

  return household;
}

export async function joinHousehold(inviteCode: string, userId: string): Promise<{ householdId: string; status: 'pending' }> {
  if (IS_DEV_BYPASS) return { householdId: MOCK_HOUSEHOLD.id, status: 'pending' };

  // Find household by invite code
  const { data: household, error: findError } = await (supabase.from('households') as any)
    .select('id, invite_expires_at')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (findError || !household) throw new Error('유효하지 않은 초대 코드입니다');

  if (new Date(household.invite_expires_at) < new Date()) {
    throw new Error('만료된 초대 코드입니다');
  }

  // Check not already a member
  const { data: existing } = await (supabase.from('household_members') as any)
    .select('id')
    .eq('household_id', household.id)
    .eq('user_id', userId)
    .single();

  if (existing) throw new Error('이미 이 가구의 멤버입니다');

  const { error: insertError } = await (supabase.from('household_members') as any).insert({
    household_id: household.id,
    user_id: userId,
    role: null,
    status: 'pending',
  });

  if (insertError) throw insertError;

  return { householdId: household.id as string, status: 'pending' };
}

export async function getHouseholdByInviteCode(inviteCode: string): Promise<HouseholdRow | null> {
  if (IS_DEV_BYPASS) return MOCK_HOUSEHOLD as HouseholdRow;

  const { data, error } = await (supabase.from('households') as any)
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (error) return null;
  return data as HouseholdRow;
}

export async function getMyHousehold(userId: string): Promise<{ household: HouseholdRow; memberStatus: 'pending' | 'active' } | null> {
  if (IS_DEV_BYPASS) return { household: MOCK_HOUSEHOLD as HouseholdRow, memberStatus: 'active' };

  const { data, error } = await (supabase.from('household_members') as any)
    .select('status, households(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    household: data.households as HouseholdRow,
    memberStatus: data.status as 'pending' | 'active',
  };
}

export async function getMembers(householdId: string): Promise<MemberRow[]> {
  if (IS_DEV_BYPASS) return MOCK_MEMBERS as MemberRow[];

  const { data, error } = await (supabase.from('household_members') as any)
    .select('*, user:users(id, email, display_name, avatar_url)')
    .eq('household_id', householdId)
    .eq('status', 'active');

  if (error) throw error;
  return (data ?? []) as MemberRow[];
}

export async function getPendingMembers(householdId: string): Promise<MemberRow[]> {
  if (IS_DEV_BYPASS) return [];

  const { data, error } = await (supabase.from('household_members') as any)
    .select('*, user:users(id, email, display_name, avatar_url)')
    .eq('household_id', householdId)
    .eq('status', 'pending');

  if (error) throw error;
  return (data ?? []) as MemberRow[];
}

export async function approveMember(memberId: string, role: MemberRole): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('household_members') as any)
    .update({ role, status: 'active' })
    .eq('id', memberId);

  if (error) throw error;
}

export async function rejectMember(memberId: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('household_members') as any)
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function refreshInviteCode(householdId: string): Promise<string> {
  if (IS_DEV_BYPASS) return MOCK_HOUSEHOLD.invite_code;

  const { data, error } = await (supabase.rpc as any)('refresh_invite_code', { hid: householdId });
  if (error) throw error;
  return data as string;
}
