# マルチECサイト検索アプリケーション - 論理アーキテクチャ

## 概要

このドキュメントは、マルチECサイト検索アプリケーションの論理アーキテクチャを説明します。アプリケーションは、複数のECサイトから商品情報を取得し、統合された検索結果を提供するWebアプリケーションです。

## システム全体アーキテクチャ

```mermaid
graph TB
    subgraph "Client Browser"
        UI[User Interface]
        subgraph "Frontend Application"
            APP[App Manager]
            SEARCH[Search Manager]
            SORT[Sort Manager]
            THEME[Theme Manager]
            SHARE[Share Manager]
            REVIEW[Reviews Manager]
            CONFIG[Config Manager]
        end
        
        subgraph "Data Layer"
            CACHE[Local Cache]
            STORAGE[Local Storage]
            MOCK[Mock Data]
        end
    end
    
    subgraph "External Services"
        subgraph "Official APIs"
            RAKUTEN[楽天市場 API]
            YAHOO[Yahoo!ショッピング API]
        end
        
        subgraph "Scraping Services"
            AMAZON[Amazon Japan]
            TAOBAO[淘宝 Taobao]
        end
        
        subgraph "Third Party Services"
            KEEPA[Keepa Price Tracker]
            PROXY[CORS Proxy Server]
        end
    end
    
    UI --> APP
    APP --> SEARCH
    APP --> SORT
    APP --> THEME
    APP --> SHARE
    APP --> REVIEW
    APP --> CONFIG
    
    SEARCH --> CACHE
    SEARCH --> RAKUTEN
    SEARCH --> YAHOO
    SEARCH --> AMAZON
    SEARCH --> TAOBAO
    SEARCH --> MOCK
    
    CONFIG --> STORAGE
    THEME --> STORAGE
    SHARE --> STORAGE
    
    AMAZON --> PROXY
    TAOBAO --> PROXY
    REVIEW --> KEEPA
    
    style UI fill:#e1f5fe
    style APP fill:#f3e5f5
    style RAKUTEN fill:#c8e6c9
    style YAHOO fill:#c8e6c9
    style AMAZON fill:#ffecb3
    style TAOBAO fill:#ffecb3
```

## コンポーネント詳細アーキテクチャ

```mermaid
graph TB
    subgraph "Presentation Layer"
        HTML[HTML Templates]
        CSS[CSS Styles & Themes]
        BOOTSTRAP[Bootstrap UI Framework]
    end
    
    subgraph "Application Layer"
        subgraph "Core Managers"
            APP_MGR[App Manager<br/>- 初期化<br/>- エラーハンドリング<br/>- パフォーマンス監視]
            SEARCH_MGR[Search Manager<br/>- 検索実行<br/>- 結果統合<br/>- キャッシュ管理]
            SORT_MGR[Sort Manager<br/>- ソート処理<br/>- フィルタリング<br/>- 統計計算]
        end
        
        subgraph "UI Managers"
            THEME_MGR[Theme Manager<br/>- テーマ切り替え<br/>- 設定保存<br/>- アクセシビリティ]
            SHARE_MGR[Share Manager<br/>- URL生成<br/>- データ圧縮<br/>- ソーシャル共有]
            REVIEW_MGR[Reviews Manager<br/>- レビュー表示<br/>- 価格推移<br/>- Chart.js連携]
        end
        
        subgraph "Configuration"
            CONFIG_MGR[Config Manager<br/>- API設定<br/>- プロキシ設定<br/>- UI設定]
        end
    end
    
    subgraph "Data Access Layer"
        API_CLIENT[API Client<br/>- HTTP通信<br/>- レスポンス解析<br/>- エラーハンドリング]
        MOCK_DATA[Mock Data<br/>- テストデータ<br/>- フォールバック<br/>- 検索シミュレーション]
    end
    
    subgraph "Storage Layer"
        LOCAL_STORAGE[Local Storage<br/>- 設定保存<br/>- 検索履歴<br/>- キャッシュ]
        SESSION_CACHE[Session Cache<br/>- 検索結果<br/>- 一時データ<br/>- パフォーマンス向上]
    end
    
    HTML --> APP_MGR
    CSS --> THEME_MGR
    BOOTSTRAP --> HTML
    
    APP_MGR --> SEARCH_MGR
    APP_MGR --> SORT_MGR
    APP_MGR --> THEME_MGR
    APP_MGR --> SHARE_MGR
    APP_MGR --> REVIEW_MGR
    APP_MGR --> CONFIG_MGR
    
    SEARCH_MGR --> API_CLIENT
    SEARCH_MGR --> MOCK_DATA
    SEARCH_MGR --> SESSION_CACHE
    
    CONFIG_MGR --> LOCAL_STORAGE
    THEME_MGR --> LOCAL_STORAGE
    SHARE_MGR --> LOCAL_STORAGE
    
    API_CLIENT --> LOCAL_STORAGE
    
    style HTML fill:#e3f2fd
    style CSS fill:#e8f5e8
    style APP_MGR fill:#fff3e0
    style SEARCH_MGR fill:#fce4ec
    style API_CLIENT fill:#f1f8e9
```

