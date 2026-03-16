import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  getStatus() {
    return {
      ok: true,
      module: 'auth',
      message: 'Auth module ready',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(
      loginDto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role.code,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      ok: true,
      message: 'Login correcto',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        status: user.status,
        role: {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
        },
      },
    };
  }
}