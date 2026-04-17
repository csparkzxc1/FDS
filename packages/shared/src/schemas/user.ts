import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'super_admin',
  'org_owner',
  'admin',
  'manager',
  'member',
  'student',
  'parent',
]);

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^[0-9+\-\s]{7,20}$/).optional(),
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
