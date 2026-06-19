// ===== ADMIN CREDENTIALS =====
var ADMINS = [
    { login: 'admin', password: 'ines2026' },
    { login: 'admin2', password: 'ines2026' }
];

// ===== CATEGORIES =====
var DEFAULT_CATEGORIES = [
    { id: 'flowers', en: 'Flowers', ua: 'Квіти', ru: 'Цветы' },
    { id: 'kids', en: 'For Kids', ua: 'Дитячі', ru: 'Детские' },
    { id: 'birthday', en: 'Birthday', ua: 'На день народження', ru: 'На день рождения' },
    { id: 'sport', en: 'Sport', ua: 'Спортивні', ru: 'Спортивные' },
    { id: 'bento', en: 'Bento Cakes', ua: 'Бенто торти', ru: 'Бенто торты' },
    { id: 'gaming', en: 'Gaming', ua: 'Ігрові', ru: 'Игровые' },
    { id: 'berries', en: 'Natural Berries', ua: 'Натуральні ягоди', ru: 'Натуральные ягоды' },
    { id: 'other', en: 'Other', ua: 'Інше', ru: 'Другое' }
];
var CATEGORIES = DEFAULT_CATEGORIES.slice();
var categoriesSeeded = false;

// ===== STORAGE HELPERS =====
var _cache = {};

function getData(key, fallback) {
    return _cache[key] !== undefined ? _cache[key] : fallback;
}

function setData(key, value, callback) {
    _cache[key] = value;
    fbSet(key, value, callback);
}

function listenData(key, callback) {
    fbGet(key, function(val) {
        _cache[key] = val;
        if (callback) callback(val);
    });
}

// ===== AUTH =====
var loginScreen = document.getElementById('loginScreen');
var adminPanel = document.getElementById('adminPanel');
var loginForm = document.getElementById('loginForm');
var loginError = document.getElementById('loginError');
var sidebarUser = document.getElementById('sidebarUser');

function checkAuth() {
    var session = null;
    try { session = JSON.parse(localStorage.getItem('ines-session')); } catch(e) {}
    if (session) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'flex';
        sidebarUser.textContent = session.login;
        loadAllData();
    }
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var user = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;

    var found = false;
    for (var i = 0; i < ADMINS.length; i++) {
        if (ADMINS[i].login === user && ADMINS[i].password === pass) {
            found = true;
            break;
        }
    }

    if (found) {
        localStorage.setItem('ines-session', JSON.stringify({ login: user, time: Date.now() }));
        loginError.textContent = '';
        checkAuth();
    } else {
        loginError.textContent = 'Wrong login or password';
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('ines-session');
    location.reload();
});

// ===== TABS =====
var tabButtons = document.querySelectorAll('.sidebar__link');
var tabContents = document.querySelectorAll('.tab-content');
var topbarTitle = document.getElementById('topbarTitle');

var tabTitles = {
    orders: 'Orders',
    gallery: 'Gallery',
    certificates: 'Certificates',
    flavours: 'Flavours',
    reviews: 'Reviews',
    content: 'Content'
};

function switchTab(tab) {
    tabButtons.forEach(function(b) { b.classList.remove('active'); });
    tabContents.forEach(function(t) { t.classList.remove('active'); });
    var btn = document.querySelector('[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    var content = document.getElementById('tab-' + tab);
    if (content) content.classList.add('active');
    topbarTitle.textContent = tabTitles[tab] || tab;
    localStorage.setItem('ines-admin-tab', tab);
}

tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
        var sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    });
});

var savedTab = localStorage.getItem('ines-admin-tab');
if (savedTab) switchTab(savedTab);

// Mobile sidebar toggle
var adminBurger = document.getElementById('adminBurger');
var sidebar = document.querySelector('.sidebar');

adminBurger.addEventListener('click', function() {
    sidebar.classList.toggle('open');
});

