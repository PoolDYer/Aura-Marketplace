import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../../l04-domain/auth/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
