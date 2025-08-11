// モックデータ

const mockProducts = {
    "iPhone": [
        {
            id: "amz-001",
            name: "Apple iPhone 15 Pro 128GB ナチュラルチタニウム",
            price: 159800,
            currency: "JPY",
            rating: 4.5,
            reviewCount: 1234,
            seller: {
                name: "Amazon.co.jp",
                rating: 4.8
            },
            imageUrl: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone+15+Pro",
            productUrl: "https://amazon.co.jp/dp/example1",
            site: "amazon",
            priceHistory: [
                { date: "2024-08-01", price: 165000 },
                { date: "2024-09-01", price: 162000 },
                { date: "2024-10-01", price: 160000 },
                { date: "2024-11-01", price: 159800 },
                { date: "2024-12-01", price: 159800 },
                { date: "2025-01-01", price: 159800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-001",
                    rating: 5,
                    comment: "カメラの性能が素晴らしく、バッテリーも長持ちします。",
                    date: "2024-12-15",
                    helpful: 45
                },
                {
                    id: "rev-002",
                    rating: 4,
                    comment: "デザインは良いですが、価格が高いです。",
                    date: "2024-12-10",
                    helpful: 23
                }
            ]
        },
        {
            id: "rak-001",
            name: "【楽天モバイル公式】iPhone 15 Pro 128GB",
            price: 157800,
            currency: "JPY",
            rating: 4.3,
            reviewCount: 892,
            seller: {
                name: "楽天モバイル公式",
                rating: 4.6
            },
            imageUrl: "https://via.placeholder.com/300x300/dc3545/ffffff?text=iPhone+15+Pro",
            productUrl: "https://item.rakuten.co.jp/example1",
            site: "rakuten",
            priceHistory: [
                { date: "2024-08-01", price: 162000 },
                { date: "2024-09-01", price: 160000 },
                { date: "2024-10-01", price: 158000 },
                { date: "2024-11-01", price: 157800 },
                { date: "2024-12-01", price: 157800 },
                { date: "2025-01-01", price: 157800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-003",
                    rating: 5,
                    comment: "楽天ポイントが貯まってお得でした。",
                    date: "2024-12-12",
                    helpful: 67
                }
            ]
        },
        {
            id: "yah-001",
            name: "iPhone 15 Pro 128GB SIMフリー",
            price: 161200,
            currency: "JPY",
            rating: 4.4,
            reviewCount: 567,
            seller: {
                name: "ソフトバンクセレクション",
                rating: 4.7
            },
            imageUrl: "https://via.placeholder.com/300x300/ffc107/000000?text=iPhone+15+Pro",
            productUrl: "https://shopping.yahoo.co.jp/example1",
            site: "yahoo",
            priceHistory: [
                { date: "2024-08-01", price: 165000 },
                { date: "2024-09-01", price: 163000 },
                { date: "2024-10-01", price: 162000 },
                { date: "2024-11-01", price: 161200 },
                { date: "2024-12-01", price: 161200 },
                { date: "2025-01-01", price: 161200 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-004",
                    rating: 4,
                    comment: "配送が早くて良かったです。",
                    date: "2024-12-08",
                    helpful: 34
                }
            ]
        },
        {
            id: "tao-001",
            name: "苹果iPhone 15 Pro 128GB 原色钛金属",
            price: 142000,
            currency: "JPY",
            rating: 4.2,
            reviewCount: 2341,
            seller: {
                name: "Apple官方旗舰店",
                rating: 4.9
            },
            imageUrl: "https://via.placeholder.com/300x300/ff6600/ffffff?text=iPhone+15+Pro",
            productUrl: "https://taobao.com/example1",
            site: "taobao",
            priceHistory: [
                { date: "2024-08-01", price: 145000 },
                { date: "2024-09-01", price: 144000 },
                { date: "2024-10-01", price: 143000 },
                { date: "2024-11-01", price: 142000 },
                { date: "2024-12-01", price: 142000 },
                { date: "2025-01-01", price: 142000 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-005",
                    rating: 5,
                    comment: "正品，价格便宜，物流很快。",
                    date: "2024-12-14",
                    helpful: 156
                }
            ]
        }
    ],
    "ノートパソコン": [
        {
            id: "amz-002",
            name: "MacBook Air M2 13インチ 8GB 256GB",
            price: 164800,
            currency: "JPY",
            rating: 4.6,
            reviewCount: 2156,
            seller: {
                name: "Amazon.co.jp",
                rating: 4.8
            },
            imageUrl: "https://via.placeholder.com/300x300/007bff/ffffff?text=MacBook+Air",
            productUrl: "https://amazon.co.jp/dp/example2",
            site: "amazon",
            priceHistory: [
                { date: "2024-08-01", price: 168000 },
                { date: "2024-09-01", price: 167000 },
                { date: "2024-10-01", price: 166000 },
                { date: "2024-11-01", price: 165000 },
                { date: "2024-12-01", price: 164800 },
                { date: "2025-01-01", price: 164800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-006",
                    rating: 5,
                    comment: "軽くて性能も良く、バッテリーが長持ちします。",
                    date: "2024-12-16",
                    helpful: 89
                }
            ]
        },
        {
            id: "rak-002",
            name: "【Apple公式】MacBook Air M2チップ搭載",
            price: 162800,
            currency: "JPY",
            rating: 4.5,
            reviewCount: 1834,
            seller: {
                name: "Apple公式楽天市場店",
                rating: 4.9
            },
            imageUrl: "https://via.placeholder.com/300x300/dc3545/ffffff?text=MacBook+Air",
            productUrl: "https://item.rakuten.co.jp/example2",
            site: "rakuten",
            priceHistory: [
                { date: "2024-08-01", price: 166000 },
                { date: "2024-09-01", price: 165000 },
                { date: "2024-10-01", price: 164000 },
                { date: "2024-11-01", price: 163000 },
                { date: "2024-12-01", price: 162800 },
                { date: "2025-01-01", price: 162800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-007",
                    rating: 4,
                    comment: "楽天ポイントが付いてお得でした。",
                    date: "2024-12-13",
                    helpful: 56
                }
            ]
        }
    ],
    "ワイヤレスイヤホン": [
        {
            id: "amz-003",
            name: "Apple AirPods Pro (第2世代)",
            price: 39800,
            currency: "JPY",
            rating: 4.7,
            reviewCount: 3456,
            seller: {
                name: "Amazon.co.jp",
                rating: 4.8
            },
            imageUrl: "https://via.placeholder.com/300x300/007bff/ffffff?text=AirPods+Pro",
            productUrl: "https://amazon.co.jp/dp/example3",
            site: "amazon",
            priceHistory: [
                { date: "2024-08-01", price: 42000 },
                { date: "2024-09-01", price: 41000 },
                { date: "2024-10-01", price: 40500 },
                { date: "2024-11-01", price: 40000 },
                { date: "2024-12-01", price: 39800 },
                { date: "2025-01-01", price: 39800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-008",
                    rating: 5,
                    comment: "ノイズキャンセリングが素晴らしいです。",
                    date: "2024-12-17",
                    helpful: 123
                }
            ]
        },
        {
            id: "rak-003",
            name: "Sony WF-1000XM4 ワイヤレスノイズキャンセリングイヤホン",
            price: 28800,
            currency: "JPY",
            rating: 4.4,
            reviewCount: 2789,
            seller: {
                name: "ソニーストア楽天市場店",
                rating: 4.7
            },
            imageUrl: "https://via.placeholder.com/300x300/dc3545/ffffff?text=Sony+WF-1000XM4",
            productUrl: "https://item.rakuten.co.jp/example3",
            site: "rakuten",
            priceHistory: [
                { date: "2024-08-01", price: 32000 },
                { date: "2024-09-01", price: 31000 },
                { date: "2024-10-01", price: 30000 },
                { date: "2024-11-01", price: 29500 },
                { date: "2024-12-01", price: 28800 },
                { date: "2025-01-01", price: 28800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-009",
                    rating: 4,
                    comment: "音質が良く、装着感も快適です。",
                    date: "2024-12-11",
                    helpful: 78
                }
            ]
        }
    ],
    "スマートウォッチ": [
        {
            id: "amz-004",
            name: "Apple Watch Series 9 GPS 45mm",
            price: 59800,
            currency: "JPY",
            rating: 4.6,
            reviewCount: 1567,
            seller: {
                name: "Amazon.co.jp",
                rating: 4.8
            },
            imageUrl: "https://via.placeholder.com/300x300/007bff/ffffff?text=Apple+Watch",
            productUrl: "https://amazon.co.jp/dp/example4",
            site: "amazon",
            priceHistory: [
                { date: "2024-08-01", price: 62000 },
                { date: "2024-09-01", price: 61000 },
                { date: "2024-10-01", price: 60500 },
                { date: "2024-11-01", price: 60000 },
                { date: "2024-12-01", price: 59800 },
                { date: "2025-01-01", price: 59800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-010",
                    rating: 5,
                    comment: "健康管理機能が充実していて満足です。",
                    date: "2024-12-18",
                    helpful: 92
                }
            ]
        }
    ],
    "タブレット": [
        {
            id: "amz-005",
            name: "iPad Air 第5世代 Wi-Fi 64GB",
            price: 92800,
            currency: "JPY",
            rating: 4.7,
            reviewCount: 2234,
            seller: {
                name: "Amazon.co.jp",
                rating: 4.8
            },
            imageUrl: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPad+Air",
            productUrl: "https://amazon.co.jp/dp/example5",
            site: "amazon",
            priceHistory: [
                { date: "2024-08-01", price: 95000 },
                { date: "2024-09-01", price: 94000 },
                { date: "2024-10-01", price: 93500 },
                { date: "2024-11-01", price: 93000 },
                { date: "2024-12-01", price: 92800 },
                { date: "2025-01-01", price: 92800 }
            ],
            priceChange: "down",
            reviews: [
                {
                    id: "rev-011",
                    rating: 5,
                    comment: "画面が綺麗で動作もサクサクです。",
                    date: "2024-12-19",
                    helpful: 156
                }
            ]
        }
    ]
};

