import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiInfluencers1735466400000 implements MigrationInterface {
  name = 'AddAiInfluencers1735466400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_influencers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" text NOT NULL,
        "gender" character varying(16) NOT NULL,
        "age" integer NOT NULL,
        "ethnicity" text,
        "appearancePrompt" text NOT NULL,
        "portraitSource" character varying(16) NOT NULL,
        "portraitMediaAssetId" uuid,
        "portraitUrl" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_influencers_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ai_influencers_userId" ON "ai_influencers" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_influencers_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_influencers"`);
  }
}
