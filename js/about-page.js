// About page: loads the food-safety certificates and the footer social links.

var currentLang = (localStorage.getItem('ines-lang') === 'ga') ? 'ga' : 'en';
var translations = {
    ga: {
        "ab.back": "Ar ais Abhaile",
        "ab.title": "Fúinn",
        "ab.p1": "Fáilte go I.N.E.S. - bácús baile i gcroílár Dhún na nGall, Éire. Déantar gach cáca a chruthaímid le paisean, ag úsáid comhábhair nádúrtha ardchaighdeáin amháin.",
        "ab.p2": "Creidimid gur mó ná milseog é cáca - is é croílár do cheiliúrtha é. Lá breithe, bainis, comóradh, nó díreach féirín milis Dé hAoine - déanfaimid speisialta é.",
        "ab.p3": "Bácáiltear gach cáca úr ar ordú. Cuirimid raon leathan blasanna agus dearaí ar fáil - ó ghalántacht chlasaiceach go cruthúcháin shaincheaptha bunaithe ar do smaointe.",
        "ab.f1t": "Comhábhair Nádúrtha", "ab.f1x": "Na táirgí nádúrtha is fearr amháin - gan dathúcháin ná leasaithigh shaorga",
        "ab.f2t": "Bácáilte Úr", "ab.f2x": "Déantar gach cáca úr - bácáilimid ar ordú, riamh roimh ré",
        "ab.f3t": "Do Dhearadh", "ab.f3x": "Seol chugainn do smaoineamh nó do ghrianghraf - tabharfaimid beo é i bhfoirm cáca",
        "ab.certTitle": "Teastais", "ab.certSub": "Cáilíocht agus sábháilteacht ar féidir muinín a bheith agat astu",
        "ftr.contacts": "Teagmháil", "ftr.hours": "Uaireanta Bhothán na gCácaí", "ftr.schedule": "Aoine - Domhnach",
        "ftr.pickup": "Bailiú & seachadadh trí shocrú", "ftr.track": "Mo orduithe"
    },
    en: {
        "ab.back": "Back to Home", "ab.title": "About Us",
        "ab.p1": "Welcome to I.N.E.S. - a home bakery in the heart of Donegal, Ireland. Every cake we create is made with passion, using only natural and high-quality ingredients.",
        "ab.p2": "We believe that a cake is more than just a dessert - it's the centrepiece of your celebration. Whether it's a birthday, wedding, anniversary, or just a sweet Friday treat, we'll make it special.",
        "ab.p3": "All cakes are baked fresh to order. We offer a wide range of flavours and designs - from classic elegance to bold custom creations based on your ideas.",
        "ab.f1t": "Natural Ingredients", "ab.f1x": "Only the finest natural products - no artificial colours or preservatives",
        "ab.f2t": "Freshly Baked", "ab.f2x": "Every cake is made fresh - we bake to order, never in advance",
        "ab.f3t": "Your Design", "ab.f3x": "Send us your idea or photo - we'll bring it to life in cake form",
        "ab.certTitle": "Certificates", "ab.certSub": "Quality and safety you can trust",
        "ftr.contacts": "Contacts", "ftr.hours": "Cake Shed Hours", "ftr.schedule": "Friday - Sunday",
        "ftr.pickup": "Collection & delivery by arrangement", "ftr.track": "My orders"
    },
    ua: {
        "ab.back": "На головну",
        "ab.title": "Про нас",
        "ab.p1": "Ласкаво просимо до I.N.E.S. - домашньої кондитерської в самому серці Донеголу, Ірландія. Кожен торт ми створюємо з любов'ю, використовуючи лише натуральні та якісні інгредієнти.",
        "ab.p2": "Ми віримо, що торт - це більше, ніж десерт: це окраса вашого свята. День народження, весілля, річниця чи просто солодка п'ятниця - ми зробимо це особливим.",
        "ab.p3": "Усі торти випікаються свіжими на замовлення. Ми пропонуємо широкий вибір смаків та дизайнів - від класичної елегантності до сміливих авторських ідей за вашим задумом.",
        "ab.f1t": "Натуральні інгредієнти", "ab.f1x": "Тільки найкращі натуральні продукти - без штучних барвників та консервантів",
        "ab.f2t": "Свіжа випічка", "ab.f2x": "Кожен торт готується свіжим - ми печемо на замовлення, ніколи заздалегідь",
        "ab.f3t": "Ваш дизайн", "ab.f3x": "Надішліть вашу ідею чи фото - втілимо її в торті",
        "ab.certTitle": "Сертифікати", "ab.certSub": "Якість та безпека, яким можна довіряти",
        "ftr.contacts": "Контакти", "ftr.hours": "Години роботи Cake Shed", "ftr.schedule": "П'ятниця - Неділя",
        "ftr.pickup": "Самовивіз та доставка за домовленістю", "ftr.track": "Мої замовлення"
    },
    ru: {
        "ab.back": "На главную",
        "ab.title": "О нас",
        "ab.p1": "Добро пожаловать в I.N.E.S. - домашнюю кондитерскую в самом сердце Донегола, Ирландия. Каждый торт мы создаём с любовью, используя только натуральные и качественные ингредиенты.",
        "ab.p2": "Мы верим, что торт - это больше, чем десерт: это украшение вашего праздника. День рождения, свадьба, годовщина или просто сладкая пятница - мы сделаем это особенным.",
        "ab.p3": "Все торты выпекаются свежими на заказ. Мы предлагаем широкий выбор вкусов и дизайнов - от классической элегантности до смелых авторских идей по вашему замыслу.",
        "ab.f1t": "Натуральные ингредиенты", "ab.f1x": "Только лучшие натуральные продукты - без искусственных красителей и консервантов",
        "ab.f2t": "Свежая выпечка", "ab.f2x": "Каждый торт готовится свежим - мы печём на заказ, никогда заранее",
        "ab.f3t": "Ваш дизайн", "ab.f3x": "Пришлите вашу идею или фото - воплотим её в торте",
        "ab.certTitle": "Сертификаты", "ab.certSub": "Качество и безопасность, которым можно доверять",
        "ftr.contacts": "Контакты", "ftr.hours": "Часы работы Cake Shed", "ftr.schedule": "Пятница - Воскресенье",
        "ftr.pickup": "Самовывоз и доставка по договорённости", "ftr.track": "Мои заказы"
    }
};
function t(k) { var tr = translations[currentLang] || translations.en; return tr[k] || translations.en[k] || k; }
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) { var v = t(el.getAttribute('data-i18n')); if (v) el.innerHTML = v; });
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === currentLang); });
}
function setLang(lang) { currentLang = lang; localStorage.setItem('ines-lang', lang); applyI18n(); }
document.querySelectorAll('.lang-btn').forEach(function(btn) { btn.addEventListener('click', function() { setLang(this.dataset.lang); }); });

