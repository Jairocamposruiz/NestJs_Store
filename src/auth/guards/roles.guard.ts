import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PayloadToken } from '../models/token.model';
import { Role } from '../models/roles.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //Si el endpoint es público como puede ser que ni traiga token directamente
    //lo dejamos pasar sin preguntar nada mas
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }

    //En esta constante roles tendremos un array con el o los roles pasados por el
    //decorador @Roles()
    const roles: Role[] = this.reflector.get(ROLES_KEY, context.getHandler());

    //Si no tiene roles significa que nos da igual quien entre mientras tenga token
    //por ello lo dejamos pasar
    if (!roles) {
      return true;
    }

    //Extraemos el request de la petición
    const request = context.switchToHttp().getRequest();

    //Extraemos el usuario del request y lo tipamos con nuestro modelo PayloadToken
    const user = request.user as PayloadToken;

    //Comprobamos si el rol del usuario está dentro de array de los permitidos
    const isAuth = roles.some((role) => role == user.role);

    //Si no tiene el rol lanzamos error
    if (!isAuth) {
      throw new UnauthorizedException('Your role is wrong');
    }

    //Si lo tiene lo dejamos seguir
    return true;
  }
}
