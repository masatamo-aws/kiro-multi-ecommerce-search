// 設定管理

class ConfigManager {
    constructor() {
        this.defaultConfig = {
            apiKeys: {
                rakuten: '',
                yahoo: '',
                amazonAssociateTag: ''
            },
            proxy: {
                enabled: true,
                url: 'https://cors-anywhere.herokuapp.com/'
            },
            search: {
                enableRealAPI: true,
                enableMockData: true,
                maxResultsPerSite: 5,
                timeout: 10000
            },
            ui: {
                showAPIStatus: true,
                showDataSource: true
            }
        };
        
        this.config = this.loadConfig();
        this.init();
    }

    init() {
        this.createConfigUI();
        this.applyConfig();
    }

    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('appConfig');
            if (savedConfig) {
                return { ...this.defaultConfig, ...JSON.parse(savedConfig) };
            }
        } catch (error) {
            console.warn('Failed to load config:', error);
        }
        return { ...this.defaultConfig };
    }

    saveConfig() {
        try {
            localStorage.setItem('appConfig', JSON.stringify(this.config));
            console.log('Config saved successfully');
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
        this.applyConfig();
    }

    applyConfig() {
        // APIクライアントに設定を適用
        if (window.apiClient) {
            window.apiClient.updateConfig({
                apiKeys: this.config.apiKeys,
                useProxy: this.config.proxy.enabled,
                proxyUrl: this.config.proxy.url
            });
        }

        // UI設定を適用
        this.updateUIVisibility();
    }

    updateUIVisibility() {
        // API状態表示の切り替え
        const apiStatusElement = document.getElementById('api-status');
        if (apiStatusElement) {
            apiStatusElement.style.display = this.config.ui.showAPIStatus ? 'block' : 'none';
        }
    }

    createConfigUI() {
        // 設定ボタンのイベントリスナーを設定（HTMLに既に存在する前提）
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showConfigModal());
        }

        // 設定モーダルを作成
        this.createConfigModal();
        
        // API状態表示を作成
        this.createAPIStatusIndicator();
    }

    createConfigModal() {
        const modalHTML = `
            <div class="modal fade" id="configModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">アプリケーション設定</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>公式API設定</h6>
                                    <div class="mb-3">
                                        <label for="rakuten-api-key" class="form-label">楽天API キー</label>
                                        <input type="text" class="form-control" id="rakuten-api-key" 
                                               placeholder="楽天APIキーを入力">
                                        <small class="form-text text-muted">
                                            <a href="https://webservice.rakuten.co.jp/" target="_blank">
                                                楽天ウェブサービスで取得
                                            </a>
                                        </small>
                                    </div>
                                    <div class="mb-3">
                                        <label for="yahoo-api-key" class="form-label">Yahoo! API キー</label>
                                        <input type="text" class="form-control" id="yahoo-api-key" 
                                               placeholder="Yahoo!APIキーを入力">
                                        <small class="form-text text-muted">
                                            <a href="https://developer.yahoo.co.jp/" target="_blank">
                                                Yahoo!デベロッパーネットワークで取得
                                            </a>
                                        </small>
                                    </div>
                                    
                                    <h6 class="mt-4">Amazon設定</h6>
                                    <div class="mb-3">
                                        <label for="amazon-associate-tag" class="form-label">Amazon アソシエイトタグ</label>
                                        <input type="text" class="form-control" id="amazon-associate-tag" 
                                               placeholder="your-associate-tag-20">
                                        <small class="form-text text-muted">
                                            <a href="https://affiliate.amazon.co.jp/" target="_blank">
                                                Amazonアソシエイトで取得
                                            </a> (オプション)
                                        </small>
                                    </div>
                                    <div class="alert alert-info" role="alert">
                                        <i class="fas fa-info-circle"></i>
                                        <strong>Amazon:</strong> 公式APIは制限が厳しいため、スクレイピング機能を使用します。
                                        アソシエイトタグは収益化時のみ必要です。
                                    </div>
                                    
                                    <h6 class="mt-4">淘宝設定</h6>
                                    <div class="alert alert-warning" role="alert">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <strong>淘宝:</strong> 公式APIは中国国内の企業のみ利用可能です。
                                        スクレイピング機能を使用しますが、制限される場合があります。
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>プロキシ設定</h6>
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="enable-proxy">
                                            <label class="form-check-label" for="enable-proxy">
                                                CORSプロキシを使用
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="proxy-url" class="form-label">プロキシURL</label>
                                        <input type="text" class="form-control" id="proxy-url" 
                                               placeholder="https://cors-anywhere.herokuapp.com/">
                                    </div>
                                    
                                    <h6>検索設定</h6>
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="enable-real-api">
                                            <label class="form-check-label" for="enable-real-api">
                                                実際のAPI検索を有効化
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="enable-mock-data">
                                            <label class="form-check-label" for="enable-mock-data">
                                                モックデータを使用
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6>API接続状態</h6>
                                    <div id="api-connection-status">
                                        <button class="btn btn-outline-primary btn-sm" onclick="configManager.checkAPIConnections()">
                                            <i class="fas fa-sync"></i> 接続テスト
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                            <button type="button" class="btn btn-primary" onclick="configManager.saveConfigFromModal()">
                                設定を保存
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createAPIStatusIndicator() {
        const statusHTML = `
            <div id="api-status" class="alert alert-info alert-dismissible fade show mt-2" role="alert" style="display: none;">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <strong>API状態:</strong>
                    </div>
                    <div class="d-flex gap-2">
                        <span class="badge bg-secondary" id="amazon-status">Amazon: 未確認</span>
                        <span class="badge bg-secondary" id="rakuten-status">楽天: 未確認</span>
                        <span class="badge bg-secondary" id="yahoo-status">Yahoo: 未確認</span>
                        <span class="badge bg-secondary" id="taobao-status">淘宝: 未確認</span>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            searchSection.insertAdjacentHTML('afterend', statusHTML);
        }
    }

    showConfigModal() {
        // 現在の設定値をモーダルに反映
        document.getElementById('rakuten-api-key').value = this.config.apiKeys.rakuten || '';
        document.getElementById('yahoo-api-key').value = this.config.apiKeys.yahoo || '';
        document.getElementById('amazon-associate-tag').value = this.config.apiKeys.amazonAssociateTag || '';
        document.getElementById('enable-proxy').checked = this.config.proxy.enabled;
        document.getElementById('proxy-url').value = this.config.proxy.url;
        document.getElementById('enable-real-api').checked = this.config.search.enableRealAPI;
        document.getElementById('enable-mock-data').checked = this.config.search.enableMockData;

        // モーダルを表示
        const configModal = new bootstrap.Modal(document.getElementById('configModal'));
        configModal.show();
    }

    saveConfigFromModal() {
        // モーダルから設定値を取得
        const newConfig = {
            apiKeys: {
                rakuten: document.getElementById('rakuten-api-key').value.trim(),
                yahoo: document.getElementById('yahoo-api-key').value.trim(),
                amazonAssociateTag: document.getElementById('amazon-associate-tag').value.trim()
            },
            proxy: {
                enabled: document.getElementById('enable-proxy').checked,
                url: document.getElementById('proxy-url').value.trim()
            },
            search: {
                enableRealAPI: document.getElementById('enable-real-api').checked,
                enableMockData: document.getElementById('enable-mock-data').checked,
                maxResultsPerSite: this.config.search.maxResultsPerSite,
                timeout: this.config.search.timeout
            },
            ui: this.config.ui
        };

        this.updateConfig(newConfig);

        // モーダルを閉じる
        const configModal = bootstrap.Modal.getInstance(document.getElementById('configModal'));
        configModal.hide();

        // 成功メッセージを表示
        if (window.shareManager) {
            window.shareManager.showToast('設定が保存されました', 'success');
        }
    }

    async checkAPIConnections() {
        const statusElement = document.getElementById('api-connection-status');
        statusElement.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>接続テスト中...';

        try {
            if (window.apiClient) {
                const status = await window.apiClient.checkAPIAvailability();
                
                let statusHTML = '<div class="mt-2">';
                Object.entries(status).forEach(([site, available]) => {
                    const badgeClass = available ? 'bg-success' : 'bg-danger';
                    const statusText = available ? '利用可能' : '利用不可';
                    statusHTML += `<span class="badge ${badgeClass} me-2">${site}: ${statusText}</span>`;
                });
                statusHTML += '</div>';
                
                statusElement.innerHTML = statusHTML;
                
                // メインページのAPI状態も更新
                this.updateAPIStatusIndicator(status);
            }
        } catch (error) {
            statusElement.innerHTML = '<div class="text-danger">接続テストに失敗しました</div>';
            console.error('API connection test failed:', error);
        }
    }

    updateAPIStatusIndicator(status) {
        Object.entries(status).forEach(([site, available]) => {
            const element = document.getElementById(`${site}-status`);
            if (element) {
                element.className = `badge ${available ? 'bg-success' : 'bg-danger'}`;
                element.textContent = `${site}: ${available ? '利用可能' : '利用不可'}`;
            }
        });

        // API状態表示を表示
        const apiStatusElement = document.getElementById('api-status');
        if (apiStatusElement && this.config.ui.showAPIStatus) {
            apiStatusElement.style.display = 'block';
        }
    }

    getConfig() {
        return this.config;
    }

    resetConfig() {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
        this.applyConfig();
    }
}

// 設定マネージャーのインスタンスを作成
let configManager;

document.addEventListener('DOMContentLoaded', () => {
    configManager = new ConfigManager();
    window.configManager = configManager;
});