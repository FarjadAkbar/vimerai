import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBrandKitProducts1735470000000 implements MigrationInterface {
  name = 'DropBrandKitProducts1735470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "brand_kit_products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "imageUrls" jsonb NOT NULL,
        "landingPageUrl" character varying NOT NULL,
        "price" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "brand_kit_products" (
        "productId" uuid NOT NULL,
        "brandKitId" uuid NOT NULL,
        CONSTRAINT "PK_brand_kit_products" PRIMARY KEY ("productId", "brandKitId")
      )
    `);
  }
}
