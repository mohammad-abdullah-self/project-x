# Makefile for Nuxt + Bun + PostgreSQL Dev Setup

# Default Docker Compose file
COMPOSE_FILE=docker-compose.yml

# Environment file
ENV_FILE=.env

# -----------------------
# Commands
# -----------------------

.PHONY: up down restart logs bash db-bash db-restart seed clean fresh clean-install

# Start development environment (build if needed)
up:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up --build -d

# Stop all services
down:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down

# Restart all services
restart:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) restart

# Tail logs (all services)
logs:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f

# Open bash shell in Nuxt container
bash:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) exec nuxt sh


# Remove unused Docker images, containers, and build cache
clean:
	@echo "🧼 Cleaning Docker resources..."
	docker compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker image prune -af
	docker builder prune -af
	@echo "✅ Cleanup complete!"

# Stop, remove everything (including volumes), rebuild, and restart
fresh:
	@echo "🧹 Cleaning environment..."
	docker compose -f $(COMPOSE_FILE) down -v --remove-orphans
	@echo "🏗️ Rebuilding everything..."
	docker compose -f $(COMPOSE_FILE) build --no-cache
	@echo "🚀 Starting containers..."
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Fresh environment ready!"

# Clean and reinstall Nuxt (frontend) dependencies, rebuild & restart the nuxt container
clean-install:
	@echo "🧹 Cleaning frontend dependencies..."
	@rm -rf .nuxt .output node_modules bun.lockb pnpm-lock.yaml package-lock.json yarn.lock || true
	@echo "📦 Reinstalling nuxt dependencies..."
	@bun install
	@echo "🐳 Rebuilding nuxt image..."
	@docker compose -f $(COMPOSE_FILE) build --no-cache nuxt
	@echo "🔁 Restarting nuxt container with the new image..."
	@docker compose -f $(COMPOSE_FILE) up -d --no-deps --force-recreate nuxt
	@echo "✅ Nuxt cleaned, dependencies reinstalled, and container rebuilt & restarted!"
