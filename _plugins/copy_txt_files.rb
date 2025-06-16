Jekyll::Hooks.register :site, :post_write do |site|
  puts "Copying txt files to _site..."
  
  # Copy txt files from _txts to _site/txts
  Dir.glob('_txts/*/').each do |dir|
    dirname = File.basename(dir)
    dest_dir = File.join(site.dest, 'txts', dirname)
    FileUtils.mkdir_p(dest_dir)
    
    # Copy llms.txt
    src_llms = File.join(dir, 'llms.txt')
    if File.exist?(src_llms)
      FileUtils.cp(src_llms, File.join(dest_dir, 'llms.txt'))
    end
    
    # Copy llms-full.txt
    src_full = File.join(dir, 'llms-full.txt')
    if File.exist?(src_full)
      FileUtils.cp(src_full, File.join(dest_dir, 'llms-full.txt'))
    end
  end
  
  puts "Finished copying txt files"
end