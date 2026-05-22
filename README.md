# Frank Website Responsive Checker

[![WordPress Plugin](https://img.shields.io/badge/WordPress-Plugin-blue.svg)](https://wordpress.org/plugins/frank-responsive-checker/)
[![License: GPL v2+](https://img.shields.io/badge/License-GPL%20v2%2B-lightgrey.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
[![WordPress Version](https://img.shields.io/badge/WordPress-%3E%3D%205.0-blue.svg)]()
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D%207.4-8892bf.svg)]()

**Frank Responsive Checker** is a professional, developer-first responsive testing and design audit suite built for WordPress. It enables you to instantly preview, test, and debug your website across 50+ virtual viewports, perform accessibility audits, simulate network conditions, and collaborate with clients via secure, shareable preview links—all directly from your WordPress admin dashboard or public front-end.

---

![Frank Responsive Checker Banner](plugin-banner.png)

---

## 🚀 Key Features

### 📱 50+ Virtual Devices & Viewports
- Test your site against a curated library of modern smartphones, tablets, laptops, and desktops.
- Quick viewport toggles and custom resolution inputs.
- Landscape and portrait orientation switching.

### 🔄 Synchronized Scrolling & Compare Mode
- Open multiple viewports side-by-side.
- Scroll events are automatically synchronized across all open device viewports for seamless layout comparison.

### 🕵️ Element CSS Inspector
- Hover and inspect DOM elements directly within the active responsive preview.
- View margins, paddings, dimensions, CSS rules, and computed styles in real time.

### ♿ Accessibility (A11y) Audits
- **WCAG Contrast Checker**: Analyzes text and background elements to report compliance scores.
- **Alt Text Check**: Flags images missing alt attributes.
- **Focus Order Map**: Visualizes the keyboard tab-index path of the page.
- **Screen Reader Simulator**: Text-to-speech visualizer showing exactly how screen readers navigate your content.

### 🌐 Client Collaboration (Shareable Preview Links)
- Generate temporary, time-expiring preview links (e.g., valid for 24 hours, 7 days).
- Share links with clients or QA teams so they can view interactive previews without needing a WordPress login.

### 📈 Diagnostics & Performance Audit
- View **Web Vitals** (LCP, FCP, TTFB) timings.
- Analyze resource loading with the detailed request waterfall chart.
- Identify oversized, unoptimized images.

### 📄 Exporters & Mockup Generator
- Capture full-page or viewport screenshots.
- Compile and export responsive previews into structured PDF reports.
- Generate stylized laptop, tablet, and mobile device mockup frames.

---

## 🛠️ Installation

### Option 1: From WordPress.org (Recommended)
1. Navigate to **Plugins > Add New** in your WordPress dashboard.
2. Search for `Frank Responsive Checker`.
3. Click **Install Now**, then **Activate**.

### Option 2: Manual Installation via Git
1. Clone the repository into your WordPress plugins directory:
   ```bash
   cd /path-to-your-wordpress/wp-content/plugins/
   git clone https://github.com/FARAZFRANK/frank-responsive-checker.git frank-responsive-checker
   ```
2. Go to **Plugins** in your WordPress dashboard.
3. Find **Frank Responsive Checker** and click **Activate**.

---

## 📖 How to Use

1. **Launch the Previewer**:
   - Locate the **Responsive Checker** button on the WordPress top admin bar (visible on both backend and frontend).
   - Alternatively, use the global keyboard shortcut: `Ctrl + Shift + D`.
2. **Settings & Access**:
   - Go to **Settings > Responsive Checker** in your WordPress backend.
   - Configure general defaults, toggle active modules, and restrict features to specific user roles (e.g., Administrator, Editor, Author).
3. **Docs & Submenus**:
   - Access **Responsive Checker > How it Works**, **Our Plugins**, and **Our Themes** submenus to learn more about our tools and other products.

---

## 🔒 Security & Performance
- Built with standard WordPress security best practices, using nonces for all AJAX interactions.
- Access controls ensure settings and debugging suites are only visible to authorized roles.
- Employs lightweight client-side components to ensure zero impact on your front-end page load times.

---

## 📝 License
This project is licensed under the GPLv2 or later License. See the [GNU General Public License](https://www.gnu.org/licenses/gpl-2.0.html) details.
