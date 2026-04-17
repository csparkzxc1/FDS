import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  LocationInput,
} from '@multicheck/shared';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateOrganizationInput) {
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: input.name,
          type: input.type,
          timezone: input.timezone,
          locale: input.locale,
        },
      });
      await tx.membership.create({
        data: { organizationId: org.id, userId, role: 'org_owner' },
      });
      return org;
    });
  }

  async listForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: { memberships: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async invite(userId: string, orgId: string, input: InviteMemberInput) {
    await this.assertRole(userId, orgId, ['org_owner', 'admin']);
    const rawToken = randomBytes(24).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const invite = await this.prisma.invite.create({
      data: {
        organizationId: orgId,
        email: input.email,
        role: input.role,
        tokenHash,
        invitedById: userId,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    });
    return { id: invite.id, token: rawToken, expiresAt: invite.expiresAt };
  }

  async acceptInvite(userId: string, rawToken: string) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const invite = await this.prisma.invite.findUnique({ where: { tokenHash } });
    if (!invite || invite.status !== 'pending' || invite.expiresAt < new Date()) {
      throw new NotFoundException('Invalid or expired invite');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.invite.update({
        where: { id: invite.id },
        data: { status: 'accepted' },
      });
      return tx.membership.upsert({
        where: {
          organizationId_userId: { organizationId: invite.organizationId, userId },
        },
        update: { role: invite.role },
        create: {
          organizationId: invite.organizationId,
          userId,
          role: invite.role,
        },
      });
    });
  }

  async createLocation(userId: string, orgId: string, input: LocationInput) {
    await this.assertRole(userId, orgId, ['org_owner', 'admin']);
    return this.prisma.location.create({
      data: {
        organizationId: orgId,
        name: input.name,
        lat: input.lat,
        lng: input.lng,
        radiusMeters: input.radiusMeters,
        wifiSsid: input.wifiSsid,
      },
    });
  }

  async listLocations(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);
    return this.prisma.location.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'asc' },
    });
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
    return m;
  }
}