## データフローアーキテクチャ

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant SearchMgr as Search Manager
    participant APIClient as API Client
    participant Cache
    participant ExternalAPI as External APIs
    participant MockData as Mock Data
    
    User->>UI: 検索キーワード入力
    UI->>SearchMgr: performSearch(keyword)
    
    SearchMgr->>Cache: checkCache(keyword)
    alt キャッシュヒット
        Cache-->>SearchMgr: cached results
    else キャッシュミス
        SearchMgr->>APIClient: searchWithAPI(keyword)
        SearchMgr->>MockData: searchWithMockData(keyword)
        
        par 並行API呼び出し
            APIClient->>ExternalAPI: 楽天API呼び出し
            APIClient->>ExternalAPI: Yahoo API呼び出し
            APIClient->>ExternalAPI: Amazon スクレイピング
            APIClient->>ExternalAPI: 淘宝 スクレイピング
        end
        
        ExternalAPI-->>APIClient: API responses
        APIClient-->>SearchMgr: API results
        MockData-->>SearchMgr: Mock results
        
        SearchMgr->>SearchMgr: mergeResults()
        SearchMgr->>Cache: saveToCache(results)
    end
    
    SearchMgr-->>UI: display results
    UI-->>User: 検索結果表示
```

## API統合アーキテクチャ

```mermaid
graph TB
    subgraph "API Integration Layer"
        API_CLIENT[API Client Controller]
        
        subgraph "Official API Handlers"
            RAKUTEN_HANDLER[Rakuten API Handler<br/>- 公式REST API<br/>- JSON レスポンス<br/>- レート制限: 1req/sec]
            YAHOO_HANDLER[Yahoo API Handler<br/>- 公式REST API<br/>- JSON レスポンス<br/>- レート制限: 50k/day]
        end
        
        subgraph "Scraping Handlers"
            AMAZON_HANDLER[Amazon Scraper<br/>- HTML解析<br/>- DOM操作<br/>- CORS プロキシ経由]
            TAOBAO_HANDLER[Taobao Scraper<br/>- HTML解析<br/>- 中国語処理<br/>- 為替換算]
        end
        
        subgraph "Data Processing"
            PARSER[Response Parser<br/>- データ正規化<br/>- 通貨統一<br/>- エラーハンドリング]
            VALIDATOR[Data Validator<br/>- スキーマ検証<br/>- データクリーニング<br/>- 品質チェック]
        end
    end
    
    subgraph "External Services"
        RAKUTEN_API[楽天ウェブサービス]
        YAHOO_API[Yahoo!ショッピングAPI]
        AMAZON_SITE[Amazon.co.jp]
        TAOBAO_SITE[Taobao.com]
        CORS_PROXY[CORS Proxy Server]
    end
    
    API_CLIENT --> RAKUTEN_HANDLER
    API_CLIENT --> YAHOO_HANDLER
    API_CLIENT --> AMAZON_HANDLER
    API_CLIENT --> TAOBAO_HANDLER
    
    RAKUTEN_HANDLER --> RAKUTEN_API
    YAHOO_HANDLER --> YAHOO_API
    AMAZON_HANDLER --> CORS_PROXY
    TAOBAO_HANDLER --> CORS_PROXY
    
    CORS_PROXY --> AMAZON_SITE
    CORS_PROXY --> TAOBAO_SITE
    
    RAKUTEN_HANDLER --> PARSER
    YAHOO_HANDLER --> PARSER
    AMAZON_HANDLER --> PARSER
    TAOBAO_HANDLER --> PARSER
    
    PARSER --> VALIDATOR
    
    style RAKUTEN_HANDLER fill:#c8e6c9
    style YAHOO_HANDLER fill:#c8e6c9
    style AMAZON_HANDLER fill:#ffecb3
    style TAOBAO_HANDLER fill:#ffecb3
    style CORS_PROXY fill:#ffcdd2
