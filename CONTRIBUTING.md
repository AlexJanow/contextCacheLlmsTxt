# Contributing to llms.txt Library

Thank you for your interest in contributing to the llms.txt Library! This guide will help you add your `llms.txt` files to our directory.

## Quick Contribution Guide

Adding your `llms.txt` file is simple and takes just a few minutes:

### 1. Fork the Repository

Click the "Fork" button at the top of this repository to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/llms-txt-library.git
cd llms-txt-library
```

### 3. Create Your Project Folder

Create a new folder in the `txts/` directory with a descriptive slug name:

```bash
mkdir txts/your-project-name
```

### 4. Add Your Files

Add your `llms.txt` file (required) and optionally `llms-full.txt`:

```bash
# Copy your llms.txt file
cp /path/to/your/llms.txt txts/your-project-name/

# Optionally add the extended version
cp /path/to/your/llms-full.txt txts/your-project-name/
```

### 5. Create the Index File

Create an `index.md` file with metadata about your project:

```markdown
---
title: Your Project Name
category: frameworks  # Choose: demo, tools, frameworks, libraries, documentation
tokens: 0  # Will be auto-calculated
description: Brief description of your project
---
```

**Categories available:**
- `demo` - Example projects and demos
- `tools` - CLI tools and utilities
- `frameworks` - Web frameworks and development frameworks
- `libraries` - Code libraries and packages
- `documentation` - Project documentation and guides

### 6. Commit and Push

```bash
git add .
git commit -m "Add [project-name] llms.txt"
git push origin main
```

### 7. Create a Pull Request

Go to your fork on GitHub and click "New Pull Request". Our automated workflow will:

- Calculate token counts for your files
- Update the metadata automatically
- Add your project to the searchable directory

## File Requirements

### Required Files
- `llms.txt` - Your main context file
- `index.md` - Metadata file with front matter

### Optional Files
- `llms-full.txt` - Extended version with more detailed context

### File Guidelines

**For `llms.txt` files:**
- Keep it focused and relevant
- Include project overview, structure, and key concepts
- Use clear, concise language
- Aim for 500-2000 tokens for good balance

**For `llms-full.txt` files:**
- Can be more comprehensive
- Include detailed API documentation
- Add usage examples and best practices
- No strict token limit

**For folder names:**
- Use lowercase with hyphens: `my-awesome-project`
- Keep it short but descriptive
- Avoid special characters or spaces

## What Happens After You Submit

1. **Automated Processing**: Our GitHub Action will:
   - Count tokens in your files
   - Update your `index.md` with accurate token counts
   - Add a `has_full` flag if you included `llms-full.txt`

2. **Review**: We'll review your submission for:
   - File completeness
   - Appropriate categorization
   - Content quality

3. **Merge**: Once approved, your project will appear in the live directory!

## Quality Guidelines

To ensure a high-quality directory, please:

- **Be accurate**: Make sure your `llms.txt` truly represents your project
- **Choose the right category**: Help users find your project easily
- **Write clear descriptions**: Help users understand what your project does
- **Keep it updated**: Update your files when your project evolves

## Need Help?

- Check existing projects in `txts/` for examples
- See [docs/generator.md](docs/generator.md) for tips on creating good llms.txt files
- Open an issue if you have questions
- Join discussions in our Issues section

## Advanced: Using the Remote Fetcher

If your `llms.txt` is hosted elsewhere, you can use our remote fetcher script:

```bash
# Add URLs to a file, one per line
echo "https://example.com/llms.txt" >> urls.txt
echo "https://another-site.com/llms.txt" >> urls.txt

# Run the fetcher
node scripts/fetch-remote.mjs urls.txt
```

This will automatically create the folder structure and download files for you.

Thank you for contributing to the llms.txt ecosystem! 🎉