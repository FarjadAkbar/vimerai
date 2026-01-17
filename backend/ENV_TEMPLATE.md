# Environment Variables Template

Copy this template to your `.env` file and fill in the values.

## Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vimerai

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

## Email Setup Instructions

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "VimeraAI Backend"
   - Copy the 16-character password
3. **Set in .env**:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: The 16-character App Password (not your regular password)
   - `EMAIL_FROM`: Usually same as `EMAIL_USER`

## Install Dependencies

Before running, install nodemailer:

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```