// ===== ORDERS =====
function loadOrders() {
    var orders = getData('orders', null);
    if (!orders) orders = [];
    var list = document.getElementById('ordersList');
    var stats = document.getElementById('orderStats');

    if (orders.length === 0) {
        list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><p>No orders yet</p><span>Orders from the website form will appear here</span></div>';
        stats.innerHTML = '';
        return;
    }

    var counts = { new: 0, progress: 0, done: 0 };
    orders.forEach(function(o) {
        counts[o.status || 'new']++;
    });

    stats.innerHTML =
        '<span class="stat-badge"><span class="dot dot--new"></span> New: ' + counts.new + '</span>' +
        '<span class="stat-badge"><span class="dot dot--progress"></span> In progress: ' + counts.progress + '</span>' +
        '<span class="stat-badge"><span class="dot dot--done"></span> Done: ' + counts.done + '</span>';

    var html = '';
    for (var i = orders.length - 1; i >= 0; i--) {
        var o = orders[i];
        html += '<div class="order-card">' +
            '<div class="order-card__header">' +
                '<span class="order-card__name">' + escapeHtml(o.name) + '</span>' +
                '<span class="order-card__date">' + escapeHtml(o.submitted || '') + '</span>' +
            '</div>' +
            '<div class="order-card__details">' +
                '<div class="order-card__detail"><strong>Phone:</strong> ' + escapeHtml(o.phone) + '</div>' +
                (o.email ? '<div class="order-card__detail"><strong>Email:</strong> ' + escapeHtml(o.email) + '</div>' : '') +
                '<div class="order-card__detail"><strong>Date needed:</strong> ' + escapeHtml(o.date) + '</div>' +
                '<div class="order-card__detail"><strong>Size:</strong> ' + escapeHtml(o.cakeSize) + '</div>' +
                (o.flavour ? '<div class="order-card__detail"><strong>Flavour:</strong> ' + escapeHtml(o.flavour) + '</div>' : '') +
            '</div>' +
            (o.message ? '<div class="order-card__message">' + escapeHtml(o.message) + '</div>' : '') +
            (o.photo ? '<div class="order-card__photo"><img src="' + o.photo + '" alt="Reference" style="max-width:200px;border-radius:8px;margin-bottom:12px;"></div>' : '') +
            '<div class="order-card__actions">' +
                '<select class="status-select" data-order-id="' + i + '">' +
                    '<option value="new"' + (o.status === 'new' ? ' selected' : '') + '>New</option>' +
                    '<option value="progress"' + (o.status === 'progress' ? ' selected' : '') + '>In progress</option>' +
                    '<option value="done"' + (o.status === 'done' ? ' selected' : '') + '>Done</option>' +
                '</select>' +
                '<button class="btn-delete" data-order-del="' + i + '">Delete</button>' +
            '</div>' +
        '</div>';
    }
    list.innerHTML = html;

    list.querySelectorAll('.status-select').forEach(function(sel) {
        sel.addEventListener('change', function() {
            var idx = parseInt(this.dataset.orderId);
            var orders = getData('orders', []);
            orders[idx].status = this.value;
            setData('orders', orders);
            loadOrders();
        });
    });

    list.querySelectorAll('[data-order-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm('Delete this order?')) return;
            var idx = parseInt(this.dataset.orderDel);
            var orders = getData('orders', []);
            orders.splice(idx, 1);
            setData('orders', orders);
            loadOrders();
        });
    });
}

// ===== GALLERY =====
var pendingUploadCategory = '';

