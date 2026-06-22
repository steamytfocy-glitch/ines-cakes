var translations = {
    en: {
        "prod.back": "← Back to cakes",
        "prod.notfound": "Cake not found.",
        "prod.date": "Choose a date",
        "prod.size": "Size",
        "prod.flavour": "Flavour",
        "prod.qty": "Quantity",
        "prod.message": "Cake Message",
        "prod.messagePh": "(e.g. Happy Birthday Anne!)",
        "prod.allergies": "Allergies",
        "prod.gift": "Tied with Ribbon & Personalised Gift Tag (+€3)",
        "prod.add": "Add to cart",
        "prod.added": "Added to cart ✓",
        "prod.details": "Details",
        "prod.loc": "Available in Co. Donegal",
        "prod.choose": "Choose",
        "prod.serves": "Serves",
        "prod.tableSize": "Cake Size",
        "prod.tableServes": "Serves",
        "prod.tablePrice": "Price",
        "prod.notice": "Time notice required:",
        "prod.days": "days",
        "prod.pickSize": "Please choose a size.",
        "prod.pickDate": "Please choose a date.",
        "prod.allergyInfo": "*Allergy info: unless otherwise noted, products contain milk, wheat, soy and egg, and are made in a kitchen that handles nuts. Our facility is not gluten-free.",
        "order.al.gluten": "Gluten", "order.al.nuts": "Nuts", "order.al.dairy": "Dairy",
        "order.al.eggs": "Eggs", "order.al.soy": "Soy", "order.al.other": "Other",
        "order.al.otherPh": "Specify your allergy..."
    },
    ua: {
        "prod.back": "← До тортів",
        "prod.notfound": "Торт не знайдено.",
        "prod.date": "Оберіть дату",
        "prod.size": "Розмір",
        "prod.flavour": "Смак",
        "prod.qty": "Кількість",
        "prod.message": "Напис на торті",
        "prod.messagePh": "(напр. З Днем народження, Анно!)",
        "prod.allergies": "Алергії",
        "prod.gift": "Перев'язати стрічкою + іменна бирка (+€3)",
        "prod.add": "Додати в кошик",
        "prod.added": "Додано в кошик ✓",
        "prod.details": "Деталі",
        "prod.loc": "Доступно в графстві Донегол",
        "prod.choose": "Оберіть",
        "prod.serves": "Порцій",
        "prod.tableSize": "Розмір",
        "prod.tableServes": "Порцій",
        "prod.tablePrice": "Ціна",
        "prod.notice": "Замовляти за:",
        "prod.days": "дн.",
        "prod.pickSize": "Будь ласка, оберіть розмір.",
        "prod.pickDate": "Будь ласка, оберіть дату.",
        "prod.allergyInfo": "*Алергени: якщо не вказано інше, продукти містять молоко, пшеницю, сою та яйця і виготовляються на кухні, де є горіхи. Виробництво не є безглютеновим.",
        "order.al.gluten": "Глютен", "order.al.nuts": "Горіхи", "order.al.dairy": "Молочне",
        "order.al.eggs": "Яйця", "order.al.soy": "Соя", "order.al.other": "Інше",
        "order.al.otherPh": "Вкажіть вашу алергію..."
    },
    ru: {
        "prod.back": "← К тортам",
        "prod.notfound": "Торт не найден.",
        "prod.date": "Выберите дату",
        "prod.size": "Размер",
        "prod.flavour": "Вкус",
        "prod.qty": "Количество",
        "prod.message": "Надпись на торте",
        "prod.messagePh": "(напр. С Днём рождения, Анна!)",
        "prod.allergies": "Аллергии",
        "prod.gift": "Перевязать лентой + именная бирка (+€3)",
        "prod.add": "В корзину",
        "prod.added": "Добавлено в корзину ✓",
        "prod.details": "Детали",
        "prod.loc": "Доступно в графстве Донегол",
        "prod.choose": "Выберите",
        "prod.serves": "Порций",
        "prod.tableSize": "Размер",
        "prod.tableServes": "Порций",
        "prod.tablePrice": "Цена",
        "prod.notice": "Заказывать за:",
        "prod.days": "дн.",
        "prod.pickSize": "Пожалуйста, выберите размер.",
        "prod.pickDate": "Пожалуйста, выберите дату.",
        "prod.allergyInfo": "*Аллергены: если не указано иное, продукты содержат молоко, пшеницу, сою и яйца и готовятся на кухне, где есть орехи. Производство не безглютеновое.",
        "order.al.gluten": "Глютен", "order.al.nuts": "Орехи", "order.al.dairy": "Молочное",
        "order.al.eggs": "Яйца", "order.al.soy": "Соя", "order.al.other": "Другое",
        "order.al.otherPh": "Укажите вашу аллергию..."
    }
};

var currentLang = localStorage.getItem('ines-lang') || 'en';
var product = null;
var productIndex = null;
var selectedAllergies = [];

function t(k) { var tr = translations[currentLang] || translations.en; return tr[k] || translations.en[k] || k; }

