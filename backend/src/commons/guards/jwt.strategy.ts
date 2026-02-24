
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    };
    super(options);
  }

  async validate(payload: any) {
    // payload contains whatever you signed in JWT
    const { userId, role } = payload;

    // return an object (not a string!) so RolesGuard can access it
    return {
      userId,
      role,
    };
  }
}
