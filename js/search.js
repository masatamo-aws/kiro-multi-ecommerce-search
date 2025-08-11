// 検索機能

class SearchManager {
    constructor() {
        this.currentResults = [];
        this.currentKeyword = '';
        this.isSearching = false;
        this.searchCache = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSharedSearch();
    }

    setupEventListeners() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        // 検索フォーム送信
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const keyword = searchInput.value.trim();
            if (keyword) {
                this.performSearch(keyword);
            }
        });

        // 検索入力のデバウンス処理
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const keyword = e.target.value.trim();
                if (keyword.length >= 2) {
                    this.showSearchSuggestions(keyword);
                }
            }, 300);
        });

        // Enterキーでの検索
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    async performSearch(keyword) {
        if (this.isSearching) {
            return;
        }

        this.isSearching = true;
        this.currentKeyword = keyword;
        
        // UI更新
        this.showLoading();
        this.hideResults();

        try {
            console.log('Starting search for:', keyword);
            
            // キャッシュチェック
            let results = this.searchCache.get(keyword);
            
            if (!results) {
                console.log('No cached results, executing search...');
                // 実際の検索実行
                results = await this.executeSearch(keyword);
                console.log('Search completed, results count:', results.length);
                this.searchCache.set(keyword, results);
            } else {
                console.log('Using cached results, count:', results.length);
            }

            this.currentResults = results;
            this.displayResults(results, keyword);
            this.showSortSection();
            
            // 検索履歴に追加
            this.addToSearchHistory(keyword);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('検索中にエラーが発生しました。もう一度お試しください。');
        } finally {
            this.isSearching = false;
            this.hideLoading();
        }
    }

    async executeSearch(keyword) {
        console.log('Executing search for keyword:', keyword);
        
        try {
            // 実際のAPI検索と模擬検索を並行実行
            const searchPromises = [
                this.searchWithAPI(keyword),
                this.searchWithMockData(keyword)
            ];

            const [apiResults, mockResults] = await Promise.allSettled(searchPromises);
            
            let allResults = [];
            
            // API検索結果を追加
            if (apiResults.status === 'fulfilled' && apiResults.value.length > 0) {
                allResults.push(...apiResults.value);
                console.log('API search results:', apiResults.value.length);
            }
            
            // モックデータ結果を追加（API結果が少ない場合の補完）
            if (mockResults.status === 'fulfilled') {
                const mockData = mockResults.value;
                // 重複を避けるため、API結果が少ない場合のみモックデータを追加
                if (allResults.length < 10) {
                    allResults.push(...mockData.slice(0, 20 - allResults.length));
                }
                console.log('Mock search results:', mockData.length);
            }
            
            console.log('Total search results:', allResults.length);
            return allResults;
            
        } catch (error) {
            console.error('Search execution failed:', error);
            // フォールバック: モックデータのみを使用
            return await this.searchWithMockData(keyword);
        }
    }

    async searchWithAPI(keyword) {
        if (!window.apiClient) {
            console.warn('API client not available');
            return [];
        }

        try {
            // 各ECサイトから並行して検索
            const searchPromises = [
                window.apiClient.searchAmazon(keyword, 5),
                window.apiClient.searchRakuten(keyword, 5),
                window.apiClient.searchYahoo(keyword, 5),
                window.apiClient.searchTaobao(keyword, 5)
            ];

            const siteResults = await Promise.allSettled(searchPromises);
            
            // 結果をマージ
            const allResults = [];
            siteResults.forEach((result, index) => {
                const siteNames = ['Amazon', 'Rakuten', 'Yahoo', 'Taobao'];
                if (result.status === 'fulfilled') {
                    allResults.push(...result.value);
                    console.log(`${siteNames[index]} API returned ${result.value.length} results`);
                } else {
                    console.warn(`${siteNames[index]} API search failed:`, result.reason);
                }
            });

            return allResults;
        } catch (error) {
            console.error('API search failed:', error);
            return [];
        }
    }

    async searchWithMockData(keyword) {
        try {
            return await simulateSearch(keyword);
        } catch (error) {
            console.error('Mock data search failed:', error);
            return [];
        }
    }



    displayResults(results, keyword) {
        const resultsSection = document.getElementById('results-section');
        const resultsTitle = document.getElementById('results-title');
        const resultsCount = document.getElementById('results-count');
        const productsGrid = document.getElementById('products-grid');

        // 結果タイトルと件数を更新
        resultsTitle.textContent = `"${keyword}" の検索結果`;
        resultsCount.textContent = `${results.length}件`;

        // 商品グリッドをクリア
        productsGrid.innerHTML = '';

        if (results.length === 0) {
            this.showNoResults(keyword);
            return;
        }

        // 商品カードを生成
        results.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            productsGrid.appendChild(productCard);
        });

        // 結果セクションを表示
        resultsSection.style.display = 'block';
        
        // アニメーション効果
        this.animateResults();
    }

    createProductCard(product, index) {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12';
        
        const siteClass = `site-${product.site}`;
        const siteName = siteInfo[product.site]?.name || product.site;
        const priceChangeClass = product.priceChange ? `price-${product.priceChange}` : '';
        const priceChangeText = this.getPriceChangeText(product.priceChange);

        col.innerHTML = `
            <div class="card product-card fade-in" style="animation-delay: ${index * 0.1}s">
                <img src="${product.imageUrl}" class="product-image" alt="${product.name}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="product-site ${siteClass}">${siteName}</div>
                        <div class="data-source-badge">
                            ${this.getDataSourceBadge(product)}
                        </div>
                    </div>
                    <h6 class="product-title">${this.escapeHtml(product.name)}</h6>
                    <div class="product-price">
                        ${formatCurrency(product.price, product.currency)}
                        ${priceChangeText ? `<span class="price-change ${priceChangeClass}">${priceChangeText}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <div class="rating-stars">${generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.reviewCount})</span>
                    </div>
                    <div class="seller-info">
                        出品者: <span class="seller-rating">${product.seller.name}</span>
                        <span class="text-muted">(${product.seller.rating}★)</span>
                    </div>
                    <div class="product-actions mt-auto">
                        <a href="${product.productUrl}" target="_blank" class="btn btn-primary btn-sm flex-fill">
                            <i class="fas fa-external-link-alt"></i> 商品ページ
                        </a>
                        <button class="btn btn-outline-secondary btn-sm" onclick="showPriceHistory('${product.id}')">
                            <i class="fas fa-chart-line"></i> 価格推移
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="showReviews('${product.id}')">
                            <i class="fas fa-star"></i> レビュー
                        </button>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    getPriceChangeText(priceChange) {
        switch (priceChange) {
            case 'down':
                return '↓ 値下がり';
            case 'up':
                return '↑ 値上がり';
            case 'stable':
                return '→ 変動なし';
            default:
                return '';
        }
    }

    showNoResults(keyword) {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>検索結果が見つかりませんでした</h4>
                    <p>"${this.escapeHtml(keyword)}" に一致する商品は見つかりませんでした。</p>
                    <p>別のキーワードで検索してみてください。</p>
                </div>
            </div>
        `;
        
        document.getElementById('results-section').style.display = 'block';
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showSortSection() {
        document.getElementById('sort-section').style.display = 'flex';
    }

    hideResults() {
        document.getElementById('results-section').style.display = 'none';
    }

    showError(message) {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${this.escapeHtml(message)}
                </div>
            </div>
        `;
        
        document.getElementById('results-section').style.display = 'block';
    }

    animateResults() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    addToSearchHistory(keyword) {
        try {
            let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            
            // 重複を削除
            history = history.filter(item => item !== keyword);
            
            // 先頭に追加
            history.unshift(keyword);
            
            // 最大10件まで保持
            history = history.slice(0, 10);
            
            localStorage.setItem('searchHistory', JSON.stringify(history));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }

    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('searchHistory') || '[]');
        } catch (error) {
            console.warn('Failed to load search history:', error);
            return [];
        }
    }

    showSearchSuggestions(keyword) {
        // 検索履歴から候補を表示（実装は簡略化）
        const history = this.getSearchHistory();
        const suggestions = history.filter(item => 
            item.toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 5);

        // 実際の実装では、ドロップダウンで候補を表示
        console.log('Search suggestions:', suggestions);
    }

    loadSharedSearch() {
        // URLパラメータから共有された検索を読み込み
        const urlParams = new URLSearchParams(window.location.search);
        const sharedKeyword = urlParams.get('q');
        
        if (sharedKeyword) {
            document.getElementById('search-input').value = sharedKeyword;
            this.performSearch(sharedKeyword);
        }
    }

    getDataSourceBadge(product) {
        if (product.id.includes('-live-')) {
            return '<span class="badge bg-success" title="実際のAPIから取得">LIVE</span>';
        } else {
            return '<span class="badge bg-secondary" title="サンプルデータ">DEMO</span>';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentResults() {
        return this.currentResults;
    }

    getCurrentKeyword() {
        return this.currentKeyword;
    }
}

// グローバル関数（HTMLから呼び出し用）
function showPriceHistory(productId) {
    if (window.searchManager) {
        const product = window.searchManager.getCurrentResults().find(p => p.id === productId);
        if (product && window.priceHistoryManager) {
            window.priceHistoryManager.show(product);
        }
    }
}

function showReviews(productId) {
    if (window.searchManager) {
        const product = window.searchManager.getCurrentResults().find(p => p.id === productId);
        if (product && window.reviewsManager) {
            window.reviewsManager.show(product);
        }
    }
}

// デバッグ用関数
function testSearch() {
    console.log('Testing search functionality...');
    console.log('mockProducts:', typeof mockProducts !== 'undefined' ? Object.keys(mockProducts) : 'undefined');
    console.log('simulateSearch:', typeof simulateSearch);
    
    if (typeof simulateSearch === 'function') {
        simulateSearch('iPhone').then(results => {
            console.log('Test search results for iPhone:', results);
        }).catch(error => {
            console.error('Test search failed:', error);
        });
    }
}

// 検索マネージャーのインスタンスを作成
let searchManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing SearchManager...');
    console.log('mockProducts available:', typeof mockProducts !== 'undefined');
    console.log('simulateSearch available:', typeof simulateSearch !== 'undefined');
    
    searchManager = new SearchManager();
    window.searchManager = searchManager;
    
    // デバッグ用にグローバルに公開
    window.testSearch = testSearch;
    
    console.log('SearchManager initialized');
});