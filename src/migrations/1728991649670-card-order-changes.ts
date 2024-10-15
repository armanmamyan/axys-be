import { MigrationInterface, QueryRunner } from "typeorm";

export class CardOrderChanges1728991649670 implements MigrationInterface {
    name = 'CardOrderChanges1728991649670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "deliveryAddress" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "paymentReceipt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "paymentReceipt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "deliveryAddress" SET NOT NULL`);
    }

}
