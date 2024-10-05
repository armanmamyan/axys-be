import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1728159090742 implements MigrationInterface {
    name = 'InitialMigration1728159090742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."card_order_paymentplan_enum" AS ENUM('Annual', 'Monthly')`);
        await queryRunner.query(`CREATE TYPE "public"."card_order_paymenttype_enum" AS ENUM('Credit Card', 'Crypto')`);
        await queryRunner.query(`CREATE TABLE "card_order" ("id" SERIAL NOT NULL, "cardCategory" character varying NOT NULL, "cardType" character varying NOT NULL, "paymentPlan" "public"."card_order_paymentplan_enum" NOT NULL, "paymentType" "public"."card_order_paymenttype_enum" NOT NULL, "deliveryAddress" jsonb NOT NULL, "paymentReceipt" jsonb NOT NULL, "consumedNfts" jsonb, "designNft" jsonb, "status" character varying NOT NULL DEFAULT 'pending', "date" TIMESTAMP NOT NULL, "nextPaymentDate" TIMESTAMP NOT NULL, "userId" integer, "cardId" integer, CONSTRAINT "REL_d8189bf824a70107f328394451" UNIQUE ("cardId"), CONSTRAINT "PK_c18623f15755077702acf4708f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "card" ("id" SERIAL NOT NULL, "cardNumber" character varying NOT NULL, "cardProvider" character varying NOT NULL, "balance" numeric(10,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('Payment Reminder', 'New Message', 'Promotion')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isRead" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_paymenttype_enum" AS ENUM('Credit Card', 'Crypto')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_transactionpurpose_enum" AS ENUM('Withdraw', 'Deposit', 'Subscription', 'Transfer')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'completed', 'rejected', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "senderUsername" character varying, "receiverAddress" character varying NOT NULL, "paymentType" "public"."transaction_paymenttype_enum" NOT NULL, "transactionPurpose" "public"."transaction_transactionpurpose_enum" NOT NULL, "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'pending', "paymentReceipt" jsonb NOT NULL, "amount" integer NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer, "receiverId" integer, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying, "surName" character varying, "avatar" character varying, "username" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "kycStatus" character varying NOT NULL DEFAULT 'Not Passed', "referral" character varying, "token" character varying, "onBoarding" boolean, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otp" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "otp" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "card_order" ADD CONSTRAINT "FK_08c19f33676f60c616631d8c41b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card_order" ADD CONSTRAINT "FK_d8189bf824a70107f3283944511" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ed3e32981d7a640be5480effecf" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_7185cb5bc0826915be077f0d882" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_7185cb5bc0826915be077f0d882"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ed3e32981d7a640be5480effecf"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0"`);
        await queryRunner.query(`ALTER TABLE "card_order" DROP CONSTRAINT "FK_d8189bf824a70107f3283944511"`);
        await queryRunner.query(`ALTER TABLE "card_order" DROP CONSTRAINT "FK_08c19f33676f60c616631d8c41b"`);
        await queryRunner.query(`DROP TABLE "otp"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_transactionpurpose_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_paymenttype_enum"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`DROP TABLE "card"`);
        await queryRunner.query(`DROP TABLE "card_order"`);
        await queryRunner.query(`DROP TYPE "public"."card_order_paymenttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."card_order_paymentplan_enum"`);
    }

}
