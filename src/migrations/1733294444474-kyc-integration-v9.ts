import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV91733294444474 implements MigrationInterface {
    name = 'KycIntegrationV91733294444474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "additionalPoaKycLevel"`);
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "additionalPoaDetails"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" ADD "additionalPoaDetails" jsonb`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD "additionalPoaKycLevel" boolean NOT NULL`);
    }

}
