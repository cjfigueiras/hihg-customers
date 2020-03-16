import { IsString } from 'class-validator';
import { IsValidEmail } from '../../validation/email-validator';

export class ForgotPasswordDto {

    @IsString()
    @IsValidEmail()
    readonly email: string;

    @IsString()
    readonly replyUrl: string;
}
