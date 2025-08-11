# マルチECサイト検索アプリケーション - 設計書

## システム構成

### ハイブリッドアーキテクチャ
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Frontend      │  │   API Client    │  │   Config Mgr    │ │
│  │   (SPA)         │◄─┤   (Hybrid)      │◄─┤   (Settings)    │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                     │                     │        │
│           ▼                     ▼                     ▼        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Local Storage  │  │  Session Cache  │  │   Mock Data     │ │
│  │  (Settings)     │  │  (Results)      │  │  (Fallback)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                External Services                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Official APIs  │  │  Scraping APIs  │  │  Third Party    │ │
│  │  楽天・Yahoo!   │  │  Amazon・淘宝   │  │  Keepa・Proxy   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 技術スタック詳細
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.0
- **Charts**: Chart.js 4.x (価格推移グラフ)
- **Icons**: Font Awesome 6.4.0
- **Storage**: LocalStorage, SessionStorage
- **API Integration**: Fetch API, CORS Proxy
- **Build Tools**: なし（Pure Frontend）

## ファイル構成
```
kiro-multi-ecommerce-search/
├── index.html                    # メインページ
├── css/
│   ├── styles.css               # メインスタイル・レスポンシブ
│   └── themes.css               # ライト/ダークテーマ定義
├── js/
│   ├── app.js                   # メインアプリケーション・初期化
│   ├── api-client.js            # API連携・HTTP通信
│   ├── config.js                # 設定管理・API設定UI
│   ├── search.js                # 検索機能・ハイブリッド検索
│   ├── sort.js                  # ソート・フィルタリング機能
│   ├── theme.js                 # テーマ切り替え・アクセシビリティ
│   ├── share.js                 # 共有機能・URL生成
│   └── reviews.js               # レビュー・価格推移表示
├── data/
│   └── mock-data.js             # モックデータ・フォールバック
├── assets/
│   └── images/                  # スクリーンショット・画像
│       ├── Light Mode.png       # ライトモードスクリーンショット
│       └── Dark Mode.png        # ダークモードスクリーンショット
├── .env.example                 # 環境変数設定例
├── requirements.md              # 要件定義書
├── design.md                    # 設計書
├── tasks.md                     # タスク管理
├── logicalarchitecture.md       # 論理アーキテクチャ
├── SCREENSHOT_GUIDE.md          # スクリーンショット撮影ガイド
├── README.md                    # プロジェクト説明
└── CHANGELOG.md                 # 変更履歴
```

## データ構造

### 商品データモデル（拡張版）
```javascript
{
  id: string,                    // 商品ID（サイト別プレフィックス付き）
  name: string,                  // 商品名
  price: number,                 // 価格（JPY統一）
  currency: string,              // 通貨コード（'JPY'）
  rating: number,                // 評価（1-5）
  reviewCount: number,           // レビュー数
  seller: {
    name: string,                // 出品者名
    rating: number               // 出品者評価
  },
  imageUrl: string,              // 商品画像URL
  productUrl: string,            // 商品ページURL（アソシエイトタグ付き）
  site: string,                  // ECサイト識別子
  priceHistory: [               // 価格履歴（Chart.js用）
    {
      date: string,              // 日付（ISO形式）
      price: number              // その時点の価格
    }
  ],
  priceChange: string,          // 価格変動（'up'/'down'/'stable'）
  reviews: [                    // レビューデータ
    {
      id: string,                // レビューID
      rating: number,            // 評価
      comment: string,           // コメント
      date: string,              // 投稿日
      helpful: number            // 参考になった数
    }
  ],
  dataSource: string            // データソース（'api'/'mock'）
}
```

### 検索結果データモデル（拡張版）
```javascript
{
  keyword: string,              // 検索キーワード
  timestamp: string,            // 検索実行時刻
  results: [Product],           // 商品リスト
  totalCount: number,           // 総件数
  sortBy: string,               // ソート基準
  sortOrder: string,            // ソート順序
  apiStatus: {                  // API呼び出し状態
    amazon: boolean,
    rakuten: boolean,
    yahoo: boolean,
    taobao: boolean
  },
  statistics: {                 // 検索結果統計
    priceRange: {
      min: number,
      max: number,
      avg: number
    },
    ratingRange: {
      min: number,
      max: number,
      avg: number
    },
    siteDistribution: Object    // サイト別件数
  }
}
```

