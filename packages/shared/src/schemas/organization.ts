import { z } from 'zod';

export const OrganizationTypeSchema = z.enum(['company', 'academy', 'school']);

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  type: OrganizationTypeSchema,
  timezone: z.string().default('Asia/Seoul'),
  locale: z.enum(['ko', 'en']).default('ko'),
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
});
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const LocationSchema = z.object({
  name: z.string().min(1).max(100),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  radiusMeters: z.number().int().positive().max(5000),
  wifiSsid: z.string().max(100).optional(),
});
export type LocationInput = z.infer<typeof LocationSchema>;
