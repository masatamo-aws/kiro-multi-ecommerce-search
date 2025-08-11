// 共有機能

class ShareManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const shareBtn = document.getElementById('share-btn');
        const copyUrlBtn = document.getElementById('copy-url-btn');

        shareBtn.addEventListener('click', () => {
            this.showShareModal();
        });

        copyUrlBtn.addEventListener('click', () => {
            this.copyShareUrl();
        });
    }

    showShareModal() {
        if (!window.searchManager) {
            console.warn('SearchManager not available');
            return;
        }

        const keyword = window.searchManager.getCurrentKeyword();
        const results = window.searchManager.getCurrentResults();

        if (!keyword || !results || results.length === 0) {
            this.showError('共有する検索結果がありません。');
            return;
        }

        // 共有URLを生成
        const shareUrl = this.generateShareUrl(keyword, results);
        
        // モーダルに表示
        const shareUrlInput = document.getElementById('share-url');
        shareUrlInput.value = shareUrl;

        // モーダルを表示
        const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
        shareModal.show();
    }

    generateShareUrl(keyword, results) {
        const baseUrl = window.location.origin + window.location.pathname;
        
        // 共有データを作成
        const shareData = {
            keyword: keyword,
            timestamp: new Date().toISOString(),
            results: results.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                currency: product.currency,
                rating: product.rating,
                reviewCount: product.reviewCount,
                site: product.site,
                productUrl: product.productUrl,
                imageUrl: product.imageUrl
            })),
            sortBy: window.sortManager ? window.sortManager.getCurrentSort().sortBy : 'relevance',
            sortOrder: window.sortManager ? window.sortManager.getCurrentSort().sortOrder : 'desc'
        };

        // データを圧縮してBase64エンコード
        const compressedData = this.compressData(shareData);
        const encodedData = btoa(compressedData);

        // URLパラメータとして追加
        const params = new URLSearchParams({
            q: keyword,
            data: encodedData
        });

        return `${baseUrl}?${params.toString()}`;
    }

    compressData(data) {
        // 簡単なデータ圧縮（実際の実装ではより高度な圧縮を使用）
        return JSON.stringify(data);
    }

    async copyShareUrl() {
        const shareUrlInput = document.getElementById('share-url');
        const copyBtn = document.getElementById('copy-url-btn');
        
        try {
            // Clipboard APIを使用
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shareUrlInput.value);
            } else {
                // フォールバック: 古いブラウザ対応
                shareUrlInput.select();
                shareUrlInput.setSelectionRange(0, 99999);
                document.execCommand('copy');
            }

            // 成功フィードバック
            this.showCopySuccess(copyBtn);
            
        } catch (error) {
            console.error('Failed to copy URL:', error);
            this.showCopyError();
        }
    }

    showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> コピー完了';
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-success');

        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-secondary');
        }, 2000);
    }

    showCopyError() {
        // エラートーストを表示
        this.showToast('URLのコピーに失敗しました。手動でコピーしてください。', 'error');
    }

    loadSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (!encodedData) {
            return null;
        }

        try {
            // Base64デコードしてデータを復元
            const compressedData = atob(encodedData);
            const shareData = JSON.parse(compressedData);

            return shareData;
        } catch (error) {
            console.error('Failed to load shared data:', error);
            return null;
        }
    }

    applySharedData(shareData) {
        if (!shareData) {
            return;
        }

        // 検索キーワードを設定
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = shareData.keyword;
        }

        // 検索結果を表示
        if (window.searchManager) {
            window.searchManager.currentResults = shareData.results;
            window.searchManager.currentKeyword = shareData.keyword;
            window.searchManager.displayResults(shareData.results, shareData.keyword);
            window.searchManager.showSortSection();
        }

        // ソート設定を適用
        if (shareData.sortBy && shareData.sortBy !== 'relevance' && window.sortManager) {
            const sortValue = `${shareData.sortBy}-${shareData.sortOrder}`;
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) {
                sortSelect.value = sortValue;
                window.sortManager.applySorting(sortValue);
            }
        }

        // 共有データが読み込まれたことを通知
        this.showToast('共有された検索結果を読み込みました。', 'success');
    }

    // ソーシャルメディア共有
    shareToSocial(platform, keyword, url) {
        const text = `"${keyword}" の商品検索結果をチェック！`;
        let shareUrl;

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'line':
                shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            default:
                console.warn('Unsupported platform:', platform);
                return;
        }

        // 新しいウィンドウで開く
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Web Share API（モバイル対応）
    async shareNative(keyword, url) {
        if (!navigator.share) {
            console.warn('Web Share API not supported');
            return false;
        }

        try {
            await navigator.share({
                title: 'マルチECサイト検索',
                text: `"${keyword}" の商品検索結果`,
                url: url
            });
            return true;
        } catch (error) {
            console.error('Native share failed:', error);
            return false;
        }
    }

    // QRコード生成（オプション機能）
    generateQRCode(url) {
        // QRコード生成ライブラリを使用（実装は簡略化）
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        return qrCodeUrl;
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Bootstrap Toast または カスタムトースト表示
        const toastContainer = this.getOrCreateToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${this.escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Bootstrap Toastを初期化して表示
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // 表示後に要素を削除
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    getOrCreateToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '1055';
            document.body.appendChild(container);
        }
        return container;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 統計情報の共有
    generateStatsShare(results) {
        if (!results || results.length === 0) {
            return null;
        }

        const stats = window.sortManager ? window.sortManager.calculateStats(results) : null;
        if (!stats) {
            return null;
        }

        return {
            totalProducts: stats.count,
            priceRange: {
                min: formatCurrency(stats.priceRange.min),
                max: formatCurrency(stats.priceRange.max),
                avg: formatCurrency(Math.round(stats.priceRange.avg))
            },
            avgRating: stats.ratingRange.avg.toFixed(1),
            siteDistribution: stats.siteDistribution
        };
    }
}

// 共有マネージャーのインスタンスを作成
let shareManager;

document.addEventListener('DOMContentLoaded', () => {
    shareManager = new ShareManager();
    window.shareManager = shareManager;

    // 共有データの読み込み（ページ読み込み時）
    const sharedData = shareManager.loadSharedData();
    if (sharedData) {
        // 他のマネージャーが初期化されるまで少し待つ
        setTimeout(() => {
            shareManager.applySharedData(sharedData);
        }, 500);
    }
});