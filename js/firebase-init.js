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

function fbGet(path, callback) {
    db.ref(path).on('value', function(snapshot) {
        callback(snapshot.val());
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
