import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '@/domain/product.entity';
import { BrandKitEntity } from './brand-kit.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'jsonb' })
  imageUrls: string[];

  @Column()
  landingPageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  price: string | null;

  @ManyToMany(() => BrandKitEntity, { eager: true })
  @JoinTable({
    name: 'brand_kit_products',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'brandKitId', referencedColumnName: 'id' },
  })
  brandKits: BrandKitEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.userId,
      entity.name,
      entity.description,
      entity.imageUrls,
      entity.landingPageUrl,
      entity.price,
      (entity.brandKits ?? []).map((kit) => kit.id),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(
    domain: Product,
    brandKits: BrandKitEntity[],
  ): ProductEntity {
    const entity = new ProductEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.imageUrls = domain.imageUrls;
    entity.landingPageUrl = domain.landingPageUrl;
    entity.price = domain.price;
    entity.brandKits = brandKits;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
