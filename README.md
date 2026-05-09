# hexo-epub-reader
A Hexo tag plugin for inline EPUB cards with browser-based reading and download fallback.

## Features

- `{% epub %}` tag for per-volume cards (cover, title, release date, volume badge)
- Browser-based EPUB reading via epub.js + JSZip
- Auto path resolution for `post_asset_folder` + `abbrlink`
- Chinese filename support, image blob fallback, Sony `res://` font override
- Graceful download fallback when online rendering fails
- Responsive grid layout

## Install

Copy `epub.js` to your Hexo theme's `scripts/tags/` directory.

For example, with the **NexT** theme: `themes/next/scripts/tags/epub.js`

Or place it at the blog root: `scripts/tags/epub.js`

Both locations work; placing it under the theme keeps the plugin bundled with your theme configuration.

## Usage

```markdown
<div class="epub-grid">

{% epub path="toradora-01.epub" title="とらドラ！" cover="toradora-01.webp" volume="1" date="2006.03.10" %}
```

</div>
