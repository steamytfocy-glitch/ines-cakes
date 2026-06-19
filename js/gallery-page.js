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
        "galpage.title": "All Categories",
        "galpage.subtitle": "Browse all our cake categories",
        "gallery.back": "Back to categories"
    },
    ua: {
        "galpage.back": "На головну",
        "galpage.title": "Усі категорії",
        "galpage.subtitle": "Перегляньте всі наші категорії тортів",
        "gallery.back": "Назад до категорій"
    },
    ru: {
        "galpage.back": "На главную",
        "galpage.title": "Все категории",
        "galpage.subtitle": "Все наши категории тортов",
        "gallery.back": "Назад к категориям"
    }
};

var currentLang = localStorage.getItem('ines-lang') || 'en';

function getCatName(cat) { return cat[currentLang] || cat.en; }

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    var t = translations[lang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });
    loadAllCategories();
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

var _galleryCache = {};

function loadAllCategories() {
    fbGet('gallery-cat', function(gallery) {
        if (!gallery) gallery = {};
        _galleryCache = gallery;
        var container = document.getElementById('allGalleryCategories');
        var expanded = document.getElementById('galleryExpanded');

        var html = '';
        var hasCats = false;

        for (var c = 0; c < CATEGORIES.length; c++) {
            var cat = CATEGORIES[c];
            var photos = gallery[cat.id] || [];
            if (photos.length === 0) continue;
            hasCats = true;

            html += '<div class="gallery__cat-card" data-cat-id="' + cat.id + '">' +
                '<img src="' + photos[0] + '" alt="' + escapeHtml(getCatName(cat)) + '">' +
                '<div class="gallery__cat-overlay">' +
                    '<div class="gallery__cat-name">' + escapeHtml(getCatName(cat)) + '</div>' +
                    '<div class="gallery__cat-count">' + photos.length + ' photos</div>' +
                '</div>' +
            '</div>';
        }

        if (!hasCats) {
            container.innerHTML = '<p style="text-align:center;color:#6B5B4E;padding:40px;">No categories yet.</p>';
            return;
        }

        container.innerHTML = html;
        container.style.display = '';
        expanded.style.display = 'none';

        container.querySelectorAll('.gallery__cat-card').forEach(function(card) {
            card.addEventListener('click', function() {
                openCategory(this.dataset.catId);
            });
        });
    });
}

function openCategory(catId) {
    var gallery = _galleryCache;
    var photos = gallery[catId] || [];
    var cat = null;
    for (var i = 0; i < CATEGORIES.length; i++) {
        if (CATEGORIES[i].id === catId) { cat = CATEGORIES[i]; break; }
    }
    if (!cat || photos.length === 0) return;

    document.getElementById('allGalleryCategories').style.display = 'none';
    var expanded = document.getElementById('galleryExpanded');
    expanded.style.display = 'block';
    document.getElementById('galleryCatTitle').textContent = getCatName(cat);

    var html = '';
    for (var i = 0; i < photos.length; i++) {
        html += '<div class="gallery__item"><img src="' + photos[i] + '" alt="' + escapeHtml(getCatName(cat)) + '"></div>';
    }
    document.getElementById('galleryCatGrid').innerHTML = html;
}

document.getElementById('galleryBack').addEventListener('click', function() {
    document.getElementById('allGalleryCategories').style.display = '';
    document.getElementById('galleryExpanded').style.display = 'none';
});

setLang(currentLang);
fbGet('categories', function(cats) {
    if (cats && cats.length) CATEGORIES = cats;
    loadAllCategories();
});
