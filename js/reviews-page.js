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
        "reviews.thanks": "Thank you! Your review has been submitted."
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
        "reviews.thanks": "Дякуємо! Ваш відгук надіслано."
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
        "reviews.thanks": "Спасибо! Ваш отзыв отправлен."
    }
};

var currentLang = localStorage.getItem('ines-lang') || 'en';

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
                '<p class="review-card__text">"' + escapeHtml(r.text) + '"</p>' +
                '<p class="review-card__author">— ' + escapeHtml(r.author) + '</p>' +
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

// Submit review
document.getElementById('clientReviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var review = {
        author: document.getElementById('revName').value.trim(),
        rating: parseInt(revRating.value),
        text: document.getElementById('revText').value.trim(),
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
        starPicker.querySelectorAll('.star-pick').forEach(function(s) { s.classList.add('active'); });
        revRating.value = '5';
        loadAllReviews();
    }, 3000);
});

setLang(currentLang);
loadAllReviews();
