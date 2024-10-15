import { MigrationInterface, QueryRunner } from "typeorm";

export class CardOrderDeliveryAddressChanges1728992811297 implements MigrationInterface {
    name = 'CardOrderDeliveryAddressChanges1728992811297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "deliveryAddress" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_order" ALTER COLUMN "deliveryAddress" DROP NOT NULL`);
    }

}
