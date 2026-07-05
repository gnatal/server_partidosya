import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from '../user/entities/refresh-token.entity';
import { RegisterDto, LoginDto } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Do not return password in the response
    delete savedUser.password;
    return savedUser;
  }

  async login(loginDto: LoginDto, deviceInfo?: string) {
    const { usernameOrEmail, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ],
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store the refresh token in the DB
    await this.storeRefreshToken(user.id, tokens.jti, tokens.refreshTokenExpiresAt, deviceInfo);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(userId: string, jti: string, deviceInfo?: string) {
    // Find token in DB
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: jti, userId },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke the old refresh token (Token Rotation)
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Store the new refresh token in DB
    await this.storeRefreshToken(user.id, tokens.jti, tokens.refreshTokenExpiresAt, deviceInfo);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string, jti: string) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: jti, userId },
    });

    if (storedToken) {
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }
  }

  async logoutAll(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  private async generateTokens(user: User) {
    const jti = crypto.randomUUID();
    const payload = { sub: user.id, email: user.email, username: user.username };

    const refreshTokenExpiresInDays = 7;
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + refreshTokenExpiresInDays);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync({ ...payload, jti }, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key',
        expiresIn: `${refreshTokenExpiresInDays}d`,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      jti,
      refreshTokenExpiresAt,
    };
  }

  private async storeRefreshToken(userId: string, jti: string, expiresAt: Date, deviceInfo?: string) {
    const refreshToken = this.refreshTokenRepository.create({
      token: jti,
      userId,
      expiresAt,
      deviceInfo,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }
}
