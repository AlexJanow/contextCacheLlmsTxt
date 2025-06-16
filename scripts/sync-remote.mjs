#!/usr/bin/env node

import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { URL } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const USER_AGENT = 'llms-txt-library-bot/1.0';
const REQUEST_DELAY = 300; // ms
const CONCURRENCY_LIMIT = 3;
const BASE_SOURCES = [
  'https://llmstxt.site/',
  'https://directory.llmstxt.cloud/'
];

// Throttling per host
const hostThrottles = new Map();

class SyncRemote {
  constructor() {
    this.stats = {
      new: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    this.activeRequests = 0;
    this.requestQueue = [];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async throttledFetch(url, options = {}) {
    const hostname = new URL(url).hostname;
    const lastRequest = hostThrottles.get(hostname) || 0;
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < REQUEST_DELAY) {
      await this.delay(REQUEST_DELAY - timeSinceLastRequest);
    }
    
    hostThrottles.set(hostname, Date.now());
    
    return fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        ...options.headers
      },
      ...options
    });
  }

  async withConcurrency(fn) {
    while (this.activeRequests >= CONCURRENCY_LIMIT) {
      await this.delay(50);
    }
    
    this.activeRequests++;
    try {
      return await fn();
    } finally {
      this.activeRequests--;
    }
  }

  async checkRobotsTxt(baseUrl) {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await this.throttledFetch(robotsUrl);
      
      if (!response.ok) {
        console.log(`No robots.txt found for ${baseUrl}, proceeding`);
        return true;
      }
      
      const robotsText = await response.text();
      const userAgentRegex = new RegExp(`User-agent:\\s*\\*|User-agent:\\s*${USER_AGENT}`, 'i');
      const disallowRegex = /Disallow:\s*(.*)/gi;
      
      let isRelevantSection = false;
      let isAllowed = true;
      
      for (const line of robotsText.split('\n')) {
        const trimmedLine = line.trim();
        
        if (userAgentRegex.test(trimmedLine)) {
          isRelevantSection = true;
          continue;
        }
        
        if (trimmedLine.startsWith('User-agent:') && !userAgentRegex.test(trimmedLine)) {
          isRelevantSection = false;
          continue;
        }
        
        if (isRelevantSection) {
          const disallowMatch = disallowRegex.exec(trimmedLine);
          if (disallowMatch) {
            const disallowedPath = disallowMatch[1].trim();
            if (disallowedPath === '/' || disallowedPath === '') {
              isAllowed = false;
              break;
            }
          }
        }
      }
      
      if (!isAllowed) {
        console.log(`Robots.txt disallows crawling ${baseUrl}`);
      }
      
      return isAllowed;
    } catch (error) {
      console.log(`Error checking robots.txt for ${baseUrl}:`, error.message);
      return true; // Default to allowing if we can't check
    }
  }

  async crawlSite(baseUrl) {
    console.log(`Crawling ${baseUrl}...`);
    
    const canCrawl = await this.checkRobotsTxt(baseUrl);
    if (!canCrawl) {
      console.log(`Skipping ${baseUrl} due to robots.txt restrictions`);
      return [];
    }

    const response = await this.throttledFetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${baseUrl}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const links = new Set();

    // Find all links ending in llms.txt or llms-full.txt
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && (href.endsWith('llms.txt') || href.endsWith('llms-full.txt'))) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          links.add(absoluteUrl);
        } catch (error) {
          console.warn(`Invalid URL found: ${href}`);
        }
      }
    });

    console.log(`Found ${links.size} llms.txt files on ${baseUrl}`);
    return Array.from(links);
  }

  generateSlug(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // Extract meaningful part from path
    const pathParts = pathname.split('/').filter(part => part && part !== 'llms.txt' && part !== 'llms-full.txt');
    
    if (pathParts.length > 0) {
      return pathParts[pathParts.length - 1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    return hostname.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  async calculateSHA256(content) {
    return createHash('sha256').update(content).digest('hex');
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async downloadFile(url) {
    return this.withConcurrency(async () => {
      try {
        const urlObj = new URL(url);
        const isFullFile = url.endsWith('llms-full.txt');
        const slug = this.generateSlug(url);
        const sourceHost = urlObj.hostname;
        const fileName = isFullFile ? 'llms-full.txt' : 'llms.txt';
        
        const targetDir = path.join('txts', sourceHost, slug);
        const targetPath = path.join(targetDir, fileName);
        
        // Check if file already exists and get its hash
        let existingHash = null;
        try {
          const existingContent = await fs.readFile(targetPath, 'utf8');
          existingHash = await this.calculateSHA256(existingContent);
        } catch (error) {
          // File doesn't exist, that's fine
        }
        
        console.log(`Downloading ${url}...`);
        const response = await this.throttledFetch(url);
        
        if (!response.ok) {
          console.error(`Failed to download ${url}: ${response.status}`);
          this.stats.errors++;
          return;
        }
        
        const content = await response.text();
        const newHash = await this.calculateSHA256(content);
        
        if (existingHash === newHash) {
          console.log(`Skipping ${targetPath} (unchanged)`);
          this.stats.skipped++;
          return;
        }
        
        await this.ensureDirectoryExists(targetDir);
        await fs.writeFile(targetPath, content, 'utf8');
        
        if (existingHash) {
          console.log(`Updated ${targetPath}`);
          this.stats.updated++;
        } else {
          console.log(`Created ${targetPath}`);
          this.stats.new++;
        }
        
      } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
        this.stats.errors++;
      }
    });
  }

  async generateIndexMd(slug, sourceHost, urls) {
    const targetDir = path.join('txts', sourceHost, slug);
    const indexPath = path.join(targetDir, 'index.md');
    
    // Extract title from slug
    const title = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    const hasFullFile = urls.some(url => url.endsWith('llms-full.txt'));
    
    const frontMatter = `---
title: "${title}"
category: "external"
tokens: 0
description: "Imported from ${sourceHost}"
has_full: ${hasFullFile}
source_url: "${urls[0].replace(/\/llms(-full)?\.txt$/, '')}"
---

This content was imported from [${sourceHost}](${urls[0].replace(/\/llms(-full)?\.txt$/, '')}).
`;

    try {
      await fs.writeFile(indexPath, frontMatter, 'utf8');
      console.log(`Generated ${indexPath}`);
    } catch (error) {
      console.error(`Error generating ${indexPath}:`, error.message);
    }
  }

  async sync() {
    console.log('Starting remote sync...');
    
    const allUrls = [];
    
    // Crawl all base sources
    for (const baseUrl of BASE_SOURCES) {
      try {
        const urls = await this.crawlSite(baseUrl);
        allUrls.push(...urls);
      } catch (error) {
        console.error(`Error crawling ${baseUrl}:`, error.message);
        this.stats.errors++;
      }
    }
    
    console.log(`Found ${allUrls.length} total files to sync`);
    
    // Group URLs by slug and source
    const groupedUrls = new Map();
    
    for (const url of allUrls) {
      const urlObj = new URL(url);
      const sourceHost = urlObj.hostname;
      const slug = this.generateSlug(url);
      const key = `${sourceHost}/${slug}`;
      
      if (!groupedUrls.has(key)) {
        groupedUrls.set(key, []);
      }
      groupedUrls.get(key).push(url);
    }
    
    // Download all files
    const downloadPromises = [];
    
    for (const url of allUrls) {
      downloadPromises.push(this.downloadFile(url));
    }
    
    await Promise.all(downloadPromises);
    
    // Generate index.md files
    for (const [key, urls] of groupedUrls) {
      const [sourceHost, slug] = key.split('/');
      await this.generateIndexMd(slug, sourceHost, urls);
    }
    
    console.log('\nSync completed!');
    console.log(`${this.stats.new} new, ${this.stats.updated} updated, ${this.stats.skipped} skipped, ${this.stats.errors} errors`);
    
    if (this.stats.errors > 0) {
      process.exit(1);
    }
  }
}

// Run the sync
const syncer = new SyncRemote();
syncer.sync().catch(error => {
  console.error('Sync failed:', error);
  process.exit(1);
});