import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Module({
  controllers: [AuthController],
  providers: [SupabaseService, AuthService],
  exports: [SupabaseService],
})
export class AuthModule {}
