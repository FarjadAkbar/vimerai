# Email Service Setup (Gmail)

This guide explains how to configure the email service to send emails using Gmail.

## Prerequisites

1. A Gmail account
2. Enable 2-Step Verification on your Gmail account
3. Generate an App Password

## Steps to Configure Gmail

### 1. Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security**
3. Under **Signing in to Google**, enable **2-Step Verification**

### 2. Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under **Signing in to Google**, click **App passwords**
3. Select **Mail** as the app and **Other (Custom name)** as the device
4. Enter "VimeraAI Backend" as the custom name
5. Click **Generate**
6. Copy the 16-character password (you'll need this for `.env`)

### 3. Configure .env File

Add the following environment variables to your `.env` file:

```env
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` | No |
| `EMAIL_PORT` | SMTP server port | `587` | No |
| `EMAIL_SECURE` | Use TLS/SSL (true for 465, false for 587) | `false` | No |
| `EMAIL_USER` | Gmail address | - | **Yes** |
| `EMAIL_PASSWORD` | Gmail App Password (16 characters) | - | **Yes** |
| `EMAIL_FROM` | From email address | Same as `EMAIL_USER` | No |

## Testing

After configuration, the email service will:
- Initialize on application startup
- Send password reset emails when users request password reset
- Log success/error messages in the console

## Troubleshooting

### Email not sending

1. **Check logs**: Look for email-related warnings or errors in the console
2. **Verify App Password**: Ensure you're using the 16-character App Password, not your regular Gmail password
3. **Check 2-Step Verification**: App passwords only work if 2-Step Verification is enabled
4. **Firewall/Network**: Ensure port 587 is not blocked by your firewall

### Common Errors

- **"Invalid login"**: Wrong App Password or email address
- **"Connection timeout"**: Network/firewall issue blocking port 587
- **"Authentication failed"**: 2-Step Verification not enabled or wrong App Password

## Security Notes

- **Never commit `.env` file** to version control
- **App Passwords are safer** than using your regular Gmail password
- **Rotate App Passwords** periodically for security
- In production, consider using a dedicated email service (SendGrid, AWS SES, etc.)
