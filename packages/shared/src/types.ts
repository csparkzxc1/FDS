export const OrganizationType = {
  Company: 'company',
  Academy: 'academy',
  School: 'school',
} as const;
export type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType];

export const UserRole = {
  SuperAdmin: 'super_admin',
  OrgOwner: 'org_owner',
  Admin: 'admin',
  Manager: 'manager',
  Member: 'member',
  Student: 'student',
  Parent: 'parent',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const CheckInMethod = {
  GPS: 'gps',
  WiFi: 'wifi',
  Beacon: 'beacon',
  QR: 'qr',
  Face: 'face',
  NFC: 'nfc',
  Manual: 'manual',
} as const;
export type CheckInMethod = (typeof CheckInMethod)[keyof typeof CheckInMethod];

export const LeaveStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
} as const;
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}
