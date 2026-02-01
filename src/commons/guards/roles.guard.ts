import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersSchema } from 'src/users/schema/users.schema';
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Injectable()

export class DbRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(UsersSchema.name) private userModel: Model<UsersSchema>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true; // no roles required
    const request = context.switchToHttp().getRequest();
  if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
  }
    const userId = request.user?.userId; // should be set by some auth mechanism
    console.log('User ID from request:', userId);
    if (!userId) {
      throw new UnauthorizedException('Users not authenticated');
    }
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    console.log('User Role:', user.role);
    return requiredRoles.includes(user.role as Role);
  }
}