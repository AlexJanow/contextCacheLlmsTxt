(() => {
    // Get data from embedded JSON
    const txtData = JSON.parse(document.getElementById('txt-data').textContent);
    
    // DOM elements
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    const resultsBody = document.getElementById('results-body');
    const statsElement = document.getElementById('stats');
    
    // Create proper categories based on imported data
    const categorizeFiles = () => {
        const categories = {
            'AI': [],
            'Developer tools': [],
            'Finance': [],
            'Products': [],
            'Websites': []
        };
        
        txtData.forEach(item => {
            const title = item.title.toLowerCase();
            const desc = item.description.toLowerCase();
            
            // AI-related keywords
            if (title.includes('ai') || title.includes('llm') || title.includes('gpt') || 
                desc.includes('ai') || desc.includes('artificial intelligence') || 
                desc.includes('machine learning') || desc.includes('llm')) {
                categories['AI'].push(item);
                item.inferredCategory = 'AI';
            }
            // Developer tools
            else if (title.includes('dev') || title.includes('api') || title.includes('docs') || 
                     title.includes('git') || title.includes('code') || title.includes('framework') ||
                     desc.includes('developer') || desc.includes('documentation') || 
                     desc.includes('api') || desc.includes('framework')) {
                categories['Developer tools'].push(item);
                item.inferredCategory = 'Developer tools';
            }
            // Finance
            else if (title.includes('pay') || title.includes('finance') || title.includes('bank') ||
                     title.includes('crypto') || title.includes('trading') ||
                     desc.includes('payment') || desc.includes('finance') || desc.includes('trading')) {
                categories['Finance'].push(item);
                item.inferredCategory = 'Finance';
            }
            // Products (apps, tools, specific products)
            else if (title.includes('app') || title.includes('tool') || title.includes('platform') ||
                     desc.includes('app') || desc.includes('tool') || desc.includes('platform')) {
                categories['Products'].push(item);
                item.inferredCategory = 'Products';
            }
            // Everything else as Websites
            else {
                categories['Websites'].push(item);
                item.inferredCategory = 'Websites';
            }
        });
        
        return categories;
    };
    
    // Initialize categories
    const categories = categorizeFiles();
    
    // Populate category dropdown
    const populateCategoryDropdown = () => {
        // Clear existing options except "All categories"
        categorySelect.innerHTML = '<option value="">All categories</option>';
        
        // Add category options with counts
        Object.entries(categories).forEach(([category, items]) => {
            if (items.length > 0) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = `${category} (${items.length})`;
                categorySelect.appendChild(option);
            }
        });
    };
    
    // Simple fuzzy search implementation
    const fuzzySearch = (query, text) => {
        query = query.toLowerCase();
        text = text.toLowerCase();
        
        // Direct substring match
        if (text.includes(query)) return true;
        
        // Character-by-character fuzzy match
        let queryIndex = 0;
        for (let i = 0; i < text.length && queryIndex < query.length; i++) {
            if (text[i] === query[queryIndex]) {
                queryIndex++;
            }
        }
        return queryIndex === query.length;
    };
    
    // Copy to clipboard function
    const copyToClipboard = async (text, button) => {
        try {
            await navigator.clipboard.writeText(text);
            const originalText = button.innerHTML;
            button.innerHTML = '✓ Copied!';
            button.classList.add('text-green-600');
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('text-green-600');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };
    
    // Sort function
    const sortResults = (results, sortBy) => {
        const sorted = [...results];
        
        switch (sortBy) {
            case 'tokens-asc':
                return sorted.sort((a, b) => a.tokens - b.tokens);
            case 'tokens-desc':
                return sorted.sort((a, b) => b.tokens - a.tokens);
            case 'full-tokens-asc':
                return sorted.sort((a, b) => (a.fullTokens || 0) - (b.fullTokens || 0));
            case 'full-tokens-desc':
                return sorted.sort((a, b) => (b.fullTokens || 0) - (a.fullTokens || 0));
            case 'name-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'name-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return sorted; // Default sort (as imported)
        }
    };
    
    // Render results
    const renderResults = (results) => {
        if (results.length === 0) {
            resultsBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        No results found
                    </td>
                </tr>
            `;
            return;
        }
        
        resultsBody.innerHTML = results.map(item => {
            // Extract the folder name from the path field which contains correct info like "/txts/7eads-com/index"
            const folderName = item.path.split('/')[2]; // Gets "7eads-com" from "/txts/7eads-com/index"
            // Remove the leading slash from item.path
            const cleanPath = item.path.substring(1);
            const baseUrl = `${window.location.origin}${window.location.pathname}${cleanPath}`;
            const llmsUrl = `${window.location.origin}${window.location.pathname}txts/${folderName}/llms.txt`;
            const fullUrl = `${window.location.origin}${window.location.pathname}txts/${folderName}/llms-full.txt`;
            const viewUrl = `${baseUrl}/`;
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div>
                            <div class="text-sm font-medium text-gray-900">${item.title}</div>
                            <div class="text-sm text-gray-500">${item.description}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            ${item.inferredCategory || item.category}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                        ${item.tokens.toLocaleString()}
                    </td>
                    <td class="px-6 py-4 text-sm">
                        <a href="${llmsUrl}" class="text-blue-600 hover:text-blue-800">llms.txt</a>
                        ${item.hasFullText ? `<br><a href="${fullUrl}" class="text-blue-600 hover:text-blue-800">llms-full.txt</a>` : ''}
                    </td>
                    <td class="px-6 py-4 text-right text-sm space-x-2">
                        <button onclick="window.copyToClipboard('${llmsUrl}', this)" 
                                class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Copy llms.txt URL">
                            📋 Copy
                        </button>
                        <a href="${viewUrl}" class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    };
    
    // Filter function
    const filterResults = () => {
        const searchQuery = searchInput.value.trim();
        const selectedCategory = categorySelect.value;
        const selectedSort = sortSelect.value;
        
        let filtered = txtData;
        
        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(item => item.inferredCategory === selectedCategory);
        }
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(item => {
                return fuzzySearch(searchQuery, item.title) || 
                       fuzzySearch(searchQuery, item.description) ||
                       fuzzySearch(searchQuery, item.inferredCategory || item.category);
            });
        }
        
        // Apply sorting
        filtered = sortResults(filtered, selectedSort);
        
        renderResults(filtered);
        updateStats(filtered.length);
    };
    
    // Update stats
    const updateStats = (count) => {
        const totalTokens = txtData.reduce((sum, item) => sum + item.tokens, 0);
        statsElement.textContent = `Showing ${count} of ${txtData.length} files • Total tokens: ${totalTokens.toLocaleString()}`;
    };
    
    // Event listeners
    searchInput.addEventListener('input', filterResults);
    categorySelect.addEventListener('change', filterResults);
    sortSelect.addEventListener('change', filterResults);
    
    // Make copyToClipboard available globally
    window.copyToClipboard = copyToClipboard;
    
    // Initialize
    populateCategoryDropdown();
    filterResults();
})();