### 設定データモデル
```javascript
{
  apiKeys: {
    rakuten: string,            // 楽天APIキー
    yahoo: string,              // Yahoo!APIキー
    amazonAssociateTag: string  // Amazonアソシエイトタグ
  },
  proxy: {
    enabled: boolean,           // プロキシ使用フラグ
    url: string                 // プロキシURL
  },
  search: {
    enableRealAPI: boolean,     // 実際のAPI使用フラグ
    enableMockData: boolean,    // モックデータ使用フラグ
    maxResultsPerSite: number,  // サイト別最大取得件数
    timeout: number             // タイムアウト時間
  },
  ui: {
    showAPIStatus: boolean,     // API状態表示フラグ
    showDataSource: boolean,    // データソース表示フラグ
    theme: string,              // テーマ（'light'/'dark'）
    enableAnimations: boolean   // アニメーション有効フラグ
  }
}
```

## UI/UX設計

### レイアウト構成（詳細版）
1. **ヘッダー（レスポンシブ対応）**
   - アプリタイトル（白色統一）
   - ハンバーガーメニュー（モバイル）
   - テーマ切り替えボタン（ライト/ダーク）
   - 設定ボタン（API設定）

2. **検索セクション**
   - 検索入力フィールド（デバウンス処理）
   - 検索ボタン（アイコン + テキスト）
   - ソートオプション（9種類のソート）
   - 共有ボタン（URL生成）

3. **API状態表示**
   - 各ECサイトの接続状態
   - データソース識別
   - 接続テスト機能

4. **結果表示セクション**
   - 商品カードグリッド（レスポンシブ）
   - ローディング表示
   - エラーメッセージ
   - 統計情報表示

5. **商品カード（拡張版）**
   - 商品画像（遅延読み込み）
   - 商品名（2行表示）
   - 価格（通貨統一）
   - 評価（星表示 + 数値）
   - ECサイトバッジ（カラー識別）
   - データソースバッジ（LIVE/DEMO）
   - 価格変動インジケーター
   - アクションボタン群
     - 商品ページリンク
     - 価格推移表示
     - レビュー表示

6. **モーダル群**
   - 価格推移モーダル（Chart.js）
   - レビューモーダル（ソート機能付き）
   - 共有モーダル（URL生成）
   - 設定モーダル（API設定）

### レスポンシブデザイン（詳細版）
- **デスクトップ（1200px+）**: 4列グリッド、フルテキスト表示
- **ラージタブレット（992-1199px）**: 3列グリッド、テキスト維持
- **タブレット（768-991px）**: 2列グリッド、テキスト一部省略
- **モバイル（576-767px）**: 2列グリッド、アイコンメイン
- **小型モバイル（-575px）**: 1列グリッド、最小限UI

### カラーパレット
```css
/* ライトテーマ */
--primary: #0d6efd;
--secondary: #6c757d;
--success: #198754;
--warning: #ffc107;
--danger: #dc3545;
--info: #0dcaf0;

/* ダークテーマ */
--bg-primary: #1a1a1a;
--bg-secondary: #2d2d2d;
--text-primary: #ffffff;
--text-secondary: #b0b0b0;
```

### タイポグラフィ
- **フォント**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **見出し**: 600 weight, 1.5rem
- **本文**: 400 weight, 1rem
- **小文字**: 400 weight, 0.875rem

## API設計

### ハイブリッド検索API
```javascript
// 実際のAPI + モックデータの併用検索
async function executeSearch(keyword) {
  const searchPromises = [
    searchWithAPI(keyword),      // 実際のAPI呼び出し
    searchWithMockData(keyword)  // モックデータ検索
  ];
  
  const [apiResults, mockResults] = await Promise.allSettled(searchPromises);
  
  // 結果をマージ（API優先、モックで補完）
  return mergeResults(apiResults.value, mockResults.value);
}

// 並行API呼び出し
async function searchWithAPI(keyword) {
  const promises = [
    apiClient.searchAmazon(keyword, 5),   // スクレイピング
    apiClient.searchRakuten(keyword, 5),  // 公式API
    apiClient.searchYahoo(keyword, 5),    // 公式API
    apiClient.searchTaobao(keyword, 5)    // スクレイピング
  ];
  
  const results = await Promise.allSettled(promises);
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
}
```

