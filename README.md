# Context Cache - llms.txt Library

A public directory of `llms.txt` and `llms-full.txt` files for LLM context sharing and AI assistant integration, hosted on GitHub Pages.

🔗 **Live Site**: [https://llms.jaxai.agency](https://llms.jaxai.agency)

## Overview

This project provides a searchable, static directory of llms.txt files - standardized documents that help LLMs understand codebases, projects, and documentation. Similar to [directory.llmstxt.cloud](https://directory.llmstxt.cloud) and [llmstxt.site](https://llmstxt.site), but completely static and hosted on GitHub Pages.

## Features

- 📁 Browse llms.txt files by category
- 🔍 Fuzzy search across all files
- 📊 Token count display for each file
- 📋 One-click copy URLs
- 🌐 100% static - no server required
- ♿ Accessible and responsive design

## Contributing

We welcome contributions! Adding your llms.txt file is easy:

1. Fork this repository
2. Create a new folder in `/txts/your-project-name/`
3. Add your `llms.txt` (and optionally `llms-full.txt`)
4. Create an `index.md` with metadata
5. Submit a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## Seeding the library from existing public directories

You can automatically import llms.txt files from existing public directories:

```bash
npm run sync:remote
```

This will crawl [llmstxt.site](https://llmstxt.site) and [directory.llmstxt.cloud](https://directory.llmstxt.cloud) and import all available files.

## Local Development

```bash
# Clone the repository
git clone https://github.com/AlexJanow/contextCacheLlmsTxt
cd contextCacheLlmsTxt

# Install dependencies
npm install
bundle install

# Sync remote files (optional)
npm run sync:remote

# Run locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

## Project Structure

```
llms-txt-library/
├── _config.yml           # Jekyll configuration
├── index.html            # Main landing page
├── assets/
│   └── js/
│       └── search.js     # Search functionality
├── txts/                 # llms.txt files organized by project
│   └── example-project/
│       ├── llms.txt
│       ├── llms-full.txt (optional)
│       └── index.md      # Metadata
├── scripts/
│   ├── build-index.mjs   # Token counting
│   ├── fetch-remote.mjs  # Remote file fetcher
│   └── sync-remote.mjs   # Bulk import from public directories
└── .github/
    └── workflows/
        └── build.yml     # GitHub Actions workflow
```

## License

This project is open source and available under the [MIT License](LICENSE).