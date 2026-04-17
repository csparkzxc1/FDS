import { z } from 'zod';

export const CheckInMethodSchema = z.enum([
  'gps',
  'wifi',
  'beacon',
  'qr',
  'face',
  'nfc',
  'manual',
]);

export const CheckInSchema = z
  .object({
    method: CheckInMethodSchema,
    lat: z.number().gte(-90).lte(90).optional(),
    lng: z.number().gte(-180).lte(180).optional(),
    locationId: z.string().uuid().optional(),
    photoUrl: z.string().url().optional(),
    memo: z.string().max(500).optional(),
    qrToken: z.string().optional(),
  })
  .refine(
    (v) => v.method !== 'gps' || (typeof v.lat === 'number' && typeof v.lng === 'number'),
    { message: 'GPS check-in requires lat and lng', path: ['lat'] },
  )
  .refine((v) => v.method !== 'qr' || !!v.qrToken, {
    message: 'QR check-in requires qrToken',
    path: ['qrToken'],
  });
export type CheckInInput = z.infer<typeof CheckInSchema>;

export const CheckOutSchema = z.object({
  attendanceId: z.string().uuid(),
  memo: z.string().max(500).optional(),
});
export type CheckOutInput = z.infer<typeof CheckOutSchema>;

export const AttendanceListQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type AttendanceListQuery = z.infer<typeof AttendanceListQuerySchema>;
