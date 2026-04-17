import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { isWithinGeofence } from './geofence.util';
import type {
  CheckInInput,
  CheckOutInput,
  AttendanceListQuery,
} from '@multicheck/shared';

// 2x32-bit keys for pg_advisory_xact_lock(int, int). Deterministic from (orgId, userId).
function advisoryLockKeys(orgId: string, userId: string): [number, number] {
  const hash = createHash('sha256').update(`${orgId}:${userId}`).digest();
  // Postgres int4 range is signed; readInt32BE handles sign correctly.
  return [hash.readInt32BE(0), hash.readInt32BE(4)];
}

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(userId: string, orgId: string, input: CheckInInput) {
    await this.assertMember(userId, orgId);

    if (input.method === 'gps') {
      await this.verifyGeofence(orgId, input.lat!, input.lng!, input.locationId);
    }

    const [k1, k2] = advisoryLockKeys(orgId, userId);

    return this.prisma.$transaction(async (tx) => {
      // Serialize concurrent check-ins per (org, user). Released at tx end.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${k1}::int, ${k2}::int)`;

      const existingOpen = await tx.attendance.findFirst({
        where: { organizationId: orgId, userId, status: 'open' },
        select: { id: true },
      });
      if (existingOpen) {
        throw new BadRequestException('Already checked in. Check out first.');
      }

      return tx.attendance.create({
        data: {
          organizationId: orgId,
          userId,
          method: input.method,
          status: 'open',
          checkInAt: new Date(),
          locationId: input.locationId,
          lat: input.lat,
          lng: input.lng,
          photoUrl: input.photoUrl,
          memo: input.memo,
        },
      });
    });
  }

  async checkOut(userId: string, orgId: string, input: CheckOutInput) {
    await this.assertMember(userId, orgId);
    const att = await this.prisma.attendance.findUnique({
      where: { id: input.attendanceId },
    });
    if (!att || att.organizationId !== orgId || att.userId !== userId) {
      throw new NotFoundException('Attendance not found');
    }
    if (att.status !== 'open') {
      throw new BadRequestException('Attendance is not open');
    }
    const checkOutAt = new Date();
    const workMinutes = Math.floor((checkOutAt.getTime() - att.checkInAt.getTime()) / 60000);
    return this.prisma.attendance.update({
      where: { id: att.id },
      data: {
        checkOutAt,
        status: 'closed',
        workMinutes,
        memo: input.memo ?? att.memo,
      },
    });
  }

  async list(userId: string, orgId: string, query: AttendanceListQuery) {
    await this.assertMember(userId, orgId);
    const targetUserId = query.userId ?? userId;
    if (targetUserId !== userId) {
      await this.assertRole(userId, orgId, ['org_owner', 'admin', 'manager']);
    }
    return this.prisma.attendance.findMany({
      where: {
        organizationId: orgId,
        userId: targetUserId,
        checkInAt: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
      },
      orderBy: { checkInAt: 'desc' },
      take: query.limit,
    });
  }

  private async verifyGeofence(
    orgId: string,
    lat: number,
    lng: number,
    locationId?: string,
  ) {
    const locations = await this.prisma.location.findMany({
      where: locationId
        ? { id: locationId, organizationId: orgId }
        : { organizationId: orgId },
    });
    if (locations.length === 0) {
      throw new BadRequestException('No registered locations for geofence check');
    }
    const matched = locations.some((loc) =>
      isWithinGeofence({ lat, lng }, loc),
    );
    if (!matched) {
      throw new ForbiddenException('Out of geofence');
    }
  }

  private async assertMember(userId: string, orgId: string) {
    const m = await this.prisma.membership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!m) throw new ForbiddenException('Not a member of this organization');
    return m;
  }

  private async assertRole(userId: string, orgId: string, roles: string[]) {
    const m = await this.assertMember(userId, orgId);
    if (!roles.includes(m.role)) {
      throw new ForbiddenException(`Requires one of roles: ${roles.join(', ')}`);
    }
  }
}
