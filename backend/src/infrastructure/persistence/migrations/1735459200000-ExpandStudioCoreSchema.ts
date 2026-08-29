import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandStudioCoreSchema1735459200000 implements MigrationInterface {
  name = 'ExpandStudioCoreSchema1735459200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(64) NOT NULL,
        "type" character varying(32) NOT NULL,
        "contentType" character varying(32),
        "label" text NOT NULL,
        "prompt" text NOT NULL,
        "videoUrl" text,
        "previewUrl" text,
        "durationLabel" character varying(16),
        "remixFormatId" character varying(64),
        "status" character varying(20) NOT NULL,
        "providerJobId" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_templates_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_templates_slug" ON "templates" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "media_assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "kind" character varying(16) NOT NULL,
        "name" text NOT NULL,
        "url" text NOT NULL,
        "mimeType" text,
        "sizeBytes" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_assets_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_media_assets_userId" ON "media_assets" ("userId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "brandId" uuid,
        "type" character varying(32) NOT NULL,
        "status" character varying(20) NOT NULL,
        "input" jsonb NOT NULL DEFAULT '{}',
        "error" text,
        "providerJobId" text,
        "creditCharge" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jobs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_userId" ON "jobs" ("userId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "content_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "jobId" uuid NOT NULL,
        "mediaKind" character varying(16) NOT NULL,
        "mediaUrl" text,
        "thumbnailUrl" text,
        "title" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_content_items_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_content_items_userId" ON "content_items" ("userId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_content_items_jobId" ON "content_items" ("jobId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "content_items"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "media_assets"`);
    await queryRunner.query(`DROP TABLE "templates"`);
  }
}
