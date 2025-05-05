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

## SEO & Social Media Meta Tags

This project dynamically generates OpenGraph and Twitter meta tags for each post, ensuring optimal social previews and SEO:

- **OpenGraph Images:**
  - Includes `<meta property="og:image">` entries for the featured image, side image 1, and side image 2 (if provided).
  - Adds `og:image:alt`, `og:image:width`, and `og:image:height` tags for each image (1200x630 px recommended).
- **Twitter Cards:**
  - Uses `twitter:card` = `summary_large_image`.
  - Picks the first available image among featured, side 1, and side 2 for `<meta name="twitter:image">`.
- **Canonical URL:**
  - Adds `<link rel="canonical">` pointing to the full post URL.
- **Schema.org JSON-LD:**
  - Injects an `Article` schema block with:
    - `headline`, `description`, `datePublished`
    - `image` (array of all provided images)
    - `mainEntityOfPage` (the post URL)

### Validation & Testing

- Use Facebook OpenGraph Debugger (https://developers.facebook.com/tools/debug/) to confirm OG tags.
- Use Twitter Card Validator (https://cards-dev.twitter.com/validator) for Twitter cards.
- Run Lighthouse or other SEO audit tools to ensure meta-tag coverage. 