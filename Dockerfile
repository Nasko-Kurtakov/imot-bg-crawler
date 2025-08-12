# Multi-service image for API (Node/Express + Playwright) and Angular UI
# Includes Chromium via Playwright base image
FROM mcr.microsoft.com/playwright:v1.54.0-noble

# Create app directory
WORKDIR /app

# Install root utilities
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    dumb-init \
  && rm -rf /var/lib/apt/lists/*

# Copy manifests first to leverage Docker layer caching
COPY server/package.json server/package-lock.json ./server/
COPY crawer-ui/package.json crawer-ui/package-lock.json ./crawer-ui/

# Install deps for both workspaces
RUN npm ci --prefix server \
  && npm ci --prefix crawer-ui \
  && npm i -g serve

# Copy the rest of the code
COPY server ./server
COPY crawer-ui ./crawer-ui

# Ensure Playwright Chromium and its OS deps are installed
RUN npx --yes playwright install --with-deps chromium

# Build Angular app for production
RUN npm run build --prefix crawer-ui

# Add start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose API (3000) and UI (4200)
EXPOSE 3000 4200

# Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/usr/local/bin/start.sh"]