// サイト情報
const siteInfo = {
    amazon: {
        name: "Amazon Japan",
        logo: "fab fa-amazon",
        color: "#ff9900",
        keepaUrl: "https://keepa.com/#!product/5-"
    },
    rakuten: {
        name: "楽天市場",
        logo: "fas fa-store",
        color: "#bf0000",
        keepaUrl: null
    },
    yahoo: {
        name: "Yahoo!ショッピング",
        logo: "fab fa-yahoo",
        color: "#ff0033",
        keepaUrl: null
    },
    taobao: {
        name: "淘宝",
        logo: "fas fa-shopping-cart",
        color: "#ff6600",
        keepaUrl: null
    }
};

// 検索シミュレーション関数
function simulateSearch(keyword) {
    return new Promise((resolve) => {
        // 検索遅延をシミュレート
        setTimeout(() => {
            const results = searchProducts(keyword);
            resolve(results);
        }, 1000 + Math.random() * 2000); // 1-3秒の遅延
    });
}

// 改良された検索関数
function searchProducts(keyword) {
    const searchTerm = keyword.toLowerCase().trim();
    const allResults = [];
    
    // キーワードマッピング（部分一致対応）
    const keywordMap = {
        'iphone': ['iPhone'],
        'アイフォン': ['iPhone'],
        'スマホ': ['iPhone'],
        'スマートフォン': ['iPhone'],
        'apple': ['iPhone', 'ノートパソコン', 'スマートウォッチ', 'タブレット'],
        'アップル': ['iPhone', 'ノートパソコン', 'スマートウォッチ', 'タブレット'],
        'macbook': ['ノートパソコン'],
        'マックブック': ['ノートパソコン'],
        'ノート': ['ノートパソコン'],
        'パソコン': ['ノートパソコン'],
        'pc': ['ノートパソコン'],
        'laptop': ['ノートパソコン'],
        'airpods': ['ワイヤレスイヤホン'],
        'エアポッズ': ['ワイヤレスイヤホン'],
        'イヤホン': ['ワイヤレスイヤホン'],
        'ヘッドホン': ['ワイヤレスイヤホン'],
        'sony': ['ワイヤレスイヤホン'],
        'ソニー': ['ワイヤレスイヤホン'],
        'watch': ['スマートウォッチ'],
        'ウォッチ': ['スマートウォッチ'],
        '時計': ['スマートウォッチ'],
        'ipad': ['タブレット'],
        'アイパッド': ['タブレット'],
        'タブレット': ['タブレット'],
        'tablet': ['タブレット']
    };
    
    // 直接一致をチェック
    for (const [key, products] of Object.entries(mockProducts)) {
        if (key.toLowerCase().includes(searchTerm) || searchTerm.includes(key.toLowerCase())) {
            allResults.push(...products);
        }
    }
    
    // キーワードマッピングをチェック
    for (const [mappedKeyword, categories] of Object.entries(keywordMap)) {
        if (searchTerm.includes(mappedKeyword) || mappedKeyword.includes(searchTerm)) {
            categories.forEach(category => {
                if (mockProducts[category]) {
                    allResults.push(...mockProducts[category]);
                }
            });
        }
    }
    
    // 商品名での部分一致検索
    if (allResults.length === 0) {
        for (const products of Object.values(mockProducts)) {
            products.forEach(product => {
                if (product.name.toLowerCase().includes(searchTerm) || 
                    searchTerm.includes(product.name.toLowerCase().substring(0, 5))) {
                    allResults.push(product);
                }
            });
        }
    }
    
    // 重複を除去
    const uniqueResults = allResults.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
    );
    
    return uniqueResults;
}

