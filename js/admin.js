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
    cakes: 'Cakes',
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
var ORDER_STATUSES = [
    { id: 'new', label: 'New' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'progress', label: 'Being made' },
    { id: 'ready', label: 'Ready' },
    { id: 'done', label: 'Completed' },
    { id: 'declined', label: 'Declined' }
];

function adminNormalizePhone(phone) {
    var digits = String(phone || '').replace(/[^0-9]/g, '');
    if (digits.indexOf('353') === 0) return digits;
    if (digits.indexOf('0') === 0) return '353' + digits.slice(1);
    return digits;
}

function adminWaMessage(order) {
    var code = order.code || '';
    var lang = order.lang || 'en';
    if (lang === 'ua') return 'Вітаємо! Це пекарня I.N.E.S. щодо вашого замовлення ' + code + '.';
    if (lang === 'ru') return 'Здравствуйте! Это пекарня I.N.E.S. по вашему заказу ' + code + '.';
    return 'Hello! This is I.N.E.S. Bakery regarding your order ' + code + '.';
}

var hideCompleted = localStorage.getItem('ines-hide-done') === '1';
var orderSearch = '';

(function() {
    var input = document.getElementById('orderSearch');
    if (!input) return;
    input.addEventListener('input', function() {
        orderSearch = this.value.trim().toLowerCase();
        loadOrders();
    });
})();

function orderMatchesSearch(o) {
    if (!orderSearch) return true;
    var hay = [(o.name || ''), (o.phone || ''), (o.code || ''), (o.email || '')].join(' ').toLowerCase();
    return hay.indexOf(orderSearch) > -1;
}

function isCompleted(o) {
    var s = (o && o.status) || 'new';
    return s === 'done' || s === 'declined';
}

(function() {
    var btn = document.getElementById('toggleDoneBtn');
    if (!btn) return;
    function syncLabel() { btn.textContent = hideCompleted ? 'Show completed' : 'Hide completed'; }
    syncLabel();
    btn.addEventListener('click', function() {
        hideCompleted = !hideCompleted;
        localStorage.setItem('ines-hide-done', hideCompleted ? '1' : '0');
        syncLabel();
        loadOrders();
    });
})();

