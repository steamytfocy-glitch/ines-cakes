var translations = {
    en: {
        "cart.back": "← Continue shopping",
        "cart.title": "Your cart",
        "cart.empty": "Your cart is empty.",
        "cart.browse": "Browse cakes",
        "cart.total": "Total",
        "cart.your": "Your details",
        "cart.place": "Place order",
        "cart.note": "No online payment - we'll contact you to confirm and arrange payment.",
        "cart.remove": "Remove",
        "cart.gift": "Gift wrap",
        "cart.size": "Size", "cart.flavour": "Flavour", "cart.date": "Date", "cart.qty": "Qty", "cart.ref": "Reference", "cart.weight": "Weight",
        "cart.tall": "Tall cake", "cart.gf": "Gluten-free",
        "order.name": "Your Name", "order.phone": "Phone Number", "order.email": "Email",
        "cart.fill": "Please fill in your name and phone.",
        "cart.onRequest": "Price on request"
    },
    ua: {
        "cart.back": "← Продовжити покупки",
        "cart.title": "Ваш кошик",
        "cart.empty": "Ваш кошик порожній.",
        "cart.browse": "Переглянути торти",
        "cart.total": "Разом",
        "cart.your": "Ваші дані",
        "cart.place": "Оформити замовлення",
        "cart.note": "Без онлайн-оплати - ми зв'яжемося, щоб підтвердити та домовитися про оплату.",
        "cart.remove": "Прибрати",
        "cart.gift": "Подарункова стрічка",
        "cart.size": "Розмір", "cart.flavour": "Смак", "cart.date": "Дата", "cart.qty": "К-сть", "cart.ref": "Референс", "cart.weight": "Вага",
        "cart.tall": "Високий торт", "cart.gf": "Без глютену",
        "order.name": "Ваше ім'я", "order.phone": "Номер телефону", "order.email": "Ел. пошта",
        "cart.fill": "Будь ласка, вкажіть ім'я та телефон.",
        "cart.onRequest": "Ціна за домовленістю"
    },
    ru: {
        "cart.back": "← Продолжить покупки",
        "cart.title": "Ваша корзина",
        "cart.empty": "Ваша корзина пуста.",
        "cart.browse": "Смотреть торты",
        "cart.total": "Итого",
        "cart.your": "Ваши данные",
        "cart.place": "Оформить заказ",
        "cart.note": "Без онлайн-оплаты - мы свяжемся, чтобы подтвердить и договориться об оплате.",
        "cart.remove": "Убрать",
        "cart.gift": "Подарочная лента",
        "cart.size": "Размер", "cart.flavour": "Вкус", "cart.date": "Дата", "cart.qty": "Кол-во", "cart.ref": "Референс", "cart.weight": "Вес",
        "cart.tall": "Высокий торт", "cart.gf": "Без глютена",
        "order.name": "Ваше имя", "order.phone": "Номер телефона", "order.email": "Эл. почта",
        "cart.fill": "Пожалуйста, укажите имя и телефон.",
        "cart.onRequest": "Цена по договорённости"
    }
};

var currentLang = 'en';
function t(k) { var tr = translations[currentLang] || translations.en; return tr[k] || translations.en[k] || k; }
function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var k = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][k]) el.innerHTML = translations[currentLang][k];
    });
}
function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === lang); });
    applyI18n();
    renderCart();
}
document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

function lineTotal(it) { return (it.qty || 1) * ((parseFloat(it.price) || 0) + (parseFloat(it.giftPrice) || 0)); }
function priceText(it) {
    if (!parseFloat(it.price)) return t('cart.onRequest');
    return (it.custom ? '≈ €' : '€') + lineTotal(it);
}

