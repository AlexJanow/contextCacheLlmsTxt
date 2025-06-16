#!/bin/bash
# Copy txt files from _txts to _site/txts after Jekyll build

echo "Copying txt files to _site..."
find _txts -name "*.txt" -type f | while read file; do
  rel_path="${file#_txts/}"
  dest_dir="_site/txts/$(dirname "$rel_path")"
  mkdir -p "$dest_dir"
  cp "$file" "$dest_dir/"
done
echo "Done copying txt files."