function notifyClientStatus(order) {
    if (!order || !order.email || order.email.indexOf('@') < 0) return;
    try {
        fetch('/api/notify-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: order.email,
                name: order.name || '',
                code: order.code || '',
                status: order.status || 'new',
                note: order.note || '',
                lang: order.lang || 'en'
            })
        }).then(function(r) {
            if (!r.ok) console.warn('Status email not sent (HTTP ' + r.status + ')');
        }).catch(function(e) { console.warn('Status email error', e); });
    } catch (e) { console.warn('Status email error', e); }
}

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

    var counts = { new: 0, active: 0, done: 0 };
    orders.forEach(function(o) {
        var s = o.status || 'new';
        if (s === 'new') counts.new++;
        else if (s === 'done' || s === 'declined') counts.done++;
        else counts.active++;
    });

    stats.innerHTML =
        '<span class="stat-badge"><span class="dot dot--new"></span> New: ' + counts.new + '</span>' +
        '<span class="stat-badge"><span class="dot dot--progress"></span> In progress: ' + counts.active + '</span>' +
        '<span class="stat-badge"><span class="dot dot--done"></span> Completed: ' + counts.done + '</span>';

    var html = '';
    var shown = 0;
    for (var i = orders.length - 1; i >= 0; i--) {
        var o = orders[i];
        if (hideCompleted && isCompleted(o)) continue;
        if (!orderMatchesSearch(o)) continue;
        shown++;
        var status = o.status || 'new';

        var statusOptions = '';
        for (var s = 0; s < ORDER_STATUSES.length; s++) {
            statusOptions += '<option value="' + ORDER_STATUSES[s].id + '"' +
                (status === ORDER_STATUSES[s].id ? ' selected' : '') + '>' +
                ORDER_STATUSES[s].label + '</option>';
        }

        var waLink = o.phone
            ? 'https://wa.me/' + adminNormalizePhone(o.phone) + '?text=' + encodeURIComponent(adminWaMessage(o))
            : '';
        var trackLink = o.code ? 'order?code=' + encodeURIComponent(o.code) : '';

        html += '<div class="order-card order-card--' + status + '">' +
            '<div class="order-card__header">' +
                '<span class="order-card__name">' + escapeHtml(o.name) +
                    (o.code ? ' <span class="order-card__code">' + escapeHtml(o.code) + '</span>' : '') +
                '</span>' +
                '<span class="order-card__date">' + escapeHtml(o.submitted || '') + '</span>' +
            '</div>' +
            '<div class="order-card__details">' +
                '<div class="order-card__detail"><strong>Phone:</strong> ' + escapeHtml(o.phone) + '</div>' +
                (o.email ? '<div class="order-card__detail"><strong>Email:</strong> ' + escapeHtml(o.email) + '</div>' : '') +
                '<div class="order-card__detail"><strong>Date needed:</strong> ' + escapeHtml(o.date) + '</div>' +
                '<div class="order-card__detail"><strong>Size:</strong> ' + escapeHtml(o.cakeSize) + (o.customDiameter ? ' (' + escapeHtml(o.customDiameter) + '")' : '') + '</div>' +
                (o.flavour ? '<div class="order-card__detail"><strong>Flavour:</strong> ' + escapeHtml(o.flavour) + '</div>' : '') +
                (o.total ? '<div class="order-card__detail"><strong>Est. total:</strong> ' + escapeHtml(o.total) + '</div>' : '') +
                (o.allergies ? '<div class="order-card__detail"><strong>Allergies:</strong> ' + escapeHtml(o.allergies) + '</div>' : '') +
            '</div>' +
            (o.message ? '<div class="order-card__message">' + escapeHtml(o.message) + '</div>' : '') +
            (o.photo ? '<div class="order-card__photo"><img src="' + o.photo + '" alt="Reference" style="max-width:200px;border-radius:8px;margin-bottom:12px;"></div>' : '') +
            '<div class="order-card__contact">' +
                (waLink ? '<a href="' + waLink + '" target="_blank" class="order-wa-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.6 6.3A7.85 7.85 0 0012 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1A7.94 7.94 0 0012 19.9a7.94 7.94 0 005.6-13.6zM12 18.5a6.6 6.6 0 01-3.4-.9l-.24-.15-2.5.65.67-2.43-.16-.25A6.59 6.59 0 1118.6 12 6.6 6.6 0 0112 18.5z"/></svg> WhatsApp</a>' : '') +
                (trackLink ? '<a href="' + trackLink + '" target="_blank" class="order-track-link">Status page &rarr;</a>' : '') +
            '</div>' +
            '<div class="order-card__note">' +
                '<label>Message to client (shown on their status page)</label>' +
                '<textarea class="order-note-input" data-note-id="' + i + '" rows="2" placeholder="e.g. Confirmed! Price €45, ready Saturday.">' + escapeHtml(o.note || '') + '</textarea>' +
                '<button class="btn-admin order-note-save" data-note-save="' + i + '">Save message</button>' +
                '<span class="order-note-status" data-note-status="' + i + '"></span>' +
            '</div>' +
            '<div class="order-card__actions">' +
                '<select class="status-select" data-order-id="' + i + '">' + statusOptions + '</select>' +
                '<button class="btn-delete" data-order-del="' + i + '">Delete</button>' +
            '</div>' +
        '</div>';
    }
    if (shown === 0) {
        html = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M20 6L9 17l-5-5"/></svg><p>All caught up</p><span>Completed orders are hidden. Click "Show completed" to see them.</span></div>';
    }
    list.innerHTML = html;

    list.querySelectorAll('.status-select').forEach(function(sel) {
        sel.addEventListener('change', function() {
            var idx = parseInt(this.dataset.orderId);
            var orders = getData('orders', []);
            orders[idx].status = this.value;
            setData('orders', orders);
            notifyClientStatus(orders[idx]);
            loadOrders();
        });
    });

    list.querySelectorAll('[data-note-save]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.noteSave);
            var ta = list.querySelector('[data-note-id="' + idx + '"]');
            var orders = getData('orders', []);
            if (!orders[idx]) return;
            orders[idx].note = ta.value;
            setData('orders', orders);
            var statusEl = list.querySelector('[data-note-status="' + idx + '"]');
            if (statusEl) {
                statusEl.textContent = 'Saved ✓';
                setTimeout(function() { statusEl.textContent = ''; }, 2500);
            }
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
            html += '<div class="gallery-admin-item" data-cat="' + cat.id + '" data-idx="' + p + '">' +
                '<img src="' + photos[p] + '" alt="' + escapeHtml(cat.en) + '">' +
                '<div class="gallery-admin-item__check">✓</div>' +
                '<button class="gallery-admin-item__delete" data-cat="' + cat.id + '" data-idx="' + p + '">&times;</button>' +
            '</div>';
        }
        html += '</div></div>';
    }
    container.innerHTML = html;

    if (gallerySelectMode) {
        container.classList.add('gallery-admin--selecting');
        container.querySelectorAll('.gallery-admin-item').forEach(function(item) {
            var key = item.dataset.cat + '#' + item.dataset.idx;
            if (gallerySelected[key]) item.classList.add('selected');
            item.addEventListener('click', function() {
                var k = this.dataset.cat + '#' + this.dataset.idx;
                if (gallerySelected[k]) { delete gallerySelected[k]; this.classList.remove('selected'); }
                else { gallerySelected[k] = { cat: this.dataset.cat, idx: parseInt(this.dataset.idx) }; this.classList.add('selected'); }
                updateGalleryDelCount();
            });
        });
        updateGalleryDelCount();
    } else {
        container.classList.remove('gallery-admin--selecting');
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
}

