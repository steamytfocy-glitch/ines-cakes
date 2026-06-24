// Baker's WhatsApp number (international, no +)
var BAKER_WA = '353874917435';

var translations = {
    en: {
        "os.title": "Track Your Order",
        "os.sub": "Enter your order number to see its status",
        "os.enterCode": "Order number",
        "os.check": "Check status",
        "os.notFound": "Order not found. Please check the number.",
        "os.codeLabel": "Order number",
        "os.noteLabel": "Message from the baker",
        "os.message": "Message us on WhatsApp",
        "os.home": "Back to Home",
        "os.declinedMsg": "Unfortunately this order could not be accepted. Please contact us for details.",
        "st.new": "Order received",
        "st.confirmed": "Confirmed",
        "st.progress": "Being made",
        "st.ready": "Ready for pickup",
        "st.done": "Completed",
        "sum.date": "Date needed",
        "sum.size": "Size",
        "sum.flavour": "Flavour",
        "sum.total": "Estimated total",
        "wa.msg": "Hello! I have a question about my order "
    },
    ua: {
        "os.title": "Відстеження замовлення",
        "os.sub": "Введіть номер замовлення, щоб побачити його статус",
        "os.enterCode": "Номер замовлення",
        "os.check": "Перевірити статус",
        "os.notFound": "Замовлення не знайдено. Перевірте номер.",
        "os.codeLabel": "Номер замовлення",
        "os.noteLabel": "Повідомлення від кондитера",
        "os.message": "Написати в WhatsApp",
        "os.home": "На головну",
        "os.declinedMsg": "На жаль, це замовлення не вдалося прийняти. Зв'яжіться з нами для деталей.",
        "st.new": "Замовлення отримано",
        "st.confirmed": "Підтверджено",
        "st.progress": "Готується",
        "st.ready": "Готово до видачі",
        "st.done": "Виконано",
        "sum.date": "Потрібна дата",
        "sum.size": "Розмір",
        "sum.flavour": "Смак",
        "sum.total": "Орієнтовна сума",
        "wa.msg": "Вітаю! У мене питання щодо замовлення "
    },
    ru: {
        "os.title": "Отслеживание заказа",
        "os.sub": "Введите номер заказа, чтобы увидеть его статус",
        "os.enterCode": "Номер заказа",
        "os.check": "Проверить статус",
        "os.notFound": "Заказ не найден. Проверьте номер.",
        "os.codeLabel": "Номер заказа",
        "os.noteLabel": "Сообщение от кондитера",
        "os.message": "Написать в WhatsApp",
        "os.home": "На главную",
        "os.declinedMsg": "К сожалению, этот заказ не удалось принять. Свяжитесь с нами для деталей.",
        "st.new": "Заказ получен",
        "st.confirmed": "Подтверждён",
        "st.progress": "Готовится",
        "st.ready": "Готов к выдаче",
        "st.done": "Выполнен",
        "sum.date": "Нужная дата",
        "sum.size": "Размер",
        "sum.flavour": "Вкус",
        "sum.total": "Примерная сумма",
        "wa.msg": "Здравствуйте! У меня вопрос по заказу "
    }
};

var STEP_ORDER = ['new', 'confirmed', 'progress', 'ready', 'done'];
var STATUS_COLORS = {
    new:       { bg: '#FBF3E2', fg: '#A67A2E' },
    confirmed: { bg: '#EAF3FB', fg: '#2E6FA6' },
    progress:  { bg: '#FBF3E2', fg: '#A67A2E' },
    ready:     { bg: '#EAF7EE', fg: '#2E8B57' },
    done:      { bg: '#EAF7EE', fg: '#2E8B57' },
    declined:  { bg: '#FBEAEA', fg: '#B23A3A' }
};

var currentLang = 'en';
var currentOrder = null;

function t(key) {
    var tr = translations[currentLang] || translations.en;
    return tr[key] || (translations.en[key] || key);
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
    });
    if (currentOrder) renderOrder(currentOrder);
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

function normalizePhone(phone) {
    var digits = String(phone || '').replace(/[^0-9]/g, '');
    if (digits.indexOf('353') === 0) return digits;
    if (digits.indexOf('0') === 0) return '353' + digits.slice(1);
    return digits;
}

function renderOrder(o) {
    currentOrder = o;
    document.getElementById('osLookup').style.display = 'none';
    document.getElementById('osCard').style.display = 'block';
    document.getElementById('osCodeVal').textContent = o.code || '';

    var status = o.status || 'new';
    var declined = status === 'declined';

    // Steps timeline
    var stepsEl = document.getElementById('osSteps');
    var declinedEl = document.getElementById('osDeclined');
    if (declined) {
        stepsEl.style.display = 'none';
        declinedEl.style.display = 'block';
    } else {
        stepsEl.style.display = '';
        declinedEl.style.display = 'none';
        var currentIdx = STEP_ORDER.indexOf(status);
        if (currentIdx < 0) currentIdx = 0;
        var html = '';
        for (var i = 0; i < STEP_ORDER.length; i++) {
            var cls = i < currentIdx ? 'os__step--done' : (i === currentIdx ? 'os__step--current' : '');
            var mark = i < currentIdx ? '✓' : '';
            html += '<li class="os__step ' + cls + '">' +
                '<span class="os__step-dot">' + mark + '</span>' +
                '<span class="os__step-label">' + t('st.' + STEP_ORDER[i]) + '</span>' +
            '</li>';
        }
        stepsEl.innerHTML = html;
    }

    // Note from baker
    var noteEl = document.getElementById('osNote');
    if (o.note && o.note.trim()) {
        noteEl.style.display = 'block';
        document.getElementById('osNoteText').textContent = o.note;
    } else {
        noteEl.style.display = 'none';
    }

    // Summary
    var rows = '';
    if (o.date) rows += summaryRow(t('sum.date'), o.date);
    var size = o.cakeSize || '';
    if (o.customDiameter) size += ' (' + o.customDiameter + '")';
    if (size) rows += summaryRow(t('sum.size'), size);
    if (o.flavour) rows += summaryRow(t('sum.flavour'), o.flavour);
    if (o.total) rows += summaryRow(t('sum.total'), o.total);
    document.getElementById('osSummary').innerHTML = rows;

    // WhatsApp button
    var msg = t('wa.msg') + (o.code || '');
    document.getElementById('osWa').href = 'https://wa.me/' + BAKER_WA + '?text=' + encodeURIComponent(msg);
}

function summaryRow(label, value) {
    return '<div class="os__summary-row"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
}

function lookup(code) {
    code = String(code || '').trim().toUpperCase();
    if (!code) return;
    if (code.indexOf('INES-') !== 0 && code.indexOf('INES') === 0) {
        code = 'INES-' + code.slice(4);
    }
    fbGet('orders', function(orders) {
        if (!orders) orders = [];
        var found = null;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i] && orders[i].code === code) { found = orders[i]; break; }
        }
        if (found) {
            history.replaceState(null, '', 'order?code=' + encodeURIComponent(code));
            renderOrder(found);
        } else {
            document.getElementById('osError').style.display = 'block';
        }
    });
}

document.getElementById('osLookupBtn').addEventListener('click', function() {
    document.getElementById('osError').style.display = 'none';
    lookup(document.getElementById('osCodeInput').value);
});
document.getElementById('osCodeInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('osLookupBtn').click();
});

setLang(currentLang);

(function() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');
    if (code) {
        document.getElementById('osCodeInput').value = code;
        lookup(code);
    }
})();
