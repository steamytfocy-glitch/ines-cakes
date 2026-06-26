var translations = {
    ga: {
        "mo.back": "← Ar ais Abhaile",
        "mo.title": "Rianaigh d'Ordú",
        "mo.sub": "Cuir isteach cód d'ordaithe chun an stádas a fheiceáil. Sábháiltear do chóid ar an ngléas seo freisin.",
        "mo.add": "Cuir ordú leis",
        "mo.notfound": "Ordú gan aimsiú. Seiceáil an uimhir le do thoil.",
        "mo.empty": "Níl aon ordú ar an ngléas seo fós.",
        "mo.browse": "Brabhsáil cácaí",
        "mo.view": "Féach ar an stádas",
        "mo.remove": "Bain",
        "mo.date": "Dáta",
        "mo.total": "Iomlán",
        "st.new": "Ordú faighte", "st.confirmed": "Deimhnithe", "st.progress": "Á dhéanamh",
        "st.ready": "Réidh le bailiú", "st.done": "Críochnaithe", "st.declined": "Diúltaithe"
    },
    en: {
        "mo.back": "← Back to Home",
        "mo.title": "Track Your Order",
        "mo.sub": "Enter your order code to see its status. Your codes are also saved on this device.",
        "mo.add": "Add order",
        "mo.notfound": "Order not found. Please check the number.",
        "mo.empty": "No orders yet on this device.",
        "mo.browse": "Browse cakes",
        "mo.view": "View status",
        "mo.remove": "Remove",
        "mo.date": "Date",
        "mo.total": "Total",
        "st.new": "Order received", "st.confirmed": "Confirmed", "st.progress": "Being made",
        "st.ready": "Ready for pickup", "st.done": "Completed", "st.declined": "Declined"
    },
    ua: {
        "mo.back": "← На головну",
        "mo.title": "Відстеження замовлення",
        "mo.sub": "Введіть код замовлення, щоб побачити статус. Ваші коди також зберігаються на цьому пристрої.",
        "mo.add": "Додати замовлення",
        "mo.notfound": "Замовлення не знайдено. Перевірте номер.",
        "mo.empty": "На цьому пристрої ще немає замовлень.",
        "mo.browse": "Переглянути торти",
        "mo.view": "Дивитись статус",
        "mo.remove": "Прибрати",
        "mo.date": "Дата",
        "mo.total": "Разом",
        "st.new": "Замовлення отримано", "st.confirmed": "Підтверджено", "st.progress": "Готується",
        "st.ready": "Готово до видачі", "st.done": "Виконано", "st.declined": "Відхилено"
    },
    ru: {
        "mo.back": "← На главную",
        "mo.title": "Отслеживание заказа",
        "mo.sub": "Введите код заказа, чтобы увидеть статус. Ваши коды также сохраняются на этом устройстве.",
        "mo.add": "Добавить заказ",
        "mo.notfound": "Заказ не найден. Проверьте номер.",
        "mo.empty": "На этом устройстве пока нет заказов.",
        "mo.browse": "Смотреть торты",
        "mo.view": "Смотреть статус",
        "mo.remove": "Убрать",
        "mo.date": "Дата",
        "mo.total": "Итого",
        "st.new": "Заказ получен", "st.confirmed": "Подтверждён", "st.progress": "Готовится",
        "st.ready": "Готов к выдаче", "st.done": "Выполнен", "st.declined": "Отклонён"
    }
};

var STATUS_COLORS = {
    new: { bg: '#FBF3E2', fg: '#A67A2E' }, confirmed: { bg: '#EAF3FB', fg: '#2E6FA6' },
    progress: { bg: '#FBF3E2', fg: '#A67A2E' }, ready: { bg: '#EAF7EE', fg: '#2E8B57' },
    done: { bg: '#EAF7EE', fg: '#2E8B57' }, declined: { bg: '#FBEAEA', fg: '#B23A3A' }
};

