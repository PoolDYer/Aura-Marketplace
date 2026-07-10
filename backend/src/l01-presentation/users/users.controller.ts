import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { UsersService } from '../../l03-application/users/users.service';
import { UpdateProfileDto } from '../../l03-application/users/dto/update-profile.dto';
import { CreateAddressDto } from '../../l03-application/users/dto/create-address.dto';
import { UpdateAddressDto } from '../../l03-application/users/dto/update-address.dto';
import { UpdatePreferencesDto } from '../../l03-application/users/dto/update-preferences.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Listar direcciones' })
  getAddresses(@Request() req) {
    return this.usersService.getAddresses(req.user.sub);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Agregar dirección' })
  createAddress(@Request() req, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(req.user.sub, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Editar dirección' })
  updateAddress(@Request() req, @Param('id') addressId: string, @Body() dto: UpdateAddressDto) {
    return this.usersService.updateAddress(req.user.sub, addressId, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Desactivar dirección' })
  deactivateAddress(@Request() req, @Param('id') addressId: string) {
    return this.usersService.deactivateAddress(req.user.sub, addressId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Obtener preferencias de notificación' })
  getPreferences(@Request() req) {
    return this.usersService.getPreferences(req.user.sub);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Actualizar preferencias de notificación' })
  updatePreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.sub, dto);
  }
}
