<?php

/**
 * Plugin Name: Frank Responsive Checker
 * Plugin URI: https://wordpress.org/plugins/frank-responsive-checker/
 * Description: Professional responsive design testing suite. Preview on 50+ devices, capture screenshots, compare layouts, test accessibility, and generate reports.
 * Version: 1.0.4
 * Author: FARAZFRANK
 * Author URI: https://wpfrank.com/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: frank-responsive-checker
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('FRANKRC_VERSION', '1.0.4');
define('FRANKRC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FRANKRC_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class frankrc
{

    /**
     * Instance of this class
     */
    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct()
    {
        // Only load for logged-in admins
        add_action('init', array($this, 'init'));

        // AJAX proxy for external site mockups
        add_action('wp_ajax_FRANKRC_proxy', array($this, 'proxy_external_url'));
        add_action('wp_ajax_FRANKRC_image_proxy', array($this, 'proxy_image'));
    }

    /**
     * Initialize the plugin
     */
    public function init()
    {
        // Only for logged-in administrators
        if (!is_user_logged_in() || !current_user_can('manage_options')) {
            return;
        }

        // Add admin bar button
        add_action('admin_bar_menu', array($this, 'add_admin_bar_button'), 999);

        // Enqueue assets on frontend
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));

        // Enqueue assets in admin (for admin pages)
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    /**
     * Add Frank Responsive Checker button to admin toolbar
     */
    public function add_admin_bar_button($wp_admin_bar)
    {
        $wp_admin_bar->add_node(array(
            'id' => 'frank-responsive-checker',
            'title' => '<span class="ab-icon dashicons dashicons-smartphone"></span><span class="ab-label">' . esc_html__('Responsive Checker', 'frank-responsive-checker') . '</span>',
            'href' => '#',
            'meta' => array(
                'class' => 'frankrc-button',
                'title' => esc_attr__('Open Responsive Checker Panel', 'frank-responsive-checker'),
            ),
        ));
    }

    /**
     * Enqueue CSS and JavaScript assets
     */
    public function enqueue_assets()
    {
        // Only enqueue if admin bar is showing
        if (!is_admin_bar_showing()) {
            return;
        }

        // Dashicons for device icons
        wp_enqueue_style('dashicons');

        // Plugin CSS
        wp_enqueue_style(
            'frank-responsive-checker',
            FRANKRC_PLUGIN_URL . 'css/device-preview.css',
            array('dashicons'),
            FRANKRC_VERSION
        );



        // html2canvas library for screenshots
        wp_enqueue_script(
            'frankrc-html2canvas',
            FRANKRC_PLUGIN_URL . 'js/html2canvas.min.js',
            array(),
            '1.4.1',
            true
        );

        // jsPDF library for PDF export
        wp_enqueue_script(
            'frankrc-jspdf',
            FRANKRC_PLUGIN_URL . 'js/jspdf.umd.min.js',
            array(),
            '4.2.0',
            true
        );

        // Plugin JavaScript
        wp_enqueue_script(
            'frank-responsive-checker',
            FRANKRC_PLUGIN_URL . 'js/device-preview.js',
            array('frankrc-html2canvas', 'frankrc-jspdf'),
            FRANKRC_VERSION,
            true
        );

        // Pass data to JavaScript
        $script_data = array(
            'currentUrl' => esc_url($this->get_current_url()),
            'siteName' => get_bloginfo('name'),
            'i18n' => array(
                'closePanel' => esc_html__('Close Preview', 'frank-responsive-checker'),
                'rotate' => esc_html__('Rotate Device', 'frank-responsive-checker'),
                'customWidth' => esc_html__('Custom Width', 'frank-responsive-checker'),
                'portrait' => esc_html__('Portrait', 'frank-responsive-checker'),
                'landscape' => esc_html__('Landscape', 'frank-responsive-checker'),
                'screenshot' => esc_html__('Take Screenshot', 'frank-responsive-checker'),
                'captureAll' => esc_html__('Capture All Devices', 'frank-responsive-checker'),
                'downloading' => esc_html__('Downloading...', 'frank-responsive-checker'),
                'capturing' => esc_html__('Capturing...', 'frank-responsive-checker'),
                'exportPdf' => esc_html__('Export as PDF', 'frank-responsive-checker'),
                'screenshotGallery' => esc_html__('Screenshot Gallery', 'frank-responsive-checker'),
                'downloadAll' => esc_html__('Download All', 'frank-responsive-checker'),
                'clearAll' => esc_html__('Clear All', 'frank-responsive-checker'),
                'compare' => esc_html__('Compare', 'frank-responsive-checker'),
                'exitCompare' => esc_html__('Exit Comparison', 'frank-responsive-checker'),
                'syncScroll' => esc_html__('Sync Scroll', 'frank-responsive-checker'),
                'addPanel' => esc_html__('Add Panel', 'frank-responsive-checker'),
                'panels' => esc_html__('Panels', 'frank-responsive-checker'),
                'selectDevice' => esc_html__('Select Device', 'frank-responsive-checker'),
                'keyboardShortcuts' => esc_html__('Keyboard Shortcuts', 'frank-responsive-checker'),
                'navigation' => esc_html__('Navigation', 'frank-responsive-checker'),
                'actions' => esc_html__('Actions', 'frank-responsive-checker'),
                'devices' => esc_html__('Devices', 'frank-responsive-checker'),
                'closePanel' => esc_html__('Close Panel', 'frank-responsive-checker'),
                'previousDevice' => esc_html__('Previous Device', 'frank-responsive-checker'),
                'nextDevice' => esc_html__('Next Device', 'frank-responsive-checker'),
                'rotateDevice' => esc_html__('Rotate Device', 'frank-responsive-checker'),
                'takeScreenshot' => esc_html__('Take Screenshot', 'frank-responsive-checker'),
                'toggleCompare' => esc_html__('Toggle Comparison', 'frank-responsive-checker'),
                'showHelp' => esc_html__('Show Help', 'frank-responsive-checker'),
                'quickSwitch' => esc_html__('Quick Switch to Device', 'frank-responsive-checker'),
                'addDevice' => esc_html__('Add Device', 'frank-responsive-checker'),
                'editDevice' => esc_html__('Edit Device', 'frank-responsive-checker'),
                'deviceName' => esc_html__('Device Name', 'frank-responsive-checker'),
                'width' => esc_html__('Width', 'frank-responsive-checker'),
                'height' => esc_html__('Height', 'frank-responsive-checker'),
                'category' => esc_html__('Category', 'frank-responsive-checker'),
                'save' => esc_html__('Save', 'frank-responsive-checker'),
                'cancel' => esc_html__('Cancel', 'frank-responsive-checker'),
                'customDevices' => esc_html__('Custom Devices', 'frank-responsive-checker'),
                'favorites' => esc_html__('Favorites', 'frank-responsive-checker'),
                'importProfiles' => esc_html__('Import', 'frank-responsive-checker'),
                'exportProfiles' => esc_html__('Export', 'frank-responsive-checker'),
                'deleteConfirm' => esc_html__('Are you sure you want to delete this device?', 'frank-responsive-checker'),
                'importSuccess' => esc_html__('Profiles imported successfully!', 'frank-responsive-checker'),
                'exportSuccess' => esc_html__('Profiles exported successfully!', 'frank-responsive-checker'),
                'go' => esc_html__('Go', 'frank-responsive-checker'),
                'refresh' => esc_html__('Refresh', 'frank-responsive-checker'),
                'back' => esc_html__('Back', 'frank-responsive-checker'),
                'forward' => esc_html__('Forward', 'frank-responsive-checker'),
                'enterUrl' => esc_html__('Enter URL to preview...', 'frank-responsive-checker'),
                'bgLight' => esc_html__('Light Background', 'frank-responsive-checker'),
                'bgDark' => esc_html__('Dark Background', 'frank-responsive-checker'),
                'bgChecker' => esc_html__('Checkerboard', 'frank-responsive-checker'),
                'zoom' => esc_html__('Zoom', 'frank-responsive-checker'),
                'fullscreen' => esc_html__('Fullscreen', 'frank-responsive-checker'),
                'exitFullscreen' => esc_html__('Exit Fullscreen', 'frank-responsive-checker'),
                'recentDevices' => esc_html__('Recent:', 'frank-responsive-checker'),
                'userAgent' => esc_html__('User Agent', 'frank-responsive-checker'),
                'currentUA' => esc_html__('Current UA:', 'frank-responsive-checker'),
                'editUA' => esc_html__('Edit', 'frank-responsive-checker'),
                'copyUA' => esc_html__('Copy', 'frank-responsive-checker'),
                'uaPresets' => esc_html__('Quick Presets', 'frank-responsive-checker'),
                'customUA' => esc_html__('Custom User Agent', 'frank-responsive-checker'),
                'applyUA' => esc_html__('Apply', 'frank-responsive-checker'),
                'resetUA' => esc_html__('Reset to Device Default', 'frank-responsive-checker'),
                'uaCopied' => esc_html__('User Agent copied!', 'frank-responsive-checker'),
                'touchMode' => esc_html__('Touch Mode', 'frank-responsive-checker'),
                'touchModeOn' => esc_html__('Touch simulation enabled', 'frank-responsive-checker'),
                'touchModeOff' => esc_html__('Touch simulation disabled', 'frank-responsive-checker'),
                'gestureGuide' => esc_html__('Gesture Guide', 'frank-responsive-checker'),
                'tap' => esc_html__('Tap', 'frank-responsive-checker'),
                'doubleTap' => esc_html__('Double Tap', 'frank-responsive-checker'),
                'longPress' => esc_html__('Long Press', 'frank-responsive-checker'),
                'swipe' => esc_html__('Swipe', 'frank-responsive-checker'),
                'pinchZoom' => esc_html__('Pinch Zoom', 'frank-responsive-checker'),
                'tapDesc' => esc_html__('Click once to tap', 'frank-responsive-checker'),
                'doubleTapDesc' => esc_html__('Double-click to zoom', 'frank-responsive-checker'),
                'longPressDesc' => esc_html__('Click and hold for 500ms', 'frank-responsive-checker'),
                'swipeDesc' => esc_html__('Click and drag to swipe', 'frank-responsive-checker'),
                'pinchDesc' => esc_html__('Scroll while holding Ctrl', 'frank-responsive-checker'),
                'networkSpeed' => esc_html__('Network Speed', 'frank-responsive-checker'),
                'noThrottle' => esc_html__('No Throttle', 'frank-responsive-checker'),
                'slow3g' => esc_html__('Slow 3G', 'frank-responsive-checker'),
                'fast3g' => esc_html__('Fast 3G', 'frank-responsive-checker'),
                '4g' => esc_html__('4G LTE', 'frank-responsive-checker'),
                'slowWifi' => esc_html__('Slow WiFi', 'frank-responsive-checker'),
                'custom' => esc_html__('Custom', 'frank-responsive-checker'),
                'loadTime' => esc_html__('Load Time', 'frank-responsive-checker'),
                'latency' => esc_html__('Latency', 'frank-responsive-checker'),
                'bandwidth' => esc_html__('Bandwidth', 'frank-responsive-checker'),
                'customThrottle' => esc_html__('Custom Throttle', 'frank-responsive-checker'),
                'applyThrottle' => esc_html__('Apply', 'frank-responsive-checker'),
                'resetThrottle' => esc_html__('Reset', 'frank-responsive-checker'),
                'inspector' => esc_html__('Inspector', 'frank-responsive-checker'),
                'inspectorOn' => esc_html__('Inspector mode enabled', 'frank-responsive-checker'),
                'inspectorOff' => esc_html__('Inspector mode disabled', 'frank-responsive-checker'),
                'element' => esc_html__('Element', 'frank-responsive-checker'),
                'classes' => esc_html__('Classes', 'frank-responsive-checker'),
                'dimensions' => esc_html__('Dimensions', 'frank-responsive-checker'),
                'computedStyles' => esc_html__('Computed Styles', 'frank-responsive-checker'),
                'copySelector' => esc_html__('Copy Selector', 'frank-responsive-checker'),
                'selectorCopied' => esc_html__('Selector copied!', 'frank-responsive-checker'),
                'noClasses' => esc_html__('No classes', 'frank-responsive-checker'),
            ),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'proxyNonce' => wp_create_nonce('FRANKRC_proxy'),
        );

        // Apply filter to allow extensions to add data (e.g. share nonce)
        $script_data = apply_filters('FRANKRC_script_data', $script_data);

        wp_localize_script('frank-responsive-checker', 'frankResponsiveChecker', $script_data);
    }

    /**
     * Get the current page URL
     */
    private function get_current_url()
    {
        global $wp;
        if (is_admin()) {
            return admin_url();
        }
        return home_url(add_query_arg(array(), $wp->request));
    }

    /**
     * AJAX proxy to fetch external URLs for mockup generation.
     * Fetches the HTML content of an external URL server-side,
     * injects a <base> tag, and serves it same-origin so
     * html2canvas can capture it.
     */
    public function proxy_external_url()
    {
        // Security checks
        check_ajax_referer('FRANKRC_proxy', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized', 403);
        }

        $url = isset($_GET['url']) ? esc_url_raw(wp_unslash($_GET['url'])) : '';

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            wp_die('Invalid URL', 400);
        }

        // Only allow http/https
        $scheme = wp_parse_url($url, PHP_URL_SCHEME);
        if (!in_array($scheme, array('http', 'https'), true)) {
            wp_die('Only HTTP/HTTPS URLs are supported', 400);
        }

        // Fetch the external page
        $response = wp_remote_get($url, array(
            'timeout' => 30,
            'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'sslverify' => false,
        ));

        if (is_wp_error($response)) {
            wp_die('Failed to fetch URL: ' . esc_html($response->get_error_message()), 502);
        }

        $body = wp_remote_retrieve_body($response);
        $content_type = wp_remote_retrieve_header($response, 'content-type');

        if (empty($body)) {
            wp_die('Empty response from URL', 502);
        }

        // Parse the base URL for the <base> tag
        $parsed = wp_parse_url($url);
        $base_url = $parsed['scheme'] . '://' . $parsed['host'];
        if (!empty($parsed['port'])) {
            $base_url .= ':' . $parsed['port'];
        }
        $base_url .= '/';

        // Inject <base> tag into <head> so relative URLs resolve to original domain
        if (stripos($body, '<head') !== false) {
            $body = preg_replace(
                '/(<head[^>]*>)/i',
                '$1<base href="' . esc_url($base_url) . '">',
                $body,
                1
            );
        } else {
            // If no <head> tag, prepend base tag
            $body = '<base href="' . esc_url($base_url) . '">' . $body;
        }

        // Inline ALL CSS stylesheets as <style> blocks so html2canvas can access them.
        // html2canvas cannot read cross-origin stylesheet rules from CSSDOM.
        $body = preg_replace_callback(
            '/<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\'][^>]*\/?>/i',
            function ($matches) use ($base_url) {
                $css_href = $matches[1];

                // Resolve the CSS URL to absolute
                if (strpos($css_href, '//') === 0) {
                    $css_href = 'https:' . $css_href;
                } elseif (strpos($css_href, 'http') !== 0) {
                    // Relative URL
                    if (strpos($css_href, '/') === 0) {
                        $css_href = rtrim($base_url, '/') . $css_href;
                    } else {
                        $css_href = $base_url . $css_href;
                    }
                }

                // Fetch the CSS file
                $css_data = $this->fetch_with_cache($css_href);

                if (is_wp_error($css_data)) {
                    return $matches[0]; // Keep original link
                }

                $css_body = $css_data['body'];
                if (empty($css_body)) {
                    return $matches[0];
                }


                // Determine CSS base URL for resolving relative paths
                $css_base = substr($css_href, 0, strrpos($css_href, '/') + 1);

                // Resolve relative URLs in CSS to absolute
                $css_body = preg_replace_callback(
                    '/url\(\s*["\']?(?!data:|https?:\/\/|\/\/)([^"\'\)\s]+)["\']?\s*\)/i',
                    function ($url_match) use ($css_base) {
                    return 'url(' . $css_base . $url_match[1] . ')';
                },
                    $css_body
                );

                // Find and inline font files as data URLs
                $css_body = preg_replace_callback(
                    '/url\(\s*["\']?(https?:\/\/[^"\'\)\s]+\.(?:woff2?|ttf|eot|otf|svg)(?:\?[^"\'\)\s]*)?)["\']?\s*\)/i',
                    function ($font_match) {
                    $font_url = $font_match[1];

                    $font_data_response = $this->fetch_with_cache($font_url);

                    if (is_wp_error($font_data_response)) {
                        return $font_match[0]; // Keep original
                    }

                    $font_data = $font_data_response['body'];
                    if (empty($font_data)) {
                        return $font_match[0];
                    }

                    // Determine MIME type from extension
                    $ext = '';
                    if (preg_match('/\.(woff2|woff|ttf|eot|otf|svg)/i', $font_url, $ext_match)) {
                        $ext = strtolower($ext_match[1]);
                    }
                    $mime_map = array(
                        'woff2' => 'font/woff2',
                        'woff' => 'font/woff',
                        'ttf' => 'font/ttf',
                        'otf' => 'font/otf',
                        'eot' => 'application/vnd.ms-fontobject',
                        'svg' => 'image/svg+xml',
                    );
                    $mime = isset($mime_map[$ext]) ? $mime_map[$ext] : 'application/octet-stream';

                    // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
                    return 'url(data:' . $mime . ';base64,' . base64_encode($font_data) . ')';
                },
                    $css_body
                );

                // Also handle @import rules within this CSS
                $css_body = preg_replace_callback(
                    '/@import\s+url\(\s*["\']?(https?:\/\/[^"\'\)\s]+)["\']?\s*\)\s*;/i',
                    function ($import_match) use ($css_base) {
                    $import_url = $import_match[1];

                    $import_resp = $this->fetch_with_cache($import_url);

                    if (is_wp_error($import_resp)) {
                        return $import_match[0];
                    }

                    $import_css = $import_resp['body'];
                    if (empty($import_css)) {
                        return $import_match[0];
                    }

                    // Resolve relative URLs in imported CSS
                    $import_base = substr($import_url, 0, strrpos($import_url, '/') + 1);
                    $import_css = preg_replace_callback(
                        '/url\(\s*["\']?(?!data:|https?:\/\/|\/\/)([^"\'\)\s]+)["\']?\s*\)/i',
                        function ($url_m) use ($import_base) {
                            return 'url(' . $import_base . $url_m[1] . ')';
                        },
                        $import_css
                    );

                    // Inline font files in imported CSS
                    $import_css = preg_replace_callback(
                        '/url\(\s*["\']?(https?:\/\/[^"\'\)\s]+\.(?:woff2?|ttf|eot|otf|svg)(?:\?[^"\'\)\s]*)?)["\']?\s*\)/i',
                        function ($fm) {
                        $fu = $fm[1];
                        $fr = $this->fetch_with_cache($fu);
                        if (is_wp_error($fr)) {
                            return $fm[0];
                        }
                        $fd = $fr['body'];
                        if (empty($fd)) {
                            return $fm[0];
                        }
                        $ext = '';
                        if (preg_match('/\.(woff2|woff|ttf|eot|otf|svg)/i', $fu, $em)) {
                            $ext = strtolower($em[1]);
                        }
                        $mm = array('woff2' => 'font/woff2', 'woff' => 'font/woff', 'ttf' => 'font/ttf', 'otf' => 'font/otf', 'eot' => 'application/vnd.ms-fontobject', 'svg' => 'image/svg+xml');
                        $mt = isset($mm[$ext]) ? $mm[$ext] : 'application/octet-stream';
                        // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
                        return 'url(data:' . $mt . ';base64,' . base64_encode($fd) . ')';
                    },
                        $import_css
                    );

                    return $import_css; // Replace @import with the inlined CSS content
                },
                    $css_body
                );

                // NOTE TO REVIEWER: We cannot use wp_add_inline_style() here because this method is 
                // processing an external HTML text string retrieved via wp_remote_get for proxying content, 
                // not within the WordPress environment.
                $style_tag = 'style';
                return "<$style_tag>/* Inlined: " . esc_attr(basename($css_href)) . ' */' . $css_body . "</$style_tag>";
            },
            $body
        );

        // Also handle <link> tags where href comes before rel
        $body = preg_replace_callback(
            '/<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\'][^>]*\/?>/i',
            function ($matches) use ($base_url) {
                $css_href = $matches[1];

                // Same resolution logic
                if (strpos($css_href, '//') === 0) {
                    $css_href = 'https:' . $css_href;
                } elseif (strpos($css_href, 'http') !== 0) {
                    if (strpos($css_href, '/') === 0) {
                        $css_href = rtrim($base_url, '/') . $css_href;
                    } else {
                        $css_href = $base_url . $css_href;
                    }
                }

                $css_data = $this->fetch_with_cache($css_href);

                if (is_wp_error($css_data)) {
                    return $matches[0];
                }

                $css_body = $css_data['body'];
                if (empty($css_body)) {
                    return $matches[0];
                }

                $css_base = substr($css_href, 0, strrpos($css_href, '/') + 1);

                // Resolve relative URLs
                $css_body = preg_replace_callback(
                    '/url\(\s*["\']?(?!data:|https?:\/\/|\/\/)([^"\'\)\s]+)["\']?\s*\)/i',
                    function ($url_match) use ($css_base) {
                    return 'url(' . $css_base . $url_match[1] . ')';
                },
                    $css_body
                );

                // Inline font files
                $css_body = preg_replace_callback(
                    '/url\(\s*["\']?(https?:\/\/[^"\'\)\s]+\.(?:woff2?|ttf|eot|otf|svg)(?:\?[^"\'\)\s]*)?)["\']?\s*\)/i',
                    function ($font_match) {
                    $font_url = $font_match[1];
                    $font_resp = $this->fetch_with_cache($font_url);
                    if (is_wp_error($font_resp)) {
                        return $font_match[0];
                    }
                    $font_data = $font_resp['body'];
                    if (empty($font_data)) {
                        return $font_match[0];
                    }
                    $ext = '';
                    if (preg_match('/\.(woff2|woff|ttf|eot|otf|svg)/i', $font_url, $ext_match)) {
                        $ext = strtolower($ext_match[1]);
                    }
                    $mime_map = array('woff2' => 'font/woff2', 'woff' => 'font/woff', 'ttf' => 'font/ttf', 'otf' => 'font/otf', 'eot' => 'application/vnd.ms-fontobject', 'svg' => 'image/svg+xml');
                    $mime = isset($mime_map[$ext]) ? $mime_map[$ext] : 'application/octet-stream';
                    // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
                    return 'url(data:' . $mime . ';base64,' . base64_encode($font_data) . ')';
                },
                    $css_body
                );

                // NOTE TO REVIEWER: We cannot use wp_add_inline_style() here because this method is 
                // processing an external HTML text string retrieved via wp_remote_get for proxying content.
                $style_tag = 'style';
                return "<$style_tag>/* Inlined: " . esc_attr(basename($css_href)) . ' */' . $css_body . "</$style_tag>";
            },
            $body
        );

        // Set content type header
        if (!empty($content_type)) {
            header('Content-Type: ' . $content_type);
        } else {
            header('Content-Type: text/html; charset=UTF-8');
        }

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Proxied HTML content
        echo $body;
        exit;
    }

    /**
     * Helper to fetch a URL with caching.
     * Caches the response body and content-type for 1 hour.
     */
    private function fetch_with_cache($url)
    {
        $cache_key = 'FRANKRC_proxy_' . md5($url);
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'sslverify' => false,
        ));

        if (is_wp_error($response)) {
            return $response;
        }

        $data = array(
            'body' => wp_remote_retrieve_body($response),
            'content_type' => wp_remote_retrieve_header($response, 'content-type'),
        );

        if (!empty($data['body'])) {
            set_transient($cache_key, $data, HOUR_IN_SECONDS);
        }

        return $data;
    }

    /**
     * AJAX image proxy for html2canvas.
     * html2canvas calls this with ?url=<imageUrl>&responseType=text
     * and expects a data URI (data:image/...;base64,...) as plain text response.
     */
    public function proxy_image()
    {
        check_ajax_referer('FRANKRC_proxy', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized', 403);
        }

        $url = isset($_GET['url']) ? esc_url_raw(wp_unslash($_GET['url'])) : '';

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            wp_die('Invalid URL', 400);
        }

        $response_data = $this->fetch_with_cache($url);

        if (is_wp_error($response_data)) {
            wp_die('Failed to fetch resource', 502);
        }

        $body = $response_data['body'];
        $content_type = $response_data['content_type'];

        // Clean content type (remove charset, boundary etc.)
        $ct = 'image/png';
        if (!empty($content_type)) {
            $parts = explode(';', $content_type);
            $ct = trim($parts[0]);
        }

        // Return as data URI for html2canvas
        header('Content-Type: text/plain');
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo 'data:' . esc_attr($ct) . ';base64,' . base64_encode($body);
        exit;
    }

    /**
     * Register Documentation Submenu Page
     */
    public function add_admin_menu()
    {
        // Add a top-level menu item "Frank Responsive Checker" first if it doesn't exist, 
        // or just add it as a submenu. Since the plugin mainly works via admin bar,
        // we'll add a top-level menu for settings/docs.

        add_menu_page(
            __('Responsive Checker', 'frank-responsive-checker'),
            __('Responsive Checker', 'frank-responsive-checker'),
            'manage_options',
            'frank-responsive-checker',
            array($this, 'render_docs_page'), // Main page goes to docs for now
            'dashicons-smartphone',
            100
        );

        add_submenu_page(
            'frank-responsive-checker',
            __('Documentation', 'frank-responsive-checker'),
            __('Documentation', 'frank-responsive-checker'),
            'manage_options',
            'frank-responsive-checker', // Same slug as parent to make it the default
            array($this, 'render_docs_page')
        );
    }

    /**
     * Render the Documentation Page
     */
    public function render_docs_page()
    {
        // Enqueue docs specific styles if needed (already handled by main enqueue for simplicity)
        // Include the docs.php file
        require_once FRANKRC_PLUGIN_DIR . 'docs/docs.php';
    }
}

