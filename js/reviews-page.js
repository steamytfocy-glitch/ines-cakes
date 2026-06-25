var translations = {
    en: {
        "revpage.back": "Back to Home",
        "revpage.title": "All Reviews",
        "revpage.subtitle": "What our customers say about us",
        "reviews.write": "Write a Review",
        "reviews.formTitle": "Leave Your Review",
        "reviews.yourName": "Your Name",
        "reviews.rating": "Rating",
        "reviews.yourReview": "Your Review",
        "reviews.reviewPh": "Tell us about your experience...",
        "reviews.submit": "Send Review",
        "reviews.thanks": "Thank you! Your review has been submitted.",
        "reviews.photo": "Add a photo (optional)"
    },
    ua: {
        "revpage.back": "На головну",
        "revpage.title": "Усі відгуки",
        "revpage.subtitle": "Що кажуть наші клієнти про нас",
        "reviews.write": "Написати відгук",
        "reviews.formTitle": "Залиште ваш відгук",
        "reviews.yourName": "Ваше ім'я",
        "reviews.rating": "Оцінка",
        "reviews.yourReview": "Ваш відгук",
        "reviews.reviewPh": "Розкажіть про ваш досвід...",
        "reviews.submit": "Надіслати відгук",
        "reviews.thanks": "Дякуємо! Ваш відгук надіслано.",
        "reviews.photo": "Додати фото (необов'язково)"
    },
    ru: {
        "revpage.back": "На главную",
        "revpage.title": "Все отзывы",
        "revpage.subtitle": "Что говорят наши клиенты о нас",
        "reviews.write": "Написать отзыв",
        "reviews.formTitle": "Оставьте ваш отзыв",
        "reviews.yourName": "Ваше имя",
        "reviews.rating": "Оценка",
        "reviews.yourReview": "Ваш отзыв",
        "reviews.reviewPh": "Расскажите о вашем опыте...",
        "reviews.submit": "Отправить отзыв",
        "reviews.thanks": "Спасибо! Ваш отзыв отправлен.",
        "reviews.photo": "Добавить фото (необязательно)"
    }
};

var currentLang = 'en';

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
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
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

// Compress an image file to a base64 data URL via canvas
function compressReviewImage(file, maxSize, quality, cb) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var w = img.width, h = img.height;
            if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; } }
            else { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; } }
            var canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            cb(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

var pendingReviewPhoto = null;

function loadAllReviews() {
    fbGet('reviews', function(reviews) {
        if (!reviews) reviews = [];
        var grid = document.getElementById('allReviewsGrid');

        if (reviews.length === 0) {
            var emptyTexts = {
                en: 'No reviews yet. Be the first!',
                ua: 'Відгуків поки немає. Будьте першими!',
                ru: 'Отзывов пока нет. Будьте первыми!'
            };
            grid.innerHTML = '<div class="reviews-page__empty"><p>' + (emptyTexts[currentLang] || emptyTexts.en) + '</p></div>';
            return;
        }

        var html = '';
        for (var i = reviews.length - 1; i >= 0; i--) {
            var r = reviews[i];
            var stars = '';
            for (var s = 0; s < (r.rating || 5); s++) stars += '★';
            html += '<div class="review-card review-card--deletable">' +
                '<button class="review-card__delete" data-rev-del="' + i + '" title="Delete">&times;</button>' +
                '<div class="review-card__stars">' + stars + '</div>' +
                (r.photo ? '<img class="review-card__photo" src="' + r.photo + '" alt="" loading="lazy">' : '') +
                '<p class="review-card__text">"' + escapeHtml(r.text) + '"</p>' +
                '<p class="review-card__author">- ' + escapeHtml(r.author) + '</p>' +
            '</div>';
        }
        grid.innerHTML = html;

        grid.querySelectorAll('[data-rev-del]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Delete this review?')) return;
                var idx = parseInt(this.dataset.revDel);
                fbGetOnce('reviews', function(reviews) {
                    if (!reviews) reviews = [];
                    reviews.splice(idx, 1);
                    fbSet('reviews', reviews);
                });
            });
        });
    });
}

