# Technical Context

## Technologies Used
- **Django**: Backend framework (v4.2.7)
- **Django REST Framework**: API development (v3.14.0)
- **Next.js**: Frontend framework with SSR/SSG capabilities (v14.0.3)
- **PostgreSQL**: Primary database (v13)
- **Redis**: Caching and message broker (v6-alpine)
- **Docker**: Container platform with docker-compose
- **Celery**: Distributed task queue (v5.3.5)
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework (v3.3.0)
- **django-markdownx**: Markdown editor and renderer (v4.0.6)
- **django-taggit**: Tagging system (v4.0.0)
- **next-themes**: Theme management for dark/light mode
- **SWR**: React hooks for data fetching

## Development Environment
The development environment is fully containerized using Docker and Docker Compose, ensuring consistency across different development machines. The setup includes:

- Docker containers for Django (python:3.10-slim), Next.js (node:18-alpine), PostgreSQL (13), Redis (6-alpine)
- Volume mapping for code changes with hot-reloading
- Environment variable management through .env.dev file
- PostgreSQL database with persistent storage
- Redis for caching and Celery task queue
- Django debug mode enabled for development
- Next.js development server with hot module replacement

## Dependencies
### Backend (Django)
- **django**: v4.2.7
- **djangorestframework**: v3.14.0
- **psycopg2-binary**: v2.9.9 (PostgreSQL adapter)
- **django-cors-headers**: v4.3.0
- **django-filter**: v23.3
- **django-storages**: v1.14.2
- **django-markdownx**: v4.0.6
- **django-taggit**: v4.0.0
- **Pillow**: v10.1.0 (Image processing)
- **gunicorn**: v21.2.0 (WSGI HTTP server)
- **celery**: v5.3.5
- **redis**: v5.0.1
- **whitenoise**: v6.6.0 (Static file serving)
- **django-environ**: v0.11.2

### Frontend (Next.js)
- **next**: v14.0.3
- **react**: v18+
- **react-dom**: v18+
- **typescript**: v5+
- **tailwindcss**: v3.3.0
- **next-themes**: v0.2.1 (Theme management)
- **react-markdown**: v9.0.1
- **swr**: v2.2.4 (Data fetching)
- **@tailwindcss/typography**: v0.5.10

## API Integrations
- API endpoints implemented and working:
  - `/api/v1/posts/`: List and retrieve blog posts
  - `/api/v1/categories/`: List and retrieve categories
  - `/api/v1/featured-posts/`: List featured posts
  - `/api/v1/subscribe/`: Newsletter subscription endpoint

## Technical Constraints
- SEO optimization requiring server-side rendering
- Cross-browser compatibility (modern browsers only)
- Mobile-first responsive design
- Image optimization for performance
- Security best practices implementation
- Stateless API for scalability
- UTF-8 encoding for environment variables (resolved issue)

## Deployment Strategy
The application uses Docker Compose for both development and production:

1. **Local Development**:
   - `docker-compose up` starts all services
   - Environment variables from .env.dev
   - Hot-reloading for both Django and Next.js
   - Django runs in debug mode

2. **Production Deployment** (planned):
   - Will require a production-specific docker-compose file
   - Will use environment variables from .env.prod
   - Will need proper static file serving configuration
   - Will require media file optimization and CDN integration
   - Will need additional security hardening 