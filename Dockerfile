# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install templ CLI
RUN go install github.com/a-h/templ/cmd/templ@latest

# Copy Go module files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Generate templ files
RUN templ generate

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o rtorrent-webui cmd/server/main.go

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/rtorrent-webui .

# Copy public assets if needed
COPY --from=builder /app/public ./public

# Expose the port
EXPOSE 8080

# Run the application
CMD ["./rtorrent-webui"]
