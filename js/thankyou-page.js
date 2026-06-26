var translations = {
    ga: {
        "ty.title": "Go raibh maith agat!",
        "ty.text": "Fuarthas d'ordú. Déanfaimid teagmháil leat go luath chun na sonraí a phlé.",
        "ty.or": "Nó déan teagmháil linn go díreach:",
        "ty.home": "Ar ais Abhaile",
        "ty.codeLabel": "Uimhir d'ordaithe",
        "ty.codeHint": "Coinnigh an uimhir seo. Úsáid í chun stádas d'ordaithe a sheiceáil am ar bith.",
        "ty.track": "Rianaigh m'ordú",
        "ty.spam": "📧 Má thug tú do ríomhphost, sheolamar deimhniú. Gan é a fheiceáil? Seiceáil d'fhillteán Turscair."
    },
    en: {
        "ty.title": "Thank you!",
        "ty.text": "Your order has been received. We'll contact you soon to discuss all the details.",
        "ty.or": "Or contact us directly:",
        "ty.home": "Back to Home",
        "ty.codeLabel": "Your order number",
        "ty.codeHint": "Save this number. Use it to check your order status at any time.",
        "ty.track": "Track my order",
        "ty.spam": "📧 If you gave your email, we've sent a confirmation. Don't see it? Please check your Spam folder."
    },
    ua: {
        "ty.title": "Дякуємо!",
        "ty.text": "Ваше замовлення отримано. Ми зв'яжемося з вами найближчим часом для обговорення деталей.",
        "ty.or": "Або зв'яжіться з нами напряму:",
        "ty.home": "На головну",
        "ty.codeLabel": "Номер вашого замовлення",
        "ty.codeHint": "Збережіть цей номер. За ним ви будь-коли зможете перевірити статус замовлення.",
        "ty.track": "Відстежити замовлення",
        "ty.spam": "📧 Якщо ви вказали пошту, ми надіслали підтвердження. Не бачите? Перевірте папку «Спам»."
    },
    ru: {
        "ty.title": "Спасибо!",
        "ty.text": "Ваш заказ получен. Мы свяжемся с вами в ближайшее время для обсуждения деталей.",
        "ty.or": "Или свяжитесь с нами напрямую:",
        "ty.home": "На главную",
        "ty.codeLabel": "Номер вашего заказа",
        "ty.codeHint": "Сохраните этот номер. По нему вы в любой момент сможете проверить статус заказа.",
        "ty.track": "Отследить заказ",
        "ty.spam": "📧 Если вы указали почту, мы отправили подтверждение. Не видите? Проверьте папку «Спам»."
    }
};

var currentLang = (function(l){ return (l === 'ga' || l === 'ua' || l === 'ru') ? l : 'en'; })(localStorage.getItem('ines-lang'));

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

// Show order code + track link if present in URL
(function() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');
    if (!code) return;
    var box = document.getElementById('tyCodeBox');
    document.getElementById('tyCodeValue').textContent = code;
    document.getElementById('tyTrackBtn').href = 'order?code=' + encodeURIComponent(code);
    box.style.display = 'block';

    // remember this order on the device for "My Orders"
    try {
        var mine = JSON.parse(localStorage.getItem('ines-my-orders')) || [];
        if (!mine.some(function(m) { return m.code === code; })) {
            mine.push({ code: code, when: Date.now() });
            localStorage.setItem('ines-my-orders', JSON.stringify(mine));
        }
    } catch (e) {}
})();

// Social links from Firebase content
fbGet('content', function(content) {
    if (!content) return;
    var insta = document.getElementById('successInsta');
    var fb = document.getElementById('successFacebook');
    if (insta && content.contactInsta) insta.href = content.contactInsta;
    if (fb && content.contactFacebook) fb.href = content.contactFacebook;
});

setLang(currentLang);
