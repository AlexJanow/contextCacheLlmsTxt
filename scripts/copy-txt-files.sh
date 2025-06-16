#!/bin/bash
# Copy txt files from _txts to proper structure for Jekyll

# Create the txts directory if it doesn't exist
mkdir -p txts

# Copy all llms.txt files to the correct structure
for dir in _txts/*/; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        mkdir -p "txts/$dirname"
        
        # Copy llms.txt if it exists
        if [ -f "$dir/llms.txt" ]; then
            cp "$dir/llms.txt" "txts/$dirname/llms.txt"
        fi
        
        # Copy llms-full.txt if it exists  
        if [ -f "$dir/llms-full.txt" ]; then
            cp "$dir/llms-full.txt" "txts/$dirname/llms-full.txt"
        fi
    fi
done

echo "Copied all llms.txt files to txts/ directory"