// ===== GALLERY MULTI-DELETE =====
var gallerySelectMode = false;
var gallerySelected = {};

function updateGalleryDelCount() {
    var n = Object.keys(gallerySelected).length;
    var el = document.getElementById('galleryDelCount');
    if (el) el.textContent = n + ' selected';
}

function exitGalleryDeleteMode() {
    gallerySelectMode = false;
    gallerySelected = {};
    var bar = document.getElementById('galleryDelBar');
    if (bar) bar.style.display = 'none';
    var btn = document.getElementById('multiDeleteBtn');
    if (btn) btn.textContent = 'Select to delete';
    loadGallery();
}

(function initGalleryMultiDelete() {
    var btn = document.getElementById('multiDeleteBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        if (gallerySelectMode) { exitGalleryDeleteMode(); return; }
        gallerySelectMode = true;
        gallerySelected = {};
        this.textContent = 'Cancel selection';
        document.getElementById('galleryDelBar').style.display = 'flex';
        loadGallery();
    });

    document.getElementById('galleryDelCancel').addEventListener('click', exitGalleryDeleteMode);

    document.getElementById('gallerySelectAllDel').addEventListener('click', function() {
        var items = document.querySelectorAll('#galleryAdmin .gallery-admin-item');
        var allSelected = items.length > 0 && Object.keys(gallerySelected).length === items.length;
        gallerySelected = {};
        items.forEach(function(item) {
            if (!allSelected) {
                gallerySelected[item.dataset.cat + '#' + item.dataset.idx] = { cat: item.dataset.cat, idx: parseInt(item.dataset.idx) };
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        updateGalleryDelCount();
    });

    document.getElementById('galleryDeleteSelected').addEventListener('click', function() {
        var keys = Object.keys(gallerySelected);
        if (!keys.length) { alert('Select photos first.'); return; }
        if (!confirm('Delete ' + keys.length + ' selected photo(s)?')) return;

        var gallery = getData('gallery-cat', {}) || {};
        var byCat = {};
        keys.forEach(function(k) {
            var sel = gallerySelected[k];
            if (!byCat[sel.cat]) byCat[sel.cat] = [];
            byCat[sel.cat].push(sel.idx);
        });
        for (var cat in byCat) {
            if (!gallery[cat]) continue;
            byCat[cat].sort(function(a, b) { return b - a; }).forEach(function(idx) {
                gallery[cat].splice(idx, 1);
            });
        }
        setData('gallery-cat', gallery);
        exitGalleryDeleteMode();
    });
})();

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

function renderManageCats() {
    var list = document.getElementById('catsManageList');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        var c = CATEGORIES[i];
        html += '<div class="cat-manage-row" data-cat-id="' + c.id + '">' +
            '<input type="text" class="cat-manage-input" value="' + escapeHtml(c.en) + '" data-cat-id="' + c.id + '">' +
            '<button class="btn-delete cat-manage-del" data-cat-id="' + c.id + '">Delete</button>' +
        '</div>';
    }
    list.innerHTML = html;

    list.querySelectorAll('.cat-manage-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.catId;
            if (!confirm('Delete this category? Its photos will move to "Other".')) return;
            // move photos to other
            fbGetOnce('gallery-cat', function(gallery) {
                if (!gallery) gallery = {};
                if (gallery[catId] && gallery[catId].length) {
                    if (!gallery['other']) gallery['other'] = [];
                    gallery['other'] = gallery['other'].concat(gallery[catId]);
                }
                delete gallery[catId];
                setData('gallery-cat', gallery);
            });
            var cats = CATEGORIES.filter(function(c) { return c.id !== catId; });
            setData('categories', cats);
        });
    });

    list.querySelectorAll('.cat-manage-input').forEach(function(input) {
        input.addEventListener('change', function() {
            var catId = this.dataset.catId;
            var newName = this.value.trim();
            if (!newName) return;
            var cats = CATEGORIES.map(function(c) {
                if (c.id === catId) return { id: c.id, en: newName, ua: newName, ru: newName };
                return c;
            });
            setData('categories', cats);
        });
    });
}

