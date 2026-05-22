<?php
if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}
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
                    <h1><?php esc_html_e('Documentation', 'frank-responsive-checker'); ?></h1>
                    <p class="vm-header-subtitle"><?php esc_html_e('Comprehensive guide to Frank Responsive Checker features', 'frank-responsive-checker'); ?></p>
                </div>
            </div>
            <div class="vm-header-actions">
                <a href="https://wordpress.org/support/plugin/frank-responsive-checker/" target="_blank" class="vm-header-btn">
                    <span class="dashicons dashicons-external"></span>
                    <?php esc_html_e('Support Forum', 'frank-responsive-checker'); ?>
                </a>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 260px 1fr; gap: var(--vm-space-lg); align-items: start;">

            <!-- Sidebar Navigation -->
            <div class="vm-card" style="padding: 0; overflow: hidden; position: sticky; top: 40px;">
                <nav class="vm-docs-nav">
                    <ul>
                        <li><a href="#quick-start" class="active"><span class="dashicons dashicons-lightbulb"></span> <?php esc_html_e('Quick Start', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#device-preview"><span class="dashicons dashicons-smartphone"></span> <?php esc_html_e('Device Preview', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#visual-tools"><span class="dashicons dashicons-camera"></span> <?php esc_html_e('Visual Tools', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#mockup-generator"><span class="dashicons dashicons-art"></span> <?php esc_html_e('Mockup Generator', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#advanced-tools"><span class="dashicons dashicons-hammer"></span> <?php esc_html_e('Advanced Tools', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#utilities"><span class="dashicons dashicons-admin-tools"></span> <?php esc_html_e('Utilities', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#shortcuts"><span class="dashicons dashicons-keyboard-comment"></span> <?php esc_html_e('Shortcuts', 'frank-responsive-checker'); ?></a></li>
                        <li><a href="#faq"><span class="dashicons dashicons-editor-help"></span> <?php esc_html_e('FAQ', 'frank-responsive-checker'); ?></a></li>
                    </ul>
                </nav>
            </div>

            <!-- Content Area -->
            <div class="vm-docs-content">

                <!-- Quick Start -->
                <div id="quick-start" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-lightbulb"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Quick Start', 'frank-responsive-checker'); ?></h3>
                    </div>
                    <div style="color: var(--vm-text-secondary); line-height: 1.6;">
                        <p><?php esc_html_e('Get started with responsive testing in seconds.', 'frank-responsive-checker'); ?></p>
                        <ol style="margin-left: 20px;">
                            <li style="margin-bottom: 10px;"><?php esc_html_e('Navigate to any page on your website.', 'frank-responsive-checker'); ?></li>
                            <li style="margin-bottom: 10px;"><?php esc_html_e('Click the', 'frank-responsive-checker'); ?> <strong style="color: var(--vm-primary-hover);"><?php esc_html_e('Frank Responsive Checker', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('button in the WordPress admin bar at the top of the screen.', 'frank-responsive-checker'); ?></li>
                            <li><?php esc_html_e('The preview panel will open instantly overlaying your site.', 'frank-responsive-checker'); ?></li>
                        </ol>
                        <div class="vm-notice vm-notice-success" style="margin-top: 20px;">
                            <div class="vm-notice-icon"><span class="dashicons dashicons-yes"></span></div>
                            <div class="vm-notice-content">
                                <div class="vm-notice-title"><?php esc_html_e('Pro Tip', 'frank-responsive-checker'); ?></div>
                                <div class="vm-notice-message"><?php esc_html_e('Use the keyboard shortcut', 'frank-responsive-checker'); ?> <kbd style="background: rgba(255,255,255,0.1); border: 1px solid var(--vm-border); padding: 2px 6px; border-radius: 4px; color: var(--vm-text-primary);">Ctrl + Shift + D</kbd> <?php esc_html_e('(or Cmd + Shift + D on Mac) to toggle the panel open/closed anywhere!', 'frank-responsive-checker'); ?></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Device Preview -->
                <div id="device-preview" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-smartphone"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Device Preview Controls', 'frank-responsive-checker'); ?></h3>
                    </div>
                    <div style="color: var(--vm-text-secondary); line-height: 1.6;">
                        <p><?php esc_html_e('Simulate how your site looks on over 50+ real-world devices.', 'frank-responsive-checker'); ?></p>

                        <h4 style="color: var(--vm-text-primary); margin-top: 20px;"><?php esc_html_e('Switching Devices', 'frank-responsive-checker'); ?></h4>
                        <p><?php esc_html_e('Click any device icon in the top toolbar to instantly resize the viewport. Devices are categorized:', 'frank-responsive-checker'); ?></p>
                        <ul style="list-style: disc; margin-left: 20px;">
                            <li><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Mobiles:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('iPhone SE, 13 Pro, Samsung S22, Pixel 7, etc.', 'frank-responsive-checker'); ?></li>
                            <li><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Tablets:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('iPad Air, iPad Pro, Galaxy Tab.', 'frank-responsive-checker'); ?></li>
                            <li><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Laptops/Desktops:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('MacBook Air, 1080p Desktop, 4K Monitor.', 'frank-responsive-checker'); ?></li>
                        </ul>

                        <h4 style="color: var(--vm-text-primary); margin-top: 20px;"><?php esc_html_e('Rotation & Custom Size', 'frank-responsive-checker'); ?></h4>
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: var(--vm-radius-sm);">
                                <span class="dashicons dashicons-image-rotate" style="color: var(--vm-accent);"></span>
                                <div><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Rotate:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('Click the rotate icon to swap width and height (Portrait ↔ Landscape).', 'frank-responsive-checker'); ?></div>
                            </li>
                            <li style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: var(--vm-radius-sm);">
                                <span class="dashicons dashicons-editor-expand" style="color: var(--vm-accent);"></span>
                                <div><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Custom Dimensions:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('Manually type any pixel value into the Width (W) and Height (H) inputs.', 'frank-responsive-checker'); ?></div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Visual Tools -->
                <div id="visual-tools" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-camera"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Visual Tools', 'frank-responsive-checker'); ?></h3>
                    </div>

                    <div class="vm-feature-grid">
                        <div class="vm-feature-item">
                            <div class="vm-feature-icon"><span class="dashicons dashicons-camera"></span></div>
                            <div class="vm-feature-content">
                                <div class="vm-feature-name"><?php esc_html_e('Instant Screenshots', 'frank-responsive-checker'); ?></div>
                                <div class="vm-feature-desc"><?php esc_html_e('Capture exactly what you see. Click the camera icon to save a PNG of the current device view.', 'frank-responsive-checker'); ?></div>
                            </div>
                        </div>

                        <div class="vm-feature-item">
                            <div class="vm-feature-icon"><span class="dashicons dashicons-images-alt2"></span></div>
                            <div class="vm-feature-content">
                                <div class="vm-feature-name"><?php esc_html_e('Capture All Devices', 'frank-responsive-checker'); ?></div>
                                <div class="vm-feature-desc"><?php esc_html_e('Automatically cycle through 12 popular devices and save screenshots for all of them in one batch.', 'frank-responsive-checker'); ?></div>
                            </div>
                        </div>

                        <div class="vm-feature-item">
                            <div class="vm-feature-icon"><span class="dashicons dashicons-image-flip-horizontal"></span></div>
                            <div class="vm-feature-content">
                                <div class="vm-feature-name"><?php esc_html_e('Visual Regression', 'frank-responsive-checker'); ?></div>
                                <div class="vm-feature-desc">
                                    <?php esc_html_e('Detect design breaks.', 'frank-responsive-checker'); ?>
                                    <ol style="margin-left: 15px; margin-top: 5px; color: var(--vm-text-muted);">
                                        <li><?php esc_html_e('Click "Set Baseline"', 'frank-responsive-checker'); ?></li>
                                        <li><?php esc_html_e('Change code', 'frank-responsive-checker'); ?></li>
                                        <li><?php esc_html_e('Click "Compare" to see diffs', 'frank-responsive-checker'); ?></li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mockup Generator -->
                <div id="mockup-generator" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-art"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Mockup Generator V2', 'frank-responsive-checker'); ?></h3>
                    </div>
                    <div style="color: var(--vm-text-secondary); line-height: 1.6;">
                        <p><?php esc_html_e('Create professional marketing assets directly from your site.', 'frank-responsive-checker'); ?></p>

                        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: var(--vm-radius-md); margin: 15px 0;">
                            <h4 style="color: var(--vm-text-primary); margin: 0 0 10px 0;"><?php esc_html_e('How to use:', 'frank-responsive-checker'); ?></h4>
                            <ol style="margin-left: 20px; margin-bottom: 0;">
                                <li><?php esc_html_e('Click the', 'frank-responsive-checker'); ?> <strong><?php esc_html_e('Mockup', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('button in the toolbar.', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Enter the URL (defaults to current page).', 'frank-responsive-checker'); ?></li>
                                <li><?php esc_html_e('Click', 'frank-responsive-checker'); ?> <strong><?php esc_html_e('Load Preview', 'frank-responsive-checker'); ?></strong>.</li>
                                <li><?php esc_html_e('Select a device frame (iPhone, MacBook, iPad).', 'frank-responsive-checker'); ?></li>
                            </ol>
                        </div>

                        <h4 style="color: var(--vm-text-primary); margin-top: 20px;"><?php esc_html_e('✨ New Features:', 'frank-responsive-checker'); ?></h4>
                        <ul style="list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <li style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: var(--vm-radius-md); border: 1px solid var(--vm-border);">
                                <strong style="color: var(--vm-primary-hover); display: block; margin-bottom: 5px;"><?php esc_html_e('Transparent Background', 'frank-responsive-checker'); ?></strong>
                                <?php esc_html_e('Click the checkerboard icon', 'frank-responsive-checker'); ?> (<span class="dashicons dashicons-grid-view"></span>) <?php esc_html_e('to export transparent PNGs.', 'frank-responsive-checker'); ?>
                            </li>
                            <li style="background: rgba(6, 182, 212, 0.1); padding: 15px; border-radius: var(--vm-radius-md); border: 1px solid rgba(6, 182, 212, 0.2);">
                                <strong style="color: var(--vm-accent); display: block; margin-bottom: 5px;"><?php esc_html_e('Background Color', 'frank-responsive-checker'); ?></strong>
                                <?php esc_html_e('Use the color picker to set a solid brand color backdrop.', 'frank-responsive-checker'); ?>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Advanced Tools -->
                <div id="advanced-tools" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-hammer"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Advanced Developer Tools', 'frank-responsive-checker'); ?></h3>
                    </div>

                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: separate; border-spacing: 0; color: var(--vm-text-secondary); text-align: left;">
                            <thead>
                                <tr>
                                    <th style="padding: 12px; border-bottom: 1px solid var(--vm-border); color: var(--vm-text-primary);"><?php esc_html_e('Tool', 'frank-responsive-checker'); ?></th>
                                    <th style="padding: 12px; border-bottom: 1px solid var(--vm-border); color: var(--vm-text-primary);"><?php esc_html_e('Description', 'frank-responsive-checker'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--vm-text-primary);"><strong><?php esc_html_e('Inspector', 'frank-responsive-checker'); ?></strong> <span class="dashicons dashicons-search"></span></td>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);"><?php esc_html_e('Hover to see computed dimensions, margins, padding.', 'frank-responsive-checker'); ?></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--vm-text-primary);"><strong><?php esc_html_e('Touch Mode', 'frank-responsive-checker'); ?></strong> <span class="dashicons dashicons-smartphone"></span></td>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);"><?php esc_html_e('Simulates touch events (swipe, tap).', 'frank-responsive-checker'); ?></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--vm-text-primary);"><strong><?php esc_html_e('Annotate', 'frank-responsive-checker'); ?></strong> <span class="dashicons dashicons-edit"></span></td>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);"><?php esc_html_e('Draw arrows, boxes, and add text directly on preview.', 'frank-responsive-checker'); ?></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--vm-text-primary);"><strong><?php esc_html_e('Network Throttling', 'frank-responsive-checker'); ?></strong> <span class="dashicons dashicons-performance"></span></td>
                                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);"><?php esc_html_e('Simulate "Slow 3G" or "Offline" modes.', 'frank-responsive-checker'); ?></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; color: var(--vm-text-primary);"><strong><?php esc_html_e('Design Mode', 'frank-responsive-checker'); ?></strong> <span class="dashicons dashicons-art"></span></td>
                                    <td style="padding: 12px;"><?php esc_html_e('Makes all text editable to test copy changes.', 'frank-responsive-checker'); ?></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Utilities -->
                <div id="utilities" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-admin-tools"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Utilities', 'frank-responsive-checker'); ?></h3>
                    </div>
                    <ul style="color: var(--vm-text-secondary); line-height: 1.8; list-style: none; margin: 0; padding: 0;">
                        <li style="margin-bottom: 10px;"><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Share Preview:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('Generate a temporary public link to share a specific device view with clients.', 'frank-responsive-checker'); ?></li>
                        <li style="margin-bottom: 10px;"><strong style="color: var(--vm-text-primary);"><?php esc_html_e('QR Code:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('Show a QR code for the current URL to easily open it on your physical phone.', 'frank-responsive-checker'); ?></li>
                        <li><strong style="color: var(--vm-text-primary);"><?php esc_html_e('Dark/Light Mode:', 'frank-responsive-checker'); ?></strong> <?php esc_html_e('Toggle the preview canvas background between Dark, Light, and Checkerboard to test contrast.', 'frank-responsive-checker'); ?></li>
                    </ul>
                </div>

                <!-- Shortcuts -->
                <div id="shortcuts" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-keyboard-comment"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('Keyboard Shortcuts', 'frank-responsive-checker'); ?></h3>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                        <?php
                        $frankrc_shortcuts = [
                            ['keys' => ['Ctrl', 'Shift', 'D'], 'desc' => __('Toggle Panel', 'frank-responsive-checker')],
                            ['keys' => ['Ctrl', 'R'], 'desc' => __('Rotate Device', 'frank-responsive-checker')],
                            ['keys' => ['Ctrl', 'S'], 'desc' => __('Take Screenshot', 'frank-responsive-checker')],
                            ['keys' => ['Esc'], 'desc' => __('Close / Exit Fullscreen', 'frank-responsive-checker')],
                            ['keys' => ['Ctrl', '+'], 'desc' => __('Zoom In', 'frank-responsive-checker')],
                            ['keys' => ['Ctrl', '-'], 'desc' => __('Zoom Out', 'frank-responsive-checker')],
                        ];
                        foreach ($frankrc_shortcuts as $frankrc_sc) : ?>
                            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--vm-radius-md); display: flex; align-items: center; gap: 8px;">
                                <div style="display: flex; gap: 4px;">
                                    <?php foreach ($frankrc_sc['keys'] as $frankrc_key) : ?>
                                        <kbd style="background: var(--vm-bg-input); border: 1px solid var(--vm-border); padding: 2px 6px; border-radius: 4px; color: var(--vm-text-primary); font-family: monospace; font-size: 11px;"><?php echo esc_html($frankrc_key); ?></kbd>
                                    <?php endforeach; ?>
                                </div>
                                <span style="color: var(--vm-text-secondary); font-size: 13px; margin-left: auto;"><?php echo esc_html($frankrc_sc['desc']); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- FAQ -->
                <div id="faq" class="vm-card">
                    <div class="vm-card-header">
                        <div class="vm-card-icon"><span class="dashicons dashicons-editor-help"></span></div>
                        <h3 class="vm-card-title"><?php esc_html_e('FAQ', 'frank-responsive-checker'); ?></h3>
                    </div>

                    <details style="margin-bottom: 15px; background: rgba(255,255,255,0.03); border-radius: var(--vm-radius-md); overflow: hidden;">
                        <summary style="padding: 15px; cursor: pointer; color: var(--vm-text-primary); font-weight: 500; outline: none;"><?php esc_html_e('Does it work with Elementor/Divi/Gutenberg?', 'frank-responsive-checker'); ?></summary>
                        <div style="padding: 0 15px 15px 15px; color: var(--vm-text-secondary); line-height: 1.6;">
                            <?php esc_html_e('Yes! Frank Responsive Checker works with any page builder as it simply wraps your frontend view in an iframe simulation.', 'frank-responsive-checker'); ?>
                        </div>
                    </details>

                    <details style="background: rgba(255,255,255,0.03); border-radius: var(--vm-radius-md); overflow: hidden;">
                        <summary style="padding: 15px; cursor: pointer; color: var(--vm-text-primary); font-weight: 500; outline: none;"><?php esc_html_e('Why is my preview blank?', 'frank-responsive-checker'); ?></summary>
                        <div style="padding: 0 15px 15px 15px; color: var(--vm-text-secondary); line-height: 1.6;">
                            <?php esc_html_e('If your site sends an "X-Frame-Options: SAMEORIGIN" header, it might block iframe loading. However, since the plugin runs on the same domain, this usually isn\'t an issue unless you serve admin over HTTP and site over HTTPS (mixed content).', 'frank-responsive-checker'); ?>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    </div>
</div>