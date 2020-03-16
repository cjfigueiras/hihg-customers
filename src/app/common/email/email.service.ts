import { Injectable } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nest-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(payload: ISendMailOptions): Promise<any> {
    return await this.mailerService.sendMail({
      to: payload.to,
      from: payload.from,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      template: payload.template,
      context: {
        title: payload.subject,
        ...payload.context,
      },
    });
  }
}