document.getElementById('manageCatsBtn').addEventListener('click', function() {
    renderManageCats();
    document.getElementById('manageCatsModal').style.display = 'flex';
});
document.getElementById('manageCatsClose').addEventListener('click', function() {
    document.getElementById('manageCatsModal').style.display = 'none';
});
document.querySelector('#manageCatsModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('manageCatsModal').style.display = 'none';
});
document.getElementById('manageAddCatBtn').addEventListener('click', function() {
    addCategory();
});

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

var sortSelection = {};

function catLabelById(catId) {
    for (var c = 0; c < CATEGORIES.length; c++) {
        if (CATEGORIES[c].id === catId) return CATEGORIES[c].en;
    }
    return '';
}

function updateSortCount() {
    var n = Object.keys(sortSelection).length;
    document.getElementById('sortCount').textContent = n + ' selected';
    document.getElementById('sortAssign').style.display = n > 0 ? 'flex' : 'none';
}

function renderSortAssign() {
    var bar = document.getElementById('sortAssign');
    var html = '<span class="sort-assign__label">Assign to:</span>';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="sort-assign__btn" data-assign="' + CATEGORIES[i].id + '">' + escapeHtml(CATEGORIES[i].en) + '</button>';
    }
    bar.innerHTML = html;
    bar.querySelectorAll('[data-assign]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.assign;
            Object.keys(sortSelection).forEach(function(idx) {
                window._sortPhotos[idx].cat = catId;
                var item = sortGrid.querySelector('[data-sort-idx="' + idx + '"]');
                if (item) {
                    item.classList.add('sorted');
                    item.classList.remove('selected');
                    var oldBadge = item.querySelector('.sort-item__badge');
                    if (oldBadge) oldBadge.remove();
                    var badge = document.createElement('div');
                    badge.className = 'sort-item__badge';
                    badge.textContent = catLabelById(catId);
                    item.appendChild(badge);
                }
            });
            sortSelection = {};
            updateSortCount();
        });
    });
}

document.getElementById('sortPhotosBtn').addEventListener('click', function() {
    var catGallery = getData('gallery-cat', {}) || {};
    var oldPhotos = getData('gallery', []) || [];

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

    sortSelection = {};
    sortPanel.style.display = 'block';
    galleryAdminContainer.style.display = 'none';
    document.querySelector('#tab-gallery .tab-header').style.display = 'none';

    var html = '';
    for (var k = 0; k < allPhotos.length; k++) {
        var p = allPhotos[k];
        var catLabel = p.cat ? catLabelById(p.cat) : '';
        html += '<div class="sort-item' + (p.cat ? ' sorted' : '') + '" data-sort-idx="' + k + '">' +
            '<img src="' + p.src + '" alt="photo">' +
            '<div class="sort-item__check">✓</div>' +
            (catLabel ? '<div class="sort-item__badge">' + escapeHtml(catLabel) + '</div>' : '') +
        '</div>';
    }
    sortGrid.innerHTML = html;
    window._sortPhotos = allPhotos;

    renderSortAssign();
    updateSortCount();

    sortGrid.querySelectorAll('.sort-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var idx = this.dataset.sortIdx;
            if (sortSelection[idx]) {
                delete sortSelection[idx];
                this.classList.remove('selected');
            } else {
                sortSelection[idx] = true;
                this.classList.add('selected');
            }
            updateSortCount();
        });
    });
});

document.getElementById('sortSelectAll').addEventListener('click', function() {
    var items = sortGrid.querySelectorAll('.sort-item');
    var allSelected = Object.keys(sortSelection).length === items.length;
    sortSelection = {};
    items.forEach(function(item) {
        if (allSelected) {
            item.classList.remove('selected');
        } else {
            sortSelection[item.dataset.sortIdx] = true;
            item.classList.add('selected');
        }
    });
    updateSortCount();
});

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

// ===== SITE ON/OFF =====
var siteEnabledToggle = document.getElementById('siteEnabledToggle');
var siteStatusLabel = document.getElementById('siteStatusLabel');
var siteMessageInput = document.getElementById('siteMessage');

function writeSiteStatus() {
    setData('site-status', {
        enabled: siteEnabledToggle.checked,
        message: siteMessageInput.value.trim()
    });
}

if (siteEnabledToggle) {
    siteEnabledToggle.addEventListener('change', function() {
        siteStatusLabel.textContent = this.checked ? 'Website is ON' : 'Website is OFF';
        writeSiteStatus();
    });
}

