var CATEGORIES = [
    { id: 'flowers', en: 'Flowers' },
    { id: 'kids', en: 'For Kids' },
    { id: 'birthday', en: 'Birthday' },
    { id: 'sport', en: 'Sport' },
    { id: 'bento', en: 'Bento Cakes' },
    { id: 'gaming', en: 'Gaming' },
    { id: 'berries', en: 'Natural Berries' },
    { id: 'other', en: 'Other' }
];

var currentLang = (function(l){ return (l === 'ga' || l === 'ua' || l === 'ru') ? l : 'en'; })(localStorage.getItem('ines-lang'));
var _products = [];
var _defaultSizes = [];
var _filter = 'all';
var refPick = false;
try { refPick = localStorage.getItem('ines-ref-pick') === '1'; } catch (e) {}

var translations = {
    ga: {
        "galpage.back": "Ar ais Abhaile",
        "gal.title": "Ár gCácaí",
        "gal.subtitle": "Brabhsáil ár gcácaí - scag de réir catagóire",
        "gal.empty": "Tá ár gcácaí ag teacht go luath - seiceáil ar ais go gairid!",
        "gal.all": "Uile",
        "gal.from": "ó",
        "gal.priceReq": "Praghas ar iarratas",
        "gal.refBanner": "📷 Tapáil cáca chun é a úsáid mar thagairt do d'ordú saincheaptha",
        "gal.refCancel": "Cealaigh"
    },
    en: {
        "galpage.back": "Back to Home",
        "gal.title": "Our Cakes",
        "gal.subtitle": "Browse our cakes - filter by category",
        "gal.empty": "Our cakes are coming soon - check back shortly!",
        "gal.all": "All",
        "gal.from": "from",
        "gal.priceReq": "Price on request",
        "gal.refBanner": "📷 Tap a cake to use it as a reference for your custom order",
        "gal.refCancel": "Cancel"
    },
    ua: {
        "galpage.back": "На головну",
        "gal.title": "Наші торти",
        "gal.subtitle": "Перегляньте наші торти - фільтр за категоріями",
        "gal.empty": "Наші торти скоро з'являться - завітайте пізніше!",
        "gal.all": "Усі",
        "gal.from": "від",
        "gal.priceReq": "Ціна за домовленістю",
        "gal.refBanner": "📷 Натисніть на торт, щоб взяти його як референс для індивідуального замовлення",
        "gal.refCancel": "Скасувати"
    },
    ru: {
        "galpage.back": "На главную",
        "gal.title": "Наши торты",
        "gal.subtitle": "Просмотрите наши торты - фильтр по категориям",
        "gal.empty": "Наши торты скоро появятся - загляните позже!",
        "gal.all": "Все",
        "gal.from": "от",
        "gal.priceReq": "Цена по договорённости",
        "gal.refBanner": "📷 Нажмите на торт, чтобы взять его как референс для индивидуального заказа",
        "gal.refCancel": "Отмена"
    }
};
function t(k) { var tr = translations[currentLang] || translations.en; return tr[k] || translations.en[k] || k; }
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var v = t(el.getAttribute('data-i18n')); if (v) el.innerHTML = v;
    });
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === currentLang); });
}
function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    applyI18n();
    render();
}
document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

var ZOOM_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

function escapeHtml(str) { if (!str) return ''; var d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function getCatName(cat) { return (cat && (cat.en || cat.id)) || ''; }
function locName(o) { return (o && o.name) || ''; }

function priceLabel(p) {
    if (p.price && parseFloat(p.price)) return '€' + p.price;
    var sizes = (p.sizes && p.sizes.length) ? p.sizes : _defaultSizes;
    var nums = sizes.map(function(s) { return parseFloat(s.price); }).filter(function(n) { return !isNaN(n); });
    if (!nums.length) return t('gal.priceReq');
    return t('gal.from') + ' €' + Math.min.apply(null, nums);
}

function selectAsRef(p) {
    var ref = { name: p.name || '', photo: p.photo || '', size: '', flavour: '', date: '' };
    try {
        localStorage.setItem('ines-ref-cake', JSON.stringify(ref));
        localStorage.removeItem('ines-ref-pick');
    } catch (e) {}
    window.location.href = '/';
}

function showRefBanner() {
    if (!refPick) return;
    if (document.getElementById('galRefBanner')) return;
    var bar = document.createElement('div');
    bar.id = 'galRefBanner';
    bar.className = 'gal-ref-banner';
    bar.innerHTML = '<span>' + t('gal.refBanner') + '</span>' +
        '<button type="button" id="galRefCancel">' + t('gal.refCancel') + '</button>';
    var anchor = document.getElementById('galleryFilters');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor);
    else document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('galRefCancel').addEventListener('click', function() {
        try { localStorage.removeItem('ines-ref-pick'); } catch (e) {}
        window.location.href = '/#order';
    });
}

