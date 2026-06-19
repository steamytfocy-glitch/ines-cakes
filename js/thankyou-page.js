var translations = {
    en: {
        "ty.title": "Thank you!",
        "ty.text": "Your order has been received. We'll contact you soon to discuss all the details.",
        "ty.or": "Or contact us directly:",
        "ty.home": "Back to Home"
    },
    ua: {
        "ty.title": "Дякуємо!",
        "ty.text": "Ваше замовлення отримано. Ми зв'яжемося з вами найближчим часом для обговорення деталей.",
        "ty.or": "Або зв'яжіться з нами напряму:",
        "ty.home": "На головну"
    },
    ru: {
        "ty.title": "Спасибо!",
        "ty.text": "Ваш заказ получен. Мы свяжемся с вами в ближайшее время для обсуждения деталей.",
        "ty.or": "Или свяжитесь с нами напрямую:",
        "ty.home": "На главную"
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
}

document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

// Social links from Firebase content
fbGet('content', function(content) {
    if (!content) return;
    var insta = document.getElementById('successInsta');
    var fb = document.getElementById('successFacebook');
    if (insta && content.contactInsta) insta.href = content.contactInsta;
    if (fb && content.contactFacebook) fb.href = content.contactFacebook;
});

setLang(currentLang);
