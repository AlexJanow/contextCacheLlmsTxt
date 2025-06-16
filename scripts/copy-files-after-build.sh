#!/bin/bash
# Copy all txt files from source directories to built site

# Create necessary directories
for dir in _txts/*/; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        
        # Create the directory in _site/txts
        mkdir -p "_site/txts/$dirname"
        
        # Copy llms.txt if it exists
        if [ -f "$dir/llms.txt" ]; then
            cp "$dir/llms.txt" "_site/txts/$dirname/llms.txt"
            echo "Copied $dir/llms.txt to _site/txts/$dirname/"
        fi
        
        # Copy llms-full.txt if it exists  
        if [ -f "$dir/llms-full.txt" ]; then
            cp "$dir/llms-full.txt" "_site/txts/$dirname/llms-full.txt"
            echo "Copied $dir/llms-full.txt to _site/txts/$dirname/"
        fi
    fi
done

# Also copy from txts directory if it exists
if [ -d "txts" ]; then
    for dir in txts/*/; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            mkdir -p "_site/txts/$dirname"
            
            if [ -f "$dir/llms.txt" ]; then
                cp "$dir/llms.txt" "_site/txts/$dirname/llms.txt"
            fi
            
            if [ -f "$dir/llms-full.txt" ]; then
                cp "$dir/llms-full.txt" "_site/txts/$dirname/llms-full.txt"
            fi
        fi
    done
fi

echo "Finished copying txt files"