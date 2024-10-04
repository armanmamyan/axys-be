import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        port: process.env.SMTP_PORT,
        auth: {
          user: 'apikey',
          pass: process.env.SMPT_KEY,
        },
      },
      defaults: {
        from: process.env.EMAIL_FROM,
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}
