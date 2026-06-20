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

    // flavours
    var flavSel = document.getElementById('pFlavour');
    var flavs = product.flavours || [];
    var fhtml = '<option value="">' + t('prod.choose') + '</option>';
    for (var j = 0; j < flavs.length; j++) fhtml += '<option value="' + escapeHtml(flavs[j]) + '">' + escapeHtml(flavs[j]) + '</option>';
    flavSel.innerHTML = fhtml;

    // date min (today + notice)
    var notice = parseInt(product.noticeDays) || 0;
    var d = new Date(); d.setDate(d.getDate() + notice);
    document.getElementById('pDate').min = d.toISOString().split('T')[0];

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
    var date = document.getElementById('pDate').value;
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
    });
})();