function renderCart() {
    var cart = getCart();
    var empty = document.getElementById('cartEmpty');
    var content = document.getElementById('cartContent');
    if (!cart.length) {
        empty.style.display = 'block';
        content.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    content.style.display = 'block';

    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var it = cart[i];
        var meta = [];
        if (it.refName) meta.push('📷 ' + t('cart.ref') + ': ' + escapeHtml(it.refName));
        if (it.weight) meta.push(t('cart.weight') + ': ' + escapeHtml(it.weight));
        if (it.size) meta.push(t('cart.size') + ': ' + escapeHtml(it.size));
        if (it.flavour) meta.push(t('cart.flavour') + ': ' + escapeHtml(it.flavour));
        if (it.date) meta.push(t('cart.date') + ': ' + escapeHtml(it.date));
        if (it.tall) meta.push('⬆️ ' + t('cart.tall'));
        if (it.glutenFree) meta.push('🌾 ' + t('cart.gf'));
        if (it.decor) meta.push(escapeHtml(it.decor));
        if (it.gift) meta.push('🎁 ' + t('cart.gift') + ' (+€' + it.giftPrice + ')');
        var extras = [];
        if (it.message) extras.push('✍️ ' + escapeHtml(it.message));
        if (it.allergies) extras.push('⚠️ ' + escapeHtml(it.allergies));

        html += '<div class="cart-item">' +
            '<div class="cart-item__img">' + (it.photo ? '<img src="' + it.photo + '" alt="">' : '') + '</div>' +
            '<div class="cart-item__info">' +
                '<div class="cart-item__name">' + escapeHtml(it.name) + '</div>' +
                '<div class="cart-item__meta">' + meta.join(' · ') + '</div>' +
                (extras.length ? '<div class="cart-item__extras">' + extras.join('<br>') + '</div>' : '') +
                '<div class="cart-item__controls">' +
                    '<div class="qty-box">' +
                        '<button type="button" class="qty-btn" data-dec="' + i + '">−</button>' +
                        '<span>' + (it.qty || 1) + '</span>' +
                        '<button type="button" class="qty-btn" data-inc="' + i + '">+</button>' +
                    '</div>' +
                    '<button type="button" class="cart-item__remove" data-remove="' + i + '">' + t('cart.remove') + '</button>' +
                '</div>' +
            '</div>' +
            '<div class="cart-item__price">' + priceText(it) + '</div>' +
        '</div>';
    }
    document.getElementById('cartItems').innerHTML = html;
    document.getElementById('cartTotalVal').textContent = '€' + cartTotal();

    document.querySelectorAll('[data-inc]').forEach(function(b) {
        b.addEventListener('click', function() { changeQty(parseInt(this.dataset.inc), 1); });
    });
    document.querySelectorAll('[data-dec]').forEach(function(b) {
        b.addEventListener('click', function() { changeQty(parseInt(this.dataset.dec), -1); });
    });
    document.querySelectorAll('[data-remove]').forEach(function(b) {
        b.addEventListener('click', function() {
            var c = getCart(); c.splice(parseInt(this.dataset.remove), 1); setCart(c); renderCart();
        });
    });
}

function changeQty(idx, delta) {
    var c = getCart();
    if (!c[idx]) return;
    c[idx].qty = Math.max(1, (c[idx].qty || 1) + delta);
    setCart(c);
    renderCart();
}

function genOrderCode(existing) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code;
    do {
        code = 'INES-';
        for (var i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    } while (existing.indexOf(code) > -1);
    return code;
}

function buildSummary(cart) {
    return cart.map(function(it) {
        var parts = [(it.qty || 1) + '× ' + it.name];
        var sub = [];
        if (it.refName) sub.push('ref: ' + it.refName);
        if (it.weight) sub.push(it.weight);
        if (it.size) sub.push(it.size);
        if (it.flavour) sub.push(it.flavour);
        if (it.date) sub.push(it.date);
        if (it.tall) sub.push('tall cake');
        if (it.glutenFree) sub.push('gluten-free');
        if (it.decor) sub.push(it.decor);
        if (it.gift) sub.push('gift wrap');
        if (sub.length) parts.push('(' + sub.join(', ') + ')');
        parts.push(!parseFloat(it.price) ? 'price on request' : ((it.custom ? '≈ €' : '€') + lineTotal(it)));
        var line = parts.join(' ');
        if (it.message) line += ' - note: ' + it.message;
        if (it.allergies) line += ' - allergies: ' + it.allergies;
        return line;
    }).join('\n');
}

document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var cart = getCart();
    if (!cart.length) return;
    var name = document.getElementById('coName').value.trim();
    var phone = document.getElementById('coPhone').value.trim();
    var email = document.getElementById('coEmail').value.trim();
    if (!name || !phone) { alert(t('cart.fill')); return; }

    var btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;

    var dates = cart.map(function(it) { return it.date; }).filter(Boolean).sort();
    var order = {
        name: name,
        phone: phone,
        email: email,
        date: dates[0] || '',
        cakeSize: cart.length === 1 ? (cart[0].size || '') : (cart.length + ' items'),
        flavour: cart.length === 1 ? (cart[0].flavour || '') : '',
        message: buildSummary(cart),
        total: '€' + cartTotal(),
        items: cart,
        status: 'new',
        note: '',
        lang: currentLang,
        submitted: new Date().toLocaleString()
    };

    var redirected = false;
    function done(code) {
        if (redirected) return;
        redirected = true;
        setCart([]);
        window.location.href = 'thankyou' + (code ? '?code=' + encodeURIComponent(code) : '');
    }

    fbGetOnce('orders', function(orders) {
        if (!orders) orders = [];
        var codes = orders.map(function(o) { return o && o.code; });
        var code = genOrderCode(codes);
        order.code = code;

        var notifyData = {};
        for (var k in order) { if (k !== 'items') notifyData[k] = order[k]; }
        try {
            var blob = new Blob([JSON.stringify(notifyData)], { type: 'application/json' });
            navigator.sendBeacon('/api/notify', blob);
        } catch (e) {}

        orders.push(order);
        fbSet('orders', orders, function() { done(code); });
    });
    setTimeout(function() { done(order.code); }, 4000);
});

applyI18n();
document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === currentLang); });
renderCart();
