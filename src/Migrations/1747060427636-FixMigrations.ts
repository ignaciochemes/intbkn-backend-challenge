import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMigrations1747060427636 implements MigrationInterface {
    name = 'FixMigrations1747060427636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "cuit" character varying(50) NOT NULL, "business_name" character varying(50) NOT NULL, "adhesion_date" TIMESTAMP NOT NULL, "address" character varying(255), "contact_email" character varying(100), "contact_phone" character varying(50), "is_active" boolean DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3fa0b2af99d910864a56bb10c9" ON "company" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "idx_company_business_name" ON "company" ("business_name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_company_cuit" ON "company" ("cuit") `);
        await queryRunner.query(`CREATE INDEX "idx_company_adhesion_date_active" ON "company" ("adhesion_date", "is_active") `);
        await queryRunner.query(`CREATE INDEX "idx_company_adhesion_date" ON "company" ("adhesion_date") `);
        await queryRunner.query(`CREATE TYPE "public"."transfer_status_enum" AS ENUM('pending', 'completed', 'failed', 'reversed')`);
        await queryRunner.query(`CREATE TABLE "transfer" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "debit_account" character varying(50) NOT NULL, "credit_account" character varying(50) NOT NULL, "transfer_date" TIMESTAMP NOT NULL, "status" "public"."transfer_status_enum" NOT NULL DEFAULT 'pending', "description" text, "reference_id" text, "processed_date" TIMESTAMP, "currency" character varying(50) DEFAULT 'ARS', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "company_id" integer, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_887620e2c3f2a45811a4a8e286" ON "transfer" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_company_id" ON "transfer" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_status" ON "transfer" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_reference_id" ON "transfer" ("reference_id") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_company_date" ON "transfer" ("company_id", "transfer_date") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_date_status" ON "transfer" ("transfer_date", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_date" ON "transfer" ("transfer_date") `);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_date"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_date_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_company_date"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_reference_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_company_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_887620e2c3f2a45811a4a8e286"`);
        await queryRunner.query(`DROP TABLE "transfer"`);
        await queryRunner.query(`DROP TYPE "public"."transfer_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_adhesion_date"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_adhesion_date_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_cuit"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_business_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fa0b2af99d910864a56bb10c9"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }

}
