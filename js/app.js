// メインアプリケーション

class App {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // DOM読み込み完了を待機
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initialize());
            } else {
                await this.initialize();
            }
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('アプリケーションの初期化に失敗しました。');
        }
    }

    async initialize() {
        console.log(`Multi E-commerce Search App v${this.version} initializing...`);

        // 各マネージャーの初期化を待機
        await this.waitForManagers();

        // アプリケーション設定を読み込み
        this.loadAppSettings();

        // グローバルイベントリスナーを設定
        this.setupGlobalEventListeners();

        // パフォーマンス監視を開始
        this.startPerformanceMonitoring();

        // 初期化完了
        this.isInitialized = true;
        console.log('App initialization completed');

        // 初期化完了イベントを発火
        this.dispatchEvent('app:initialized');
    }

    async waitForManagers() {
        // 各マネージャーが初期化されるまで待機
        const maxWaitTime = 5000; // 5秒
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            if (window.themeManager && 
                window.searchManager && 
                window.sortManager && 
                window.shareManager && 
                window.reviewsManager && 
                window.priceHistoryManager) {
                return;
            }
            await this.sleep(100);
        }

        console.warn('Some managers may not be initialized properly');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    loadAppSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            
            // デフォルト設定
            const defaultSettings = {
                language: 'ja',
                currency: 'JPY',
                resultsPerPage: 20,
                enableAnimations: true,
                enableNotifications: true,
                autoSave: true
            };

            this.settings = { ...defaultSettings, ...settings };
            this.applySettings();
        } catch (error) {
            console.warn('Failed to load app settings:', error);
            this.settings = {};
        }
    }

    applySettings() {
        // アニメーション設定
        if (!this.settings.enableAnimations) {
            document.body.classList.add('no-animations');
        }

        // 言語設定
        if (this.settings.language) {
            document.documentElement.lang = this.settings.language;
        }
    }

    setupGlobalEventListeners() {
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // ウィンドウリサイズ
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // オンライン/オフライン状態
        window.addEventListener('online', () => {
            this.showNotification('インターネット接続が復旧しました', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('インターネット接続が切断されました', 'warning');
        });

        // ページ離脱前の確認
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // エラーハンドリング
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: 検索フォーカス
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }

        // Ctrl/Cmd + /: ヘルプ表示
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }

        // Escape: モーダルを閉じる
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }

        // テーマ切り替え (Ctrl/Cmd + Shift + T)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            if (window.themeManager) {
                window.themeManager.toggleTheme();
            }
        }
    }

    handleWindowResize() {
        // レスポンシブ対応の調整
        this.adjustLayoutForScreenSize();
        
        // チャートのリサイズ
        if (window.priceHistoryManager && window.priceHistoryManager.chart) {
            window.priceHistoryManager.chart.resize();
        }
    }

    adjustLayoutForScreenSize() {
        const width = window.innerWidth;
        
        if (width < 768) {
            document.body.classList.add('mobile-layout');
            document.body.classList.remove('desktop-layout');
        } else {
            document.body.classList.add('desktop-layout');
            document.body.classList.remove('mobile-layout');
        }
    }

    startPerformanceMonitoring() {
        // パフォーマンス監視
        if ('performance' in window) {
            // ページ読み込み時間を記録
            window.addEventListener('load', () => {
                const loadTime = performance.now();
                console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
                
                if (loadTime > 3000) {
                    console.warn('Page load time is slow');
                }
            });

            // メモリ使用量監視（Chrome系ブラウザ）
            if ('memory' in performance) {
                setInterval(() => {
                    const memory = performance.memory;
                    if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                        console.warn('High memory usage detected');
                    }
                }, 30000); // 30秒ごと
            }
        }
    }

    handleGlobalError(e) {
        console.error('Global error:', e.error);
        
        // ユーザーに分かりやすいエラーメッセージを表示
        const userMessage = this.getUserFriendlyErrorMessage(e.error);
        this.showNotification(userMessage, 'error');

        // エラー情報を記録（実際の実装では外部サービスに送信）
        this.logError({
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
    }

    handleUnhandledRejection(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        const userMessage = '処理中にエラーが発生しました。しばらく待ってから再試行してください。';
        this.showNotification(userMessage, 'error');

        // Promise rejection を記録
        this.logError({
            type: 'unhandledRejection',
            reason: e.reason,
            timestamp: new Date().toISOString()
        });
    }

    getUserFriendlyErrorMessage(error) {
        if (!error) return '予期しないエラーが発生しました。';

        const message = error.message || error.toString();
        
        // よくあるエラーパターンに対応
        if (message.includes('fetch')) {
            return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        }
        
        if (message.includes('JSON')) {
            return 'データの処理中にエラーが発生しました。';
        }
        
        if (message.includes('localStorage')) {
            return 'ブラウザのストレージにアクセスできません。プライベートモードを無効にしてください。';
        }

        return '予期しないエラーが発生しました。ページを再読み込みしてください。';
    }

    logError(errorInfo) {
        // エラーログをローカルストレージに保存
        try {
            const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            logs.push(errorInfo);
            
            // 最大100件まで保持
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('errorLogs', JSON.stringify(logs));
        } catch (e) {
            console.warn('Failed to log error:', e);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        if (!this.settings.enableNotifications) {
            return;
        }

        // shareManager のトースト機能を使用
        if (window.shareManager) {
            window.shareManager.showToast(message, type);
        } else {
            // フォールバック: コンソールに出力
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h5>キーボードショートカット</h5>
                <ul>
                    <li><kbd>Ctrl/Cmd + K</kbd>: 検索フォーカス</li>
                    <li><kbd>Ctrl/Cmd + Shift + T</kbd>: テーマ切り替え</li>
                    <li><kbd>Ctrl/Cmd + /</kbd>: ヘルプ表示</li>
                    <li><kbd>Escape</kbd>: モーダルを閉じる</li>
                </ul>
                
                <h5>使い方</h5>
                <ol>
                    <li>検索ボックスに商品名を入力</li>
                    <li>検索ボタンをクリックまたはEnterキーを押す</li>
                    <li>結果をソートして比較</li>
                    <li>価格推移やレビューを確認</li>
                    <li>共有ボタンで結果を共有</li>
                </ol>
            </div>
        `;

        // ヘルプモーダルを表示（実装は簡略化）
        this.showModal('ヘルプ', helpContent);
    }

    showModal(title, content) {
        // 動的にモーダルを作成
        const modalId = 'dynamic-modal-' + Date.now();
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        
        // モーダルが閉じられたら要素を削除
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });

        modal.show();
    }

    hasUnsavedChanges() {
        // 未保存の変更があるかチェック
        return false; // 現在の実装では常にfalse
    }

    saveAppSettings() {
        try {
            localStorage.setItem('appSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save app settings:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        if (this.settings.autoSave) {
            this.saveAppSettings();
        }
    }

    getSetting(key, defaultValue = null) {
        return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // アプリケーション情報を取得
    getAppInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            settings: this.settings,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    // デバッグ情報を出力
    debug() {
        console.group('App Debug Info');
        console.log('App Info:', this.getAppInfo());
        console.log('Managers:', {
            themeManager: !!window.themeManager,
            searchManager: !!window.searchManager,
            sortManager: !!window.sortManager,
            shareManager: !!window.shareManager,
            reviewsManager: !!window.reviewsManager,
            priceHistoryManager: !!window.priceHistoryManager
        });
        console.log('Performance:', performance.now());
        console.groupEnd();
    }
}

// アプリケーションのインスタンスを作成
const app = new App();

// グローバルに公開
window.app = app;

// デバッグ用（開発時のみ）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debug = () => app.debug();
    console.log('Debug mode enabled. Type debug() in console for debug info.');
}