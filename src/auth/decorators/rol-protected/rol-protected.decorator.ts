import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/auth/interface';

export const META_ROLES = 'roles';

export const RolProtected = (...args: ValidRoles[]) => {
    return SetMetadata(META_ROLES, args);
};