// Star picker
var starPicker = document.getElementById('starPicker');
var revRating = document.getElementById('revRating');
starPicker.querySelectorAll('.star-pick').forEach(function(star) {
    star.addEventListener('click', function() {
        var val = parseInt(this.dataset.star);
        revRating.value = val;
        starPicker.querySelectorAll('.star-pick').forEach(function(s) {
            s.classList.toggle('active', parseInt(s.dataset.star) <= val);
        });
    });
});

// Write review toggle
document.getElementById('writeReviewBtn').addEventListener('click', function() {
    var wrap = document.getElementById('reviewFormWrap');
    wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
});

// Photo upload
document.getElementById('revPhoto').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) { pendingReviewPhoto = null; document.getElementById('revPhotoPreview').innerHTML = ''; return; }
    compressReviewImage(file, 900, 0.75, function(dataUrl) {
        pendingReviewPhoto = dataUrl;
        document.getElementById('revPhotoPreview').innerHTML =
            '<img src="' + dataUrl + '" alt=""><button type="button" class="review-photo-preview__x" id="revPhotoRemove">&times;</button>';
        document.getElementById('revPhotoRemove').addEventListener('click', function() {
            pendingReviewPhoto = null;
            document.getElementById('revPhoto').value = '';
            document.getElementById('revPhotoPreview').innerHTML = '';
        });
    });
});

// Submit review
document.getElementById('clientReviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var review = {
        author: document.getElementById('revName').value.trim(),
        rating: parseInt(revRating.value),
        text: document.getElementById('revText').value.trim(),
        photo: pendingReviewPhoto || null,
        fromClient: true
    };
    fbGetOnce('reviews', function(reviews) {
        if (!reviews) reviews = [];
        reviews.push(review);
        fbSet('reviews', reviews);
    });

    this.style.display = 'none';
    document.getElementById('reviewSuccess').style.display = 'block';
    var form = this;
    setTimeout(function() {
        form.style.display = '';
        document.getElementById('reviewSuccess').style.display = 'none';
        document.getElementById('reviewFormWrap').style.display = 'none';
        form.reset();
        pendingReviewPhoto = null;
        document.getElementById('revPhotoPreview').innerHTML = '';
        starPicker.querySelectorAll('.star-pick').forEach(function(s) { s.classList.add('active'); });
        revRating.value = '5';
        loadAllReviews();
    }, 3000);
});

function safeUrl(u) {
    u = (u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
}

// Google reviews call-to-action - appears once the admin adds the Google links.
function loadGoogleReviews() {
    var box = document.getElementById('googleReviews');
    if (!box) return;
    fbGet('content', function(content) {
        var review = safeUrl(content && content.googleReviewUrl);
        var profile = safeUrl(content && content.googleProfileUrl);
        if (!review && !profile) { box.style.display = 'none'; return; }
        var html = '<div class="google-cta__head"><span class="google-cta__stars">★★★★★</span><span>Reviews on Google</span></div>' +
            '<div class="google-cta__btns">';
        if (review) html += '<a class="btn btn--primary" href="' + escapeHtml(review) + '" target="_blank" rel="noopener">⭐ Review us on Google</a>';
        if (profile) html += '<a class="btn btn--outline" href="' + escapeHtml(profile) + '" target="_blank" rel="noopener">Read our Google reviews</a>';
        html += '</div>';
        box.innerHTML = html;
        box.style.display = 'block';
    });
}

setLang(currentLang);
loadAllReviews();
loadGoogleReviews();

// Auto-open the review form when arriving from the "Write a Review" button
(function() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('write') !== '1') return;
    var wrap = document.getElementById('reviewFormWrap');
    if (wrap) {
        wrap.style.display = 'block';
        setTimeout(function() { wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
    }
})();
