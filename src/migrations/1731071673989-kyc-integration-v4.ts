import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV41731071673989 implements MigrationInterface {
    name = 'KycIntegrationV41731071673989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" ALTER COLUMN "address" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" ALTER COLUMN "address" SET NOT NULL`);
    }

}
