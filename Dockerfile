# Dev image using Bun
FROM oven/bun:1

# Set working directory inside container
WORKDIR /app

# Copy package files first for caching layer
COPY package.json bun.lock ./

# Install dependencies inside container
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

USER bun

# Expose Nuxt dev server port
EXPOSE 3000

# Default command to run Nuxt dev server
# Can be overridden by docker-compose 'command' if needed
CMD ["bun", "run", "dev"]