function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var k = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][k]) el.innerHTML = translations[currentLang][k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        var k = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][k]) el.placeholder = translations[currentLang][k];
    });
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ines-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === lang); });
    applyI18n();
    if (product) renderProduct();
}
document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(this.dataset.lang); });
});

var monthNames = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    ua: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
};

function populatePDate() {
    var daySel = document.getElementById('pDateDay');
    var monthSel = document.getElementById('pDateMonth');
    if (!daySel || !monthSel) return;
    var names = monthNames[currentLang] || monthNames.en;
    var dayLabel = currentLang === 'en' ? 'Day' : 'День';
    var monthLabel = currentLang === 'ru' ? 'Месяц' : (currentLang === 'ua' ? 'Місяць' : 'Month');

    var prevDay = daySel.value, prevMonth = monthSel.value;
    var dh = '<option value="">' + dayLabel + '</option>';
    for (var d = 1; d <= 31; d++) dh += '<option value="' + d + '">' + d + '</option>';
    daySel.innerHTML = dh;
    var mh = '<option value="">' + monthLabel + '</option>';
    for (var m = 0; m < 12; m++) mh += '<option value="' + (m + 1) + '">' + names[m] + '</option>';
    monthSel.innerHTML = mh;
    if (prevDay) daySel.value = prevDay;
    if (prevMonth) monthSel.value = prevMonth;
}

function selectedDate() {
    var day = document.getElementById('pDateDay').value;
    var month = document.getElementById('pDateMonth').value;
    if (!day || !month) return '';
    var names = monthNames[currentLang] || monthNames.en;
    return day + ' ' + names[parseInt(month) - 1];
}

function currentSize() {
    var sel = document.getElementById('pSize');
    if (!sel || sel.value === '') return null;
    return product.sizes[parseInt(sel.value)];
}

function updatePrice() {
    var el = document.getElementById('pPrice');
    var s = currentSize();
    if (s && parseFloat(s.price)) {
        el.textContent = '€ ' + parseFloat(s.price);
    } else {
        var nums = (product.sizes || []).map(function(x) { return parseFloat(x.price); }).filter(function(n) { return !isNaN(n); });
        var fromWord = { en: 'from', ua: 'від', ru: 'от' }[currentLang] || 'from';
        el.textContent = nums.length ? (fromWord + ' €' + Math.min.apply(null, nums)) : '';
    }
}

function renderProduct() {
    document.getElementById('pImg').src = product.photo || '';
    document.getElementById('pName').textContent = product.name || '';
    document.getElementById('pLoc').textContent = t('prod.loc');
    var desc = document.getElementById('pDesc');
    desc.textContent = product.desc || '';
    desc.style.display = product.desc ? 'block' : 'none';

    // sizes
    var sizeSel = document.getElementById('pSize');
    var sizes = product.sizes || [];
    var html = '<option value="">' + t('prod.choose') + '</option>';
    for (var i = 0; i < sizes.length; i++) {
        var label = sizes[i].size + (sizes[i].price ? ' — €' + sizes[i].price : '');
        html += '<option value="' + i + '">' + escapeHtml(label) + '</option>';
    }
    sizeSel.innerHTML = html;

    populatePDate();

    // notice text
    var noticeEl = document.getElementById('pNotice');
    noticeEl.textContent = notice > 0 ? (t('prod.notice') + ' ' + notice + ' ' + t('prod.days')) : '';

    // sizes table
    var table = document.getElementById('pSizesTable');
    if (sizes.length) {
        var th = '<tr><th>' + t('prod.tableSize') + '</th><th>' + t('prod.tableServes') + '</th><th>' + t('prod.tablePrice') + '</th></tr>';
        var rows = '';
        for (var k = 0; k < sizes.length; k++) {
            rows += '<tr><td>' + escapeHtml(sizes[k].size) + '</td><td>' + escapeHtml(sizes[k].serves || '—') + '</td><td>' + (sizes[k].price ? '€' + escapeHtml(sizes[k].price) : '—') + '</td></tr>';
        }
        table.innerHTML = th + rows;
        document.getElementById('productDetails').style.display = 'block';
    } else {
        document.getElementById('productDetails').style.display = 'none';
    }

    updatePrice();
}

// ===== FLAVOUR PICKER MODAL =====
var _flavours = [];

var DEFAULT_FLAVOURS = [
    { name: 'Chocolate', desc: 'Rich chocolate sponge with chocolate ganache', price: '', photo: null },
    { name: 'Vanilla', desc: 'Classic vanilla sponge with vanilla cream', price: '', photo: null },
    { name: 'Red Velvet', desc: 'Red velvet with cream cheese frosting', price: '', photo: null },
    { name: 'Honey (Medovik)', desc: 'Delicate honey layers with sour cream', price: '', photo: null },
    { name: 'Napoleon', desc: 'Puff pastry layers with custard cream', price: '', photo: null },
    { name: 'Cheesecake', desc: 'Creamy baked cheesecake', price: '', photo: null },
    { name: 'Carrot', desc: 'Carrot sponge with cream cheese frosting', price: '', photo: null },
    { name: 'Strawberry', desc: 'Vanilla sponge with fresh strawberries', price: '', photo: null },
    { name: 'Pistachio', desc: 'Pistachio sponge with delicate cream', price: '', photo: null },
    { name: 'Lemon', desc: 'Zesty lemon sponge with lemon curd', price: '', photo: null }
];

