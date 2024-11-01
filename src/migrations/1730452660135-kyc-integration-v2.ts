import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV21730452660135 implements MigrationInterface {
    name = 'KycIntegrationV21730452660135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" RENAME COLUMN "created" TO "date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" RENAME COLUMN "date" TO "created"`);
    }

}
