import { MigrationInterface, QueryRunner } from "typeorm";

export class ReceiptConstraitChanges1728981414768 implements MigrationInterface {
    name = 'ReceiptConstraitChanges1728981414768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "paymentReceipt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "paymentReceipt" SET NOT NULL`);
    }

}
