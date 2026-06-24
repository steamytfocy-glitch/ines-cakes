var CATEGORIES = [
    { id: 'flowers', en: 'Flowers', ua: 'Квіти', ru: 'Цветы' },
    { id: 'kids', en: 'For Kids', ua: 'Дитячі', ru: 'Детские' },
    { id: 'birthday', en: 'Birthday', ua: 'На день народження', ru: 'На день рождения' },
    { id: 'sport', en: 'Sport', ua: 'Спортивні', ru: 'Спортивные' },
    { id: 'bento', en: 'Bento Cakes', ua: 'Бенто торти', ru: 'Бенто торты' },
    { id: 'gaming', en: 'Gaming', ua: 'Ігрові', ru: 'Игровые' },
    { id: 'berries', en: 'Natural Berries', ua: 'Натуральні ягоди', ru: 'Натуральные ягоды' },
    { id: 'other', en: 'Other', ua: 'Інше', ru: 'Другое' }
];

var translations = {
    en: {
        "galpage.back": "Back to Home",
        "galpage.title": "All Cakes",
        "galpage.subtitle": "Browse our cakes by category",
        "gallery.back": "Back to categories",
        "gal.from": "from",
        "gal.priceReq": "Price on request",
        "gal.empty": "Our cakes are coming soon - check back shortly!",
        "gal.refBanner": "📷 Tap a cake to use it as a reference for your custom order",
        "gal.refCancel": "Cancel"
    },
    ua: {
        "galpage.back": "На головну",
        "galpage.title": "Усі торти",
        "galpage.subtitle": "Перегляньте наші торти за категоріями",
        "gallery.back": "Назад до категорій",
        "gal.from": "від",
        "gal.priceReq": "Ціна за домовленістю",
        "gal.empty": "Наші торти вже скоро - зазирніть трохи пізніше!",
        "gal.refBanner": "📷 Торкніться торта, щоб взяти його як референс для кастомного замовлення",
        "gal.refCancel": "Скасувати"
    },
    ru: {
        "galpage.back": "На главную",
        "galpage.title": "Все торты",
        "galpage.subtitle": "Смотрите наши торты по категориям",
        "gallery.back": "Назад к категориям",
        "gal.from": "от",
        "gal.priceReq": "Цена по договорённости",
        "gal.empty": "Наши торты уже скоро - загляните чуть позже!",
        "gal.refBanner": "📷 Нажмите на торт, чтобы взять его как референс для кастомного заказа",
        "gal.refCancel": "Отмена"
    }
};

var currentLang = 'en';
var _products = [];
var _defaultSizes = [];
var refPick = false;
try { refPick = localStorage.getItem('ines-ref-pick') === '1'; } catch (e) {}

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
    bar.innerHTML = '<span data-i18n="gal.refBanner">' + t('gal.refBanner') + '</span>' +
        '<button type="button" id="galRefCancel" data-i18n="gal.refCancel">' + t('gal.refCancel') + '</button>';
    var anchor = document.getElementById('allGalleryCategories');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor);
    else document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('galRefCancel').addEventListener('click', function() {
        try { localStorage.removeItem('ines-ref-pick'); } catch (e) {}
        window.location.href = '/#order';
    });
}

function getCatName(cat) { return cat[currentLang] || cat.en; }
function t(k) { var tr = translations[currentLang] || translations.en; return tr[k] || translations.en[k] || k; }

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === lang); });
    var tr = translations[lang];
    if (tr) document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var k = el.getAttribute('data-i18n'); if (tr[k]) el.innerHTML = tr[k];
    });
    render();
}
document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