function certFront(c) { return (typeof c === 'string') ? c : (c && c.front); }
function certBack(c) { return (typeof c === 'string') ? null : (c && c.back); }

function openCertLightbox(cert) {
    var front = certFront(cert);
    var back = certBack(cert);
    var showingBack = false;

    var lb = document.createElement('div');
    lb.className = 'cert-lightbox';
    var inner = document.createElement('div');
    inner.className = 'cert-lightbox__inner';

    var img = document.createElement('img');
    img.src = front;
    img.alt = 'Certificate';
    inner.appendChild(img);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'cert-lightbox__close';
    closeBtn.innerHTML = '&times;';
    inner.appendChild(closeBtn);

    if (back) {
        var flipBtn = document.createElement('button');
        flipBtn.className = 'cert-lightbox__flip';
        flipBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> <span>Flip</span>';
        flipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showingBack = !showingBack;
            img.classList.add('cert-flipping');
            setTimeout(function() {
                img.src = showingBack ? back : front;
                img.classList.remove('cert-flipping');
            }, 150);
        });
        inner.appendChild(flipBtn);
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) { e.stopPropagation(); flipBtn.click(); });
    }

    closeBtn.addEventListener('click', function() { lb.remove(); });
    lb.addEventListener('click', function() { lb.remove(); });
    inner.addEventListener('click', function(e) { e.stopPropagation(); });

    lb.appendChild(inner);
    document.body.appendChild(lb);
}

function loadCertificates() {
    var section = document.getElementById('certificates');
    var grid = document.getElementById('certificatesGrid');
    if (!grid) return;
    fbGet('certificates', function(certs) {
        if (!certs || !certs.length) { section.style.display = 'none'; return; }
        section.style.display = '';
        var html = '';
        for (var i = 0; i < certs.length; i++) {
            var twoSides = certBack(certs[i]) ? '<span class="certificates__badge">Front &amp; back</span>' : '';
            html += '<div class="certificates__item" data-cert="' + i + '"><img loading="lazy" decoding="async" src="' + certFront(certs[i]) + '" alt="Certificate">' + twoSides + '</div>';
        }
        grid.innerHTML = html;
        grid.querySelectorAll('.certificates__item').forEach(function(item, idx) {
            item.addEventListener('click', function() { openCertLightbox(certs[idx]); });
        });
    });
}

function loadFooterSocials() {
    fbGet('content', function(content) {
        var ig = document.getElementById('socialInsta');
        var fb = document.getElementById('socialFacebook');
        if (ig) { if (content && content.contactInsta) { ig.href = content.contactInsta; ig.style.display = ''; } else { ig.style.display = 'none'; } }
        if (fb) { if (content && content.contactFacebook) { fb.href = content.contactFacebook; fb.style.display = ''; } else { fb.style.display = 'none'; } }
    });
}

applyI18n();
loadCertificates();
loadFooterSocials();
