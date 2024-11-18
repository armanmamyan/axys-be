import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV31731070019720 implements MigrationInterface {
    name = 'KycIntegrationV31731070019720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD "middleName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD "address" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "middleName"`);
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "firstName"`);
    }

}
