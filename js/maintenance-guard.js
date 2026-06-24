// Standalone maintenance guard for sub-pages (cart, product, gallery, my orders, order, thank you).
// The main page (index.html) handles this inside main.js - do NOT load this there too.
(function () {
    var MG_TEXT = {
        en: { title: "We'll be right back", text: "Our website is temporarily closed for orders. Please check back soon!" },
        ua: { title: "Скоро повернемося", text: "Наш сайт тимчасово закритий для замовлень. Завітайте трохи пізніше!" },
        ru: { title: "Скоро вернёмся", text: "Наш сайт временно закрыт для заказов. Загляните чуть позже!" }
    };

    function mgLang() { return localStorage.getItem('ines-lang') || 'en'; }
    var mgCustom = '';
    var mgInsta = '';
    var mgFacebook = '';

    function mgRender() {
        var t = MG_TEXT[mgLang()] || MG_TEXT.en;
        var title = t.title;
        var text = (mgCustom && mgCustom.trim()) ? mgCustom : t.text;

        var el = document.getElementById('maintenanceOverlay');
        if (el) {
            el.querySelector('.maintenance__title').textContent = title;
            el.querySelector('.maintenance__text').textContent = text;
            el.querySelectorAll('.lang-btn').forEach(function (b) {
                b.classList.toggle('active', b.dataset.lang === mgLang());
            });
            return;
        }

        el = document.createElement('div');
        el.id = 'maintenanceOverlay';
        el.className = 'maintenance';
        el.innerHTML =
            '<div class="maintenance__lang">' +
                '<button class="lang-btn" data-lang="en">EN</button>' +
                '<button class="lang-btn" data-lang="ua">UA</button>' +
                '<button class="lang-btn" data-lang="ru">RU</button>' +
            '</div>' +
            '<div class="maintenance__card">' +
                '<svg class="maintenance__logo" viewBox="0 0 60 60" width="64" height="64">' +
                    '<path d="M30 8c-3 0-5.5 2-6 5h12c-.5-3-3-5-6-5z" fill="#C8963E"/>' +
                    '<rect x="20" y="13" width="20" height="3" rx="1.5" fill="#C8963E"/>' +
                    '<path d="M18 16c0 0-2 4-2 10s2 12 4 14h20c2-2 4-8 4-14s-2-10-2-10H18z" fill="#C8963E" opacity="0.85"/>' +
                    '<path d="M22 40h16v4c0 2-3 4-8 4s-8-2-8-4v-4z" fill="#C8963E"/>' +
                '</svg>' +
                '<div class="maintenance__brand">I.N.E.S.</div>' +
                '<h1 class="maintenance__title"></h1>' +
                '<p class="maintenance__text"></p>' +
                '<div class="maintenance__socials">' +
                    '<a href="https://wa.me/353874917435" target="_blank" class="maintenance__social" aria-label="WhatsApp">' +
                        '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.6 6.3A7.85 7.85 0 0012 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1A7.94 7.94 0 0012 19.9a7.94 7.94 0 005.6-13.6zM12 18.5a6.6 6.6 0 01-3.4-.9l-.24-.15-2.5.65.67-2.43-.16-.25A6.59 6.59 0 1118.6 12 6.6 6.6 0 0112 18.5zm3.6-4.95c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.51.64-.62.77-.23.15-.43.05a5.4 5.4 0 01-1.59-.98 6 6 0 01-1.1-1.37c-.11-.2 0-.3.09-.4l.3-.35a1.35 1.35 0 00.2-.33.37.37 0 000-.35c0-.1-.44-1.06-.6-1.45s-.32-.33-.44-.34h-.38a.72.72 0 00-.52.24 2.18 2.18 0 00-.68 1.62 3.79 3.79 0 00.79 2 8.66 8.66 0 003.32 2.93c.46.2.83.32 1.11.41a2.69 2.69 0 001.23.08 2 2 0 001.32-.93 1.65 1.65 0 00.11-.93c-.05-.08-.18-.13-.38-.23z"/></svg>' +
                    '</a>' +
                    '<a href="#" id="mgInsta" class="maintenance__social" target="_blank" aria-label="Instagram" style="display:none;">' +
                        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>' +
                    '</a>' +
                    '<a href="#" id="mgFacebook" class="maintenance__social" target="_blank" aria-label="Facebook" style="display:none;">' +
                        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>' +
                    '</a>' +
                '</div>' +
            '</div>';
        document.body.appendChild(el);
        document.body.style.overflow = 'hidden';

        el.querySelectorAll('.lang-btn').forEach(function (b) {
            b.addEventListener('click', function () {
                localStorage.setItem('ines-lang', this.dataset.lang);
                mgRender();
            });
        });

        mgApplySocials();
        mgRender();
    }

    function mgApplySocials() {
        var ig = document.getElementById('mgInsta');
        var fb = document.getElementById('mgFacebook');
        if (ig) { if (mgInsta) { ig.href = mgInsta; ig.style.display = ''; } else { ig.style.display = 'none'; } }
        if (fb) { if (mgFacebook) { fb.href = mgFacebook; fb.style.display = ''; } else { fb.style.display = 'none'; } }
    }

    function mgHide() {
        var el = document.getElementById('maintenanceOverlay');
        if (el) el.remove();
        document.body.style.overflow = '';
    }

    function mgCheck() {
        if (typeof fbGet !== 'function') return;
        fbGet('content', function (content) {
            mgInsta = (content && content.contactInsta) || '';
            mgFacebook = (content && content.contactFacebook) || '';
            mgApplySocials();
        });
        fbGet('site-status', function (s) {
            var enabled = !s || s.enabled !== false; // default: site is ON
            mgCustom = (s && s.message) || '';
            if (enabled) mgHide();
            else mgRender();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mgCheck);
    } else {
        mgCheck();
    }
})();