function loadGallery() {
    var gallery = getData('gallery-cat', null);
    if (!gallery) gallery = {};
    var container = document.getElementById('galleryAdmin');

    var hasAny = false;
    for (var k in gallery) {
        if (gallery[k] && gallery[k].length > 0) { hasAny = true; break; }
    }

    if (!hasAny) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>No photos yet</p><span>Upload photos of your cakes to display in the gallery</span></div>';
        return;
    }

    var html = '';
    for (var c = 0; c < CATEGORIES.length; c++) {
        var cat = CATEGORIES[c];
        var photos = gallery[cat.id] || [];
        if (photos.length === 0) continue;

        html += '<div class="gallery-cat-section">' +
            '<div class="gallery-cat-header"><h3>' + escapeHtml(cat.en) + '</h3><span class="gallery-cat-count">' + photos.length + ' photos</span></div>' +
            '<div class="gallery-admin">';

        for (var p = 0; p < photos.length; p++) {
            html += '<div class="gallery-admin-item">' +
                '<img src="' + photos[p] + '" alt="' + escapeHtml(cat.en) + '">' +
                '<button class="gallery-admin-item__delete" data-cat="' + cat.id + '" data-idx="' + p + '">&times;</button>' +
            '</div>';
        }
        html += '</div></div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('.gallery-admin-item__delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm('Delete this photo?')) return;
            var catId = this.dataset.cat;
            var idx = parseInt(this.dataset.idx);
            var gallery = getData('gallery-cat', {});
            if (gallery[catId]) {
                gallery[catId].splice(idx, 1);
                setData('gallery-cat', gallery);
            }
            loadGallery();
        });
    });
}

function compressImage(file, maxSize, quality, callback) {
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var w = img.width;
            var h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                else { w = Math.round(w * maxSize / h); h = maxSize; }
            }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = function() { alert('Could not load image: ' + file.name); };
        img.src = ev.target.result;
    };
    reader.onerror = function() { alert('Could not read file: ' + file.name); };
    reader.readAsDataURL(file);
}

function addCategory(callback) {
    var name = prompt('New category name:');
    if (!name) return;
    name = name.trim();
    if (!name) return;
    var id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('cat' + Date.now());
    // ensure unique id
    var exists = CATEGORIES.some(function(c) { return c.id === id; });
    if (exists) id = id + '-' + Date.now();
    var newCat = { id: id, en: name, ua: name, ru: name };

    fbGetOnce('categories', function(cats) {
        if (!cats || !cats.length) cats = DEFAULT_CATEGORIES.slice();
        // insert before "other" if present
        var otherIdx = cats.findIndex(function(c) { return c.id === 'other'; });
        if (otherIdx > -1) cats.splice(otherIdx, 0, newCat);
        else cats.push(newCat);
        setData('categories', cats);
        if (callback) callback(id);
    });
}

function showCategoryModal() {
    var picker = document.getElementById('categoryPick');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="category-pick-btn" data-cat-id="' + CATEGORIES[i].id + '">' + escapeHtml(CATEGORIES[i].en) + '</button>';
    }
    html += '<button class="category-pick-btn category-pick-btn--add" id="addCategoryBtn">+ New category</button>';
    picker.innerHTML = html;
    document.getElementById('categoryModal').style.display = 'flex';

    picker.querySelectorAll('.category-pick-btn').forEach(function(btn) {
        if (btn.id === 'addCategoryBtn') {
            btn.addEventListener('click', function() {
                addCategory(function(newId) {
                    pendingUploadCategory = newId;
                    document.getElementById('categoryModal').style.display = 'none';
                    document.getElementById('galleryUpload').click();
                });
            });
            return;
        }
        btn.addEventListener('click', function() {
            pendingUploadCategory = this.dataset.catId;
            document.getElementById('categoryModal').style.display = 'none';
            document.getElementById('galleryUpload').click();
        });
    });
}

document.getElementById('addPhotoBtn').addEventListener('click', function() {
    showCategoryModal();
});

document.getElementById('categoryCancel').addEventListener('click', function() {
    document.getElementById('categoryModal').style.display = 'none';
});

document.querySelector('#categoryModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('categoryModal').style.display = 'none';
});

document.getElementById('galleryUpload').addEventListener('change', function(e) {
    var fileList = e.target.files;
    if (!fileList.length || !pendingUploadCategory) return;

    var savedFiles = [];
    for (var f = 0; f < fileList.length; f++) savedFiles.push(fileList[f]);

    var catId = pendingUploadCategory;
    var total = savedFiles.length;
    var loaded = 0;

    e.target.value = '';
    pendingUploadCategory = '';

    fbGetOnce('gallery-cat', function(gallery) {
        if (!gallery) gallery = {};
        if (!gallery[catId]) gallery[catId] = [];

        for (var i = 0; i < savedFiles.length; i++) {
            (function(file) {
                compressImage(file, 800, 0.7, function(dataUrl) {
                    gallery[catId].push(dataUrl);
                    loaded++;
                    if (loaded === total) {
                        setData('gallery-cat', gallery);
                    }
                });
            })(savedFiles[i]);
        }
    });
});

