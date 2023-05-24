import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interface';
import { RolProtected } from './rol-protected/rol-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {

  return applyDecorators(
    RolProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}