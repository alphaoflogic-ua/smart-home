export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'owner' | 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

export type CreateUserInput = Pick<User, 'email' | 'password_hash' | 'role'>;
