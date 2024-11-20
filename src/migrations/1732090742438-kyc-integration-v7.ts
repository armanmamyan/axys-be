import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV71732090742438 implements MigrationInterface {
    name = 'KycIntegrationV71732090742438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" ADD "applicantId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "applicantId"`);
    }

}
