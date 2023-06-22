import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GithubController } from './controller/github.controller';
import { GithubService } from './services/github.service';
import { GithubStrategy } from './auth/github.strategy';
import { JwtStrategy } from './auth/jwt.strategy';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: undefined,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME_HOURS },
      }),
    }),
  ],
  controllers: [GithubController],
  providers: [GithubService, GithubStrategy, JwtStrategy, UserService],
})
export class AppModule {}
