import 'dotenv/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET no configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    username: string;
    role: string;
  }) {
    const user = await this.usersService.findActiveById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida o expirada');
    }

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role.code,
    };
  }
}
