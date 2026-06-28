var firebaseConfig = {
    apiKey: "AIzaSyAlJcFO1wTlpuPVLSsIF21axGuy3Cal94U",
    authDomain: "ines-cakes.firebaseapp.com",
    databaseURL: "https://ines-cakes-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ines-cakes",
    storageBucket: "ines-cakes.firebasestorage.app",
    messagingSenderId: "729941440963",
    appId: "1:729941440963:web:f6e5fa9941f5feacf46576"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// Track in-flight initial reads so callers can act once all data has loaded.
var _fbPending = 0;
var _fbIdleCbs = [];
function fbOnIdle(cb) {
    if (_fbPending <= 0) { cb(); return; }
    _fbIdleCbs.push(cb);
}
function _fbCheckIdle() {
    if (_fbPending <= 0 && _fbIdleCbs.length) {
        var cbs = _fbIdleCbs;
        _fbIdleCbs = [];
        cbs.forEach(function(c) { c(); });
    }
}

function fbGet(path, callback) {
    var counted = true;
    _fbPending++;
    db.ref(path).on('value', function(snapshot) {
        // Run the caller first - it may start nested reads - then settle the
        // counter, so it never momentarily hits zero between chained reads.
        callback(snapshot.val());
        if (counted) { counted = false; _fbPending--; _fbCheckIdle(); }
    });
}

function fbGetOnce(path, callback) {
    db.ref(path).once('value').then(function(snapshot) {
        callback(snapshot.val());
    });
}

// Instant render: serve the last value from localStorage immediately (so the
// page paints with no network wait), then refresh from Firebase. The callback
// must be safe to run more than once (idempotent re-render).
function fbGetCached(path, callback) {
    var key = 'ines-cache-' + path;
    try {
        var cached = localStorage.getItem(key);
        if (cached) callback(JSON.parse(cached));
    } catch (e) {}
    fbGet(path, function(data) {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
        callback(data);
    });
}

function fbSet(path, data, callback) {
    db.ref(path).set(data).then(function() {
        if (callback) callback(true);
    }).catch(function(err) {
        console.error('Firebase write error:', err);
        alert('Error saving data. Please try again.');
        if (callback) callback(false);
    });
}

// Append a new child under path (auto-generated key). Returns the new key.
function fbPush(path, data, callback) {
    var ref = db.ref(path).push();
    ref.set(data).then(function() {
        if (callback) callback(ref.key);
    }).catch(function(err) {
        console.error('Firebase push error:', err);
        if (callback) callback(null);
    });
    return ref.key;
}

// Update only the given fields at path (does not overwrite siblings).
function fbUpdate(path, data, callback) {
    db.ref(path).update(data).then(function() {
        if (callback) callback(true);
    }).catch(function(err) {
        console.error('Firebase update error:', err);
        if (callback) callback(false);
    });
}

// Delete the node at path.
function fbRemove(path, callback) {
    db.ref(path).remove().then(function() {
        if (callback) callback(true);
    }).catch(function(err) {
        console.error('Firebase remove error:', err);
        if (callback) callback(false);
    });
}

// --- Admin preview bypass ---------------------------------------------------
// When the site is switched OFF, the maintenance screen hides it from the
// public. An admin who has signed in to /admin in this browser keeps a local
// flag (set in admin.js), so they can still browse the live site to check it.
// This is a convenience flag, not a security boundary - all data stays
// protected by the Firebase security rules regardless.
function inesIsAdmin() {
    try { return localStorage.getItem('ines-admin') === '1'; } catch (e) { return false; }
}

// Small fixed bar shown to an admin who is viewing the site while it is OFF.
function inesAdminBanner(show) {
    var id = 'inesAdminBanner';
    var el = document.getElementById(id);
    if (!show) { if (el) el.remove(); return; }
    if (el) return;
    var l = localStorage.getItem('ines-lang');
    l = (l === 'ga' || l === 'ua' || l === 'ru') ? l : 'en';
    var T = {
        en: 'Site is OFF for visitors — you are viewing it as admin',
        ga: 'Tá an suíomh DÚNTA do chuairteoirí — tá tú á fheiceáil mar riarthóir',
        ua: 'Сайт ВИМКНЕНО для відвідувачів — ви переглядаєте його як адмін',
        ru: 'Сайт ВЫКЛЮЧЕН для посетителей — вы смотрите как админ'
    };
    el = document.createElement('div');
    el.id = id;
    el.textContent = T[l] || T.en;
    el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#3D2E1C;color:#fff;' +
        'font:600 13px Montserrat,system-ui,sans-serif;text-align:center;padding:8px 12px;letter-spacing:.3px;';
    document.body.appendChild(el);
}
