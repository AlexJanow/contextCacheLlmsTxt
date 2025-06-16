import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';

// Simple token counter (approximation based on words)
// In production, you'd use tiktoken or similar
const countTokens = (text) => {
    // Rough approximation: 1 token ≈ 0.75 words
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(words / 0.75);
};

// Read file and count tokens
const processFile = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return countTokens(content);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return 0;
    }
};

// Update index.md with token counts
const updateIndexFile = async (indexPath, llmsTokens, fullTokens) => {
    try {
        const content = await fs.readFile(indexPath, 'utf-8');
        const lines = content.split('\n');
        
        // Find the front matter
        if (lines[0] === '---') {
            let endIndex = lines.indexOf('---', 1);
            if (endIndex === -1) {
                console.error(`Invalid front matter in ${indexPath}`);
                return;
            }
            
            // Parse the YAML front matter
            const frontMatterText = lines.slice(1, endIndex).join('\n');
            const frontMatter = yaml.load(frontMatterText) || {};
            
            // Update tokens (use llms.txt tokens as primary)
            frontMatter.tokens = llmsTokens;
            
            // Add has_full flag
            frontMatter.has_full = fullTokens > 0;
            
            // Reconstruct the file
            const newFrontMatter = yaml.dump(frontMatter, { lineWidth: -1 });
            const newContent = [
                '---',
                newFrontMatter.trim(),
                '---',
                ...lines.slice(endIndex + 1)
            ].join('\n');
            
            await fs.writeFile(indexPath, newContent);
            console.log(`Updated ${indexPath} - tokens: ${llmsTokens}`);
        }
    } catch (error) {
        console.error(`Error updating ${indexPath}:`, error.message);
    }
};

// Main function
const main = async () => {
    console.log('Starting token count update...');
    
    // Find all txt directories (both flat and nested structure)
    const txtDirs = await glob('_txts/**/index.md', { absolute: true });
    const uniqueDirs = [...new Set(txtDirs.map(file => path.dirname(file)))];
    
    for (const dir of uniqueDirs) {
        const dirName = path.basename(dir);
        const llmsPath = path.join(dir, 'llms.txt');
        const fullPath = path.join(dir, 'llms-full.txt');
        const indexPath = path.join(dir, 'index.md');
        
        // Check if required files exist
        const hasLlms = await fs.access(llmsPath).then(() => true).catch(() => false);
        const hasFull = await fs.access(fullPath).then(() => true).catch(() => false);
        const hasIndex = await fs.access(indexPath).then(() => true).catch(() => false);
        
        if (!hasLlms || !hasIndex) {
            console.warn(`Skipping ${dirName}: missing required files`);
            continue;
        }
        
        // Count tokens
        const llmsTokens = await processFile(llmsPath);
        const fullTokens = hasFull ? await processFile(fullPath) : 0;
        
        // Update index.md
        await updateIndexFile(indexPath, llmsTokens, fullTokens);
    }
    
    console.log('Token count update complete!');
};

// Run the script
main().catch(console.error);