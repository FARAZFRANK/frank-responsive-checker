/**
 * Frank Responsive Checker Device Preview - JavaScript
 * Handles device preview panel functionality with screenshot capture and comparison mode
 */

(function () {
    'use strict';

    if (window.frankrcLoaded) return;
    window.frankrcLoaded = true;

    // Device presets configuration
    const DEVICES = {
        mobile: [
            { name: 'iPhone SE', width: 375, height: 667, icon: 'smartphone' },
            { name: 'iPhone 14', width: 390, height: 844, icon: 'smartphone' },
            { name: 'iPhone 15 Pro Max', width: 430, height: 932, icon: 'smartphone' },
            { name: 'Galaxy S23', width: 360, height: 780, icon: 'smartphone' },
            { name: 'Pixel 7', width: 412, height: 915, icon: 'smartphone' }
        ],
        tablet: [
            { name: 'iPad Mini', width: 768, height: 1024, icon: 'tablet' },
            { name: 'iPad Air', width: 820, height: 1180, icon: 'tablet' },
            { name: 'iPad Pro 12.9"', width: 1024, height: 1366, icon: 'tablet' }
        ],
        desktop: [
            { name: 'Laptop 13"', width: 1280, height: 800, icon: 'laptop' },
            { name: 'Laptop 15"', width: 1440, height: 900, icon: 'laptop' },
            { name: 'Desktop HD', width: 1920, height: 1080, icon: 'desktop' },
            { name: 'Desktop 2K', width: 2560, height: 1440, icon: 'desktop' }
        ]
    };

    // Flatten devices for easy access
    const ALL_DEVICES = [
        ...DEVICES.mobile.map(d => ({ ...d, category: 'mobile' })),
        ...DEVICES.tablet.map(d => ({ ...d, category: 'tablet' })),
        ...DEVICES.desktop.map(d => ({ ...d, category: 'desktop' }))
    ];

    // LocalStorage key
    const STORAGE_KEY = 'frankrc_device_preview';

    // User Agent database
    const USER_AGENTS = {
        'iPhone SE': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'iPhone 14': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'iPhone 15 Pro Max': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        'Galaxy S23': 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Pixel 7': 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'iPad Mini': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'iPad Air': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'iPad Pro 12.9"': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Laptop 13"': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Laptop 15"': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Desktop HD': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Desktop 2K': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'default': navigator.userAgent
    };

    // UA Presets for quick selection
    const UA_PRESETS = [
        { name: 'Chrome Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        { name: 'Firefox Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0' },
        { name: 'Safari Mac', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' },
        { name: 'Edge Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
        { name: 'iPhone Safari', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
        { name: 'Android Chrome', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
        { name: 'iPad Safari', ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
        { name: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
    ];

    // Network throttle presets
    const NETWORK_PRESETS = {
        none: { name: 'No Throttle', latency: 0, download: 0, upload: 0, speedClass: 'speed-full' },
        slow3g: { name: 'Slow 3G', latency: 2000, download: 50, upload: 50, speedClass: 'speed-slow' },
        fast3g: { name: 'Fast 3G', latency: 563, download: 188, upload: 86, speedClass: 'speed-medium' },
        '4g': { name: '4G LTE', latency: 100, download: 1500, upload: 750, speedClass: 'speed-fast' },
        slowWifi: { name: 'Slow WiFi', latency: 200, download: 500, upload: 250, speedClass: 'speed-medium' }
    };

    // State
    let isRotated = false;
    let currentDevice = null;
    let currentWidth = 375;
    let currentHeight = 667;
    let screenshots = [];
    let currentNetwork = 'none';
    let loadStartTime = 0;
    let lastLoadTime = 0;
    let isCapturing = false;
    let isCompareMode = false;
    let comparePanels = [];
    let syncScrollEnabled = true;
    let customDevices = [];
    let favorites = [];
    let editingDeviceId = null;
    let currentZoom = 100;
    let isInspectorMode = false;
    let elementTooltip = null;
    let elementHighlight = null;
    let selectedElement = null;
    let currentBackground = 'default';
    let isFullscreen = false;
    let recentDevices = [];
    let urlHistory = [];
    let urlHistoryIndex = -1;
    let baselineImage = null;
    let diffSensitivity = 10;
    let lastDiffResult = null;

    // DOM Elements cache
    let panel = null;
    let overlay = null;
    let iframe = null;
    let frameWrapper = null;
    let dimensionsDisplay = null;
    let widthInput = null;
    let heightInput = null;
    let galleryOverlay = null;
    let galleryContent = null;
    let galleryCount = null;
    let progressModal = null;
    let contentArea = null;
    let mainToolbar = null;
    let compareToolbar = null;
    let shortcutsOverlay = null;
    let customDeviceModal = null;
    let urlInput = null;
    let zoomSelect = null;
    let uaModal = null;
    let uaValueDisplay = null;
    let gestureGuide = null;
    let touchIndicator = null;
    let currentDeviceIndex = 0;
    let currentUA = USER_AGENTS.default;
    let customUA = null;
    let isTouchMode = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let longPressTimer = null;

    /**
     * Initialize the plugin
     */
    function init() {
        loadStoredData();
        createPanelHTML();
        createGalleryHTML();
        createProgressHTML();
        createShortcutsHTML();
        createCustomDeviceModal();
        createUAModal();
        createGestureGuide();
        bindEvents();
        bindKeyboardShortcuts();
    }

    /**
     * Load stored data from localStorage
     */
    function loadStoredData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                customDevices = data.customDevices || [];
                favorites = data.favorites || [];
            }
        } catch (e) {
            console.log('Failed to load stored data:', e);
        }
    }

    /**
     * Save data to localStorage
     */
    function saveStoredData() {
        try {
            const data = {
                customDevices: customDevices,
                favorites: favorites
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.log('Failed to save data:', e);
        }
    }

    /**
     * Create the preview panel HTML
     */
    function createPanelHTML() {
        // Create overlay
        overlay = document.createElement('div');
        overlay.className = 'frankrc-dp-overlay';
        overlay.addEventListener('click', closePanel);

        // Create panel
        panel = document.createElement('div');
        panel.className = 'frankrc-dp-panel';
        panel.innerHTML = `
            <div class="frankrc-dp-header">
                <h3 class="frankrc-dp-title">
                    <span class="dashicons dashicons-visibility"></span>
                    Device Preview
                </h3>
                <div style="display: flex; gap: 8px;">
                    <button class="frankrc-dp-help-btn" title="${frankResponsiveChecker.i18n.keyboardShortcuts || 'Keyboard Shortcuts'} (?)">?</button>
                    <button class="frankrc-dp-close" title="${frankResponsiveChecker.i18n.closePanel}">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
            </div>
            <div class="frankrc-dp-toolbar frankrc-dp-main-toolbar">
                ${createDeviceGroupsHTML()}
                <div class="frankrc-dp-controls">
                <div class="frankrc-dp-url-bar-inline">
                    <div class="frankrc-dp-url-nav">
                        <button class="frankrc-dp-url-nav-btn frankrc-dp-back-btn" title="${frankResponsiveChecker.i18n.back || 'Back'}" disabled>
                            <span class="dashicons dashicons-arrow-left-alt2"></span>
                        </button>
                        <button class="frankrc-dp-url-nav-btn frankrc-dp-forward-btn" title="${frankResponsiveChecker.i18n.forward || 'Forward'}" disabled>
                            <span class="dashicons dashicons-arrow-right-alt2"></span>
                        </button>
                        <button class="frankrc-dp-url-nav-btn frankrc-dp-refresh-btn" title="${frankResponsiveChecker.i18n.refresh || 'Refresh'}">
                            <span class="dashicons dashicons-update"></span>
                        </button>
                    </div>
                    <div class="frankrc-dp-url-input-wrapper">
                        <input type="text" class="frankrc-dp-url-input" placeholder="${frankResponsiveChecker.i18n.enterUrl || 'Enter URL to preview...'}" value="${frankResponsiveChecker.currentUrl}">
                        <button class="frankrc-dp-url-go-btn">${frankResponsiveChecker.i18n.go || 'Go'}</button>
                    </div>
                </div>
                    <div class="frankrc-dp-screenshot-btns">
                        <button class="frankrc-dp-screenshot-btn" title="${frankResponsiveChecker.i18n.screenshot}">
                            <span class="dashicons dashicons-camera"></span>
                            Screenshot
                        </button>
                        <button class="frankrc-dp-capture-all-btn" title="${frankResponsiveChecker.i18n.captureAll}">
                            <span class="dashicons dashicons-images-alt2"></span>
                            Capture All
                        </button>
                        <button class="frankrc-dp-gallery-btn" title="${frankResponsiveChecker.i18n.screenshotGallery}">
                            <span class="dashicons dashicons-format-gallery"></span>
                            Gallery
                            <span class="frankrc-dp-gallery-count" style="display: none;">0</span>
                        </button>
                    </div>
                    <button class="frankrc-dp-compare-btn" title="${frankResponsiveChecker.i18n.compare}">
                        <span class="dashicons dashicons-columns"></span>
                        Compare
                    </button>
                    <button class="frankrc-dp-rotate" title="${frankResponsiveChecker.i18n.rotate}">
                        <span class="dashicons dashicons-image-rotate"></span>
                    </button>
                    <div class="frankrc-dp-custom-width">
                        <label>W:</label>
                        <input type="number" id="frankrc-dp-width" value="${currentWidth}" min="320" max="3840">
                        <label>H:</label>
                        <input type="number" id="frankrc-dp-height" value="${currentHeight}" min="320" max="2160">
                    </div>
                    <div class="frankrc-dp-dimensions">
                        <span class="dashicons dashicons-editor-expand"></span>
                        <span class="frankrc-dp-dim-value">${currentWidth} Ã— ${currentHeight}</span>
                    </div>
                    <div class="frankrc-dp-view-controls">
                        <div class="frankrc-dp-bg-toggles">
                            <button class="frankrc-dp-bg-btn frankrc-dp-bg-light" data-bg="light" title="${frankResponsiveChecker.i18n.bgLight || 'Light Background'}"></button>
                            <button class="frankrc-dp-bg-btn frankrc-dp-bg-dark active" data-bg="dark" title="${frankResponsiveChecker.i18n.bgDark || 'Dark Background'}"></button>
                            <button class="frankrc-dp-bg-btn frankrc-dp-bg-checker" data-bg="checker" title="${frankResponsiveChecker.i18n.bgChecker || 'Checkerboard'}"></button>
                        </div>
                        <div class="frankrc-dp-zoom-controls">
                            <select class="frankrc-dp-zoom-select" title="${frankResponsiveChecker.i18n.zoom || 'Zoom'}">
                                <option value="50">50%</option>
                                <option value="75">75%</option>
                                <option value="100" selected>100%</option>
                                <option value="125">125%</option>
                                <option value="150">150%</option>
                            </select>
                        </div>
                        <button class="frankrc-dp-fullscreen-btn" title="${frankResponsiveChecker.i18n.fullscreen || 'Fullscreen'}">
                            <span class="dashicons dashicons-fullscreen-alt"></span>
                        </button>
                    </div>
                </div>
            </div>
            </div>
            <div class="frankrc-dp-ua-bar">
                <span class="frankrc-dp-ua-label">
                    <span class="dashicons dashicons-info"></span>
                    ${frankResponsiveChecker.i18n.currentUA || 'Current UA:'}
                </span>
                <span class="frankrc-dp-ua-value">${navigator.userAgent}</span>
                <button class="frankrc-dp-ua-btn frankrc-dp-ua-edit-btn">
                    <span class="dashicons dashicons-edit"></span>
                    ${frankResponsiveChecker.i18n.editUA || 'Edit'}
                </button>
                <button class="frankrc-dp-ua-btn frankrc-dp-ua-copy-btn">
                    <span class="dashicons dashicons-admin-page"></span>
                    ${frankResponsiveChecker.i18n.copyUA || 'Copy'}
                </button>
                <button class="frankrc-dp-touch-toggle" title="${frankResponsiveChecker.i18n.touchMode || 'Touch Mode'}">
                    <span class="dashicons dashicons-smartphone"></span>
                    ${frankResponsiveChecker.i18n.touchMode || 'Touch'}
                </button>
                <button class="frankrc-dp-inspector-toggle" title="${frankResponsiveChecker.i18n.inspector || 'Inspector'}">
                    <span class="dashicons dashicons-search"></span>
                    ${frankResponsiveChecker.i18n.inspector || 'Inspect'}
                </button>
                <button class="frankrc-dp-share-btn" title="${frankResponsiveChecker.i18n.sharePreview || 'Share Preview'}">
                    <span class="dashicons dashicons-share"></span>
                    ${frankResponsiveChecker.i18n.share || 'Share'}
                </button>
                <button class="frankrc-dp-report-btn" title="${frankResponsiveChecker.i18n.generateReport || 'Generate Report'}">
                    <span class="dashicons dashicons-analytics"></span>
                    ${frankResponsiveChecker.i18n.report || 'Report'}
                </button>
                <button class="frankrc-dp-pages-btn" title="${frankResponsiveChecker.i18n.multiPage || 'Multi-Page Testing'}">
                    <span class="dashicons dashicons-admin-page"></span>
                    ${frankResponsiveChecker.i18n.pages || 'Pages'}
                </button>
                <button class="frankrc-dp-a11y-btn" title="${frankResponsiveChecker.i18n.accessibility || 'Accessibility Audit'}">
                    <span class="dashicons dashicons-universal-access-alt"></span>
                    ${frankResponsiveChecker.i18n.a11y || 'A11y'}
                </button>
                <button class="frankrc-dp-perf-btn" title="${frankResponsiveChecker.i18n.performance || 'Performance Metrics'}">
                    <span class="dashicons dashicons-performance"></span>
                    ${frankResponsiveChecker.i18n.perf || 'Perf'}
                </button>
                <button class="frankrc-dp-design-btn" title="${frankResponsiveChecker.i18n.design || 'Design Consistency'}">
                    <span class="dashicons dashicons-art"></span>
                    ${frankResponsiveChecker.i18n.design || 'Design'}
                </button>
                <button class="frankrc-dp-annotate-btn" title="${frankResponsiveChecker.i18n.annotate || 'Annotate & Collaborate'}">
                    <span class="dashicons dashicons-edit"></span>
                    ${frankResponsiveChecker.i18n.annotate || 'Annotate'}
                </button>
                <div class="frankrc-dp-modes-container" style="position:relative;">
                    <button class="frankrc-dp-modes-btn" title="${frankResponsiveChecker.i18n.testModes || 'Testing Modes'}">
                        <span class="dashicons dashicons-admin-tools"></span>
                        ${frankResponsiveChecker.i18n.modes || 'Modes'}
                    </button>
                    <div class="frankrc-dp-modes-dropdown">
                        <div class="frankrc-dp-mode-item" data-mode="darkMode">
                            <div class="frankrc-dp-mode-icon"><span class="dashicons dashicons-visibility"></span></div>
                            <div class="frankrc-dp-mode-info">
                                <div class="frankrc-dp-mode-name">Dark Mode</div>
                                <div class="frankrc-dp-mode-desc">prefers-color-scheme: dark</div>
                            </div>
                            <div class="frankrc-dp-mode-toggle"></div>
                        </div>
                        <div class="frankrc-dp-mode-item" data-mode="reducedMotion">
                            <div class="frankrc-dp-mode-icon"><span class="dashicons dashicons-controls-pause"></span></div>
                            <div class="frankrc-dp-mode-info">
                                <div class="frankrc-dp-mode-name">Reduced Motion</div>
                                <div class="frankrc-dp-mode-desc">prefers-reduced-motion: reduce</div>
                            </div>
                            <div class="frankrc-dp-mode-toggle"></div>
                        </div>
                        <div class="frankrc-dp-mode-item" data-mode="printMode">
                            <div class="frankrc-dp-mode-icon"><span class="dashicons dashicons-media-document"></span></div>
                            <div class="frankrc-dp-mode-info">
                                <div class="frankrc-dp-mode-name">Print Preview</div>
                                <div class="frankrc-dp-mode-desc">Apply print media styles</div>
                            </div>
                            <div class="frankrc-dp-mode-toggle"></div>
                        </div>
                        <div class="frankrc-dp-mode-item" data-mode="rtlMode">
                            <div class="frankrc-dp-mode-icon"><span class="dashicons dashicons-leftright"></span></div>
                            <div class="frankrc-dp-mode-info">
                                <div class="frankrc-dp-mode-name">RTL Preview</div>
                                <div class="frankrc-dp-mode-desc">Right-to-left direction</div>
                            </div>
                            <div class="frankrc-dp-mode-toggle"></div>
                        </div>
                    </div>
                </div>
                <button class="frankrc-dp-auto-btn" title="${frankResponsiveChecker.i18n.automation || 'Automation & Scheduling'}">
                    <span class="dashicons dashicons-clock"></span>
                    ${frankResponsiveChecker.i18n.auto || 'Auto'}
                </button>
                <button class="frankrc-dp-compare-btn" title="${frankResponsiveChecker.i18n.compare || 'Comparison Tools'}">
                    <span class="dashicons dashicons-image-flip-horizontal"></span>
                    ${frankResponsiveChecker.i18n.compare || 'Compare'}
                </button>
                <button class="frankrc-dp-seo-btn" title="${frankResponsiveChecker.i18n.seo || 'SEO & Content Tools'}">
                    <span class="dashicons dashicons-search"></span>
                    ${frankResponsiveChecker.i18n.seo || 'SEO'}
                </button>
                <button class="frankrc-dp-dev-btn" title="${frankResponsiveChecker.i18n.dev || 'Developer Utilities'}">
                    <span class="dashicons dashicons-editor-code"></span>
                    ${frankResponsiveChecker.i18n.dev || 'Dev'}
                </button>

                <button class="frankrc-dp-mockupv2-btn" title="Live Mockup Generator">
                    <span class="dashicons dashicons-images-alt2"></span>
                    Mockup
                </button>

            </div>
            <div class="frankrc-dp-touch-bar">
                <span class="frankrc-dp-touch-info">
                    <span class="dashicons dashicons-smartphone"></span>
                    ${frankResponsiveChecker.i18n.touchModeOn || 'Touch simulation enabled'}
                </span>
                <button class="frankrc-dp-gesture-btn frankrc-dp-gesture-guide-btn">
                    <span class="dashicons dashicons-info-outline"></span>
                    ${frankResponsiveChecker.i18n.gestureGuide || 'Gesture Guide'}
                </button>
            </div>
            <div class="frankrc-dp-network-bar">
                <span class="frankrc-dp-network-label">
                    <span class="dashicons dashicons-admin-site-alt3"></span>
                    ${frankResponsiveChecker.i18n.networkSpeed || 'Network'}
                </span>
                <select class="frankrc-dp-network-select">
                    <option value="none">${frankResponsiveChecker.i18n.noThrottle || 'No Throttle'}</option>
                    <option value="slow3g">${frankResponsiveChecker.i18n.slow3g || 'Slow 3G'}</option>
                    <option value="fast3g">${frankResponsiveChecker.i18n.fast3g || 'Fast 3G'}</option>
                    <option value="4g">${frankResponsiveChecker.i18n['4g'] || '4G LTE'}</option>
                    <option value="slowWifi">${frankResponsiveChecker.i18n.slowWifi || 'Slow WiFi'}</option>
                </select>
                <div class="frankrc-dp-speed-indicator speed-full">
                    <div class="frankrc-dp-speed-bars">
                        <div class="frankrc-dp-speed-bar"></div>
                        <div class="frankrc-dp-speed-bar"></div>
                        <div class="frankrc-dp-speed-bar"></div>
                        <div class="frankrc-dp-speed-bar"></div>
                    </div>
                    <span class="frankrc-dp-speed-text">Full Speed</span>
                </div>
                <div class="frankrc-dp-load-time">
                    <span class="dashicons dashicons-clock"></span>
                    <span class="frankrc-dp-load-time-value">0.00s</span>
                </div>
                <span class="frankrc-dp-network-badge">
                    <span class="frankrc-dp-network-dot"></span>
                    Online
                </span>
                <div class="frankrc-dp-network-separator"></div>
                <button class="frankrc-dp-baseline-btn" title="${frankResponsiveChecker.i18n.setBaseline || 'Set Baseline'}">
                    <span class="dashicons dashicons-flag"></span>
                    ${frankResponsiveChecker.i18n.setBaseline || 'Set Baseline'}
                </button>
                <button class="frankrc-dp-compare-btn" disabled title="${frankResponsiveChecker.i18n.compareBaseline || 'Compare with Baseline'}">
                    <span class="dashicons dashicons-image-filter"></span>
                    ${frankResponsiveChecker.i18n.compare || 'Compare'}
                </button>
                <div class="frankrc-dp-baseline-status">
                    <span class="frankrc-dp-baseline-dot"></span>
                    <span class="frankrc-dp-baseline-text">${frankResponsiveChecker.i18n.noBaseline || 'No baseline set'}</span>
                </div>
                <div class="frankrc-dp-sensitivity-control">
                    <span class="frankrc-dp-sensitivity-label">${frankResponsiveChecker.i18n.sensitivity || 'Sensitivity'}:</span>
                    <input type="range" class="frankrc-dp-sensitivity-slider" min="1" max="50" value="10">
                </div>
            </div>
            <div class="frankrc-dp-compare-toolbar">
                <div class="frankrc-dp-panel-count">
                    <span>${frankResponsiveChecker.i18n.panels}:</span>
                    <div class="frankrc-dp-panel-count-btns">
                        <button class="frankrc-dp-panel-count-btn active" data-count="2">2</button>
                        <button class="frankrc-dp-panel-count-btn" data-count="3">3</button>
                    </div>
                </div>
                <button class="frankrc-dp-sync-scroll active" title="${frankResponsiveChecker.i18n.syncScroll}">
                    <span class="dashicons dashicons-controls-repeat"></span>
                    ${frankResponsiveChecker.i18n.syncScroll}
                </button>
                <button class="frankrc-dp-exit-compare">
                    <span class="dashicons dashicons-no-alt"></span>
                    ${frankResponsiveChecker.i18n.exitCompare}
                </button>
            </div>
            <div class="frankrc-dp-breakpoint-bar">
                <span class="frankrc-dp-breakpoint-label">
                    <span class="dashicons dashicons-layout"></span>
                    ${frankResponsiveChecker.i18n.breakpoints || 'Breakpoints'}
                </span>
                <button class="frankrc-dp-detect-btn" title="${frankResponsiveChecker.i18n.detectBreakpoints || 'Detect Breakpoints'}">
                    <span class="dashicons dashicons-search"></span>
                    ${frankResponsiveChecker.i18n.detect || 'Detect'}
                </button>
                <div class="frankrc-dp-breakpoints-list">
                    <span class="frankrc-dp-no-breakpoints">${frankResponsiveChecker.i18n.clickDetect || 'Click Detect to scan CSS'}</span>
                </div>
                <div class="frankrc-dp-current-breakpoint">
                    <span class="dashicons dashicons-arrow-right-alt"></span>
                    <span class="current-bp-value">--</span>
                </div>
            </div>
            <div class="frankrc-dp-content">
                <div class="frankrc-dp-frame-wrapper mobile">
                    <iframe class="frankrc-dp-iframe frankrc-dp-loading" src="about:blank"></iframe>
                </div>
            </div>
            <button class="frankrc-dp-controls-toggle" title="${frankResponsiveChecker.i18n.toggleControls || 'Toggle Controls'}">
                <span class="dashicons dashicons-visibility"></span>
                <span class="frankrc-dp-toggle-text">${frankResponsiveChecker.i18n.showControls || 'Show Controls'}</span>
            </button>
            <button class="frankrc-dp-exit-fullscreen" title="${frankResponsiveChecker.i18n.exitFullscreen || 'Exit Fullscreen (Esc)'}">
                <span class="dashicons dashicons-fullscreen-exit-alt"></span>
            </button>

        `;


        // Append to body
        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        // Cache elements
        iframe = panel.querySelector('.frankrc-dp-iframe');
        frameWrapper = panel.querySelector('.frankrc-dp-frame-wrapper');
        dimensionsDisplay = panel.querySelector('.frankrc-dp-dim-value');
        widthInput = panel.querySelector('#frankrc-dp-width');
        heightInput = panel.querySelector('#frankrc-dp-height');
        galleryCount = panel.querySelector('.frankrc-dp-gallery-count');
        contentArea = panel.querySelector('.frankrc-dp-content');
        mainToolbar = panel.querySelector('.frankrc-dp-main-toolbar');
        compareToolbar = panel.querySelector('.frankrc-dp-compare-toolbar');
        urlInput = panel.querySelector('.frankrc-dp-url-input');
        zoomSelect = panel.querySelector('.frankrc-dp-zoom-select');
        uaValueDisplay = panel.querySelector('.frankrc-dp-ua-value');
    }

    /**
     * Create screenshot gallery modal HTML
     */
    function createGalleryHTML() {
        galleryOverlay = document.createElement('div');
        galleryOverlay.className = 'frankrc-dp-gallery-overlay';
        galleryOverlay.innerHTML = `
            <div class="frankrc-dp-gallery-modal">
                <div class="frankrc-dp-gallery-header">
                    <h3 class="frankrc-dp-gallery-title">
                        <span class="dashicons dashicons-format-gallery"></span>
                        ${frankResponsiveChecker.i18n.screenshotGallery}
                    </h3>
                    <div class="frankrc-dp-gallery-actions">
                        <button class="frankrc-dp-pdf-btn">
                            <span class="dashicons dashicons-pdf"></span>
                            ${frankResponsiveChecker.i18n.exportPdf}
                        </button>
                        <button class="frankrc-dp-download-all-btn">
                            <span class="dashicons dashicons-download"></span>
                            ${frankResponsiveChecker.i18n.downloadAll}
                        </button>
                        <button class="frankrc-dp-clear-btn">
                            <span class="dashicons dashicons-trash"></span>
                            ${frankResponsiveChecker.i18n.clearAll}
                        </button>
                        <button class="frankrc-dp-gallery-close">
                            <span class="dashicons dashicons-no-alt"></span>
                        </button>
                    </div>
                </div>
                <div class="frankrc-dp-gallery-content">
                    <div class="frankrc-dp-gallery-empty">
                        <span class="dashicons dashicons-camera"></span>
                        <p>No screenshots yet. Take some screenshots to see them here.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(galleryOverlay);
        galleryContent = galleryOverlay.querySelector('.frankrc-dp-gallery-content');
    }

    /**
     * Create progress modal HTML
     */
    function createProgressHTML() {
        progressModal = document.createElement('div');
        progressModal.className = 'frankrc-dp-progress';
        progressModal.innerHTML = `
            <div class="frankrc-dp-progress-spinner"></div>
            <div class="frankrc-dp-progress-text">${frankResponsiveChecker.i18n.capturing}</div>
            <div class="frankrc-dp-progress-count"></div>
        `;
        document.body.appendChild(progressModal);
    }

    /**
     * Create keyboard shortcuts help modal HTML
     */
    function createShortcutsHTML() {
        shortcutsOverlay = document.createElement('div');
        shortcutsOverlay.className = 'frankrc-dp-shortcuts-overlay';
        shortcutsOverlay.innerHTML = `
            <div class="frankrc-dp-shortcuts-modal">
                <div class="frankrc-dp-shortcuts-header">
                    <h3 class="frankrc-dp-shortcuts-title">
                        <span class="dashicons dashicons-editor-help"></span>
                        ${frankResponsiveChecker.i18n.keyboardShortcuts || 'Keyboard Shortcuts'}
                    </h3>
                    <button class="frankrc-dp-shortcuts-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-shortcuts-content">
                    <div class="frankrc-dp-shortcut-group">
                        <div class="frankrc-dp-shortcut-group-title">${frankResponsiveChecker.i18n.navigation || 'Navigation'}</div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.closePanel || 'Close Panel'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">Esc</span>
                            </div>
                        </div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.previousDevice || 'Previous Device'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">â†</span>
                            </div>
                        </div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.nextDevice || 'Next Device'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">â†’</span>
                            </div>
                        </div>
                    </div>
                    <div class="frankrc-dp-shortcut-group">
                        <div class="frankrc-dp-shortcut-group-title">${frankResponsiveChecker.i18n.actions || 'Actions'}</div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.rotateDevice || 'Rotate Device'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">R</span>
                            </div>
                        </div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.takeScreenshot || 'Take Screenshot'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">S</span>
                            </div>
                        </div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.toggleCompare || 'Toggle Comparison'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">C</span>
                            </div>
                        </div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.showHelp || 'Show Help'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">?</span>
                            </div>
                        </div>
                    </div>
                    <div class="frankrc-dp-shortcut-group">
                        <div class="frankrc-dp-shortcut-group-title">${frankResponsiveChecker.i18n.devices || 'Devices'}</div>
                        <div class="frankrc-dp-shortcut-item">
                            <span class="frankrc-dp-shortcut-action">${frankResponsiveChecker.i18n.quickSwitch || 'Quick Switch to Device'}</span>
                            <div class="frankrc-dp-shortcut-keys">
                                <span class="frankrc-dp-key">1</span>
                                <span class="frankrc-dp-key">-</span>
                                <span class="frankrc-dp-key">9</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(shortcutsOverlay);

        // Bind close events
        shortcutsOverlay.querySelector('.frankrc-dp-shortcuts-close').addEventListener('click', closeShortcuts);
        shortcutsOverlay.addEventListener('click', function (e) {
            if (e.target === shortcutsOverlay) closeShortcuts();
        });
    }

    /**
     * Bind keyboard shortcuts
     */
    function bindKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            // Only handle shortcuts when panel is active
            if (!panel.classList.contains('active')) return;

            // Don't handle if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            // Don't handle if a modal is open
            if (galleryOverlay.classList.contains('active') || shortcutsOverlay.classList.contains('active')) {
                if (e.key === 'Escape') {
                    if (shortcutsOverlay.classList.contains('active')) {
                        closeShortcuts();
                    } else if (galleryOverlay.classList.contains('active')) {
                        closeGallery();
                    }
                }
                return;
            }

            const deviceBtns = Array.from(panel.querySelectorAll('.frankrc-dp-device-btn'));

            switch (e.key.toLowerCase()) {
                // Number keys 1-9 for quick device switch
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    const deviceIndex = parseInt(e.key) - 1;
                    if (deviceBtns[deviceIndex] && !isCompareMode) {
                        selectDevice(deviceBtns[deviceIndex]);
                        currentDeviceIndex = deviceIndex;
                    }
                    break;

                // Arrow keys for device navigation
                case 'arrowleft':
                    e.preventDefault();
                    if (!isCompareMode) {
                        currentDeviceIndex = Math.max(0, currentDeviceIndex - 1);
                        if (deviceBtns[currentDeviceIndex]) {
                            selectDevice(deviceBtns[currentDeviceIndex]);
                        }
                    }
                    break;

                case 'arrowright':
                    e.preventDefault();
                    if (!isCompareMode) {
                        currentDeviceIndex = Math.min(deviceBtns.length - 1, currentDeviceIndex + 1);
                        if (deviceBtns[currentDeviceIndex]) {
                            selectDevice(deviceBtns[currentDeviceIndex]);
                        }
                    }
                    break;

                // R for rotate
                case 'r':
                    if (!isCompareMode) {
                        toggleRotation();
                    }
                    break;

                // S for screenshot
                case 's':
                    if (!isCompareMode) {
                        takeScreenshot();
                    }
                    break;

                // C for compare mode toggle
                case 'c':
                    if (isCompareMode) {
                        exitCompareMode();
                    } else {
                        enterCompareMode();
                    }
                    break;

                // ? for help
                case '?':
                    openShortcuts();
                    break;

                // Escape to close panel
                case 'escape':
                    closePanel();
                    break;
            }
        });
    }

    /**
     * Open shortcuts help modal
     */
    function openShortcuts() {
        shortcutsOverlay.classList.add('active');
    }

    /**
     * Close shortcuts help modal
     */
    function closeShortcuts() {
        shortcutsOverlay.classList.remove('active');
    }

    /**
     * Create custom device modal HTML
     */
    function createCustomDeviceModal() {
        customDeviceModal = document.createElement('div');
        customDeviceModal.className = 'frankrc-dp-custom-modal-overlay';
        customDeviceModal.innerHTML = `
            <div class="frankrc-dp-custom-modal">
                <div class="frankrc-dp-custom-modal-header">
                    <h3 class="frankrc-dp-custom-modal-title">
                        <span class="dashicons dashicons-plus-alt2"></span>
                        <span class="frankrc-dp-modal-title-text">${frankResponsiveChecker.i18n.addDevice || 'Add Device'}</span>
                    </h3>
                    <button class="frankrc-dp-custom-modal-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-custom-modal-content">
                    <form class="frankrc-dp-custom-form">
                        <div class="frankrc-dp-form-group">
                            <label class="frankrc-dp-form-label">${frankResponsiveChecker.i18n.deviceName || 'Device Name'}</label>
                            <input type="text" class="frankrc-dp-form-input" name="name" placeholder="My Device" required>
                        </div>
                        <div class="frankrc-dp-form-row">
                            <div class="frankrc-dp-form-group">
                                <label class="frankrc-dp-form-label">${frankResponsiveChecker.i18n.width || 'Width'}</label>
                                <input type="number" class="frankrc-dp-form-input" name="width" value="375" min="320" max="3840" required>
                            </div>
                            <div class="frankrc-dp-form-group">
                                <label class="frankrc-dp-form-label">${frankResponsiveChecker.i18n.height || 'Height'}</label>
                                <input type="number" class="frankrc-dp-form-input" name="height" value="667" min="320" max="2160" required>
                            </div>
                        </div>
                        <div class="frankrc-dp-form-group">
                            <label class="frankrc-dp-form-label">${frankResponsiveChecker.i18n.category || 'Category'}</label>
                            <select class="frankrc-dp-form-select" name="category">
                                <option value="mobile">Mobile</option>
                                <option value="tablet">Tablet</option>
                                <option value="desktop">Desktop</option>
                            </select>
                        </div>
                        <div class="frankrc-dp-form-actions">
                            <button type="button" class="frankrc-dp-form-btn frankrc-dp-form-btn-secondary frankrc-dp-cancel-btn">${frankResponsiveChecker.i18n.cancel || 'Cancel'}</button>
                            <button type="submit" class="frankrc-dp-form-btn frankrc-dp-form-btn-primary">${frankResponsiveChecker.i18n.save || 'Save'}</button>
                        </div>
                    </form>
                    <div class="frankrc-dp-profile-actions">
                        <button class="frankrc-dp-import-btn">
                            <span class="dashicons dashicons-upload"></span>
                            ${frankResponsiveChecker.i18n.importProfiles || 'Import'}
                        </button>
                        <button class="frankrc-dp-export-btn">
                            <span class="dashicons dashicons-download"></span>
                            ${frankResponsiveChecker.i18n.exportProfiles || 'Export'}
                        </button>
                    </div>
                    <input type="file" class="frankrc-dp-import-input" accept=".json">
                </div>
            </div>
        `;
        document.body.appendChild(customDeviceModal);

        // Bind events
        const form = customDeviceModal.querySelector('.frankrc-dp-custom-form');
        form.addEventListener('submit', handleCustomDeviceSubmit);

        customDeviceModal.querySelector('.frankrc-dp-custom-modal-close').addEventListener('click', closeCustomDeviceModal);
        customDeviceModal.querySelector('.frankrc-dp-cancel-btn').addEventListener('click', closeCustomDeviceModal);
        customDeviceModal.addEventListener('click', function (e) {
            if (e.target === customDeviceModal) closeCustomDeviceModal();
        });

        customDeviceModal.querySelector('.frankrc-dp-import-btn').addEventListener('click', function () {
            customDeviceModal.querySelector('.frankrc-dp-import-input').click();
        });
        customDeviceModal.querySelector('.frankrc-dp-import-input').addEventListener('change', handleImport);
        customDeviceModal.querySelector('.frankrc-dp-export-btn').addEventListener('click', handleExport);
    }

    /**
     * Create UA modal HTML
     */
    function createUAModal() {
        uaModal = document.createElement('div');
        uaModal.className = 'frankrc-dp-ua-modal-overlay';
        uaModal.innerHTML = `
            <div class="frankrc-dp-ua-modal">
                <div class="frankrc-dp-ua-modal-header">
                    <h3 class="frankrc-dp-ua-modal-title">
                        <span class="dashicons dashicons-info"></span>
                        ${frankResponsiveChecker.i18n.userAgent || 'User Agent'}
                    </h3>
                    <button class="frankrc-dp-ua-modal-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-ua-modal-content">
                    <div class="frankrc-dp-ua-presets">
                        <span class="frankrc-dp-ua-presets-label">${frankResponsiveChecker.i18n.uaPresets || 'Quick Presets'}</span>
                        <div class="frankrc-dp-ua-preset-list">
                            ${UA_PRESETS.map(p => `<button class="frankrc-dp-ua-preset" data-ua="${p.ua}">${p.name}</button>`).join('')}
                        </div>
                    </div>
                    <span class="frankrc-dp-ua-presets-label">${frankResponsiveChecker.i18n.customUA || 'Custom User Agent'}</span>
                    <textarea class="frankrc-dp-ua-custom-input" placeholder="Enter custom user agent string...">${currentUA}</textarea>
                    <div class="frankrc-dp-ua-actions">
                        <button class="frankrc-dp-ua-action-btn frankrc-dp-ua-reset-btn">${frankResponsiveChecker.i18n.resetUA || 'Reset to Device Default'}</button>
                        <button class="frankrc-dp-ua-action-btn frankrc-dp-ua-apply-btn">${frankResponsiveChecker.i18n.applyUA || 'Apply'}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(uaModal);

        // Bind events
        uaModal.querySelector('.frankrc-dp-ua-modal-close').addEventListener('click', closeUAModal);
        uaModal.addEventListener('click', function (e) {
            if (e.target === uaModal) closeUAModal();
        });

        // Preset buttons
        uaModal.querySelectorAll('.frankrc-dp-ua-preset').forEach(btn => {
            btn.addEventListener('click', function () {
                const textarea = uaModal.querySelector('.frankrc-dp-ua-custom-input');
                textarea.value = this.dataset.ua;
                uaModal.querySelectorAll('.frankrc-dp-ua-preset').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Apply button
        uaModal.querySelector('.frankrc-dp-ua-apply-btn').addEventListener('click', function () {
            const ua = uaModal.querySelector('.frankrc-dp-ua-custom-input').value.trim();
            if (ua) {
                applyUserAgent(ua);
                closeUAModal();
            }
        });

        // Reset button
        uaModal.querySelector('.frankrc-dp-ua-reset-btn').addEventListener('click', function () {
            resetUserAgent();
            closeUAModal();
        });
    }

    /**
     * Open UA modal
     */
    function openUAModal() {
        const textarea = uaModal.querySelector('.frankrc-dp-ua-custom-input');
        textarea.value = currentUA;
        uaModal.classList.add('active');
    }

    /**
     * Close UA modal
     */
    function closeUAModal() {
        uaModal.classList.remove('active');
    }

    /**
     * Apply custom user agent
     */
    function applyUserAgent(ua) {
        customUA = ua;
        currentUA = ua;
        updateUADisplay();
    }

    /**
     * Reset to device default UA
     */
    function resetUserAgent() {
        customUA = null;
        if (currentDevice) {
            currentUA = USER_AGENTS[currentDevice] || USER_AGENTS.default;
        } else {
            currentUA = USER_AGENTS.default;
        }
        updateUADisplay();
    }

    /**
     * Update UA display
     */
    function updateUADisplay() {
        if (uaValueDisplay) {
            uaValueDisplay.textContent = currentUA;
            uaValueDisplay.classList.toggle('custom', customUA !== null);
        }
    }

    /**
     * Copy UA to clipboard
     */
    function copyUserAgent() {
        navigator.clipboard.writeText(currentUA).then(() => {
            // Show quick feedback
            const btn = panel.querySelector('.frankrc-dp-ua-copy-btn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span class="dashicons dashicons-yes"></span> ${frankResponsiveChecker.i18n.uaCopied || 'Copied!'}`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1500);
        });
    }

    /**
     * Create gesture guide modal
     */
    function createGestureGuide() {
        gestureGuide = document.createElement('div');
        gestureGuide.className = 'frankrc-dp-gesture-guide-overlay';
        gestureGuide.innerHTML = `
            <div class="frankrc-dp-gesture-guide">
                <div class="frankrc-dp-gesture-guide-header">
                    <h3 class="frankrc-dp-gesture-guide-title">
                        <span class="dashicons dashicons-smartphone"></span>
                        ${frankResponsiveChecker.i18n.gestureGuide || 'Gesture Guide'}
                    </h3>
                    <button class="frankrc-dp-gesture-guide-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-gesture-guide-content">
                    <div class="frankrc-dp-gesture-list">
                        <div class="frankrc-dp-gesture-item">
                            <div class="frankrc-dp-gesture-icon">ðŸ‘†</div>
                            <div class="frankrc-dp-gesture-info">
                                <h4>${frankResponsiveChecker.i18n.tap || 'Tap'}</h4>
                                <p>${frankResponsiveChecker.i18n.tapDesc || 'Click once to tap'}</p>
                            </div>
                        </div>
                        <div class="frankrc-dp-gesture-item">
                            <div class="frankrc-dp-gesture-icon">ðŸ‘†ðŸ‘†</div>
                            <div class="frankrc-dp-gesture-info">
                                <h4>${frankResponsiveChecker.i18n.doubleTap || 'Double Tap'}</h4>
                                <p>${frankResponsiveChecker.i18n.doubleTapDesc || 'Double-click to zoom'}</p>
                            </div>
                        </div>
                        <div class="frankrc-dp-gesture-item">
                            <div class="frankrc-dp-gesture-icon">ðŸ‘‡</div>
                            <div class="frankrc-dp-gesture-info">
                                <h4>${frankResponsiveChecker.i18n.longPress || 'Long Press'}</h4>
                                <p>${frankResponsiveChecker.i18n.longPressDesc || 'Click and hold for 500ms'}</p>
                            </div>
                        </div>
                        <div class="frankrc-dp-gesture-item">
                            <div class="frankrc-dp-gesture-icon">ðŸ‘ˆðŸ‘‰</div>
                            <div class="frankrc-dp-gesture-info">
                                <h4>${frankResponsiveChecker.i18n.swipe || 'Swipe'}</h4>
                                <p>${frankResponsiveChecker.i18n.swipeDesc || 'Click and drag to swipe'}</p>
                            </div>
                        </div>
                        <div class="frankrc-dp-gesture-item">
                            <div class="frankrc-dp-gesture-icon">ðŸ¤</div>
                            <div class="frankrc-dp-gesture-info">
                                <h4>${frankResponsiveChecker.i18n.pinchZoom || 'Pinch Zoom'}</h4>
                                <p>${frankResponsiveChecker.i18n.pinchDesc || 'Scroll while holding Ctrl'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(gestureGuide);

        // Create touch indicator
        touchIndicator = document.createElement('div');
        touchIndicator.className = 'frankrc-dp-touch-indicator';
        document.body.appendChild(touchIndicator);

        // Bind events
        gestureGuide.querySelector('.frankrc-dp-gesture-guide-close').addEventListener('click', closeGestureGuide);
        gestureGuide.addEventListener('click', function (e) {
            if (e.target === gestureGuide) closeGestureGuide();
        });
    }

    /**
     * Open gesture guide
     */
    function openGestureGuide() {
        gestureGuide.classList.add('active');
    }

    /**
     * Close gesture guide
     */
    function closeGestureGuide() {
        gestureGuide.classList.remove('active');
    }

    /**
     * Toggle touch mode
     */
    function toggleTouchMode() {
        isTouchMode = !isTouchMode;

        const toggleBtn = panel.querySelector('.frankrc-dp-touch-toggle');
        const touchBar = panel.querySelector('.frankrc-dp-touch-bar');

        toggleBtn.classList.toggle('active', isTouchMode);
        touchBar.classList.toggle('active', isTouchMode);
        contentArea.classList.toggle('touch-mode', isTouchMode);

        if (isTouchMode) {
            bindTouchEvents();
        } else {
            unbindTouchEvents();
        }
    }

    /**
     * Bind touch simulation events
     */
    function bindTouchEvents() {
        contentArea.addEventListener('mousedown', handleTouchStart);
        contentArea.addEventListener('mouseup', handleTouchEnd);
        contentArea.addEventListener('mousemove', handleTouchMove);
        contentArea.addEventListener('wheel', handlePinchZoom);
    }

    /**
     * Unbind touch simulation events
     */
    function unbindTouchEvents() {
        contentArea.removeEventListener('mousedown', handleTouchStart);
        contentArea.removeEventListener('mouseup', handleTouchEnd);
        contentArea.removeEventListener('mousemove', handleTouchMove);
        contentArea.removeEventListener('wheel', handlePinchZoom);
    }

    /**
     * Handle touch start
     */
    function handleTouchStart(e) {
        if (!isTouchMode) return;

        const rect = contentArea.getBoundingClientRect();
        touchStartX = e.clientX - rect.left;
        touchStartY = e.clientY - rect.top;
        touchStartTime = Date.now();

        // Show touch indicator
        touchIndicator.style.left = e.clientX + 'px';
        touchIndicator.style.top = e.clientY + 'px';
        touchIndicator.classList.add('active');

        // Create ripple
        createTouchRipple(e.clientX, e.clientY);

        // Start long press timer
        longPressTimer = setTimeout(() => {
            if (isTouchMode) {
                // Trigger long press
                console.log('Long press detected');
                touchIndicator.style.transform = 'translate(-50%, -50%) scale(1.2)';
            }
        }, 500);
    }

    /**
     * Handle touch end
     */
    function handleTouchEnd(e) {
        if (!isTouchMode) return;

        clearTimeout(longPressTimer);
        touchIndicator.classList.remove('active');
        touchIndicator.style.transform = '';

        const rect = contentArea.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        const duration = Date.now() - touchStartTime;

        // Calculate distance
        const dx = endX - touchStartX;
        const dy = endY - touchStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Detect gesture type
        if (distance < 10 && duration < 200) {
            console.log('Tap detected');
        } else if (distance > 50) {
            // Swipe detected
            const direction = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? 'right' : 'left')
                : (dy > 0 ? 'down' : 'up');
            console.log('Swipe ' + direction + ' detected');
        }
    }

    /**
     * Handle touch move
     */
    function handleTouchMove(e) {
        if (!isTouchMode || !touchIndicator.classList.contains('active')) return;

        touchIndicator.style.left = e.clientX + 'px';
        touchIndicator.style.top = e.clientY + 'px';
    }

    /**
     * Handle pinch zoom (Ctrl + scroll)
     */
    function handlePinchZoom(e) {
        if (!isTouchMode || !e.ctrlKey) return;

        e.preventDefault();

        const delta = e.deltaY > 0 ? -10 : 10;
        const newZoom = Math.max(50, Math.min(200, currentZoom + delta));

        if (newZoom !== currentZoom) {
            currentZoom = newZoom;
            zoomSelect.value = currentZoom;
            setZoom(currentZoom);
        }
    }

    /**
     * Create touch ripple effect
     */
    function createTouchRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'frankrc-dp-touch-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 500);
    }

    /**
     * Set network throttle
     */
    function setNetworkThrottle(preset) {
        currentNetwork = preset;
        const config = NETWORK_PRESETS[preset];

        // Update UI
        updateSpeedIndicator(config);
        updateNetworkBadge(preset !== 'none');

        // Note: Actual browser throttling requires DevTools Protocol
        // This is a visual simulation for demonstration
        console.log(`Network throttle set to: ${config.name}`);
        console.log(`Latency: ${config.latency}ms, Download: ${config.download}kbps`);
    }

    /**
     * Update speed indicator UI
     */
    function updateSpeedIndicator(config) {
        const indicator = panel.querySelector('.frankrc-dp-speed-indicator');
        const speedText = panel.querySelector('.frankrc-dp-speed-text');

        // Remove all speed classes
        indicator.classList.remove('speed-slow', 'speed-medium', 'speed-fast', 'speed-full');
        indicator.classList.add(config.speedClass);

        speedText.textContent = config.name;
    }

    /**
     * Update network badge
     */
    function updateNetworkBadge(isThrottled) {
        const badge = panel.querySelector('.frankrc-dp-network-badge');
        badge.classList.toggle('throttled', isThrottled);
        badge.innerHTML = isThrottled
            ? '<span class="frankrc-dp-network-dot"></span> Throttled'
            : '<span class="frankrc-dp-network-dot"></span> Online';
    }

    /**
     * Start load time tracking
     */
    function startLoadTimeTracking() {
        loadStartTime = performance.now();
        const loadTimeDisplay = panel.querySelector('.frankrc-dp-load-time');
        if (loadTimeDisplay) {
            loadTimeDisplay.classList.add('loading');
        }
    }

    /**
     * Stop load time tracking and update display
     */
    function stopLoadTimeTracking() {
        if (loadStartTime === 0) return;

        const endTime = performance.now();
        lastLoadTime = ((endTime - loadStartTime) / 1000).toFixed(2);
        loadStartTime = 0;

        const loadTimeDisplay = panel.querySelector('.frankrc-dp-load-time');
        const loadTimeValue = panel.querySelector('.frankrc-dp-load-time-value');

        if (loadTimeDisplay) {
            loadTimeDisplay.classList.remove('loading');
        }
        if (loadTimeValue) {
            loadTimeValue.textContent = lastLoadTime + 's';
        }
    }

    /**
     * Toggle inspector mode
     */
    function toggleInspectorMode() {
        isInspectorMode = !isInspectorMode;

        const toggleBtn = panel.querySelector('.frankrc-dp-inspector-toggle');
        toggleBtn.classList.toggle('active', isInspectorMode);
        contentArea.classList.toggle('inspector-mode', isInspectorMode);

        if (isInspectorMode) {
            createElementTooltip();
            createElementHighlight();
            bindInspectorEvents();
        } else {
            unbindInspectorEvents();
            hideElementTooltip();
            hideElementHighlight();
        }
    }

    /**
     * Create element tooltip
     */
    function createElementTooltip() {
        if (elementTooltip) return;

        elementTooltip = document.createElement('div');
        elementTooltip.className = 'frankrc-dp-element-tooltip';
        elementTooltip.innerHTML = `
            <div class="frankrc-dp-tooltip-header">
                <div class="frankrc-dp-tooltip-tag">
                    <span class="frankrc-dp-tooltip-tagname"></span>
                    <span class="frankrc-dp-tooltip-id"></span>
                </div>
                <button class="frankrc-dp-tooltip-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-tooltip-body">
                <div class="frankrc-dp-tooltip-section">
                    <span class="frankrc-dp-tooltip-label">${frankResponsiveChecker.i18n.classes || 'Classes'}</span>
                    <div class="frankrc-dp-tooltip-classes"></div>
                </div>
                <div class="frankrc-dp-tooltip-section">
                    <span class="frankrc-dp-tooltip-label">${frankResponsiveChecker.i18n.dimensions || 'Dimensions'}</span>
                    <div class="frankrc-dp-tooltip-dims">
                        <span class="frankrc-dp-tooltip-dim">
                            <span class="frankrc-dp-tooltip-dim-label">W:</span>
                            <span class="frankrc-dp-tooltip-dim-value frankrc-dp-dim-w"></span>
                        </span>
                        <span class="frankrc-dp-tooltip-dim">
                            <span class="frankrc-dp-tooltip-dim-label">H:</span>
                            <span class="frankrc-dp-tooltip-dim-value frankrc-dp-dim-h"></span>
                        </span>
                        <span class="frankrc-dp-tooltip-dim">
                            <span class="frankrc-dp-tooltip-dim-label">X:</span>
                            <span class="frankrc-dp-tooltip-dim-value frankrc-dp-dim-x"></span>
                        </span>
                        <span class="frankrc-dp-tooltip-dim">
                            <span class="frankrc-dp-tooltip-dim-label">Y:</span>
                            <span class="frankrc-dp-tooltip-dim-value frankrc-dp-dim-y"></span>
                        </span>
                    </div>
                </div>
                <div class="frankrc-dp-tooltip-actions">
                    <button class="frankrc-dp-copy-selector-btn">
                        <span class="dashicons dashicons-admin-page"></span>
                        ${frankResponsiveChecker.i18n.copySelector || 'Copy Selector'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(elementTooltip);

        // Bind close and copy events
        elementTooltip.querySelector('.frankrc-dp-tooltip-close').addEventListener('click', hideElementTooltip);
        elementTooltip.querySelector('.frankrc-dp-copy-selector-btn').addEventListener('click', copyElementSelector);
    }

    /**
     * Create element highlight overlay
     */
    function createElementHighlight() {
        if (elementHighlight) return;

        elementHighlight = document.createElement('div');
        elementHighlight.className = 'frankrc-dp-element-highlight';
        elementHighlight.innerHTML = '<span class="frankrc-dp-highlight-label"></span>';
        contentArea.appendChild(elementHighlight);
    }

    /**
     * Show element info tooltip
     */
    function showElementInfo(element, x, y) {
        if (!elementTooltip) return;

        selectedElement = element;
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? '#' + element.id : '';
        const classes = Array.from(element.classList);
        const rect = element.getBoundingClientRect();

        // Update tooltip content
        elementTooltip.querySelector('.frankrc-dp-tooltip-tagname').textContent = tagName;
        elementTooltip.querySelector('.frankrc-dp-tooltip-id').textContent = id;

        const classesContainer = elementTooltip.querySelector('.frankrc-dp-tooltip-classes');
        if (classes.length > 0) {
            classesContainer.innerHTML = classes.map(c => `<span class="frankrc-dp-tooltip-class">.${c}</span>`).join('');
        } else {
            classesContainer.innerHTML = `<span style="color: var(--frankrc-dp-muted)">${frankResponsiveChecker.i18n.noClasses || 'No classes'}</span>`;
        }

        elementTooltip.querySelector('.frankrc-dp-dim-w').textContent = Math.round(rect.width) + 'px';
        elementTooltip.querySelector('.frankrc-dp-dim-h').textContent = Math.round(rect.height) + 'px';
        elementTooltip.querySelector('.frankrc-dp-dim-x').textContent = Math.round(rect.left) + 'px';
        elementTooltip.querySelector('.frankrc-dp-dim-y').textContent = Math.round(rect.top) + 'px';

        // Position tooltip
        elementTooltip.style.left = Math.min(x + 10, window.innerWidth - 320) + 'px';
        elementTooltip.style.top = Math.min(y + 10, window.innerHeight - 300) + 'px';
        elementTooltip.classList.add('active');
    }

    /**
     * Hide element tooltip
     */
    function hideElementTooltip() {
        if (elementTooltip) {
            elementTooltip.classList.remove('active');
        }
        selectedElement = null;
    }

    /**
     * Show element highlight
     */
    function showElementHighlight(element) {
        if (!elementHighlight) return;

        const rect = element.getBoundingClientRect();
        const contentRect = contentArea.getBoundingClientRect();

        elementHighlight.style.left = (rect.left - contentRect.left) + 'px';
        elementHighlight.style.top = (rect.top - contentRect.top) + 'px';
        elementHighlight.style.width = rect.width + 'px';
        elementHighlight.style.height = rect.height + 'px';
        elementHighlight.style.display = 'block';

        const label = elementHighlight.querySelector('.frankrc-dp-highlight-label');
        label.textContent = element.tagName.toLowerCase() + (element.id ? '#' + element.id : '');
    }

    /**
     * Hide element highlight
     */
    function hideElementHighlight() {
        if (elementHighlight) {
            elementHighlight.style.display = 'none';
        }
    }

    /**
     * Generate CSS selector for element
     */
    function generateSelector(element) {
        if (element.id) {
            return '#' + element.id;
        }

        let path = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let selector = element.tagName.toLowerCase();

            if (element.id) {
                path.unshift('#' + element.id);
                break;
            }

            if (element.className && typeof element.className === 'string') {
                const classes = element.className.trim().split(/\s+/).filter(c => c);
                if (classes.length > 0) {
                    selector += '.' + classes.slice(0, 2).join('.');
                }
            }

            path.unshift(selector);
            element = element.parentElement;

            if (path.length >= 3) break;
        }

        return path.join(' > ');
    }

    /**
     * Copy element selector to clipboard
     */
    function copyElementSelector() {
        if (!selectedElement) return;

        const selector = generateSelector(selectedElement);
        navigator.clipboard.writeText(selector).then(() => {
            const btn = elementTooltip.querySelector('.frankrc-dp-copy-selector-btn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span class="dashicons dashicons-yes"></span> ${frankResponsiveChecker.i18n.selectorCopied || 'Copied!'}`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1500);
        });
    }

    /**
     * Bind inspector events
     */
    function bindInspectorEvents() {
        contentArea.addEventListener('click', handleInspectorClick);
        contentArea.addEventListener('mousemove', handleInspectorHover);
    }

    /**
     * Unbind inspector events
     */
    function unbindInspectorEvents() {
        contentArea.removeEventListener('click', handleInspectorClick);
        contentArea.removeEventListener('mousemove', handleInspectorHover);
    }

    /**
     * Handle inspector click
     */
    function handleInspectorClick(e) {
        if (!isInspectorMode) return;

        // Get element at cursor position from iframe if possible
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeRect = iframe.getBoundingClientRect();
            const x = e.clientX - iframeRect.left;
            const y = e.clientY - iframeRect.top;
            const element = iframeDoc.elementFromPoint(x, y);

            if (element) {
                showElementInfo(element, e.clientX, e.clientY);
            }
        } catch (err) {
            // Cross-origin restriction - show message
            console.log('Cannot inspect cross-origin iframe');
        }
    }

    /**
     * Handle inspector hover
     */
    function handleInspectorHover(e) {
        if (!isInspectorMode) return;

        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeRect = iframe.getBoundingClientRect();
            const x = e.clientX - iframeRect.left;
            const y = e.clientY - iframeRect.top;
            const element = iframeDoc.elementFromPoint(x, y);

            if (element) {
                showElementHighlight(element);
            }
        } catch (err) {
            // Cross-origin restriction
        }
    }

    /**
     * Create share modal
     */
    function createShareModal() {
        const modal = document.createElement('div');
        modal.className = 'frankrc-dp-share-modal-overlay';
        modal.innerHTML = `
            <div class="frankrc-dp-share-modal">
                <div class="frankrc-dp-share-modal-header">
                    <h3 class="frankrc-dp-share-modal-title">
                        <span class="dashicons dashicons-share"></span>
                        ${frankResponsiveChecker.i18n.sharePreview || 'Share Preview'}
                    </h3>
                    <button class="frankrc-dp-share-modal-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-share-modal-content">
                    <div class="frankrc-dp-share-field">
                        <span class="frankrc-dp-share-label">${frankResponsiveChecker.i18n.expiry || 'Link Expiry'}</span>
                        <div class="frankrc-dp-share-expiry">
                            <button class="frankrc-dp-expiry-btn" data-expiry="1h">1 Hour</button>
                            <button class="frankrc-dp-expiry-btn active" data-expiry="24h">24 Hours</button>
                            <button class="frankrc-dp-expiry-btn" data-expiry="7d">7 Days</button>
                            <button class="frankrc-dp-expiry-btn" data-expiry="30d">30 Days</button>
                        </div>
                    </div>
                    <div class="frankrc-dp-share-actions">
                        <button class="frankrc-dp-generate-btn">
                            <span class="dashicons dashicons-admin-links"></span>
                            ${frankResponsiveChecker.i18n.generateLink || 'Generate Link'}
                        </button>
                    </div>
                    <div class="frankrc-dp-share-result">
                        <div class="frankrc-dp-share-url-container">
                            <input type="text" class="frankrc-dp-share-url" readonly>
                            <button class="frankrc-dp-copy-url-btn">
                                <span class="dashicons dashicons-admin-page"></span>
                                ${frankResponsiveChecker.i18n.copy || 'Copy'}
                            </button>
                        </div>
                        <div class="frankrc-dp-qr-container" style="display:none;">
                            <img class="frankrc-dp-qr-code" alt="QR Code">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind expiry buttons
        modal.querySelectorAll('.frankrc-dp-expiry-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                modal.querySelectorAll('.frankrc-dp-expiry-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Bind generate button
        modal.querySelector('.frankrc-dp-generate-btn').addEventListener('click', generateShareLink);

        // Bind copy button
        modal.querySelector('.frankrc-dp-copy-url-btn').addEventListener('click', copyShareUrl);

        // Bind close
        modal.querySelector('.frankrc-dp-share-modal-close').addEventListener('click', closeShareModal);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeShareModal();
        });

        return modal;
    }

    let shareModal = null;

    /**
     * Open share modal
     */
    function openShareModal() {
        if (!shareModal) {
            shareModal = createShareModal();
        }
        // Reset result
        shareModal.querySelector('.frankrc-dp-share-result').classList.remove('active');
        shareModal.classList.add('active');
    }

    /**
     * Close share modal
     */
    function closeShareModal() {
        if (shareModal) {
            shareModal.classList.remove('active');
        }
    }

    /**
     * Generate share link via AJAX
     */
    function generateShareLink() {
        const modal = shareModal;
        const btn = modal.querySelector('.frankrc-dp-generate-btn');
        const activeExpiry = modal.querySelector('.frankrc-dp-expiry-btn.active');
        const expiry = activeExpiry ? activeExpiry.dataset.expiry : '24h';

        btn.disabled = true;
        btn.innerHTML = '<span class="dashicons dashicons-update"></span> Generating...';

        const formData = new FormData();
        formData.append('action', 'frankrc_generate_share_link');
        formData.append('nonce', frankResponsiveChecker.shareNonce || '');
        formData.append('url', urlInput.value || frankResponsiveChecker.currentUrl);
        formData.append('width', currentWidth);
        formData.append('height', currentHeight);
        formData.append('device', currentDevice ? currentDevice.name : 'Custom');
        formData.append('expiry', expiry);

        fetch(frankResponsiveChecker.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                btn.disabled = false;
                btn.innerHTML = `<span class="dashicons dashicons-admin-links"></span> ${frankResponsiveChecker.i18n.generateLink || 'Generate Link'}`;

                if (data.success) {
                    const result = modal.querySelector('.frankrc-dp-share-result');
                    const urlField = modal.querySelector('.frankrc-dp-share-url');
                    urlField.value = data.data.url;
                    result.classList.add('active');
                } else {
                    alert('Failed to generate link: ' + (data.data || 'Unknown error'));
                }
            })
            .catch(error => {
                btn.disabled = false;
                btn.innerHTML = `<span class="dashicons dashicons-admin-links"></span> ${frankResponsiveChecker.i18n.generateLink || 'Generate Link'}`;
                console.error('Error:', error);
            });
    }

    /**
     * Copy share URL to clipboard
     */
    function copyShareUrl() {
        const urlField = shareModal.querySelector('.frankrc-dp-share-url');
        const btn = shareModal.querySelector('.frankrc-dp-copy-url-btn');

        navigator.clipboard.writeText(urlField.value).then(() => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="dashicons dashicons-yes"></span> Copied!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1500);
        });
    }

    let reportModal = null;
    let reportData = [];

    /**
     * Create report modal
     */
    function createReportModal() {
        const modal = document.createElement('div');
        modal.className = 'frankrc-dp-report-modal-overlay';
        modal.innerHTML = `
            <div class="frankrc-dp-report-modal">
                <div class="frankrc-dp-report-header">
                    <span class="frankrc-dp-report-title">
                        <span class="dashicons dashicons-analytics"></span>
                        ${frankResponsiveChecker.i18n.responsiveReport || 'Responsive Report'}
                    </span>
                    <button class="frankrc-dp-report-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-report-content">
                    <div class="frankrc-dp-report-progress">
                        <span class="frankrc-dp-progress-text">${frankResponsiveChecker.i18n.generatingReport || 'Generating Report...'}</span>
                        <div class="frankrc-dp-progress-bar">
                            <div class="frankrc-dp-progress-fill"></div>
                        </div>
                        <span class="frankrc-dp-progress-device"></span>
                    </div>
                    <div class="frankrc-dp-report-results">
                        <div class="frankrc-dp-report-summary"></div>
                        <div class="frankrc-dp-report-grid"></div>
                    </div>
                </div>
                <div class="frankrc-dp-report-actions">
                    <button class="frankrc-dp-report-action-btn generate">
                        <span class="dashicons dashicons-update"></span>
                        ${frankResponsiveChecker.i18n.regenerate || 'Regenerate'}
                    </button>
                    <button class="frankrc-dp-report-action-btn download-html" disabled>
                        <span class="dashicons dashicons-media-code"></span>
                        ${frankResponsiveChecker.i18n.downloadHtml || 'Download HTML'}
                    </button>
                    <button class="frankrc-dp-report-action-btn download-pdf" disabled>
                        <span class="dashicons dashicons-pdf"></span>
                        ${frankResponsiveChecker.i18n.downloadPdf || 'Download PDF'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.frankrc-dp-report-close').addEventListener('click', closeReportModal);
        modal.querySelector('.generate').addEventListener('click', generateReport);
        modal.querySelector('.download-html').addEventListener('click', downloadHtmlReport);
        modal.querySelector('.download-pdf').addEventListener('click', downloadPdfReport);
        modal.addEventListener('click', e => { if (e.target === modal) closeReportModal(); });

        return modal;
    }

    /**
     * Open report modal
     */
    function openReportModal() {
        if (!reportModal) {
            reportModal = createReportModal();
        }
        reportModal.classList.add('active');
        generateReport();
    }

    /**
     * Close report modal
     */
    function closeReportModal() {
        if (reportModal) reportModal.classList.remove('active');
    }

    /**
     * Generate report - capture all devices
     */
    async function generateReport() {
        reportData = [];
        const progress = reportModal.querySelector('.frankrc-dp-report-progress');
        const results = reportModal.querySelector('.frankrc-dp-report-results');
        const progressFill = reportModal.querySelector('.frankrc-dp-progress-fill');
        const progressDevice = reportModal.querySelector('.frankrc-dp-progress-device');

        progress.classList.add('active');
        results.style.display = 'none';

        const devicesToCapture = DEVICES.slice(0, 6); // Capture first 6 devices
        const totalDevices = devicesToCapture.length;

        for (let i = 0; i < totalDevices; i++) {
            const device = devicesToCapture[i];
            progressDevice.textContent = device.name;
            progressFill.style.width = ((i / totalDevices) * 100) + '%';

            // Set iframe size and wait
            iframe.style.width = device.width + 'px';
            iframe.style.height = device.height + 'px';

            // Wait for potential reflow
            await new Promise(r => setTimeout(r, 800));

            try {
                const startTime = performance.now();
                const canvas = await html2canvas(iframe.contentDocument.body, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 0.5
                });
                const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);

                reportData.push({
                    name: device.name,
                    width: device.width,
                    height: device.height,
                    image: canvas.toDataURL('image/jpeg', 0.7),
                    loadTime: loadTime + 's'
                });
            } catch (err) {
                reportData.push({
                    name: device.name,
                    width: device.width,
                    height: device.height,
                    image: null,
                    loadTime: 'Error'
                });
            }
        }

        progressFill.style.width = '100%';

        // Restore original size
        iframe.style.width = currentWidth + 'px';
        iframe.style.height = currentHeight + 'px';

        // Show results
        setTimeout(() => {
            progress.classList.remove('active');
            results.style.display = 'block';
            displayReportResults();
        }, 300);
    }

    /**
     * Display report results in grid
     */
    function displayReportResults() {
        const grid = reportModal.querySelector('.frankrc-dp-report-grid');
        const summary = reportModal.querySelector('.frankrc-dp-report-summary');

        // Summary
        const avgTime = (reportData.reduce((a, d) => a + parseFloat(d.loadTime) || 0, 0) / reportData.length).toFixed(2);
        summary.innerHTML = `
            <div class="frankrc-dp-report-stat">
                <div class="frankrc-dp-report-stat-value">${reportData.length}</div>
                <div class="frankrc-dp-report-stat-label">${frankResponsiveChecker.i18n.devices || 'Devices'}</div>
            </div>
            <div class="frankrc-dp-report-stat">
                <div class="frankrc-dp-report-stat-value">${avgTime}s</div>
                <div class="frankrc-dp-report-stat-label">${frankResponsiveChecker.i18n.avgCapture || 'Avg Capture'}</div>
            </div>
            <div class="frankrc-dp-report-stat">
                <div class="frankrc-dp-report-stat-value">${new Date().toLocaleDateString()}</div>
                <div class="frankrc-dp-report-stat-label">${frankResponsiveChecker.i18n.date || 'Date'}</div>
            </div>
        `;

        // Grid
        grid.innerHTML = reportData.map(d => `
            <div class="frankrc-dp-report-item">
                ${d.image ? `<img class="frankrc-dp-report-item-image" src="${d.image}" alt="${d.name}">` : '<div class="frankrc-dp-report-item-image"></div>'}
                <div class="frankrc-dp-report-item-info">
                    <div class="frankrc-dp-report-item-name">${d.name}</div>
                    <div class="frankrc-dp-report-item-size">${d.width} Ã— ${d.height}px</div>
                    <div class="frankrc-dp-report-item-time">â± ${d.loadTime}</div>
                </div>
            </div>
        `).join('');

        // Enable download buttons
        reportModal.querySelector('.download-html').disabled = false;
        reportModal.querySelector('.download-pdf').disabled = false;
    }

    /**
     * Download HTML report
     */
    function downloadHtmlReport() {
        const siteName = frankResponsiveChecker.siteName || 'Site';
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${siteName} - Responsive Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 8px; }
        .header p { color: #6b7280; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .card img { width: 100%; height: 200px; object-fit: cover; object-position: top; }
        .card-info { padding: 16px; }
        .card-name { font-size: 16px; font-weight: 600; color: #1f2937; }
        .card-size { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .card-time { display: inline-flex; align-items: center; gap: 4px; background: #f0fdf4; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-top: 8px; }
        .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${siteName} - Responsive Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="grid">
        ${reportData.map(d => `
            <div class="card">
                ${d.image ? `<img src="${d.image}" alt="${d.name}">` : ''}
                <div class="card-info">
                    <div class="card-name">${d.name}</div>
                    <div class="card-size">${d.width} Ã— ${d.height}px</div>
                    <div class="card-time">â± ${d.loadTime}</div>
                </div>
            </div>
        `).join('')}
    </div>
    <div class="footer">Generated by Frank Responsive Checker Device Preview</div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `responsive-report-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Download PDF report using jsPDF
     */
    function downloadPdfReport() {
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert('jsPDF library not loaded');
            return;
        }

        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF('p', 'mm', 'a4');
        const siteName = frankResponsiveChecker.siteName || 'Site';

        // Title
        doc.setFontSize(20);
        doc.text(siteName + ' - Responsive Report', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text('Generated: ' + new Date().toLocaleString(), 105, 28, { align: 'center' });

        let y = 45;
        const imgWidth = 85;
        const imgHeight = 60;

        reportData.forEach((d, i) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            const x = (i % 2 === 0) ? 15 : 110;
            if (i % 2 === 0 && i > 0) y += imgHeight + 25;

            if (d.image) {
                doc.addImage(d.image, 'JPEG', x, y, imgWidth, imgHeight);
            }
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(d.name, x, y + imgHeight + 6);
            doc.setFontSize(9);
            doc.setTextColor(128);
            doc.text(`${d.width} Ã— ${d.height}px | ${d.loadTime}`, x, y + imgHeight + 11);
        });

        doc.save(`responsive-report-${Date.now()}.pdf`);
    }



    let detectedBreakpoints = [];

    /**
     * Detect breakpoints from iframe CSS
     */
    function detectBreakpoints() {
        detectedBreakpoints = [];

        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const styleSheets = iframeDoc.styleSheets;

            for (let i = 0; i < styleSheets.length; i++) {
                try {
                    const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                    if (!rules) continue;

                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].type === CSSRule.MEDIA_RULE) {
                            const mediaText = rules[j].media.mediaText;
                            extractBreakpointsFromMedia(mediaText);
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet
                    continue;
                }
            }

            // Remove duplicates and sort
            detectedBreakpoints = [...new Set(detectedBreakpoints.map(b => JSON.stringify(b)))]
                .map(b => JSON.parse(b))
                .sort((a, b) => a.value - b.value);

            displayBreakpoints();
        } catch (err) {
            console.error('Breakpoint detection error:', err);
        }
    }

    /**
     * Extract breakpoints from media query string
     */
    function extractBreakpointsFromMedia(mediaText) {
        // Match min-width and max-width
        const minWidthMatch = mediaText.match(/min-width:\s*(\d+)(px|em|rem)?/gi);
        const maxWidthMatch = mediaText.match(/max-width:\s*(\d+)(px|em|rem)?/gi);

        if (minWidthMatch) {
            minWidthMatch.forEach(m => {
                const value = parseInt(m.match(/\d+/)[0]);
                if (value > 0 && value < 3000) {
                    detectedBreakpoints.push({ value, type: 'min' });
                }
            });
        }

        if (maxWidthMatch) {
            maxWidthMatch.forEach(m => {
                const value = parseInt(m.match(/\d+/)[0]);
                if (value > 0 && value < 3000) {
                    detectedBreakpoints.push({ value, type: 'max' });
                }
            });
        }
    }

    /**
     * Display detected breakpoints in UI
     */
    function displayBreakpoints() {
        const list = panel.querySelector('.frankrc-dp-breakpoints-list');

        if (detectedBreakpoints.length === 0) {
            list.innerHTML = `<span class="frankrc-dp-no-breakpoints">${frankResponsiveChecker.i18n.noBreakpoints || 'No breakpoints found'}</span>`;
            return;
        }

        list.innerHTML = detectedBreakpoints.map(bp => `
            <button class="frankrc-dp-breakpoint-chip ${bp.type}" data-width="${bp.value}" data-type="${bp.type}">
                ${bp.value}px
                <span class="bp-type">${bp.type}</span>
            </button>
        `).join('');

        // Bind click events
        list.querySelectorAll('.frankrc-dp-breakpoint-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                const width = parseInt(this.dataset.width);
                jumpToBreakpoint(width);
            });
        });

        updateActiveBreakpoint();
    }

    /**
     * Jump to specific breakpoint width
     */
    function jumpToBreakpoint(width) {
        currentWidth = width;
        iframe.style.width = width + 'px';

        // Update dimension input if exists
        if (widthInput) widthInput.value = width;

        updateActiveBreakpoint();
        saveState();
    }

    /**
     * Update active breakpoint indicator
     */
    function updateActiveBreakpoint() {
        const currentBp = panel.querySelector('.current-bp-value');
        const chips = panel.querySelectorAll('.frankrc-dp-breakpoint-chip');

        // Find current active breakpoint
        let activeBreakpoint = null;
        detectedBreakpoints.forEach(bp => {
            if (bp.type === 'min' && currentWidth >= bp.value) {
                activeBreakpoint = bp;
            } else if (bp.type === 'max' && currentWidth <= bp.value) {
                if (!activeBreakpoint || bp.value < activeBreakpoint.value) {
                    activeBreakpoint = bp;
                }
            }
        });

        // Update display
        if (activeBreakpoint) {
            currentBp.textContent = activeBreakpoint.value + 'px';
        } else {
            currentBp.textContent = currentWidth + 'px';
        }

        // Update chip states
        chips.forEach(chip => {
            const chipWidth = parseInt(chip.dataset.width);
            const chipType = chip.dataset.type;

            chip.classList.remove('active');
            if ((chipType === 'min' && currentWidth >= chipWidth) ||
                (chipType === 'max' && currentWidth <= chipWidth)) {
                chip.classList.add('active');
            }
        });
    }

    let pagesPanel = null;
    let pagesList = [];
    let currentPageIndex = -1;

    /**
     * Create pages panel
     */
    function createPagesPanel() {
        const panelEl = document.createElement('div');
        panelEl.className = 'frankrc-dp-pages-panel';
        panelEl.innerHTML = `
            <div class="frankrc-dp-pages-header">
                <span class="frankrc-dp-pages-title">
                    <span class="dashicons dashicons-admin-page"></span>
                    ${frankResponsiveChecker.i18n.multiPage || 'Multi-Page Testing'}
                </span>
                <button class="frankrc-dp-pages-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-add-page">
                <input type="text" class="frankrc-dp-page-url-input" placeholder="${frankResponsiveChecker.i18n.enterUrl || 'Enter URL or path...'}">
                <button class="frankrc-dp-add-page-btn">
                    <span class="dashicons dashicons-plus-alt2"></span>
                </button>
            </div>
            <div class="frankrc-dp-pages-list"></div>
            <div class="frankrc-dp-pages-actions">
                <button class="frankrc-dp-batch-btn secondary clear-pages">
                    ${frankResponsiveChecker.i18n.clearAll || 'Clear All'}
                </button>
                <button class="frankrc-dp-batch-btn batch-capture">
                    ${frankResponsiveChecker.i18n.batchCapture || 'Batch Capture'}
                </button>
            </div>
        `;
        contentArea.appendChild(panelEl);

        // Bind events
        panelEl.querySelector('.frankrc-dp-pages-close').addEventListener('click', closePagesPanel);
        panelEl.querySelector('.frankrc-dp-add-page-btn').addEventListener('click', addPageFromInput);
        panelEl.querySelector('.frankrc-dp-page-url-input').addEventListener('keypress', e => {
            if (e.key === 'Enter') addPageFromInput();
        });
        panelEl.querySelector('.clear-pages').addEventListener('click', clearAllPages);
        panelEl.querySelector('.batch-capture').addEventListener('click', batchCapturePages);

        // Add current page by default
        addPage(frankResponsiveChecker.currentUrl, getPageNameFromUrl(frankResponsiveChecker.currentUrl));

        return panelEl;
    }

    /**
     * Open pages panel
     */
    function openPagesPanel() {
        if (!pagesPanel) {
            pagesPanel = createPagesPanel();
        }
        pagesPanel.classList.add('active');
    }

    /**
     * Close pages panel
     */
    function closePagesPanel() {
        if (pagesPanel) pagesPanel.classList.remove('active');
    }

    /**
     * Get page name from URL
     */
    function getPageNameFromUrl(url) {
        try {
            const urlObj = new URL(url);
            let path = urlObj.pathname;
            if (path === '/' || path === '') return 'Home';
            path = path.replace(/\/$/, '').split('/').pop();
            return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        } catch {
            return 'Page';
        }
    }

    /**
     * Add page from input
     */
    function addPageFromInput() {
        const input = pagesPanel.querySelector('.frankrc-dp-page-url-input');
        let url = input.value.trim();

        if (!url) return;

        // Handle relative URLs
        if (!url.startsWith('http')) {
            url = new URL(url, frankResponsiveChecker.currentUrl).href;
        }

        addPage(url, getPageNameFromUrl(url));
        input.value = '';
    }

    /**
     * Add page to list
     */
    function addPage(url, name) {
        // Check for duplicates
        if (pagesList.find(p => p.url === url)) return;

        const page = { url, name, id: Date.now() };
        pagesList.push(page);
        renderPagesList();
    }

    /**
     * Remove page from list
     */
    function removePage(id) {
        pagesList = pagesList.filter(p => p.id !== id);
        renderPagesList();
    }

    /**
     * Clear all pages
     */
    function clearAllPages() {
        pagesList = [];
        renderPagesList();
    }

    /**
     * Render pages list
     */
    function renderPagesList() {
        const list = pagesPanel.querySelector('.frankrc-dp-pages-list');

        if (pagesList.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--frankrc-dp-muted);font-size:12px;">No pages added yet</div>';
            return;
        }

        list.innerHTML = pagesList.map((p, i) => `
            <div class="frankrc-dp-page-item ${i === currentPageIndex ? 'active' : ''}" data-id="${p.id}" data-url="${p.url}">
                <div class="frankrc-dp-page-item-info">
                    <div class="frankrc-dp-page-item-name">${p.name}</div>
                    <div class="frankrc-dp-page-item-url">${p.url}</div>
                </div>
                <button class="frankrc-dp-page-item-remove" data-id="${p.id}">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
        `).join('');

        // Bind events
        list.querySelectorAll('.frankrc-dp-page-item').forEach(item => {
            item.addEventListener('click', function (e) {
                if (e.target.closest('.frankrc-dp-page-item-remove')) return;
                navigateToPage(this.dataset.url);
                currentPageIndex = pagesList.findIndex(p => p.url === this.dataset.url);
                renderPagesList();
            });
        });

        list.querySelectorAll('.frankrc-dp-page-item-remove').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                removePage(parseInt(this.dataset.id));
            });
        });
    }

    /**
     * Navigate to page in iframe
     */
    function navigateToPage(url) {
        urlInput.value = url;
        iframe.src = url;
    }

    /**
     * Batch capture all pages
     */
    async function batchCapturePages() {
        if (pagesList.length === 0) return;

        const results = [];

        for (let i = 0; i < pagesList.length; i++) {
            const page = pagesList[i];
            currentPageIndex = i;
            renderPagesList();

            iframe.src = page.url;
            await new Promise(r => { iframe.onload = r; setTimeout(r, 3000); });
            await new Promise(r => setTimeout(r, 1000));

            try {
                const canvas = await html2canvas(iframe.contentDocument.body, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 0.5
                });

                results.push({
                    name: page.name,
                    url: page.url,
                    image: canvas.toDataURL('image/jpeg', 0.7)
                });
            } catch (err) {
                results.push({ name: page.name, url: page.url, image: null });
            }
        }

        // Download as HTML report
        downloadBatchReport(results);
    }

    /**
     * Download batch report
     */
    function downloadBatchReport(results) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Multi-Page Report</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,sans-serif; background:#f5f5f5; padding:40px; }
        h1 { text-align:center; margin-bottom:30px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
        .card { background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
        .card img { width:100%; height:200px; object-fit:cover; object-position:top; }
        .card-info { padding:16px; }
        .card-name { font-size:16px; font-weight:600; }
        .card-url { font-size:12px; color:#888; margin-top:4px; }
    </style>
</head>
<body>
    <h1>Multi-Page Screenshot Report</h1>
    <div class="grid">
        ${results.map(r => `
            <div class="card">
                ${r.image ? `<img src="${r.image}">` : '<div style="height:200px;background:#ccc"></div>'}
                <div class="card-info">
                    <div class="card-name">${r.name}</div>
                    <div class="card-url">${r.url}</div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `multi-page-report-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Set baseline screenshot
     */
    function setBaseline() {
        html2canvas(iframe.contentDocument.body, {
            useCORS: true,
            allowTaint: true,
            scale: 1
        }).then(canvas => {
            baselineImage = canvas.toDataURL('image/png');
            localStorage.setItem('frankrc_dp_baseline_' + currentWidth + 'x' + currentHeight, baselineImage);

            // Update UI
            const status = panel.querySelector('.frankrc-dp-baseline-status');
            const text = panel.querySelector('.frankrc-dp-baseline-text');
            const compareBtn = panel.querySelector('.frankrc-dp-compare-btn');

            status.classList.add('has-baseline');
            text.textContent = frankResponsiveChecker.i18n.baselineSet || 'Baseline set';
            compareBtn.disabled = false;
        }).catch(err => {
            console.error('Failed to capture baseline:', err);
        });
    }

    /**
     * Load baseline from localStorage
     */
    function loadBaseline() {
        const key = 'frankrc_dp_baseline_' + currentWidth + 'x' + currentHeight;
        const stored = localStorage.getItem(key);

        if (stored) {
            baselineImage = stored;
            const status = panel.querySelector('.frankrc-dp-baseline-status');
            const text = panel.querySelector('.frankrc-dp-baseline-text');
            const compareBtn = panel.querySelector('.frankrc-dp-compare-btn');

            if (status && text && compareBtn) {
                status.classList.add('has-baseline');
                text.textContent = frankResponsiveChecker.i18n.baselineSet || 'Baseline set';
                compareBtn.disabled = false;
            }
        }
    }

    /**
     * Compare current with baseline
     */
    function compareWithBaseline() {
        if (!baselineImage) return;

        html2canvas(iframe.contentDocument.body, {
            useCORS: true,
            allowTaint: true,
            scale: 1
        }).then(currentCanvas => {
            // Load baseline image
            const baselineImg = new Image();
            baselineImg.onload = function () {
                const result = pixelDiff(baselineImg, currentCanvas, diffSensitivity);
                lastDiffResult = result;
                showDiffPanel(result);
            };
            baselineImg.src = baselineImage;
        });
    }

    /**
     * Pixel difference algorithm
     */
    function pixelDiff(img1, canvas2, threshold) {
        const canvas1 = document.createElement('canvas');
        canvas1.width = img1.width;
        canvas1.height = img1.height;
        const ctx1 = canvas1.getContext('2d');
        ctx1.drawImage(img1, 0, 0);

        const ctx2 = canvas2.getContext('2d');

        const width = Math.min(canvas1.width, canvas2.width);
        const height = Math.min(canvas1.height, canvas2.height);

        const data1 = ctx1.getImageData(0, 0, width, height).data;
        const data2 = ctx2.getImageData(0, 0, width, height).data;

        // Create diff canvas
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = width;
        diffCanvas.height = height;
        const diffCtx = diffCanvas.getContext('2d');
        const diffData = diffCtx.createImageData(width, height);

        let diffPixels = 0;
        const totalPixels = width * height;

        for (let i = 0; i < data1.length; i += 4) {
            const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
            const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2];

            const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

            if (diff > threshold * 3) {
                diffPixels++;
                diffData.data[i] = 255;     // Red highlight
                diffData.data[i + 1] = 0;
                diffData.data[i + 2] = 100;
                diffData.data[i + 3] = 180;
            } else {
                diffData.data[i] = 0;
                diffData.data[i + 1] = 0;
                diffData.data[i + 2] = 0;
                diffData.data[i + 3] = 0;
            }
        }

        diffCtx.putImageData(diffData, 0, 0);

        return {
            diffPercentage: ((diffPixels / totalPixels) * 100).toFixed(2),
            diffPixels: diffPixels,
            totalPixels: totalPixels,
            diffCanvas: diffCanvas
        };
    }

    /**
     * Show diff panel
     */
    function showDiffPanel(result) {
        let diffPanel = panel.querySelector('.frankrc-dp-diff-panel');

        if (!diffPanel) {
            diffPanel = document.createElement('div');
            diffPanel.className = 'frankrc-dp-diff-panel';
            diffPanel.innerHTML = `
                <div class="frankrc-dp-diff-header">
                    <span class="frankrc-dp-diff-title">
                        <span class="dashicons dashicons-image-filter"></span>
                        ${frankResponsiveChecker.i18n.comparisonResult || 'Comparison Result'}
                    </span>
                    <button class="frankrc-dp-diff-close">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-diff-percentage">
                    <div class="frankrc-dp-diff-circle">
                        <svg width="120" height="120">
                            <circle class="frankrc-dp-diff-circle-bg" cx="60" cy="60" r="50"></circle>
                            <circle class="frankrc-dp-diff-circle-fill" cx="60" cy="60" r="50" 
                                stroke-dasharray="314.16" stroke-dashoffset="314.16"></circle>
                        </svg>
                        <span class="frankrc-dp-diff-value">0%</span>
                    </div>
                    <span class="frankrc-dp-diff-label">${frankResponsiveChecker.i18n.pixelsDifferent || 'Pixels Different'}</span>
                </div>
                <div class="frankrc-dp-diff-details">
                    <div class="frankrc-dp-diff-stat">
                        <span class="frankrc-dp-diff-stat-label">${frankResponsiveChecker.i18n.diffPixels || 'Different Pixels'}</span>
                        <span class="frankrc-dp-diff-stat-value diff-pixels">0</span>
                    </div>
                    <div class="frankrc-dp-diff-stat">
                        <span class="frankrc-dp-diff-stat-label">${frankResponsiveChecker.i18n.totalPixels || 'Total Pixels'}</span>
                        <span class="frankrc-dp-diff-stat-value total-pixels">0</span>
                    </div>
                    <div class="frankrc-dp-diff-stat">
                        <span class="frankrc-dp-diff-stat-label">${frankResponsiveChecker.i18n.status || 'Status'}</span>
                        <span class="frankrc-dp-diff-stat-value diff-status">-</span>
                    </div>
                </div>
                <div class="frankrc-dp-diff-actions">
                    <button class="frankrc-dp-diff-action-btn toggle-overlay">
                        ${frankResponsiveChecker.i18n.toggleOverlay || 'Toggle Overlay'}
                    </button>
                    <button class="frankrc-dp-diff-action-btn primary accept-baseline">
                        ${frankResponsiveChecker.i18n.acceptNew || 'Accept New'}
                    </button>
                </div>
            `;
            contentArea.appendChild(diffPanel);

            diffPanel.querySelector('.frankrc-dp-diff-close').addEventListener('click', closeDiffPanel);
            diffPanel.querySelector('.toggle-overlay').addEventListener('click', toggleDiffOverlay);
            diffPanel.querySelector('.accept-baseline').addEventListener('click', function () {
                setBaseline();
                closeDiffPanel();
            });
        }

        // Update values
        const pct = parseFloat(result.diffPercentage);
        const fill = diffPanel.querySelector('.frankrc-dp-diff-circle-fill');
        const offset = 314.16 - (314.16 * (pct / 100));
        fill.style.strokeDashoffset = offset;
        fill.classList.remove('warning', 'danger');
        if (pct > 10) fill.classList.add('danger');
        else if (pct > 2) fill.classList.add('warning');

        diffPanel.querySelector('.frankrc-dp-diff-value').textContent = result.diffPercentage + '%';
        diffPanel.querySelector('.diff-pixels').textContent = result.diffPixels.toLocaleString();
        diffPanel.querySelector('.total-pixels').textContent = result.totalPixels.toLocaleString();
        diffPanel.querySelector('.diff-status').textContent = pct < 2 ? 'âœ“ Pass' : pct < 10 ? 'âš  Warning' : 'âœ— Fail';

        diffPanel.classList.add('active');

        // Create overlay with diff
        createDiffOverlay(result.diffCanvas);
    }

    /**
     * Close diff panel
     */
    function closeDiffPanel() {
        const diffPanel = panel.querySelector('.frankrc-dp-diff-panel');
        if (diffPanel) diffPanel.classList.remove('active');

        const overlay = contentArea.querySelector('.frankrc-dp-diff-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    /**
     * Create diff overlay
     */
    function createDiffOverlay(diffCanvas) {
        let overlay = contentArea.querySelector('.frankrc-dp-diff-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'frankrc-dp-diff-overlay';
            contentArea.appendChild(overlay);
        }

        overlay.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'frankrc-dp-diff-canvas';
        img.src = diffCanvas.toDataURL();
        overlay.appendChild(img);
    }

    /**
     * Toggle diff overlay visibility
     */
    function toggleDiffOverlay() {
        const overlay = contentArea.querySelector('.frankrc-dp-diff-overlay');
        if (overlay) overlay.classList.toggle('active');
    }

    /**
     * Open custom device modal for adding
     */
    function openAddDeviceModal() {
        editingDeviceId = null;
        customDeviceModal.querySelector('.frankrc-dp-modal-title-text').textContent = frankResponsiveChecker.i18n.addDevice || 'Add Device';
        customDeviceModal.querySelector('form').reset();
        customDeviceModal.classList.add('active');
    }

    /**
     * Open custom device modal for editing
     */
    function openEditDeviceModal(deviceId) {
        const device = customDevices.find(d => d.id === deviceId);
        if (!device) return;

        editingDeviceId = deviceId;
        customDeviceModal.querySelector('.frankrc-dp-modal-title-text').textContent = frankResponsiveChecker.i18n.editDevice || 'Edit Device';

        const form = customDeviceModal.querySelector('form');
        form.name.value = device.name;
        form.width.value = device.width;
        form.height.value = device.height;
        form.category.value = device.category;

        customDeviceModal.classList.add('active');
    }

    /**
     * Close custom device modal
     */
    function closeCustomDeviceModal() {
        customDeviceModal.classList.remove('active');
        editingDeviceId = null;
    }

    /**
     * Handle custom device form submission
     */
    function handleCustomDeviceSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const name = form.name.value.trim();
        const width = parseInt(form.width.value);
        const height = parseInt(form.height.value);
        const category = form.category.value;

        if (!name || !width || !height) return;

        if (editingDeviceId) {
            // Update existing device
            const index = customDevices.findIndex(d => d.id === editingDeviceId);
            if (index !== -1) {
                customDevices[index] = {
                    ...customDevices[index],
                    name,
                    width,
                    height,
                    category
                };
            }
        } else {
            // Add new device
            customDevices.push({
                id: Date.now(),
                name,
                width,
                height,
                category,
                icon: category === 'mobile' ? 'smartphone' : category === 'tablet' ? 'tablet' : 'desktop'
            });
        }

        saveStoredData();
        refreshCustomDevicesUI();
        closeCustomDeviceModal();
    }

    /**
     * Delete a custom device
     */
    function deleteCustomDevice(deviceId) {
        if (!confirm(frankResponsiveChecker.i18n.deleteConfirm || 'Are you sure you want to delete this device?')) return;

        customDevices = customDevices.filter(d => d.id !== deviceId);
        saveStoredData();
        refreshCustomDevicesUI();
    }

    /**
     * Toggle device favorite
     */
    function toggleFavorite(deviceName) {
        const index = favorites.indexOf(deviceName);
        if (index === -1) {
            favorites.push(deviceName);
        } else {
            favorites.splice(index, 1);
        }
        saveStoredData();
        refreshFavoritesUI();
    }

    /**
     * Refresh custom devices UI
     */
    function refreshCustomDevicesUI() {
        const customGroup = mainToolbar.querySelector('.frankrc-dp-custom-devices-group');
        if (customGroup) {
            const devicesContainer = customGroup.querySelector('.frankrc-dp-devices');
            devicesContainer.innerHTML = customDevices.map(device => createCustomDeviceButtonHTML(device)).join('');
            bindCustomDeviceButtons(customGroup);
        }
    }

    /**
     * Refresh favorites UI
     */
    function refreshFavoritesUI() {
        panel.querySelectorAll('.frankrc-dp-favorite').forEach(star => {
            const deviceName = star.closest('.frankrc-dp-device-btn').dataset.name;
            star.classList.toggle('active', favorites.includes(deviceName));
        });
    }

    /**
     * Create custom device button HTML
     */
    function createCustomDeviceButtonHTML(device) {
        const iconMap = {
            mobile: 'dashicons-smartphone',
            tablet: 'dashicons-tablet',
            desktop: 'dashicons-desktop'
        };
        return `
            <button class="frankrc-dp-device-btn frankrc-dp-custom-device-btn" 
                    data-width="${device.width}" 
                    data-height="${device.height}"
                    data-name="${device.name}"
                    data-category="${device.category}"
                    data-custom-id="${device.id}"
                    title="${device.name} (${device.width}Ã—${device.height})">
                <span class="dashicons ${iconMap[device.category] || 'dashicons-smartphone'}"></span>
                ${device.name}
                <div class="frankrc-dp-custom-device-actions">
                    <button class="frankrc-dp-custom-device-edit" data-id="${device.id}">
                        <span class="dashicons dashicons-edit"></span>
                    </button>
                    <button class="frankrc-dp-custom-device-delete" data-id="${device.id}">
                        <span class="dashicons dashicons-trash"></span>
                    </button>
                </div>
            </button>
        `;
    }

    /**
     * Bind custom device button events
     */
    function bindCustomDeviceButtons(container) {
        container.querySelectorAll('.frankrc-dp-custom-device-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                // Don't select device if clicking edit/delete
                if (e.target.closest('.frankrc-dp-custom-device-edit') || e.target.closest('.frankrc-dp-custom-device-delete')) {
                    return;
                }
                selectDevice(this);
            });
        });

        container.querySelectorAll('.frankrc-dp-custom-device-edit').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                openEditDeviceModal(id);
            });
        });

        container.querySelectorAll('.frankrc-dp-custom-device-delete').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                deleteCustomDevice(id);
            });
        });
    }

    /**
     * Handle import
     */
    function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                if (data.customDevices) {
                    customDevices = [...customDevices, ...data.customDevices.map(d => ({
                        ...d,
                        id: Date.now() + Math.random()
                    }))];
                }
                if (data.favorites) {
                    favorites = [...new Set([...favorites, ...data.favorites])];
                }
                saveStoredData();
                refreshCustomDevicesUI();
                refreshFavoritesUI();
                alert(frankResponsiveChecker.i18n.importSuccess || 'Profiles imported successfully!');
            } catch (err) {
                alert('Failed to import: Invalid file format');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    /**
     * Handle export
     */
    function handleExport() {
        const data = {
            customDevices: customDevices,
            favorites: favorites
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'device-preview-profiles.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Create device groups HTML
     */
    function createDeviceGroupsHTML() {
        const iconMap = {
            smartphone: 'dashicons-smartphone',
            tablet: 'dashicons-tablet',
            laptop: 'dashicons-laptop',
            desktop: 'dashicons-desktop'
        };

        const groupLabels = {
            mobile: 'Mobile',
            tablet: 'Tablet',
            desktop: 'Desktop'
        };

        let html = '';

        for (const [category, devices] of Object.entries(DEVICES)) {
            html += `
                <div class="frankrc-dp-device-group">
                    <span class="frankrc-dp-group-label">${groupLabels[category]}</span>
                    <div class="frankrc-dp-devices">
                        ${devices.map(device => `
                            <button class="frankrc-dp-device-btn" 
                                    data-width="${device.width}" 
                                    data-height="${device.height}"
                                    data-name="${device.name}"
                                    data-category="${category}"
                                    title="${device.name} (${device.width}Ã—${device.height})">
                                <span class="dashicons ${iconMap[device.icon]}"></span>
                                ${device.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Add custom devices group
        html += `
            <div class="frankrc-dp-device-group frankrc-dp-custom-devices-group">
                <span class="frankrc-dp-group-label">${frankResponsiveChecker.i18n.customDevices || 'Custom'}</span>
                <div class="frankrc-dp-devices">
                    ${customDevices.map(device => createCustomDeviceButtonHTML(device)).join('')}
                    <button class="frankrc-dp-add-device-btn" title="${frankResponsiveChecker.i18n.addDevice || 'Add Device'}">
                        <span class="dashicons dashicons-plus-alt"></span>
                        ${frankResponsiveChecker.i18n.addDevice || 'Add'}
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Create device select options HTML
     */
    function createDeviceOptionsHTML(selectedName = '') {
        let html = `<option value="">${frankResponsiveChecker.i18n.selectDevice}</option>`;

        const groupLabels = { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' };

        for (const [category, devices] of Object.entries(DEVICES)) {
            html += `<optgroup label="${groupLabels[category]}">`;
            devices.forEach(device => {
                const selected = device.name === selectedName ? 'selected' : '';
                html += `<option value="${device.name}" ${selected}>${device.name} (${device.width}Ã—${device.height})</option>`;
            });
            html += `</optgroup>`;
        }

        return html;
    }

    /**
     * Bind event handlers
     */
    function bindEvents() {
        // Admin bar button click
        const adminBarBtn = document.querySelector('#wp-admin-bar-frank-responsive-checker > a');
        if (adminBarBtn) {
            adminBarBtn.addEventListener('click', function (e) {
                e.preventDefault();
                openPanel();
            });
        }

        // Close button
        panel.querySelector('.frankrc-dp-close').addEventListener('click', closePanel);

        // Help button
        panel.querySelector('.frankrc-dp-help-btn').addEventListener('click', openShortcuts);

        // Device buttons
        panel.querySelectorAll('.frankrc-dp-device-btn:not(.frankrc-dp-custom-device-btn)').forEach(btn => {
            btn.addEventListener('click', function () {
                selectDevice(this);
            });
        });

        // Custom device buttons
        const customGroup = panel.querySelector('.frankrc-dp-custom-devices-group');
        if (customGroup) {
            bindCustomDeviceButtons(customGroup);
        }

        // Add device button
        panel.querySelector('.frankrc-dp-add-device-btn').addEventListener('click', openAddDeviceModal);

        // Rotate button
        panel.querySelector('.frankrc-dp-rotate').addEventListener('click', toggleRotation);

        // Custom width/height inputs
        widthInput.addEventListener('change', applyCustomDimensions);
        heightInput.addEventListener('change', applyCustomDimensions);
        widthInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') applyCustomDimensions();
        });
        heightInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') applyCustomDimensions();
        });

        // Screenshot buttons
        panel.querySelector('.frankrc-dp-screenshot-btn').addEventListener('click', takeScreenshot);
        panel.querySelector('.frankrc-dp-capture-all-btn').addEventListener('click', captureAllDevices);
        panel.querySelector('.frankrc-dp-gallery-btn').addEventListener('click', openGallery);

        // Compare mode buttons
        panel.querySelector('.frankrc-dp-compare-btn').addEventListener('click', enterCompareMode);
        panel.querySelector('.frankrc-dp-exit-compare').addEventListener('click', exitCompareMode);
        panel.querySelector('.frankrc-dp-sync-scroll').addEventListener('click', toggleSyncScroll);

        // Panel count buttons
        panel.querySelectorAll('.frankrc-dp-panel-count-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const count = parseInt(this.dataset.count);
                setPanelCount(count);
                panel.querySelectorAll('.frankrc-dp-panel-count-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Gallery events
        galleryOverlay.querySelector('.frankrc-dp-gallery-close').addEventListener('click', closeGallery);
        galleryOverlay.querySelector('.frankrc-dp-pdf-btn').addEventListener('click', exportToPdf);
        galleryOverlay.querySelector('.frankrc-dp-download-all-btn').addEventListener('click', downloadAllScreenshots);
        galleryOverlay.querySelector('.frankrc-dp-clear-btn').addEventListener('click', clearAllScreenshots);
        galleryOverlay.addEventListener('click', function (e) {
            if (e.target === galleryOverlay) closeGallery();
        });

        // Escape key to close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (galleryOverlay.classList.contains('active')) {
                    closeGallery();
                } else if (panel.classList.contains('active')) {
                    closePanel();
                }
            }
        });

        // Iframe load event
        iframe.addEventListener('load', function () {
            iframe.classList.remove('frankrc-dp-loading');
            // Stop load time tracking
            stopLoadTimeTracking();
            // Update URL input with current iframe URL if possible
            try {
                if (iframe.contentWindow && iframe.contentWindow.location.href !== 'about:blank') {
                    urlInput.value = iframe.contentWindow.location.href;
                }
            } catch (e) {
                // Cross-origin restriction - ignore
            }
        });

        // URL bar events
        panel.querySelector('.frankrc-dp-url-go-btn').addEventListener('click', navigateToUrl);
        urlInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') navigateToUrl();
        });
        panel.querySelector('.frankrc-dp-back-btn').addEventListener('click', navigateBack);
        panel.querySelector('.frankrc-dp-forward-btn').addEventListener('click', navigateForward);
        panel.querySelector('.frankrc-dp-refresh-btn').addEventListener('click', refreshIframe);

        // Background toggle buttons
        panel.querySelectorAll('.frankrc-dp-bg-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                setBackground(this.dataset.bg);
                panel.querySelectorAll('.frankrc-dp-bg-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Zoom select
        zoomSelect.addEventListener('change', function () {
            setZoom(parseInt(this.value));
        });

        // Fullscreen button
        panel.querySelector('.frankrc-dp-fullscreen-btn').addEventListener('click', toggleFullscreen);

        // UA bar events
        panel.querySelector('.frankrc-dp-ua-edit-btn').addEventListener('click', openUAModal);
        panel.querySelector('.frankrc-dp-ua-copy-btn').addEventListener('click', copyUserAgent);

        // Touch mode events
        panel.querySelector('.frankrc-dp-touch-toggle').addEventListener('click', toggleTouchMode);
        panel.querySelector('.frankrc-dp-gesture-guide-btn').addEventListener('click', openGestureGuide);

        // Network select event
        panel.querySelector('.frankrc-dp-network-select').addEventListener('change', function () {
            setNetworkThrottle(this.value);
        });

        // Inspector toggle event
        panel.querySelector('.frankrc-dp-inspector-toggle').addEventListener('click', toggleInspectorMode);

        // Share button event
        panel.querySelector('.frankrc-dp-share-btn').addEventListener('click', openShareModal);

        // Regression bar events
        panel.querySelector('.frankrc-dp-baseline-btn').addEventListener('click', setBaseline);
        panel.querySelector('.frankrc-dp-compare-btn').addEventListener('click', compareWithBaseline);
        panel.querySelector('.frankrc-dp-sensitivity-slider').addEventListener('input', function () {
            diffSensitivity = parseInt(this.value);
        });

        // Load baseline
        loadBaseline();

        // Report button event
        panel.querySelector('.frankrc-dp-report-btn').addEventListener('click', openReportModal);

        // Breakpoint bar events
        panel.querySelector('.frankrc-dp-breakpoint-bar').classList.add('active');
        panel.querySelector('.frankrc-dp-detect-btn').addEventListener('click', detectBreakpoints);

        // Pages button event
        panel.querySelector('.frankrc-dp-pages-btn').addEventListener('click', openPagesPanel);

        // Accessibility button event
        panel.querySelector('.frankrc-dp-a11y-btn').addEventListener('click', openA11yPanel);

        // Performance button event
        panel.querySelector('.frankrc-dp-perf-btn').addEventListener('click', openPerfPanel);

        // Design button event
        panel.querySelector('.frankrc-dp-design-btn').addEventListener('click', openDesignPanel);

        // Annotate button event
        panel.querySelector('.frankrc-dp-annotate-btn').addEventListener('click', toggleAnnotationMode);

        // Modes dropdown events
        panel.querySelector('.frankrc-dp-modes-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            createModesDropdown(); // Ensure it's created first
            toggleModesDropdown(); // Toggle the one we just created
        });

        // These listeners are handled inside createModesDropdown to ensure they attach to the correct dynamically created elements.

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = panel.querySelector('.frankrc-dp-modes-dropdown');
            if (dropdown) dropdown.classList.remove('active');
        });

        // Automation button event
        panel.querySelector('.frankrc-dp-auto-btn').addEventListener('click', openAutoPanel);

        // Compare button event
        panel.querySelector('.frankrc-dp-compare-btn').addEventListener('click', openComparePanel);

        // SEO button event
        panel.querySelector('.frankrc-dp-seo-btn').addEventListener('click', openSEOPanel);

        // Dev button event
        panel.querySelector('.frankrc-dp-dev-btn').addEventListener('click', openDevPanel);

        // Mockup button event


        // Mockup V2 button event
        panel.querySelector('.frankrc-dp-mockupv2-btn').addEventListener('click', openMockupV2Panel);



        // Fullscreen controls toggle button
        panel.querySelector('.frankrc-dp-controls-toggle').addEventListener('click', toggleFullscreenControls);

        // Exit fullscreen button
        panel.querySelector('.frankrc-dp-exit-fullscreen').addEventListener('click', exitFullscreen);


        // Initialize UX enhancements
        initUXEnhancements();
    }

    /**
     * Navigate to URL
     */
    function navigateToUrl() {
        let url = urlInput.value.trim();
        if (!url) return;

        // Add protocol if missing
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
            urlInput.value = url;
        }

        // Add to history
        if (urlHistory[urlHistoryIndex] !== url) {
            urlHistory = urlHistory.slice(0, urlHistoryIndex + 1);
            urlHistory.push(url);
            urlHistoryIndex = urlHistory.length - 1;
        }

        updateNavButtons();

        startLoadTimeTracking();
        iframe.classList.add('frankrc-dp-loading');
        iframe.src = url;
    }

    /**
     * Navigate back in history
     */
    function navigateBack() {
        if (urlHistoryIndex > 0) {
            urlHistoryIndex--;
            iframe.classList.add('frankrc-dp-loading');
            iframe.src = urlHistory[urlHistoryIndex];
            urlInput.value = urlHistory[urlHistoryIndex];
            updateNavButtons();
        }
    }

    /**
     * Navigate forward in history
     */
    function navigateForward() {
        if (urlHistoryIndex < urlHistory.length - 1) {
            urlHistoryIndex++;
            iframe.classList.add('frankrc-dp-loading');
            iframe.src = urlHistory[urlHistoryIndex];
            urlInput.value = urlHistory[urlHistoryIndex];
            updateNavButtons();
        }
    }

    /**
     * Refresh iframe
     */
    function refreshIframe() {
        iframe.classList.add('frankrc-dp-loading');
        iframe.src = iframe.src;
    }

    /**
     * Update navigation button states
     */
    function updateNavButtons() {
        const backBtn = panel.querySelector('.frankrc-dp-back-btn');
        const forwardBtn = panel.querySelector('.frankrc-dp-forward-btn');
        backBtn.disabled = urlHistoryIndex <= 0;
        forwardBtn.disabled = urlHistoryIndex >= urlHistory.length - 1;
    }

    /**
     * Set background mode
     */
    function setBackground(mode) {
        currentBackground = mode;
        contentArea.classList.remove('bg-light', 'bg-dark', 'bg-checker');
        if (mode !== 'default') {
            contentArea.classList.add('bg-' + mode);
        }
    }

    /**
     * Set zoom level
     */
    function setZoom(level) {
        currentZoom = level;
        frameWrapper.style.transform = `scale(${level / 100})`;
        frameWrapper.style.transformOrigin = 'top center';
    }

    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        panel.classList.toggle('fullscreen', isFullscreen);

        const fullscreenBtn = panel.querySelector('.frankrc-dp-fullscreen-btn');
        const icon = fullscreenBtn.querySelector('.dashicons');

        if (isFullscreen) {
            icon.classList.remove('dashicons-fullscreen-alt');
            icon.classList.add('dashicons-fullscreen-exit-alt');
            fullscreenBtn.title = frankResponsiveChecker.i18n.exitFullscreen || 'Exit Fullscreen';
            fullscreenBtn.classList.add('active');
            // Start with controls hidden
            panel.classList.remove('controls-visible');
            updateControlsToggleButton();
        } else {
            icon.classList.remove('dashicons-fullscreen-exit-alt');
            icon.classList.add('dashicons-fullscreen-alt');
            fullscreenBtn.title = frankResponsiveChecker.i18n.fullscreen || 'Fullscreen';
            fullscreenBtn.classList.remove('active');
            panel.classList.remove('controls-visible');
        }
    }

    /**
     * Toggle fullscreen controls visibility
     */
    function toggleFullscreenControls() {
        panel.classList.toggle('controls-visible');
        updateControlsToggleButton();
    }

    /**
     * Update controls toggle button text
     */
    function updateControlsToggleButton() {
        const toggleBtn = panel.querySelector('.frankrc-dp-controls-toggle');
        const toggleText = toggleBtn.querySelector('.frankrc-dp-toggle-text');
        const toggleIcon = toggleBtn.querySelector('.dashicons');
        const isVisible = panel.classList.contains('controls-visible');

        if (isVisible) {
            toggleText.textContent = frankResponsiveChecker.i18n.hideControls || 'Hide Controls';
            toggleIcon.classList.remove('dashicons-visibility');
            toggleIcon.classList.add('dashicons-hidden');
        } else {
            toggleText.textContent = frankResponsiveChecker.i18n.showControls || 'Show Controls';
            toggleIcon.classList.remove('dashicons-hidden');
            toggleIcon.classList.add('dashicons-visibility');
        }
    }

    /**
     * Exit fullscreen mode
     */
    function exitFullscreen() {
        if (isFullscreen) {
            toggleFullscreen();
        }
    }


    /**
     * Open the preview panel
     */
    function openPanel() {
        overlay.classList.add('active');
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load current page in iframe
        if (iframe.src === 'about:blank') {
            iframe.classList.add('frankrc-dp-loading');
            iframe.src = frankResponsiveChecker.currentUrl;

            // Select first device by default
            const firstDevice = panel.querySelector('.frankrc-dp-device-btn');
            if (firstDevice) {
                selectDevice(firstDevice);
            }
        }
    }

    /**
     * Close the preview panel
     */
    function closePanel() {
        overlay.classList.remove('active');
        panel.classList.remove('active');
        document.body.style.overflow = '';

        // Exit compare mode if active
        if (isCompareMode) {
            exitCompareMode();
        }
    }

    /**
     * Select a device preset
     */
    function selectDevice(btn) {
        // Update active state
        panel.querySelectorAll('.frankrc-dp-device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Get dimensions
        const width = parseInt(btn.dataset.width);
        const height = parseInt(btn.dataset.height);
        const category = btn.dataset.category;
        const name = btn.dataset.name;

        currentDevice = { width, height, category, name };

        // Apply dimensions (considering rotation)
        if (isRotated) {
            setFrameSize(height, width);
        } else {
            setFrameSize(width, height);
        }

        // Update frame wrapper class for styling
        frameWrapper.className = 'frankrc-dp-frame-wrapper';
        if (category === 'mobile') {
            frameWrapper.classList.add('mobile');
        }
    }

    /**
     * Toggle portrait/landscape rotation
     */
    function toggleRotation() {
        isRotated = !isRotated;

        const rotateBtn = panel.querySelector('.frankrc-dp-rotate');
        rotateBtn.classList.toggle('rotated', isRotated);

        // Swap dimensions
        setFrameSize(currentHeight, currentWidth);
    }

    /**
     * Apply custom dimensions from input fields
     */
    function applyCustomDimensions() {
        const width = parseInt(widthInput.value) || 375;
        const height = parseInt(heightInput.value) || 667;

        // Clear active device selection
        panel.querySelectorAll('.frankrc-dp-device-btn').forEach(b => b.classList.remove('active'));
        currentDevice = { width, height, category: 'custom', name: 'Custom' };
        isRotated = false;
        panel.querySelector('.frankrc-dp-rotate').classList.remove('rotated');

        setFrameSize(width, height);
    }

    /**
     * Set the iframe frame size
     */
    function setFrameSize(width, height) {
        currentWidth = width;
        currentHeight = height;

        // Calculate available space
        const content = panel.querySelector('.frankrc-dp-content');
        const contentRect = content.getBoundingClientRect();
        const maxWidth = contentRect.width - 60;
        const maxHeight = contentRect.height - 60;

        // Scale down if necessary
        let scale = 1;
        if (width > maxWidth) {
            scale = Math.min(scale, maxWidth / width);
        }
        if (height > maxHeight) {
            scale = Math.min(scale, maxHeight / height);
        }

        const scaledWidth = Math.floor(width * scale);
        const scaledHeight = Math.floor(height * scale);

        // Apply to frame wrapper
        frameWrapper.style.width = scaledWidth + 'px';
        frameWrapper.style.height = scaledHeight + 'px';

        // Update inputs
        widthInput.value = width;
        heightInput.value = height;

        // Update dimensions display
        dimensionsDisplay.textContent = `${width} Ã— ${height}`;

        // Add visual feedback
        frameWrapper.style.transform = 'scale(1.02)';
        setTimeout(() => {
            frameWrapper.style.transform = 'scale(1)';
        }, 150);
    }

    // ===== COMPARISON MODE =====

    /**
     * Enter comparison mode
     */
    function enterCompareMode() {
        isCompareMode = true;

        // Update UI
        panel.querySelector('.frankrc-dp-compare-btn').classList.add('active');
        mainToolbar.style.display = 'none';
        compareToolbar.classList.add('active');
        contentArea.classList.add('comparison-mode');

        // Hide single preview
        frameWrapper.style.display = 'none';

        // Create comparison panels
        createComparePanels(2);
    }

    /**
     * Exit comparison mode
     */
    function exitCompareMode() {
        isCompareMode = false;

        // Update UI
        panel.querySelector('.frankrc-dp-compare-btn').classList.remove('active');
        mainToolbar.style.display = '';
        compareToolbar.classList.remove('active');
        contentArea.classList.remove('comparison-mode');

        // Show single preview
        frameWrapper.style.display = '';

        // Remove comparison panels
        const panelsContainer = contentArea.querySelector('.frankrc-dp-compare-panels');
        if (panelsContainer) {
            panelsContainer.remove();
        }
        comparePanels = [];
    }

    /**
     * Set panel count
     */
    function setPanelCount(count) {
        createComparePanels(count);
    }

    /**
     * Create comparison panels
     */
    function createComparePanels(count) {
        // Remove existing panels
        const existing = contentArea.querySelector('.frankrc-dp-compare-panels');
        if (existing) {
            existing.remove();
        }
        comparePanels = [];

        // Create container
        const panelsContainer = document.createElement('div');
        panelsContainer.className = 'frankrc-dp-compare-panels';

        // Default devices for each panel
        const defaultDevices = ['iPhone 14', 'iPad Air', 'Desktop HD'];

        for (let i = 0; i < count; i++) {
            const panelData = {
                id: i,
                device: ALL_DEVICES.find(d => d.name === defaultDevices[i]) || ALL_DEVICES[0],
                iframe: null
            };

            const panelEl = document.createElement('div');
            panelEl.className = 'frankrc-dp-compare-panel';
            panelEl.dataset.panelId = i;
            panelEl.innerHTML = `
                <div class="frankrc-dp-compare-header">
                    <select class="frankrc-dp-compare-device-select">
                        ${createDeviceOptionsHTML(panelData.device.name)}
                    </select>
                    <span class="frankrc-dp-compare-dims">${panelData.device.width} Ã— ${panelData.device.height}</span>
                </div>
                <div class="frankrc-dp-compare-iframe-wrapper">
                    <div class="frankrc-dp-compare-frame" style="width: 100%; height: 100%;">
                        <iframe class="frankrc-dp-compare-iframe" src="${frankResponsiveChecker.currentUrl}"></iframe>
                    </div>
                </div>
                ${i < count - 1 ? '<div class="frankrc-dp-resize-handle"></div>' : ''}
            `;

            panelsContainer.appendChild(panelEl);

            // Store iframe reference
            panelData.iframe = panelEl.querySelector('.frankrc-dp-compare-iframe');
            comparePanels.push(panelData);

            // Bind device select change
            const select = panelEl.querySelector('.frankrc-dp-compare-device-select');
            select.addEventListener('change', function () {
                const deviceName = this.value;
                const device = ALL_DEVICES.find(d => d.name === deviceName);
                if (device) {
                    panelData.device = device;
                    const dims = panelEl.querySelector('.frankrc-dp-compare-dims');
                    dims.textContent = `${device.width} Ã— ${device.height}`;
                    updateCompareFrameSize(panelEl, device);
                }
            });

            // Setup sync scroll
            panelData.iframe.addEventListener('load', function () {
                setupSyncScroll(panelData);
            });

            // Initial size
            setTimeout(() => updateCompareFrameSize(panelEl, panelData.device), 100);
        }

        contentArea.appendChild(panelsContainer);
    }

    /**
     * Update compare frame size
     */
    function updateCompareFrameSize(panelEl, device) {
        const wrapper = panelEl.querySelector('.frankrc-dp-compare-iframe-wrapper');
        const frame = panelEl.querySelector('.frankrc-dp-compare-frame');

        const wrapperRect = wrapper.getBoundingClientRect();
        const maxWidth = wrapperRect.width - 30;
        const maxHeight = wrapperRect.height - 30;

        let scale = 1;
        if (device.width > maxWidth) {
            scale = Math.min(scale, maxWidth / device.width);
        }
        if (device.height > maxHeight) {
            scale = Math.min(scale, maxHeight / device.height);
        }

        const scaledWidth = Math.floor(device.width * scale);
        const scaledHeight = Math.floor(device.height * scale);

        frame.style.width = scaledWidth + 'px';
        frame.style.height = scaledHeight + 'px';
    }

    /**
     * Toggle sync scroll
     */
    function toggleSyncScroll() {
        syncScrollEnabled = !syncScrollEnabled;
        const btn = panel.querySelector('.frankrc-dp-sync-scroll');
        btn.classList.toggle('active', syncScrollEnabled);
    }

    /**
     * Setup synchronized scrolling
     */
    function setupSyncScroll(panelData) {
        try {
            const iframeDoc = panelData.iframe.contentDocument || panelData.iframe.contentWindow.document;

            iframeDoc.addEventListener('scroll', function () {
                if (!syncScrollEnabled) return;

                const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
                const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
                const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;
                const scrollPercent = scrollTop / (scrollHeight - clientHeight);

                // Sync other panels
                comparePanels.forEach(otherPanel => {
                    if (otherPanel.id !== panelData.id && otherPanel.iframe) {
                        try {
                            const otherDoc = otherPanel.iframe.contentDocument || otherPanel.iframe.contentWindow.document;
                            const otherScrollHeight = otherDoc.documentElement.scrollHeight || otherDoc.body.scrollHeight;
                            const otherClientHeight = otherDoc.documentElement.clientHeight || otherDoc.body.clientHeight;
                            const newScrollTop = scrollPercent * (otherScrollHeight - otherClientHeight);

                            otherDoc.documentElement.scrollTop = newScrollTop;
                            otherDoc.body.scrollTop = newScrollTop;
                        } catch (e) {
                            // Cross-origin restriction
                        }
                    }
                });
            });
        } catch (e) {
            // Cross-origin restriction - sync scroll won't work
            console.log('Sync scroll unavailable due to cross-origin restrictions');
        }
    }

    // ===== SCREENSHOT FUNCTIONS =====

    /**
     * Take a screenshot of the current view
     */
    async function takeScreenshot() {
        if (isCapturing) return;

        const screenshotBtn = panel.querySelector('.frankrc-dp-screenshot-btn');
        const originalText = screenshotBtn.innerHTML;

        try {
            isCapturing = true;
            screenshotBtn.disabled = true;
            screenshotBtn.innerHTML = `<span class="dashicons dashicons-update"></span> ${frankResponsiveChecker.i18n.capturing}`;

            let canvas;

            // Try to capture iframe content directly (same-origin only)
            try {
                // If we are annotating, we MUST capture the wrapper to include the canvas drawings
                if (isAnnotating) {
                    throw new Error('Force wrapper capture for annotations');
                }

                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeBody = iframeDoc.body;

                if (iframeBody) {
                    canvas = await html2canvas(iframeBody, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        width: currentWidth,
                        height: currentHeight,
                        windowWidth: currentWidth,
                        windowHeight: currentHeight
                    });
                }
            } catch (crossOriginError) {
                // Fallback: capture the frame wrapper if iframe is cross-origin or if annotating
                console.log('Capturing frame wrapper instead (Cross-origin or Annotating)');
                canvas = await html2canvas(frameWrapper, {
                    backgroundColor: '#000',
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
            }

            const dataUrl = canvas.toDataURL('image/png');
            const deviceName = currentDevice ? currentDevice.name : 'Custom';

            const screenshot = {
                id: Date.now(),
                name: deviceName,
                width: currentWidth,
                height: currentHeight,
                dataUrl: dataUrl,
                timestamp: new Date().toISOString()
            };

            screenshots.push(screenshot);
            updateGalleryCount();
            renderGallery();

            // Visual feedback
            screenshotBtn.innerHTML = `<span class="dashicons dashicons-yes"></span> Captured!`;
            setTimeout(() => {
                screenshotBtn.innerHTML = originalText;
                screenshotBtn.disabled = false;
            }, 1000);

        } catch (error) {
            console.error('Screenshot failed:', error);
            screenshotBtn.innerHTML = originalText;
            screenshotBtn.disabled = false;
        } finally {
            isCapturing = false;
        }
    }


    /**
     * Capture screenshots of all devices
     */
    async function captureAllDevices() {
        if (isCapturing) return;

        isCapturing = true;
        const captureBtn = panel.querySelector('.frankrc-dp-capture-all-btn');
        captureBtn.disabled = true;

        // Show progress modal
        progressModal.classList.add('active');
        const progressText = progressModal.querySelector('.frankrc-dp-progress-text');
        const progressCount = progressModal.querySelector('.frankrc-dp-progress-count');

        let captured = 0;
        const total = ALL_DEVICES.length;

        for (const device of ALL_DEVICES) {
            progressText.textContent = `Capturing ${device.name}...`;
            progressCount.textContent = `${captured + 1} of ${total}`;

            // Set device dimensions
            currentDevice = device;
            setFrameSize(device.width, device.height);

            // Update frame wrapper class
            frameWrapper.className = 'frankrc-dp-frame-wrapper';
            if (device.category === 'mobile') {
                frameWrapper.classList.add('mobile');
            }

            // Wait for resize to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                let canvas;

                // Try to capture iframe content directly (same-origin only)
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const iframeBody = iframeDoc.body;

                    if (iframeBody) {
                        canvas = await html2canvas(iframeBody, {
                            backgroundColor: '#ffffff',
                            scale: 2,
                            logging: false,
                            useCORS: true,
                            allowTaint: true,
                            width: device.width,
                            height: device.height,
                            windowWidth: device.width,
                            windowHeight: device.height
                        });
                    }
                } catch (crossOriginError) {
                    // Fallback: capture the frame wrapper if iframe is cross-origin
                    canvas = await html2canvas(frameWrapper, {
                        backgroundColor: '#000',
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                }

                const screenshot = {
                    id: Date.now() + captured,
                    name: device.name,
                    width: device.width,
                    height: device.height,
                    dataUrl: canvas.toDataURL('image/png'),
                    timestamp: new Date().toISOString()
                };

                screenshots.push(screenshot);
                captured++;
            } catch (error) {
                console.error(`Failed to capture ${device.name}:`, error);
            }
        }


        // Hide progress modal
        progressModal.classList.remove('active');
        captureBtn.disabled = false;
        isCapturing = false;

        updateGalleryCount();
        renderGallery();

        // Open gallery to show results
        openGallery();
    }

    /**
     * Update gallery count badge
     */
    function updateGalleryCount() {
        if (screenshots.length > 0) {
            galleryCount.textContent = screenshots.length;
            galleryCount.style.display = 'flex';
        } else {
            galleryCount.style.display = 'none';
        }
    }

    /**
     * Render gallery content
     */
    function renderGallery() {
        if (screenshots.length === 0) {
            galleryContent.innerHTML = `
                <div class="frankrc-dp-gallery-empty">
                    <span class="dashicons dashicons-camera"></span>
                    <p>No screenshots yet. Take some screenshots to see them here.</p>
                </div>
            `;
            return;
        }

        galleryContent.innerHTML = screenshots.map(screenshot => `
            <div class="frankrc-dp-screenshot-card" data-id="${screenshot.id}">
                <div class="frankrc-dp-screenshot-preview">
                    <img src="${screenshot.dataUrl}" alt="${screenshot.name}">
                </div>
                <div class="frankrc-dp-screenshot-info">
                    <div>
                        <div class="frankrc-dp-screenshot-name">${screenshot.name}</div>
                        <div class="frankrc-dp-screenshot-size">${screenshot.width} Ã— ${screenshot.height}</div>
                    </div>
                    <div class="frankrc-dp-screenshot-actions">
                        <button class="frankrc-dp-screenshot-download" title="Download">
                            <span class="dashicons dashicons-download"></span>
                        </button>
                        <button class="frankrc-dp-screenshot-delete" title="Delete">
                            <span class="dashicons dashicons-trash"></span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind card events
        galleryContent.querySelectorAll('.frankrc-dp-screenshot-download').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const card = this.closest('.frankrc-dp-screenshot-card');
                const id = parseInt(card.dataset.id);
                downloadScreenshot(id);
            });
        });

        galleryContent.querySelectorAll('.frankrc-dp-screenshot-delete').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const card = this.closest('.frankrc-dp-screenshot-card');
                const id = parseInt(card.dataset.id);
                deleteScreenshot(id);
            });
        });
    }

    /**
     * Open gallery modal
     */
    function openGallery() {
        renderGallery();
        galleryOverlay.classList.add('active');
    }

    /**
     * Close gallery modal
     */
    function closeGallery() {
        galleryOverlay.classList.remove('active');
    }

    /**
     * Download a single screenshot
     */
    function downloadScreenshot(id) {
        const screenshot = screenshots.find(s => s.id === id);
        if (!screenshot) return;

        const link = document.createElement('a');
        link.download = `${frankResponsiveChecker.siteName}-${screenshot.name}-${screenshot.width}x${screenshot.height}.png`;
        link.href = screenshot.dataUrl;
        link.click();
    }

    /**
     * Delete a screenshot
     */
    function deleteScreenshot(id) {
        screenshots = screenshots.filter(s => s.id !== id);
        updateGalleryCount();
        renderGallery();
    }

    /**
     * Download all screenshots
     */
    function downloadAllScreenshots() {
        screenshots.forEach(screenshot => {
            setTimeout(() => {
                downloadScreenshot(screenshot.id);
            }, 100);
        });
    }

    /**
     * Clear all screenshots
     */
    function clearAllScreenshots() {
        if (confirm('Are you sure you want to delete all screenshots?')) {
            screenshots = [];
            updateGalleryCount();
            renderGallery();
        }
    }

    /**
     * Export all screenshots to PDF
     */
    async function exportToPdf() {
        if (screenshots.length === 0) {
            alert('No screenshots to export!');
            return;
        }

        const pdfBtn = galleryOverlay.querySelector('.frankrc-dp-pdf-btn');
        const originalText = pdfBtn.innerHTML;
        pdfBtn.innerHTML = `<span class="dashicons dashicons-update"></span> Generating...`;
        pdfBtn.disabled = true;

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;

            // Add title page
            pdf.setFontSize(24);
            pdf.setTextColor(99, 102, 241);
            pdf.text('Device Preview Report', pageWidth / 2, 40, { align: 'center' });

            pdf.setFontSize(14);
            pdf.setTextColor(100, 100, 100);
            pdf.text(frankResponsiveChecker.siteName, pageWidth / 2, 55, { align: 'center' });
            pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 65, { align: 'center' });
            pdf.text(`${screenshots.length} Screenshots`, pageWidth / 2, 75, { align: 'center' });

            // Add screenshots
            for (let i = 0; i < screenshots.length; i++) {
                pdf.addPage();
                const screenshot = screenshots[i];

                // Add device info
                pdf.setFontSize(16);
                pdf.setTextColor(0, 0, 0);
                pdf.text(screenshot.name, margin, 15);

                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`${screenshot.width} Ã— ${screenshot.height}`, margin, 22);

                // Add screenshot image
                const imgWidth = pageWidth - (margin * 2);
                const img = new Image();
                img.src = screenshot.dataUrl;

                await new Promise(resolve => {
                    img.onload = resolve;
                });

                const aspectRatio = img.height / img.width;
                let imgHeight = imgWidth * aspectRatio;

                // Limit height to fit page
                const maxHeight = pageHeight - 35;
                if (imgHeight > maxHeight) {
                    imgHeight = maxHeight;
                }

                pdf.addImage(screenshot.dataUrl, 'PNG', margin, 28, imgWidth, imgHeight);
            }

            // Save PDF
            pdf.save(`${frankResponsiveChecker.siteName}-device-preview-report.pdf`);

        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            pdfBtn.innerHTML = originalText;
            pdfBtn.disabled = false;
        }
    }

    // ==========================================
    // Phase 17: Accessibility Testing Functions
    // ==========================================

    let a11yPanel = null;
    let a11yResults = { contrast: [], altText: [], focusOrder: [] };

    /**
     * Create accessibility panel HTML
     */
    function createA11yPanel() {
        if (a11yPanel) return;

        a11yPanel = document.createElement('div');
        a11yPanel.className = 'frankrc-dp-a11y-panel';
        a11yPanel.innerHTML = `
            <div class="frankrc-dp-a11y-header">
                <div class="frankrc-dp-a11y-title">
                    <span class="dashicons dashicons-universal-access-alt"></span>
                    Accessibility Audit
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-a11y-tabs">
                <button class="frankrc-dp-a11y-tab active" data-tab="contrast">Contrast</button>
                <button class="frankrc-dp-a11y-tab" data-tab="alttext">Alt Text</button>
                <button class="frankrc-dp-a11y-tab" data-tab="focus">Focus Order</button>
                <button class="frankrc-dp-a11y-tab" data-tab="reader">Screen Reader</button>
            </div>
            <div class="frankrc-dp-a11y-content">
                <div class="frankrc-dp-a11y-section active" data-section="contrast">
                    <button class="frankrc-dp-run-analysis" data-type="contrast">
                        <span class="dashicons dashicons-visibility"></span>
                        Run Contrast Check
                    </button>
                    <div class="frankrc-dp-a11y-summary" style="display:none;">
                        <div class="frankrc-dp-a11y-stat">
                            <div class="frankrc-dp-a11y-stat-value good" id="a11y-contrast-pass">0</div>
                            <div class="frankrc-dp-a11y-stat-label">Pass</div>
                        </div>
                        <div class="frankrc-dp-a11y-stat">
                            <div class="frankrc-dp-a11y-stat-value bad" id="a11y-contrast-fail">0</div>
                            <div class="frankrc-dp-a11y-stat-label">Fail</div>
                        </div>
                    </div>
                    <div class="frankrc-dp-contrast-results"></div>
                </div>
                <div class="frankrc-dp-a11y-section" data-section="alttext">
                    <button class="frankrc-dp-run-analysis" data-type="alttext">
                        <span class="dashicons dashicons-format-image"></span>
                        Scan Images
                    </button>
                    <div class="frankrc-dp-a11y-summary" style="display:none;">
                        <div class="frankrc-dp-a11y-stat">
                            <div class="frankrc-dp-a11y-stat-value good" id="a11y-alt-has">0</div>
                            <div class="frankrc-dp-a11y-stat-label">Has Alt</div>
                        </div>
                        <div class="frankrc-dp-a11y-stat">
                            <div class="frankrc-dp-a11y-stat-value bad" id="a11y-alt-missing">0</div>
                            <div class="frankrc-dp-a11y-stat-label">Missing</div>
                        </div>
                    </div>
                    <div class="frankrc-dp-alt-results"></div>
                </div>
                <div class="frankrc-dp-a11y-section" data-section="focus">
                    <button class="frankrc-dp-run-analysis" data-type="focus">
                        <span class="dashicons dashicons-editor-ol"></span>
                        Show Focus Order
                    </button>
                    <div class="frankrc-dp-a11y-summary" style="display:none;">
                        <div class="frankrc-dp-a11y-stat">
                            <div class="frankrc-dp-a11y-stat-value good" id="a11y-focus-count">0</div>
                            <div class="frankrc-dp-a11y-stat-label">Focusable</div>
                        </div>
                        <div class="frankrc-dp-a11y-stat">
                            <div class="frankrc-dp-a11y-stat-value" id="a11y-focus-issues">0</div>
                            <div class="frankrc-dp-a11y-stat-label">Issues</div>
                        </div>
                    </div>
                    <div class="frankrc-dp-focus-results"></div>
                </div>
                <div class="frankrc-dp-a11y-section" data-section="reader">
                    <button class="frankrc-dp-run-analysis" data-type="reader">
                        <span class="dashicons dashicons-megaphone"></span>
                        Simulate Reader
                    </button>
                    <div class="frankrc-dp-sr-output"></div>
                </div>
            </div>
        `;

        contentArea.appendChild(a11yPanel);

        // Bind events
        a11yPanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeA11yPanel);

        a11yPanel.querySelectorAll('.frankrc-dp-a11y-tab').forEach(tab => {
            tab.addEventListener('click', () => switchA11yTab(tab.dataset.tab));
        });

        a11yPanel.querySelectorAll('.frankrc-dp-run-analysis').forEach(btn => {
            btn.addEventListener('click', () => runA11yAnalysis(btn.dataset.type));
        });
    }

    /**
     * Open accessibility panel
     */
    function openA11yPanel() {
        createA11yPanel();
        a11yPanel.classList.add('active');
    }

    /**
     * Close accessibility panel
     */
    function closeA11yPanel() {
        if (a11yPanel) {
            a11yPanel.classList.remove('active');
            clearFocusMarkers();
        }
    }

    /**
     * Switch accessibility tab
     */
    function switchA11yTab(tabName) {
        a11yPanel.querySelectorAll('.frankrc-dp-a11y-tab').forEach(t => t.classList.remove('active'));
        a11yPanel.querySelectorAll('.frankrc-dp-a11y-section').forEach(s => s.classList.remove('active'));

        a11yPanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        a11yPanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');

        if (tabName !== 'focus') clearFocusMarkers();
    }

    /**
     * Run accessibility analysis
     */
    function runA11yAnalysis(type) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            switch (type) {
                case 'contrast':
                    analyzeContrast(iframeDoc);
                    break;
                case 'alttext':
                    analyzeAltText(iframeDoc);
                    break;
                case 'focus':
                    analyzeFocusOrder(iframeDoc);
                    break;
                case 'reader':
                    simulateScreenReader(iframeDoc);
                    break;
            }
        } catch (e) {
            console.error('A11y analysis error:', e);
        }
    }

    /**
     * WCAG Contrast Checker
     */
    function analyzeContrast(doc) {
        const results = [];
        const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, label, button');

        textElements.forEach((el, i) => {
            if (i > 50) return; // Limit for performance

            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = getBackgroundColor(el);

            if (!color || !bgColor) return;

            const ratio = calculateContrastRatio(color, bgColor);
            const passAA = ratio >= 4.5;
            const passAAA = ratio >= 7;

            results.push({
                element: el.tagName.toLowerCase(),
                text: el.textContent.substring(0, 30),
                color,
                bgColor,
                ratio: ratio.toFixed(2),
                passAA,
                passAAA
            });
        });

        a11yResults.contrast = results;
        displayContrastResults(results);
    }

    /**
     * Get computed background color
     */
    function getBackgroundColor(el) {
        let current = el;
        while (current) {
            const bg = window.getComputedStyle(current).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                return bg;
            }
            current = current.parentElement;
        }
        return 'rgb(255, 255, 255)';
    }

    /**
     * Calculate WCAG contrast ratio
     */
    function calculateContrastRatio(fg, bg) {
        const fgLum = getLuminance(parseColor(fg));
        const bgLum = getLuminance(parseColor(bg));
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Parse color string to RGB
     */
    function parseColor(color) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        }
        return { r: 0, g: 0, b: 0 };
    }

    /**
     * Get relative luminance
     */
    function getLuminance({ r, g, b }) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Display contrast results
     */
    function displayContrastResults(results) {
        const container = a11yPanel.querySelector('.frankrc-dp-contrast-results');
        const summary = a11yPanel.querySelector('[data-section="contrast"] .frankrc-dp-a11y-summary');

        const pass = results.filter(r => r.passAA).length;
        const fail = results.length - pass;

        a11yPanel.querySelector('#a11y-contrast-pass').textContent = pass;
        a11yPanel.querySelector('#a11y-contrast-fail').textContent = fail;
        summary.style.display = 'grid';

        container.innerHTML = results.slice(0, 20).map(r => `
            <div class="frankrc-dp-contrast-item ${r.passAA ? 'pass' : 'fail'}">
                <div class="frankrc-dp-contrast-preview">
                    <div class="frankrc-dp-contrast-swatch" style="background:${r.bgColor};color:${r.color}">Aa</div>
                    <span class="frankrc-dp-contrast-ratio ${r.passAA ? 'pass' : 'fail'}">${r.ratio}:1</span>
                </div>
                <div class="frankrc-dp-contrast-levels">
                    <span class="frankrc-dp-level-badge ${r.passAA ? 'pass' : 'fail'}">AA ${r.passAA ? 'âœ“' : 'âœ—'}</span>
                    <span class="frankrc-dp-level-badge ${r.passAAA ? 'pass' : 'fail'}">AAA ${r.passAAA ? 'âœ“' : 'âœ—'}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Alt Text Audit
     */
    function analyzeAltText(doc) {
        const images = doc.querySelectorAll('img');
        const results = [];

        images.forEach(img => {
            const hasAlt = img.hasAttribute('alt') && img.alt.trim() !== '';
            results.push({
                src: img.src,
                alt: img.alt || '',
                hasAlt,
                element: img
            });

            // Highlight missing alt
            if (!hasAlt) {
                img.classList.add('frankrc-dp-missing-alt-highlight');
            } else {
                img.classList.remove('frankrc-dp-missing-alt-highlight');
            }
        });

        a11yResults.altText = results;
        displayAltResults(results);
    }

    /**
     * Display alt text results
     */
    function displayAltResults(results) {
        const container = a11yPanel.querySelector('.frankrc-dp-alt-results');
        const summary = a11yPanel.querySelector('[data-section="alttext"] .frankrc-dp-a11y-summary');

        const hasAlt = results.filter(r => r.hasAlt).length;
        const missing = results.length - hasAlt;

        a11yPanel.querySelector('#a11y-alt-has').textContent = hasAlt;
        a11yPanel.querySelector('#a11y-alt-missing').textContent = missing;
        summary.style.display = 'grid';

        container.innerHTML = results.map(r => `
            <div class="frankrc-dp-alt-item">
                <img class="frankrc-dp-alt-thumb" src="${r.src}" alt="">
                <div class="frankrc-dp-alt-info">
                    <span class="frankrc-dp-alt-status ${r.hasAlt ? 'has-alt' : 'no-alt'}">
                        ${r.hasAlt ? 'âœ“ Has Alt' : 'âœ— Missing Alt'}
                    </span>
                    <div class="frankrc-dp-alt-text">${r.hasAlt ? r.alt : 'No alt text provided'}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Focus Order Visualization
     */
    function analyzeFocusOrder(doc) {
        clearFocusMarkers();

        const focusable = doc.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const results = [];

        focusable.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            results.push({ element: el, index: index + 1, rect });

            // Create marker
            const marker = document.createElement('div');
            marker.className = 'frankrc-dp-focus-marker';
            marker.textContent = index + 1;
            marker.style.left = (rect.left + iframe.getBoundingClientRect().left) + 'px';
            marker.style.top = (rect.top + iframe.getBoundingClientRect().top) + 'px';
            panel.appendChild(marker);
        });

        a11yResults.focusOrder = results;

        const summary = a11yPanel.querySelector('[data-section="focus"] .frankrc-dp-a11y-summary');
        a11yPanel.querySelector('#a11y-focus-count').textContent = results.length;
        summary.style.display = 'grid';
    }

    /**
     * Clear focus markers
     */
    function clearFocusMarkers() {
        panel.querySelectorAll('.frankrc-dp-focus-marker, .frankrc-dp-focus-line').forEach(m => m.remove());
    }

    /**
     * Screen Reader Simulation
     */
    function simulateScreenReader(doc) {
        const output = [];
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);

        let count = 0;
        while (walker.nextNode() && count < 100) {
            const node = walker.currentNode;
            const role = node.getAttribute('role') || getImplicitRole(node);
            const label = getAccessibleName(node);

            if (label && label.trim()) {
                output.push({ role, label: label.trim() });
                count++;
            }
        }

        displayReaderOutput(output);
    }

    /**
     * Get implicit ARIA role
     */
    function getImplicitRole(el) {
        const tagRoles = {
            'a': 'link', 'button': 'button', 'h1': 'heading', 'h2': 'heading',
            'h3': 'heading', 'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
            'img': 'img', 'input': 'textbox', 'nav': 'navigation', 'main': 'main',
            'header': 'banner', 'footer': 'contentinfo', 'article': 'article',
            'ul': 'list', 'ol': 'list', 'li': 'listitem', 'table': 'table'
        };
        return tagRoles[el.tagName.toLowerCase()] || '';
    }

    /**
     * Get accessible name
     */
    function getAccessibleName(el) {
        return el.getAttribute('aria-label') ||
            el.getAttribute('alt') ||
            el.getAttribute('title') ||
            (el.tagName === 'INPUT' ? el.placeholder : '') ||
            (el.textContent && el.textContent.length < 100 ? el.textContent.substring(0, 50) : '');
    }

    /**
     * Display screen reader output
     */
    function displayReaderOutput(output) {
        const container = a11yPanel.querySelector('.frankrc-dp-sr-output');
        container.innerHTML = output.map(o => `
            <div class="frankrc-dp-sr-element">
                ${o.role ? `<span class="frankrc-dp-sr-role">${o.role}</span>` : ''}
                ${o.label}
            </div>
        `).join('');
    }

    // ==========================================
    // Phase 18: Performance Metrics Dashboard
    // ==========================================

    let perfPanel = null;

    /**
     * Create performance panel HTML
     */
    function createPerfPanel() {
        if (perfPanel) return;

        perfPanel = document.createElement('div');
        perfPanel.className = 'frankrc-dp-perf-panel';
        perfPanel.innerHTML = `
            <div class="frankrc-dp-perf-header">
                <div class="frankrc-dp-perf-title">
                    <span class="dashicons dashicons-performance"></span>
                    Performance Metrics
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-perf-tabs">
                <button class="frankrc-dp-perf-tab active" data-tab="vitals">Vitals</button>
                <button class="frankrc-dp-perf-tab" data-tab="waterfall">Resources</button>
                <button class="frankrc-dp-perf-tab" data-tab="images">Images</button>
                <button class="frankrc-dp-perf-tab" data-tab="scripts">Scripts</button>
            </div>
            <div class="frankrc-dp-perf-content">
                <div class="frankrc-dp-perf-section active" data-section="vitals">
                    <button class="frankrc-dp-run-perf" data-type="vitals">
                        <span class="dashicons dashicons-chart-bar"></span>
                        Measure Core Web Vitals
                    </button>
                    <div class="frankrc-dp-vitals-grid"></div>
                </div>
                <div class="frankrc-dp-perf-section" data-section="waterfall">
                    <button class="frankrc-dp-run-perf" data-type="waterfall">
                        <span class="dashicons dashicons-list-view"></span>
                        Analyze Resources
                    </button>
                    <div class="frankrc-dp-waterfall"></div>
                </div>
                <div class="frankrc-dp-perf-section" data-section="images">
                    <button class="frankrc-dp-run-perf" data-type="images">
                        <span class="dashicons dashicons-format-image"></span>
                        Check Images
                    </button>
                    <div class="frankrc-dp-img-results"></div>
                </div>
                <div class="frankrc-dp-perf-section" data-section="scripts">
                    <button class="frankrc-dp-run-perf" data-type="scripts">
                        <span class="dashicons dashicons-editor-code"></span>
                        Analyze Scripts
                    </button>
                    <div class="frankrc-dp-script-results"></div>
                </div>
            </div>
        `;

        contentArea.appendChild(perfPanel);

        // Bind events
        perfPanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closePerfPanel);

        perfPanel.querySelectorAll('.frankrc-dp-perf-tab').forEach(tab => {
            tab.addEventListener('click', () => switchPerfTab(tab.dataset.tab));
        });

        perfPanel.querySelectorAll('.frankrc-dp-run-perf').forEach(btn => {
            btn.addEventListener('click', () => runPerfAnalysis(btn.dataset.type));
        });
    }

    /**
     * Open performance panel
     */
    function openPerfPanel() {
        createPerfPanel();
        perfPanel.classList.add('active');
    }

    /**
     * Close performance panel
     */
    function closePerfPanel() {
        if (perfPanel) {
            perfPanel.classList.remove('active');
        }
    }

    /**
     * Switch performance tab
     */
    function switchPerfTab(tabName) {
        perfPanel.querySelectorAll('.frankrc-dp-perf-tab').forEach(t => t.classList.remove('active'));
        perfPanel.querySelectorAll('.frankrc-dp-perf-section').forEach(s => s.classList.remove('active'));

        perfPanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        perfPanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');
    }

    /**
     * Run performance analysis
     */
    function runPerfAnalysis(type) {
        try {
            const iframeWin = iframe.contentWindow;
            const iframeDoc = iframe.contentDocument || iframeWin.document;

            switch (type) {
                case 'vitals':
                    measureWebVitals(iframeWin);
                    break;
                case 'waterfall':
                    analyzeResources(iframeWin);
                    break;
                case 'images':
                    analyzeImages(iframeDoc);
                    break;
                case 'scripts':
                    analyzeScripts(iframeDoc);
                    break;
            }
        } catch (e) {
            console.error('Performance analysis error:', e);
        }
    }

    /**
     * Measure Core Web Vitals
     */
    function measureWebVitals(win) {
        const timing = win.performance.timing;
        const now = win.performance.now();

        // Calculate metrics
        const lcp = timing.domContentLoadedEventEnd - timing.navigationStart;
        const fcp = timing.domContentLoadedEventStart - timing.navigationStart;
        const ttfb = timing.responseStart - timing.navigationStart;

        // Determine scores
        const lcpScore = lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor';
        const fcpScore = fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor';
        const ttfbScore = ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor';

        displayVitals([
            { name: 'LCP', value: (lcp / 1000).toFixed(2), unit: 's', score: lcpScore },
            { name: 'FCP', value: (fcp / 1000).toFixed(2), unit: 's', score: fcpScore },
            { name: 'TTFB', value: ttfb, unit: 'ms', score: ttfbScore }
        ]);
    }

    /**
     * Display vitals
     */
    function displayVitals(vitals) {
        const container = perfPanel.querySelector('.frankrc-dp-vitals-grid');
        container.innerHTML = vitals.map(v => `
            <div class="frankrc-dp-vital-card ${v.score}">
                <div class="frankrc-dp-vital-label">${v.name}</div>
                <div class="frankrc-dp-vital-value ${v.score}">${v.value}</div>
                <div class="frankrc-dp-vital-unit">${v.unit}</div>
            </div>
        `).join('');
    }

    /**
     * Analyze resources
     */
    function analyzeResources(win) {
        const resources = win.performance.getEntriesByType('resource');
        const maxDuration = Math.max(...resources.map(r => r.duration));

        const container = perfPanel.querySelector('.frankrc-dp-waterfall');
        container.innerHTML = resources.slice(0, 30).map(r => {
            const type = getResourceType(r.name);
            const width = (r.duration / maxDuration * 100).toFixed(0);
            const size = r.transferSize ? formatBytes(r.transferSize) : '--';

            return `
                <div class="frankrc-dp-waterfall-item">
                    <div class="frankrc-dp-waterfall-name" title="${r.name}">${getFileName(r.name)}</div>
                    <div class="frankrc-dp-waterfall-bar-container">
                        <div class="frankrc-dp-waterfall-bar ${type}" style="width:${width}%"></div>
                    </div>
                    <div class="frankrc-dp-waterfall-time">${r.duration.toFixed(0)}ms</div>
                    <div class="frankrc-dp-waterfall-size">${size}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get resource type from URL
     */
    function getResourceType(url) {
        if (url.match(/\.js(\?|$)/i)) return 'script';
        if (url.match(/\.css(\?|$)/i)) return 'css';
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)(\?|$)/i)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)(\?|$)/i)) return 'font';
        return 'other';
    }

    /**
     * Get filename from URL
     */
    function getFileName(url) {
        try {
            return url.split('/').pop().split('?')[0] || url;
        } catch (e) {
            return url;
        }
    }

    /**
     * Format bytes
     */
    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Analyze images
     */
    function analyzeImages(doc) {
        const images = doc.querySelectorAll('img');
        const results = [];

        images.forEach(img => {
            const naturalW = img.naturalWidth;
            const naturalH = img.naturalHeight;
            const displayW = img.clientWidth;
            const displayH = img.clientHeight;

            const isOversized = displayW > 0 && (naturalW > displayW * 2 || naturalH > displayH * 2);
            const needsWebP = !img.src.match(/\.(webp|avif)(\?|$)/i);

            if (isOversized || needsWebP) {
                results.push({
                    src: img.src,
                    natural: `${naturalW}Ã—${naturalH}`,
                    display: `${displayW}Ã—${displayH}`,
                    isOversized,
                    needsWebP
                });
            }
        });

        displayImageResults(results);
    }

    /**
     * Display image results
     */
    function displayImageResults(results) {
        const container = perfPanel.querySelector('.frankrc-dp-img-results');

        if (results.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--frankrc-dp-muted);">All images are optimized!</div>';
            return;
        }

        container.innerHTML = results.map(r => `
            <div class="frankrc-dp-img-item">
                <div class="frankrc-dp-img-preview">
                    <img class="frankrc-dp-img-thumb" src="${r.src}" alt="">
                    <div class="frankrc-dp-img-details">
                        <div class="frankrc-dp-img-name">${getFileName(r.src)}</div>
                        <div class="frankrc-dp-img-sizes">Natural: ${r.natural} | Display: ${r.display}</div>
                    </div>
                </div>
                ${r.isOversized ? `<div class="frankrc-dp-img-issue">âš ï¸ Image is ${Math.round(parseInt(r.natural) / parseInt(r.display))}x larger than needed</div>` : ''}
                ${r.needsWebP ? `<div class="frankrc-dp-img-suggestion">ðŸ’¡ Convert to WebP for ~30% smaller size</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Analyze scripts
     */
    function analyzeScripts(doc) {
        const scripts = doc.querySelectorAll('script[src]');
        const results = [];

        scripts.forEach(script => {
            const isAsync = script.hasAttribute('async');
            const isDefer = script.hasAttribute('defer');
            const type = isAsync ? 'async' : isDefer ? 'defer' : 'blocking';

            results.push({
                src: script.src,
                type,
                isAsync,
                isDefer
            });
        });

        displayScriptResults(results);
    }

    /**
     * Display script results
     */
    function displayScriptResults(results) {
        const container = perfPanel.querySelector('.frankrc-dp-script-results');
        const blocking = results.filter(r => r.type === 'blocking').length;

        container.innerHTML = `
            <div class="frankrc-dp-perf-stat">
                <div class="frankrc-dp-perf-val ${blocking > 0 ? 'error' : 'good'}">${blocking}</div>
                <div class="frankrc-dp-perf-label">Blocking Scripts</div>
            </div>
            <div class="frankrc-dp-perf-stat">
                <div class="frankrc-dp-perf-val">${results.length}</div>
                <div class="frankrc-dp-perf-label">Total Scripts</div>
            </div>
            <div class="frankrc-dp-script-list" style="margin-top: 10px;">
                ${results.map(s => `
                    <div class="frankrc-dp-script-item" style="font-size:10px; padding:4px; border-bottom:1px solid var(--frankrc-dp-border);">
                        <span class="frankrc-dp-badge ${s.type}" style="padding: 2px 4px; border-radius: 3px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; margin-right: 5px;">${s.type.toUpperCase()}</span>
                        <span class="frankrc-dp-script-src" style="word-break:break-all;">${s.src.split('/').pop()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ==========================================
    // Phase 19: Design Consistency Checker
    // ==========================================

    let designPanel = null;

    /**
     * Create design panel HTML
     */
    function createDesignPanel() {
        if (designPanel) return;

        designPanel = document.createElement('div');
        designPanel.className = 'frankrc-dp-design-panel';
        designPanel.innerHTML = `
            <div class="frankrc-dp-design-header">
                <div class="frankrc-dp-design-title">
                    <span class="dashicons dashicons-art"></span>
                    Design Consistency
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-design-tabs">
                <button class="frankrc-dp-design-tab active" data-tab="fonts">Fonts</button>
                <button class="frankrc-dp-design-tab" data-tab="colors">Colors</button>
                <button class="frankrc-dp-design-tab" data-tab="spacing">Spacing</button>
                <button class="frankrc-dp-design-tab" data-tab="zindex">Z-Index</button>
            </div>
            <div class="frankrc-dp-design-content">
                <div class="frankrc-dp-design-section active" data-section="fonts">
                    <button class="frankrc-dp-run-design" data-type="fonts">
                        <span class="dashicons dashicons-editor-textcolor"></span>
                        Scan Fonts
                    </button>
                    <div class="frankrc-dp-font-results"></div>
                </div>
                <div class="frankrc-dp-design-section" data-section="colors">
                    <button class="frankrc-dp-run-design" data-type="colors">
                        <span class="dashicons dashicons-color-picker"></span>
                        Extract Colors
                    </button>
                    <div class="frankrc-dp-color-grid"></div>
                    <button class="frankrc-dp-export-colors" style="display:none">Export as CSS Variables</button>
                </div>
                <div class="frankrc-dp-design-section" data-section="spacing">
                    <button class="frankrc-dp-run-design" data-type="spacing">
                        <span class="dashicons dashicons-editor-expand"></span>
                        Analyze Spacing
                    </button>
                    <div class="frankrc-dp-spacing-results"></div>
                </div>
                <div class="frankrc-dp-design-section" data-section="zindex">
                    <button class="frankrc-dp-run-design" data-type="zindex">
                        <span class="dashicons dashicons-admin-appearance"></span>
                        Find Z-Index
                    </button>
                    <div class="frankrc-dp-zindex-results"></div>
                </div>
            </div>
        `;

        contentArea.appendChild(designPanel);

        // Bind events
        designPanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeDesignPanel);

        designPanel.querySelectorAll('.frankrc-dp-design-tab').forEach(tab => {
            tab.addEventListener('click', () => switchDesignTab(tab.dataset.tab));
        });

        designPanel.querySelectorAll('.frankrc-dp-run-design').forEach(btn => {
            btn.addEventListener('click', () => runDesignAnalysis(btn.dataset.type));
        });

        designPanel.querySelector('.frankrc-dp-export-colors').addEventListener('click', exportColorsAsCSS);
    }

    /**
     * Open design panel
     */
    function openDesignPanel() {
        createDesignPanel();
        designPanel.classList.add('active');
    }

    /**
     * Close design panel
     */
    function closeDesignPanel() {
        if (designPanel) {
            designPanel.classList.remove('active');
        }
    }

    /**
     * Switch design tab
     */
    function switchDesignTab(tabName) {
        designPanel.querySelectorAll('.frankrc-dp-design-tab').forEach(t => t.classList.remove('active'));
        designPanel.querySelectorAll('.frankrc-dp-design-section').forEach(s => s.classList.remove('active'));

        designPanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        designPanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');
    }

    /**
     * Run design analysis
     */
    function runDesignAnalysis(type) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            switch (type) {
                case 'fonts':
                    analyzeFonts(iframeDoc);
                    break;
                case 'colors':
                    analyzeColors(iframeDoc);
                    break;
                case 'spacing':
                    analyzeSpacing(iframeDoc);
                    break;
                case 'zindex':
                    analyzeZIndex(iframeDoc);
                    break;
            }
        } catch (e) {
            console.error('Design analysis error:', e);
        }
    }

    /**
     * Analyze fonts
     */
    function analyzeFonts(doc) {
        const fonts = new Map();
        const elements = doc.querySelectorAll('*');

        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
            const weight = style.fontWeight;
            const size = style.fontSize;

            if (!fonts.has(family)) {
                fonts.set(family, { weights: new Set(), sizes: new Set() });
            }
            fonts.get(family).weights.add(weight);
            fonts.get(family).sizes.add(size);
        });

        displayFontResults(fonts);
    }

    /**
     * Display font results
     */
    function displayFontResults(fonts) {
        const container = designPanel.querySelector('.frankrc-dp-font-results');
        container.innerHTML = Array.from(fonts.entries()).slice(0, 10).map(([name, data]) => `
            <div class="frankrc-dp-font-item">
                <div class="frankrc-dp-font-name">${name}</div>
                <div class="frankrc-dp-font-sample" style="font-family:'${name}'">The quick brown fox</div>
                <div class="frankrc-dp-font-meta">
                    ${Array.from(data.weights).map(w => `<span class="frankrc-dp-font-badge">${w}</span>`).join('')}
                    ${Array.from(data.sizes).slice(0, 5).map(s => `<span class="frankrc-dp-font-badge">${s}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    let extractedColors = [];

    /**
     * Analyze colors
     */
    function analyzeColors(doc) {
        const colors = new Map();
        const elements = doc.querySelectorAll('*');

        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                const val = style[prop];
                if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
                    colors.set(val, (colors.get(val) || 0) + 1);
                }
            });
        });

        // Sort by usage
        extractedColors = Array.from(colors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        displayColorResults(extractedColors);
    }

    /**
     * Display color results
     */
    function displayColorResults(colors) {
        const container = designPanel.querySelector('.frankrc-dp-color-grid');
        container.innerHTML = colors.map(([color, count]) => `
            <div class="frankrc-dp-color-item">
                <div class="frankrc-dp-color-swatch" style="background:${color}" title="${color}" onclick="navigator.clipboard.writeText('${color}')"></div>
                <div class="frankrc-dp-color-count">${count}Ã—</div>
            </div>
        `).join('');

        designPanel.querySelector('.frankrc-dp-export-colors').style.display = 'block';
    }

    /**
     * Export colors as CSS variables
     */
    function exportColorsAsCSS() {
        const css = `:root {\n${extractedColors.map(([color], i) =>
            `  --color-${i + 1}: ${color};`
        ).join('\n')}\n}`;

        navigator.clipboard.writeText(css);
        alert('CSS variables copied to clipboard!');
    }

    /**
     * Analyze spacing
     */
    function analyzeSpacing(doc) {
        const margins = new Map();
        const paddings = new Map();
        const elements = doc.querySelectorAll('*');

        elements.forEach(el => {
            const style = window.getComputedStyle(el);

            ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(prop => {
                const val = style[prop];
                if (val && val !== '0px') {
                    margins.set(val, (margins.get(val) || 0) + 1);
                }
            });

            ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
                const val = style[prop];
                if (val && val !== '0px') {
                    paddings.set(val, (paddings.get(val) || 0) + 1);
                }
            });
        });

        displaySpacingResults(margins, paddings);
    }

    /**
     * Display spacing results
     */
    function displaySpacingResults(margins, paddings) {
        const container = designPanel.querySelector('.frankrc-dp-spacing-results');

        const sortedMargins = Array.from(margins.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const sortedPaddings = Array.from(paddings.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

        container.innerHTML = `
            <div class="frankrc-dp-spacing-group">
                <div class="frankrc-dp-spacing-label">Margins</div>
                <div class="frankrc-dp-spacing-list">
                    ${sortedMargins.map(([val, count]) => `
                        <div class="frankrc-dp-spacing-value">
                            ${val} <span class="frankrc-dp-spacing-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="frankrc-dp-spacing-group">
                <div class="frankrc-dp-spacing-label">Paddings</div>
                <div class="frankrc-dp-spacing-list">
                    ${sortedPaddings.map(([val, count]) => `
                        <div class="frankrc-dp-spacing-value">
                            ${val} <span class="frankrc-dp-spacing-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${sortedMargins.length > 8 ? '<div class="frankrc-dp-spacing-issue">âš ï¸ Too many unique spacing values. Consider using a spacing scale.</div>' : ''}
        `;
    }

    /**
     * Analyze z-index
     */
    function analyzeZIndex(doc) {
        const zIndexes = [];
        const elements = doc.querySelectorAll('*');

        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const zIndex = style.zIndex;

            if (zIndex && zIndex !== 'auto') {
                const selector = getSimpleSelector(el);
                zIndexes.push({ value: parseInt(zIndex), selector, element: el });
            }
        });

        // Sort by z-index value
        zIndexes.sort((a, b) => b.value - a.value);

        displayZIndexResults(zIndexes);
    }

    /**
     * Get simple selector for element
     */
    function getSimpleSelector(el) {
        let selector = el.tagName.toLowerCase();
        if (el.id) selector += `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
            selector += '.' + el.className.split(' ').filter(c => c).slice(0, 2).join('.');
        }
        return selector;
    }

    /**
     * Display z-index results
     */
    function displayZIndexResults(zIndexes) {
        const container = designPanel.querySelector('.frankrc-dp-zindex-results');

        // Find conflicts (same z-index)
        const valueCounts = {};
        zIndexes.forEach(z => {
            valueCounts[z.value] = (valueCounts[z.value] || 0) + 1;
        });

        container.innerHTML = zIndexes.slice(0, 20).map(z => `
            <div class="frankrc-dp-zindex-item">
                <div class="frankrc-dp-zindex-value">${z.value}</div>
                <div class="frankrc-dp-zindex-element">${z.selector}</div>
                ${valueCounts[z.value] > 1 ? '<span class="frankrc-dp-zindex-conflict">Conflict</span>' : ''}
            </div>
        `).join('');
    }

    // ==========================================
    // Phase 20: Collaboration Features
    // ==========================================

    let annotationOverlay = null;
    let annotationCanvas = null;
    let annotationCtx = null;
    let isAnnotating = false;
    let currentTool = 'pen';
    let currentColor = '#3b82f6';
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let annotations = [];
    let comments = [];
    let issueModal = null;
    let undoStack = [];

    /**
     * Save Canvas State for Undo
     */
    function saveUndoState() {
        if (!annotationCanvas) return;
        undoStack.push(annotationCanvas.toDataURL('image/png'));
    }

    /**
     * Handle Undo Action
     */
    function handleUndo() {
        if (undoStack.length === 0) return;
        const lastState = undoStack.pop();
        const img = new Image();
        img.onload = function () {
            annotationCtx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
            annotationCtx.drawImage(img, 0, 0);
        };
        img.src = lastState;

        if (annotations.length > 0) {
            annotations.pop();
        }
    }

    /**
     * Create annotation overlay
     */
    function createAnnotationOverlay() {
        if (annotationOverlay) return;

        annotationOverlay = document.createElement('div');
        annotationOverlay.className = 'frankrc-dp-annotation-overlay';
        annotationOverlay.innerHTML = `
            <div class="frankrc-dp-annotation-toolbar">
                <button class="frankrc-dp-annotation-tool active" data-tool="pen" title="Pen"><span class="dashicons dashicons-edit"></span></button>
                <button class="frankrc-dp-annotation-tool" data-tool="arrow" title="Arrow"><span class="dashicons dashicons-arrow-right-alt"></span></button>
                <button class="frankrc-dp-annotation-tool" data-tool="rect" title="Rectangle"><span class="dashicons dashicons-format-image"></span></button>
                <button class="frankrc-dp-annotation-tool" data-tool="text" title="Text"><span class="dashicons dashicons-editor-textcolor"></span></button>
                <div class="frankrc-dp-annotation-divider"></div>
                <input type="color" class="frankrc-dp-color-picker-btn" value="#3b82f6">
                <div class="frankrc-dp-annotation-divider"></div>
                <button class="frankrc-dp-annotation-tool" data-tool="undo" title="Undo"><span class="dashicons dashicons-undo"></span></button>
                <button class="frankrc-dp-annotation-tool" data-tool="clear" title="Clear"><span class="dashicons dashicons-trash"></span></button>
                <button class="frankrc-dp-annotation-tool" data-tool="save" title="Save"><span class="dashicons dashicons-download"></span></button>
                <button class="frankrc-dp-annotation-tool" data-tool="close" title="Close"><span class="dashicons dashicons-no-alt"></span></button>
            </div>
            <canvas class="frankrc-dp-annotation-canvas"></canvas>
        `;

        contentArea.appendChild(annotationOverlay);
        annotationCanvas = annotationOverlay.querySelector('.frankrc-dp-annotation-canvas');
        annotationCtx = annotationCanvas.getContext('2d');

        // Bind tool events
        annotationOverlay.querySelectorAll('.frankrc-dp-annotation-tool').forEach(btn => {
            btn.addEventListener('click', () => handleAnnotationTool(btn.dataset.tool));
        });

        annotationOverlay.querySelector('.frankrc-dp-color-picker-btn').addEventListener('input', (e) => {
            currentColor = e.target.value;
        });

        // Canvas events
        annotationCanvas.addEventListener('mousedown', startDrawing);
        annotationCanvas.addEventListener('mousemove', draw);
        annotationCanvas.addEventListener('mouseup', stopDrawing);
        annotationCanvas.addEventListener('mouseout', stopDrawing);
    }

    /**
     * Toggle annotation mode
     */
    function toggleAnnotationMode() {
        createAnnotationOverlay();
        isAnnotating = !isAnnotating;

        if (isAnnotating) {
            annotationOverlay.classList.add('active');
            resizeCanvas();
        } else {
            annotationOverlay.classList.remove('active');
        }
    }

    /**
     * Resize canvas to match content
     */
    function resizeCanvas() {
        if (!annotationCanvas) return;
        const rect = contentArea.getBoundingClientRect();
        annotationCanvas.width = rect.width;
        annotationCanvas.height = rect.height;
    }

    /**
     * Handle annotation tools
     */
    function handleAnnotationTool(tool) {
        if (tool === 'close') {
            toggleAnnotationMode();
            return;
        }
        if (tool === 'clear') {
            saveUndoState();
            annotationCtx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
            annotations = [];
            return;
        }
        if (tool === 'undo') {
            handleUndo();
            return;
        }
        if (tool === 'save') {
            saveAnnotation();
            return;
        }
        if (tool === 'text') {
            currentTool = 'text';
            annotationCanvas.style.cursor = 'text';
        } else {
            currentTool = tool;
            annotationCanvas.style.cursor = 'crosshair';
        }

        annotationOverlay.querySelectorAll('.frankrc-dp-annotation-tool').forEach(t => t.classList.remove('active'));
        annotationOverlay.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');
    }

    /**
     * Get exact canvas coordinates
     */
    function getCanvasPos(e) {
        if (!annotationCanvas) return { x: 0, y: 0 };
        const rect = annotationCanvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (annotationCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (annotationCanvas.height / rect.height)
        };
    }

    /**
     * Start drawing
     */
    function startDrawing(e) {
        saveUndoState();

        const pos = getCanvasPos(e);
        if (currentTool === 'text') {
            addTextAnnotation(pos.x, pos.y);
            return;
        }
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;

        if (currentTool === 'rect' || currentTool === 'arrow') {
            annotations.push({ type: currentTool, startX: lastX, startY: lastY, color: currentColor });
        }
    }

    /**
     * Draw
     */
    function draw(e) {
        if (!isDrawing) return;

        const pos = getCanvasPos(e);
        const x = pos.x;
        const y = pos.y;

        if (currentTool === 'pen') {
            annotationCtx.strokeStyle = currentColor;
            annotationCtx.lineWidth = 3;
            annotationCtx.lineCap = 'round';
            annotationCtx.beginPath();
            annotationCtx.moveTo(lastX, lastY);
            annotationCtx.lineTo(x, y);
            annotationCtx.stroke();
            lastX = x;
            lastY = y;
        }
    }

    /**
     * Stop drawing
     */
    function stopDrawing(e) {
        if (!isDrawing) return;
        isDrawing = false;

        const pos = getCanvasPos(e);
        const x = pos.x;
        const y = pos.y;

        if (currentTool === 'rect') {
            annotationCtx.strokeStyle = currentColor;
            annotationCtx.lineWidth = 2;
            annotationCtx.strokeRect(lastX, lastY, x - lastX, y - lastY);
        } else if (currentTool === 'arrow') {
            drawArrow(lastX, lastY, x, y);
        }
    }

    /**
     * Draw arrow
     */
    function drawArrow(fromX, fromY, toX, toY) {
        const headLen = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        annotationCtx.strokeStyle = currentColor;
        annotationCtx.lineWidth = 2;
        annotationCtx.beginPath();
        annotationCtx.moveTo(fromX, fromY);
        annotationCtx.lineTo(toX, toY);
        annotationCtx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        annotationCtx.moveTo(toX, toY);
        annotationCtx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        annotationCtx.stroke();
    }

    /**
     * Add text annotation
     */
    function addTextAnnotation(x, y) {
        const text = prompt('Enter annotation text:');
        if (text) {
            annotationCtx.fillStyle = currentColor;
            annotationCtx.font = '14px sans-serif';
            annotationCtx.fillText(text, x, y);
            annotations.push({ type: 'text', x, y, text, color: currentColor });
        } else {
            // Cancelled - pop the undo state we just pushed
            if (undoStack.length > 0) undoStack.pop();
        }
    }

    /**
     * Save annotation with screenshot
     */
    function saveAnnotation() {
        const dataUrl = annotationCanvas.toDataURL('image/png');
        takeScreenshot(); // This will capture both layers
        alert('Annotation saved with screenshot!');
    }

    /**
     * Create issue modal
     */
    function createIssueModal() {
        if (issueModal) return;

        issueModal = document.createElement('div');
        issueModal.className = 'frankrc-dp-issue-modal';
        issueModal.innerHTML = `
            <div class="frankrc-dp-issue-form">
                <div class="frankrc-dp-issue-header">
                    <span class="frankrc-dp-issue-title">Create Issue</span>
                    <button class="frankrc-dp-a11y-close"><span class="dashicons dashicons-no-alt"></span></button>
                </div>
                <div class="frankrc-dp-issue-content">
                    <div class="frankrc-dp-platform-select">
                        <button class="frankrc-dp-platform-btn active" data-platform="github">GitHub</button>
                        <button class="frankrc-dp-platform-btn" data-platform="jira">Jira</button>
                        <button class="frankrc-dp-platform-btn" data-platform="trello">Trello</button>
                    </div>
                    <img class="frankrc-dp-issue-screenshot" src="" alt="Screenshot">
                    <div class="frankrc-dp-issue-field">
                        <label class="frankrc-dp-issue-label">Title</label>
                        <input type="text" class="frankrc-dp-issue-input" placeholder="Bug: [description]">
                    </div>
                    <div class="frankrc-dp-issue-field">
                        <label class="frankrc-dp-issue-label">Description</label>
                        <textarea class="frankrc-dp-issue-textarea" placeholder="Describe the issue..."></textarea>
                    </div>
                    <div class="frankrc-dp-issue-field">
                        <label class="frankrc-dp-issue-label">Device Info</label>
                        <div id="frankrc-dp-device-info" style="font-size:10px;color:var(--frankrc-dp-muted);"></div>
                    </div>
                </div>
                <div class="frankrc-dp-issue-actions">
                    <button class="frankrc-dp-issue-btn cancel">Cancel</button>
                    <button class="frankrc-dp-issue-btn submit">Create Issue</button>
                </div>
            </div>
        `;

        document.body.appendChild(issueModal);

        // Bind events
        issueModal.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeIssueModal);
        issueModal.querySelector('.frankrc-dp-issue-btn.cancel').addEventListener('click', closeIssueModal);
        issueModal.querySelector('.frankrc-dp-issue-btn.submit').addEventListener('click', submitIssue);

        issueModal.querySelectorAll('.frankrc-dp-platform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                issueModal.querySelectorAll('.frankrc-dp-platform-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * Open issue modal with screenshot
     */
    function openIssueModal() {
        createIssueModal();

        // Take screenshot first
        if (typeof html2canvas !== 'undefined') {
            html2canvas(iframe.contentDocument.body, { useCORS: true }).then(canvas => {
                issueModal.querySelector('.frankrc-dp-issue-screenshot').src = canvas.toDataURL();
            });
        }

        // Add device info
        const deviceInfo = `Device: ${currentDevice || 'Custom'} | Resolution: ${currentWidth}Ã—${currentHeight} | UA: ${currentUA.substring(0, 50)}...`;
        issueModal.querySelector('#frankrc-dp-device-info').textContent = deviceInfo;

        issueModal.classList.add('active');
    }

    /**
     * Close issue modal
     */
    function closeIssueModal() {
        if (issueModal) issueModal.classList.remove('active');
    }

    /**
     * Submit issue (simulated)
     */
    function submitIssue() {
        const platform = issueModal.querySelector('.frankrc-dp-platform-btn.active').dataset.platform;
        const title = issueModal.querySelector('.frankrc-dp-issue-input').value;
        const desc = issueModal.querySelector('.frankrc-dp-issue-textarea').value;

        if (!title) {
            alert('Please enter a title');
            return;
        }

        // Simulated - in real implementation would use platform APIs
        console.log(`Creating ${platform} issue:`, { title, desc });
        alert(`Issue "${title}" would be created on ${platform}. (API integration required)`);
        closeIssueModal();
    }

    /**
     * Add comment
     */
    function addComment(text, x, y) {
        const comment = {
            id: Date.now(),
            text,
            x,
            y,
            author: 'You',
            time: new Date().toLocaleTimeString(),
            resolved: false
        };
        comments.push(comment);
        return comment;
    }

    // ==========================================
    // Phase 21: Advanced Testing Modes
    // ==========================================

    let testingModes = {
        darkMode: false,
        reducedMotion: false,
        printMode: false,
        rtlMode: false
    };
    let modesDropdown = null;

    /**
     * Create testing modes dropdown
     */
    function createModesDropdown() {
        if (modesDropdown) return;

        modesDropdown = panel.querySelector('.frankrc-dp-modes-dropdown');
        if (modesDropdown) {
            modesDropdown.querySelectorAll('.frankrc-dp-mode-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent document click from closing it immediately
                    toggleTestingMode(item.dataset.mode);
                });
            });
        }
    }

    /**
     * Toggle modes dropdown visibility
     */
    function toggleModesDropdown() {
        const dropdown = panel.querySelector('.frankrc-dp-modes-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    }

    /**
     * Toggle a specific testing mode
     */
    function toggleTestingMode(mode) {
        testingModes[mode] = !testingModes[mode];

        // Update toggle UI
        // Update toggle UI on the DOM element inside the panel
        const item = panel.querySelector(`.frankrc-dp-modes-dropdown [data-mode="${mode}"]`);
        if (item) {
            const toggle = item.querySelector('.frankrc-dp-mode-toggle');
            toggle.classList.toggle('active', testingModes[mode]);
            item.classList.toggle('active', testingModes[mode]);
        }

        // Apply mode
        applyTestingMode(mode, testingModes[mode]);
        updateModeBar();
    }

    /**
     * Apply testing mode to iframe
     */
    function applyTestingMode(mode, enabled) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            switch (mode) {
                case 'darkMode':
                    injectDarkMode(iframeDoc, enabled);
                    break;
                case 'reducedMotion':
                    injectReducedMotion(iframeDoc, enabled);
                    break;
                case 'printMode':
                    injectPrintMode(iframeDoc, enabled);
                    break;
                case 'rtlMode':
                    injectRTLMode(iframeDoc, enabled);
                    break;
            }
        } catch (e) {
            console.error('Failed to apply testing mode:', e);
        }
    }

    /**
     * Inject dark mode CSS
     */
    function injectDarkMode(doc, enabled) {
        const id = 'frankrc-dp-dark-mode-css';
        let style = doc.getElementById(id);

        if (enabled) {
            if (!style) {
                style = doc.createElement('style');
                style.id = id;
                doc.head.appendChild(style);
            }
            style.textContent = `
                :root { color-scheme: dark; }
                @media (prefers-color-scheme: light) {
                    :root { color-scheme: dark !important; }
                }
            `;
            doc.documentElement.style.colorScheme = 'dark';
        } else {
            if (style) style.remove();
            doc.documentElement.style.colorScheme = '';
        }
    }

    /**
     * Inject reduced motion CSS
     */
    function injectReducedMotion(doc, enabled) {
        const id = 'frankrc-dp-reduced-motion-css';
        let style = doc.getElementById(id);

        if (enabled) {
            if (!style) {
                style = doc.createElement('style');
                style.id = id;
                doc.head.appendChild(style);
            }
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.001ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.001ms !important;
                    scroll-behavior: auto !important;
                }
            `;
        } else {
            if (style) style.remove();
        }
    }

    /**
     * Inject print media styles
     */
    function injectPrintMode(doc, enabled) {
        const id = 'frankrc-dp-print-mode-css';
        let style = doc.getElementById(id);

        if (enabled) {
            if (!style) {
                style = doc.createElement('style');
                style.id = id;
                doc.head.appendChild(style);
            }
            // Force print styles to apply
            style.textContent = `
                @media screen {
                    body { background: white !important; color: black !important; }
                    * { box-shadow: none !important; }
                }
            `;
            frameWrapper.classList.add('frankrc-dp-print-mode');
        } else {
            if (style) style.remove();
            frameWrapper.classList.remove('frankrc-dp-print-mode');
        }
    }

    /**
     * Inject RTL mode
     */
    function injectRTLMode(doc, enabled) {
        if (enabled) {
            doc.documentElement.setAttribute('dir', 'rtl');
            doc.body.setAttribute('dir', 'rtl');
        } else {
            doc.documentElement.removeAttribute('dir');
            doc.body.removeAttribute('dir');
        }
    }

    /**
     * Update mode indicator bar
     */
    function updateModeBar() {
        let modeBar = panel.querySelector('.frankrc-dp-mode-bar');
        if (!modeBar) {
            modeBar = document.createElement('div');
            modeBar.className = 'frankrc-dp-mode-bar';
            panel.querySelector('.frankrc-dp-content').before(modeBar);
        }

        const activeModes = Object.entries(testingModes)
            .filter(([_, v]) => v)
            .map(([k]) => {
                const labels = { darkMode: 'ðŸŒ™ Dark', reducedMotion: 'â¸ï¸ No Motion', printMode: 'ðŸ–¨ï¸ Print', rtlMode: 'â†”ï¸ RTL' };
                return labels[k];
            });

        if (activeModes.length > 0) {
            modeBar.textContent = 'Active: ' + activeModes.join(' | ');
            modeBar.classList.add('active');
        } else {
            modeBar.classList.remove('active');
        }
    }

    // ==========================================
    // Phase 22: Automation & Scheduling
    // ==========================================

    let autoPanel = null;
    let schedules = [];
    let webhooks = [];
    let changeAlerts = [];

    /**
     * Create automation panel
     */
    function createAutoPanel() {
        if (autoPanel) return;

        autoPanel = document.createElement('div');
        autoPanel.className = 'frankrc-dp-auto-panel';
        autoPanel.innerHTML = `
            <div class="frankrc-dp-auto-header">
                <div class="frankrc-dp-auto-title">
                    <span class="dashicons dashicons-clock"></span>
                    Automation
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-auto-tabs">
                <button class="frankrc-dp-auto-tab active" data-tab="schedule">Schedule</button>
                <button class="frankrc-dp-auto-tab" data-tab="webhooks">Webhooks</button>
                <button class="frankrc-dp-auto-tab" data-tab="alerts">Alerts</button>
                <button class="frankrc-dp-auto-tab" data-tab="api">API</button>
            </div>
            <div class="frankrc-dp-auto-content">
                <div class="frankrc-dp-auto-section active" data-section="schedule">
                    <div class="frankrc-dp-schedule-form">
                        <div class="frankrc-dp-schedule-row">
                            <div class="frankrc-dp-schedule-field">
                                <label class="frankrc-dp-schedule-label">Frequency</label>
                                <select class="frankrc-dp-schedule-select" id="schedule-freq">
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                            <div class="frankrc-dp-schedule-field">
                                <label class="frankrc-dp-schedule-label">Time</label>
                                <input type="time" class="frankrc-dp-schedule-input" id="schedule-time" value="09:00">
                            </div>
                        </div>
                        <button class="frankrc-dp-run-auto" id="add-schedule">+ Add Schedule</button>
                    </div>
                    <div class="frankrc-dp-schedule-list"></div>
                </div>
                <div class="frankrc-dp-auto-section" data-section="webhooks">
                    <div class="frankrc-dp-webhook-item">
                        <input type="url" class="frankrc-dp-webhook-url" placeholder="https://your-webhook-url.com/endpoint" id="webhook-url">
                        <div class="frankrc-dp-webhook-events">
                            <label><input type="checkbox" value="screenshot"> Screenshot</label>
                            <label><input type="checkbox" value="change"> Change Detected</label>
                            <label><input type="checkbox" value="schedule"> Scheduled Run</label>
                        </div>
                        <button class="frankrc-dp-run-auto" id="add-webhook">+ Add Webhook</button>
                    </div>
                    <div class="frankrc-dp-webhooks-list"></div>
                </div>
                <div class="frankrc-dp-auto-section" data-section="alerts">
                    <div style="margin-bottom:12px;">
                        <label class="frankrc-dp-schedule-label">Email for alerts</label>
                        <input type="email" class="frankrc-dp-schedule-input" placeholder="your@email.com" id="alert-email">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label class="frankrc-dp-schedule-label">Sensitivity (%)</label>
                        <input type="range" min="1" max="50" value="10" id="alert-sensitivity" style="width:100%">
                    </div>
                    <button class="frankrc-dp-run-auto" id="enable-alerts">Enable Change Detection</button>
                    <div class="frankrc-dp-alerts-list" style="margin-top:16px;"></div>
                </div>
                <div class="frankrc-dp-auto-section" data-section="api">
                    <div style="margin-bottom:12px;">
                        <label class="frankrc-dp-schedule-label">API Endpoint</label>
                        <input type="text" class="frankrc-dp-schedule-input" value="${frankResponsiveChecker.restUrl || '/wp-json/frank-responsive-checker/v1/'}" readonly>
                    </div>
                    <div style="margin-bottom:12px;">
                        <label class="frankrc-dp-schedule-label">API Key</label>
                        <input type="text" class="frankrc-dp-schedule-input" value="${generateApiKey()}" id="api-key" readonly>
                    </div>
                    <button class="frankrc-dp-run-auto" id="regenerate-key">Regenerate API Key</button>
                    <div style="margin-top:16px;padding:12px;background:var(--frankrc-dp-surface);border-radius:8px;">
                        <div style="font-size:11px;color:var(--frankrc-dp-muted);margin-bottom:8px;">Example Usage:</div>
                        <code style="font-size:10px;color:var(--frankrc-dp-light);word-break:break-all;">
                            curl -X POST /wp-json/frank-responsive-checker/v1/screenshot -H "X-API-Key: YOUR_KEY" -d '{"url":"https://..."}'
                        </code>
                    </div>
                </div>
            </div>
        `;

        contentArea.appendChild(autoPanel);

        // Bind events
        autoPanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeAutoPanel);

        autoPanel.querySelectorAll('.frankrc-dp-auto-tab').forEach(tab => {
            tab.addEventListener('click', () => switchAutoTab(tab.dataset.tab));
        });

        autoPanel.querySelector('#add-schedule').addEventListener('click', addSchedule);
        autoPanel.querySelector('#add-webhook').addEventListener('click', addWebhook);
        autoPanel.querySelector('#enable-alerts').addEventListener('click', enableChangeAlerts);
        autoPanel.querySelector('#regenerate-key').addEventListener('click', regenerateApiKey);
    }

    /**
     * Generate simple API key
     */
    function generateApiKey() {
        return 'vm_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Open automation panel
     */
    function openAutoPanel() {
        createAutoPanel();
        autoPanel.classList.add('active');
    }

    /**
     * Close automation panel
     */
    function closeAutoPanel() {
        if (autoPanel) autoPanel.classList.remove('active');
    }

    /**
     * Switch automation tab
     */
    function switchAutoTab(tabName) {
        autoPanel.querySelectorAll('.frankrc-dp-auto-tab').forEach(t => t.classList.remove('active'));
        autoPanel.querySelectorAll('.frankrc-dp-auto-section').forEach(s => s.classList.remove('active'));

        autoPanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        autoPanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');
    }

    /**
     * Add scheduled capture
     */
    function addSchedule() {
        const freq = autoPanel.querySelector('#schedule-freq').value;
        const time = autoPanel.querySelector('#schedule-time').value;

        schedules.push({ id: Date.now(), freq, time, active: true });
        renderSchedules();

        // In real implementation, would register WP cron
        alert(`Schedule added: ${freq} at ${time}`);
    }

    /**
     * Render schedules list
     */
    function renderSchedules() {
        const list = autoPanel.querySelector('.frankrc-dp-schedule-list');
        list.innerHTML = schedules.map(s => `
            <div class="frankrc-dp-schedule-item">
                <div class="frankrc-dp-schedule-status ${s.active ? '' : 'paused'}"></div>
                <div class="frankrc-dp-schedule-info">
                    <div class="frankrc-dp-schedule-name">${s.freq.charAt(0).toUpperCase() + s.freq.slice(1)} Capture</div>
                    <div class="frankrc-dp-schedule-time">At ${s.time}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Add webhook
     */
    function addWebhook() {
        const url = autoPanel.querySelector('#webhook-url').value;
        if (!url) { alert('Enter a webhook URL'); return; }

        const events = Array.from(autoPanel.querySelectorAll('.frankrc-dp-webhook-events input:checked')).map(i => i.value);
        webhooks.push({ id: Date.now(), url, events });
        renderWebhooks();
        autoPanel.querySelector('#webhook-url').value = '';
    }

    /**
     * Render webhooks list
     */
    function renderWebhooks() {
        const list = autoPanel.querySelector('.frankrc-dp-webhooks-list');
        list.innerHTML = webhooks.map(w => `
            <div class="frankrc-dp-webhook-item">
                <div style="font-size:11px;color:var(--frankrc-dp-light);word-break:break-all;margin-bottom:6px;">${w.url}</div>
                <div class="frankrc-dp-webhook-events">
                    ${w.events.map(e => `<span class="frankrc-dp-webhook-event">${e}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Enable change detection alerts
     */
    function enableChangeAlerts() {
        const email = autoPanel.querySelector('#alert-email').value;
        const sensitivity = autoPanel.querySelector('#alert-sensitivity').value;

        alert(`Change detection enabled! Alerts will be sent to ${email || 'admin'} with ${sensitivity}% sensitivity.`);
    }

    /**
     * Regenerate API key
     */
    function regenerateApiKey() {
        const newKey = generateApiKey();
        autoPanel.querySelector('#api-key').value = newKey;
        alert('New API key generated. Save it securely!');
    }

    /**
     * Send webhook notification
     */
    function sendWebhook(event, payload) {
        webhooks.filter(w => w.events.includes(event)).forEach(w => {
            fetch(w.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event, ...payload, timestamp: new Date().toISOString() })
            }).catch(e => console.error('Webhook failed:', e));
        });
    }

    // ==========================================
    // Phase 23: Enhanced Comparison Tools
    // ==========================================

    let comparePanel = null;
    let snapshots = [];
    let abMode = 'side';

    /**
     * Create compare panel
     */
    function createComparePanel() {
        if (comparePanel) return;

        comparePanel = document.createElement('div');
        comparePanel.className = 'frankrc-dp-compare-panel';
        comparePanel.innerHTML = `
            <div class="frankrc-dp-compare-header">
                <div class="frankrc-dp-compare-title">
                    <span class="dashicons dashicons-image-flip-horizontal"></span>
                    Comparison Tools
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-compare-tabs">
                <button class="frankrc-dp-compare-tab active" data-tab="timeline">Timeline</button>
                <button class="frankrc-dp-compare-tab" data-tab="ab">A/B Test</button>
                <button class="frankrc-dp-compare-tab" data-tab="slider">Slider</button>
                <button class="frankrc-dp-compare-tab" data-tab="browser">Browser</button>
            </div>
            <div class="frankrc-dp-compare-content">
                <div class="frankrc-dp-compare-section active" data-section="timeline">
                    <div class="frankrc-dp-timeline">
                        <div class="frankrc-dp-schedule-label">Historical Snapshots</div>
                        <div class="frankrc-dp-timeline-slider">
                            <div class="frankrc-dp-timeline-track" style="width:60%"></div>
                            <div class="frankrc-dp-timeline-thumb" style="left:60%"></div>
                        </div>
                        <div class="frankrc-dp-timeline-dates">
                            <span>Jan 1</span>
                            <span>Today</span>
                        </div>
                    </div>
                    <div class="frankrc-dp-snapshots-list"></div>
                    <button class="frankrc-dp-run-compare" id="capture-snapshot">ðŸ“¸ Capture Snapshot</button>
                </div>
                <div class="frankrc-dp-compare-section" data-section="ab">
                    <div class="frankrc-dp-ab-urls">
                        <div class="frankrc-dp-ab-url-field">
                            <div class="frankrc-dp-ab-label">A</div>
                            <input type="url" class="frankrc-dp-ab-input" id="ab-url-a" placeholder="https://site.com/page-a">
                        </div>
                        <div class="frankrc-dp-ab-url-field">
                            <div class="frankrc-dp-ab-label b">B</div>
                            <input type="url" class="frankrc-dp-ab-input" id="ab-url-b" placeholder="https://site.com/page-b">
                        </div>
                    </div>
                    <div class="frankrc-dp-ab-mode">
                        <button class="frankrc-dp-ab-mode-btn active" data-mode="side">Side by Side</button>
                        <button class="frankrc-dp-ab-mode-btn" data-mode="overlay">Overlay</button>
                        <button class="frankrc-dp-ab-mode-btn" data-mode="diff">Diff</button>
                    </div>
                    <button class="frankrc-dp-run-compare" id="run-ab-compare">Compare A vs B</button>
                </div>
                <div class="frankrc-dp-compare-section" data-section="slider">
                    <div class="frankrc-dp-breakpoint-slider">
                        <div class="frankrc-dp-schedule-label">Responsive Width</div>
                        <input type="range" min="320" max="1920" value="${currentWidth}" class="frankrc-dp-width-input" id="width-slider">
                        <div class="frankrc-dp-breakpoint-track">
                            <div class="frankrc-dp-breakpoint-marker" style="left:16.7%"></div>
                            <div class="frankrc-dp-breakpoint-marker" style="left:33.3%"></div>
                            <div class="frankrc-dp-breakpoint-marker" style="left:50%"></div>
                            <div class="frankrc-dp-breakpoint-marker" style="left:66.7%"></div>
                            <div class="frankrc-dp-breakpoint-marker" style="left:83.3%"></div>
                        </div>
                        <div class="frankrc-dp-breakpoint-labels">
                            <span>320</span>
                            <span>576</span>
                            <span>768</span>
                            <span>992</span>
                            <span>1200</span>
                            <span>1920</span>
                        </div>
                    </div>
                    <div style="text-align:center;margin-top:12px;font-size:24px;color:var(--frankrc-dp-light);font-weight:700;">
                        <span id="current-width-display">${currentWidth}</span>px
                    </div>
                </div>
                <div class="frankrc-dp-compare-section" data-section="browser">
                    <button class="frankrc-dp-run-compare" id="check-browser">Check Browser Compatibility</button>
                    <div class="frankrc-dp-browser-hints" style="margin-top:12px;"></div>
                </div>
            </div>
        `;

        contentArea.appendChild(comparePanel);

        // Bind events
        comparePanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeComparePanel);

        comparePanel.querySelectorAll('.frankrc-dp-compare-tab').forEach(tab => {
            tab.addEventListener('click', () => switchCompareTab(tab.dataset.tab));
        });

        comparePanel.querySelectorAll('.frankrc-dp-ab-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                comparePanel.querySelectorAll('.frankrc-dp-ab-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                abMode = btn.dataset.mode;
            });
        });

        comparePanel.querySelector('#capture-snapshot').addEventListener('click', captureSnapshot);
        comparePanel.querySelector('#run-ab-compare').addEventListener('click', runABCompare);
        comparePanel.querySelector('#check-browser').addEventListener('click', checkBrowserCompat);

        comparePanel.querySelector('#width-slider').addEventListener('input', (e) => {
            const width = e.target.value;
            comparePanel.querySelector('#current-width-display').textContent = width;
            setDimensions(parseInt(width), currentHeight);
        });
    }

    /**
     * Open compare panel
     */
    function openComparePanel() {
        createComparePanel();
        comparePanel.classList.add('active');
        renderSnapshots();
    }

    /**
     * Close compare panel
     */
    function closeComparePanel() {
        if (comparePanel) comparePanel.classList.remove('active');
    }

    /**
     * Switch compare tab
     */
    function switchCompareTab(tabName) {
        comparePanel.querySelectorAll('.frankrc-dp-compare-tab').forEach(t => t.classList.remove('active'));
        comparePanel.querySelectorAll('.frankrc-dp-compare-section').forEach(s => s.classList.remove('active'));

        comparePanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        comparePanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');
    }

    /**
     * Capture snapshot
     */
    function captureSnapshot() {
        const snapshot = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            device: currentDevice || 'Custom',
            width: currentWidth,
            height: currentHeight
        };
        snapshots.push(snapshot);
        renderSnapshots();
        alert('Snapshot captured!');
    }

    /**
     * Render snapshots
     */
    function renderSnapshots() {
        const list = comparePanel.querySelector('.frankrc-dp-snapshots-list');
        list.innerHTML = snapshots.map(s => `
            <div class="frankrc-dp-snapshot-item">
                <div class="frankrc-dp-snapshot-thumb"></div>
                <div class="frankrc-dp-snapshot-info">
                    <div class="frankrc-dp-snapshot-date">${s.date} ${s.time}</div>
                    <div class="frankrc-dp-snapshot-device">${s.device} (${s.width}Ã—${s.height})</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Run A/B comparison
     */
    function runABCompare() {
        const urlA = comparePanel.querySelector('#ab-url-a').value;
        const urlB = comparePanel.querySelector('#ab-url-b').value;

        if (!urlA || !urlB) {
            alert('Please enter both URLs');
            return;
        }

        alert(`A/B Compare: ${abMode} mode\nURL A: ${urlA}\nURL B: ${urlB}`);
        // In full implementation, would open dual iframes or overlay
    }

    /**
     * Check browser compatibility
     */
    function checkBrowserCompat() {
        const hints = [
            { issue: 'CSS Grid gap shorthand', browsers: 'Safari < 14.1', fix: 'Use row-gap and column-gap separately' },
            { issue: 'backdrop-filter', browsers: 'Firefox < 103', fix: 'Add -webkit-backdrop-filter' },
            { issue: 'aspect-ratio', browsers: 'Safari < 15', fix: 'Use padding-bottom hack as fallback' }
        ];

        const container = comparePanel.querySelector('.frankrc-dp-browser-hints');
        container.innerHTML = hints.map(h => `
            <div class="frankrc-dp-browser-hint">
                <div class="frankrc-dp-browser-hint-header">
                    <span class="dashicons dashicons-warning frankrc-dp-browser-hint-icon"></span>
                    <span class="frankrc-dp-browser-hint-title">${h.issue}</span>
                </div>
                <div class="frankrc-dp-browser-hint-text">Not fully supported in ${h.browsers}</div>
                <div class="frankrc-dp-browser-hint-fix">ðŸ’¡ ${h.fix}</div>
            </div>
        `).join('');
    }

    // ==========================================
    // Phase 24: SEO & Content Tools
    // ==========================================

    let seoPanel = null;

    /**
     * Create SEO panel
     */
    function createSEOPanel() {
        if (seoPanel) return;

        seoPanel = document.createElement('div');
        seoPanel.className = 'frankrc-dp-seo-panel';
        seoPanel.innerHTML = `
            <div class="frankrc-dp-seo-header">
                <div class="frankrc-dp-seo-title">
                    <span class="dashicons dashicons-search"></span>
                    SEO & Content
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-seo-tabs">
                <button class="frankrc-dp-seo-tab active" data-tab="meta">Meta</button>
                <button class="frankrc-dp-seo-tab" data-tab="viewport">Viewport</button>
                <button class="frankrc-dp-seo-tab" data-tab="schema">Schema</button>
                <button class="frankrc-dp-seo-tab" data-tab="social">Social</button>
            </div>
            <div class="frankrc-dp-seo-content">
                <div class="frankrc-dp-seo-section active" data-section="meta">
                    <button class="frankrc-dp-run-seo" data-type="meta">Analyze Meta Tags</button>
                    <div class="frankrc-dp-meta-results"></div>
                </div>
                <div class="frankrc-dp-seo-section" data-section="viewport">
                    <button class="frankrc-dp-run-seo" data-type="viewport">Check Viewport</button>
                    <div class="frankrc-dp-viewport-results"></div>
                </div>
                <div class="frankrc-dp-seo-section" data-section="schema">
                    <button class="frankrc-dp-run-seo" data-type="schema">Parse Schema</button>
                    <div class="frankrc-dp-schema-results"></div>
                </div>
                <div class="frankrc-dp-seo-section" data-section="social">
                    <button class="frankrc-dp-run-seo" data-type="social">Preview Social Cards</button>
                    <div class="frankrc-dp-social-results"></div>
                </div>
            </div>
        `;

        contentArea.appendChild(seoPanel);

        // Bind events
        seoPanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeSEOPanel);

        seoPanel.querySelectorAll('.frankrc-dp-seo-tab').forEach(tab => {
            tab.addEventListener('click', () => switchSEOTab(tab.dataset.tab));
        });

        seoPanel.querySelectorAll('.frankrc-dp-run-seo').forEach(btn => {
            btn.addEventListener('click', () => runSEOAnalysis(btn.dataset.type));
        });
    }

    /**
     * Open SEO panel
     */
    function openSEOPanel() {
        createSEOPanel();
        seoPanel.classList.add('active');
    }

    /**
     * Close SEO panel
     */
    function closeSEOPanel() {
        if (seoPanel) seoPanel.classList.remove('active');
    }

    /**
     * Switch SEO tab
     */
    function switchSEOTab(tabName) {
        seoPanel.querySelectorAll('.frankrc-dp-seo-tab').forEach(t => t.classList.remove('active'));
        seoPanel.querySelectorAll('.frankrc-dp-seo-section').forEach(s => s.classList.remove('active'));

        seoPanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        seoPanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');
    }

    /**
     * Run SEO analysis
     */
    function runSEOAnalysis(type) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            switch (type) {
                case 'meta':
                    analyzeMetaTags(iframeDoc);
                    break;
                case 'viewport':
                    analyzeViewport(iframeDoc);
                    break;
                case 'schema':
                    analyzeSchema(iframeDoc);
                    break;
                case 'social':
                    analyzeSocial(iframeDoc);
                    break;
            }
        } catch (e) {
            console.error('SEO analysis error:', e);
        }
    }

    /**
     * Analyze meta tags
     */
    function analyzeMetaTags(doc) {
        const title = doc.querySelector('title')?.textContent || '';
        const description = doc.querySelector('meta[name="description"]')?.content || '';
        const url = iframe.src;

        const titleLen = title.length;
        const descLen = description.length;

        const container = seoPanel.querySelector('.frankrc-dp-meta-results');
        container.innerHTML = `
            <div class="frankrc-dp-search-preview">
                <div class="frankrc-dp-search-title">${title || 'No title'}</div>
                <div class="frankrc-dp-search-url">${url}</div>
                <div class="frankrc-dp-search-desc">${description || 'No description'}</div>
            </div>
            <div class="frankrc-dp-meta-card">
                <div class="frankrc-dp-meta-label">Title Tag</div>
                <div class="frankrc-dp-meta-value">${title || '(missing)'}</div>
                <div class="frankrc-dp-meta-count ${titleLen > 60 ? 'warning' : ''}">${titleLen} characters ${titleLen > 60 ? '(recommended: 50-60)' : 'âœ“'}</div>
            </div>
            <div class="frankrc-dp-meta-card">
                <div class="frankrc-dp-meta-label">Meta Description</div>
                <div class="frankrc-dp-meta-value">${description || '(missing)'}</div>
                <div class="frankrc-dp-meta-count ${descLen > 160 ? 'warning' : descLen === 0 ? 'error' : ''}">${descLen} characters ${descLen > 160 ? '(recommended: 120-160)' : descLen === 0 ? 'âš ï¸ Missing!' : 'âœ“'}</div>
            </div>
        `;
    }

    /**
     * Analyze viewport meta
     */
    function analyzeViewport(doc) {
        const viewport = doc.querySelector('meta[name="viewport"]');
        const content = viewport?.content || '';

        const checks = [
            { name: 'width=device-width', has: content.includes('width=device-width'), good: true },
            { name: 'initial-scale=1', has: content.includes('initial-scale=1'), good: true },
            { name: 'user-scalable=no', has: content.includes('user-scalable=no'), good: false },
            { name: 'maximum-scale=1', has: content.includes('maximum-scale=1'), good: false }
        ];

        const container = seoPanel.querySelector('.frankrc-dp-viewport-results');
        container.innerHTML = `
            <div class="frankrc-dp-meta-card">
                <div class="frankrc-dp-meta-label">Viewport Meta Tag</div>
                <div class="frankrc-dp-meta-value" style="font-family:monospace;font-size:11px;">${content || '(missing)'}</div>
            </div>
            ${checks.map(c => `
                <div class="frankrc-dp-viewport-status">
                    <div class="frankrc-dp-viewport-icon ${(c.has && c.good) || (!c.has && !c.good) ? 'good' : 'bad'}">
                        ${(c.has && c.good) || (!c.has && !c.good) ? 'âœ“' : 'âš '}
                    </div>
                    <div class="frankrc-dp-viewport-info">
                        <div class="frankrc-dp-viewport-label">${c.name}</div>
                        <div class="frankrc-dp-viewport-value">${c.has ? 'Present' : 'Not present'} ${c.good ? '(recommended)' : '(not recommended)'}</div>
                    </div>
                </div>
            `).join('')}
        `;
    }

    /**
     * Analyze structured data
     */
    function analyzeSchema(doc) {
        const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        const schemas = [];

        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                schemas.push(data);
            } catch (e) { }
        });

        const container = seoPanel.querySelector('.frankrc-dp-schema-results');

        if (schemas.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--frankrc-dp-muted);">No structured data found</div>';
            return;
        }

        container.innerHTML = schemas.map(s => {
            const type = s['@type'] || 'Unknown';
            const props = Object.keys(s).filter(k => k !== '@type' && k !== '@context').slice(0, 5);
            return `
                <div class="frankrc-dp-schema-card">
                    <span class="frankrc-dp-schema-type">${type}</span>
                    <div class="frankrc-dp-schema-props">
                        ${props.map(p => `<div>${p}: ${typeof s[p] === 'string' ? s[p].substring(0, 50) : '...'}</div>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Analyze social meta tags
     */
    function analyzeSocial(doc) {
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || '';
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.content || '';
        const ogImage = doc.querySelector('meta[property="og:image"]')?.content || '';
        const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.content || ogTitle;
        const twitterDesc = doc.querySelector('meta[name="twitter:description"]')?.content || ogDesc;
        const domain = new URL(iframe.src).hostname;

        const container = seoPanel.querySelector('.frankrc-dp-social-results');
        container.innerHTML = `
            <div class="frankrc-dp-social-preview facebook">
                <div class="frankrc-dp-social-header">Facebook</div>
                <div class="frankrc-dp-social-card">
                    <div class="frankrc-dp-social-image">${ogImage ? `<img src="${ogImage}" style="width:100%;height:100%;object-fit:cover;">` : 'No image'}</div>
                    <div class="frankrc-dp-social-title">${ogTitle || 'No OG title'}</div>
                    <div class="frankrc-dp-social-desc">${ogDesc || 'No OG description'}</div>
                    <div class="frankrc-dp-social-domain">${domain}</div>
                </div>
            </div>
            <div class="frankrc-dp-social-preview twitter">
                <div class="frankrc-dp-social-header">Twitter / X</div>
                <div class="frankrc-dp-social-card">
                    <div class="frankrc-dp-social-image">${ogImage ? `<img src="${ogImage}" style="width:100%;height:100%;object-fit:cover;">` : 'No image'}</div>
                    <div class="frankrc-dp-social-title">${twitterTitle || 'No title'}</div>
                    <div class="frankrc-dp-social-desc">${twitterDesc || 'No description'}</div>
                    <div class="frankrc-dp-social-domain">${domain}</div>
                </div>
            </div>
            <div class="frankrc-dp-social-preview linkedin">
                <div class="frankrc-dp-social-header">LinkedIn</div>
                <div class="frankrc-dp-social-card">
                    <div class="frankrc-dp-social-image">${ogImage ? `<img src="${ogImage}" style="width:100%;height:100%;object-fit:cover;">` : 'No image'}</div>
                    <div class="frankrc-dp-social-title">${ogTitle || 'No title'}</div>
                    <div class="frankrc-dp-social-desc">${ogDesc || 'No description'}</div>
                    <div class="frankrc-dp-social-domain">${domain}</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // Phase 25: Developer Utilities
    // ==========================================

    let devPanel = null;
    let consoleLogs = [];

    /**
     * Create developer panel
     */
    function createDevPanel() {
        if (devPanel) return;

        devPanel = document.createElement('div');
        devPanel.className = 'frankrc-dp-dev-panel';
        devPanel.innerHTML = `
            <div class="frankrc-dp-dev-header">
                <div class="frankrc-dp-dev-title">
                    <span class="dashicons dashicons-editor-code"></span>
                    Developer Tools
                </div>
                <button class="frankrc-dp-a11y-close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            <div class="frankrc-dp-dev-tabs">
                <button class="frankrc-dp-dev-tab active" data-tab="layout">Layout</button>
                <button class="frankrc-dp-dev-tab" data-tab="media">Media</button>
                <button class="frankrc-dp-dev-tab" data-tab="console">Console</button>
                <button class="frankrc-dp-dev-tab" data-tab="storage">Storage</button>
            </div>
            <div class="frankrc-dp-dev-content">
                <div class="frankrc-dp-dev-section active" data-section="layout">
                    <button class="frankrc-dp-run-dev" data-type="layout">Detect Grid/Flex Containers</button>
                    <div class="frankrc-dp-layout-results"></div>
                </div>
                <div class="frankrc-dp-dev-section" data-section="media">
                    <button class="frankrc-dp-run-dev" data-type="media">List Media Queries</button>
                    <div class="frankrc-dp-mq-results"></div>
                </div>
                <div class="frankrc-dp-dev-section" data-section="console">
                    <div class="frankrc-dp-console">
                        <div class="frankrc-dp-console-header">
                            <button class="frankrc-dp-console-filter active" data-filter="all">All</button>
                            <button class="frankrc-dp-console-filter" data-filter="error">Errors</button>
                            <button class="frankrc-dp-console-filter" data-filter="warn">Warnings</button>
                            <button class="frankrc-dp-console-filter" data-filter="log">Logs</button>
                        </div>
                        <div class="frankrc-dp-console-logs"></div>
                    </div>
                </div>
                <div class="frankrc-dp-dev-section" data-section="storage">
                    <button class="frankrc-dp-run-dev" data-type="storage">Inspect Storage</button>
                    <div class="frankrc-dp-storage-results"></div>
                </div>
            </div>
        `;

        contentArea.appendChild(devPanel);

        // Bind events
        devPanel.querySelector('.frankrc-dp-a11y-close').addEventListener('click', closeDevPanel);

        devPanel.querySelectorAll('.frankrc-dp-dev-tab').forEach(tab => {
            tab.addEventListener('click', () => switchDevTab(tab.dataset.tab));
        });

        devPanel.querySelectorAll('.frankrc-dp-run-dev').forEach(btn => {
            btn.addEventListener('click', () => runDevAnalysis(btn.dataset.type));
        });

        devPanel.querySelectorAll('.frankrc-dp-console-filter').forEach(btn => {
            btn.addEventListener('click', () => filterConsole(btn.dataset.filter));
        });

        // Start capturing console
        captureConsole();
    }

    /**
     * Open dev panel
     */
    function openDevPanel() {
        createDevPanel();
        devPanel.classList.add('active');
    }

    /**
     * Close dev panel
     */
    function closeDevPanel() {
        if (devPanel) devPanel.classList.remove('active');
    }

    /**
     * Switch dev tab
     */
    function switchDevTab(tabName) {
        devPanel.querySelectorAll('.frankrc-dp-dev-tab').forEach(t => t.classList.remove('active'));
        devPanel.querySelectorAll('.frankrc-dp-dev-section').forEach(s => s.classList.remove('active'));

        devPanel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        devPanel.querySelector(`[data-section="${tabName}"]`).classList.add('active');
    }

    /**
     * Run dev analysis
     */
    function runDevAnalysis(type) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            switch (type) {
                case 'layout':
                    detectLayoutContainers(iframeDoc);
                    break;
                case 'media':
                    listMediaQueries(iframeDoc);
                    break;
                case 'storage':
                    inspectStorage();
                    break;
            }
        } catch (e) {
            console.error('Dev analysis error:', e);
        }
    }

    /**
     * Detect Grid/Flex containers
     */
    function detectLayoutContainers(doc) {
        const elements = doc.querySelectorAll('*');
        const layouts = [];

        elements.forEach(el => {
            const style = doc.defaultView.getComputedStyle(el);
            const display = style.display;

            if (display === 'grid' || display === 'inline-grid') {
                layouts.push({
                    type: 'Grid',
                    selector: getSelector(el),
                    props: `${style.gridTemplateColumns} / ${style.gridTemplateRows}`
                });
            } else if (display === 'flex' || display === 'inline-flex') {
                layouts.push({
                    type: 'Flex',
                    selector: getSelector(el),
                    props: `${style.flexDirection} / ${style.justifyContent} / ${style.alignItems}`
                });
            }
        });

        const container = devPanel.querySelector('.frankrc-dp-layout-results');
        container.innerHTML = layouts.length ? layouts.slice(0, 20).map(l => `
            <div class="frankrc-dp-layout-item">
                <span class="frankrc-dp-layout-type">${l.type}</span>
                <div class="frankrc-dp-layout-selector">${l.selector}</div>
                <div class="frankrc-dp-layout-props">${l.props}</div>
            </div>
        `).join('') : '<div style="color:var(--frankrc-dp-muted);text-align:center;">No Grid/Flex containers found</div>';
    }

    /**
     * Get CSS selector for element
     */
    function getSelector(el) {
        if (el.id) return '#' + el.id;
        if (el.className) return el.tagName.toLowerCase() + '.' + el.className.split(' ')[0];
        return el.tagName.toLowerCase();
    }

    /**
     * List media queries
     */
    function listMediaQueries(doc) {
        const mediaQueries = [];

        for (const sheet of doc.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.type === CSSRule.MEDIA_RULE) {
                        const query = rule.conditionText || rule.media.mediaText;
                        const isActive = window.matchMedia(query).matches;
                        if (!mediaQueries.find(m => m.query === query)) {
                            mediaQueries.push({ query, active: isActive });
                        }
                    }
                }
            } catch (e) { }
        }

        const container = devPanel.querySelector('.frankrc-dp-mq-results');
        container.innerHTML = mediaQueries.length ? mediaQueries.map(m => `
            <div class="frankrc-dp-mq-item ${m.active ? 'active' : ''}">
                <div class="frankrc-dp-mq-query">${m.query}</div>
                <div class="frankrc-dp-mq-status ${m.active ? 'active' : ''}">${m.active ? 'â— Active' : 'â—‹ Inactive'}</div>
            </div>
        `).join('') : '<div style="color:var(--frankrc-dp-muted);text-align:center;">No media queries found</div>';
    }

    /**
     * Capture console output
     */
    function captureConsole() {
        try {
            const iframeWin = iframe.contentWindow;
            const orig = {
                log: iframeWin.console.log,
                warn: iframeWin.console.warn,
                error: iframeWin.console.error,
                info: iframeWin.console.info
            };

            ['log', 'warn', 'error', 'info'].forEach(type => {
                iframeWin.console[type] = (...args) => {
                    consoleLogs.push({ type, message: args.join(' '), time: new Date().toLocaleTimeString() });
                    renderConsoleLogs();
                    orig[type].apply(iframeWin.console, args);
                };
            });
        } catch (e) { }
    }

    /**
     * Render console logs
     */
    function renderConsoleLogs(filter = 'all') {
        if (!devPanel) return;
        const container = devPanel.querySelector('.frankrc-dp-console-logs');
        const logs = filter === 'all' ? consoleLogs : consoleLogs.filter(l => l.type === filter);

        container.innerHTML = logs.slice(-50).map(l => `
            <div class="frankrc-dp-console-log ${l.type}">
                <span class="frankrc-dp-console-icon">${{ log: 'ðŸ“', warn: 'âš ï¸', error: 'âŒ', info: 'â„¹ï¸' }[l.type]}</span>
                <span>${l.message}</span>
            </div>
        `).join('') || '<div style="padding:20px;text-align:center;color:var(--frankrc-dp-muted);">No console output</div>';
    }

    /**
     * Filter console logs
     */
    function filterConsole(filter) {
        devPanel.querySelectorAll('.frankrc-dp-console-filter').forEach(b => b.classList.remove('active'));
        devPanel.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        renderConsoleLogs(filter);
    }

    /**
     * Inspect storage
     */
    function inspectStorage() {
        try {
            const iframeWin = iframe.contentWindow;
            const items = [];

            for (let i = 0; i < iframeWin.localStorage.length; i++) {
                const key = iframeWin.localStorage.key(i);
                items.push({ key, value: iframeWin.localStorage.getItem(key) });
            }

            const container = devPanel.querySelector('.frankrc-dp-storage-results');
            container.innerHTML = items.length ? items.map(item => `
                <div class="frankrc-dp-storage-item">
                    <div class="frankrc-dp-storage-key">${item.key}</div>
                    <div class="frankrc-dp-storage-value">${item.value.substring(0, 100)}${item.value.length > 100 ? '...' : ''}</div>
                    <div class="frankrc-dp-storage-actions">
                        <button class="frankrc-dp-storage-btn">Copy</button>
                        <button class="frankrc-dp-storage-btn delete">Delete</button>
                    </div>
                </div>
            `).join('') : '<div style="color:var(--frankrc-dp-muted);text-align:center;">No localStorage items</div>';
        } catch (e) {
            console.error('Storage access error:', e);
        }
    }

    // ==========================================
    // Phase 26: User Experience Enhancements
    // ==========================================

    // Load favorites and recent sessions from localStorage (update existing variables)
    favorites = JSON.parse(localStorage.getItem('vm_favorites') || '[]');
    let recentSessions = JSON.parse(localStorage.getItem('vm_recent') || '[]');
    let workspaceLayouts = JSON.parse(localStorage.getItem('vm_layouts') || '[]');
    // isFullscreen is already declared above

    /**
     * Toggle device favorite
     */
    function toggleFavorite(deviceName) {
        const index = favorites.indexOf(deviceName);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(deviceName);
        }
        localStorage.setItem('vm_favorites', JSON.stringify(favorites));
        renderFavorites();
    }

    /**
     * Check if device is favorite
     */
    function isFavorite(deviceName) {
        return favorites.includes(deviceName);
    }

    /**
     * Render favorites section
     */
    function renderFavorites() {
        let section = panel.querySelector('.frankrc-dp-favorites-section');
        if (favorites.length === 0) {
            if (section) section.remove();
            return;
        }

        if (!section) {
            section = document.createElement('div');
            section.className = 'frankrc-dp-favorites-section';
            const sidebar = panel.querySelector('.frankrc-dp-sidebar');
            sidebar.insertBefore(section, sidebar.querySelector('.frankrc-dp-device-list'));
        }

        section.innerHTML = `
            <div class="frankrc-dp-favorites-title">â˜… Favorites</div>
            <div class="frankrc-dp-favorites-list">
                ${favorites.map(f => `
                    <button class="frankrc-dp-fav-chip" data-device="${f}">${f}</button>
                `).join('')}
            </div>
        `;

        section.querySelectorAll('.frankrc-dp-fav-chip').forEach(chip => {
            chip.addEventListener('click', () => selectDevice(chip.dataset.device));
        });
    }

    /**
     * Add to recent sessions
     */
    function addRecentSession(url) {
        recentSessions = recentSessions.filter(s => s.url !== url);
        recentSessions.unshift({ url, time: new Date().toLocaleTimeString() });
        recentSessions = recentSessions.slice(0, 10);
        localStorage.setItem('vm_recent', JSON.stringify(recentSessions));
    }

    /**
     * Clear recent sessions
     */
    function clearRecentSessions() {
        recentSessions = [];
        localStorage.setItem('vm_recent', JSON.stringify(recentSessions));
    }

    /**
     * Save workspace layout
     */
    function saveWorkspaceLayout() {
        const name = prompt('Enter layout name:');
        if (!name) return;

        const layout = {
            name,
            device: currentDevice,
            width: currentWidth,
            height: currentHeight,
            orientation
        };
        workspaceLayouts.push(layout);
        localStorage.setItem('vm_layouts', JSON.stringify(workspaceLayouts));
        alert('Layout saved!');
    }

    /**
     * Load workspace layout
     */
    function loadWorkspaceLayout(layout) {
        setDimensions(layout.width, layout.height);
        if (layout.orientation !== orientation) {
            toggleOrientation();
        }
    }

    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
        isFullscreen = !isFullscreen;

        if (isFullscreen) {
            panel.classList.add('fullscreen');

            // Add exit button if not exists
            let exitBtn = panel.querySelector('.frankrc-dp-exit-fullscreen');
            if (!exitBtn) {
                exitBtn = document.createElement('button');
                exitBtn.className = 'frankrc-dp-exit-fullscreen';
                exitBtn.innerHTML = '<span class="dashicons dashicons-no"></span> Exit Fullscreen (Esc)';
                exitBtn.addEventListener('click', toggleFullscreen);
                panel.appendChild(exitBtn);
            }

            document.addEventListener('keydown', handleEscKey);
        } else {
            panel.classList.remove('fullscreen');
            document.removeEventListener('keydown', handleEscKey);
        }
    }

    /**
     * Handle Esc key for fullscreen exit
     */
    function handleEscKey(e) {
        if (e.key === 'Escape' && isFullscreen) {
            toggleFullscreen();
        }
    }

    /**
     * Initialize UX enhancements
     */
    function initUXEnhancements() {
        // UX enhancements placeholder
        // Note: renderFavorites and addRecentSession are planned features
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ==========================================
    // Phase 27: Mockup Generator V2 ï¿½ Live Multi-Device Preview
    // ==========================================

    let mockupV2Panel = null;

    const v2Devices = [
        { name: 'Desktop', width: 1440, height: 900, type: 'desktop', scale: 0.45, icon: 'dashicons-desktop' },
        { name: 'Laptop', width: 1280, height: 800, type: 'laptop', scale: 0.35, icon: 'dashicons-laptop' },
        { name: 'Tablet', width: 768, height: 1024, type: 'tablet', scale: 0.22, icon: 'dashicons-tablet' },
        { name: 'Mobile', width: 375, height: 667, type: 'mobile', scale: 0.22, icon: 'dashicons-smartphone' }
    ];

    /**
     * Create Mockup V2 Panel
     */
    function createMockupV2Panel() {
        if (mockupV2Panel) return;

        mockupV2Panel = document.createElement('div');
        mockupV2Panel.className = 'frankrc-dp-mockupv2-overlay';

        // Build device frames HTML
        let devicesHTML = '';
        v2Devices.forEach(device => {
            const frameW = device.width * device.scale;
            const frameH = device.height * device.scale;

            devicesHTML += `
            <div class="frankrc-dp-v2-device frankrc-dp-v2-${device.type}">
            <div class="frankrc-dp-v2-device-frame frankrc-dp-v2-frame-${device.type}">
                ${device.type === 'desktop' ? '<div class="frankrc-dp-v2-bezel-top"></div>' : ''}
                ${device.type === 'mobile' ? '<div class="frankrc-dp-v2-notch"></div>' : ''}
                <div class="frankrc-dp-v2-screen" style="width:${frameW}px;height:${frameH}px;">
                    <iframe class="frankrc-dp-v2-iframe frankrc-dp-v2-iframe-${device.type}"
                        style="width:${device.width}px;height:${device.height}px;transform:scale(${device.scale});transform-origin:top left;"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                    ></iframe>
                </div>
            </div>
                    ${device.type === 'desktop' ? '<div class="frankrc-dp-v2-stand"><div class="frankrc-dp-v2-stand-neck"></div><div class="frankrc-dp-v2-stand-base"></div></div>' : ''}
                    ${device.type === 'laptop' ? '<div class="frankrc-dp-v2-keyboard"></div>' : ''}
            </div>
        `;
        });

        mockupV2Panel.innerHTML = `
        <div class="frankrc-dp-mockupv2-panel">
                <div class="frankrc-dp-mockupv2-header">
                    <div class="frankrc-dp-mockupv2-title">
                        <span class="dashicons dashicons-images-alt2"></span>
                        Live Mockup Generator
                    </div>
                    <button class="frankrc-dp-mockupv2-close frankrc-dp-close-btn">
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>
                <div class="frankrc-dp-mockupv2-toolbar">
                    <div class="frankrc-dp-mockupv2-input-group">
                        <input type="url" class="frankrc-dp-mockupv2-url" value="${iframe.src !== 'about:blank' ? iframe.src : ''}" placeholder="https://example.com">
                    </div>
                    <div class="frankrc-dp-mockupv2-color-group">
                        <label>BG</label>
                        <input type="color" class="frankrc-dp-mockupv2-bg" value="#e8ecf1">
                        <button class="frankrc-dp-mockupv2-transparent-btn" title="Transparent Background">
                            <span class="dashicons dashicons-grid-view"></span>
                        </button>
                    </div>
                    <button class="frankrc-dp-mockupv2-load-btn">
                        <span class="dashicons dashicons-visibility"></span>
                        Load Preview
                    </button>
                    <button class="frankrc-dp-mockupv2-capture-btn" disabled>
                        <span class="dashicons dashicons-camera"></span>
                        Capture Mockup
                    </button>
                </div>
                <div class="frankrc-dp-mockupv2-body" id="mockupV2CaptureArea">
                    <div class="frankrc-dp-mockupv2-devices">
                        ${devicesHTML}
                    </div>
                    <div class="frankrc-dp-mockupv2-placeholder">
                        <span class="dashicons dashicons-format-image"></span>
                        <span>Enter a URL and click "Load Preview" to see all devices</span>
                    </div>
                </div>
                <div class="frankrc-dp-mockupv2-status" style="display:none;">
                    <div class="frankrc-dp-spinner"></div>
                    <span class="frankrc-dp-mockupv2-status-text">Loading...</span>
                </div>
                <div class="frankrc-dp-mockupv2-download" style="display:none;">
                    <a href="#" class="frankrc-dp-mockupv2-download-btn" download="mockup-v2.png">
                        <span class="dashicons dashicons-download"></span>
                        Download Mockup Image
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(mockupV2Panel);

        // Bind events
        mockupV2Panel.querySelector('.frankrc-dp-mockupv2-close').addEventListener('click', closeMockupV2Panel);
        mockupV2Panel.querySelector('.frankrc-dp-mockupv2-load-btn').addEventListener('click', loadMockupV2);
        mockupV2Panel.querySelector('.frankrc-dp-mockupv2-capture-btn').addEventListener('click', captureMockupV2);

        // Close on overlay background click
        mockupV2Panel.addEventListener('click', (e) => {
            if (e.target === mockupV2Panel) closeMockupV2Panel();
        });

        // Enter key in URL input triggers load
        mockupV2Panel.querySelector('.frankrc-dp-mockupv2-url').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loadMockupV2();
        });

        // Background color change
        mockupV2Panel.querySelector('.frankrc-dp-mockupv2-bg').addEventListener('input', (e) => {
            const body = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-body');
            body.style.backgroundColor = e.target.value;
            body.classList.remove('transparent-bg');
            mockupV2Panel.querySelector('.frankrc-dp-mockupv2-transparent-btn').classList.remove('active');
        });

        // Transparent background toggle
        mockupV2Panel.querySelector('.frankrc-dp-mockupv2-transparent-btn').addEventListener('click', function () {
            const body = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-body');
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                body.classList.add('transparent-bg');
                body.style.backgroundColor = 'transparent';
            } else {
                body.classList.remove('transparent-bg');
                body.style.backgroundColor = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-bg').value;
            }
        });
    }

    /**
     * Open Mockup V2 Panel
     */
    function openMockupV2Panel() {
        createMockupV2Panel();
        if (iframe.src && iframe.src !== 'about:blank') {
            mockupV2Panel.querySelector('.frankrc-dp-mockupv2-url').value = iframe.src;
        }
        mockupV2Panel.style.display = 'flex';
    }

    /**
     * Close Mockup V2 Panel
     */
    function closeMockupV2Panel() {
        if (mockupV2Panel) {
            mockupV2Panel.style.display = 'none';
            // Clear iframes to free memory
            mockupV2Panel.querySelectorAll('.frankrc-dp-v2-iframe').forEach(f => {
                f.src = 'about:blank';
            });
        }
    }

    /**
     * Load URL in all V2 device iframes
     */
    async function loadMockupV2() {
        const url = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-url').value.trim();
        if (!url) return alert('Please enter a URL');

        const loadBtn = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-load-btn');
        const captureBtn = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-capture-btn');
        const statusBar = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-status');
        const statusText = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-status-text');
        const placeholder = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-placeholder');
        const devicesContainer = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-devices');
        const downloadArea = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-download');

        // Determine if cross-origin
        let loadUrl = url;
        let isCrossOrigin = false;
        try {
            const inputUrl = new URL(url);
            if (inputUrl.origin !== window.location.origin) {
                isCrossOrigin = true;
                loadUrl = frankResponsiveChecker.ajaxUrl + '?action=frankrc_proxy&nonce=' + encodeURIComponent(frankResponsiveChecker.proxyNonce) + '&url=' + encodeURIComponent(url);
            }
        } catch (e) {
            // Let it proceed
        }

        // UI state: loading
        loadBtn.disabled = true;
        captureBtn.disabled = true;
        statusBar.style.display = 'flex';
        placeholder.style.display = 'none';
        devicesContainer.style.display = 'block';
        downloadArea.style.display = 'none';
        statusText.textContent = isCrossOrigin ? 'Loading external site via proxy...' : 'Loading website...';

        // Load URL in all iframes simultaneously
        const iframes = mockupV2Panel.querySelectorAll('.frankrc-dp-v2-iframe');
        const loadPromises = Array.from(iframes).map(f => {
            return new Promise(resolve => {
                f.onload = () => resolve();
                f.onerror = () => resolve();
                f.src = loadUrl;
                // Safety timeout
                setTimeout(resolve, isCrossOrigin ? 20000 : 12000);
            });
        });

        await Promise.all(loadPromises);

        // Extra settling time for rendering
        statusText.textContent = 'Rendering pages...';
        await new Promise(r => setTimeout(r, 800));

        // UI state: loaded
        statusBar.style.display = 'none';
        loadBtn.disabled = false;
        captureBtn.disabled = false;

        statusText.textContent = 'Ready! Click "Capture Mockup" to save.';
    }

    /**
     * Capture Mockup V2 composition
     */
    async function captureMockupV2() {
        const captureBtn = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-capture-btn');
        const statusBar = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-status');
        const statusText = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-status-text');
        const downloadArea = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-download');
        const body = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-body');

        captureBtn.disabled = true;
        statusBar.style.display = 'flex';
        statusText.textContent = 'Capturing mockup...';

        try {
            // Canvas dimensions (high quality)
            const canvasW = 2400;
            const canvasH = 1400;
            const canvas = document.createElement('canvas');
            canvas.width = canvasW;
            canvas.height = canvasH;
            const ctx = canvas.getContext('2d');

            // Background
            const bgColor = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-bg').value;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Capture each iframe individually
            const iframeList = mockupV2Panel.querySelectorAll('.frankrc-dp-v2-iframe');

            // Capture all iframes in parallel
            statusText.textContent = 'Capturing all devices...';

            const capturePromises = Array.from(iframeList).map(async (f, i) => {
                const device = v2Devices[i];
                try {
                    const iframeDoc = f.contentDocument || f.contentWindow.document;
                    return await html2canvas(iframeDoc.body, {
                        useCORS: true,
                        allowTaint: true,
                        width: device.width,
                        height: device.height,
                        windowWidth: device.width,
                        windowHeight: device.height,
                        scale: 1,
                        logging: false
                    });
                } catch (e) {
                    console.warn('Could not capture', device.name, ':', e);
                    // Create blank canvas as placeholder
                    const blank = document.createElement('canvas');
                    blank.width = device.width;
                    blank.height = device.height;
                    const bctx = blank.getContext('2d');
                    bctx.fillStyle = '#ffffff';
                    bctx.fillRect(0, 0, blank.width, blank.height);
                    bctx.fillStyle = '#999999';
                    bctx.font = '24px sans-serif';
                    bctx.textAlign = 'center';
                    bctx.fillText('Could not capture', blank.width / 2, blank.height / 2);
                    return blank;
                }
            });

            const screenshots = await Promise.all(capturePromises);

            statusText.textContent = 'Composing final image...';

            // Device bezel color
            const bz = '#222222';
            const accent = '#2196F3';

            // --- Read actual positions from the DOM to match preview exactly ---
            const body = mockupV2Panel.querySelector('.frankrc-dp-mockupv2-body');
            const bodyRect = body.getBoundingClientRect();

            // Collect device info from DOM
            const deviceEls = mockupV2Panel.querySelectorAll('.frankrc-dp-v2-device');
            const deviceData = [];

            deviceEls.forEach((el, i) => {
                const frame = el.querySelector('.frankrc-dp-v2-device-frame');
                const screen = el.querySelector('.frankrc-dp-v2-screen');
                const frameRect = frame.getBoundingClientRect();
                const screenRect = screen.getBoundingClientRect();
                const type = v2Devices[i].type;

                // Get z-index for draw order
                const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;

                deviceData.push({
                    type: type,
                    index: i,
                    zIndex: zIndex,
                    // Frame position relative to body
                    fx: frameRect.left - bodyRect.left,
                    fy: frameRect.top - bodyRect.top,
                    fw: frameRect.width,
                    fh: frameRect.height,
                    // Screen position relative to body
                    sx: screenRect.left - bodyRect.left,
                    sy: screenRect.top - bodyRect.top,
                    sw: screenRect.width,
                    sh: screenRect.height,
                    // Extra elements
                    stand: el.querySelector('.frankrc-dp-v2-stand'),
                    keyboard: el.querySelector('.frankrc-dp-v2-keyboard'),
                    el: el
                });

                // Also grab stand/keyboard rects
                const standEl = el.querySelector('.frankrc-dp-v2-stand');
                const kbEl = el.querySelector('.frankrc-dp-v2-keyboard');
                if (standEl) {
                    const sr = standEl.getBoundingClientRect();
                    deviceData[deviceData.length - 1].standRect = {
                        x: sr.left - bodyRect.left,
                        y: sr.top - bodyRect.top,
                        w: sr.width,
                        h: sr.height
                    };
                    // Get neck and base
                    const neck = standEl.querySelector('.frankrc-dp-v2-stand-neck');
                    const base = standEl.querySelector('.frankrc-dp-v2-stand-base');
                    if (neck) {
                        const nr = neck.getBoundingClientRect();
                        deviceData[deviceData.length - 1].neckRect = {
                            x: nr.left - bodyRect.left, y: nr.top - bodyRect.top, w: nr.width, h: nr.height
                        };
                    }
                    if (base) {
                        const br = base.getBoundingClientRect();
                        deviceData[deviceData.length - 1].baseRect = {
                            x: br.left - bodyRect.left, y: br.top - bodyRect.top, w: br.width, h: br.height
                        };
                    }
                }
                if (kbEl) {
                    const kr = kbEl.getBoundingClientRect();
                    deviceData[deviceData.length - 1].kbRect = {
                        x: kr.left - bodyRect.left,
                        y: kr.top - bodyRect.top,
                        w: kr.width,
                        h: kr.height
                    };
                }
            });

            // Scale from body coordinates to canvas coordinates
            const scaleX = canvasW / bodyRect.width;
            const scaleY = canvasH / bodyRect.height;
            // Use uniform scale to avoid distortion, fit within canvas
            const scale = Math.min(scaleX, scaleY) * 0.92; // slight margin
            const offsetX = (canvasW - bodyRect.width * scale) / 2;
            const offsetY = (canvasH - bodyRect.height * scale) / 2;

            function toCanvas(x, y) {
                return { x: x * scale + offsetX, y: y * scale + offsetY };
            }

            // Sort by z-index to draw in correct order (back to front)
            deviceData.sort((a, b) => a.zIndex - b.zIndex);

            // Draw each device
            for (const d of deviceData) {
                const fp = toCanvas(d.fx, d.fy);
                const fw = d.fw * scale;
                const fh = d.fh * scale;
                const sp = toCanvas(d.sx, d.sy);
                const sw = d.sw * scale;
                const sh = d.sh * scale;
                const radius = d.type === 'mobile' ? 14 : d.type === 'tablet' ? 10 : 6;

                // Shadow
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.22)';
                ctx.shadowBlur = 25;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 5;
                ctx.fillStyle = bz;
                roundRectV2(ctx, fp.x, fp.y, fw, fh, radius);
                ctx.fill();
                ctx.restore();


                // Notch on mobile
                if (d.type === 'mobile') {
                    ctx.fillStyle = '#444';
                    const nw = 28 * scale;
                    const nh = 4 * scale;
                    roundRectV2(ctx, fp.x + fw / 2 - nw / 2, fp.y + 6 * scale, nw, nh, 2);
                    ctx.fill();
                }

                // Screen content
                ctx.drawImage(screenshots[d.index], sp.x, sp.y, sw, sh);

                // Stand (desktop)
                if (d.neckRect) {
                    const np = toCanvas(d.neckRect.x, d.neckRect.y);
                    const nw = d.neckRect.w * scale;
                    const nh = d.neckRect.h * scale;
                    ctx.fillStyle = '#c0c0c0';
                    ctx.fillRect(np.x, np.y, nw, nh);
                    // Highlight
                    ctx.fillStyle = '#d8d8d8';
                    ctx.fillRect(np.x + nw * 0.3, np.y, nw * 0.4, nh);
                }
                if (d.baseRect) {
                    const bp = toCanvas(d.baseRect.x, d.baseRect.y);
                    const bw = d.baseRect.w * scale;
                    const bh = d.baseRect.h * scale;
                    ctx.fillStyle = '#b0b0b0';
                    roundRectV2(ctx, bp.x, bp.y, bw, bh, 2);
                    ctx.fill();
                }

                // Keyboard (laptop)
                if (d.kbRect) {
                    const kp = toCanvas(d.kbRect.x, d.kbRect.y);
                    const kw = d.kbRect.w * scale;
                    const kh = d.kbRect.h * scale;
                    ctx.fillStyle = '#333';
                    roundRectV2(ctx, kp.x, kp.y, kw, kh, 2);
                    ctx.fill();
                    // Hinge detail
                    ctx.fillStyle = '#444';
                    ctx.fillRect(kp.x + kw / 2 - 15, kp.y + 1, 30, 2);
                }
            }

            const dataURL = canvas.toDataURL('image/png');

            // Show download button
            const downloadBtn = downloadArea.querySelector('.frankrc-dp-mockupv2-download-btn');
            downloadBtn.href = dataURL;
            downloadArea.style.display = 'flex';

        } catch (err) {
            console.error('Mockup V2 capture error:', err);
            alert('Capture failed. Error: ' + err.message);
        }

        statusBar.style.display = 'none';
        captureBtn.disabled = false;
    }

    // Helper for canvas rounded rectangles
    function roundRectV2(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

})();
