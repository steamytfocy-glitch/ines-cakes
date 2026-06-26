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
