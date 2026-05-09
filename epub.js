'use strict';

/**
 * Hexo EPUB 轻小说单卷卡片标签
 * 用法：{% epub path="..." title="..." cover="..." volume="1" date="2014-01" %}
 */

function parseArgs(args) {
  const result = {};
  const str = args.join(' ');
  const regex = /(\w+)=["']([^"]+)["']|(\w+)=['"]([^']+)['"]|(\w+)=([^\s]+)/g;
  let m;
  while ((m = regex.exec(str)) !== null) {
    const key = m[1] || m[3] || m[5];
    const val = m[2] || m[4] || m[6];
    result[key] = val;
  }
  return result;
}

hexo.extend.tag.register('epub', function(args) {
  const p = parseArgs(args);
  const path = p.path || '';
  const title = p.title || '未命名';
  const cover = p.cover || '';
  const volume = p.volume || '';
  const date = p.date || '';

  if (!path) {
    return '<p style="color:#e74c3c;">[epub] 缺少 path 参数</p>';
  }

  const norm = (src) => src ? src.replace(/\\/g, '/') : '';
  const isAbs = (src) => src.startsWith('/') || src.startsWith('http');

  let basePath = '';
  if (this.path) {
    let postPath = norm(this.path);
    postPath = postPath.replace(/\.html$/, '');
    if (!postPath.endsWith('/')) postPath += '/';
    basePath = '/' + postPath;
  }

  const resolve = (src) => {
    const s = norm(src);
    if (isAbs(s)) return s;
    return basePath + s;
  };

  const pathUrl = resolve(path);
  const coverUrl = cover ? resolve(cover) : '';
  const id = 'epub-' + Math.random().toString(36).substr(2, 9);
  const badge = volume ? `<span class="epub-vol">Vol.${volume}</span>` : '';
  const dateLine = date ? `<p class="epub-date">📅 ${date}</p>` : '';

  return `
<div class="epub-card" data-epub-id="${id}" data-epub-path="${pathUrl}" data-epub-title="${title}">
  <div class="epub-cover">
    ${badge}
    ${coverUrl ? `<img src="${coverUrl}" alt="${title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
    <div class="epub-placeholder" style="${coverUrl ? 'display:none;' : ''}">${title.slice(0,1)}</div>
  </div>
  <div class="epub-body">
    <h4 class="epub-title">${title}</h4>
    ${dateLine}
    <div class="epub-actions">
      <button class="epub-btn read" onclick="HexoEpub.open('${id}')">📖 阅读</button>
      <a class="epub-btn download" href="${pathUrl}" download>⬇️ EPUB</a>
    </div>
  </div>
</div>
  `.trim();
}, { ends: false });

const css = `
<style>
.epub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; margin: 1.5em 0; }
.epub-card { display: flex; background: var(--content-bg-color, #fff); border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); border: 1px solid var(--border-color, #eee); transition: transform .2s, box-shadow .2s; }
.epub-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.epub-cover { width: 110px; min-width: 110px; height: 160px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2.2em; font-weight: bold; position: relative; overflow: hidden; }
.epub-cover img { width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; }
.epub-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
.epub-vol { position: absolute; top: 6px; left: 6px; background: #ff4757; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: .72em; font-weight: bold; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.25); }
.epub-body { padding: 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.epub-title { margin: 0 0 6px; font-size: 1.05em; line-height: 1.3; color: var(--text-color, #333); }
.epub-date { margin: 0 0 12px; font-size: .78em; color: var(--text-color, #999); opacity: .85; }
.epub-actions { display: flex; gap: 8px; }
.epub-btn { flex: 1; padding: 6px 10px; border-radius: 6px; font-size: .82em; text-decoration: none; border: none; cursor: pointer; text-align: center; transition: opacity .2s; }
.epub-btn:hover { opacity: .85; }
.epub-btn.read { background: #5B8FF9; color: #fff; }
.epub-btn.download { background: var(--tag-background, #f0f0f0); color: var(--text-color, #555); }

#hexo-epub-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 99999; flex-direction: column; }
#hexo-epub-modal.active { display: flex; }
.hexo-epub-bar { height: 50px; background: #1a1a1a; color: #fff; display: flex; align-items: center; padding: 0 18px; gap: 10px; border-bottom: 1px solid #333; }
.hexo-epub-bar button { background: #333; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
.hexo-epub-bar button:hover { background: #444; }
.hexo-epub-bar .bar-title { margin-left: auto; font-size: .9em; opacity: .9; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hexo-epub-view { flex: 1; position: relative; background: #fff; }
#hexo-epub-stage { width: 100%; height: 100%; }
.hexo-epub-loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666; display: none; z-index: 10; text-align: center; }
.hexo-epub-loading .err { color: #ff4757; font-size: .85em; margin-top: 6px; }
.hexo-epub-fallback { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 10; display: none; }
.hexo-epub-fallback p { margin: 0 0 12px; color: var(--text-color, #555); }
.hexo-epub-fallback .epub-btn { display: inline-block; width: auto; padding: 10px 28px; font-size: .9em; }
@media (max-width: 600px) { .epub-grid { grid-template-columns: 1fr; } .epub-cover { width: 90px; min-width: 90px; height: 135px; } }
</style>
`;

const html = `
<div id="hexo-epub-modal">
  <div class="hexo-epub-bar">
    <button onclick="HexoEpub.close()">✕</button>
    <button onclick="HexoEpub.prev()">←</button>
    <button onclick="HexoEpub.next()">→</button>
    <span class="bar-title" id="hexo-epub-tit">Reader</span>
  </div>
  <div class="hexo-epub-view">
    <div class="hexo-epub-loading" id="hexo-epub-load">
      正在加载书籍...
      <div class="err" id="hexo-epub-err"></div>
    </div>
    <div class="hexo-epub-fallback" id="hexo-epub-fallback">
      <p style="color:#ff4757;font-size:1.1em;margin-bottom:8px">该文件不支持浏览器在线阅读</p>
      <p style="font-size:.85em;color:#666;margin-bottom:20px">可能是文件格式特殊，请下载到本地使用阅读器打开</p>
      <a class="epub-btn read" id="hexo-epub-fallback-link" href="#" download>⬇️ 下载 EPUB</a>
    </div>
    <div id="hexo-epub-stage"></div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"></script>
<script>
window.HexoEpub = {
  r: null,
  open: async function(id) {
    const c = document.querySelector('[data-epub-id="' + id + '"]');
    if (!c) { console.error('[HexoEpub] 找不到卡片:', id); return; }
    const path = c.dataset.epubPath;
    const title = c.dataset.epubTitle;
    const loadEl = document.getElementById('hexo-epub-load');
    const errEl = document.getElementById('hexo-epub-err');
    const fallback = document.getElementById('hexo-epub-fallback');
    const fallbackLink = document.getElementById('hexo-epub-fallback-link');
    const stage = document.getElementById('hexo-epub-stage');

    errEl.textContent = '';
    loadEl.style.display = 'block';
    fallback.style.display = 'none';
    stage.innerHTML = '';
    document.getElementById('hexo-epub-tit').textContent = title;
    document.getElementById('hexo-epub-modal').classList.add('active');

    if (typeof JSZip === 'undefined') {
      errEl.textContent = 'JSZip 库未加载';
      return;
    }
    if (typeof ePub === 'undefined') {
      errEl.textContent = '阅读器库未加载';
      return;
    }

    if (this.r) { try { this.r.destroy(); } catch(e) {} }

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const arrayBuffer = await response.arrayBuffer();
      this.r = ePub(arrayBuffer);
    } catch (e) {
      errEl.textContent = '加载失败: ' + e.message;
      loadEl.style.display = 'none';
      fallbackLink.href = path;
      fallback.style.display = 'block';
      return;
    }

    const timeout = setTimeout(() => {
      if (loadEl.style.display !== 'none') {
        loadEl.style.display = 'none';
        fallbackLink.href = path;
        fallback.style.display = 'block';
      }
    }, 8000);

    this.r.on('openFailed', function(error) {
      clearTimeout(timeout);
      loadEl.style.display = 'none';
      fallbackLink.href = path;
      fallback.style.display = 'block';
    });

    try {
      const book = this.r;
      const rendition = book.renderTo('hexo-epub-stage', {
        width: '100%',
        height: '100%',
        flow: 'paginated'
      });

      rendition.hooks.content.register(function(contents) {
        const doc = contents.document;

        // ==================== 1. 彻底清理 res:// 字体错误 ====================
        // 注入系统字体覆盖所有内嵌字体
        const fontStyle = doc.createElement('style');
        fontStyle.textContent = '* { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; } @font-face { font-display: swap; src: local("Arial"); }';
        doc.head.insertBefore(fontStyle, doc.head.firstChild);

        // 移除所有引用 res:// 的外部样式表
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
          if (link.href && link.href.includes('res://')) {
            link.remove();
          }
        });

        // 清理所有 style 标签内的 res:// 和 @font-face
        doc.querySelectorAll('style').forEach(function(style) {
          if (!style.textContent) return;
          let css = style.textContent;
          if (css.includes('res://') || css.includes('@font-face')) {
            // 移除所有 @font-face 块
            css = css.replace(/@font-face\\s*\\{[^{}]*\\}/gi, '');
            // 替换 res:// url
            css = css.replace(/url\\(['"]?res:\\/\\/[^'")]+['"]?\\)/gi, 'none');
            style.textContent = css;
          }
        });

        // 清理行内 style 中的 res://
        doc.querySelectorAll('[style*="res://"]').forEach(function(el) {
          let s = el.getAttribute('style');
          s = s.replace(/url\\(['"]?res:\\/\\/[^'")]+['"]?\\)/gi, 'none');
          el.setAttribute('style', s);
        });

        // ==================== 2. 修复图片为 Blob URL ====================
        const zip = book.archive && (book.archive.zip || book.archive);
        if (!zip || !zip.file) return;

        doc.querySelectorAll('img').forEach(function(img) {
          let src = img.getAttribute('src');
          if (!src) return;
          if (src.startsWith('blob:') || src.startsWith('http') || src.startsWith('data:')) return;

          src = src.replace(/\\\\/g, '/').replace(/^\\/+/, '');
          const tryPaths = [src, 'OEBPS/' + src, 'OPS/' + src, 'item/' + src];

          for (let i = 0; i < tryPaths.length; i++) {
            const file = zip.file(tryPaths[i]);
            if (file) {
              file.async('blob').then(function(blob) {
                img.src = URL.createObjectURL(blob);
              });
              return;
            }
          }
        });
      });

      await rendition.display();
      clearTimeout(timeout);
      loadEl.style.display = 'none';
    } catch (err) {
      clearTimeout(timeout);
      loadEl.style.display = 'none';
      fallbackLink.href = path;
      fallback.style.display = 'block';
    }
  },
  close: function() {
    if (this.r) { try { this.r.destroy(); } catch(e) {} this.r = null; }
    document.getElementById('hexo-epub-modal').classList.remove('active');
    document.getElementById('hexo-epub-load').style.display = 'none';
    document.getElementById('hexo-epub-load').innerHTML = '正在加载书籍...<div class="err" id="hexo-epub-err"></div>';
    document.getElementById('hexo-epub-fallback').style.display = 'none';
    document.getElementById('hexo-epub-stage').innerHTML = '';
  },
  prev: function() { if (this.r && this.r.rendition) this.r.rendition.prev(); },
  next: function() { if (this.r && this.r.rendition) this.r.rendition.next(); }
};

document.addEventListener('keydown', function(e) {
  const m = document.getElementById('hexo-epub-modal');
  if (!m.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') HexoEpub.prev();
  if (e.key === 'ArrowRight') HexoEpub.next();
  if (e.key === 'Escape') HexoEpub.close();
});
</script>
`;

try {
  hexo.extend.injector.register('head_end', css, 'default');
  hexo.extend.injector.register('body_end', html, 'default');
} catch (e) {
  console.log('[hexo-epub-tag] 自动注入失败');
}