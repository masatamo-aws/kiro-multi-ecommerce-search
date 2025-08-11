// ソート機能

class SortManager {
    constructor() {
        this.currentSortBy = 'relevance';
        this.currentSortOrder = 'desc';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const sortSelect = document.getElementById('sort-select');
        
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            this.applySorting(sortValue);
        });
    }

    applySorting(sortValue) {
        if (!window.searchManager) {
            console.warn('SearchManager not available');
            return;
        }

        const results = window.searchManager.getCurrentResults();
        if (!results || results.length === 0) {
            return;
        }

        // ソート値を解析
        const [sortBy, sortOrder] = this.parseSortValue(sortValue);
        this.currentSortBy = sortBy;
        this.currentSortOrder = sortOrder;

        // ソート実行
        const sortedResults = this.sortProducts(results, sortBy, sortOrder);
        
        // 結果を再表示
        this.displaySortedResults(sortedResults);
        
        // ソート状態を保存
        this.saveSortPreference(sortValue);
    }

    parseSortValue(sortValue) {
        const sortMap = {
            'relevance': ['relevance', 'desc'],
            'price-asc': ['price', 'asc'],
            'price-desc': ['price', 'desc'],
            'rating-desc': ['rating', 'desc'],
            'rating-asc': ['rating', 'asc'],
            'review-count-desc': ['reviewCount', 'desc'],
            'review-count-asc': ['reviewCount', 'asc'],
            'seller-rating-desc': ['sellerRating', 'desc'],
            'seller-rating-asc': ['sellerRating', 'asc'],
            'price-drop': ['priceChange', 'desc']
        };

        return sortMap[sortValue] || ['relevance', 'desc'];
    }

    sortProducts(products, sortBy, sortOrder) {
        const sortedProducts = [...products];

        sortedProducts.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'price':
                    valueA = a.price;
                    valueB = b.price;
                    break;

                case 'rating':
                    valueA = a.rating;
                    valueB = b.rating;
                    break;

                case 'reviewCount':
                    valueA = a.reviewCount;
                    valueB = b.reviewCount;
                    break;

                case 'sellerRating':
                    valueA = a.seller.rating;
                    valueB = b.seller.rating;
                    break;

                case 'priceChange':
                    // 価格変動でソート（下がった順）
                    valueA = this.getPriceChangeScore(a);
                    valueB = this.getPriceChangeScore(b);
                    break;

                case 'relevance':
                default:
                    // 関連度は元の順序を維持
                    return 0;
            }

            // 数値比較
            if (sortOrder === 'asc') {
                return valueA - valueB;
            } else {
                return valueB - valueA;
            }
        });

        return sortedProducts;
    }

    getPriceChangeScore(product) {
        // 価格変動のスコア計算
        if (!product.priceHistory || product.priceHistory.length < 2) {
            return 0;
        }

        const history = product.priceHistory;
        const currentPrice = history[history.length - 1].price;
        const previousPrice = history[history.length - 2].price;
        
        // 価格変動率を計算
        const changeRate = (previousPrice - currentPrice) / previousPrice;
        
        // 下がった商品ほど高いスコア
        return changeRate;
    }

    displaySortedResults(sortedResults) {
        const productsGrid = document.getElementById('products-grid');
        const keyword = window.searchManager.getCurrentKeyword();
        
        // グリッドをクリア
        productsGrid.innerHTML = '';

        // ソート済み商品カードを生成
        sortedResults.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            productsGrid.appendChild(productCard);
        });

        // アニメーション効果
        this.animateSortedResults();
    }

    createProductCard(product, index) {
        // SearchManagerのcreateProductCardメソッドを再利用
        if (window.searchManager && typeof window.searchManager.createProductCard === 'function') {
            return window.searchManager.createProductCard(product, index);
        }

        // フォールバック実装
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12';
        
        const siteClass = `site-${product.site}`;
        const siteName = siteInfo[product.site]?.name || product.site;

        col.innerHTML = `
            <div class="card product-card" style="animation-delay: ${index * 0.05}s">
                <img src="${product.imageUrl}" class="product-image" alt="${product.name}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <div class="product-site ${siteClass}">${siteName}</div>
                    <h6 class="product-title">${this.escapeHtml(product.name)}</h6>
                    <div class="product-price">${formatCurrency(product.price, product.currency)}</div>
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

    animateSortedResults() {
        const cards = document.querySelectorAll('.product-card');
        
        // 既存のアニメーションクラスを削除
        cards.forEach(card => {
            card.classList.remove('fade-in');
        });

        // 新しいアニメーションを適用
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 50);
        });
    }

    saveSortPreference(sortValue) {
        try {
            localStorage.setItem('sortPreference', sortValue);
        } catch (error) {
            console.warn('Failed to save sort preference:', error);
        }
    }

    loadSortPreference() {
        try {
            const savedSort = localStorage.getItem('sortPreference');
            if (savedSort) {
                const sortSelect = document.getElementById('sort-select');
                if (sortSelect) {
                    sortSelect.value = savedSort;
                    return savedSort;
                }
            }
        } catch (error) {
            console.warn('Failed to load sort preference:', error);
        }
        return 'relevance';
    }

    // 高度なソート機能
    multiSort(products, sortCriteria) {
        // 複数の条件でソート
        return products.sort((a, b) => {
            for (const criteria of sortCriteria) {
                const { field, order } = criteria;
                let valueA, valueB;

                switch (field) {
                    case 'price':
                        valueA = a.price;
                        valueB = b.price;
                        break;
                    case 'rating':
                        valueA = a.rating;
                        valueB = b.rating;
                        break;
                    case 'reviewCount':
                        valueA = a.reviewCount;
                        valueB = b.reviewCount;
                        break;
                    default:
                        continue;
                }

                const comparison = order === 'asc' ? valueA - valueB : valueB - valueA;
                if (comparison !== 0) {
                    return comparison;
                }
            }
            return 0;
        });
    }

    // フィルタリング機能
    filterProducts(products, filters) {
        return products.filter(product => {
            // 価格範囲フィルター
            if (filters.minPrice && product.price < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice && product.price > filters.maxPrice) {
                return false;
            }

            // 評価フィルター
            if (filters.minRating && product.rating < filters.minRating) {
                return false;
            }

            // サイトフィルター
            if (filters.sites && filters.sites.length > 0) {
                if (!filters.sites.includes(product.site)) {
                    return false;
                }
            }

            // 出品者評価フィルター
            if (filters.minSellerRating && product.seller.rating < filters.minSellerRating) {
                return false;
            }

            return true;
        });
    }

    // 統計情報の計算
    calculateStats(products) {
        if (!products || products.length === 0) {
            return null;
        }

        const prices = products.map(p => p.price);
        const ratings = products.map(p => p.rating);

        return {
            count: products.length,
            priceRange: {
                min: Math.min(...prices),
                max: Math.max(...prices),
                avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
            },
            ratingRange: {
                min: Math.min(...ratings),
                max: Math.max(...ratings),
                avg: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            },
            siteDistribution: this.getSiteDistribution(products)
        };
    }

    getSiteDistribution(products) {
        const distribution = {};
        products.forEach(product => {
            distribution[product.site] = (distribution[product.site] || 0) + 1;
        });
        return distribution;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentSort() {
        return {
            sortBy: this.currentSortBy,
            sortOrder: this.currentSortOrder
        };
    }
}

// ソートマネージャーのインスタンスを作成
let sortManager;

document.addEventListener('DOMContentLoaded', () => {
    sortManager = new SortManager();
    window.sortManager = sortManager;
    
    // 保存されたソート設定を読み込み
    const savedSort = sortManager.loadSortPreference();
    if (savedSort !== 'relevance') {
        // 検索結果がある場合のみソートを適用
        setTimeout(() => {
            if (window.searchManager && window.searchManager.getCurrentResults().length > 0) {
                sortManager.applySorting(savedSort);
            }
        }, 100);
    }
});