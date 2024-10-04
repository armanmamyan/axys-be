import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "../entity/transactions.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private userService: UsersService
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    user: Partial<User>
  ): Promise<Transaction> {
    const {
      to,
      paymentType,
      paymentReceipt,
      amount,
      transactionPurpose,
      status
    } = createTransactionDto;

    const fromUser = await this.userService.findOne(user.email);
    if (!fromUser) {
      throw new NotFoundException("Sender user not found");
    }

    const transaction = this.transactionRepository.create({
      sender: fromUser,
      receiverAddress: to,
      paymentType,
      paymentReceipt,
      amount,
      transactionPurpose,
      status
    });

    return await this.transactionRepository.save(transaction);
  }
}
