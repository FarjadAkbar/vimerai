# Frontend Code Documentation

This document provides detailed documentation of the frontend codebase structure, components, and patterns.

## 📁 Directory Structure

### `/src/app`

Next.js App Router directory containing all routes and pages.

#### Public Routes

**`/` - Landing Page** (`app/page.tsx`)
- Hero section with video background
- Feature showcase
- Video templates (coming soon)
- Pricing plans
- FAQ section
- Call-to-action

**`/login`** (`app/(auth)/login/page.tsx`)
- Email/password login form
- Form validation with Zod
- Error handling
- Redirect to dashboard on success

**`/signup`** (`app/(auth)/signup/page.tsx`)
- User registration form
- Password strength validation
- Terms acceptance
- Auto-login after signup

**`/password-reset`** (`app/(auth)/password-reset/page.tsx`)
- Two-step password reset flow
- Email verification
- New password form

#### Protected Routes

**`/dashboard`** (`app/dashboard/page.tsx`)
- Main dashboard with stats
- Recent videos preview
- Quick actions
- Navigation to features

**`/dashboard/generator`** (`app/dashboard/generator/page.tsx`)
- Video generation interface
- Prompt input with validation
- Mode selection (Fast/Cinematic/Avatar)
- Real-time status polling
- Automatic download on completion

**`/dashboard/my-videos`** (`app/dashboard/my-videos/page.tsx`)
- Video library with thumbnails
- Status indicators
- Download and delete actions
- Empty state handling

**`/dashboard/editor/[id]`** (`app/dashboard/editor/[id]/page.tsx`)
- Video metadata editing
- Title, description, tags
- Video preview
- Save changes

**`/dashboard/settings`** (`app/dashboard/settings/page.tsx`)
- User profile settings
- Account management

### `/src/components`

Reusable UI components.

#### UI Components (`components/ui/`)

All components use Radix UI primitives and Tailwind CSS.

**Button** (`components/ui/button.tsx`)
```typescript
// Usage
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Ghost</Button>
```

**Input** (`components/ui/input.tsx`)
```typescript
<Input type="text" placeholder="Enter text..." />
```

**Textarea** (`components/ui/textarea.tsx`)
```typescript
<Textarea placeholder="Enter description..." rows={4} />
```

**Form** (`components/ui/form.tsx`)
- Wrapper for React Hook Form
- Integrates with Zod validation
- Provides FormField, FormItem, FormLabel, FormMessage

**Tabs** (`components/ui/tabs.tsx`)
- Tab navigation component
- Used in landing page for feature showcase

**Accordion** (`components/ui/accordion.tsx`)
- Collapsible content sections
- Used in FAQ section

**Custom Components**

**Marquee** (`components/ui/marquee.tsx`)
- Infinite scrolling text
- Used for testimonials

**NumberTicker** (`components/ui/number-ticker.tsx`)
- Animated number counter
- Used for statistics

**WordRotate** (`components/ui/word-rotate.tsx`)
- Rotating text animation
- Used in hero section

**BorderBeam** (`components/ui/border-beam.tsx`)
- Animated border effect
- Used on pricing cards

### `/src/lib`

Core utilities and integrations.

#### API Client (`lib/api/`)

**`client.ts`** - Axios instance
```typescript
import { api } from '@/lib/api/client';

// Automatic token injection
// Request/response interceptors
// Error handling
```

**`auth.api.ts`** - Authentication endpoints
- `login(email, password)`
- `signup(data)`
- `requestPasswordReset(email)`
- `resetPassword(token, password)`

**`generator.api.ts`** - Video generation
- `generateVideo(prompt, mode)`
- `generatePreview(prompt)`
- `getGenerationStatus(jobId)`
- `downloadVideo(videoId)`

**`videos.api.ts`** - Video management
- `getVideos(limit, offset)`
- `getVideoById(id)`
- `deleteVideo(id)`
- `downloadVideo(id)`

**`subscription.api.ts`** - Subscription management
- `getCurrentSubscription()`
- `getUsage()`
- `getPlans()`
- `createCheckout(plan)`

**`users.api.ts`** - User management
- `getCurrentUser()`
- `updateUser(data)`

#### Custom Hooks (`lib/hooks/`)