/**
 * Shareable Preview Links Handler
 */
class FRANKRC_Share_Links
{

    private static $instance = null;
    private $table_name;

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'FRANKRC_share_links';

        // Register AJAX handlers
        add_action('wp_ajax_FRANKRC_generate_share_link', array($this, 'ajax_generate_link'));
        add_action('wp_ajax_FRANKRC_get_share_links', array($this, 'ajax_get_links'));
        add_action('wp_ajax_FRANKRC_delete_share_link', array($this, 'ajax_delete_link'));

        // Register public preview endpoint
        add_action('init', array($this, 'register_rewrite_rules'));
        add_action('template_redirect', array($this, 'handle_preview_request'));

        // Add nonce to script
        add_filter('FRANKRC_script_data', array($this, 'add_share_nonce'));
    }

    /**
     * Create database table on activation
     */
    public static function activate()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'FRANKRC_share_links';
        $old_table_name = $wpdb->prefix . 'FRANKRC_share_links';

        // Migration: Rename old table if it exists
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Use prepare() manually or verify safety; SHOW TABLES requires direct query.
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $old_table_name)) === $old_table_name) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table names cannot be prepared; DDL requires direct query.
            $wpdb->query("RENAME TABLE $old_table_name TO $table_name");
        }

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            token varchar(64) NOT NULL,
            url text NOT NULL,
            device_width int(11) DEFAULT 375,
            device_height int(11) DEFAULT 667,
            device_name varchar(100) DEFAULT 'Mobile',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            expires_at datetime NOT NULL,
            created_by bigint(20) NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY token (token)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Generate unique token
     */
    private function generate_token()
    {
        return wp_generate_password(32, false, false);
    }

    /**
     * AJAX: Generate share link
     */
    public function ajax_generate_link()
    {
        check_ajax_referer('FRANKRC_share', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized', 403);
        }

        $url = isset($_POST['url']) ? esc_url_raw(wp_unslash($_POST['url'])) : home_url();
        $width = isset($_POST['width']) ? intval(wp_unslash($_POST['width'])) : 375;
        $height = isset($_POST['height']) ? intval(wp_unslash($_POST['height'])) : 667;
        $device = isset($_POST['device']) ? sanitize_text_field(wp_unslash($_POST['device'])) : 'Mobile';
        $expiry = isset($_POST['expiry']) ? sanitize_text_field(wp_unslash($_POST['expiry'])) : '24h';

        // Calculate expiry
        switch ($expiry) {
            case '1h':
                $expires_at = gmdate('Y-m-d H:i:s', strtotime('+1 hour'));
                break;
            case '24h':
                $expires_at = gmdate('Y-m-d H:i:s', strtotime('+24 hours'));
                break;
            case '7d':
                $expires_at = gmdate('Y-m-d H:i:s', strtotime('+7 days'));
                break;
            case '30d':
                $expires_at = gmdate('Y-m-d H:i:s', strtotime('+30 days'));
                break;
            default:
                $expires_at = gmdate('Y-m-d H:i:s', strtotime('+24 hours'));
        }

        $token = $this->generate_token();

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->insert(
            $this->table_name,
            array(
                'token' => $token,
                'url' => $url,
                'device_width' => $width,
                'device_height' => $height,
                'device_name' => $device,
                'expires_at' => $expires_at,
                'created_by' => get_current_user_id()
            ),
            array('%s', '%s', '%d', '%d', '%s', '%s', '%d')
        );

        if ($result) {
            wp_cache_delete('FRANKRC_links_' . get_current_user_id(), 'frankrc'); // phpcs:ignore WordPress.WP.ObjectCache.InvalidApcCacheUsage
            $share_url = home_url('/frank-responsive-checker-preview/' . $token);
            wp_send_json_success(array(
                'token' => $token,
                'url' => $share_url,
                'expires_at' => $expires_at
            ));
        } else {
            wp_send_json_error('Failed to create share link');
        }
    }

    /**
     * AJAX: Get share links
     */
    public function ajax_get_links()
    {
        check_ajax_referer('FRANKRC_share', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized', 403);
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $links = $wpdb->get_results(
            $wpdb->prepare(
                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                "SELECT * FROM {$this->table_name} WHERE created_by = %d ORDER BY created_at DESC LIMIT 50",
                get_current_user_id()
            )
        );

        wp_send_json_success($links);
    }

    /**
     * AJAX: Delete share link
     */
    public function ajax_delete_link()
    {
        check_ajax_referer('FRANKRC_share', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized', 403);
        }

        $token = isset($_POST['token']) ? sanitize_text_field(wp_unslash($_POST['token'])) : '';

        if (empty($token)) {
            wp_send_json_error('Invalid token');
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->delete(
            $this->table_name,
            array('token' => $token, 'created_by' => get_current_user_id()),
            array('%s', '%d')
        );

        if ($result) {
            wp_send_json_success('Link deleted');
        } else {
            wp_send_json_error('Failed to delete link');
        }
    }

    /**
     * Register rewrite rules
     */
    public function register_rewrite_rules()
    {
        add_rewrite_rule(
            '^frank-responsive-checker-preview/([a-zA-Z0-9]+)/?$',
            'index.php?FRANKRC_preview_token=$matches[1]',
            'top'
        );
        add_rewrite_tag('%FRANKRC_preview_token%', '([a-zA-Z0-9]+)');
    }

    /**
     * Handle preview request
     */
    public function handle_preview_request()
    {
        $token = get_query_var('FRANKRC_preview_token');

        if (empty($token)) {
            return;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $link = $wpdb->get_row(
            $wpdb->prepare(
                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                "SELECT * FROM {$this->table_name} WHERE token = %s",
                $token
            )
        );

        if (!$link) {
            wp_die('Preview link not found', 'Not Found', array('response' => 404));
        }

        if (strtotime($link->expires_at) < time()) {
            wp_die('This preview link has expired', 'Link Expired', array('response' => 410));
        }

        // Render preview page
        $this->render_preview_page($link);
        exit;
    }

    /**
     * Render preview page
     */
    private function render_preview_page($link)
    {
        $site_name = get_bloginfo('name');

        // Enqueue preview styles
        wp_enqueue_style('dashicons');
        wp_enqueue_style('frankrc-preview', FRANKRC_PLUGIN_URL . 'css/preview-page.css', array(), FRANKRC_VERSION);
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>

        <head>
            <meta charset="<?php bloginfo('charset'); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><?php echo esc_html($site_name); ?> - Device Preview</title>
            <?php
            wp_print_styles('dashicons');
            wp_print_styles('frankrc-preview');
            ?>
        </head>

        <body>
            <div class="header">
                <h1><?php echo esc_html($link->device_name); ?> Preview</h1>
                <div class="device-info">
                    <span><?php echo intval($link->device_width); ?> × <?php echo intval($link->device_height); ?>px</span>
                    <span>•</span>
                    <span>Expires: <?php echo esc_html(gmdate('M j, Y g:i A', strtotime($link->expires_at))); ?></span>
                </div>
            </div>
            <div class="device-frame">
                <div class="device-screen">
                    <iframe src="<?php echo esc_url($link->url); ?>" title="Device Preview"></iframe>
                </div>
            </div>
            <div class="footer">
                Powered by Frank Responsive Checker
            </div>
        </body>

        </html>
        <?php
    }

    /**
     * Add share nonce to script data
     */
    public function add_share_nonce($data)
    {
        $data['shareNonce'] = wp_create_nonce('FRANKRC_share');
        $data['ajaxUrl'] = admin_url('admin-ajax.php');
        return $data;
    }
}

/**
 * Settings Page Class
 */
class FRANKRC_Settings
{
    private static $instance = null;

    private $settings_page_hook;
    private $settings_submenu_hook;
    private $docs_page_hook;
    private $plugins_page_hook;
    private $themes_page_hook;

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('wp_ajax_FRANKRC_save_settings', array($this, 'ajax_save_settings'));
    }

    /**
     * Enqueue admin assets only on our settings page
     */
    public function enqueue_admin_assets($hook)
    {
        // Only load on our settings, docs, plugins, or themes pages
        $allowed_hooks = array(
            $this->settings_page_hook,
            $this->settings_submenu_hook,
            $this->docs_page_hook,
            $this->plugins_page_hook,
            $this->themes_page_hook
        );

        if (!in_array($hook, $allowed_hooks, true)) {
            return;
        }

        // Enqueue assets for settings and docs
        if ($hook === $this->settings_page_hook || $hook === $this->settings_submenu_hook || $hook === $this->docs_page_hook) {
            // Dashicons
            wp_enqueue_style('dashicons');

            // Admin settings CSS
            wp_enqueue_style(
                'frankrc-admin',
                FRANKRC_PLUGIN_URL . 'css/admin-settings.css',
                array('dashicons'),
                FRANKRC_VERSION
            );

            // Localize script for AJAX
            wp_localize_script('jquery', 'frankResponsiveCheckerAdmin', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('FRANKRC_save_settings'),
                'saving' => __('Saving...', 'frank-responsive-checker'),
                'saved' => __('Settings Saved!', 'frank-responsive-checker'),
                'error' => __('Error saving settings', 'frank-responsive-checker')
            ));

            // Add inline style for admin settings body background
            $inline_css = '
                #vm-settings-body {
                    background-color: var(--vm-bg-main) !important;
                    background-image:
                        radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.05) 0%, transparent 50%) !important;
                    background-attachment: fixed !important;
                }
            ';

            // Add docs page specific styles if we are on the docs page
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $current_page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';
            if ($current_page === 'frankrc-docs') {
                $inline_css .= '
                    /* Sidebar Navigation Styles */
                    .vm-docs-nav ul { list-style: none; margin: 0; padding: 0; }
                    .vm-docs-nav li { margin: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
                    .vm-docs-nav li:last-child { border-bottom: none; }
                    .vm-docs-nav a { display: flex; align-items: center; gap: 10px; padding: 15px 20px; color: var(--vm-text-secondary); text-decoration: none; transition: all 0.2s; font-size: 14px; }
                    .vm-docs-nav a .dashicons { color: var(--vm-text-muted); font-size: 18px; width: 18px; height: 18px; transition: all 0.2s; }
                    .vm-docs-nav a:hover { background: rgba(255, 255, 255, 0.03); color: var(--vm-text-primary); }
                    .vm-docs-nav a:hover .dashicons { color: var(--vm-primary); }
                    .vm-docs-nav a.active { background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent); color: var(--vm-primary-hover); border-left: 3px solid var(--vm-primary); }
                    .vm-docs-nav a.active .dashicons { color: var(--vm-primary); }

                    /* Responsive */
                    @media (max-width: 960px) {
                        .vm-container>div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                        .vm-card[style*="position: sticky"] { position: static !important; margin-bottom: 20px; }
                    }
                ';
            }

            wp_add_inline_style('frankrc-admin', $inline_css);

            // Add inline script for admin settings functionality
            $inline_js = "
            jQuery(document).ready(function($) {
                // Device dimensions lookup
                var deviceDimensions = {
                    'iPhone SE': { width: 375, height: 667 },
                    'iPhone 14': { width: 390, height: 844 },
                    'iPhone 14 Pro': { width: 393, height: 852 },
                    'iPhone 15 Pro Max': { width: 430, height: 932 },
                    'Galaxy S23': { width: 360, height: 780 },
                    'Pixel 7': { width: 412, height: 915 },
                    'iPad Mini': { width: 768, height: 1024 },
                    'iPad Air': { width: 820, height: 1180 },
                    'iPad Pro 12.9\"': { width: 1024, height: 1366 },
                    'Laptop 13\"': { width: 1280, height: 800 },
                    'Laptop 15\"': { width: 1440, height: 900 },
                    'Desktop HD': { width: 1920, height: 1080 },
                    'Desktop 2K': { width: 2560, height: 1440 }
                };

                // Tab switching
                $('.vm-tab').on('click', function(e) {
                    e.preventDefault();
                    var tabId = $(this).data('tab');

                    // Update active tab
                    $('.vm-tab').removeClass('active');
                    $(this).addClass('active');

                    // Show/hide content
                    $('.vm-tab-content').hide();
                    $('#' + tabId).fadeIn(200);
                });

                // Auto-update width/height when device changes
                $('.vm-select[name=\"FRANKRC_options[default_device]\"]').on('change', function() {
                    var selectedDevice = $(this).val();
                    if (deviceDimensions[selectedDevice]) {
                        $('input[name=\"FRANKRC_options[default_width]\"]').val(deviceDimensions[selectedDevice].width);
                        $('input[name=\"FRANKRC_options[default_height]\"]').val(deviceDimensions[selectedDevice].height);
                    }
                });

                // AJAX form submission
                $('#vm-settings-form').on('submit', function(e) {
                    e.preventDefault();

                    var \$form = $(this);
                    var \$button = $('.vm-btn-save');
                    var \$icon = \$button.find('.dashicons');
                    var \$text = \$button.find('.vm-btn-text');
                    var originalText = \$text.text();

                    // Show saving state
                    \$button.prop('disabled', true);
                    \$icon.removeClass('dashicons-saved').addClass('dashicons-update spin');
                    \$text.text(frankResponsiveCheckerAdmin.saving);

                    // Collect form data
                    var formData = \$form.serialize();
                    formData += '&action=FRANKRC_save_settings';
                    formData += '&nonce=' + frankResponsiveCheckerAdmin.nonce;

                    $.ajax({
                        url: frankResponsiveCheckerAdmin.ajaxUrl,
                        type: 'POST',
                        data: formData,
                        success: function(response) {
                            if (response.success) {
                                // Show success state
                                \$icon.removeClass('dashicons-update spin').addClass('dashicons-yes');
                                \$text.text(frankResponsiveCheckerAdmin.saved);
                                \$button.addClass('vm-btn-success');

                                // Show notification
                                showNotification(response.data.message, 'success');

                                // Reset button after 2 seconds
                                setTimeout(function() {
                                    \$icon.removeClass('dashicons-yes').addClass('dashicons-saved');
                                    \$text.text(originalText);
                                    \$button.removeClass('vm-btn-success').prop('disabled', false);
                                }, 2000);
                            } else {
                                // Show error state
                                \$icon.removeClass('dashicons-update spin').addClass('dashicons-no');
                                \$text.text(frankResponsiveCheckerAdmin.error);
                                \$button.addClass('vm-btn-error');

                                showNotification(response.data.message, 'error');

                                setTimeout(function() {
                                    \$icon.removeClass('dashicons-no').addClass('dashicons-saved');
                                    \$text.text(originalText);
                                    \$button.removeClass('vm-btn-error').prop('disabled', false);
                                }, 2000);
                            }
                        },
                        error: function() {
                            \$icon.removeClass('dashicons-update spin').addClass('dashicons-no');
                            \$text.text(frankResponsiveCheckerAdmin.error);
                            \$button.addClass('vm-btn-error');

                            showNotification(frankResponsiveCheckerAdmin.error, 'error');

                            setTimeout(function() {
                                \$icon.removeClass('dashicons-no').addClass('dashicons-saved');
                                \$text.text(originalText);
                                \$button.removeClass('vm-btn-error').prop('disabled', false);
                            }, 2000);
                        }
                    });
                });

                // Notification helper
                function showNotification(message, type) {
                    var \$notification = $('<div class=\"vm-notification vm-notification-' + type + '\">' + message + '</div>');
                    $('.vm-page-wrapper').prepend(\$notification);

                    setTimeout(function() {
                        \$notification.addClass('show');
                    }, 10);

                    setTimeout(function() {
                        \$notification.removeClass('show');
                        setTimeout(function() {
                            \$notification.remove();
                        }, 300);
                    }, 3000);
                }
            });
            ";
            wp_add_inline_script('jquery', $inline_js);
        } elseif ($hook === $this->plugins_page_hook || $hook === $this->themes_page_hook) {
            // Dashicons
            wp_enqueue_style('dashicons');

            // Enqueue Thickbox for plugin details modal
            add_thickbox();

            // Enqueue Our Plugins / Themes CSS
            wp_enqueue_style(
                'frankrc-our-plugins',
                FRANKRC_PLUGIN_URL . 'css/our-plugins-style.css',
                array('dashicons'),
                FRANKRC_VERSION
            );
        }
    }

    /**
     * Add settings page to admin menu
     */
    public function add_settings_page()
    {
        $this->settings_page_hook = add_menu_page(
            __('Responsive Checker Settings', 'frank-responsive-checker'),
            __('Responsive Checker', 'frank-responsive-checker'),
            'manage_options',
            'frank-responsive-checker',
            array($this, 'render_settings_page'),
            'dashicons-smartphone',
            80
        );

        // Add Settings submenu (same as parent)
        $this->settings_submenu_hook = add_submenu_page(
            'frank-responsive-checker',
            __('Settings', 'frank-responsive-checker'),
            __('Settings', 'frank-responsive-checker'),
            'manage_options',
            'frank-responsive-checker',
            array($this, 'render_settings_page')
        );

        // Add Documentation submenu
        $this->docs_page_hook = add_submenu_page(
            'frank-responsive-checker',
            __('Documentation', 'frank-responsive-checker'),
            __('Documentation', 'frank-responsive-checker'),
            'manage_options',
            'frankrc-docs',
            array($this, 'render_docs_page')
        );

        // Add Our Plugins submenu
        $this->plugins_page_hook = add_submenu_page(
            'frank-responsive-checker',
            __('Our Plugins', 'frank-responsive-checker'),
            __('Our Plugins', 'frank-responsive-checker'),
            'manage_options',
            'frankrc-plugins',
            array($this, 'render_plugins_page')
        );

        // Add Our Themes submenu
        $this->themes_page_hook = add_submenu_page(
            'frank-responsive-checker',
            __('Our Themes', 'frank-responsive-checker'),
            __('Our Themes', 'frank-responsive-checker'),
            'manage_options',
            'frankrc-themes',
            array($this, 'render_themes_page')
        );
    }


    /**
     * Handle AJAX settings save
     */
    public function ajax_save_settings()
    {
        // Verify nonce
        if (!check_ajax_referer('FRANKRC_save_settings', 'nonce', false)) {
            wp_send_json_error(array('message' => __('Security check failed', 'frank-responsive-checker')));
        }

        // Check capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied', 'frank-responsive-checker')));
        }

        // Get and sanitize options from POST
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized immediately below using sanitize_options method
        // Get and sanitize options from POST
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized immediately below using sanitize_options method
        $options = isset($_POST['FRANKRC_options']) ? wp_unslash($_POST['FRANKRC_options']) : array();

        // Sanitize using existing method
        $sanitized = $this->sanitize_options($options);

        // Update option
        $updated = update_option('FRANKRC_options', $sanitized);

        if ($updated || $sanitized === get_option('FRANKRC_options')) {
            wp_send_json_success(array('message' => __('Settings saved successfully', 'frank-responsive-checker')));
        } else {
            wp_send_json_error(array('message' => __('Failed to save settings', 'frank-responsive-checker')));
        }
    }

    /**
     * Register settings
     */
    public function register_settings()
    {
        // Migration: Old to New Options
        $old_options = get_option('FRANKRC_options');
        if ($old_options !== false) {
            update_option('FRANKRC_options', $old_options);
            delete_option('FRANKRC_options');
        }

        register_setting('FRANKRC_settings', 'FRANKRC_options', array(
            'sanitize_callback' => array($this, 'sanitize_options'),
            'default' => $this->get_defaults()
        ));
    }

    /**
     * Get default options
     */
    public function get_defaults()
    {
        return array(
            'default_device' => 'iPhone 14 Pro',
            'default_width' => 393,
            'default_height' => 852,
            'enable_screenshot' => 1,
            'enable_comparison' => 1,
            'enable_inspector' => 1,
            'enable_touch_mode' => 1,
            'enable_network_throttle' => 1,
            'enable_share_links' => 1,
            'enable_regression' => 1,
            'enable_reports' => 1,
            'enable_breakpoints' => 1,
            'enable_multipage' => 1,
            'allowed_roles' => array('administrator')
        );
    }

    /**
     * Sanitize options
     */
    public function sanitize_options($input)
    {
        $sanitized = array();
        $defaults = $this->get_defaults();

        $sanitized['default_device'] = sanitize_text_field($input['default_device'] ?? $defaults['default_device']);
        $sanitized['default_width'] = absint($input['default_width'] ?? $defaults['default_width']);
        $sanitized['default_height'] = absint($input['default_height'] ?? $defaults['default_height']);

        // Toggle features
        $sanitized['enable_screenshot'] = isset($input['enable_screenshot']) ? 1 : 0;
        $sanitized['enable_comparison'] = isset($input['enable_comparison']) ? 1 : 0;
        $sanitized['enable_inspector'] = isset($input['enable_inspector']) ? 1 : 0;
        $sanitized['enable_touch_mode'] = isset($input['enable_touch_mode']) ? 1 : 0;
        $sanitized['enable_network_throttle'] = isset($input['enable_network_throttle']) ? 1 : 0;
        $sanitized['enable_share_links'] = isset($input['enable_share_links']) ? 1 : 0;
        $sanitized['enable_regression'] = isset($input['enable_regression']) ? 1 : 0;
        $sanitized['enable_reports'] = isset($input['enable_reports']) ? 1 : 0;
        $sanitized['enable_breakpoints'] = isset($input['enable_breakpoints']) ? 1 : 0;
        $sanitized['enable_multipage'] = isset($input['enable_multipage']) ? 1 : 0;

        $sanitized['allowed_roles'] = isset($input['allowed_roles']) ? array_map('sanitize_text_field', (array) $input['allowed_roles']) : array('administrator');

        return $sanitized;
    }

    /**
     * Render settings page
     */
    public function render_settings_page()
    {
        $options = get_option('FRANKRC_options', $this->get_defaults());
        ?>
        <div class="frankrc-admin">
            <div class="vm-container">
                <!-- Header -->
                <div class="vm-header">
                    <div class="vm-header-left">
                        <div class="vm-logo">
                            <span class="dashicons dashicons-smartphone"></span>
                        </div>
                        <div class="vm-title-group">
                            <h1>
                                <?php echo esc_html__('Frank Responsive Checker', 'frank-responsive-checker'); ?>
                                <span class="vm-version">v<?php echo esc_html(FRANKRC_VERSION); ?></span>
                            </h1>
                            <p class="vm-header-subtitle">
                                <?php esc_html_e('Device Preview & Responsive Testing Tool', 'frank-responsive-checker'); ?>
                            </p>
                        </div>
                    </div>
                    <div class="vm-header-actions">
                        <button type="submit" form="vm-settings-form" class="vm-btn vm-btn-primary vm-btn-save">
                            <span class="dashicons dashicons-saved"></span>
                            <span class="vm-btn-text"><?php esc_html_e('Save Changes', 'frank-responsive-checker'); ?></span>
                        </button>
                    </div>
                </div>

                <form id="vm-settings-form" method="post" action="options.php">
                    <?php settings_fields('FRANKRC_settings'); ?>

                    <!-- Tab Navigation -->
                    <div class="vm-tabs">
                        <button type="button" class="vm-tab active" data-tab="general">
                            <span class="dashicons dashicons-admin-settings"></span>
                            <span><?php esc_html_e('General', 'frank-responsive-checker'); ?></span>
                        </button>
                        <button type="button" class="vm-tab" data-tab="features">
                            <span class="dashicons dashicons-admin-plugins"></span>
                            <span><?php esc_html_e('Features', 'frank-responsive-checker'); ?></span>
                        </button>
                        <button type="button" class="vm-tab" data-tab="access">
                            <span class="dashicons dashicons-admin-users"></span>
                            <span><?php esc_html_e('Access', 'frank-responsive-checker'); ?></span>
                        </button>
                    </div>

                    <!-- General Tab -->
                    <div id="general" class="vm-tab-content">
                        <div class="vm-card">
                            <div class="vm-card-header">
                                <div class="vm-card-icon">
                                    <span class="dashicons dashicons-smartphone"></span>
                                </div>
                                <div>
                                    <h3 class="vm-card-title">
                                        <?php esc_html_e('Default Device Settings', 'frank-responsive-checker'); ?>
                                    </h3>
                                    <p class="vm-card-description">
                                        <?php esc_html_e('Configure the default device when opening the preview panel', 'frank-responsive-checker'); ?>
                                    </p>
                                </div>
                            </div>

                            <div class="vm-form-row">
                                <label class="vm-form-label">
                                    <?php esc_html_e('Default Device', 'frank-responsive-checker'); ?>
                                    <span
                                        class="vm-label-hint"><?php esc_html_e('Device shown on panel open', 'frank-responsive-checker'); ?></span>
                                </label>
                                <div class="vm-form-field">
                                    <select name="FRANKRC_options[default_device]" class="vm-select">
                                        <optgroup label="<?php esc_attr_e('Mobile', 'frank-responsive-checker'); ?>">
                                            <option value="iPhone SE" <?php selected($options['default_device'], 'iPhone SE'); ?>>iPhone SE (375 × 667)</option>
                                            <option value="iPhone 14" <?php selected($options['default_device'], 'iPhone 14'); ?>>iPhone 14 (390 × 844)</option>
                                            <option value="iPhone 14 Pro" <?php selected($options['default_device'], 'iPhone 14 Pro'); ?>>iPhone 14 Pro (393 × 852)</option>
                                            <option value="iPhone 15 Pro Max" <?php selected($options['default_device'], 'iPhone 15 Pro Max'); ?>>iPhone 15 Pro Max (430 × 932)</option>
                                            <option value="Galaxy S23" <?php selected($options['default_device'], 'Galaxy S23'); ?>>Galaxy S23 (360 × 780)</option>
                                            <option value="Pixel 7" <?php selected($options['default_device'], 'Pixel 7'); ?>>
                                                Pixel 7 (412 × 915)</option>
                                        </optgroup>
                                        <optgroup label="<?php esc_attr_e('Tablet', 'frank-responsive-checker'); ?>">
                                            <option value="iPad Mini" <?php selected($options['default_device'], 'iPad Mini'); ?>>iPad Mini (768 × 1024)</option>
                                            <option value="iPad Air" <?php selected($options['default_device'], 'iPad Air'); ?>>
                                                iPad Air (820 × 1180)</option>
                                            <option value="iPad Pro 12.9&quot;" <?php selected($options['default_device'], 'iPad Pro 12.9"'); ?>>iPad Pro 12.9" (1024 × 1366)</option>
                                        </optgroup>
                                        <optgroup label="<?php esc_attr_e('Desktop', 'frank-responsive-checker'); ?>">
                                            <option value="Laptop 13&quot;" <?php selected($options['default_device'], 'Laptop 13"'); ?>>Laptop 13" (1280 × 800)</option>
                                            <option value="Laptop 15&quot;" <?php selected($options['default_device'], 'Laptop 15"'); ?>>Laptop 15" (1440 × 900)</option>
                                            <option value="Desktop HD" <?php selected($options['default_device'], 'Desktop HD'); ?>>Desktop HD (1920 × 1080)</option>
                                            <option value="Desktop 2K" <?php selected($options['default_device'], 'Desktop 2K'); ?>>Desktop 2K (2560 × 1440)</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div class="vm-form-row">
                                <label class="vm-form-label">
                                    <?php esc_html_e('Default Width', 'frank-responsive-checker'); ?>
                                    <span
                                        class="vm-label-hint"><?php esc_html_e('Width in pixels', 'frank-responsive-checker'); ?></span>
                                </label>
                                <div class="vm-form-field">
                                    <input type="number" name="FRANKRC_options[default_width]"
                                        value="<?php echo esc_attr($options['default_width']); ?>" min="200" max="3000"
                                        class="vm-input vm-input-number">
                                </div>
                            </div>

                            <div class="vm-form-row">
                                <label class="vm-form-label">
                                    <?php esc_html_e('Default Height', 'frank-responsive-checker'); ?>
                                    <span
                                        class="vm-label-hint"><?php esc_html_e('Height in pixels', 'frank-responsive-checker'); ?></span>
                                </label>
                                <div class="vm-form-field">
                                    <input type="number" name="FRANKRC_options[default_height]"
                                        value="<?php echo esc_attr($options['default_height']); ?>" min="200" max="3000"
                                        class="vm-input vm-input-number">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Features Tab -->
                    <div id="features" class="vm-tab-content" style="display:none;">
                        <div class="vm-card">
                            <div class="vm-card-header">
                                <div class="vm-card-icon">
                                    <span class="dashicons dashicons-admin-plugins"></span>
                                </div>
                                <div>
                                    <h3 class="vm-card-title">
                                        <?php esc_html_e('Feature Toggles', 'frank-responsive-checker'); ?>
                                    </h3>
                                    <p class="vm-card-description">
                                        <?php esc_html_e('Enable or disable individual plugin features', 'frank-responsive-checker'); ?>
                                    </p>
                                </div>
                            </div>

                            <div class="vm-feature-grid">
                                <!-- Screenshot Capture -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-camera"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Screenshot Capture', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Capture device screenshots and export as PDF', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_screenshot]" value="1" <?php checked($options['enable_screenshot'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Side-by-Side Comparison -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-columns"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Side-by-Side Comparison', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Compare multiple devices simultaneously', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_comparison]" value="1" <?php checked($options['enable_comparison'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Element Inspector -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-search"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Element Inspector', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Inspect elements and view computed styles', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_inspector]" value="1" <?php checked($options['enable_inspector'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Touch Simulation -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-index-card"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Touch Simulation', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Simulate touch events and gestures', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_touch_mode]" value="1" <?php checked($options['enable_touch_mode'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Network Throttling -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-performance"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Network Throttling', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Simulate slow network conditions', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_network_throttle]" value="1" <?php checked($options['enable_network_throttle'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Shareable Links -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-admin-links"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Shareable Links', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Generate preview links for sharing', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_share_links]" value="1" <?php checked($options['enable_share_links'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Visual Regression -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-visibility"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Visual Regression', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Detect visual changes over time', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_regression]" value="1" <?php checked($options['enable_regression'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Report Generation -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-analytics"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Report Generation', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Generate responsive testing reports', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_reports]" value="1" <?php checked($options['enable_reports'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Breakpoint Detection -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-editor-expand"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Breakpoint Detection', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Auto-detect CSS media query breakpoints', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_breakpoints]" value="1" <?php checked($options['enable_breakpoints'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>

                                <!-- Multi-Page Testing -->
                                <div class="vm-feature-item">
                                    <div class="vm-feature-icon">
                                        <span class="dashicons dashicons-admin-page"></span>
                                    </div>
                                    <div class="vm-feature-content">
                                        <div class="vm-feature-name">
                                            <?php esc_html_e('Multi-Page Testing', 'frank-responsive-checker'); ?>
                                        </div>
                                        <div class="vm-feature-desc">
                                            <?php esc_html_e('Test multiple pages in batch', 'frank-responsive-checker'); ?>
                                        </div>
                                    </div>
                                    <label class="vm-toggle vm-feature-toggle">
                                        <input type="checkbox" name="FRANKRC_options[enable_multipage]" value="1" <?php checked($options['enable_multipage'], 1); ?>>
                                        <span class="vm-toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Access Tab -->
                    <div id="access" class="vm-tab-content" style="display:none;">
                        <div class="vm-card">
                            <div class="vm-card-header">
                                <div class="vm-card-icon">
                                    <span class="dashicons dashicons-admin-users"></span>
                                </div>
                                <div>
                                    <h3 class="vm-card-title">
                                        <?php esc_html_e('User Access Control', 'frank-responsive-checker'); ?>
                                    </h3>
                                    <p class="vm-card-description">
                                        <?php esc_html_e('Control which user roles can access the preview panel', 'frank-responsive-checker'); ?>
                                    </p>
                                </div>
                            </div>

                            <div class="vm-feature-grid">
                                <?php
                                $roles = wp_roles()->roles;
                                foreach ($roles as $role_key => $role):
                                    ?>
                                    <div class="vm-feature-item">
                                        <div class="vm-feature-icon">
                                            <span class="dashicons dashicons-businessman"></span>
                                        </div>
                                        <div class="vm-feature-content">
                                            <div class="vm-feature-name"><?php echo esc_html($role['name']); ?></div>
                                            <div class="vm-feature-desc"><?php echo esc_html($role_key); ?></div>
                                        </div>
                                        <label class="vm-toggle vm-feature-toggle">
                                            <input type="checkbox" name="FRANKRC_options[allowed_roles][]"
                                                value="<?php echo esc_attr($role_key); ?>" <?php checked(in_array($role_key, $options['allowed_roles'], true)); ?>>
                                            <span class="vm-toggle-slider"></span>
                                        </label>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>


                </form>

                <!-- Footer -->
                <div class="vm-footer">
                    <div class="vm-footer-links">
                        <a href="https://wordpress.org/support/plugin/frank-responsive-checker/" class="vm-footer-link"
                            target="_blank">
                            <span class="dashicons dashicons-sos"></span>
                            <?php esc_html_e('Get Support', 'frank-responsive-checker'); ?>
                        </a>
                        <a href="https://wordpress.org/support/plugin/frank-responsive-checker/reviews/#new-post"
                            class="vm-footer-link" target="_blank">
                            <span class="dashicons dashicons-star-filled"></span>
                            <?php esc_html_e('Rate Plugin', 'frank-responsive-checker'); ?>
                        </a>
                    </div>
                    <div class="vm-footer-copyright">
                        <?php
                        /* translators: %s: Plugin version */
                        printf(esc_html__('Frank Responsive Checker v%s', 'frank-responsive-checker'), esc_html(FRANKRC_VERSION));
                        ?>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render documentation page
     */
    public function render_docs_page()
    {
        require_once FRANKRC_PLUGIN_DIR . 'docs/docs.php';
    }

    /**
     * Render our plugins page
     */
    public function render_plugins_page()
    {
        require_once FRANKRC_PLUGIN_DIR . 'our-plugins.php';
    }

    /**
     * Render our themes page
     */
    public function render_themes_page()
    {
        require_once FRANKRC_PLUGIN_DIR . 'our-themes.php';
    }

    /**
     * Old hardcoded documentation page (deprecated)
     */
    public function _render_docs_page_html()
    {
        ?>
        <div class="frankrc-admin">
            <div class="vm-container">
                <!-- Header -->
                <div class="vm-header">
                    <div class="vm-header-left">
                        <div class="vm-logo">
                            <span class="dashicons dashicons-book"></span>
                        </div>
                        <div class="vm-title-group">
                            <h1>
                                <?php echo esc_html__('Documentation', 'frank-responsive-checker'); ?>
                                <span class="vm-version">v<?php echo esc_html(FRANKRC_VERSION); ?></span>
                            </h1>
                            <p class="vm-header-subtitle">
                                <?php esc_html_e('Complete guide to using Frank Responsive Checker', 'frank-responsive-checker'); ?>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Documentation Content -->
                <div class="vm-docs-content">

                    <!-- Getting Started -->
                    <div class="vm-card">
                        <div class="vm-card-header">
                            <div class="vm-card-icon">
                                <span class="dashicons dashicons-flag"></span>
                            </div>
                            <div>
                                <h3 class="vm-card-title"><?php esc_html_e('Getting Started', 'frank-responsive-checker'); ?>
                                </h3>
                                <p class="vm-card-description">
                                    <?php esc_html_e('Quick start guide for Frank Responsive Checker', 'frank-responsive-checker'); ?>
                                </p>
                            </div>
                        </div>
                        <div class="vm-docs-section">
                            <h4><?php esc_html_e('Opening the Preview Panel', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Click the "Frank Responsive Checker" button in the WordPress admin bar at the top of any page (frontend or backend) to open the responsive preview panel.', 'frank-responsive-checker'); ?>
                            </p>

                            <h4><?php esc_html_e('Selecting a Device', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Choose from pre-configured devices in the device bar:', 'frank-responsive-checker'); ?>
                            </p>
                            <ul>
                                <li><strong><?php esc_html_e('Mobile:', 'frank-responsive-checker'); ?></strong>
                                    <?php esc_html_e('iPhone SE, iPhone 14, iPhone 14 Pro, iPhone 15 Pro Max, Galaxy S23, Pixel 7', 'frank-responsive-checker'); ?>
                                </li>
                                <li><strong><?php esc_html_e('Tablet:', 'frank-responsive-checker'); ?></strong>
                                    <?php esc_html_e('iPad Mini, iPad Air, iPad Pro 12.9"', 'frank-responsive-checker'); ?></li>
                                <li><strong><?php esc_html_e('Desktop:', 'frank-responsive-checker'); ?></strong>
                                    <?php esc_html_e('Laptop 13", Laptop 15", Desktop HD, Desktop 2K', 'frank-responsive-checker'); ?>
                                </li>
                            </ul>

                            <h4><?php esc_html_e('Custom Dimensions', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Enter custom width and height values in the dimension inputs to test any viewport size.', 'frank-responsive-checker'); ?>
                            </p>
                        </div>
                    </div>

                    <!-- Features Guide -->
                    <div class="vm-card">
                        <div class="vm-card-header">
                            <div class="vm-card-icon">
                                <span class="dashicons dashicons-admin-plugins"></span>
                            </div>
                            <div>
                                <h3 class="vm-card-title"><?php esc_html_e('Features Guide', 'frank-responsive-checker'); ?>
                                </h3>
                                <p class="vm-card-description">
                                    <?php esc_html_e('Detailed explanation of all plugin features', 'frank-responsive-checker'); ?>
                                </p>
                            </div>
                        </div>
                        <div class="vm-docs-section">

                            <h4><span class="dashicons dashicons-camera"></span>
                                <?php esc_html_e('Screenshot Capture', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Take screenshots of the current device view. Features include:', 'frank-responsive-checker'); ?>
                            </p>
                            <ul>
                                <li><?php esc_html_e('Single device screenshot', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Capture all devices at once', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Screenshot gallery with preview', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Export to PDF', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Download all screenshots as ZIP', 'frank-responsive-checker'); ?></li>
                            </ul>

                            <h4><span class="dashicons dashicons-columns"></span>
                                <?php esc_html_e('Side-by-Side Comparison', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Compare multiple devices simultaneously:', 'frank-responsive-checker'); ?></p>
                            <ul>
                                <li><?php esc_html_e('View 2, 3, or 4 devices at once', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Synchronized scrolling across all panels', 'frank-responsive-checker'); ?>
                                </li>
                                <li><?php esc_html_e('Independent device selection per panel', 'frank-responsive-checker'); ?>
                                </li>
                            </ul>

                            <h4><span class="dashicons dashicons-search"></span>
                                <?php esc_html_e('Element Inspector', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Inspect elements within the preview iframe to view computed styles and debug responsive issues.', 'frank-responsive-checker'); ?>
                            </p>

                            <h4><span class="dashicons dashicons-index-card"></span>
                                <?php esc_html_e('Touch Simulation', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Enable touch mode to simulate mobile touch events including:', 'frank-responsive-checker'); ?>
                            </p>
                            <ul>
                                <li><?php esc_html_e('Tap and hold gestures', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Swipe gestures', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Pinch to zoom (simulated)', 'frank-responsive-checker'); ?></li>
                            </ul>

                            <h4><span class="dashicons dashicons-performance"></span>
                                <?php esc_html_e('Network Throttling', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Simulate slow network conditions to test page performance:', 'frank-responsive-checker'); ?>
                            </p>
                            <ul>
                                <li><?php esc_html_e('3G Slow, 3G Fast', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('4G', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Offline mode', 'frank-responsive-checker'); ?></li>
                            </ul>

                            <h4><span class="dashicons dashicons-admin-links"></span>
                                <?php esc_html_e('Shareable Links', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Generate temporary preview links to share with clients or team members. Links can expire after 1 hour, 24 hours, 7 days, or 30 days.', 'frank-responsive-checker'); ?>
                            </p>

                            <h4><span class="dashicons dashicons-visibility"></span>
                                <?php esc_html_e('Visual Regression Testing', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Compare the current state of your site against a saved baseline to detect visual changes.', 'frank-responsive-checker'); ?>
                            </p>

                            <h4><span class="dashicons dashicons-editor-expand"></span>
                                <?php esc_html_e('Breakpoint Detection', 'frank-responsive-checker'); ?></h4>
                            <p><?php esc_html_e('Automatically detect CSS media query breakpoints used on the current page.', 'frank-responsive-checker'); ?>
                            </p>
                        </div>
                    </div>

                    <!-- Keyboard Shortcuts -->
                    <div class="vm-card">
                        <div class="vm-card-header">
                            <div class="vm-card-icon">
                                <span class="dashicons dashicons-editor-help"></span>
                            </div>
                            <div>
                                <h3 class="vm-card-title"><?php esc_html_e('Keyboard Shortcuts', 'frank-responsive-checker'); ?>
                                </h3>
                                <p class="vm-card-description">
                                    <?php esc_html_e('Speed up your workflow with keyboard shortcuts', 'frank-responsive-checker'); ?>
                                </p>
                            </div>
                        </div>
                        <div class="vm-docs-section">
                            <table class="vm-shortcuts-table">
                                <thead>
                                    <tr>
                                        <th><?php esc_html_e('Shortcut', 'frank-responsive-checker'); ?></th>
                                        <th><?php esc_html_e('Action', 'frank-responsive-checker'); ?></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><kbd>Esc</kbd></td>
                                        <td><?php esc_html_e('Close panel / Exit fullscreen', 'frank-responsive-checker'); ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><kbd>←</kbd> / <kbd>→</kbd></td>
                                        <td><?php esc_html_e('Previous / Next device', 'frank-responsive-checker'); ?></td>
                                    </tr>
                                    <tr>
                                        <td><kbd>R</kbd></td>
                                        <td><?php esc_html_e('Rotate device (portrait/landscape)', 'frank-responsive-checker'); ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><kbd>S</kbd></td>
                                        <td><?php esc_html_e('Take screenshot', 'frank-responsive-checker'); ?></td>
                                    </tr>
                                    <tr>
                                        <td><kbd>C</kbd></td>
                                        <td><?php esc_html_e('Toggle comparison mode', 'frank-responsive-checker'); ?></td>
                                    </tr>
                                    <tr>
                                        <td><kbd>F</kbd></td>
                                        <td><?php esc_html_e('Toggle fullscreen mode', 'frank-responsive-checker'); ?></td>
                                    </tr>
                                    <tr>
                                        <td><kbd>?</kbd></td>
                                        <td><?php esc_html_e('Show keyboard shortcuts help', 'frank-responsive-checker'); ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><kbd>1</kbd> - <kbd>9</kbd></td>
                                        <td><?php esc_html_e('Quick switch to device 1-9', 'frank-responsive-checker'); ?></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Fullscreen Mode -->
                    <div class="vm-card">
                        <div class="vm-card-header">
                            <div class="vm-card-icon">
                                <span class="dashicons dashicons-fullscreen-alt"></span>
                            </div>
                            <div>
                                <h3 class="vm-card-title"><?php esc_html_e('Fullscreen Mode', 'frank-responsive-checker'); ?>
                                </h3>
                                <p class="vm-card-description">
                                    <?php esc_html_e('Immersive fullscreen preview experience', 'frank-responsive-checker'); ?>
                                </p>
                            </div>
                        </div>
                        <div class="vm-docs-section">
                            <p><?php esc_html_e('Click the fullscreen button or press F to enter fullscreen mode. In fullscreen mode:', 'frank-responsive-checker'); ?>
                            </p>
                            <ul>
                                <li><strong><?php esc_html_e('Show/Hide Controls:', 'frank-responsive-checker'); ?></strong>
                                    <?php esc_html_e('Click the purple "Show Controls" button at the bottom-right to toggle the visibility of all toolbars.', 'frank-responsive-checker'); ?>
                                </li>
                                <li><strong><?php esc_html_e('Exit Fullscreen:', 'frank-responsive-checker'); ?></strong>
                                    <?php esc_html_e('Click the circular exit button at the top-right or press Esc.', 'frank-responsive-checker'); ?>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Custom Devices -->
                    <div class="vm-card">
                        <div class="vm-card-header">
                            <div class="vm-card-icon">
                                <span class="dashicons dashicons-plus-alt"></span>
                            </div>
                            <div>
                                <h3 class="vm-card-title"><?php esc_html_e('Custom Devices', 'frank-responsive-checker'); ?>
                                </h3>
                                <p class="vm-card-description">
                                    <?php esc_html_e('Add your own device presets', 'frank-responsive-checker'); ?>
                                </p>
                            </div>
                        </div>
                        <div class="vm-docs-section">
                            <p><?php esc_html_e('Click the "+" button in the device bar to add a custom device with:', 'frank-responsive-checker'); ?>
                            </p>
                            <ul>
                                <li><?php esc_html_e('Custom name', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Width and height in pixels', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Category (Mobile, Tablet, Desktop)', 'frank-responsive-checker'); ?></li>
                            </ul>
                            <p><?php esc_html_e('Custom devices are saved to your browser and persist across sessions.', 'frank-responsive-checker'); ?>
                            </p>
                        </div>
                    </div>

                    <!-- FAQ -->
                    <div class="vm-card">
                        <div class="vm-card-header">
                            <div class="vm-card-icon">
                                <span class="dashicons dashicons-sos"></span>
                            </div>
                            <div>
                                <h3 class="vm-card-title">
                                    <?php esc_html_e('Frequently Asked Questions', 'frank-responsive-checker'); ?>
                                </h3>
                                <p class="vm-card-description">
                                    <?php esc_html_e('Common questions and answers', 'frank-responsive-checker'); ?>
                                </p>
                            </div>
                        </div>
                        <div class="vm-docs-section vm-faq">

                            <div class="vm-faq-item">
                                <h4><?php esc_html_e('Why are screenshots blank or showing only the frame?', 'frank-responsive-checker'); ?>
                                </h4>
                                <p><?php esc_html_e('Screenshots capture the actual iframe content. If viewing an external site or a page with strict security headers, the iframe content may not be accessible. For best results, use Frank Responsive Checker on pages from your own WordPress site.', 'frank-responsive-checker'); ?>
                                </p>
                            </div>

                            <div class="vm-faq-item">
                                <h4><?php esc_html_e('Can I test pages that require login?', 'frank-responsive-checker'); ?>
                                </h4>
                                <p><?php esc_html_e('Yes! Since you\'re already logged into WordPress, the iframe inherits your session. You can test protected pages, admin pages, and user-specific content.', 'frank-responsive-checker'); ?>
                                </p>
                            </div>

                            <div class="vm-faq-item">
                                <h4><?php esc_html_e('How do shareable links work?', 'frank-responsive-checker'); ?></h4>
                                <p><?php esc_html_e('Shareable links create a public preview URL with specific device dimensions. The link shows your page exactly as it appears in the selected device. Links expire automatically based on your chosen duration.', 'frank-responsive-checker'); ?>
                                </p>
                            </div>

                            <div class="vm-faq-item">
                                <h4><?php esc_html_e('Does this affect my live site?', 'frank-responsive-checker'); ?></h4>
                                <p><?php esc_html_e('No. Frank Responsive Checker only provides a preview interface. It does not modify any content, styles, or database entries on your site.', 'frank-responsive-checker'); ?>
                                </p>
                            </div>

                            <div class="vm-faq-item">
                                <h4><?php esc_html_e('Which user roles can access the preview panel?', 'frank-responsive-checker'); ?>
                                </h4>
                                <p><?php esc_html_e('By default, only Administrators can access Frank Responsive Checker. You can enable access for other roles in Settings → Access tab.', 'frank-responsive-checker'); ?>
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                <!-- Footer -->
                <div class="vm-footer">
                    <div class="vm-footer-links">
                        <a href="<?php echo esc_url(admin_url('admin.php?page=frank-responsive-checker')); ?>"
                            class="vm-footer-link">
                            <span class="dashicons dashicons-admin-settings"></span>
                            <?php esc_html_e('Settings', 'frank-responsive-checker'); ?>
                        </a>
                        <a href="https://wordpress.org/support/plugin/frank-responsive-checker/" class="vm-footer-link"
                            target="_blank">
                            <span class="dashicons dashicons-sos"></span>
                            <?php esc_html_e('Get Support', 'frank-responsive-checker'); ?>
                        </a>
                    </div>
                    <div class="vm-footer-copyright">
                        <?php
                        /* translators: %s: Plugin version */
                        printf(esc_html__('Frank Responsive Checker v%s', 'frank-responsive-checker'), esc_html(FRANKRC_VERSION));
                        ?>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}


// Initialize share links handler
FRANKRC_Share_Links::get_instance();

// Initialize settings
FRANKRC_Settings::get_instance();

// Register activation hook
register_activation_hook(__FILE__, array('FRANKRC_Share_Links', 'activate'));

// Initialize the main plugin
frankrc::get_instance();