var saveSiteMessageBtn = document.getElementById('saveSiteMessage');
if (saveSiteMessageBtn) {
    saveSiteMessageBtn.addEventListener('click', function() {
        writeSiteStatus();
        var b = this;
        b.textContent = 'Saved ✓';
        setTimeout(function() { b.textContent = 'Save message'; }, 2000);
    });
}

function updateSiteToggle(s) {
    if (!siteEnabledToggle) return;
    var enabled = !s || s.enabled !== false;
    siteEnabledToggle.checked = enabled;
    siteStatusLabel.textContent = enabled ? 'Website is ON' : 'Website is OFF';
    if (document.activeElement !== siteMessageInput) {
        siteMessageInput.value = (s && s.message) || '';
    }
}

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

// ===== CAKES CATALOGUE =====
var pendingCakePhoto = null;

var STANDARD_SIZES = [
    { size: '6"', serves: '6-8' },
    { size: '7"', serves: '10-13' },
    { size: '8"', serves: '15-18' },
    { size: '9"', serves: '20-25' },
    { size: '10"', serves: '30-35' },
    { size: '11"', serves: '40-45' },
    { size: '12"', serves: '50-55' }
];
function addAllStandardSizes() {
    STANDARD_SIZES.forEach(function(s) { addCakeSizeRow(s.size, s.serves, ''); });
}

function priceRange(sizes) {
    if (!sizes || !sizes.length) return 'Price on request';
    var nums = sizes.map(function(s) { return parseFloat(s.price); }).filter(function(n) { return !isNaN(n); });
    if (!nums.length) return 'Price on request';
    var min = Math.min.apply(null, nums);
    var max = Math.max.apply(null, nums);
    return min === max ? ('€' + min) : ('€' + min + ' – €' + max);
}

function catNameById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].en;
    return id || '';
}

function loadCakes() {
    var cakes = getData('products', null) || [];
    var container = document.getElementById('cakesAdmin');
    if (!container) return;

    if (cakes.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21v-8a7 7 0 0114 0v8"/><path d="M12 6V3"/></svg><p>No cakes yet</p><span>Add cakes with photo, sizes &amp; prices — they appear on the site for ordering</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < cakes.length; i++) {
        var c = cakes[i];
        var img = c.photo
            ? '<img src="' + c.photo + '" alt="' + escapeHtml(c.name) + '">'
            : '<div class="cake-admin-card__noimg"></div>';
        html += '<div class="cake-admin-card" data-idx="' + i + '">' +
            '<div class="cake-admin-card__check">✓</div>' +
            img +
            '<div class="cake-admin-card__body">' +
                '<div class="cake-admin-card__name">' + escapeHtml(c.name) + '</div>' +
                '<div class="cake-admin-card__meta">' + escapeHtml(catNameById(c.category)) + ' · ' + priceRange(c.sizes) + '</div>' +
                '<div class="cake-admin-card__actions">' +
                    '<button class="btn-edit" data-cake-edit="' + i + '">Edit</button>' +
                    '<button class="btn-delete" data-cake-del="' + i + '">Delete</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;

    if (cakeDeleteMode) {
        container.classList.add('cakes-admin--selecting');
        container.querySelectorAll('.cake-admin-card').forEach(function(card) {
            if (cakeDeleteSelected[card.dataset.idx]) card.classList.add('selected');
            card.addEventListener('click', function() {
                var idx = this.dataset.idx;
                if (cakeDeleteSelected[idx]) { delete cakeDeleteSelected[idx]; this.classList.remove('selected'); }
                else { cakeDeleteSelected[idx] = true; this.classList.add('selected'); }
                updateCakesDelCount();
            });
        });
        updateCakesDelCount();
    } else {
        container.classList.remove('cakes-admin--selecting');
        container.querySelectorAll('[data-cake-edit]').forEach(function(btn) {
            btn.addEventListener('click', function() { openCakeModal(parseInt(this.dataset.cakeEdit)); });
        });
        container.querySelectorAll('[data-cake-del]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Delete this cake?')) return;
                var cakes = getData('products', []) || [];
                cakes.splice(parseInt(this.dataset.cakeDel), 1);
                setData('products', cakes);
            });
        });
    }
}

// ===== CAKES MULTI-DELETE =====
var cakeDeleteMode = false;
var cakeDeleteSelected = {};

