import { EmailService } from './email.service';
import { Global, Module } from '@nestjs/common';
import { MailerModule, HandlebarsAdapter } from '@nest-modules/mailer';
import { ConfigService } from '../config/config.service';

const configService = new ConfigService();

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async () => ({
                transport: `smtps://${configService.get('MAIL_USER')}:${configService.get('MAIL_PASSWORD')}@${configService.get('MAIL_SMTP_HOST')}`,
                defaults: {
                    from: '"noreply" <noreply@arlety.com>',
                },
                template: {
                    dir: __dirname + '/templates',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
    ],
    providers: [EmailService, ConfigService],
    exports: [EmailService],
})
export class EmailModule { }