```

## 状態管理アーキテクチャ

```mermaid
stateDiagram-v2
    [*] --> Initializing
    
    Initializing --> Ready: 初期化完了
    Initializing --> Error: 初期化失敗
    
    Ready --> Searching: 検索開始
    Ready --> Configuring: 設定変更
    Ready --> Sharing: 共有機能
    
    Searching --> Loading: API呼び出し中
    Loading --> Processing: データ処理中
    Processing --> Displaying: 結果表示
    Processing --> Error: 処理エラー
    
    Displaying --> Ready: 検索完了
    Displaying --> Sorting: ソート実行
    Displaying --> Filtering: フィルタ適用
    
    Sorting --> Displaying: ソート完了
    Filtering --> Displaying: フィルタ完了
    
    Configuring --> Ready: 設定保存
    Sharing --> Ready: 共有完了
    
    Error --> Ready: エラー回復
    Error --> [*]: アプリ終了
```

## セキュリティアーキテクチャ

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Input Validation"
            XSS[XSS Protection<br/>- HTML エスケープ<br/>- サニタイゼーション<br/>- CSP ヘッダー]
            CSRF[CSRF Protection<br/>- トークン検証<br/>- Origin チェック<br/>- SameSite Cookie]
        end
        
        subgraph "Data Protection"
            ENCRYPTION[Data Encryption<br/>- API キー暗号化<br/>- ローカルストレージ保護<br/>- 機密データマスキング]
            VALIDATION[Data Validation<br/>- スキーマ検証<br/>- 型チェック<br/>- 範囲検証]
        end
        
        subgraph "Network Security"
            HTTPS[HTTPS Enforcement<br/>- SSL/TLS 通信<br/>- 証明書検証<br/>- セキュア接続]
            CORS[CORS Policy<br/>- オリジン制限<br/>- プリフライト対応<br/>- ヘッダー検証]
        end
        
        subgraph "API Security"
            AUTH[API Authentication<br/>- キー管理<br/>- トークン更新<br/>- 権限制御]
            RATE[Rate Limiting<br/>- リクエスト制限<br/>- 過負荷防止<br/>- エラーハンドリング]
        end
    end
    
    subgraph "External Threats"
        MALICIOUS[悪意のある入力]
        INJECTION[インジェクション攻撃]
        MITM[中間者攻撃]
        DDOS[DDoS攻撃]
    end
    
    MALICIOUS --> XSS
    INJECTION --> CSRF
    MITM --> HTTPS
    DDOS --> RATE
    
    XSS --> VALIDATION
    CSRF --> ENCRYPTION
    HTTPS --> CORS
    CORS --> AUTH
    
    style XSS fill:#ffcdd2
    style CSRF fill:#ffcdd2
    style ENCRYPTION fill:#c8e6c9
    style HTTPS fill:#e1f5fe
```

## パフォーマンス最適化アーキテクチャ