function updateCakesDelCount() {
    var el = document.getElementById('cakesDelCount');
    if (el) el.textContent = Object.keys(cakeDeleteSelected).length + ' selected';
}
function exitCakesDeleteMode() {
    cakeDeleteMode = false;
    cakeDeleteSelected = {};
    var bar = document.getElementById('cakesDelBar');
    if (bar) bar.style.display = 'none';
    var btn = document.getElementById('cakesMultiDeleteBtn');
    if (btn) btn.textContent = 'Select to delete';
    loadCakes();
}
(function initCakesMultiDelete() {
    var btn = document.getElementById('cakesMultiDeleteBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        if (cakeDeleteMode) { exitCakesDeleteMode(); return; }
        cakeDeleteMode = true;
        cakeDeleteSelected = {};
        this.textContent = 'Cancel selection';
        document.getElementById('cakesDelBar').style.display = 'flex';
        loadCakes();
    });
    document.getElementById('cakesDelCancel').addEventListener('click', exitCakesDeleteMode);
    document.getElementById('cakesSelectAllDel').addEventListener('click', function() {
        var cards = document.querySelectorAll('#cakesAdmin .cake-admin-card');
        var allSel = cards.length > 0 && Object.keys(cakeDeleteSelected).length === cards.length;
        cakeDeleteSelected = {};
        cards.forEach(function(card) {
            if (allSel) card.classList.remove('selected');
            else { cakeDeleteSelected[card.dataset.idx] = true; card.classList.add('selected'); }
        });
        updateCakesDelCount();
    });
    document.getElementById('cakesDeleteSelected').addEventListener('click', function() {
        var keys = Object.keys(cakeDeleteSelected).map(Number);
        if (!keys.length) { alert('Select cakes first.'); return; }
        if (!confirm('Delete ' + keys.length + ' selected cake(s)?')) return;
        var cakes = getData('products', []) || [];
        keys.sort(function(a, b) { return b - a; }).forEach(function(idx) { cakes.splice(idx, 1); });
        setData('products', cakes);
        exitCakesDeleteMode();
    });
})();

function populateCakeCategorySelect(selected) {
    var sel = document.getElementById('cakeCategory');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<option value="' + CATEGORIES[i].id + '"' + (CATEGORIES[i].id === selected ? ' selected' : '') + '>' + escapeHtml(CATEGORIES[i].en) + '</option>';
    }
    sel.innerHTML = html;
}

var cakeSelectedFlavours = [];

function renderCakeFlavoursSelected() {
    var box = document.getElementById('cakeFlavoursSelected');
    var txt = document.getElementById('cakeFlavourText');
    if (cakeSelectedFlavours.length) {
        txt.textContent = cakeSelectedFlavours.length + ' flavour' + (cakeSelectedFlavours.length > 1 ? 's' : '') + ' selected';
        box.innerHTML = cakeSelectedFlavours.map(function(n) {
            return '<span class="flavour-chip">' + escapeHtml(n) + '<button type="button" class="flavour-chip__x" data-rm="' + escapeHtml(n) + '">&times;</button></span>';
        }).join('');
        box.querySelectorAll('[data-rm]').forEach(function(b) {
            b.addEventListener('click', function() {
                var n = this.getAttribute('data-rm');
                cakeSelectedFlavours = cakeSelectedFlavours.filter(function(x) { return x !== n; });
                renderCakeFlavoursSelected();
            });
        });
    } else {
        txt.textContent = 'Choose flavours';
        box.innerHTML = '';
    }
}

function openCakeFlavourModal() {
    var flavours = getData('flavours', null) || DEFAULT_FLAVOURS;
    var grid = document.getElementById('cakeFlavourGrid');
    if (!flavours.length) {
        grid.innerHTML = '<p class="content-hint">No flavours yet. Add them in the Flavours tab first.</p>';
    } else {
        grid.innerHTML = flavours.map(function(f) {
            var sel = cakeSelectedFlavours.indexOf(f.name) > -1;
            var img = f.photo
                ? '<img src="' + f.photo + '" class="flavour-pick-card__img" alt="">'
                : '<div class="flavour-pick-card__ph"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
            return '<div class="flavour-pick-card' + (sel ? ' selected' : '') + '" data-flavour="' + escapeHtml(f.name) + '">' +
                '<div class="flavour-pick-card__check">&#10003;</div>' +
                img +
                '<div class="flavour-pick-card__name">' + escapeHtml(f.name) + '</div>' +
                (f.price ? '<div class="flavour-pick-card__price">€' + escapeHtml(f.price) + ' / kg</div>' : '') +
            '</div>';
        }).join('');
        grid.querySelectorAll('.flavour-pick-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var n = this.dataset.flavour;
                if (cakeSelectedFlavours.indexOf(n) > -1) {
                    cakeSelectedFlavours = cakeSelectedFlavours.filter(function(x) { return x !== n; });
                    this.classList.remove('selected');
                } else {
                    cakeSelectedFlavours.push(n);
                    this.classList.add('selected');
                }
            });
        });
    }
    document.getElementById('cakeFlavourModal').style.display = 'flex';
}

