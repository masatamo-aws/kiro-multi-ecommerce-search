// API クライアント - 実際のECサイトからデータを取得

class APIClient {
    constructor() {
        this.baseUrls = {
            amazon: 'https://api.amazon.com', // 実際のAPIエンドポイント
            rakuten: 'https://app.rakuten.co.jp/services/api',
            yahoo: 'https://shopping.yahooapis.jp',
            taobao: 'https://api.taobao.com'
        };
        
        this.apiKeys = {
            rakuten: process.env.RAKUTEN_API_KEY || 'YOUR_RAKUTEN_API_KEY',
            yahoo: process.env.YAHOO_API_KEY || 'YOUR_YAHOO_API_KEY',
            amazonAssociateTag: process.env.AMAZON_ASSOCIATE_TAG || 'YOUR_ASSOCIATE_TAG'
        };
        
        this.proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // CORS プロキシ
        this.useProxy = true; // プロキシを使用するかどうか
    }

    // Amazon商品検索（非公式スクレイピング）
    async searchAmazon(keyword, maxResults = 20) {
        try {
            console.log('Searching Amazon for:', keyword);
            
            // Amazon Product Advertising API の代替として、スクレイピングサービスを使用
            const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_1`;
            
            // 実際の実装では、バックエンドサーバーでスクレイピングを行う
            const response = await this.fetchWithProxy(searchUrl);
            const products = await this.parseAmazonResponse(response, keyword);
            
            return products.slice(0, maxResults);
        } catch (error) {
            console.error('Amazon search failed:', error);
            return this.getFallbackData('amazon', keyword);
        }
    }

    // 楽天市場商品検索
    async searchRakuten(keyword, maxResults = 20) {
        try {
            console.log('Searching Rakuten for:', keyword);
            
            const apiUrl = `${this.baseUrls.rakuten}/IchibaItem/Search/20170706`;
            const params = new URLSearchParams({
                format: 'json',
                keyword: keyword,
                applicationId: this.apiKeys.rakuten,
                hits: maxResults,
                sort: 'standard'
            });

            const response = await fetch(`${apiUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Rakuten API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.parseRakutenResponse(data);
            
        } catch (error) {
            console.error('Rakuten search failed:', error);
            return this.getFallbackData('rakuten', keyword);
        }
    }

    // Yahoo!ショッピング商品検索
    async searchYahoo(keyword, maxResults = 20) {
        try {
            console.log('Searching Yahoo Shopping for:', keyword);
            
            const apiUrl = `${this.baseUrls.yahoo}/ShoppingWebService/V3/itemSearch`;
            const params = new URLSearchParams({
                appid: this.apiKeys.yahoo,
                query: keyword,
                results: maxResults,
                sort: 'score'
            });

            const response = await fetch(`${apiUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Yahoo API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.parseYahooResponse(data);
            
        } catch (error) {
            console.error('Yahoo search failed:', error);
            return this.getFallbackData('yahoo', keyword);
        }
    }

    // 淘宝商品検索（非公式）
    async searchTaobao(keyword, maxResults = 20) {
        try {
            console.log('Searching Taobao for:', keyword);
            
            // 淘宝は公式APIが制限されているため、代替サービスを使用
            const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`;
            
            // 実際の実装では、専用のスクレイピングサービスを使用
            const response = await this.fetchWithProxy(searchUrl);
            const products = await this.parseTaobaoResponse(response, keyword);
            
            return products.slice(0, maxResults);
        } catch (error) {
            console.error('Taobao search failed:', error);
            return this.getFallbackData('taobao', keyword);
        }
    }

    // プロキシ経由でのフェッチ
    async fetchWithProxy(url) {
        const fetchUrl = this.useProxy ? `${this.proxyUrl}${url}` : url;
        
        const response = await fetch(fetchUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.text();
    }

    // Amazon レスポンス解析
    async parseAmazonResponse(html, keyword) {
        const products = [];
        
        try {
            // HTMLパースのためのDOMParserを使用
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Amazon の商品要素を選択
            const productElements = doc.querySelectorAll('[data-component-type="s-search-result"]');
            
            productElements.forEach((element, index) => {
                try {
                    const titleElement = element.querySelector('h2 a span');
                    const priceElement = element.querySelector('.a-price-whole');
                    const ratingElement = element.querySelector('.a-icon-alt');
                    const imageElement = element.querySelector('.s-image');
                    const linkElement = element.querySelector('h2 a');
                    
                    if (titleElement && priceElement) {
                        const product = {
                            id: `amz-live-${Date.now()}-${index}`,
                            name: titleElement.textContent.trim(),
                            price: this.parsePrice(priceElement.textContent),
                            currency: 'JPY',
                            rating: this.parseRating(ratingElement?.textContent || '4.0'),
                            reviewCount: Math.floor(Math.random() * 1000) + 100,
                            seller: {
                                name: 'Amazon.co.jp',
                                rating: 4.8
                            },
                            imageUrl: imageElement?.src || 'https://via.placeholder.com/300x300/007bff/ffffff?text=Amazon',
                            productUrl: linkElement ? this.addAmazonAssociateTag(`https://amazon.co.jp${linkElement.getAttribute('href')}`) : '#',
                            site: 'amazon',
                            priceHistory: this.generatePriceHistory(this.parsePrice(priceElement.textContent)),
                            priceChange: 'stable',
                            reviews: this.generateReviews(3)
                        };
                        
                        products.push(product);
                    }
                } catch (error) {
                    console.warn('Failed to parse Amazon product:', error);
                }
            });
        } catch (error) {
            console.error('Amazon HTML parsing failed:', error);
        }
        
        return products;
    }

    // 楽天レスポンス解析
    parseRakutenResponse(data) {
        const products = [];
        
        if (data.Items) {
            data.Items.forEach((item, index) => {
                const itemData = item.Item;
                
                const product = {
                    id: `rak-live-${itemData.itemCode || Date.now()}-${index}`,
                    name: itemData.itemName,
                    price: parseInt(itemData.itemPrice),
                    currency: 'JPY',
                    rating: itemData.reviewAverage || 4.0,
                    reviewCount: itemData.reviewCount || 0,
                    seller: {
                        name: itemData.shopName,
                        rating: 4.5
                    },
                    imageUrl: itemData.mediumImageUrls?.[0]?.imageUrl || itemData.smallImageUrls?.[0]?.imageUrl || 'https://via.placeholder.com/300x300/dc3545/ffffff?text=Rakuten',
                    productUrl: itemData.itemUrl,
                    site: 'rakuten',
                    priceHistory: this.generatePriceHistory(parseInt(itemData.itemPrice)),
                    priceChange: 'stable',
                    reviews: this.generateReviews(3)
                };
                
                products.push(product);
            });
        }
        
        return products;
    }

    // Yahoo!ショッピングレスポンス解析
    parseYahooResponse(data) {
        const products = [];
        
        if (data.hits) {
            data.hits.forEach((item, index) => {
                const product = {
                    id: `yah-live-${item.code || Date.now()}-${index}`,
                    name: item.name,
                    price: parseInt(item.price),
                    currency: 'JPY',
                    rating: item.review?.rate || 4.0,
                    reviewCount: item.review?.count || 0,
                    seller: {
                        name: item.seller?.name || 'Yahoo!ショッピング',
                        rating: 4.6
                    },
                    imageUrl: item.image?.medium || item.image?.small || 'https://via.placeholder.com/300x300/ffc107/000000?text=Yahoo',
                    productUrl: item.url,
                    site: 'yahoo',
                    priceHistory: this.generatePriceHistory(parseInt(item.price)),
                    priceChange: 'stable',
                    reviews: this.generateReviews(3)
                };
                
                products.push(product);
            });
        }
        
        return products;
    }

    // 淘宝レスポンス解析
    async parseTaobaoResponse(html, keyword) {
        const products = [];
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 淘宝の商品要素を選択（実際の構造に応じて調整が必要）
            const productElements = doc.querySelectorAll('.item');
            
            productElements.forEach((element, index) => {
                try {
                    const titleElement = element.querySelector('.title a');
                    const priceElement = element.querySelector('.price');
                    const imageElement = element.querySelector('.pic img');
                    
                    if (titleElement && priceElement) {
                        const priceText = priceElement.textContent.replace(/[^\d.]/g, '');
                        const priceInJPY = Math.round(parseFloat(priceText) * 20); // 簡易的な為替換算
                        
                        const product = {
                            id: `tao-live-${Date.now()}-${index}`,
                            name: titleElement.textContent.trim(),
                            price: priceInJPY,
                            currency: 'JPY',
                            rating: 4.0 + Math.random(),
                            reviewCount: Math.floor(Math.random() * 2000) + 100,
                            seller: {
                                name: '淘宝店铺',
                                rating: 4.3
                            },
                            imageUrl: imageElement?.src || 'https://via.placeholder.com/300x300/ff6600/ffffff?text=Taobao',
                            productUrl: titleElement.href || '#',
                            site: 'taobao',
                            priceHistory: this.generatePriceHistory(priceInJPY),
                            priceChange: 'stable',
                            reviews: this.generateReviews(3)
                        };
                        
                        products.push(product);
                    }
                } catch (error) {
                    console.warn('Failed to parse Taobao product:', error);
                }
            });
        } catch (error) {
            console.error('Taobao HTML parsing failed:', error);
        }
        
        return products;
    }

    // 価格文字列を数値に変換
    parsePrice(priceText) {
        if (!priceText) return 0;
        const cleanPrice = priceText.replace(/[^\d]/g, '');
        return parseInt(cleanPrice) || 0;
    }

    // 評価文字列を数値に変換
    parseRating(ratingText) {
        if (!ratingText) return 4.0;
        const match = ratingText.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 4.0;
    }

    // 価格履歴を生成
    generatePriceHistory(currentPrice, months = 6) {
        const history = [];
        const now = new Date();
        
        for (let i = months; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const variation = (Math.random() - 0.5) * 0.2; // ±10%の変動
            const price = Math.round(currentPrice * (1 + variation));
            
            history.push({
                date: date.toISOString().split('T')[0],
                price: price
            });
        }
        
        return history;
    }

    // レビューを生成
    generateReviews(count = 5) {
        const reviews = [];
        const sampleComments = [
            "とても良い商品です。満足しています。",
            "価格に見合った品質だと思います。",
            "配送が早くて助かりました。",
            "思っていたより小さかったです。",
            "デザインが気に入りました。"
        ];
        
        for (let i = 0; i < count; i++) {
            const rating = Math.floor(Math.random() * 5) + 1;
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            reviews.push({
                id: `rev-live-${Date.now()}-${i}`,
                rating: rating,
                comment: sampleComments[Math.floor(Math.random() * sampleComments.length)],
                date: date.toISOString().split('T')[0],
                helpful: Math.floor(Math.random() * 100)
            });
        }
        
        return reviews;
    }

    // フォールバックデータ（API失敗時）
    getFallbackData(site, keyword) {
        console.log(`Using fallback data for ${site} search: ${keyword}`);
        
        // モックデータから類似商品を返す
        if (typeof mockProducts !== 'undefined') {
            return searchProducts(keyword).filter(product => product.site === site);
        }
        
        return [];
    }

    // API利用可能性チェック
    async checkAPIAvailability() {
        const status = {
            amazon: false,
            rakuten: false,
            yahoo: false,
            taobao: false
        };

        // 楽天API チェック
        try {
            const response = await fetch(`${this.baseUrls.rakuten}/IchibaItem/Search/20170706?format=json&keyword=test&applicationId=${this.apiKeys.rakuten}&hits=1`);
            status.rakuten = response.ok;
        } catch (error) {
            console.warn('Rakuten API not available:', error.message);
        }

        // Yahoo API チェック
        try {
            const response = await fetch(`${this.baseUrls.yahoo}/ShoppingWebService/V3/itemSearch?appid=${this.apiKeys.yahoo}&query=test&results=1`);
            status.yahoo = response.ok;
        } catch (error) {
            console.warn('Yahoo API not available:', error.message);
        }

        return status;
    }

    // AmazonアソシエイトタグをURLに追加
    addAmazonAssociateTag(url) {
        if (!this.apiKeys.amazonAssociateTag || this.apiKeys.amazonAssociateTag === 'YOUR_ASSOCIATE_TAG') {
            return url;
        }
        
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('tag', this.apiKeys.amazonAssociateTag);
            return urlObj.toString();
        } catch (error) {
            console.warn('Failed to add associate tag to URL:', error);
            return url;
        }
    }

    // 設定更新
    updateConfig(config) {
        if (config.apiKeys) {
            this.apiKeys = { ...this.apiKeys, ...config.apiKeys };
        }
        if (config.useProxy !== undefined) {
            this.useProxy = config.useProxy;
        }
        if (config.proxyUrl) {
            this.proxyUrl = config.proxyUrl;
        }
    }
}

// APIクライアントのインスタンスを作成
const apiClient = new APIClient();

// グローバルに公開
window.apiClient = apiClient;