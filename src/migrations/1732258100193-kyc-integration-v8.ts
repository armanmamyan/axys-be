import { MigrationInterface, QueryRunner } from 'typeorm';

export class KycIntegrationV81732258100193 implements MigrationInterface {
  name = 'KycIntegrationV81732258100193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "currentLevel" character varying NOT NULL DEFAULT 'basic-poa-kyc-level'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "currentLevel"`);
  }
}