function addCakeSizeRow(size, serves, price) {
    var wrap = document.getElementById('cakeSizesRows');
    var row = document.createElement('div');
    row.className = 'cake-size-row';
    row.innerHTML =
        '<input type="text" class="cs-size" placeholder="Size (e.g. 6&quot;)" value="' + escapeHtml(size || '') + '">' +
        '<input type="text" class="cs-serves" placeholder="Serves (e.g. 6-8)" value="' + escapeHtml(serves || '') + '">' +
        '<input type="number" class="cs-price" placeholder="€" min="0" step="0.5" value="' + (price != null ? escapeHtml(String(price)) : '') + '">' +
        '<button type="button" class="cake-size-row__del" aria-label="Remove">&times;</button>';
    row.querySelector('.cake-size-row__del').addEventListener('click', function() { row.remove(); });
    wrap.appendChild(row);
}

function openCakeModal(editId) {
    var cakes = getData('products', []) || [];
    document.getElementById('cakeSizesRows').innerHTML = '';
    pendingCakePhoto = null;

    if (editId != null && cakes[editId]) {
        var c = cakes[editId];
        document.getElementById('cakeModalTitle').textContent = 'Edit Cake';
        document.getElementById('cakeEditId').value = editId;
        document.getElementById('cakeName').value = c.name || '';
        document.getElementById('cakeDesc').value = c.desc || '';
        document.getElementById('cakeNotice').value = (c.noticeDays != null ? c.noticeDays : 3);
        populateCakeCategorySelect(c.category);
        cakeSelectedFlavours = (c.flavours || []).slice();
        renderCakeFlavoursSelected();
        pendingCakePhoto = c.photo || null;
        document.getElementById('cakePhotoPreview').innerHTML = c.photo ? '<img src="' + c.photo + '" style="max-width:140px;border-radius:8px;">' : '';
        var sizes = c.sizes || [];
        if (!sizes.length) addCakeSizeRow('', '', '');
        else sizes.forEach(function(s) { addCakeSizeRow(s.size, s.serves, s.price); });
    } else {
        document.getElementById('cakeModalTitle').textContent = 'Add Cake';
        document.getElementById('cakeEditId').value = '';
        document.getElementById('cakeName').value = '';
        document.getElementById('cakeDesc').value = '';
        document.getElementById('cakeNotice').value = 3;
        populateCakeCategorySelect('');
        cakeSelectedFlavours = [];
        renderCakeFlavoursSelected();
        document.getElementById('cakePhotoPreview').innerHTML = '';
        addAllStandardSizes();
    }
    document.getElementById('cakeModal').style.display = 'flex';
}

document.getElementById('addCakeBtn').addEventListener('click', function() { openCakeModal(null); });
document.getElementById('cakeCancel').addEventListener('click', function() { document.getElementById('cakeModal').style.display = 'none'; });
document.querySelector('#cakeModal .modal__overlay').addEventListener('click', function() { document.getElementById('cakeModal').style.display = 'none'; });
document.getElementById('addSizeRowBtn').addEventListener('click', function() { addCakeSizeRow('', '', ''); });
document.getElementById('addAllSizesBtn').addEventListener('click', function() { addAllStandardSizes(); });

document.getElementById('cakeFlavourBtn').addEventListener('click', openCakeFlavourModal);
document.getElementById('cakeFlavourDone').addEventListener('click', function() {
    document.getElementById('cakeFlavourModal').style.display = 'none';
    renderCakeFlavoursSelected();
});
document.querySelector('#cakeFlavourModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('cakeFlavourModal').style.display = 'none';
    renderCakeFlavoursSelected();
});

document.getElementById('cakeNewCatBtn').addEventListener('click', function() {
    addCategory(function(newId) {
        CATEGORIES = getData('categories', CATEGORIES);
        populateCakeCategorySelect(newId);
    });
});

document.getElementById('cakePhoto').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 900, 0.75, function(dataUrl) {
        pendingCakePhoto = dataUrl;
        document.getElementById('cakePhotoPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:140px;border-radius:8px;">';
    });
});