function flavourCardHtml(f) {
    var img = f.photo
        ? '<img src="' + f.photo + '" class="flavour-card__img" alt="' + escapeHtml(f.name) + '">'
        : '<div class="flavour-card__placeholder"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
    var price = f.price ? ('€' + escapeHtml(f.price) + ' / kg') : '';
    return '<div class="flavour-card" data-flavour="' + escapeHtml(f.name) + '">' +
        '<div class="flavour-card__imgwrap">' + img +
            '<div class="flavour-card__caption">' +
                '<div class="flavour-card__name">' + escapeHtml(f.name) + '</div>' +
                (price ? '<div class="flavour-card__price">' + price + '</div>' : '') +
            '</div>' +
        '</div>' +
        (f.desc ? '<div class="flavour-card__desc">' + escapeHtml(f.desc) + '</div>' : '') +
    '</div>';
}

function setupFlavours() {
    var globals = (_flavours || []).filter(function(f) { return f && f.name; });
    var names = (product.flavours && product.flavours.length) ? product.flavours : null;
    var list;
    if (names) {
        list = names.filter(Boolean).map(function(n) {
            var found = null;
            for (var i = 0; i < globals.length; i++) if (globals[i].name === n) { found = globals[i]; break; }
            return found || { name: n, photo: null, price: '', desc: '' };
        });
    } else {
        list = globals;
    }
    // Never show an empty picker — fall back to the standard flavours
    if (!list.length) list = DEFAULT_FLAVOURS;
    var grid = document.getElementById('pFlavourGrid');
    grid.innerHTML = list.map(flavourCardHtml).join('');
    grid.querySelectorAll('.flavour-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var name = this.dataset.flavour;
            document.getElementById('pFlavour').value = name;
            var txt = document.getElementById('pFlavourText');
            txt.textContent = name;
            txt.removeAttribute('data-i18n');
            document.getElementById('pFlavourBtn').classList.add('has-value');
            document.getElementById('flavourModal').style.display = 'none';
        });
    });
}

document.getElementById('pFlavourBtn').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'flex';
});
document.getElementById('flavourModalClose').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'none';
});
document.getElementById('flavourModalOverlay').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'none';
});

// allergies
document.querySelectorAll('#pAllergyChips .allergy-chip:not(.allergy-chip--other)').forEach(function(chip) {
    chip.addEventListener('click', function() {
        this.classList.toggle('selected');
        var a = this.dataset.allergy;
        var idx = selectedAllergies.indexOf(a);
        if (idx > -1) selectedAllergies.splice(idx, 1); else selectedAllergies.push(a);
    });
});
var allergyOther = document.getElementById('pAllergyOther');
var allergyOtherInput = document.getElementById('pAllergyOtherInput');
allergyOther.addEventListener('click', function() {
    this.classList.toggle('selected');
    var open = this.classList.contains('selected');
    allergyOtherInput.style.display = open ? 'block' : 'none';
    if (!open) allergyOtherInput.value = '';
});

function collectAllergies() {
    var all = selectedAllergies.slice();
    var o = allergyOtherInput.value.trim();
    if (o) all.push(o);
    return all.join(', ');
}

function showToast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 2000);
}

document.getElementById('pSize').addEventListener('change', updatePrice);

document.getElementById('pAddBtn').addEventListener('click', function() {
    var s = currentSize();
    if (!s) { showToast(t('prod.pickSize')); return; }
    var date = selectedDate();
    if (!date) { showToast(t('prod.pickDate')); return; }
    var gift = document.getElementById('pGift').checked;
    var qty = parseInt(document.getElementById('pQty').value) || 1;

    addToCart({
        i: productIndex,
        name: product.name,
        photo: product.photo || '',
        size: s.size,
        serves: s.serves || '',
        price: parseFloat(s.price) || 0,
        flavour: document.getElementById('pFlavour').value || '',
        date: date,
        qty: qty,
        message: document.getElementById('pMessage').value.trim(),
        allergies: collectAllergies(),
        gift: gift,
        giftPrice: gift ? 3 : 0
    });
    showToast(t('prod.added'));
});

// init
applyI18n();
document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === currentLang); });

(function() {
    var params = new URLSearchParams(window.location.search);
    productIndex = parseInt(params.get('i'));
    fbGet('products', function(products) {
        if (!products || isNaN(productIndex) || !products[productIndex]) {
            document.getElementById('productNotFound').style.display = 'block';
            return;
        }
        product = products[productIndex];
        document.getElementById('productGrid').style.display = '';
        renderProduct();
        fbGet('flavours', function(fl) { _flavours = (fl && fl.length) ? fl : DEFAULT_FLAVOURS; setupFlavours(); });
    });
})();
