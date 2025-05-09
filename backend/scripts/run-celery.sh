#!/bin/bash

# This script runs Celery workers with a dedicated low-privilege user account
# for improved security. It prevents the Celery worker from having full
# superuser privileges in the container.

# Set environment variables if not already set
: "${CELERY_USER:=celery}"
: "${CELERY_GROUP:=celery}"

echo "Starting Celery as user: $CELERY_USER"

if [ "$1" = "worker" ]; then
  exec su -c "celery -A blog worker -l INFO" "${CELERY_USER}"
elif [ "$1" = "beat" ]; then
  exec su -c "celery -A blog beat -l INFO" "${CELERY_USER}"
else
  echo "Unknown command. Use 'worker' or 'beat'"
  exit 1
fi 