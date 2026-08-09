export class Product {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly imageUrls: string[],
    public readonly landingPageUrl: string,
    public readonly price: string | null,
    public readonly brandKitIds: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    name: string,
    description: string,
    imageUrls: string[],
    landingPageUrl: string,
    brandKitIds: string[],
    price: string | null = null,
  ): Product {
    if (imageUrls.length < 1) {
      throw new Error('Product requires at least one image');
    }
    const now = new Date();
    return new Product(
      id,
      userId,
      name,
      description,
      imageUrls,
      landingPageUrl,
      price,
      [...new Set(brandKitIds)],
      now,
      now,
    );
  }

  update(fields: {
    name?: string;
    description?: string;
    imageUrls?: string[];
    landingPageUrl?: string;
    price?: string | null;
    brandKitIds?: string[];
  }): Product {
    const imageUrls = fields.imageUrls ?? this.imageUrls;
    const brandKitIds = fields.brandKitIds ?? this.brandKitIds;
    if (imageUrls.length < 1) {
      throw new Error('Product requires at least one image');
    }
    return new Product(
      this.id,
      this.userId,
      fields.name ?? this.name,
      fields.description ?? this.description,
      imageUrls,
      fields.landingPageUrl ?? this.landingPageUrl,
      fields.price !== undefined ? fields.price : this.price,
      [...new Set(brandKitIds)],
      this.createdAt,
      new Date(),
    );
  }
}
