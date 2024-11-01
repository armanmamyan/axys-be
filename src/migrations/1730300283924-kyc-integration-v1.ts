import { MigrationInterface, QueryRunner } from "typeorm";

export class KycIntegrationV11730300283924 implements MigrationInterface {
    name = 'KycIntegrationV11730300283924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "kyc" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "basicPoaKycLevel" boolean NOT NULL, "additionalPoaKycLevel" boolean NOT NULL, "basicPoaDetails" jsonb, "additionalPoaDetails" jsonb, "created" TIMESTAMP NOT NULL, CONSTRAINT "REL_ca948073ed4a3ba22030d37b3d" UNIQUE ("userId"), CONSTRAINT "PK_84ab2e81ea9700d29dda719f3be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "primaryAddress" jsonb`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD CONSTRAINT "FK_ca948073ed4a3ba22030d37b3db" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" DROP CONSTRAINT "FK_ca948073ed4a3ba22030d37b3db"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "primaryAddress"`);
        await queryRunner.query(`DROP TABLE "kyc"`);
    }

}
