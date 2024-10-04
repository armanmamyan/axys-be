import { Injectable, Logger, OnApplicationBootstrap, forwardRef } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatus } from 'src/transactions/enums';
import { TransactionsService } from 'src/transactions/services/transactions.service';
import { Transaction } from 'src/transactions/entity/transactions.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TransactionSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TransactionSchedulerService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private transactionService: TransactionsService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Re-initializing cron jobs for transaction checks...');
    // Cron jobs are created when a transaction needs monitoring.
    // They are deleted when the transaction no longer requires monitoring (e.g., when completed or canceled).
    // Good vor Deposit architecture or the staff that requires dynamic approach
  }

  async updateTransaction() {
    this.logger.debug('Checking for transactions that need to be updated or cancelled...');
  }

  addTransactionCheckJob(transactionId: string, hash: string) {
    const jobName = `check-subscription-${transactionId}`;
    // 0 * * * * * - Every minute
    const job = new CronJob(CronExpression.EVERY_10_MINUTES, async () => {
      this.logger.warn(`Checking transaction ${transactionId}`);
      // TODO
      const transaction = null;

      if (!transaction) {
        this.deleteCronJob(jobName);
        return;
      }

      const txSender = await this.userRepository.findOne({
        where: {
          id: transaction.senderId,
        },
      });

      if (transaction && transaction?.status !== TransactionStatus.Completed && !transaction.receiverId) {
        // TODO
        this.logger.warn(`Transaction ${transactionId} cancelled`);
        this.deleteCronJob(jobName);
      }
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.warn(
      `Added cron job for transaction ${transactionId}: ${job.nextDates().map((date) => date.toJSDate())}`,
    );
  }

  deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`Cron job ${name} deleted!`);
  }

  listCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((job, key) => {
      this.logger.log(`Job: ${key} -> Next: ${job.nextDates().map((date) => date.toJSDate())}`);
    });
  }
}
