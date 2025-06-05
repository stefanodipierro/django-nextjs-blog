FROM node:18-alpine

# This project uses npm for managing frontend packages

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app files
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
