# Use Node.js 20 with Python support
FROM node:20-bullseye

# Install Python and required packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and Node.js dependencies
RUN corepack enable pnpm
RUN pnpm install

# Create Python virtual environment and install casparser
RUN python3 -m venv .venv
RUN .venv/bin/pip install casparser

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the TypeScript project
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment to activate Python venv
ENV PATH="/app/.venv/bin:$PATH"

# Start the application
CMD ["pnpm", "start"]
