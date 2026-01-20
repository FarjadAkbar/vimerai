# Backend Code Documentation

This document provides detailed documentation of the backend codebase architecture, modules, and implementation patterns.

## 🏗 Architecture Overview

The backend follows **Clean Architecture** with three main layers:

1. **Application Layer**: Business logic, use cases, controllers
2. **Domain Layer**: Core entities and business rules
3. **Infrastructure Layer**: External integrations, database, APIs

## 📁 Directory Structure

### `/src/application`

Application layer containing business logic and use cases.

#### Auth Module (`application/auth/`)

**`auth.service.ts`**
- User registration with password hashing
- Login with JWT token generation
- Password reset flow
- Implements `IAuthService` interface

**`auth.controller.ts`
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/password-reset/request` - Request reset
- `POST /auth/password-reset` - Reset password

**DTOs** (`dto/`)
- `signup.dto.ts` - Registration data
- `login.dto.ts` - Login credentials
- `password-reset-request.dto.ts` - Reset request
- `password-reset.dto.ts` - New password

#### Generator Module (`application/generator/`)

**`generator.service.ts`**
- Video generation orchestration
- Status polling
- Preview generation
- Video download
- Implements `IGeneratorService` interface

**`generator.controller.ts`
- `POST /generator/generate` - Generate video
- `POST /generator/preview` - Generate preview
- `GET /generator/status/:jobId` - Get status
- `GET /generator/download/:videoId` - Download video

**Key Methods**:
```typescript
async generateVideo(userId: string, dto: GenerateVideoDto)
async generatePreview(userId: string, dto: GeneratePreviewDto)
async getGenerationStatus(jobId: string)
async downloadVideo(videoId: string)
```

#### Videos Module (`application/videos/`)

**`videos.service.ts`**
- Video CRUD operations
- User video listing
- Video deletion

**`videos.controller.ts`
- `GET /videos` - List user videos
- `GET /videos/:id` - Get video details
- `DELETE /videos/:id` - Delete video

#### Subscription Module (`application/subscription/`)

**`subscription.service.ts`**
- Subscription management
- Usage tracking
- Plan limits enforcement
- Stripe integration
- Implements `ISubscriptionService` interface

**`subscription.controller.ts`
- `GET /subscription/current` - Get current subscription
- `GET /subscription/usage` - Get usage stats
- `GET /subscription/plans` - List plans
- `POST /subscription/checkout` - Create checkout
- `POST /subscription/portal` - Create portal

**Key Methods**:
```typescript
async canGenerate(userId: string): Promise<boolean>
async recordVideoGeneration(userId: string): Promise<void>
async getCurrentSubscription(userId: string)
```

#### Users Module (`application/users/`)

**`users.service.ts`**
- User profile management
- User data retrieval

**`users.controller.ts`
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update user

### `/src/domain`

Domain layer with core entities and business rules.

#### Entities

**`user.entity.ts`**
```typescript
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
  
  static create(email: string, passwordHash: string): User
}
```

**`video.entity.ts`**
```typescript
export enum VideoStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum GenerationMode {
  FAST = 'fast',
  CINEMATIC = 'cinematic',
  AVATAR = 'avatar',
}

export class Video {
  static create(id, userId, prompt, mode, jobId): Video
  updateStatus(status: VideoStatus, videoUrl?: string): Video
  updatePreviewUrl(previewUrl: string): Video
}
```

**`subscription.entity.ts`**
```typescript
export enum SubscriptionPlan {
  STARTER = 'starter',
  CREATOR = 'creator',
  PRO = 'pro',
}