```mermaid
graph TB
    subgraph "Performance Optimization"
        subgraph "Caching Strategy"
            MEMORY[Memory Cache<br/>- 検索結果<br/>- API レスポンス<br/>- 計算結果]
            BROWSER[Browser Cache<br/>- 静的リソース<br/>- 画像ファイル<br/>- CSS/JS]
            LOCAL[Local Storage<br/>- 設定データ<br/>- 検索履歴<br/>- ユーザー設定]
        end
        
        subgraph "Loading Optimization"
            LAZY[Lazy Loading<br/>- 画像遅延読み込み<br/>- コンポーネント分割<br/>- 動的インポート]
            COMPRESS[Data Compression<br/>- JSON圧縮<br/>- 画像最適化<br/>- Gzip圧縮]
            CDN[CDN Integration<br/>- Bootstrap CDN<br/>- Font Awesome CDN<br/>- Chart.js CDN]
        end
        
        subgraph "Execution Optimization"
            ASYNC[Async Processing<br/>- 並行API呼び出し<br/>- Promise.allSettled<br/>- Web Workers]
            DEBOUNCE[Debouncing<br/>- 検索入力<br/>- リサイズイベント<br/>- スクロールイベント]
            VIRTUAL[Virtual Scrolling<br/>- 大量データ対応<br/>- DOM最適化<br/>- メモリ効率]
        end
    end
    
    subgraph "Monitoring"
        PERF[Performance Monitor<br/>- 読み込み時間<br/>- メモリ使用量<br/>- API応答時間]
        ERROR[Error Tracking<br/>- エラーログ<br/>- 例外処理<br/>- 復旧処理]
    end
    
    MEMORY --> ASYNC
    BROWSER --> CDN
    LOCAL --> DEBOUNCE
    
    LAZY --> VIRTUAL
    COMPRESS --> LAZY
    CDN --> COMPRESS
    
    ASYNC --> PERF
    DEBOUNCE --> ERROR
    VIRTUAL --> PERF
    
    style MEMORY fill:#e8f5e8
    style ASYNC fill:#fff3e0
    style PERF fill:#e3f2fd
```

## 技術スタック詳細

### フロントエンド技術
- **HTML5**: セマンティックマークアップ、アクセシビリティ対応
- **CSS3**: Flexbox、Grid、カスタムプロパティ、メディアクエリ
- **JavaScript (ES6+)**: モジュール、Promise、async/await、クラス構文
- **Bootstrap 5**: レスポンシブUI、コンポーネント、ユーティリティ
- **Chart.js**: 価格推移グラフ、データ可視化
- **Font Awesome**: アイコンフォント、UI装飾

### データ管理
- **LocalStorage**: 設定データ、検索履歴の永続化
- **SessionStorage**: 一時的なキャッシュデータ
- **Memory Cache**: 高速アクセス用インメモリキャッシュ

### 外部連携
- **REST API**: 楽天、Yahoo!の公式API
- **Web Scraping**: Amazon、淘宝のデータ取得
- **CORS Proxy**: クロスオリジン制限の回避
- **Keepa API**: Amazon価格追跡サービス

## アーキテクチャの特徴

### 1. **モジュラー設計**
- 各機能を独立したマネージャークラスで実装
- 疎結合な設計により保守性を向上
- 機能追加・変更時の影響範囲を最小化

### 2. **ハイブリッドデータ取得**
- 公式APIとスクレイピングの併用
- フォールバック機能による可用性確保
- モックデータによる開発・テスト支援

### 3. **パフォーマンス重視**
- 並行処理による高速検索
- 多層キャッシュによる応答性向上
- 遅延読み込みによるリソース最適化

### 4. **ユーザビリティ**
- レスポンシブデザイン
- アクセシビリティ対応
- 直感的なUI/UX

### 5. **拡張性**
- 新しいECサイトの追加が容易
- 機能拡張のためのフック機能
- 設定可能なアーキテクチャ

## 今後の拡張計画

### 短期的改善
- Web Workers による重い処理の分離
- Service Worker によるオフライン対応
- Progressive Web App (PWA) 化

### 中期的改善
- バックエンドAPI の構築
- データベース連携
- ユーザー認証機能

### 長期的改善
- マイクロサービス化
- クラウドネイティブ対応
- AI/ML による推薦機能