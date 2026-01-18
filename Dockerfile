FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose the port
EXPOSE 3001

ENV PORT=3001

# Start the application
CMD ["bun", "run", "dist/index.js"]
