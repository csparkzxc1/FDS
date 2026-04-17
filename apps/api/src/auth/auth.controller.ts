import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  SignUpSchema,
  SignInSchema,
  RefreshTokenSchema,
  type SignUpInput,
  type SignInInput,
  type RefreshTokenInput,
} from '@multicheck/shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signUp(@Body(new ZodValidationPipe(SignUpSchema)) body: SignUpInput) {
    return this.auth.signUp(body);
  }

  @Post('signin')
  @HttpCode(200)
  signIn(@Body(new ZodValidationPipe(SignInSchema)) body: SignInInput) {
    return this.auth.signIn(body);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body(new ZodValidationPipe(RefreshTokenSchema)) body: RefreshTokenInput) {
    return this.auth.refresh(body.refreshToken);
  }
}
