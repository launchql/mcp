#!/bin/bash

# Ensure the script fails on any error
set -e

# Find all prompts directories under src
PROMPTS_DIRS=$(find src -type d -name prompts)

# Process each prompts directory
for PROMPT_DIR in $PROMPTS_DIRS; do
    # Get the relative path without 'src/'
    REL_PATH=$(dirname "$PROMPT_DIR" | sed 's|^src/||')
    
    # Create the target directory
    mkdir -p "build/$REL_PATH"
    
    # Copy the prompts
    cp -r "$PROMPT_DIR" "build/$REL_PATH/"
done

# Copy migration-examples directory
if [ -d "src/interchainjs/migration-examples" ]; then
    mkdir -p "build/interchainjs"
    cp -r "src/interchainjs/migration-examples" "build/interchainjs/"
fi
