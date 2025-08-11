// レビュー機能

class ReviewsManager {
    constructor() {
        this.currentProduct = null;
        this.currentReviews = [];
        this.currentSort = 'helpful';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const reviewSort = document.getElementById('review-sort');
        
        reviewSort.addEventListener('change', (e) => {
            this.sortReviews(e.target.value);
        });
    }

    show(product) {
        this.currentProduct = product;
        this.currentReviews = product.reviews || [];
        
        // モーダルタイトルを更新
        const modalTitle = document.querySelector('#reviewsModal .modal-title');
        modalTitle.textContent = `${product.name} のレビュー`;

        // レビューを表示
        this.displayReviews(this.currentReviews);

        // モーダルを表示
        const reviewsModal = new bootstrap.Modal(document.getElementById('reviewsModal'));
        reviewsModal.show();
    }

    displayReviews(reviews) {
        const reviewsList = document.getElementById('reviews-list');
        
        if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">レビューがありません</h5>
                    <p class="text-muted">この商品にはまだレビューが投稿されていません。</p>
                </div>
            `;
            return;
        }

        // レビューリストをクリア
        reviewsList.innerHTML = '';

        // 各レビューを表示
        reviews.forEach((review, index) => {
            const reviewElement = this.createReviewElement(review, index);
            reviewsList.appendChild(reviewElement);
        });
    }

    createReviewElement(review, index) {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item fade-in';
        reviewDiv.style.animationDelay = `${index * 0.1}s`;

        const reviewDate = new Date(review.date).toLocaleDateString('ja-JP');
        const ratingStars = generateStars(review.rating);

        reviewDiv.innerHTML = `
            <div class="review-rating">
                ${ratingStars}
                <span class="ms-2 text-muted">${review.rating}/5</span>
            </div>
            <div class="review-text">
                ${this.escapeHtml(review.comment)}
            </div>
            <div class="review-meta">
                <span class="text-muted">
                    <i class="fas fa-calendar-alt"></i> ${reviewDate}
                </span>
                <span class="review-helpful ms-3">
                    <i class="fas fa-thumbs-up"></i> 
                    ${review.helpful}人が参考になったと回答
                </span>
            </div>
        `;

        return reviewDiv;
    }

    sortReviews(sortBy) {
        this.currentSort = sortBy;
        
        if (!this.currentReviews || this.currentReviews.length === 0) {
            return;
        }

        const sortedReviews = this.applySorting(this.currentReviews, sortBy);
        this.displayReviews(sortedReviews);
    }

    applySorting(reviews, sortBy) {
        const sortedReviews = [...reviews];

        sortedReviews.sort((a, b) => {
            switch (sortBy) {
                case 'helpful':
                    return b.helpful - a.helpful;

                case 'rating-desc':
                    return b.rating - a.rating;

                case 'rating-asc':
                    return a.rating - b.rating;

                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);

                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);

                default:
                    return 0;
            }
        });

        return sortedReviews;
    }

    // レビュー統計の計算
    calculateReviewStats(reviews) {
        if (!reviews || reviews.length === 0) {
            return null;
        }

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        // 評価分布を計算
        const ratingDistribution = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };

        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        // パーセンテージに変換
        Object.keys(ratingDistribution).forEach(rating => {
            ratingDistribution[rating] = Math.round((ratingDistribution[rating] / totalReviews) * 100);
        });

        return {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution
        };
    }

    // レビュー統計の表示
    displayReviewStats(stats) {
        if (!stats) {
            return '';
        }

        return `
            <div class="review-stats mb-4">
                <div class="row">
                    <div class="col-md-6">
                        <h6>評価の概要</h6>
                        <div class="d-flex align-items-center mb-2">
                            <div class="rating-stars me-2">
                                ${generateStars(stats.averageRating)}
                            </div>
                            <span class="h5 mb-0">${stats.averageRating}</span>
                            <span class="text-muted ms-2">(${stats.totalReviews}件のレビュー)</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>評価分布</h6>
                        ${this.createRatingDistributionChart(stats.ratingDistribution)}
                    </div>
                </div>
            </div>
        `;
    }

    createRatingDistributionChart(distribution) {
        let chartHtml = '';
        
        for (let rating = 5; rating >= 1; rating--) {
            const percentage = distribution[rating] || 0;
            chartHtml += `
                <div class="d-flex align-items-center mb-1">
                    <span class="me-2">${rating}★</span>
                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                        <div class="progress-bar bg-warning" style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-muted small">${percentage}%</span>
                </div>
            `;
        }

        return chartHtml;
    }

    // レビューフィルタリング
    filterReviews(reviews, filters) {
        return reviews.filter(review => {
            // 評価フィルター
            if (filters.minRating && review.rating < filters.minRating) {
                return false;
            }
            if (filters.maxRating && review.rating > filters.maxRating) {
                return false;
            }

            // 日付フィルター
            if (filters.dateFrom) {
                const reviewDate = new Date(review.date);
                const fromDate = new Date(filters.dateFrom);
                if (reviewDate < fromDate) {
                    return false;
                }
            }

            if (filters.dateTo) {
                const reviewDate = new Date(review.date);
                const toDate = new Date(filters.dateTo);
                if (reviewDate > toDate) {
                    return false;
                }
            }

            // キーワードフィルター
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!review.comment.toLowerCase().includes(keyword)) {
                    return false;
                }
            }

            return true;
        });
    }

    // レビューの感情分析（簡易版）
    analyzeSentiment(reviews) {
        if (!reviews || reviews.length === 0) {
            return null;
        }

        const positiveWords = ['良い', '素晴らしい', '最高', '満足', 'おすすめ', '快適', '便利'];
        const negativeWords = ['悪い', '最悪', '不満', '問題', '残念', '不便', '失敗'];

        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        reviews.forEach(review => {
            const comment = review.comment.toLowerCase();
            let sentiment = 'neutral';

            const positiveScore = positiveWords.reduce((score, word) => {
                return score + (comment.includes(word) ? 1 : 0);
            }, 0);

            const negativeScore = negativeWords.reduce((score, word) => {
                return score + (comment.includes(word) ? 1 : 0);
            }, 0);

            if (positiveScore > negativeScore) {
                sentiment = 'positive';
                positiveCount++;
            } else if (negativeScore > positiveScore) {
                sentiment = 'negative';
                negativeCount++;
            } else {
                neutralCount++;
            }
        });

        return {
            positive: Math.round((positiveCount / reviews.length) * 100),
            negative: Math.round((negativeCount / reviews.length) * 100),
            neutral: Math.round((neutralCount / reviews.length) * 100)
        };
    }

    // レビューのキーワード抽出
    extractKeywords(reviews) {
        if (!reviews || reviews.length === 0) {
            return [];
        }

        const wordCount = {};
        const stopWords = ['の', 'に', 'は', 'を', 'が', 'で', 'と', 'も', 'から', 'まで', 'です', 'ます', 'した', 'する'];

        reviews.forEach(review => {
            const words = review.comment
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 1 && !stopWords.includes(word));

            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });
        });

        // 頻出単語を抽出
        return Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentProduct() {
        return this.currentProduct;
    }

    getCurrentReviews() {
        return this.currentReviews;
    }
}

// 価格推移表示機能
class PriceHistoryManager {
    constructor() {
        this.currentProduct = null;
        this.chart = null;
    }

    show(product) {
        this.currentProduct = product;
        
        // モーダルタイトルを更新
        const modalTitle = document.querySelector('#priceHistoryModal .modal-title');
        modalTitle.textContent = `${product.name} の価格推移`;

        // Keepaリンクを更新
        this.updateKeepaLink(product);

        // 価格推移チャートを表示
        this.displayPriceChart(product.priceHistory || []);

        // モーダルを表示
        const priceModal = new bootstrap.Modal(document.getElementById('priceHistoryModal'));
        priceModal.show();
    }

    updateKeepaLink(product) {
        const keepaLink = document.getElementById('keepa-link');
        
        if (product.site === 'amazon' && siteInfo.amazon.keepaUrl) {
            // Amazon商品の場合はKeepaリンクを表示
            const productId = product.id.replace('amz-', '');
            keepaLink.href = siteInfo.amazon.keepaUrl + productId;
            keepaLink.style.display = 'inline-block';
        } else {
            // その他のサイトの場合は非表示
            keepaLink.style.display = 'none';
        }
    }

    displayPriceChart(priceHistory) {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // 既存のチャートを破棄
        if (this.chart) {
            this.chart.destroy();
        }

        if (!priceHistory || priceHistory.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('価格推移データがありません', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        // データを準備
        const labels = priceHistory.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        });

        const prices = priceHistory.map(item => item.price);

        // チャートを作成
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '価格 (円)',
                    data: prices,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '価格: ¥' + context.parsed.y.toLocaleString();
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// レビューマネージャーと価格推移マネージャーのインスタンスを作成
let reviewsManager;
let priceHistoryManager;

document.addEventListener('DOMContentLoaded', () => {
    reviewsManager = new ReviewsManager();
    priceHistoryManager = new PriceHistoryManager();
    
    window.reviewsManager = reviewsManager;
    window.priceHistoryManager = priceHistoryManager;
});