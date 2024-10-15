import { MigrationInterface, QueryRunner } from "typeorm";

export class CardOrderChanges1728988183384 implements MigrationInterface {
    name = 'CardOrderChanges1728988183384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_8515e60a2cc41584fa4784f52ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_36e929b98372d961bb63bd4b4e" ON "password_reset" ("token") `);
        await queryRunner.query(`CREATE TYPE "public"."card_order_paymentplan_enum" AS ENUM('Annual', 'Monthly')`);
        await queryRunner.query(`ALTER TABLE "card_order" ADD "paymentPlan" "public"."card_order_paymentplan_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_reset" ADD CONSTRAINT "FK_05baebe80e9f8fab8207eda250c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset" DROP CONSTRAINT "FK_05baebe80e9f8fab8207eda250c"`);
        await queryRunner.query(`ALTER TABLE "card_order" DROP COLUMN "paymentPlan"`);
        await queryRunner.query(`DROP TYPE "public"."card_order_paymentplan_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36e929b98372d961bb63bd4b4e"`);
        await queryRunner.query(`DROP TABLE "password_reset"`);
    }

}
