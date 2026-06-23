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

var currentLang = localStorage.getItem('ines-lang') || 'en';

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

function loadAllFlavours() {
    fbGet('flavours', function(flavours) {
        if (!flavours) flavours = [];
        var grid = document.getElementById('allFlavoursGrid');
        if (flavours.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:#6B5B4E;grid-column:1/-1;padding:40px;">No flavours yet.</p>';
            return;
        }
        var requestText = (translations[currentLang] && translations[currentLang]['priceRequest']) || 'Price on request';
        var html = '';
        for (var i = 0; i < flavours.length; i++) {
            var f = flavours[i];
            var imgHtml = f.photo
                ? '<img src="' + f.photo + '" class="flavour-card__img" alt="' + escapeHtml(f.name) + '">'
                : '<div class="flavour-card__placeholder"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
            var priceText = f.price ? '+ €' + escapeHtml(f.price) : '';
            html += '<div class="flavour-card">' +
                '<div class="flavour-card__imgwrap">' + imgHtml +
                    '<div class="flavour-card__caption">' +
                        '<div class="flavour-card__name">' + escapeHtml(f.name) + '</div>' +
                        '<div class="flavour-card__price">' + priceText + '</div>' +
                    '</div>' +
                '</div>' +
                (f.desc ? '<div class="flavour-card__desc">' + escapeHtml(f.desc) + '</div>' : '') +
            '</div>';
        }
        grid.innerHTML = html;
    });
}

setLang(currentLang);
loadAllFlavours();
