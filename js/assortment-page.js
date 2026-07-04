var translations = {
    ga: {
        "aspage.back": "Ar ais Abhaile",
        "aspage.title": "Ár Rogha",
        "aspage.subtitle": "Milseoga úra atá ar fáil sa Bhothán Cácaí",
        "aspage.empty": "Níl aon rud sa rogha faoi láthair - seiceáil ar ais go luath!"
    },
    en: {
        "aspage.back": "Back to Home",
        "aspage.title": "Our Assortment",
        "aspage.subtitle": "Fresh treats available at the Cake Shed",
        "aspage.empty": "Nothing in the assortment right now - check back soon!"
    },
    ua: {
        "aspage.back": "На головну",
        "aspage.title": "Наш асортимент",
        "aspage.subtitle": "Свіжі десерти, доступні в Cake Shed",
        "aspage.empty": "Поки що асортимент порожній - завітайте пізніше!"
    },
    ru: {
        "aspage.back": "На главную",
        "aspage.title": "Наш ассортимент",
        "aspage.subtitle": "Свежие десерты, доступные в Cake Shed",
        "aspage.empty": "Пока ассортимент пуст - загляните позже!"
    }
};

var currentLang = (function(l){ return (l === 'ga' || l === 'ua' || l === 'ru') ? l : 'en'; })(localStorage.getItem('ines-lang'));

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    var t = translations[lang];
    if (t) {
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            if (t[key]) el.innerHTML = t[key];
        });
    }
    loadAssortment();
}

document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

var ZOOM_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

function loadAssortment() {
    fbGetCached('shed-assortment', function(items) {
        items = (items || []).filter(function(it) { return it && it.photo; });
        var grid = document.getElementById('assortmentGrid');
        if (!grid) return;
        if (!items.length) {
            var empty = (translations[currentLang] && translations[currentLang]['aspage.empty']) || translations.en['aspage.empty'];
            grid.innerHTML = '<p style="text-align:center;color:#6B5B4E;grid-column:1/-1;padding:40px;">' + empty + '</p>';
            return;
        }
        var lbImgs = items.map(function(it) { return { src: it.photo, label: it.name || '' }; });
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            html += '<div class="flavour-card flavour-card--selectable">' +
                '<div class="flavour-card__imgwrap">' +
                    '<img loading="lazy" decoding="async" src="' + it.photo + '" class="flavour-card__img" alt="' + escapeHtml(it.name || '') + '" style="cursor:zoom-in;" data-zoom="' + i + '">' +
                    '<button type="button" class="flavour-card__zoom" data-zoom="' + i + '" aria-label="Zoom">' + ZOOM_SVG + '</button>' +
                    (it.name ? '<div class="flavour-card__caption"><div class="flavour-card__name">' + escapeHtml(it.name) + '</div></div>' : '') +
                '</div>' +
            '</div>';
        }
        grid.innerHTML = html;
        grid.querySelectorAll('[data-zoom]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof openImageLightbox === 'function') openImageLightbox(lbImgs, parseInt(this.dataset.zoom));
            });
        });
    });
}

setLang(currentLang);
loadAssortment();
