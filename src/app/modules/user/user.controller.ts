import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Put,
    Param,
    Delete,
    UsePipes,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationPipe } from '../../common/pipes/validation.pipe';
import { RolesGuard } from '../../common/auth/guards/roles.guard';
import { ErrorResult } from '../../common/error-manager/errors';
import { ErrorManager } from '../../common/error-manager/error-manager';
import { User } from './user.entity';
import { GetUser } from '../../common/decorator/user.decorator';
import { JwtAuthGuard } from '../../common/auth/guards/auth.guard';
import { Public } from '../../common/decorator/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe())
    create(@Body() userDto: CreateUserDto) {
        return this.userService.create(userDto)
            .then((createdUser: User) => {
                return createdUser;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
    update(@GetUser() user: User, @Param('id') id: string, @Body() userDto: UpdateUserDto) {
        return this.userService.update(id, userDto, user)
            .then((updatedUser: User) => {
                return updatedUser;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Get(':id')
    getUser(@Param('id') id: string) {
        return this.userService.getUser(id)
            .then((gotUser: User) => {
                return gotUser;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Get()
    getUsers() {
        return this.userService.getUsers()
            .then((users: User[]) => {
                return users;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Delete(':id')
    delete(@GetUser() user: User, @Param('id') id: string) {
        return this.userService.delete(id, user)
            .then((deletedUser: User) => {
                return deletedUser;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }
}