export class Subscription {
  // Plan, limits, usage tracking
}
```

**`prompt-template.entity.ts`**
```typescript
export class PromptTemplate {
  // Template name, prompt, category
}
```

### `/src/infrastructure`

Infrastructure layer with external integrations.

#### Persistence (`infrastructure/persistence/`)

**TypeORM Entities** (`typeorm/entities/`)
- `user.entity.ts` - User database entity
- `video.entity.ts` - Video database entity
- `subscription.entity.ts` - Subscription entity
- `prompt-template.entity.ts` - Template entity

**Repositories** (`typeorm/repositories/`)
- `user.repository.ts` - Implements `IUserRepository`
- `video.repository.ts` - Implements `IVideoRepository`
- `subscription.repository.ts` - Implements `ISubscriptionRepository`
- `prompt-template.repository.ts` - Implements `IPromptTemplateRepository`

**Migrations** (`migrations/`)
- Database schema migrations
- Run with `pnpm migration:run`

#### Auth (`infrastructure/auth/`)

**`jwt-token-service.ts`**
- JWT token generation
- Token validation
- Implements `ITokenService`

**`jwt.strategy.ts`**
- Passport JWT strategy
- Token extraction from header
- User validation

**`jwt-auth.guard.ts`**
- Route protection guard
- Validates JWT tokens

**`current-user.decorator.ts`**
- Custom decorator for current user
- Extracts user from request

**`bcrypt-password-hasher.ts`**
- Password hashing with bcrypt
- Password verification
- Implements `IPasswordHasher`

#### Video Generation (`infrastructure/video-generation/`)

**`sora-video-generation.provider.ts`**
- Sora API integration
- Video generation
- Status polling
- Video download
- Implements `IVideoGenerationProvider`

**`mock-video-generation.provider.ts`**
- Mock provider for development
- Simulates generation delays
- Returns sample videos
- Implements `IVideoGenerationProvider`

**Key Methods**:
```typescript
async generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse>
async getGenerationStatus(jobId: string): Promise<GenerateVideoResponse>
async generatePreview(prompt: string): Promise<{ previewUrl: string }>
async downloadVideo(videoId: string): Promise<Buffer>
```

#### Payment (`infrastructure/payment/`)

**`stripe-payment.service.ts`**
- Stripe checkout session creation
- Portal session creation
- Webhook handling
- Implements `IPaymentService`

#### Configuration (`infrastructure/config/`)

**`database.config.ts`**
- TypeORM configuration
- Database connection settings

**`jwt.config.ts`**
- JWT secret and expiration

**`server.config.ts`**
- Server port and CORS

**`stripe.config.ts`**
- Stripe API keys

**`video-generation.config.ts`**
- Sora API configuration

### `/src/core`

Core abstractions and interfaces.

#### Ports (`core/ports/`)

Interfaces defining contracts:

- `auth.service.ts` - `IAuthService`
- `generator.service.ts` - `IGeneratorService`
- `video.repository.ts` - `IVideoRepository`
- `video-generation.provider.ts` - `IVideoGenerationProvider`
- `subscription.service.ts` - `ISubscriptionService`
- `payment.service.ts` - `IPaymentService`
- `token-service.ts` - `ITokenService`
- `password-hasher.ts` - `IPasswordHasher`

#### Tokens (`core/tokens/`)

Dependency injection tokens:
```typescript
export const VIDEO_REPOSITORY_TOKEN = 'IVideoRepository';
export const VIDEO_GENERATION_PROVIDER_TOKEN = 'IVideoGenerationProvider';
```

## 🔄 Data Flow

### Video Generation Flow

1. **Request**: `POST /generator/generate`
2. **Controller**: `GeneratorController.generate()`
3. **Service**: `GeneratorService.generateVideo()`
   - Check subscription limits
   - Create video entity
   - Save to database
   - Call video generation provider
4. **Provider**: `VideoGenerationProvider.generateVideo()`
   - Call Sora API or mock
   - Return jobId and status
5. **Response**: Return jobId to client
6. **Polling**: Client polls `/generator/status/:jobId`
7. **Update**: Service updates video status in database

### Authentication Flow

1. **Request**: `POST /auth/login`
2. **Controller**: `AuthController.login()`
3. **Service**: `AuthService.login()`
   - Find user by email
   - Verify password
   - Generate JWT token
4. **Response**: Return token to client
5. **Storage**: Client stores token
6. **Usage**: Token sent in Authorization header

## 🗄 Database Schema

### Users Table
```sql
id UUID PRIMARY KEY
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Videos Table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
prompt TEXT NOT NULL
mode VARCHAR NOT NULL
status VARCHAR NOT NULL
video_url VARCHAR
preview_url VARCHAR
job_id VARCHAR UNIQUE NOT NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Subscriptions Table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id) UNIQUE
plan VARCHAR NOT NULL
status VARCHAR NOT NULL
videos_generated INTEGER DEFAULT 0
limit INTEGER NOT NULL
stripe_subscription_id VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

## 🔐 Security

### Authentication

- **JWT Tokens**: Bearer token authentication
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: Configurable (default 7 days)
- **Protected Routes**: `@UseGuards(JwtAuthGuard)`

### Input Validation

- **DTOs**: class-validator decorators
- **Validation Pipes**: Automatic validation
- **Error Handling**: Structured error responses

### Security Best Practices

- Password never returned in responses
- SQL injection prevention via TypeORM
- XSS protection in responses
- CORS configuration
- Rate limiting (to be implemented)

## 🧪 Testing

### Unit Tests

Test individual services and components:
```typescript
describe('GeneratorService', () => {
  it('should generate video', async () => {
    // Test implementation
  });
});
```

### E2E Tests

Test complete flows:
```typescript
describe('/generator (e2e)', () => {
  it('should generate video', () => {
    // E2E test
  });
});
```

## 📝 Code Patterns

### Service Pattern

```typescript
@Injectable()
export class MyService implements IMyService {
  constructor(
    @Inject('IMyRepository')
    private readonly repository: IMyRepository,
  ) {}
  
  async doSomething(): Promise<Result> {
    // Business logic
  }
}
```

### Repository Pattern

```typescript
@Injectable()
export class TypeOrmMyRepository implements IMyRepository {
  constructor(
    @InjectRepository(MyEntity)
    private readonly repository: Repository<MyEntity>,
  ) {}
  
  async findById(id: string): Promise<MyEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MyEntity.toDomain(entity) : null;
  }
}
```

### Controller Pattern

```typescript
@Controller('my-resource')
@UseGuards(JwtAuthGuard)
export class MyController {
  constructor(private readonly service: MyService) {}
  
  @Get()
  async findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAll(user.userId);
  }
}
```

### Module Pattern

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [MyController],
  providers: [
    MyService,
    {
      provide: 'IMyRepository',
      useClass: TypeOrmMyRepository,
    },
  ],
  exports: [MyService],
})
export class MyModule {}
```

## 🔧 Configuration

### Environment Variables

Required variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT`, `NODE_ENV`
- `VIDEO_GENERATION_SORA_API_KEY`, `VIDEO_GENERATION_SORA_API_URL`
- `STRIPE_SECRET_KEY` (optional)

### TypeORM Configuration

```typescript
// data-source.ts
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  // ... other config
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/**/*.migration.ts'],
});
```

## 🚀 Deployment

### Build Process

```bash
pnpm build  # Compiles TypeScript to JavaScript
pnpm start:prod  # Runs compiled code
```

### Database Migrations

```bash
pnpm migration:run  # Run pending migrations
pnpm migration:revert  # Revert last migration
```

### Environment Setup

1. Set all environment variables
2. Run database migrations
3. Start the server
4. Verify health endpoint


