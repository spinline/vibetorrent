.PHONY: build clean templ run dev install

# Binary name
BINARY=vibetorrent
MIPS_BINARY=rtorrent-webui-mipsle
MIPS_BE_BINARY=rtorrent-webui-mips

# Build for current platform
build: templ
	@echo "🏗️  Building for current platform..."
	@go build -ldflags="-s -w" -o $(BINARY) ./cmd/server
	@chmod +x $(BINARY)
	@echo "✅ Build complete: $(BINARY)"

# Build for MIPS little-endian
build-mips: templ
	@echo "🏗️  Building for MIPS (little-endian)..."
	@CGO_ENABLED=0 GOOS=linux GOARCH=mipsle go build \
		-ldflags="-s -w" \
		-o $(MIPS_BINARY) \
		./cmd/server
	@chmod +x $(MIPS_BINARY)
	@echo "✅ Build complete: $(MIPS_BINARY)"

# Build for MIPS big-endian
build-mips-be: templ
	@echo "🏗️  Building for MIPS (big-endian)..."
	@CGO_ENABLED=0 GOOS=linux GOARCH=mips go build \
		-ldflags="-s -w" \
		-o $(MIPS_BE_BINARY) \
		./cmd/server
	@chmod +x $(MIPS_BE_BINARY)
	@echo "✅ Build complete: $(MIPS_BE_BINARY)"

# Build both MIPS variants
build-all: build-mips build-mips-be
	@echo "✅ All builds complete"

# Generate templ files
templ:
	@echo "📝 Generating templ files..."
	@templ generate

# Run the application
run: build
	@echo "🚀 Running $(BINARY)..."
	@./$(BINARY)

# Development mode with hot reload (requires air)
dev:
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "❌ 'air' not found. Install with: go install github.com/air-verse/air@latest"; \
		exit 1; \
	fi

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@go mod download
	@go install github.com/a-h/templ/cmd/templ@latest
	@echo "✅ Dependencies installed"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f $(BINARY) $(MIPS_BINARY) $(MIPS_BE_BINARY)
	@rm -rf views/**/*_templ.go
	@echo "✅ Clean complete"

# Help
help:
	@echo "Available targets:"
	@echo "  make build        - Build for current platform"
	@echo "  make build-mips   - Build for MIPS (little-endian)"
	@echo "  make build-mips-be - Build for MIPS (big-endian)"
	@echo "  make build-all    - Build both MIPS variants"
	@echo "  make templ        - Generate templ files"
	@echo "  make run          - Build and run"
	@echo "  make dev          - Run with hot reload (requires air)"
	@echo "  make install      - Install dependencies"
	@echo "  make clean        - Clean build artifacts"
