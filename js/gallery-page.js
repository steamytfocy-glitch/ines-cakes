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

var currentLang = 'en';
var _products = [];
var _defaultSizes = [];
var _filter = 'all';
var refPick = false;
try { refPick = localStorage.getItem('ines-ref-pick') === '1'; } catch (e) {}

var ZOOM_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

function escapeHtml(str) { if (!str) return ''; var d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function getCatName(cat) { return (cat && (cat.en || cat.id)) || ''; }
function locName(o) { return (o && o.name) || ''; }

function priceLabel(p) {
    if (p.price && parseFloat(p.price)) return '€' + p.price;
    var sizes = (p.sizes && p.sizes.length) ? p.sizes : _defaultSizes;
    var nums = sizes.map(function(s) { return parseFloat(s.price); }).filter(function(n) { return !isNaN(n); });
    if (!nums.length) return 'Price on request';
    return 'from €' + Math.min.apply(null, nums);
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
    bar.innerHTML = '<span>📷 Tap a cake to use it as a reference for your custom order</span>' +
        '<button type="button" id="galRefCancel">Cancel</button>';
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
        '" data-filter="all">All<span class="gallery-chip__count">' + data.all.length + '</span></button>';
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
            showRefBanner();
        });
    });
}

init();