// ===== SORT BY CATEGORY =====
var sortPanel = document.getElementById('sortPanel');
var sortGrid = document.getElementById('sortGrid');
var galleryAdminContainer = document.getElementById('galleryAdmin');

document.getElementById('sortPhotosBtn').addEventListener('click', function() {
    var oldPhotos = getData('gallery', []);
    var catGallery = getData('gallery-cat', {});

    // Collect ALL photos (old flat + already categorized)
    var allPhotos = [];

    for (var i = 0; i < oldPhotos.length; i++) {
        allPhotos.push({ src: oldPhotos[i], cat: null });
    }
    for (var catId in catGallery) {
        var arr = catGallery[catId];
        for (var j = 0; j < arr.length; j++) {
            allPhotos.push({ src: arr[j], cat: catId });
        }
    }

    if (allPhotos.length === 0) {
        alert('No photos to sort. Upload some first!');
        return;
    }

    sortPanel.style.display = 'block';
    galleryAdminContainer.style.display = 'none';
    document.querySelector('.tab-header').style.display = 'none';

    var html = '';
    for (var k = 0; k < allPhotos.length; k++) {
        var p = allPhotos[k];
        var catLabel = '';
        if (p.cat) {
            for (var c = 0; c < CATEGORIES.length; c++) {
                if (CATEGORIES[c].id === p.cat) { catLabel = CATEGORIES[c].en; break; }
            }
        }
        html += '<div class="sort-item' + (p.cat ? ' sorted' : '') + '" data-sort-idx="' + k + '">' +
            '<img src="' + p.src + '" alt="photo">' +
            (catLabel ? '<div class="sort-item__badge">' + escapeHtml(catLabel) + '</div>' : '') +
        '</div>';
    }
    sortGrid.innerHTML = html;

    window._sortPhotos = allPhotos;

    sortGrid.querySelectorAll('.sort-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var idx = parseInt(this.dataset.sortIdx);
            showSortCategoryPicker(idx);
        });
    });
});

function showSortCategoryPicker(photoIdx) {
    var picker = document.getElementById('categoryPick');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="category-pick-btn" data-cat-id="' + CATEGORIES[i].id + '">' + CATEGORIES[i].en + '</button>';
    }
    picker.innerHTML = html;
    document.getElementById('categoryModal').style.display = 'flex';

    picker.querySelectorAll('.category-pick-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.catId;
            window._sortPhotos[photoIdx].cat = catId;
            document.getElementById('categoryModal').style.display = 'none';

            // Update UI
            var item = sortGrid.querySelector('[data-sort-idx="' + photoIdx + '"]');
            item.classList.add('sorted');
            var catLabel = '';
            for (var c = 0; c < CATEGORIES.length; c++) {
                if (CATEGORIES[c].id === catId) { catLabel = CATEGORIES[c].en; break; }
            }
            var oldBadge = item.querySelector('.sort-item__badge');
            if (oldBadge) oldBadge.remove();
            var badge = document.createElement('div');
            badge.className = 'sort-item__badge';
            badge.textContent = catLabel;
            item.appendChild(badge);
        });
    });
}

document.getElementById('sortDone').addEventListener('click', function() {
    var photos = window._sortPhotos || [];
    var newGallery = {};

    for (var i = 0; i < photos.length; i++) {
        var cat = photos[i].cat;
        if (!cat) cat = 'other';
        if (!newGallery[cat]) newGallery[cat] = [];
        newGallery[cat].push(photos[i].src);
    }

    try {
        setData('gallery-cat', newGallery);
        localStorage.removeItem('ines-gallery');
    } catch(e) {
        alert('Storage full!');
        return;
    }

    sortPanel.style.display = 'none';
    galleryAdminContainer.style.display = '';
    document.querySelector('#tab-gallery .tab-header').style.display = '';
    loadGallery();
});

