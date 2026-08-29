import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlitzConfiguration1735462800000 implements MigrationInterface {
  name = 'AddBlitzConfiguration1735462800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blitz_configurations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "brandId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "mentionFrequency" character varying(16) NOT NULL,
        "showInfluencerMaterials" boolean NOT NULL DEFAULT false,
        "enabledFormats" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blitz_configurations_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blitz_configurations_brandId" ON "blitz_configurations" ("brandId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_blitz_configurations_userId" ON "blitz_configurations" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blitz_configurations"`);
  }
}
