#!/bin/bash
# Automated script to run e2e tests in container
# This script handles the full test cycle

set -e

echo "========================================="
echo "Running E2E Tests"
echo "========================================="

# Navigate to project root
cd "$(dirname "$0")/.."

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci

echo "📦 Installing example dependencies..."
cd examples && npm ci && cd ..

# Build the library
echo "🔨 Building library..."
npm run build

# Extract examples from tests
echo "📝 Extracting examples from tests..."
npm run extract:examples

# Verify extraction
if [ ! -f examples/src/generated/extracted-examples.json ]; then
    echo "❌ Failed to extract examples"
    exit 1
fi

echo "✅ Examples extracted successfully"

# Install/update Playwright browsers (if needed)
echo "🌐 Ensuring Playwright browsers are installed..."
npx playwright install chromium firefox webkit --with-deps || true

# Run e2e tests
echo "🧪 Running e2e tests..."

# Run in headless mode
export CI=true

# Try running with simple config first
echo "Running tests with simple config..."
npx playwright test --config=playwright.config.simple.ts --reporter=html

echo ""
echo "✅ E2E tests complete!"
echo ""
echo "📊 View the HTML report:"
echo "   npx playwright show-report"