// ===== CERTIFICATES =====
function certFrontSrc(c) { return (typeof c === 'string') ? c : (c && c.front); }
function certBackSrc(c) { return (typeof c === 'string') ? null : (c && c.back); }

function loadCertificates() {
    var certs = getData('certificates', null) || [];
    var container = document.getElementById('certificatesAdmin');

    if (certs.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/></svg><p>No certificates yet</p><span>Upload your HACCP / hygiene certificates to show on the site</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < certs.length; i++) {
        var hasBack = certBackSrc(certs[i]) ? '<span class="cert-admin-item__badge">2 sides</span>' : '';
        html += '<div class="cert-admin-item">' +
            '<img src="' + certFrontSrc(certs[i]) + '" alt="Certificate">' +
            hasBack +
            '<button class="cert-admin-item__delete" data-cert-del="' + i + '">&times;</button>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-cert-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm('Delete this certificate?')) return;
            var idx = parseInt(this.dataset.certDel);
            var certs = getData('certificates', []) || [];
            certs.splice(idx, 1);
            setData('certificates', certs);
        });
    });
}

var certFrontData = null;
var certBackData = null;

document.getElementById('addCertBtn').addEventListener('click', function() {
    certFrontData = null;
    certBackData = null;
    document.getElementById('certFront').value = '';
    document.getElementById('certBack').value = '';
    document.getElementById('certFrontPreview').innerHTML = '';
    document.getElementById('certBackPreview').innerHTML = '';
    document.getElementById('certModal').style.display = 'flex';
});

document.getElementById('certCancel').addEventListener('click', function() {
    document.getElementById('certModal').style.display = 'none';
});
document.querySelector('#certModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('certModal').style.display = 'none';
});

document.getElementById('certFront').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 1400, 0.82, function(dataUrl) {
        certFrontData = dataUrl;
        document.getElementById('certFrontPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:120px;border-radius:6px;">';
    });
});

document.getElementById('certBack').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 1400, 0.82, function(dataUrl) {
        certBackData = dataUrl;
        document.getElementById('certBackPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:120px;border-radius:6px;">';
    });
});

document.getElementById('certSave').addEventListener('click', function() {
    if (!certFrontData) { alert('Please choose a front photo'); return; }
    var cert = { front: certFrontData, back: certBackData || null };
    fbGetOnce('certificates', function(certs) {
        if (!certs) certs = [];
        certs.push(cert);
        setData('certificates', certs);
        document.getElementById('certModal').style.display = 'none';
    });
});

// ===== FLAVOURS =====
var DEFAULT_FLAVOURS = [
    { name: 'Chocolate', desc: 'Rich chocolate sponge with chocolate ganache', price: '', photo: null },
    { name: 'Vanilla', desc: 'Classic vanilla sponge with vanilla cream', price: '', photo: null },
    { name: 'Red Velvet', desc: 'Red velvet with cream cheese frosting', price: '', photo: null },
    { name: 'Honey (Medovik)', desc: 'Delicate honey layers with sour cream', price: '', photo: null },
    { name: 'Napoleon', desc: 'Puff pastry layers with custard cream', price: '', photo: null },
    { name: 'Cheesecake', desc: 'Creamy baked cheesecake', price: '', photo: null },
    { name: 'Carrot', desc: 'Carrot sponge with cream cheese frosting', price: '', photo: null },
    { name: 'Strawberry', desc: 'Vanilla sponge with fresh strawberries', price: '', photo: null },
    { name: 'Pistachio', desc: 'Pistachio sponge with delicate cream', price: '', photo: null },
    { name: 'Lemon', desc: 'Zesty lemon sponge with lemon curd', price: '', photo: null }
];
var flavoursSeeded = false;

