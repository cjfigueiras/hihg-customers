import { IsUUID, IsString } from 'class-validator';
import { IsValidEmail } from '../../../common/validation/email-validator';

export class FilterUserDto {

    @IsString()
    readonly name: string;

    @IsString()
    @IsValidEmail()
    readonly email: string;

    @IsUUID()
    readonly unitId: string;

    @IsUUID()
    readonly groupId: string;

    @IsUUID()
    readonly departmentId: string;
}