function escapeHtml(str) { if (!str) return ''; var d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function locName(o) {
    if (!o) return '';
    if (currentLang === 'ua' && o.name_ua) return o.name_ua;
    if (currentLang === 'ru' && o.name_ru) return o.name_ru;
    return o.name || '';
}

function priceLabel(p) {
    if (p.price && parseFloat(p.price)) return '€' + p.price;
    var sizes = (p.sizes && p.sizes.length) ? p.sizes : _defaultSizes;
    var nums = sizes.map(function(s) { return parseFloat(s.price); }).filter(function(n) { return !isNaN(n); });
    if (!nums.length) return t('gal.priceReq');
    return t('gal.from') + ' €' + Math.min.apply(null, nums);
}

function groupByCategory() {
    var byCat = {};
    _products.forEach(function(p, idx) {
        if (!p) return;
        var c = p.category || 'other';
        (byCat[c] = byCat[c] || []).push({ p: p, index: idx });
    });
    var active = [];
    var cats = CATEGORIES.slice().sort(function(a, b) { return getCatName(a).localeCompare(getCatName(b)); });
    for (var i = 0; i < cats.length; i++) {
        var cat = cats[i];
        if (byCat[cat.id] && byCat[cat.id].length) active.push({ cat: cat, items: byCat[cat.id] });
    }
    return active;
}

function render() {
    var container = document.getElementById('allGalleryCategories');
    var active = groupByCategory();
    if (!active.length) {
        container.innerHTML = '<p style="text-align:center;color:#6B5B4E;padding:40px;">' + t('gal.empty') + '</p>';
        return;
    }
    var html = '';
    active.forEach(function(a) {
        var photo = a.items[0].p.photo || '';
        var img = photo ? '<img src="' + photo + '" alt="' + escapeHtml(getCatName(a.cat)) + '">' : '<div class="gallery__cat-noimg"></div>';
        var word = (currentLang === 'ua') ? (a.items.length === 1 ? 'торт' : 'торти')
                 : (currentLang === 'ru') ? (a.items.length === 1 ? 'торт' : 'торта')
                 : (a.items.length === 1 ? 'cake' : 'cakes');
        html += '<div class="gallery__cat-card" data-cat-id="' + a.cat.id + '">' +
            img +
            '<div class="gallery__cat-overlay">' +
                '<div class="gallery__cat-name">' + escapeHtml(getCatName(a.cat)) + '</div>' +
                '<div class="gallery__cat-count">' + a.items.length + ' ' + word + '</div>' +
            '</div>' +
        '</div>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.gallery__cat-card').forEach(function(card) {
        card.addEventListener('click', function() { openCategory(this.dataset.catId); });
    });
}

function openCategory(catId) {
    var active = groupByCategory();
    var group = null;
    for (var i = 0; i < active.length; i++) if (active[i].cat.id === catId) { group = active[i]; break; }
    if (!group) return;

    document.getElementById('allGalleryCategories').style.display = 'none';
    var expanded = document.getElementById('galleryExpanded');
    expanded.style.display = 'block';
    document.getElementById('galleryCatTitle').textContent = getCatName(group.cat);

    var html = '';
    group.items.forEach(function(it) {
        var p = it.p;
        var img = p.photo ? '<img src="' + p.photo + '" alt="' + escapeHtml(locName(p)) + '">' : '<div class="catalog-card__noimg"></div>';
        html += '<a class="catalog-card" href="product?i=' + it.index + '">' +
            '<div class="catalog-card__img">' + img + '</div>' +
            '<div class="catalog-card__body">' +
                '<div class="catalog-card__name">' + escapeHtml(locName(p)) + '</div>' +
                '<div class="catalog-card__price">' + priceLabel(p) + '</div>' +
            '</div>' +
        '</a>';
    });
    document.getElementById('galleryCatGrid').innerHTML = html;

    if (refPick) {
        document.querySelectorAll('#galleryCatGrid .catalog-card').forEach(function(card, i) {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                if (group.items[i]) selectAsRef(group.items[i].p);
            });
        });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('galleryBack').addEventListener('click', function() {
    document.getElementById('allGalleryCategories').style.display = '';
    document.getElementById('galleryExpanded').style.display = 'none';
});

function init() {
    fbGet('categories', function(cats) {
        if (cats && cats.length) CATEGORIES = cats;
        fbGet('default-sizes', function(ds) { _defaultSizes = (ds && ds.length) ? ds : []; });
        fbGet('products', function(products) {
            _products = products || [];
            render();
            showRefBanner();
            var params = new URLSearchParams(window.location.search);
            var cat = params.get('cat');
            if (cat) openCategory(cat);
        });
    });
}

setLang(currentLang);
init();
