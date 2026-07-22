#!/bin/bash

# Build script for Disappointed Floatplane Queue
# Creates a zip file ready for Firefox Add-ons submission

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
VERSION=$(grep -o '"version": "[^"]*"' "$SCRIPT_DIR/manifest.json" | cut -d'"' -f4)
ZIP_NAME="disappointed-floatplane-queue-v${VERSION}.zip"

echo "Building Disappointed Floatplane Queue v${VERSION}..."

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Remove old zip if exists
rm -f "$DIST_DIR/$ZIP_NAME"

# Create zip, excluding development files
cd "$SCRIPT_DIR"
zip -r "$DIST_DIR/$ZIP_NAME" . \
    -x ".idea/*" \
    -x ".claude/*" \
    -x ".git/*" \
    -x ".gitignore" \
    -x "dist/*" \
    -x "reference/*" \
    -x "build.sh" \
    -x "*.zip" \
    -x "*.md"

echo ""
echo "✅ Build complete: dist/$ZIP_NAME"
echo ""
ls -lh "$DIST_DIR/$ZIP_NAME"
