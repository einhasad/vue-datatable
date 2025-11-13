#!/bin/bash

# Quick Publish Script for datatable-vue
# Run this to publish your package to npm

set -e  # Exit on error

echo "🚀 Publishing datatable-vue to npm"
echo "=================================="
echo ""

# Step 1: Check if logged in
echo "📋 Step 1: Checking npm authentication..."
if npm whoami &> /dev/null; then
    echo "✅ Logged in as: $(npm whoami)"
else
    echo "❌ Not logged in to npm"
    echo "Please run: npm login"
    exit 1
fi

# Step 2: Clean and rebuild
echo ""
echo "🏗️  Step 2: Building package..."
rm -rf dist
npm run build

if [ ! -f "dist/datatable-vue.js" ]; then
    echo "❌ Build failed - dist/datatable-vue.js not found"
    exit 1
fi

echo "✅ Build successful"

# Step 3: Verify package
echo ""
echo "📦 Step 3: Verifying package contents..."
npm pack --dry-run > /tmp/npm-pack-output.txt 2>&1

PACKAGE_SIZE=$(grep "package size:" /tmp/npm-pack-output.txt | awk '{print $4, $5}')
FILE_COUNT=$(grep "total files:" /tmp/npm-pack-output.txt | awk '{print $3}')

echo "   Package size: $PACKAGE_SIZE"
echo "   Total files: $FILE_COUNT"

if [ "$FILE_COUNT" -lt "20" ]; then
    echo "⚠️  Warning: Only $FILE_COUNT files - expected ~28"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Package verified"

# Step 4: Check if package name exists
echo ""
echo "🔍 Step 4: Checking package availability..."
PACKAGE_NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

if npm view "$PACKAGE_NAME" version &> /dev/null; then
    EXISTING_VERSION=$(npm view "$PACKAGE_NAME" version)
    echo "⚠️  Package '$PACKAGE_NAME' already exists (v$EXISTING_VERSION)"

    if [ "$EXISTING_VERSION" == "$VERSION" ]; then
        echo "❌ Version $VERSION already published"
        echo "Run: npm version patch"
        exit 1
    fi

    echo "Publishing new version: $VERSION"
else
    echo "✅ Package name available: $PACKAGE_NAME"
fi

# Step 5: Final confirmation
echo ""
echo "📤 Ready to publish:"
echo "   Package: $PACKAGE_NAME"
echo "   Version: $VERSION"
echo "   Size: $PACKAGE_SIZE"
echo ""
read -p "Publish to npm? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publish cancelled"
    exit 1
fi

# Step 6: Publish!
echo ""
echo "🚀 Publishing..."
npm publish --provenance --access public

echo ""
echo "✅ Successfully published $PACKAGE_NAME@$VERSION!"
echo ""
echo "🎉 View your package at:"
echo "   https://www.npmjs.com/package/$PACKAGE_NAME"
echo ""
echo "📥 Install with:"
echo "   npm install $PACKAGE_NAME"
