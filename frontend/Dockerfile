FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy app files
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["yarn", "dev"] 