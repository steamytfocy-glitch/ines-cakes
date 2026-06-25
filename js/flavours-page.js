var translations = {
    en: {
        "flpage.back": "Back to Home",
        "flpage.title": "All Flavours",
        "flpage.subtitle": "A look inside every cake we make",
        "priceRequest": "Price on request"
    },
    ua: {
        "flpage.back": "На головну",
        "flpage.title": "Усі смаки",
        "flpage.subtitle": "Загляньте всередину кожного нашого торта",
        "priceRequest": "Ціна за домовленістю"
    },
    ru: {
        "flpage.back": "На главную",
        "flpage.title": "Все вкусы",
        "flpage.subtitle": "Загляните внутрь каждого нашего торта",
        "priceRequest": "Цена по договорённости"
    }
};

var currentLang = 'en';

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
    loadAllFlavours();
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
function locName(o) {
    if (!o) return '';
    if (currentLang === 'ua' && o.name_ua) return o.name_ua;
    if (currentLang === 'ru' && o.name_ru) return o.name_ru;
    return o.name || '';
}
function locDesc(o) {
    if (!o) return '';
    if (currentLang === 'ua' && o.desc_ua) return o.desc_ua;
    if (currentLang === 'ru' && o.desc_ru) return o.desc_ru;
    return o.desc || '';
}

function loadAllFlavours() {
    fbGet('flavours', function(flavours) {
        if (!flavours) flavours = [];
        var grid = document.getElementById('allFlavoursGrid');
        if (flavours.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:#6B5B4E;grid-column:1/-1;padding:40px;">No flavours yet.</p>';
            return;
        }
        var requestText = (translations[currentLang] && translations[currentLang]['priceRequest']) || 'Price on request';
        var ZOOM_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
        var lbImgs = [];
        flavours.forEach(function(f) { if (f.photo) lbImgs.push({ src: f.photo, label: locName(f) }); });
        var html = '';
        var zi = 0;
        for (var i = 0; i < flavours.length; i++) {
            var f = flavours[i];
            var imgHtml, zoomBtn = '';
            if (f.photo) {
                imgHtml = '<img loading="lazy" decoding="async" src="' + f.photo + '" class="flavour-card__img" alt="' + escapeHtml(locName(f)) + '" style="cursor:zoom-in;" data-zoom="' + zi + '">';
                zoomBtn = '<button type="button" class="flavour-card__zoom" data-zoom="' + zi + '" aria-label="Zoom">' + ZOOM_SVG + '</button>';
                zi++;
            } else {
                imgHtml = '<div class="flavour-card__placeholder"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
            }
            var priceText = f.price ? '+ €' + escapeHtml(f.price) : '';
            var gfBadge = f.glutenFree ? '<span class="flavour-card__gf">GF</span>' : '';
            html += '<div class="flavour-card">' +
                '<div class="flavour-card__imgwrap">' + imgHtml + zoomBtn + gfBadge +
                    '<div class="flavour-card__caption">' +
                        '<div class="flavour-card__name">' + escapeHtml(locName(f)) + '</div>' +
                        '<div class="flavour-card__price">' + priceText + '</div>' +
                    '</div>' +
                '</div>' +
                (locDesc(f) ? '<div class="flavour-card__desc">' + escapeHtml(locDesc(f)) + '</div>' : '') +
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
loadAllFlavours();
