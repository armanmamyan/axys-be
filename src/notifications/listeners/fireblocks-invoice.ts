import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class FireblocksListener {
  constructor(
    private mailerService: MailerService,
  ) {}

  @OnEvent('fireblocks.depositted')
  async handleDepositEvent(invoice: any, email: string) {
    console.log('Entered', { email });
    try {
       
    const process =  await this.mailerService.sendMail({
      to: email,
      subject: `Deposit #${invoice.id} Receipt.`,
      template: 'deposit',
      context: {
        customerName: email,
        amount: invoice.data?.amount,
        currency: invoice.data?.assetId,
        transactionId: invoice.data?.txHash,
        dateTime: new Date(invoice.data.createdAt),
      },
    });
   
    } catch (error) {
      console.error({ error })
      throw error 
    }
  }

  @OnEvent('fireblocks.withdrawed')
  async handleWithdrawEvent(invoice: any, email: string) {
    try {
      const process = await this.mailerService.sendMail({
        to: email,
        subject: `Withdraw #${invoice.id} Receipt.`,
        template: 'withdraw',
        context: {
          customerName: email,
          amount: invoice.data?.amount,
          currency: invoice.data?.assetId,
          transactionId: invoice.data?.txHash,
          dateTime: new Date(invoice.data.createdAt),
        },
      });
      console.log({ process });
    } catch (error) {
      console.error({ error })
      throw error
    }
  }
  
}