function loadFlavours() {
    var flavours = getData('flavours', null);
    if (!flavours) flavours = [];
    var container = document.getElementById('flavoursAdmin');

    if (flavours.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M12 2a7 7 0 00-7 7c0 2 1 3 1 5h12c0-2 1-3 1-5a7 7 0 00-7-7z"/><line x1="6" y1="18" x2="18" y2="18"/></svg><p>No flavours yet</p><span>Add flavours with cross-section photos and prices</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < flavours.length; i++) {
        var f = flavours[i];
        var imgHtml = f.photo
            ? '<img src="' + f.photo + '" class="flavour-admin-card__img" alt="' + escapeHtml(f.name) + '">'
            : '<div class="flavour-admin-card__placeholder"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
        html += '<div class="flavour-admin-card">' +
            imgHtml +
            '<div class="flavour-admin-card__body">' +
                '<div class="flavour-admin-card__name">' + escapeHtml(f.name) + '</div>' +
                (f.desc ? '<div class="flavour-admin-card__desc">' + escapeHtml(f.desc) + '</div>' : '') +
                (f.price ? '<div class="flavour-admin-card__price">€' + escapeHtml(f.price) + ' / kg</div>' : '') +
                '<div class="flavour-admin-card__actions">' +
                    '<button class="btn-edit" data-flavour-edit="' + i + '">Edit</button>' +
                    '<button class="btn-delete" data-flavour-del="' + i + '">Delete</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-flavour-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm('Delete this flavour?')) return;
            var idx = parseInt(this.dataset.flavourDel);
            var flavours = getData('flavours', []) || [];
            flavours.splice(idx, 1);
            setData('flavours', flavours);
        });
    });

    container.querySelectorAll('[data-flavour-edit]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.flavourEdit);
            var flavours = getData('flavours', []) || [];
            var f = flavours[idx];
            document.getElementById('flavourEditId').value = idx;
            document.getElementById('flavourName').value = f.name || '';
            document.getElementById('flavourDesc').value = f.desc || '';
            document.getElementById('flavourPrice').value = f.price || '';
            pendingFlavourPhoto = f.photo || null;
            document.getElementById('flavourPhotoPreview').innerHTML = f.photo ? '<img src="' + f.photo + '" style="max-width:120px;border-radius:8px;">' : '';
            document.getElementById('flavourModalTitle').textContent = 'Edit Flavour';
            document.getElementById('flavourModal').style.display = 'flex';
        });
    });
}

var pendingFlavourPhoto = null;

document.getElementById('addFlavourBtn').addEventListener('click', function() {
    document.getElementById('flavourEditId').value = '';
    document.getElementById('flavourName').value = '';
    document.getElementById('flavourDesc').value = '';
    document.getElementById('flavourPrice').value = '';
    document.getElementById('flavourPhotoPreview').innerHTML = '';
    pendingFlavourPhoto = null;
    document.getElementById('flavourModalTitle').textContent = 'Add Flavour';
    document.getElementById('flavourModal').style.display = 'flex';
});

document.getElementById('flavourCancel').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'none';
});

document.querySelector('#flavourModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'none';
});

document.getElementById('flavourPhoto').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 600, 0.7, function(dataUrl) {
        pendingFlavourPhoto = dataUrl;
        document.getElementById('flavourPhotoPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:120px;border-radius:8px;">';
    });
});

document.getElementById('flavourForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var editId = document.getElementById('flavourEditId').value;
    var flavour = {
        name: document.getElementById('flavourName').value.trim(),
        desc: document.getElementById('flavourDesc').value.trim(),
        price: document.getElementById('flavourPrice').value.trim(),
        photo: pendingFlavourPhoto || null
    };

    var flavours = getData('flavours', []) || [];
    if (editId !== '') {
        flavours[parseInt(editId)] = flavour;
    } else {
        flavours.push(flavour);
    }
    setData('flavours', flavours);
    document.getElementById('flavourModal').style.display = 'none';
});

