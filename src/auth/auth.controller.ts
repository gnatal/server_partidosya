import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

export class RegisterDto {
  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(100, { message: 'Email must be at most 100 characters long' })
  @MinLength(8, { message: 'Email must be at least 8 characters long' })
  email: string;

  @ApiProperty({ description: 'Password of the user', example: 'password123' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password must be at most 16 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Username or Email address', example: 'user@example.com' })
  @IsNotEmpty({ message: 'Username or Email is required' })
  @IsString({ message: 'Username or Email must be a string' })
  username: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'User already exists or bad request.' })
  async signup(@Body() registerDto: RegisterDto) {
    return this.authService.signup(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user with username/email and password' })
  @ApiResponse({ status: 200, description: 'Tokens successfully generated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const deviceInfo = req.get('User-Agent');
    return this.authService.login(loginDto, deviceInfo);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh the access token using a refresh token' })
  @ApiResponse({ status: 200, description: 'New access and refresh tokens generated.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  async refresh(@Req() req: Request) {
    const user = req.user as any;
    const deviceInfo = req.get('User-Agent');
    return this.authService.refresh(user.id, user.jti, deviceInfo);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out from current session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  async logout(@Req() req: Request) {
    const user = req.user as any;
    await this.authService.logout(user.id, user.jti);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out from all active sessions/devices' })
  @ApiResponse({ status: 200, description: 'Successfully logged out from all devices.' })
  async logoutAll(@Req() req: Request) {
    const user = req.user as any;
    await this.authService.logoutAll(user.id);
    return { message: 'Logged out from all devices successfully' };
  }
}
