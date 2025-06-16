import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to create a slug from URL
const createSlug = (url) => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace(/^www\./, '');
        const pathname = urlObj.pathname.replace(/\//g, '-').replace(/^-+|-+$/g, '');
        return `${hostname}${pathname ? '-' + pathname : ''}`.toLowerCase();
    } catch (error) {
        return 'unknown-project';
    }
};

// Detect category from content or URL
const detectCategory = (content, url) => {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('framework') || contentLower.includes('web framework')) {
        return 'frameworks';
    }
    if (contentLower.includes('cli') || contentLower.includes('command line') || contentLower.includes('tool')) {
        return 'tools';
    }
    if (contentLower.includes('library') || contentLower.includes('package')) {
        return 'libraries';
    }
    if (contentLower.includes('documentation') || contentLower.includes('docs') || contentLower.includes('guide')) {
        return 'documentation';
    }
    
    // Default category
    return 'libraries';
};

// Extract title from content
const extractTitle = (content, url) => {
    // Look for the first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
        return headingMatch[1].trim();
    }
    
    // Fallback to URL-based title
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
        return 'Unknown Project';
    }
};

// Extract description from content
const extractDescription = (content) => {
    // Look for the first paragraph after the title
    const lines = content.split('\n');
    let foundTitle = false;
    
    for (const line of lines) {
        if (line.match(/^#\s+/)) {
            foundTitle = true;
            continue;
        }
        
        if (foundTitle && line.trim() && !line.match(/^#+\s/)) {
            return line.trim().slice(0, 100) + (line.length > 100 ? '...' : '');
        }
    }
    
    return 'No description available';
};

// Fetch remote llms.txt file
const fetchRemoteFile = async (url) => {
    try {
        console.log(`Fetching ${url}...`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        if (!content.trim()) {
            throw new Error('File is empty');
        }
        
        return content;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
};

// Process a single URL
const processUrl = async (url) => {
    const content = await fetchRemoteFile(url);
    if (!content) return null;
    
    const slug = createSlug(url);
    const title = extractTitle(content, url);
    const description = extractDescription(content);
    const category = detectCategory(content, url);
    
    const projectDir = path.join(__dirname, '..', '_txts', slug);
    
    try {
        // Create directory
        await fs.mkdir(projectDir, { recursive: true });
        
        // Write llms.txt
        await fs.writeFile(path.join(projectDir, 'llms.txt'), content);
        
        // Create index.md
        const indexContent = `---
title: ${title}
category: ${category}
tokens: 0
description: ${description}
source_url: ${url}
---`;
        
        await fs.writeFile(path.join(projectDir, 'index.md'), indexContent);
        
        console.log(`✅ Created ${slug} from ${url}`);
        return { slug, title, url };
    } catch (error) {
        console.error(`Error creating files for ${url}:`, error.message);
        return null;
    }
};

// Main function
const main = async () => {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node fetch-remote.mjs <urls-file> [url1] [url2] ...');
        console.log('');
        console.log('Examples:');
        console.log('  node fetch-remote.mjs urls.txt');
        console.log('  node fetch-remote.mjs https://example.com/llms.txt');
        console.log('  node fetch-remote.mjs url1.txt https://example.com/llms.txt');
        process.exit(1);
    }
    
    let urls = [];
    
    // Process each argument
    for (const arg of args) {
        if (arg.startsWith('http://') || arg.startsWith('https://')) {
            // Direct URL
            urls.push(arg);
        } else {
            // File containing URLs
            try {
                const fileContent = await fs.readFile(arg, 'utf-8');
                const fileUrls = fileContent
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#') && (line.startsWith('http://') || line.startsWith('https://')));
                
                urls.push(...fileUrls);
                console.log(`Loaded ${fileUrls.length} URLs from ${arg}`);
            } catch (error) {
                console.error(`Error reading file ${arg}:`, error.message);
            }
        }
    }
    
    if (urls.length === 0) {
        console.log('No valid URLs found to process.');
        process.exit(1);
    }
    
    console.log(`Processing ${urls.length} URLs...`);
    console.log('');
    
    const results = [];
    for (const url of urls) {
        const result = await processUrl(url);
        if (result) {
            results.push(result);
        }
        
        // Small delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('');
    console.log(`✅ Successfully processed ${results.length} out of ${urls.length} URLs`);
    
    if (results.length > 0) {
        console.log('');
        console.log('Created projects:');
        results.forEach(({ slug, title, url }) => {
            console.log(`  - ${title} (${slug}) from ${url}`);
        });
        
        console.log('');
        console.log('Next steps:');
        console.log('1. Review the generated files for accuracy');
        console.log('2. Run: node scripts/build-index.mjs');
        console.log('3. Commit and push your changes');
    }
};

// Handle URL file creation
if (process.argv.includes('--create-example')) {
    const exampleUrls = `# Example URLs file
# Add one URL per line, comments start with #

https://raw.githubusercontent.com/anthropics/anthropic-sdk-python/main/llms.txt
https://raw.githubusercontent.com/vercel/next.js/canary/llms.txt
https://raw.githubusercontent.com/facebook/react/main/llms.txt
`;
    
    await fs.writeFile('urls.txt', exampleUrls);
    console.log('Created example urls.txt file');
    process.exit(0);
}

// Run the script
main().catch(console.error);