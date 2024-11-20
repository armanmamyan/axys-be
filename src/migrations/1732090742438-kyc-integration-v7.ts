import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV71732090742438 implements MigrationInterface {
    name = 'KycIntegrationV71732090742438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_1380ac54f345450d7054ce0c2c6"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_1380ac54f345450d7054ce0c2c6"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "kycId"`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD "applicantId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "applicantId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "kycId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_1380ac54f345450d7054ce0c2c6" UNIQUE ("kycId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_1380ac54f345450d7054ce0c2c6" FOREIGN KEY ("kycId") REFERENCES "kyc"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
