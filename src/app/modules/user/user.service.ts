import { EmailService } from './../../common/email/email.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//
import * as generator from 'generate-password';
//
import { UserRepository } from './user.repository';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundResult, ErrorResult, BadRequestResult, InternalServerErrorResult, ForbiddenResult, UnauthorizedResult } from '../../common/error-manager/errors';
import { ErrorCode } from '../../common/error-manager/error-codes';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: UserRepository,
        private readonly emailService: EmailService,
    ) { }

    create(userDto: CreateUserDto, reqUser: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            // User request not Super Admin trying of create an user Super Admin
            if (reqUser && reqUser.role !== UserRole.ROOT && userDto.role === UserRole.ROOT) {
                reject(new UnauthorizedResult(ErrorCode.MissingPermission, 'You can not create a Super Admin User'));
                return;
            }
            this.userRepository.getUserByEmail(userDto.email).then((user: User) => {
                if (user) {
                    reject(new BadRequestResult(ErrorCode.DuplicateEntity, 'There is a user with same email!'));
                    return;
                }
                const hasPassword: boolean = (userDto.password ? true : false);
                if (!hasPassword) {
                    userDto.password = generator.generate({
                        length: 10,
                        numbers: true,
                    });
                }

                this.userRepository.createUser(userDto).then((createdUser: User) => {
                    if (!hasPassword) {
                        this.sendRecoveryPasswordEmail(createdUser, userDto.replyUrl, true);
                    }
                    resolve(createdUser);
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    sendRecoveryPasswordEmail(user: User, replyUrl: string, newAccount: boolean): Promise<any> {
        const data: any = {
            userId: user.id,
            token: user.resetPasswordToken,
        };
        const url: string = `${replyUrl}/${Buffer.from(JSON.stringify(data)).toString('base64')}`;
        return this.emailService.sendEmail(this.getRecoveryEmailTemplate(user, url, newAccount));
    }

    getRecoveryEmailTemplate(user: User, url: string, newAccount: boolean) {
        if (newAccount) {
            return {
                to: user.email, // sender address
                subject: 'Your Digipilot Account!', // Subject line
                html: `<!DOCTYPE html>
                <html>
                <body>
                    <div>
                        <p>You registered your company into Digipilot.</p>
                        <p>Here is your access to the application.</p>
                        <p>Follow this <a href="${url}">link</a> to set up your password and information.</p>
                        <br>
                        <p>Best regards,</p>
                        <p>The Digipilot team.</p>
                    </div>
                </body>
                </html>`, // HTML body content
            };
        } else {
            return {
                to: user.email, // sender address
                subject: 'Reset your password', // Subject line
                html: `<!DOCTYPE html>
                    <html>
                    <head>
                        <title>Reset your password</title>
                    </head>
                    <body>
                        <div>
                            <h3>Hi ${user.firstName} ${user.lastName},</h3>
                            <p>Follow this <a href="${url}">link</a> to change your Hihg Customer password.</p>
                            <p>You received this email because of a password recovery request submitted on our page.</p>
                            <br>
                            <p>Best regards,</p>
                            <p>The Hihg Customer team.</p>
                        </div>
                    </body>
                    </html>`, // HTML body content
            };
        }
    }

    update(id: string, userDto: UpdateUserDto, reqUser: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            // User request not Super Admin trying of create an user Super Admin
            if (reqUser.role !== UserRole.ROOT && userDto.role === UserRole.ROOT) {
                reject(new BadRequestResult(ErrorCode.MissingPermission, 'You cant not create a Super Admin User'));
                return;
            }
            this.userRepository.getUser(id).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified ID!'));
                    return;
                }
                this.userRepository.getUserByEmail(userDto.email).then((userEmail: User) => {
                    if (userEmail && userEmail.id !== id) {
                        reject(new BadRequestResult(ErrorCode.UnknownEntity, 'There is a user with same email!'));
                        return;
                    }

                    this.userRepository.updateUser(user, userDto).then((updatedUser: User) => {
                        resolve(updatedUser);
                    }).catch((error) => {
                        reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                    });
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    getUser(id: string): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUser(id).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified ID!'));
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    getUsers(): Promise<User[]> {
        return new Promise((resolve: (result: User[]) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUsers().then((users: User[]) => {
                resolve(users);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    delete(id: string, reqUser: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUser(id).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified ID!'));
                    return;
                }
                this.userRepository.deleteUser(user).then((deletedUser: User) => {
                    if (!deletedUser) {
                        reject(new BadRequestResult(ErrorCode.UnknownError, 'It can not be eliminated!'));
                        return;
                    }

                    resolve(deletedUser);
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    signIn(email: string, password: string): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.signIn(email, password).then((user: User) => {
                if (!user) {
                    reject(new ForbiddenResult(ErrorCode.UnknownEntity, 'Invalid credentials!'));
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    forgotPassword(email: string, replyUrl: string): Promise<string> {
        return new Promise((resolve: (result: string) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUserByEmail(email).then(async (user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified email!'));
                    return;
                }
                const token: string = require('crypto').randomBytes(20).toString('hex');
                this.userRepository.updateUserResetPasswordToken(user, token).then((updatedUser: User) => {
                    this.sendRecoveryPasswordEmail(updatedUser, replyUrl, false).then(() => {
                        resolve('Email sent');
                    }).catch((error) => {
                        reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                    });
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    resetPassword(token: string, password: string): Promise<string> {
        return new Promise((resolve: (result: string) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUserByToken(token).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'Token invalid or expired!'));
                    return;
                }
                this.userRepository.updateUserPassword(user, password).then(() => {
                    this.emailService.sendEmail({
                        to: user.email, // sender address
                        // from: 'noreply@nestjs.com', // list of receivers
                        subject: 'Password modification', // Subject line
                        // text: 'Recover password', // plaintext body?
                        html: `<!DOCTYPE html>
                        <html>
                        <head>
                            <title>Password modification</title>
                        </head>
                        <body>
                            <div>
                                <h3>Hi ${user.firstName} ${user.lastName},</h3>
                                <p>Your Hihg Customer password was successfully modified.</p>
                                <br>
                                <p>Best regards,</p>
                                <p>The Hihg Customer team.</p>
                            </div>
                        </body>
                        </html>`, // HTML body content
                    }).then((response) => {
                        console.log(response);
                        resolve('Email sent!');
                    }).catch((error) => {
                        console.error(error);
                        reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                    });
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    getUserByEmail(email: string): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUserByEmail(email).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified email!'));
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }
}
