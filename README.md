# VimerrAI

An AI-powered video generation platform that turns text prompts into videos.

## Project Overview

VimerrAI is a SaaS application built with Next.js that allows users to generate videos from text descriptions using AI. The platform includes prompt templates, video management, and a streamlined generation workflow.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Custom auth implementation
- **API**: REST endpoints in `/lib/api`

## Project Structure
```
app/
├── (auth)/                 # Authentication routes
│   ├── login/             # User login
│   ├── register/          # User registration
│   └── reset-password/    # Password recovery
├── (app)/                 # Main application routes
│   ├── generator/         # Core video generation interface
│   ├── prompt-studio/     # Prompt template library
│   ├── my-videos/         # Video history and management
│   └── pricing/           # Pricing and plans
├── layout.tsx             # Root layout
├── page.tsx               # Landing page
├── components/            # Reusable UI components
└── lib/                   # Utilities and core logic
    ├── api/              # API client functions
    ├── auth/             # Authentication utilities
    └── utils/            # Helper functions
```

## Phase 1 Goals (Month 1)

### Core Features
- ✅ Complete authentication flow (login, register, password reset)
- ✅ Functional generator page with mock API integration
- ✅ Prompt Studio v1 with basic templates
- ✅ API integration with backend services
- ✅ Loading states and error handling
- ✅ Performance optimization (Lighthouse score > 80)

### User Experience Priorities
1. **Generator Page**: Single-focus interface for video creation
2. **Prompt Studio**: Pre-built templates to reduce friction
3. **My Videos**: Simple video history view
4. **Auth Flow**: Streamlined email/password authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API endpoint configured

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/vimerai.git
cd vimerai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Pages

### Generator (`/generator`)
The core video generation interface:
- Multi-line prompt input
- Single "Generate Video" action
- Real-time status updates
- Video preview on completion

### Prompt Studio (`/prompt-studio`)
Template library for common video types:
- Product Promo
- Explainer Video
- Social Media Clip
- Custom Prompt

### My Videos (`/my-videos`)
Simple video management:
- List of generated videos
- Status tracking (processing, completed)
- Timestamps

### Pricing (`/pricing`)
Single-tier pricing (Month 2):
- Clear plan features
- Simple call-to-action

## Development Philosophy

### Minimal Viable Product
- Focus on core functionality over polish
- One clear action per page
- No unnecessary features in Phase 1

### Performance First
- Fast page loads
- Optimized images and assets
- Efficient API calls

### User-Centric Design
- Clear status indicators
- Helpful error messages
- Minimal friction in workflows

## API Integration

API calls are centralized in `/lib/api`:
```typescript
// Example usage
import { generateVideo } from '@/lib/api/videos';

const result = await generateVideo({
  prompt: "A serene sunset over mountains"
});
```

## Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

Recommended platforms:
- Vercel (optimized for Next.js)
- Netlify
- AWS Amplify

## Roadmap

### Phase 1 (Month 1) - MVP
- [x] Authentication system
- [x] Generator page
- [x] Prompt Studio v1
- [x] API integration
- [x] Basic video management

### Phase 2 (Month 2)
- [ ] Pricing page implementation
- [ ] Payment integration
- [ ] Advanced prompt editing
- [ ] Video filtering and search
- [ ] User settings/preferences

### Phase 3 (Month 3+)
- [ ] Social login options
- [ ] Advanced video editor
- [ ] Collaboration features
- [ ] Analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Targets

- Lighthouse Performance: > 80
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/yourusername/vimerai/issues)
- Email: support@vimerai.com

## License

[Your chosen license]

---

Built with ❤️ using Next.js
