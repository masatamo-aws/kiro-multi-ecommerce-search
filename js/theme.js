// テーマ切り替え機能

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // 保存されたテーマを読み込み
        this.loadSavedTheme();
        
        // テーマ切り替えイベントリスナーを設定
        this.setupEventListeners();
        
        // 初期テーマを適用
        this.applyTheme(this.currentTheme);
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
    }

    setupEventListeners() {
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setTheme(e.target.value);
                }
            });
        });

        // システムテーマ変更の検出
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                // ユーザーが手動でテーマを設定していない場合のみ自動切り替え
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        if (!['light', 'dark'].includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }

        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.updateUI(theme);
    }

    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }

        // Bootstrap のテーマクラスも更新
        this.updateBootstrapTheme(theme);
    }

    updateBootstrapTheme(theme) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (theme === 'dark') {
                navbar.classList.remove('navbar-light');
                navbar.classList.add('navbar-dark');
            } else {
                navbar.classList.remove('navbar-dark');
                navbar.classList.add('navbar-light');
            }
        }
    }

    updateUI(theme) {
        // ラジオボタンの状態を更新
        const themeRadio = document.querySelector(`input[name="theme"][value="${theme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }

        // テーマ変更のアニメーション効果
        this.addThemeTransition();
    }

    addThemeTransition() {
        const body = document.body;
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // トランジション終了後にスタイルを削除
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error);
        }
    }

    getTheme() {
        return this.currentTheme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // システムの推奨テーマを取得
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // テーマをシステム設定に合わせる
    useSystemTheme() {
        const systemTheme = this.getSystemTheme();
        this.setTheme(systemTheme);
        localStorage.removeItem('theme'); // 手動設定をクリア
    }

    // 高コントラストモードの検出
    isHighContrast() {
        return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
    }

    // 動きを減らす設定の検出
    prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // アクセシビリティ設定に基づいてテーマを調整
    applyAccessibilitySettings() {
        const body = document.body;
        
        if (this.isHighContrast()) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }

        if (this.prefersReducedMotion()) {
            body.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
        }
    }
}

// テーママネージャーのインスタンスを作成
let themeManager;

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    
    // アクセシビリティ設定も適用
    themeManager.applyAccessibilitySettings();
});

// グローバルに公開（他のスクリプトから使用可能）
window.themeManager = themeManager;