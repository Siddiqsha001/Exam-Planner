# Environment Configuration

This project uses a simple environment configuration approach. You only need to update one URL to connect to your backend.

## Quick Setup

Just update the `NEXT_PUBLIC_API_BASE_URL` in your `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api
```

That's it! All API requests will use this base URL.

## Environment Files

- `.env.local` - Local development overrides (gitignored)
- `.env.development` - Development environment defaults
- `.env.production` - Production environment settings

## Available Environment Variables

### Essential

- `NEXT_PUBLIC_API_BASE_URL` - **The only URL you need to change** (e.g., `http://localhost:5002/api`)

### Optional

- `NEXT_PUBLIC_API_DEBUG` - Enable API request/response logging (`true` or `false`)
- `NODE_ENV` - Application environment (`development`, `production`, or `test`)

## Examples

### Local Development

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api
NEXT_PUBLIC_API_DEBUG=true
```

### Production

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_API_DEBUG=false
```

### Different Local Port

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## How It Works

All API endpoints automatically use the base URL:

- Auth: `{BASE_URL}/auth/login`, `{BASE_URL}/auth/register`
- Subjects: `{BASE_URL}/subjects`
- Exams: `{BASE_URL}/exams`
- Study Sessions: `{BASE_URL}/study`
- Pomodoro: `{BASE_URL}/pomodoro`

## Note

- The `NEXT_PUBLIC_` prefix is required for variables used in the browser
- Restart your development server after changing environment variables
