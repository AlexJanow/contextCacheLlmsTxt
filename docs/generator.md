# Creating llms.txt Files: A Generator Guide

This guide will help you create high-quality `llms.txt` files for your projects using various tools and techniques.

## What is llms.txt?

An `llms.txt` file is a standardized way to provide context about your project to Large Language Models (LLMs). It helps AI assistants understand your codebase, architecture, and conventions, making them more effective at helping with your project.

## Creating Your llms.txt

### Manual Creation

#### 1. Start with Project Overview

```
# Project Name

Brief description of what your project does.

## Overview
Explain the purpose, target audience, and key value proposition.
```

#### 2. Add Project Structure

```
## Project Structure

```
your-project/
├── src/           # Source code
├── tests/         # Test files  
├── docs/          # Documentation
└── config/        # Configuration files
```
```

#### 3. Include Key Concepts

```
## Key Concepts

- **Component**: Reusable UI elements
- **Service**: Business logic layer
- **Model**: Data structures
```

#### 4. Add Usage Examples

```
## Usage

```bash
npm install your-project
npm run start
```

```javascript
import { YourProject } from 'your-project';

const app = new YourProject();
app.run();
```
```

### Using Firecrawl API (Automated)

For projects with existing documentation websites, you can use Firecrawl to automatically generate `llms.txt` files:

#### Setup

```bash
npm install @firecrawl/node
```

#### Basic Script

```javascript
import FirecrawlApp from '@firecrawl/node';

const app = new FirecrawlApp({ apiKey: "YOUR_API_KEY" });

const crawlResult = await app.crawlUrl('https://your-docs-site.com', {
  crawlerOptions: {
    excludes: ['**/blog/**', '**/news/**'],
    includes: ['**/docs/**', '**/api/**'],
    limit: 100,
  },
  pageOptions: {
    onlyMainContent: true,
    includeHtml: false,
    replaceAllPathsWithAbsolutePaths: true,
  }
});

// Process the results
const llmsContent = crawlResult.data
  .map(page => `# ${page.metadata.title}\n\n${page.content}`)
  .join('\n\n---\n\n');

console.log(llmsContent);
```

#### Advanced Configuration

```javascript
const crawlParams = {
  crawlerOptions: {
    excludes: [
      '**/blog/**',
      '**/changelog/**',
      '**/privacy/**',
      '**/terms/**'
    ],
    includes: [
      '**/docs/**',
      '**/guides/**',
      '**/api/**',
      '**/reference/**'
    ],
    limit: 150,
    maxDepth: 3,
  },
  pageOptions: {
    onlyMainContent: true,
    includeHtml: false,
    removeTags: ['nav', 'footer', 'aside', '.advertisement'],
    replaceAllPathsWithAbsolutePaths: true,
    screenshot: false,
    waitFor: 1000,
  }
};
```

### Best Practices

#### Token Management

- **llms.txt**: Aim for 500-2000 tokens
- **llms-full.txt**: Can be longer (5000+ tokens)
- Use the build script to get accurate counts

#### Content Structure

1. **Start broad, get specific**
   - Project overview → Architecture → Implementation details

2. **Include context clues**
   - Technology stack
   - Design patterns used
   - Coding conventions

3. **Add practical examples**
   - Common use cases
   - Code snippets
   - Configuration examples

#### What to Include

✅ **Include:**
- Project purpose and goals
- Architecture overview
- Key files and directories
- API endpoints and usage
- Configuration options
- Common workflows
- Dependencies and requirements

❌ **Avoid:**
- Sensitive information (API keys, passwords)
- Extremely verbose logs
- Binary file descriptions
- Historical information (old versions)
- Personal opinions or commentary

### Automated Generation Script

Create a script to automate your llms.txt generation:

```javascript
#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const generateLlmsTxt = async () => {
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
  
  let content = `# ${packageJson.name}\n\n`;
  content += `${packageJson.description}\n\n`;
  
  // Add README content
  try {
    const readme = await fs.readFile('README.md', 'utf-8');
    content += `## Overview\n\n${readme}\n\n`;
  } catch (e) {
    // README not found
  }
  
  // Add project structure
  content += `## Project Structure\n\n`;
  content += await generateStructure('.');
  
  // Add package.json scripts
  if (packageJson.scripts) {
    content += `\n## Available Scripts\n\n`;
    Object.entries(packageJson.scripts).forEach(([name, script]) => {
      content += `- \`npm run ${name}\`: ${script}\n`;
    });
  }
  
  await fs.writeFile('llms.txt', content);
  console.log('Generated llms.txt');
};

const generateStructure = async (dir, prefix = '') => {
  const items = await fs.readdir(dir);
  let structure = '';
  
  for (const item of items) {
    if (item.startsWith('.') || item === 'node_modules') continue;
    
    const itemPath = path.join(dir, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory()) {
      structure += `${prefix}├── ${item}/\n`;
    } else {
      structure += `${prefix}├── ${item}\n`;
    }
  }
  
  return structure;
};

generateLlmsTxt().catch(console.error);
```

### Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Generate llms.txt
  run: |
    node scripts/generate-llms.js
    
- name: Update llms-txt-library
  run: |
    # Clone the library repo
    git clone https://github.com/username/llms-txt-library.git
    
    # Copy files
    mkdir -p llms-txt-library/txts/${{ github.repository }}
    cp llms.txt llms-txt-library/txts/${{ github.repository }}/
    
    # Create index.md
    echo "---" > llms-txt-library/txts/${{ github.repository }}/index.md
    echo "title: ${{ github.repository }}" >> llms-txt-library/txts/${{ github.repository }}/index.md
    echo "category: libraries" >> llms-txt-library/txts/${{ github.repository }}/index.md
    echo "tokens: 0" >> llms-txt-library/txts/${{ github.repository }}/index.md
    echo "---" >> llms-txt-library/txts/${{ github.repository }}/index.md
    
    # Submit PR (using gh CLI)
    cd llms-txt-library
    git checkout -b update-${{ github.repository }}
    git add .
    git commit -m "Update ${{ github.repository }} llms.txt"
    gh pr create --title "Update ${{ github.repository }}" --body "Automated update"
```

## Quality Checklist

Before submitting your `llms.txt`:

- [ ] File is properly formatted (Markdown)
- [ ] Contains clear project overview
- [ ] Includes project structure
- [ ] Has usage examples
- [ ] Token count is reasonable (500-2000 for main file)
- [ ] No sensitive information included
- [ ] Links are functional
- [ ] Code examples are accurate
- [ ] Category is appropriate

## Examples

Check out these example projects in the directory:

- `txts/example-project/` - Comprehensive documentation example
- `txts/awesome-tool/` - CLI tool documentation
- `txts/my-framework/` - Framework documentation

## Resources

- [llms.txt specification](https://llmstxt.org/)
- [Firecrawl documentation](https://firecrawl.dev/)
- [Token counting tools](https://platform.openai.com/tokenizer)
- [Markdown guide](https://www.markdownguide.org/)

Happy documenting! 📚