var currentLang = (function(l){ return (l === 'ga' || l === 'ua' || l === 'ru') ? l : 'en'; })(localStorage.getItem('ines-lang'));
var _allOrders = [];

function t(k) { var tr = translations[currentLang] || translations.en; return tr[k] || translations.en[k] || k; }
function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function getMine() {
    try { return JSON.parse(localStorage.getItem('ines-my-orders')) || []; } catch (e) { return []; }
}
function setMine(list) { localStorage.setItem('ines-my-orders', JSON.stringify(list)); }

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
    render();
}
document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

function findOrder(code) {
    for (var i = 0; i < _allOrders.length; i++) if (_allOrders[i] && _allOrders[i].code === code) return _allOrders[i];
    return null;
}

function render() {
    var mine = getMine();
    var list = document.getElementById('moList');
    var empty = document.getElementById('moEmpty');

    var existing = mine.filter(function(m) { return findOrder(m.code); });
    if (existing.length !== mine.length) { setMine(existing); mine = existing; }

    if (!mine.length) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    var html = '';
    mine.slice().reverse().forEach(function(m) {
        var o = findOrder(m.code);
        if (!o) return;
        var status = o.status || 'new';
        var col = STATUS_COLORS[status] || STATUS_COLORS.new;
        html += '<div class="mo-card">' +
            '<div class="mo-card__top">' +
                '<span class="mo-card__code">' + escapeHtml(o.code) + '</span>' +
                '<span class="mo-card__status" style="background:' + col.bg + ';color:' + col.fg + ';">' + t('st.' + status) + '</span>' +
            '</div>' +
            '<div class="mo-card__meta">' +
                (o.date ? '<span>' + t('mo.date') + ': ' + escapeHtml(o.date) + '</span>' : '') +
                (o.total ? '<span>' + t('mo.total') + ': ' + escapeHtml(o.total) + '</span>' : '') +
            '</div>' +
            '<div class="mo-card__actions">' +
                '<a class="btn btn--outline" href="order?code=' + encodeURIComponent(o.code) + '">' + t('mo.view') + '</a>' +
                '<button class="mo-card__remove" data-remove="' + escapeHtml(o.code) + '">' + t('mo.remove') + '</button>' +
            '</div>' +
        '</div>';
    });
    list.innerHTML = html;

    list.querySelectorAll('[data-remove]').forEach(function(b) {
        b.addEventListener('click', function() {
            var code = this.dataset.remove;
            setMine(getMine().filter(function(m) { return m.code !== code; }));
            render();
        });
    });
}

document.getElementById('moAddBtn').addEventListener('click', function() {
    var input = document.getElementById('moCodeInput');
    var code = input.value.trim().toUpperCase();
    if (code && code.indexOf('INES') === 0 && code.indexOf('INES-') !== 0) code = 'INES-' + code.slice(4);
    document.getElementById('moError').style.display = 'none';
    if (!code) return;
    if (!findOrder(code)) { document.getElementById('moError').style.display = 'block'; return; }
    var mine = getMine();
    if (!mine.some(function(m) { return m.code === code; })) { mine.push({ code: code, when: Date.now() }); setMine(mine); }
    input.value = '';
    render();
});
document.getElementById('moCodeInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('moAddBtn').click();
});

applyI18n();
document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === currentLang); });

fbGet('orders', function(orders) {
    _allOrders = orders || [];
    // If we arrived from a status email (…/myorders?code=INES-XXXX), add that
    // order to this device automatically and clean the code out of the URL.
    try {
        var urlCode = (new URLSearchParams(location.search).get('code') || '').trim().toUpperCase();
        if (urlCode) {
            if (findOrder(urlCode)) {
                var mine = getMine();
                if (!mine.some(function(m) { return m.code === urlCode; })) {
                    mine.push({ code: urlCode, when: Date.now() });
                    setMine(mine);
                }
            }
            history.replaceState(null, '', 'myorders');
        }
    } catch (e) {}
    render();
});
