import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateOrganizationSchema,
  InviteMemberSchema,
  LocationSchema,
  type CreateOrganizationInput,
  type InviteMemberInput,
  type LocationInput,
} from '@multicheck/shared';
import type { RequestUser } from '../auth/jwt.strategy';
import { OrganizationsService } from './organizations.service';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly svc: OrganizationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.svc.listForUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(CreateOrganizationSchema)) body: CreateOrganizationInput,
  ) {
    return this.svc.create(user.id, body);
  }

  @Get(':orgId')
  get(@CurrentUser() user: RequestUser, @Param('orgId') orgId: string) {
    return this.svc.getById(user.id, orgId);
  }

  @Post(':orgId/invites')
  invite(
    @CurrentUser() user: RequestUser,
    @Param('orgId') orgId: string,
    @Body(new ZodValidationPipe(InviteMemberSchema)) body: InviteMemberInput,
  ) {
    return this.svc.invite(user.id, orgId, body);
  }

  @Post('invites/accept/:token')
  accept(@CurrentUser() user: RequestUser, @Param('token') token: string) {
    return this.svc.acceptInvite(user.id, token);
  }

  @Get(':orgId/locations')
  locations(@CurrentUser() user: RequestUser, @Param('orgId') orgId: string) {
    return this.svc.listLocations(user.id, orgId);
  }

  @Post(':orgId/locations')
  createLocation(
    @CurrentUser() user: RequestUser,
    @Param('orgId') orgId: string,
    @Body(new ZodValidationPipe(LocationSchema)) body: LocationInput,
  ) {
    return this.svc.createLocation(user.id, orgId, body);
  }
}
