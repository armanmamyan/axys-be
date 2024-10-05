import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as dotenv from 'dotenv';
import * as path from 'path';

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
