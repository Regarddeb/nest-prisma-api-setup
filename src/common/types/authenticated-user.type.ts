export interface AuthenticatedUser {
  id: number;
  supabaseId: string;
  email: string;
  name: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}
