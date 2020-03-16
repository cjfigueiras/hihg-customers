import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async createUser(userDto: CreateUserDto) {
        const user: User = new User();
        user.firstName = userDto.firstName;
        user.lastName = userDto.lastName;
        user.email = userDto.email;
        const salt: string = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(userDto.password, salt);
        user.role = UserRole[String(userDto.role).toUpperCase()];
        user.phone = userDto.phone;
        user.updatedAt = new Date();
        user.createdAt = new Date();
        return this.save(user);
    }

    async updateUser(user: User, userDto: UpdateUserDto) {
        user.firstName = userDto.firstName ? userDto.firstName : user.firstName;
        user.lastName = userDto.lastName ? userDto.lastName : user.lastName;
        user.email = userDto.email ? userDto.email : user.email;
        user.phone = userDto.phone ? userDto.phone : user.phone;
        if (userDto.password) {
            const salt: string = bcrypt.genSaltSync(10);
            user.password = await bcrypt.hash(userDto.password, salt);
        }
        user.role = userDto.role ? UserRole[String(userDto.role).toUpperCase()] : user.role;
        user.updatedAt = new Date();
        return this.save(user);
    }

    async updateUserPassword(user: User, password: string) {
        const salt: string = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(password, salt);
        user.updatedAt = new Date();
        return this.save(user);
    }

    updateUserResetPasswordToken(user: User, token: string) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date();
        user.resetPasswordExpires.setDate(new Date().getDate() + 1);
        user.updatedAt = new Date();
        return this.save(user);
    }

    async signIn(email: string, password: string) {
        let user: User = await this.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            user = null;
        }
        return user;
    }

    getUser(id: string) {
        return this.createQueryBuilder('user')
            .select()
            .where('user.id = :id', { id })
            .andWhere('user.isDeleted = false')
            .getOne();
    }

    getUsers() {
        return this.createQueryBuilder('user')
            .select()
            .where('user.isDeleted = false')
            .getMany();
    }

    getUserByEmail(email: string) {
        return this.createQueryBuilder('user')
            .select()
            .where('user.email = :email', { email })
            .andWhere('user.isDeleted = false')
            .getOne();
    }

    getUserByToken(token: string) {
        return this.createQueryBuilder('user')
            .select()
            .where('user.resetPasswordToken = :token', { token })
            .andWhere('user.resetPasswordExpires >= :now', { now: new Date().toISOString() })
            .andWhere('user.isDeleted = false')
            .getOne();
    }

    async deleteUser(user: User) {
        user.isDeleted = true;
        user.updatedAt = new Date();
        return this.save(user);
    }
}
