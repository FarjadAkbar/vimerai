# Hexagonal Architecture - Provider Independence

This document confirms that the payment and video generation services are **completely decoupled** from their providers (Stripe and Sora).

## Architecture Overview

The codebase follows **Hexagonal Architecture (Ports and Adapters)** pattern:

```
┌─────────────────────────────────────────────────┐
│           Application Layer (Business Logic)    │
│  - SubscriptionService                          │
│  - GeneratorService                             │
│  - Uses: IPaymentService (port)                 │
│  - Uses: IVideoGenerationProvider (port)       │
└─────────────────────────────────────────────────┘
                      ▲
                      │ Depends on
                      │ Interfaces (Ports)
┌─────────────────────────────────────────────────┐
│           Core Layer (Ports/Interfaces)         │
│  - IPaymentService                              │
│  - IVideoGenerationProvider                    │
│  - No provider-specific code                    │
└─────────────────────────────────────────────────┘
                      ▲
                      │ Implements
                      │
┌─────────────────────────────────────────────────┐
│      Infrastructure Layer (Adapters)             │
│  - StripePaymentService (implements IPaymentService)│
│  - SoraVideoGenerationProvider (implements IVideoGenerationProvider)│
│  - Can be swapped without changing business logic│
└─────────────────────────────────────────────────┘
```

## Verification: No Tight Coupling

### ✅ Payment Service Independence

**Application Layer** (`subscription.service.ts`):
```typescript
// ✅ Only depends on PORT interface
import { IPaymentService } from '@/core/ports/payment.service';

constructor(
  @Inject('IPaymentService')
  private readonly paymentService: IPaymentService, // ← Interface, not Stripe!
) {}
```

**Core Layer** (`core/ports/payment.service.ts`):
```typescript
// ✅ Pure interface, no Stripe dependencies
export interface IPaymentService {
  createCheckoutSession(...): Promise<...>;
  createPortalSession(...): Promise<...>;
  handleWebhook(...): Promise<...>;
}
```

**Infrastructure Layer** (`infrastructure/payment/stripe-payment.service.ts`):
```typescript
// ✅ Only place where Stripe is used
import Stripe from 'stripe';
export class StripePaymentService implements IPaymentService {
  // Stripe-specific implementation
}
```

### ✅ Video Generation Provider Independence

**Application Layer** (`generator.service.ts`):
```typescript
// ✅ Only depends on PORT interface
import { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';

constructor(
  @Inject('IVideoGenerationProvider')
  private readonly videoGenerationProvider: IVideoGenerationProvider, // ← Interface, not Sora!
) {}
```

**Core Layer** (`core/ports/video-generation.provider.ts`):
```typescript
// ✅ Pure interface, no Sora dependencies
export interface IVideoGenerationProvider {
  generateVideo(...): Promise<...>;
  getGenerationStatus(...): Promise<...>;
  generatePreview(...): Promise<...>;
}
```

**Infrastructure Layer** (`infrastructure/video-generation/sora-video-generation.provider.ts`):
```typescript
// ✅ Only place where Sora is used
import axios from 'axios';
export class SoraVideoGenerationProvider implements IVideoGenerationProvider {
  // Sora-specific implementation
}
```

## How to Swap Providers

### Example 1: Replace Stripe with PayPal

**Step 1**: Create new adapter
```typescript
// infrastructure/payment/paypal-payment.service.ts
export class PayPalPaymentService implements IPaymentService {
  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    // PayPal implementation
  }
  // ... implement other methods
}
```

**Step 2**: Update module wiring (ONLY change needed)
```typescript
// application/subscription/subscription.module.ts
providers: [
  // ... other providers
  {
    provide: 'IPaymentService',
    useClass: PayPalPaymentService, // ← Only this line changes!
  },
]
```

**Step 3**: Done! No changes to:
- ❌ `SubscriptionService` (business logic)
- ❌ `IPaymentService` (port interface)
- ❌ Any controllers
- ❌ Any other services

### Example 2: Replace Sora with RunwayML

**Step 1**: Create new adapter
```typescript
// infrastructure/video-generation/runwayml-video-generation.provider.ts
export class RunwayMLVideoGenerationProvider implements IVideoGenerationProvider {
  async generateVideo(request: GenerateVideoRequest) {
    // RunwayML implementation
  }
  // ... implement other methods
}
```

**Step 2**: Update module wiring (ONLY change needed)
```typescript
// application/generator/generator.module.ts
providers: [
  // ... other providers
  {
    provide: 'IVideoGenerationProvider',
    useClass: RunwayMLVideoGenerationProvider, // ← Only this line changes!
  },
]
```

**Step 3**: Done! No changes to:
- ❌ `GeneratorService` (business logic)
- ❌ `IVideoGenerationProvider` (port interface)
- ❌ Any controllers
- ❌ Any other services

## Dependency Injection Verification

The dependency injection is configured in modules:

```typescript
// subscription.module.ts
providers: [
  {
    provide: 'IPaymentService',        // ← Port token
    useClass: StripePaymentService,    // ← Adapter implementation
  },
]

// generator.module.ts
providers: [
  {
    provide: 'IVideoGenerationProvider', // ← Port token
    useClass: SoraVideoGenerationProvider, // ← Adapter implementation
  },
]
```

**Key Point**: The application services inject using the **port token**, not the concrete class. This means swapping adapters requires **zero changes** to business logic.

## Benefits

1. **Provider Independence**: Business logic doesn't know about Stripe or Sora
2. **Easy Testing**: Mock the ports in tests
3. **Flexibility**: Swap providers without rewriting business logic
4. **Multiple Providers**: Can support multiple providers simultaneously
5. **Future-Proof**: New providers can be added without breaking existing code

## Compliance with Execution Requirements

From `VimeraAI-Execution.txt`:
> "Provider Independence & Future-Proof Architecture (Mandatory)
> This project must be implemented with full provider independence.
> All video generation logic (Fast, Cinematic, Avatar) must be abstracted behind internal interfaces and must not be directly coupled to any third-party AI provider in the codebase, architecture, or business logic."

✅ **CONFIRMED**: The architecture fully complies with this requirement.

