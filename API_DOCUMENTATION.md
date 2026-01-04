# Vimerai API Documentation

Complete API reference for the Vimerai backend.

## Base URL

```
Development: http://localhost:3001
Production: https://api.vimerai.com
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### Request Password Reset

```http
POST /auth/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

#### Reset Password

```http
POST /auth/password-reset
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Video Generation

#### Generate Video

```http
POST /generator/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A professional product launch video for a new smartphone",
  "mode": "fast"
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "pending"
}
```

**Modes:**
- `fast` - 2-5 minute generation, 720p-1080p
- `cinematic` - 5-15 minute generation, 4K-8K
- `avatar` - Coming soon

#### Generate Preview

```http
POST /generator/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A quick preview of a sunset scene"
}
```

**Response:**
```json
{
  "previewUrl": "https://example.com/preview.mp4",
  "used": true
}
```

**Note:** Preview can only be used once per account.

#### Get Generation Status

```http
GET /generator/status/:jobId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "processing",
  "videoUrl": null
}
```

**Status Values:**
- `pending` - Job queued
- `processing` - Video being generated
- `completed` - Video ready
- `failed` - Generation failed

**When completed:**
```json
{
  "status": "completed",
  "videoUrl": "https://example.com/video.mp4"
}
```

#### Download Video

```http
GET /generator/download/:videoId
Authorization: Bearer <token>
```

**Response:**
- Binary video file (MP4)
- Content-Type: `video/mp4`
- Content-Disposition: `attachment; filename="video.mp4"`

### Videos

#### List Videos

```http
GET /videos?limit=10&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of videos per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "videos": [
    {
      "id": "uuid",
      "userId": "uuid",
      "prompt": "Video description",
      "mode": "fast",
      "status": "completed",
      "videoUrl": "https://example.com/video.mp4",
      "previewUrl": null,
      "jobId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25
}
```

#### Get Video

```http
GET /videos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "prompt": "Video description",
  "mode": "fast",
  "status": "completed",
  "videoUrl": "https://example.com/video.mp4",
  "previewUrl": null,
  "jobId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Delete Video

```http
DELETE /videos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Video deleted successfully"
}
```

### Subscription

#### Get Current Subscription

```http
GET /subscription/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "plan": "creator",
  "status": "active",
  "videosRemaining": 45,
  "limit": 50,
  "videosGenerated": 5
}
```

**Plans:**
- `starter` - 5 videos/month
- `creator` - 50 videos/month
- `pro` - 200 videos/month

#### Get Usage

```http
GET /subscription/usage
Authorization: Bearer <token>
```

**Response:**
```json
{
  "videosGenerated": 5,
  "videosRemaining": 45,
  "limit": 50
}
```

#### Get Plans

```http
GET /subscription/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price": 29,
      "period": "month",
      "limit": 5,
      "features": [...]
    }
  ]
}
```

#### Create Checkout Session

```http
POST /subscription/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "creator",
  "successUrl": "https://app.vimerai.com/success",
  "cancelUrl": "https://app.vimerai.com/cancel"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### Create Portal Session

```http
POST /subscription/portal
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnUrl": "https://app.vimerai.com/settings"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Users

#### Get Current User

```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Update User

```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newemail@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Error Responses

### Standard Error Format

```json
{
  "message": "Error description",
  "error": "Error Type",
  "statusCode": 400
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Responses

**Validation Error:**
```json
{
  "message": ["email must be an email", "password must be longer than 8 characters"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Unauthorized:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Not Found:**
```json
{
  "message": "Video not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## Rate Limiting

Currently not implemented. To be added in future versions.

## Webhooks

### Stripe Webhooks

**Endpoint:** `POST /subscription/webhook`

**Headers:**
```
stripe-signature: <signature>
```

**Events:**
- `checkout.session.completed` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generate video
const generateVideo = async (prompt: string, mode: string) => {
  const response = await api.post('/generator/generate', {
    prompt,
    mode,
  });
  return response.data;
};

// Get status
const getStatus = async (jobId: string) => {
  const response = await api.get(`/generator/status/${jobId}`);
  return response.data;
};
```

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Generate Video:**
```bash
curl -X POST http://localhost:3001/generator/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A beautiful sunset","mode":"fast"}'
```

**Get Status:**
```bash
curl -X GET http://localhost:3001/generator/status/<jobId> \
  -H "Authorization: Bearer <token>"
```

## Changelog

### Version 1.0.0
- Initial API release
- Authentication endpoints
- Video generation endpoints
- Subscription management
- User management

## Support

For API support:
- Email: api@vimerai.com
- Documentation: https://docs.vimerai.com
- GitHub Issues: https://github.com/vimerai/api/issues

