import { MigrationInterface, QueryRunner } from "typeorm";

export class FireblocksIntegrationV21730721565311 implements MigrationInterface {
    name = 'FireblocksIntegrationV21730721565311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "fireblocksVaultId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fireblocksVaultId"`);
    }

}