// ===== REVIEWS =====
function loadReviews() {
    var reviews = getData('reviews', null);
    if (!reviews) reviews = [];
    var container = document.getElementById('reviewsAdmin');

    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg><p>No reviews yet</p><span>Add customer reviews to display on the website</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < reviews.length; i++) {
        var r = reviews[i];
        var stars = '';
        for (var s = 0; s < r.rating; s++) stars += '★';

        html += '<div class="review-admin-card">' +
            '<div class="review-admin-card__content">' +
                '<div class="review-admin-card__stars">' + stars + '</div>' +
                '<p class="review-admin-card__text">"' + escapeHtml(r.text) + '"</p>' +
                '<p class="review-admin-card__author">— ' + escapeHtml(r.author) + '</p>' +
            '</div>' +
            '<div class="review-admin-card__actions">' +
                '<button class="btn-edit" data-review-edit="' + i + '">Edit</button>' +
                '<button class="btn-delete" data-review-del="' + i + '">Delete</button>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-review-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm('Delete this review?')) return;
            var idx = parseInt(this.dataset.reviewDel);
            var reviews = getData('reviews', []);
            reviews.splice(idx, 1);
            setData('reviews', reviews);
            loadReviews();
        });
    });

    container.querySelectorAll('[data-review-edit]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.reviewEdit);
            var reviews = getData('reviews', []);
            var r = reviews[idx];
            document.getElementById('reviewEditId').value = idx;
            document.getElementById('reviewAuthor').value = r.author;
            document.getElementById('reviewRating').value = r.rating;
            document.getElementById('reviewText').value = r.text;
            document.getElementById('reviewModalTitle').textContent = 'Edit Review';
            document.getElementById('reviewModal').style.display = 'flex';
        });
    });
}

document.getElementById('addReviewBtn').addEventListener('click', function() {
    document.getElementById('reviewEditId').value = '';
    document.getElementById('reviewAuthor').value = '';
    document.getElementById('reviewRating').value = '5';
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewModalTitle').textContent = 'Add Review';
    document.getElementById('reviewModal').style.display = 'flex';
});

document.getElementById('reviewCancel').addEventListener('click', function() {
    document.getElementById('reviewModal').style.display = 'none';
});

document.querySelector('#reviewModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('reviewModal').style.display = 'none';
});

document.getElementById('reviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var editId = document.getElementById('reviewEditId').value;
    var review = {
        author: document.getElementById('reviewAuthor').value.trim(),
        rating: parseInt(document.getElementById('reviewRating').value),
        text: document.getElementById('reviewText').value.trim()
    };

    var reviews = getData('reviews', []);

    if (editId !== '') {
        reviews[parseInt(editId)] = review;
    } else {
        reviews.push(review);
    }

    setData('reviews', reviews);
    document.getElementById('reviewModal').style.display = 'none';
    loadReviews();
});

// ===== CONTENT =====
function loadContent() {
    var content = getData('content', null);
    if (!content) return;
    var fields = document.querySelectorAll('[data-key]');
    fields.forEach(function(field) {
        var key = field.dataset.key;
        if (content[key] !== undefined) {
            field.value = content[key];
        }
    });
}

document.getElementById('saveContentBtn').addEventListener('click', function() {
    var content = {};
    document.querySelectorAll('[data-key]').forEach(function(field) {
        content[field.dataset.key] = field.value.trim();
    });
    setData('content', content);
    var status = document.getElementById('saveStatus');
    status.textContent = 'Changes saved!';
    setTimeout(function() { status.textContent = ''; }, 3000);
});

// ===== HELPERS =====
function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== LOAD ALL =====
function loadAllData() {
    listenData('categories', function(val) {
        if (val === null && !categoriesSeeded) {
            categoriesSeeded = true;
            setData('categories', DEFAULT_CATEGORIES);
            return;
        }
        if (val && val.length) CATEGORIES = val;
        loadGallery();
    });
    listenData('orders', function() { loadOrders(); });
    listenData('gallery-cat', function() { loadGallery(); });
    listenData('certificates', function() { loadCertificates(); });
    listenData('flavours', function(val) {
        if (val === null && !flavoursSeeded) {
            flavoursSeeded = true;
            setData('flavours', DEFAULT_FLAVOURS);
            return;
        }
        loadFlavours();
    });
    listenData('reviews', function() { loadReviews(); });
    listenData('content', function() { loadContent(); });
}

// ===== INIT =====
checkAuth();
