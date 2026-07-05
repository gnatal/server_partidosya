import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader ? authHeader.replace('Bearer', '').trim() : null;
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      refreshToken,
      jti: payload.jti,
    };
  }
}
