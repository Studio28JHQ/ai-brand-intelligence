import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  create(firstName: string, lastName: string, email: string, passwordHash: string): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  markVerified(id: string, verifiedAt: Date): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
}
