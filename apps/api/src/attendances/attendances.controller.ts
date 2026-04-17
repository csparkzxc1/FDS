import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  AttendanceListQuerySchema,
  CheckInSchema,
  CheckOutSchema,
  type AttendanceListQuery,
  type CheckInInput,
  type CheckOutInput,
} from '@multicheck/shared';
import type { RequestUser } from '../auth/jwt.strategy';
import { AttendancesService } from './attendances.service';

@UseGuards(JwtAuthGuard)
@Controller('organizations/:orgId/attendances')
export class AttendancesController {
  constructor(private readonly svc: AttendancesService) {}

  @Post('check-in')
  checkIn(
    @CurrentUser() user: RequestUser,
    @Param('orgId') orgId: string,
    @Body(new ZodValidationPipe(CheckInSchema)) body: CheckInInput,
  ) {
    return this.svc.checkIn(user.id, orgId, body);
  }

  @Post('check-out')
  checkOut(
    @CurrentUser() user: RequestUser,
    @Param('orgId') orgId: string,
    @Body(new ZodValidationPipe(CheckOutSchema)) body: CheckOutInput,
  ) {
    return this.svc.checkOut(user.id, orgId, body);
  }

  @Get()
  list(
    @CurrentUser() user: RequestUser,
    @Param('orgId') orgId: string,
    @Query(new ZodValidationPipe(AttendanceListQuerySchema)) query: AttendanceListQuery,
  ) {
    return this.svc.list(user.id, orgId, query);
  }
}
