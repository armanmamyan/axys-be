import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
          user: 'apikey',
          pass: process.env.SMPT_KEY,
        },
      },
      defaults: {
        from: `"AxysBank" ${process.env.EMAIL_FROM}`,
      },
      template: {
        dir: path.join(__dirname, '../templates'),
        adapter: new EjsAdapter(),
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}
