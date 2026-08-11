import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GoTrueAdminApi, GoTrueClient } from '@supabase/auth-js';
import { createClient } from '@supabase/supabase-js';

const NO_SESSION_PERSISTENCE = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
} as const;

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client!: ReturnType<typeof createClient>;
  private adminClient!: ReturnType<typeof createClient>;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('supabase.url')!;
    const anonKey = this.config.get<string>('supabase.anonKey')!;
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey')!;

    this.client = createClient(url, anonKey, NO_SESSION_PERSISTENCE);
    this.adminClient = createClient(
      url,
      serviceRoleKey,
      NO_SESSION_PERSISTENCE,
    );
  }

  /** Auth client using the anon key — for signUp/signIn/refresh on behalf of a user. */
  get auth(): GoTrueClient {
    return this.client.auth;
  }

  /** Admin API using the service-role key — e.g. revoking sessions, managing users. */
  get admin(): GoTrueAdminApi {
    return this.adminClient.auth.admin;
  }
}
