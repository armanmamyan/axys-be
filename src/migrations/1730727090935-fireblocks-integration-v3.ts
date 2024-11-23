import { randomBytes } from "crypto";
import { MigrationInterface, QueryRunner } from "typeorm";

export class FireblocksIntegrationV31730727090935 implements MigrationInterface {
    name = 'FireblocksIntegrationV31730727090935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "shortId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e7fcc2c6f5df1a276a26bba61e7" UNIQUE ("shortId")`);
         // Populate existing rows with unique shortId values
         const users = await queryRunner.query(`SELECT id FROM "user"`);
         for (const user of users) {
             const shortId = randomBytes(4).toString('hex'); // Generates an 8-character unique identifier
             await queryRunner.query(
                 `UPDATE "user" SET "shortId" = $1 WHERE id = $2`,
                 [shortId, user.id]
             );
         }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e7fcc2c6f5df1a276a26bba61e7"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "shortId"`);
    }

}
