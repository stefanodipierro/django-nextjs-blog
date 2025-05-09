FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/app
ENV CELERY_USER=celery
ENV CELERY_GROUP=celery

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Create a dedicated non-root user for Celery
RUN groupadd --system ${CELERY_GROUP} && \
    useradd --system --gid ${CELERY_GROUP} --home-dir /app ${CELERY_USER}

# Copy project
COPY . /app/

# Create necessary directories and set permissions
RUN mkdir -p /app/logs && \
    chown -R ${CELERY_USER}:${CELERY_GROUP} /app/logs && \
    chmod +x /app/scripts/run-celery.sh

# Run entrypoint script
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"] 