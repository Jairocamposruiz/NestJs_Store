import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './../services/auth.service';
import { User } from './../../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as User;
    const userWithJwt = this.authService.generateJWT(user);
    const response = {
      access_token: userWithJwt.access_token,
      user: {
        email: userWithJwt.user.email,
        role: userWithJwt.user.role,
        id: userWithJwt.user.id,
      },
    };
    return response;
  }
}
