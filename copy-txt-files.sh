#!/bin/bash

# Copy txt files to _site after Jekyll build
echo "Copying .txt files to _site..."

# Create directory structure
mkdir -p _site/txts

# Copy the entire _txts directory structure to _site/txts
cp -r _txts _site/txts/

# Also copy individual txt files to each generated directory
find _txts -name "*.txt" | while read txtfile; do
    # Extract the directory name (e.g., 7eads-com from _txts/7eads-com/llms.txt)
    dir=$(echo "$txtfile" | cut -d'/' -f2)
    filename=$(basename "$txtfile")
    
    # Copy to the Jekyll-generated directory structure
    if [ -d "_site/txts/$dir" ]; then
        cp "$txtfile" "_site/txts/$dir/"
    elif [ -d "_site/$dir" ]; then
        cp "$txtfile" "_site/$dir/"
    fi
done

echo "Files copied successfully"