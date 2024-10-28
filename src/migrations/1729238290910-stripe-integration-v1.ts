import { MigrationInterface, QueryRunner } from "typeorm";

export class StripeIntegrationV11729238290910 implements MigrationInterface {
    name = 'StripeIntegrationV11729238290910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeCustomerId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "subscriptionId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "subscriptionStatus" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subscriptionStatus"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subscriptionId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeCustomerId"`);
    }

}
