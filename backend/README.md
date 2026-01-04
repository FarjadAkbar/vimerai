# Vimerai Backend

<div align="center">
  <h3>NestJS Backend API for AI Video Generation</h3>
  <p>RESTful API with clean architecture and domain-driven design</p>
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Video Generation](#video-generation)
- [Authentication](#authentication)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

Vimerai backend is a robust NestJS application that provides RESTful APIs for AI-powered video generation. It follows clean architecture principles with clear separation of concerns, making it maintainable and scalable.

### Key Features

- 🔐 **JWT Authentication**: Secure user authentication and authorization
- 🎬 **Video Generation**: Integration with Sora API and mock provider
- 💳 **Subscription Management**: Plan-based video generation limits
- 📊 **Video Management**: CRUD operations for user videos
- 🔄 **Real-time Status**: Polling support for generation status
- 🛡️ **Input Validation**: DTO-based validation with class-validator

## 🏗 Architecture

The backend follows **Clean Architecture** principles:

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  (Controllers, Services, DTOs)      │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│          Domain Layer                │
│  (Entities, Value Objects)          │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Infrastructure Layer            │
│  (Repositories, External Services)  │
└─────────────────────────────────────┘
```

### Layer Responsibilities

1. **Application Layer**: Business logic, use cases, controllers
2. **Domain Layer**: Core entities and business rules
3. **Infrastructure Layer**: Database, external APIs, implementations

## 🛠 Tech Stack

### Core Technologies

- **Framework**: [NestJS 11](https://nestjs.com/)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator + class-transformer
- **HTTP Client**: Axios

### Key Dependencies

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/typeorm": "^11.0.0",
  "@nestjs/jwt": "^11.0.2",
  "typeorm": "^0.3.28",
  "pg": "^8.16.3",
  "bcrypt": "^6.0.0",
  "stripe": "^17.3.1",
  "axios": "^1.7.9"
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── application/          # Application layer
│   │   ├── auth/            # Authentication module
│   │   ├── generator/       # Video generation
│   │   ├── videos/          # Video management
│   │   ├── subscription/    # Subscription management
│   │   ├── users/           # User management
│   │   └── prompts/         # Prompt templates
│   ├── domain/              # Domain layer
│   │   ├── user.entity.ts
│   │   ├── video.entity.ts
│   │   ├── subscription.entity.ts
│   │   └── prompt-template.entity.ts
│   ├── infrastructure/      # Infrastructure layer
│   │   ├── auth/            # JWT implementation
│   │   ├── persistence/     # Database (TypeORM)
│   │   ├── video-generation/ # Sora/Mock providers
│   │   ├── payment/         # Stripe integration
│   │   └── config/          # Configuration
│   ├── core/                 # Core abstractions
│   │   ├── ports/           # Interfaces
│   │   └── tokens/          # Dependency injection tokens
│   └── main.ts              # Application entry point
├── test/                     # E2E tests
└── data-source.ts           # TypeORM configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=vimerai

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Video Generation (Sora)
VIDEO_GENERATION_SORA_API_KEY=your_sora_api_key
VIDEO_GENERATION_SORA_API_URL=https://api.sora.com/v1/videos
VIDEO_GENERATION_SORA_TIMEOUT=300000

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Database Setup

```bash
# Run migrations
pnpm migration:run

# Or generate new migration
pnpm migration:generate src/infrastructure/persistence/migrations/MigrationName
```

### Development

```bash
# Start development server (with hot reload)
pnpm start:dev

# Start production server
pnpm start:prod

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/password-reset/request` | Request password reset | No |
| POST | `/auth/password-reset` | Reset password | No |

### Video Generation

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generator/generate` | Generate video | Yes |
| POST | `/generator/preview` | Generate preview | Yes |
| GET | `/generator/status/:jobId` | Get generation status | Yes |
| GET | `/generator/download/:videoId` | Download video | Yes |

### Videos

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/videos` | List user videos | Yes |
| GET | `/videos/:id` | Get video details | Yes |
| DELETE | `/videos/:id` | Delete video | Yes |

### Subscription

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subscription/current` | Get current subscription | Yes |
| GET | `/subscription/usage` | Get usage stats | Yes |
| GET | `/subscription/plans` | List available plans | No |
| POST | `/subscription/checkout` | Create checkout session | Yes |
| POST | `/subscription/portal` | Create portal session | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user | Yes |
| PATCH | `/users/me` | Update user profile | Yes |

## 🗄 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Videos Table

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prompt TEXT NOT NULL,
  mode VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  video_url VARCHAR,
  preview_url VARCHAR,
  job_id VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  plan VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  videos_generated INTEGER DEFAULT 0,
  limit INTEGER NOT NULL,
  stripe_subscription_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎬 Video Generation

### Providers

The system supports multiple video generation providers:

1. **Sora Provider** (`sora-video-generation.provider.ts`)
   - Production provider using Sora API
   - Requires API key and credits

2. **Mock Provider** (`mock-video-generation.provider.ts`)
   - Development/demo provider
   - Simulates generation with delays
   - Returns sample videos

### Switching Providers

In `generator.module.ts`:

```typescript
{
  provide: 'IVideoGenerationProvider',
  useClass: MockVideoGenerationProvider, // or SoraVideoGenerationProvider
}
```

### Generation Flow

1. User submits prompt → `POST /generator/generate`
2. Service creates video record with `PENDING` status
3. Provider generates video asynchronously
4. Status updates: `PENDING` → `PROCESSING` → `COMPLETED`
5. Frontend polls status via `GET /generator/status/:jobId`

## 🔐 Authentication

### JWT Strategy

- **Token Type**: Bearer token
- **Storage**: HTTP-only cookies (recommended) or Authorization header
- **Expiration**: 7 days (configurable)
- **Refresh**: Not implemented (Phase 1)

### Password Security

- **Hashing**: bcrypt with salt rounds
- **Validation**: Minimum 8 characters, complexity requirements

### Protected Routes

Use `@UseGuards(JwtAuthGuard)` decorator:

```typescript
@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  // All routes require authentication
}
```

## 💻 Development

### Code Style

- **ESLint**: Configured with NestJS rules
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled

### Adding New Features

1. **Create Domain Entity** in `domain/`
2. **Create Port Interface** in `core/ports/`
3. **Implement Repository** in `infrastructure/persistence/`
4. **Create Service** in `application/`
5. **Create Controller** in `application/`
6. **Register in Module**

### Example: Adding a New Feature

```typescript
// 1. Domain Entity
export class NewEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

// 2. Port Interface
export interface INewRepository {
  create(entity: NewEntity): Promise<void>;
  findById(id: string): Promise<NewEntity | null>;
}

// 3. Repository Implementation
@Injectable()
export class TypeOrmNewRepository implements INewRepository {
  // Implementation
}

// 4. Service
@Injectable()
export class NewService {
  constructor(
    @Inject('INewRepository')
    private readonly repository: INewRepository,
  ) {}
}

// 5. Controller
@Controller('new')
export class NewController {
  constructor(private readonly service: NewService) {}
}

// 6. Module
@Module({
  controllers: [NewController],
  providers: [NewService, /* ... */],
})
export class NewModule {}
```

### Database Migrations

```bash
# Generate migration
pnpm migration:generate src/infrastructure/persistence/migrations/AddNewTable

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

## 🚢 Deployment

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start:prod
```

### Environment Setup

Ensure all environment variables are set:
- Database connection
- JWT secret
- API keys (Sora, Stripe)
- Server port

### Recommended Platforms

- **Railway**: Easy PostgreSQL + Node.js deployment
- **Heroku**: Simple deployment with add-ons
- **AWS**: EC2 + RDS for scalable setup
- **DigitalOcean**: App Platform or Droplets

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY . .
RUN pnpm build
CMD ["pnpm", "start:prod"]
```

## 📊 Architecture Details

### Dependency Injection

Uses NestJS DI container with custom tokens:

```typescript
// core/tokens/injection.tokens.ts
export const VIDEO_REPOSITORY_TOKEN = 'IVideoRepository';

// Module registration
{
  provide: VIDEO_REPOSITORY_TOKEN,
  useClass: TypeOrmVideoRepository,
}
```

### Repository Pattern

All data access goes through repository interfaces:

```typescript
// Port (Interface)
export interface IVideoRepository {
  createVideo(video: Video): Promise<void>;
  getVideoById(id: string): Promise<Video | null>;
}

// Implementation
@Injectable()
export class TypeOrmVideoRepository implements IVideoRepository {
  // TypeORM implementation
}
```

### Service Layer

Business logic in services:

```typescript
@Injectable()
export class GeneratorService implements IGeneratorService {
  constructor(
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
    @Inject('IVideoGenerationProvider')
    private readonly videoGenerationProvider: IVideoGenerationProvider,
  ) {}
}
```

## 🔧 Configuration

Configuration files in `infrastructure/config/`:

- `database.config.ts`: TypeORM configuration
- `jwt.config.ts`: JWT settings
- `server.config.ts`: Server port, CORS
- `stripe.config.ts`: Payment settings
- `video-generation.config.ts`: Sora API settings

## 📝 Code Documentation

### Key Modules

| Module | Purpose | Location |
|--------|---------|----------|
| `AuthModule` | Authentication & authorization | `application/auth/` |
| `GeneratorModule` | Video generation | `application/generator/` |
| `VideosModule` | Video management | `application/videos/` |
| `SubscriptionModule` | Subscription & plans | `application/subscription/` |
| `UsersModule` | User management | `application/users/` |

### Domain Entities

- **User**: User account information
- **Video**: Generated video metadata
- **Subscription**: User subscription and limits
- **PromptTemplate**: Saved prompt templates

### Ports (Interfaces)

Located in `core/ports/`:
- `IAuthService`: Authentication operations
- `IVideoRepository`: Video data access
- `IVideoGenerationProvider`: Video generation abstraction
- `ISubscriptionService`: Subscription management
- `IPaymentService`: Payment processing

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Check PostgreSQL is running
- Verify connection string in `.env`
- Check database exists

**JWT Token Invalid**
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure token format is correct

**Video Generation Fails**
- Check Sora API key (if using Sora provider)
- Verify API URL is correct
- Check network connectivity

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)

## 🤝 Contributing

1. Follow the architecture patterns
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Use dependency injection

## 📄 License

[Your License Here]

---

Built with ❤️ using NestJS and TypeScript
