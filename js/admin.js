// ===== ADMIN CREDENTIALS =====
var ADMINS = [
    { login: 'admin', password: 'ines2026' },
    { login: 'admin2', password: 'ines2026' }
];

// ===== CATEGORIES =====
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
    reviews: 'Reviews',
    content: 'Content'
};

tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        var tab = this.dataset.tab;
        tabButtons.forEach(function(b) { b.classList.remove('active'); });
        tabContents.forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');
        topbarTitle.textContent = tabTitles[tab] || tab;

        var sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    });
});

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

function showCategoryModal() {
    var picker = document.getElementById('categoryPick');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="category-pick-btn" data-cat-id="' + CATEGORIES[i].id + '">' + CATEGORIES[i].en + '</button>';
    }
    picker.innerHTML = html;
    document.getElementById('categoryModal').style.display = 'flex';

    picker.querySelectorAll('.category-pick-btn').forEach(function(btn) {
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
    listenData('orders', function() { loadOrders(); });
    listenData('gallery-cat', function() { loadGallery(); });
    listenData('reviews', function() { loadReviews(); });
    listenData('content', function() { loadContent(); });
}

// ===== INIT =====
checkAuth();
