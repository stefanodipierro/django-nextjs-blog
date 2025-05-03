# Django Blog Template

A modern, minimalist blog template built with Django, Docker, and Next.js. The template provides a clean, responsive interface with dark mode support, focusing on content readability and management flexibility.

## Features

- Containerized architecture using Docker
- Django backend with REST API
- Next.js frontend with Tailwind CSS
- PostgreSQL database
- Redis for caching
- Celery for background tasks
- Markdown support for content creation
- Dark/light mode toggle
- Featured posts management
- Newsletter subscription
- Search capabilities
- Social sharing functionality

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd blog-template
   ```

2. Create environment files:
   ```bash
   # Copy the example environment file
   cp .env.example .env.dev
   # Edit the .env.dev file as needed
   ```

3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

4. Access the services:
   - Django Admin: http://localhost:8000/admin
   - API: http://localhost:8000/api/v1
   - Frontend: http://localhost:3000

## Project Structure

- `backend/`: Django backend
- `frontend/`: Next.js frontend
- `docker-compose.yml`: Docker Compose configuration
- `.env.dev`: Development environment variables
- `.env.prod`: Production environment variables (create for production)

## Development Workflow

### Backend Development

The Django admin interface is accessible at http://localhost:8000/admin.
Default superuser credentials (create yours with the command below):

```bash
docker-compose exec django python manage.py createsuperuser
```

### Frontend Development

The Next.js frontend is accessible at http://localhost:3000.
Changes to the frontend code will automatically trigger a hot reload.

## Production Deployment

For production deployment:

1. Create a `.env.prod` file with production settings
2. Build and run the containers with production configuration:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## License

[MIT License](LICENSE) 