document.getElementById('cakeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var sizes = [];
    document.querySelectorAll('#cakeSizesRows .cake-size-row').forEach(function(row) {
        var size = row.querySelector('.cs-size').value.trim();
        var serves = row.querySelector('.cs-serves').value.trim();
        var price = row.querySelector('.cs-price').value.trim();
        if (size || price) sizes.push({ size: size, serves: serves, price: price });
    });
    var flavours = cakeSelectedFlavours.slice();

    var cake = {
        name: document.getElementById('cakeName').value.trim(),
        category: document.getElementById('cakeCategory').value,
        desc: document.getElementById('cakeDesc').value.trim(),
        photo: pendingCakePhoto || null,
        sizes: sizes,
        flavours: flavours,
        noticeDays: parseInt(document.getElementById('cakeNotice').value) || 0
    };

    var cakes = getData('products', []) || [];
    var editId = document.getElementById('cakeEditId').value;
    if (editId !== '') cakes[parseInt(editId)] = cake;
    else cakes.push(cake);
    setData('products', cakes);
    document.getElementById('cakeModal').style.display = 'none';
});

// ===== CAKES SORT BY CATEGORY =====
var cakeSortSelection = {};

function updateCakeSortCount() {
    var n = Object.keys(cakeSortSelection).length;
    document.getElementById('cakesSortCount').textContent = n + ' selected';
    document.getElementById('cakesSortAssign').style.display = n > 0 ? 'flex' : 'none';
}

function renderCakeSortAssign() {
    var bar = document.getElementById('cakesSortAssign');
    var html = '<span class="sort-assign__label">Assign to:</span>';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="sort-assign__btn" data-assign="' + CATEGORIES[i].id + '">' + escapeHtml(CATEGORIES[i].en) + '</button>';
    }
    bar.innerHTML = html;
    bar.querySelectorAll('[data-assign]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.assign;
            Object.keys(cakeSortSelection).forEach(function(idx) {
                window._cakeSortItems[idx].category = catId;
                var item = document.querySelector('#cakesSortGrid [data-sort-idx="' + idx + '"]');
                if (item) {
                    item.classList.remove('selected');
                    var badge = item.querySelector('.sort-item__badge');
                    if (badge) badge.textContent = catNameById(catId);
                }
            });
            cakeSortSelection = {};
            updateCakeSortCount();
        });
    });
}

document.getElementById('cakesSortBtn').addEventListener('click', function() {
    var cakes = (getData('products', []) || []).map(function(c) { return Object.assign({}, c); });
    if (!cakes.length) { alert('No cakes to sort. Add some first!'); return; }
    window._cakeSortItems = cakes;
    cakeSortSelection = {};

    document.getElementById('cakesSortPanel').style.display = 'block';
    document.getElementById('cakesAdmin').style.display = 'none';
    document.querySelector('#tab-cakes .tab-header').style.display = 'none';

    var html = '';
    for (var k = 0; k < cakes.length; k++) {
        var c = cakes[k];
        var img = c.photo ? '<img src="' + c.photo + '" alt="">' : '<div class="cake-admin-card__noimg" style="height:100%"></div>';
        html += '<div class="sort-item sorted" data-sort-idx="' + k + '">' + img +
            '<div class="sort-item__check">✓</div>' +
            '<div class="sort-item__badge">' + escapeHtml(catNameById(c.category)) + '</div>' +
        '</div>';
    }
    var grid = document.getElementById('cakesSortGrid');
    grid.innerHTML = html;
    renderCakeSortAssign();
    updateCakeSortCount();

    grid.querySelectorAll('.sort-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var idx = this.dataset.sortIdx;
            if (cakeSortSelection[idx]) { delete cakeSortSelection[idx]; this.classList.remove('selected'); }
            else { cakeSortSelection[idx] = true; this.classList.add('selected'); }
            updateCakeSortCount();
        });
    });
});

document.getElementById('cakesSortSelectAll').addEventListener('click', function() {
    var items = document.querySelectorAll('#cakesSortGrid .sort-item');
    var allSel = items.length > 0 && Object.keys(cakeSortSelection).length === items.length;
    cakeSortSelection = {};
    items.forEach(function(item) {
        if (allSel) item.classList.remove('selected');
        else { cakeSortSelection[item.dataset.sortIdx] = true; item.classList.add('selected'); }
    });
    updateCakeSortCount();
});

document.getElementById('cakesSortDone').addEventListener('click', function() {
    setData('products', window._cakeSortItems || []);
    document.getElementById('cakesSortPanel').style.display = 'none';
    document.getElementById('cakesAdmin').style.display = '';
    document.querySelector('#tab-cakes .tab-header').style.display = '';
    loadCakes();
});

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
        loadCakes();
        var mcm = document.getElementById('manageCatsModal');
        if (mcm && mcm.style.display === 'flex') renderManageCats();
    });
    listenData('orders', function() { loadOrders(); });
    listenData('products', function() { loadCakes(); });
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
    listenData('site-status', function(s) { updateSiteToggle(s); });
}

// ===== INIT =====
checkAuth();
