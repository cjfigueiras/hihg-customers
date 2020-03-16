import { EmailModule } from './../../common/email/email.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
//
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { ConfigService } from '../../common/config/config.service';

const configService = new ConfigService();

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserRepository]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MulterModule.register({
            dest: './upload',
        }),
        EmailModule,
    ],
    providers: [
        UserService,
        ConfigService,
    ],
    controllers: [UserController],
    exports: [
        UserService,
    ],
})
export class UserModule { }
