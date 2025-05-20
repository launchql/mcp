#!/bin/bash

# Ensure the script fails on any error
set -e

# Define the directories to copy (add more as needed)
ASSET_DIRS=(
  "prompts"
  "data"
  "migration-examples"
)

# Process each asset directory type
for DIR_TYPE in "${ASSET_DIRS[@]}"; do
    
    # Find all directories of current type under src
    FOUND_DIRS=$(find src -type d -name "$DIR_TYPE")
    
    # Process each found directory
    for FOUND_DIR in $FOUND_DIRS; do
        # Get the relative path without 'src/'
        REL_PATH=$(dirname "$FOUND_DIR" | sed 's|^src/||')
        
        # Create the target directory
        TARGET_DIR="build/$REL_PATH/$DIR_TYPE"
        
        # Create directory if it doesn't exist
        mkdir -p "$TARGET_DIR"
        
        # Copy the contents
        cp -r "$FOUND_DIR"/* "$TARGET_DIR/" 2>/dev/null || true
    done
done

echo "Assets copied successfully"