### API統合レイヤー
```javascript
class APIClient {
  // 楽天市場API（公式）
  async searchRakuten(keyword, maxResults) {
    const response = await fetch(`${this.baseUrls.rakuten}/IchibaItem/Search/20170706`, {
      method: 'GET',
      params: {
        format: 'json',
        keyword: keyword,
        applicationId: this.apiKeys.rakuten,
        hits: maxResults
      }
    });
    return this.parseRakutenResponse(await response.json());
  }
  
  // Yahoo!ショッピングAPI（公式）
  async searchYahoo(keyword, maxResults) {
    const response = await fetch(`${this.baseUrls.yahoo}/ShoppingWebService/V3/itemSearch`, {
      method: 'GET',
      params: {
        appid: this.apiKeys.yahoo,
        query: keyword,
        results: maxResults
      }
    });
    return this.parseYahooResponse(await response.json());
  }
  
  // Amazon（スクレイピング）
  async searchAmazon(keyword, maxResults) {
    const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}`;
    const html = await this.fetchWithProxy(searchUrl);
    return this.parseAmazonResponse(html, keyword);
  }
  
  // 淘宝（スクレイピング）
  async searchTaobao(keyword, maxResults) {
    const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`;
    const html = await this.fetchWithProxy(searchUrl);
    return this.parseTaobaoResponse(html, keyword);
  }
}
```

### 拡張ソート機能
```javascript
const sortOptions = {
  'relevance': (a, b) => 0,                              // 関連度順（元順序維持）
  'price-asc': (a, b) => a.price - b.price,             // 価格昇順
  'price-desc': (a, b) => b.price - a.price,            // 価格降順
  'rating-desc': (a, b) => b.rating - a.rating,         // 評価降順
  'rating-asc': (a, b) => a.rating - b.rating,          // 評価昇順
  'review-count-desc': (a, b) => b.reviewCount - a.reviewCount,     // レビュー数降順
  'review-count-asc': (a, b) => a.reviewCount - b.reviewCount,      // レビュー数昇順
  'seller-rating-desc': (a, b) => b.seller.rating - a.seller.rating, // 出品者評価降順
  'seller-rating-asc': (a, b) => a.seller.rating - b.seller.rating,  // 出品者評価昇順
  'price-drop': (a, b) => getPriceChangeScore(b) - getPriceChangeScore(a) // 価格下落順
};

// 価格変動スコア計算
function getPriceChangeScore(product) {
  if (!product.priceHistory || product.priceHistory.length < 2) return 0;
  
  const history = product.priceHistory;
  const current = history[history.length - 1].price;
  const previous = history[history.length - 2].price;
  
  return (previous - current) / previous; // 下落率
}
```

### データ変換・正規化
```javascript
// レスポンス正規化
function normalizeProduct(rawProduct, site) {
  return {
    id: `${site}-${rawProduct.id || Date.now()}`,
    name: sanitizeHtml(rawProduct.name),
    price: convertToJPY(rawProduct.price, rawProduct.currency),
    currency: 'JPY',
    rating: normalizeRating(rawProduct.rating),
    reviewCount: parseInt(rawProduct.reviewCount) || 0,
    seller: {
      name: sanitizeHtml(rawProduct.seller?.name || 'Unknown'),
      rating: normalizeRating(rawProduct.seller?.rating || 4.0)
    },
    imageUrl: validateImageUrl(rawProduct.imageUrl),
    productUrl: addTrackingParams(rawProduct.productUrl, site),
    site: site,
    priceHistory: generatePriceHistory(rawProduct.price),
    priceChange: calculatePriceChange(rawProduct.priceHistory),
    reviews: normalizeReviews(rawProduct.reviews || []),
    dataSource: 'api'
  };
}
```

## セキュリティ設計

### 多層防御アーキテクチャ
```javascript
// 入力検証・サニタイゼーション
function sanitizeInput(input) {
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    })
    .trim()
    .substring(0, 1000); // 長さ制限
}

// APIキー暗号化保存
function saveAPIKey(key, value) {
  const encrypted = btoa(value); // 簡易暗号化
  localStorage.setItem(`api_${key}`, encrypted);
}
```

### CORS・プロキシ対策
- **CORS Proxy**: `https://cors-anywhere.herokuapp.com/`
- **Origin検証**: 許可されたドメインからのアクセスのみ
- **Referer検証**: 適切なリファラーヘッダーの確認

### データ保護
- **APIキー**: Base64エンコード + LocalStorage
- **検索履歴**: 個人情報を含まない商品情報のみ
- **キャッシュ**: セッション終了時の自動削除

## パフォーマンス最適化設計

### 多層キャッシュ戦略
```javascript
class CacheManager {
  constructor() {
    this.memoryCache = new Map();     // インメモリキャッシュ
    this.sessionCache = sessionStorage; // セッションキャッシュ
    this.persistentCache = localStorage; // 永続キャッシュ
  }
  
  // 階層的キャッシュ取得
  get(key) {
    return this.memoryCache.get(key) || 
           JSON.parse(this.sessionCache.getItem(key)) ||
           JSON.parse(this.persistentCache.getItem(key));
  }
}
```

### 非同期処理最適化
- **Promise.allSettled**: 一部API失敗時の継続処理
- **Web Workers**: 重い計算処理の分離（将来実装）
- **Intersection Observer**: 画像遅延読み込み
- **Debounce**: 検索入力の最適化（300ms）

### リソース最適化
- **CDN活用**: Bootstrap、Chart.js、Font Awesome
- **画像最適化**: WebP対応、適切なサイズ指定
- **コード分割**: 機能別モジュール化
- **圧縮**: Gzip圧縮対応

## 国際化・アクセシビリティ設計

### 多言語対応（将来実装）
```javascript
const i18n = {
  ja: {
    search: '検索',
    sort: '並び替え',
    price: '価格'
  },
  en: {
    search: 'Search',
    sort: 'Sort',
    price: 'Price'
  },
  zh: {
    search: '搜索',
    sort: '排序',
    price: '价格'
  }
};
```

### アクセシビリティ対応
- **ARIA属性**: 適切なロール・ラベル設定
- **キーボードナビゲーション**: Tab順序の最適化
- **スクリーンリーダー**: 代替テキスト・説明文
- **色覚対応**: 色以外の情報伝達手段
- **動き軽減**: `prefers-reduced-motion` 対応

### 通貨・地域対応
- **通貨統一**: 全て日本円（JPY）表示
- **為替換算**: 淘宝商品の人民元→円変換
- **数値フォーマット**: 地域別桁区切り対応

## テスト設計

### テスト戦略
```javascript
// 単体テスト例
describe('SearchManager', () => {
  test('should search products with keyword', async () => {
    const manager = new SearchManager();
    const results = await manager.performSearch('iPhone');
    expect(results).toHaveLength.greaterThan(0);
    expect(results[0]).toHaveProperty('name');
  });
});

// 統合テスト例
describe('API Integration', () => {
  test('should handle API failures gracefully', async () => {
    const client = new APIClient();
    const results = await client.searchRakuten('invalid-key-test');
    expect(results).toEqual([]); // フォールバック動作
  });
});
```

### テスト環境
- **ユニットテスト**: Jest（将来導入）
- **E2Eテスト**: Playwright（将来導入）
- **手動テスト**: 各ブラウザでの動作確認
- **パフォーマンステスト**: Lighthouse監査

### テストデータ
- **モックAPI**: 安定したテストデータ
- **エラーシナリオ**: ネットワーク障害・API制限
- **境界値テスト**: 大量データ・空データ処理

## 運用・保守設計

### 監視・ログ
```javascript
// エラー監視
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    timestamp: new Date().toISOString()
  });
});

// パフォーマンス監視
function monitorPerformance() {
  const navigation = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart);
}
```

### 設定管理
- **環境別設定**: 開発・本番環境の切り替え
- **機能フラグ**: 新機能の段階的リリース
- **A/Bテスト**: UI改善の効果測定（将来実装）

### 更新・デプロイ
- **静的ホスティング**: GitHub Pages、Netlify対応
- **CDN配信**: 高速コンテンツ配信
- **キャッシュ戦略**: 適切なCache-Controlヘッダー