**`use-auth.ts`**
```typescript
export const useLogin = () => useMutation({...});
export const useSignup = () => useMutation({...});
export const useLogout = () => useMutation({...});
export const useRequestPasswordReset = () => useMutation({...});
export const useResetPassword = () => useMutation({...});
```

**`use-user.ts`**
```typescript
export const useUser = () => {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: usersApi.getCurrentUser,
  });
};
```

**`use-generator.ts`**
```typescript
export const useGenerateVideo = () => {
  // Mutation for generating video
  // Invalidates videos query on success
};

export const useGenerationStatus = (jobId, enabled) => {
  // Polls status every 2 seconds
  // Returns status and videoUrl
};
```

**`use-videos.ts`**
```typescript
export const useVideos = (limit, offset) => {
  return useQuery({
    queryKey: ['videos', limit, offset],
    queryFn: () => videosApi.getVideos(limit, offset),
  });
};
```

**`use-subscription.ts`**
```typescript
export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: subscriptionApi.getCurrentSubscription,
  });
};
```

#### Auth Utilities (`lib/auth/`)

**`schema.ts`** - Zod validation schemas
```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const generateVideoSchema = z.object({
  prompt: z.string().min(10).max(1000),
  mode: z.enum(['fast', 'cinematic', 'avatar']),
});
```

#### Providers (`lib/providers/`)

**`query-provider.tsx`** - React Query provider
```typescript
// Wraps app with QueryClient
// Provides devtools in development
// Configures default options
```

### `/src/theme`

**`themeprovider.tsx`** - Theme provider
- Dark/light mode support
- Uses next-themes
- Persists theme preference

## 🔄 Data Flow

### Authentication Flow

1. User submits login form
2. `useLogin()` hook calls `authApi.login()`
3. API returns JWT token
4. Token stored in `localStorage`
5. Axios interceptor adds token to future requests
6. User redirected to dashboard

### Video Generation Flow

1. User enters prompt and selects mode
2. Form validation with Zod
3. `useGenerateVideo()` mutation called
4. API returns `jobId` and `status`
5. `useGenerationStatus()` starts polling
6. Status updates: `pending` → `processing` → `completed`
7. On completion, video automatically downloads
8. User redirected to my-videos

### State Management

- **Server State**: TanStack Query (React Query)
  - Caching
  - Automatic refetching
  - Optimistic updates
  
- **Form State**: React Hook Form
  - Local form state
  - Validation
  - Error handling

- **UI State**: React useState
  - Component-level state
  - Loading states
  - Modal visibility

## 🎨 Styling

### Tailwind CSS

- Utility-first CSS framework
- Custom theme configuration
- Dark mode support via `dark:` prefix

### Component Styling

```typescript
// Using Tailwind classes
<div className="flex items-center gap-4 p-6 bg-card rounded-xl border border-border">

// Using CSS variables for theming
<div className="bg-background text-foreground">
```

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Grid layouts adapt to screen size

## 🔒 Security

### Authentication

- JWT tokens stored in `localStorage`
- Automatic token injection via Axios interceptors
- Protected routes check authentication
- Auto-redirect to login if unauthenticated

### Input Validation

- Client-side: Zod schemas
- Server-side: Backend validation
- XSS protection: React's built-in escaping
- CSRF: Same-origin policy

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

- Touch-friendly buttons
- Simplified navigation
- Stacked layouts
- Optimized images

## 🚀 Performance

### Optimizations

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components loaded on demand
- **Caching**: React Query cache
- **Bundle Size**: Tree-shaking enabled

### Best Practices

- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers
- Lazy load heavy components
- Optimize images
- Minimize re-renders

## 🧪 Testing Strategy

### Unit Tests

- Component testing with React Testing Library
- Hook testing
- Utility function testing

### Integration Tests

- API integration
- Form submission flows
- Authentication flows

### E2E Tests

- Critical user journeys
- Video generation flow
- Payment flow

## 📝 Code Patterns

### Component Pattern

```typescript
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  const [state, setState] = useState();
  
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
```

### Form Pattern

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {...},
});

<Form {...form}>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### API Hook Pattern

```typescript
export const useMyMutation = () => {
  return useMutation({
    mutationFn: myApi.call,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['related'] });
    },
  });
};
```

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend URL

### Next.js Config

- TypeScript enabled
- ESLint configured
- Image domains configured
- API rewrites (if needed)

## 📚 Additional Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

