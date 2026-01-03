export class PromptTemplate {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly template: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    name: string,
    template: string,
  ): PromptTemplate {
    const now = new Date();
    return new PromptTemplate(id, userId, name, template, now, now);
  }

  update(name?: string, template?: string): PromptTemplate {
    return new PromptTemplate(
      this.id,
      this.userId,
      name ?? this.name,
      template ?? this.template,
      this.createdAt,
      new Date(),
    );
  }
}
