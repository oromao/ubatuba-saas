import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  create(data: { email: string; passwordHash: string }) {
    return this.usersRepository.create(data);
  }

  updatePassword(id: string, passwordHash: string) {
    return this.usersRepository.updatePassword(id, passwordHash);
  }
}
