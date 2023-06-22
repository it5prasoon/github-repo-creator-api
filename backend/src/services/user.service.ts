import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../entities/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { userName, accessToken, refreshToken, profile } = createUserDto;

    const user = await this.userRepository.create({
      userName: userName,
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: JSON.stringify(profile),
    });

    return await this.userRepository.save(user);
  }
}
