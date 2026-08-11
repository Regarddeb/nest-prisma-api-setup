import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import { DatabaseService } from 'src/modules/database/database.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseService } from './supabase.service';

const DEFAULT_ROLE_NAME = 'user';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly databaseService: DatabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const { data, error } = await this.supabaseService.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user) {
      throw new BadRequestException(error?.message ?? 'Registration failed');
    }

    const user = await this.databaseService.user.upsert({
      where: { supabaseId: data.user.id },
      update: { email: dto.email, name: dto.name },
      create: {
        supabaseId: data.user.id,
        email: dto.email,
        name: dto.name,
        roles: { create: { role: { connect: { name: DEFAULT_ROLE_NAME } } } },
      },
    });

    return {
      user: this.toPublicUser(user),
      session: data.session
        ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          }
        : null,
      message: data.session
        ? 'Registered and signed in.'
        : 'Registered. Check your email to confirm your account before logging in.',
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabaseService.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'Invalid credentials');
    }

    const user = await this.databaseService.user.upsert({
      where: { supabaseId: data.user.id },
      update: { email: data.user.email ?? dto.email },
      create: {
        supabaseId: data.user.id,
        email: data.user.email ?? dto.email,
        roles: { create: { role: { connect: { name: DEFAULT_ROLE_NAME } } } },
      },
    });

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return {
      user: this.toPublicUser(user),
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const { data, error } = await this.supabaseService.auth.refreshSession({
      refresh_token: dto.refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(
        error?.message ?? 'Invalid refresh token',
      );
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabaseService.admin.signOut(
      accessToken,
      'global',
    );
    if (error) {
      throw new BadRequestException(error.message);
    }
    return { message: 'Logged out' };
  }

  async me(supabaseId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { supabaseId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      ...this.toPublicUser(user),
      roles: user.roles.map((userRole) => userRole.role.name),
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };
  }
}
