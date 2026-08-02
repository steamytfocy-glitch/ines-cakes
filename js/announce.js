// Public announcement bar + optional "ordering paused" mode.
// Reads the shared live site-status node and shows a bar at the very top on
// every customer page. When "pause" is on, order actions are hidden via the
// body.ines-orders-paused class (see style.css). Loaded after firebase-init.js.
(function () {
    function ensureStyles() {
        if (document.getElementById('ines-announce-styles')) return;
        var st = document.createElement('style');
        st.id = 'ines-announce-styles';
        st.textContent =
            '.site-announce{position:fixed;top:0;left:0;right:0;z-index:1200;background:#C8963E;color:#3D2E1C;' +
            'text-align:center;padding:10px 16px;font:600 14px/1.45 "Montserrat",sans-serif;box-shadow:0 2px 8px rgba(61,46,28,.18);}' +
            'body.ines-orders-paused #order,body.ines-orders-paused .hero__buttons .btn--outline,' +
            'body.ines-orders-paused #pAddBtn,body.ines-orders-paused #pRefBtn,' +
            'body.ines-orders-paused #checkoutForm{display:none !important;}';
        document.head.appendChild(st);
    }
    function apply(s) {
        ensureStyles();
        s = s || {};
        var text = (s.enabled !== false && s.announce && s.announceText) ? String(s.announceText).trim() : '';
        var bar = document.getElementById('siteAnnounce');
        var header = document.getElementById('header');
        if (text) {
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'siteAnnounce';
                bar.className = 'site-announce';
                document.body.insertBefore(bar, document.body.firstChild);
            }
            bar.textContent = '📣  ' + text;
            bar.style.display = '';
            var h = bar.offsetHeight || 44;
            if (header) header.style.top = h + 'px';
            document.body.style.paddingTop = h + 'px';
        } else {
            if (bar) bar.style.display = 'none';
            if (header) header.style.top = '';
            document.body.style.paddingTop = '';
        }
        document.body.classList.toggle('ines-orders-paused', !!(text && s.announcePause));
    }
    function check() {
        if (typeof fbGet !== 'function') return;
        fbGet('site-status', function (s) { if (document.body) apply(s); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
    else check();
})();
