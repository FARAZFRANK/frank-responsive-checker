=== Frank Responsive Checker - Device Preview, Viewport & Accessibility ===
Contributors: awordpresslife, razipathhan, hanif0991, muhammadshahid, fkfaisalkhan007, sharikkhan007, zishlife, FARAZFRANK
Tags: responsive, device preview, mobile preview, viewport, accessibility
Requires at least: 5.0
Tested up to: 7.0
Stable tag: 1.0.4
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Test website layouts with device preview and viewport tool. Check website accessibility, take screenshots, and run comparisons.

== Description ==

Frank Responsive Checker helps you test your website on many screens. It is built for developers, designers, and site owners.

How this plugin works: https://wpfrank.com/how-to-use-frank-responsive-checker/

You can preview your pages on over fifty devices directly from your WordPress dashboard.

=== Viewport and Device Preview Simulation ===

This plugin shows how your pages look on popular mobile screens, tablets, and desktops.

* Use the device preview to see mobile views instantly.
* Test both portrait and landscape views with one click.
* Enter custom width and height values to test any viewport size.
* Save your custom device profiles for quick access later.

=== Accessibility Testing for Better Usability ===

Check your website pages for common accessibility issues. This helps make your site user-friendly.

* Run a WCAG contrast check to read text clearly.
* Find images that are missing alt text tags.
* Show the keyboard focus order with numbered badges on screen.
* Simulate a screen reader to hear how the page is read.

=== Screen Capture and Visual Differences ===

Take snapshots of your pages to keep track of layout changes.

* Save screenshots of any viewport layout with one click.
* Compare two or three device viewports side by side.
* Scroll all viewports at the same time to check layout alignment.
* Compare new pages against baseline snapshots to find pixel differences.

== Installation ==

1. Upload the plugin folder to your `/wp-content/plugins/` directory.
2. Activate the plugin on the Plugins page in WordPress.
3. Click the Device Preview button in your admin bar to start testing.
4. Go to Settings > Responsive Checker to adjust your options.

== Frequently Asked Questions ==

= How do I start the device preview simulator? =
Click the Device Preview button in your admin bar. You can also use the Ctrl+Shift+D shortcut.

= Can I test custom viewport sizes? =
Yes. You can input any custom width and height. This lets you simulate any viewport.

= Does this plugin include accessibility audits? =
Yes. The plugin tests contrast ratios, missing alt texts, focus order, and simulated screen reader content.

= Can I preview pages that require a user login? =
Yes. The plugin runs in your active browser session. It can test drafts and private pages.

= How do public preview links work? =
You can create a secure link for any page. Anyone can use this link to view the responsive layouts.

== Screenshots ==

1. Main workspace showing the mobile device preview.
2. Side-by-side comparison of different viewport sizes.
3. Accessibility test showing focus order and contrast scores.
4. Custom device setup panel.
5. Admin settings page.

== Changelog ==

= 1.0.4 =
* Fixed double script execution issue in WordPress backend when admin bar is active.
* Moved admin settings styles and scripts to load exclusively on the plugin settings and documentation pages.

= 1.0.3 =
* Removed custom CSS input to follow WordPress security guidelines.

= 1.0.2 =
* Updated script loading to meet WordPress guidelines.
* Fixed security nonce issues in AJAX requests.
* Moved styles to external files for faster load times.

= 1.0.1 =
* Added device preview screenshots and regression tools.
* Added side-by-side comparison with sync scrolling.
* Added custom viewports and user agent testing.
* Added accessibility contrast checks and focus maps.
* Added temporary links to share layout tests.
* Added developer console logs and media query lists.

= 1.0.0 =
* First release of the plugin.

== Upgrade Notice ==

= 1.0.4 =
* Bugfix: Fixes close button double-click issue in backend admin area.

= 1.0.3 =
* Security update: removed custom script entry to follow plugin rules.

= 1.0.2 =
* Compliance update: fixed script loading paths for directory rules.

= 1.0.1 =
* Added new testing tools and fixed UI bugs.