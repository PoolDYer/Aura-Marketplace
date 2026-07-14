import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../l03-application/auth/auth.service';
import { RegisterDto } from '../../l03-application/auth/dto/register.dto';
import { LoginDto } from '../../l03-application/auth/dto/login.dto';
import { RefreshDto } from '../../l03-application/auth/dto/refresh.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../../l03-application/auth/dto/password-reset.dto';
import { ResendVerificationDto, VerifyEmailDto } from '../../l03-application/auth/dto/verify-email.dto';
import { CompleteGoogleRegistrationDto, SyncNeonUserDto } from '../../l03-application/auth/dto/sync-neon-user.dto';
import { Public } from '../../l03-application/auth/decorators/public.decorator';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { NeonAuthService } from '../../l03-application/auth/neon-auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly neonAuthService: NeonAuthService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 403, description: 'Cuenta bloqueada (ACCOUNT_LOCKED).' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar correo electronico' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar correo de verificacion' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar enlace para restablecer contrasena' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contrasena con token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar Access Token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('neon-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar si el usuario de Neon ya existe en Aura' })
  neonStatus(@Request() req) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    return this.neonAuthService.getRegistrationStatus(accessToken);
  }

  @Post('complete-google-registration')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Completar registro Aura despues de iniciar con Google' })
  completeGoogleRegistration(@Request() req, @Body() dto: CompleteGoogleRegistrationDto) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    return this.neonAuthService.completeGoogleRegistration(accessToken, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar usuario autenticado con Neon Auth' })
  syncNeonUser(@Request() req, @Body() dto: SyncNeonUserDto) {
    return this.neonAuthService.syncProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  logout(@Request() req, @Body() dto: RefreshDto) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(dto.refreshToken, accessToken);
  }
}