// 価格推移データ生成
function generatePriceHistory(basePrice, months = 6) {
    const history = [];
    const now = new Date();
    
    for (let i = months; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const variation = (Math.random() - 0.5) * 0.2; // ±10%の変動
        const price = Math.round(basePrice * (1 + variation));
        
        history.push({
            date: date.toISOString().split('T')[0],
            price: price
        });
    }
    
    return history;
}

// レビューデータ生成
function generateReviews(count = 10) {
    const reviews = [];
    const sampleComments = [
        "とても良い商品です。満足しています。",
        "価格に見合った品質だと思います。",
        "配送が早くて助かりました。",
        "思っていたより小さかったです。",
        "デザインが気に入りました。",
        "使いやすくて便利です。",
        "コストパフォーマンスが良いです。",
        "品質に問題はありませんでした。",
        "リピート購入を検討しています。",
        "おすすめできる商品です。"
    ];
    
    for (let i = 0; i < count; i++) {
        const rating = Math.floor(Math.random() * 5) + 1;
        const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        reviews.push({
            id: `rev-${Date.now()}-${i}`,
            rating: rating,
            comment: sampleComments[Math.floor(Math.random() * sampleComments.length)],
            date: date.toISOString().split('T')[0],
            helpful: Math.floor(Math.random() * 100)
        });
    }
    
    return reviews;
}

// 通貨フォーマット
function formatCurrency(amount, currency = 'JPY') {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// 評価星表示
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // 満点の星
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // 半分の星
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // 空の星
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// エクスポート（Node.js環境での使用を想定）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockProducts,
        siteInfo,
        simulateSearch,
        generatePriceHistory,
        generateReviews,
        formatCurrency,
        generateStars
    };
}