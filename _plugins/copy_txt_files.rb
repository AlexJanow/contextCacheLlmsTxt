# Plugin to copy txt files without Liquid processing
Jekyll::Hooks.register :site, :post_write do |site|
  puts "Copying llms.txt files..."
  
  # Find all txt files in _txts
  Dir.glob(File.join(site.source, "_txts", "**", "*.txt")).each do |source_file|
    # Get the relative path from _txts
    relative_path = Pathname.new(source_file).relative_path_from(Pathname.new(File.join(site.source, "_txts")))
    
    # Construct destination path
    dest_dir = File.join(site.dest, "txts", File.dirname(relative_path))
    dest_file = File.join(dest_dir, File.basename(source_file))
    
    # Create directory if it doesn't exist
    FileUtils.mkdir_p(dest_dir)
    
    # Copy the file
    FileUtils.cp(source_file, dest_file)
  end
  
  puts "Finished copying llms.txt files."
end

# Plugin to prevent Liquid processing of txt files in collections
Jekyll::Hooks.register :documents, :pre_render do |doc|
  if doc.extname == ".txt"
    doc.content = doc.content.gsub(/\{\{/, '&#123;&#123;').gsub(/\}\}/, '&#125;&#125;')
  end
end
