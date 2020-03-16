import { IsString, IsIn, IsByteLength, MinLength, ValidateIf, IsUUID } from 'class-validator';
import { IsValidEmail } from '../../../common/validation/email-validator';

export class CreateUserDto {
    @IsString()
    @IsByteLength(1, 100, {
        message: 'Invalid First Name length',
    })
    readonly firstName: string;

    @IsString()
    @IsByteLength(1, 100, {
        message: 'Invalid Last Name length',
    })
    readonly lastName: string;

    @IsString()
    @IsValidEmail()
    readonly email: string;

    @IsString()
    @MinLength(5, {
        message: 'Invalid password length',
    })
    password?: string;

    @IsString()
    readonly phone?: string;

    @IsString()
    readonly replyUrl: string;
}