// All cakes as {p, index}, plus the list of categories that actually have cakes.
function buildData() {
    var all = [];
    var byCat = {};
    _products.forEach(function(p, idx) {
        if (!p) return;
        var c = p.category || 'other';
        all.push({ p: p, index: idx });
        (byCat[c] = byCat[c] || []).push({ p: p, index: idx });
    });
    var cats = CATEGORIES.slice().sort(function(a, b) { return getCatName(a).localeCompare(getCatName(b)); });
    var activeCats = cats.filter(function(c) { return byCat[c.id] && byCat[c.id].length; });
    return { all: all, byCat: byCat, activeCats: activeCats };
}

function renderFilters(data) {
    var wrap = document.getElementById('galleryFilters');
    var html = '<button class="gallery-chip' + (_filter === 'all' ? ' gallery-chip--active' : '') +
        '" data-filter="all">' + t('gal.all') + '<span class="gallery-chip__count">' + data.all.length + '</span></button>';
    data.activeCats.forEach(function(c) {
        html += '<button class="gallery-chip' + (_filter === c.id ? ' gallery-chip--active' : '') +
            '" data-filter="' + c.id + '">' + escapeHtml(getCatName(c)) +
            '<span class="gallery-chip__count">' + data.byCat[c.id].length + '</span></button>';
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll('.gallery-chip').forEach(function(btn) {
        btn.addEventListener('click', function() {
            _filter = this.dataset.filter;
            render();
            document.getElementById('galleryGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function renderGrid(data) {
    var grid = document.getElementById('galleryGrid');
    var empty = document.getElementById('galleryEmpty');
    var items = (_filter === 'all') ? data.all : (data.byCat[_filter] || []);

    if (!data.all.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    var lbImgs = [];
    var html = '';
    items.forEach(function(it) {
        var p = it.p;
        var zoomBtn = '';
        var img;
        if (p.photo) {
            var zi = lbImgs.length;
            lbImgs.push({ src: p.photo, label: locName(p) });
            img = '<img loading="lazy" decoding="async" src="' + p.photo + '" alt="' + escapeHtml(locName(p)) + '">';
            zoomBtn = '<button type="button" class="catalog-card__zoom" data-zoom="' + zi + '" aria-label="Zoom">' + ZOOM_SVG + '</button>';
        } else {
            img = '<div class="catalog-card__noimg"></div>';
        }
        html += '<a class="catalog-card" href="product?i=' + it.index + '" data-index="' + it.index + '">' +
            '<div class="catalog-card__img">' + img + zoomBtn + '</div>' +
            '<div class="catalog-card__body">' +
                '<div class="catalog-card__name">' + escapeHtml(locName(p)) + '</div>' +
                '<div class="catalog-card__price">' + priceLabel(p) + '</div>' +
            '</div>' +
        '</a>';
    });
    grid.innerHTML = html;

    // Zoom buttons open the lightbox without navigating to the product page.
    grid.querySelectorAll('.catalog-card__zoom').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof openImageLightbox === 'function') openImageLightbox(lbImgs, parseInt(this.dataset.zoom));
        });
    });

    // In "pick a reference" mode, a card selects the cake instead of opening it.
    if (refPick) {
        grid.querySelectorAll('.catalog-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                var idx = parseInt(this.dataset.index);
                if (_products[idx]) selectAsRef(_products[idx]);
            });
        });
    }
}

function render() {
    var data = buildData();
    // If the requested category has no cakes, show everything instead.
    if (_filter !== 'all' && !(data.byCat[_filter] && data.byCat[_filter].length)) _filter = 'all';
    renderFilters(data);
    renderGrid(data);
}

function init() {
    fbGet('categories', function(cats) {
        if (cats && cats.length) CATEGORIES = cats;
        fbGet('default-sizes', function(ds) { _defaultSizes = (ds && ds.length) ? ds : []; });
        fbGet('products', function(products) {
            _products = products || [];
            var cat = new URLSearchParams(window.location.search).get('cat');
            if (cat) _filter = cat;
            render();
            applyI18n();
            showRefBanner();
        });
    });
}

init();
