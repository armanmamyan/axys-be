import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>
  ) {}

  async create(createUser: Partial<User>): Promise<User> {
    return await this.usersRepository.save(new User(createUser));
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findUser(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['avatar', 'email', 'id', 'kycStatus', 'name', 'surName', 'username', 'onBoarding']
    });
  }

  // Get all user information
  async findOne(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async updateData(userEmail, data) {
    return await this.usersRepository.update({ email: userEmail }, data); 
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
