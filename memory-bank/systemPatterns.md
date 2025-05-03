# System Patterns

## Architecture Overview
The blog template follows a headless CMS architecture with a clear separation between the backend (Django) and frontend (Next.js). Django provides the content management system, API endpoints, and admin interface, while Next.js handles the presentation layer with server-side rendering for optimal performance. The entire system is containerized using Docker for consistent development and deployment experiences.

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   Django Backend  │     │    REST API       │     │  Next.js Frontend │
│                   │     │                   │     │                   │
│  ┌─────────────┐  │     │  ┌─────────────┐  │     │  ┌─────────────┐  │
│  │ Admin Panel │──┼─────┼─▶│ API Endpoints│──┼─────┼─▶│ SSR Pages   │  │
│  └─────────────┘  │     │  └─────────────┘  │     │  └─────────────┘  │
│                   │     │                   │     │                   │
│  ┌─────────────┐  │     │  ┌─────────────┐  │     │  ┌─────────────┐  │
│  │ PostgreSQL  │◀─┼─────┼──│ Data Models │  │     │  │ React       │  │
│  └─────────────┘  │     │  └─────────────┘  │     │  └─────────────┘  │
│                   │     │                   │     │                   │
│  ┌─────────────┐  │     │  ┌─────────────┐  │     │  ┌─────────────┐  │
│  │ Media Store │  │     │  │ Auth/Perm.  │  │     │  │ Tailwind CSS│  │
│  └─────────────┘  │     │  └─────────────┘  │     │  └─────────────┘  │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

## Design Patterns
- **Repository Pattern**: Django models serve as repositories for data access
- **Service Layer Pattern**: Business logic encapsulated in Django services
- **API Gateway Pattern**: Django REST Framework provides a unified API for the frontend
- **JAMstack Architecture**: JavaScript, APIs, and Markup for modern web development
- **Facade Pattern**: Simplified interfaces for complex subsystems
- **Strategy Pattern**: Interchangeable components (e.g., storage backends)
- **Observer Pattern**: For newsletter subscriptions and notifications

## Component Relationships
- **Django Models → Django REST Framework**: Models provide data structure, DRF exposes as API
- **Django Admin ↔ Models**: Custom admin interfaces for model management
- **Next.js Pages → API Endpoints**: Frontend consumes backend API data 
- **Celery Workers ↔ Django**: Background tasks for scheduled publishing and newsletters
- **PostgreSQL ↔ Django ORM**: Data persistence layer
- **Redis ↔ Django/Celery**: Caching and task queue
- **Media Storage ↔ Django**: Asset management for blog content

## Key Technical Decisions
- **Headless Architecture**: Separates content management from presentation
- **Django for Backend**: Robust admin, ORM, and security features
- **Next.js for Frontend**: Server-side rendering for SEO and performance
- **Tailwind CSS**: Utility-first approach for consistent, responsive design
- **PostgreSQL**: Reliable database with full-text search capabilities
- **Docker Containerization**: Consistent environments and simplified deployment
- **Celery for Background Tasks**: Handling scheduled publishing and newsletter operations
- **Django REST Framework**: Standard, well-documented API development

## Code Organization
- **Django Application Structure**:
  - `blog/` - Main Django project configuration
  - `posts/` - Blog post models, views, serializers
  - `categories/` - Category management
  - `api/` - API endpoints and versioning
  - `newsletter/` - Subscription management
  - `media/` - Media handling and storage
  - `search/` - Search functionality
  - `utils/` - Helper functions and utilities

- **Next.js Frontend Structure**:
  - `pages/` - Route-based page components
  - `components/` - Reusable UI components
  - `hooks/` - Custom React hooks
  - `lib/` - Helper functions and API clients
  - `public/` - Static assets
  - `styles/` - Global styles and Tailwind configuration

## Data Flow
1. **Content Creation**: Admin creates/edits content through Django admin
2. **Data Storage**: Content stored in PostgreSQL database
3. **API Exposure**: Django REST Framework exposes content via API
4. **Data Fetching**: Next.js fetches data from API during build/SSR/client-side
5. **Rendering**: Content rendered through React components
6. **User Interaction**: Frontend interactions (search, newsletter) sent to API
7. **Background Processing**: Scheduled tasks handled by Celery workers
8. **Cache Management**: Frequently accessed data cached in Redis
9. **Media Handling**: Images and files managed through Django and served via CDN 