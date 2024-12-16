import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEmailTwoFactorEnabled1733509261487 implements MigrationInterface {
    name = 'UserEmailTwoFactorEnabled1733509261487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "emailTwoFactorEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailTwoFactorEnabled"`);
    }

}
