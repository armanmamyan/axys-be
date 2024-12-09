import { MigrationInterface, QueryRunner } from 'typeorm';

export class KycIntegrationV101733675252467 implements MigrationInterface {
  name = 'KycIntegrationV101733675252467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."kyc_gender_enum" AS ENUM('0', '1')`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "gender" "public"."kyc_gender_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "placeOfBirth" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "dob" date NOT NULL`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "contact" jsonb NOT NULL`);
    await queryRunner.query(`ALTER TABLE "kyc" ALTER COLUMN "address" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" ALTER COLUMN "address" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "contact"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "dob"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "placeOfBirth"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_gender_enum"`);
  }
}
