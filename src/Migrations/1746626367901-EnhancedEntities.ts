import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedEntities1746626367901 implements MigrationInterface {
    name = 'EnhancedEntities1746626367901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_company_business_name" ON "company" ("business_name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_company_cuit" ON "company" ("cuit") `);
        await queryRunner.query(`CREATE INDEX "idx_company_adhesion_date_active" ON "company" ("adhesion_date", "is_active") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_company_id" ON "transfer" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_status" ON "transfer" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_reference_id" ON "transfer" ("reference_id") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_company_date" ON "transfer" ("company_id", "transfer_date") `);
        await queryRunner.query(`CREATE INDEX "idx_transfer_date_status" ON "transfer" ("transfer_date", "status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_date_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_company_date"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_reference_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_transfer_company_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_adhesion_date_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_cuit"`);
        await queryRunner.query(`DROP INDEX "public"."idx_company_business_name"`);
    }

}
