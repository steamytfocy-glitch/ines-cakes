// Admin sign-in is handled by Firebase Authentication (see the AUTH section).

// ===== CATEGORIES =====
var DEFAULT_CATEGORIES = [
    { id: 'flowers', en: 'Flowers', ua: 'Квіти', ru: 'Цветы' },
    { id: 'kids', en: 'For Kids', ua: 'Дитячі', ru: 'Детские' },
    { id: 'birthday', en: 'Birthday', ua: 'На день народження', ru: 'На день рождения' },
    { id: 'sport', en: 'Sport', ua: 'Спортивні', ru: 'Спортивные' },
    { id: 'bento', en: 'Bento Cakes', ua: 'Бенто торти', ru: 'Бенто торты' },
    { id: 'gaming', en: 'Gaming', ua: 'Ігрові', ru: 'Игровые' },
    { id: 'berries', en: 'Natural Berries', ua: 'Натуральні ягоди', ru: 'Натуральные ягоды' },
    { id: 'other', en: 'Other', ua: 'Інше', ru: 'Другое' }
];
var CATEGORIES = DEFAULT_CATEGORIES.slice();
var categoriesSeeded = false;

// ===== STORAGE HELPERS =====
var _cache = {};

function getData(key, fallback) {
    return _cache[key] !== undefined ? _cache[key] : fallback;
}

function setData(key, value, callback) {
    _cache[key] = value;
    fbSet(key, value, callback);
}

function listenData(key, callback) {
    fbGet(key, function(val) {
        _cache[key] = val;
        if (callback) callback(val);
    });
}

// One-time cleanup: the site is English-only now, so strip any leftover
// Ukrainian/Russian fields from products & flavours in the database.
var _langCleaned = { products: false, flavours: false };
function cleanupLangFields(key) {
    if (_langCleaned[key]) return;
    var arr = getData(key, null);
    if (!Array.isArray(arr)) return;
    _langCleaned[key] = true;
    var FIELDS = ['name_ua', 'name_ru', 'desc_ua', 'desc_ru'];
    var changed = false;
    arr.forEach(function(it) {
        if (!it) return;
        FIELDS.forEach(function(f) { if (f in it) { delete it[f]; changed = true; } });
    });
    if (changed) {
        setData(key, arr);
        if (key === 'products') writeCatalog(arr);
        console.log('Removed old UA/RU fields from ' + key);
    }
}

// ===== ADMIN I18N =====
var A = {
    en: {
        'login.title': 'Admin Panel', 'login.user': 'Login', 'login.pass': 'Password', 'login.signin': 'Sign In', 'login.wrong': 'Wrong login or password',
        'nav.orders': 'Orders', 'nav.cakes': 'Cakes', 'nav.sizes': 'Sizes & Prices', 'nav.flavours': 'Flavours', 'nav.certificates': 'Certificates', 'nav.reviews': 'Reviews', 'nav.content': 'Content',
        'sizes.hint': 'These sizes & prices apply to every cake automatically. Set them once here. You can still override sizes for a single cake in its form.', 'sizes.add': '+ Add size', 'sizes.fillStandard': '+ Add standard sizes (6"-12")', 'sizes.save': 'Save sizes',
        'ptable.title': 'Price table - all cakes', 'ptable.hint': 'Type a price for each size, per cake. Leave a cake empty to use the default prices above. Fill only some sizes to offer just those.', 'ptable.cake': 'Cake', 'ptable.save': 'Save all prices', 'ptable.needSizes': 'Add at least one size above first, then save it - the table will appear here.', 'ptable.empty': 'No cakes yet. Add cakes in the Cakes tab.', 'ptable.fixed': 'Fixed €', 'ptable.search': 'Search cake…',
        'size.sizePh': 'Size (inch), e.g. 8', 'size.servesPh': 'Serves, e.g. 15-18', 'size.pricePh': '€ price',
        'logout': 'Log out', 'viewSite': 'View Site →',
        'orders.searchPh': 'Search name / phone / code', 'orders.emptyTitle': 'No orders yet', 'orders.emptySub': 'Orders from the website form will appear here',
        'orders.allCaught': 'All caught up', 'orders.allCaughtSub': 'Completed orders are hidden. Click "Show completed" to see them.',
        'hideCompleted': 'Hide completed', 'showCompleted': 'Show completed',
        'stats.new': 'New', 'stats.progress': 'In progress', 'stats.done': 'Completed',
        'status.new': 'New', 'status.confirmed': 'Confirmed', 'status.progress': 'Being made', 'status.ready': 'Ready', 'status.done': 'Completed', 'status.declined': 'Declined',
        'order.phone': 'Phone', 'order.email': 'Email', 'order.dateNeeded': 'Date needed', 'order.size': 'Size', 'order.flavour': 'Flavour', 'order.total': 'Est. total', 'order.allergies': 'Allergies',
        'order.statusPage': 'Status page →', 'order.noteLabel': 'Message to client (shown on their status page)', 'order.notePh': 'e.g. Confirmed! Price €45, ready Saturday.', 'order.saveMsg': 'Save message', 'saved': 'Saved ✓',
        'edit': 'Edit', 'delete': 'Delete', 'selected': 'selected', 'selectAll': 'Select all', 'cancel': 'Cancel', 'deleteSelected': 'Delete selected', 'cancelSelection': 'Cancel selection', 'done': 'Done', 'close': 'Close',
        'confirm.order': 'Delete this order?', 'confirm.cake': 'Delete this cake?', 'confirm.flavour': 'Delete this flavour?', 'confirm.review': 'Delete this review?', 'confirm.cert': 'Delete this certificate?', 'confirm.cat': 'Delete this category? Its photos will move to "Other".',
        'alert.selectCakes': 'Select cakes first.', 'alert.noCakesSort': 'No cakes to sort. Add some first!', 'alert.certFront': 'Please choose a front photo',
        'confirm.delCakesPre': 'Delete ', 'confirm.delCakesPost': ' selected cake(s)?',
        'cakes.add': 'Add Cake', 'sortByCategory': 'Sort by Category', 'selectToDelete': 'Select to delete', 'manageCategories': 'Manage Categories', 'cakes.sortHint': 'Select cakes, then assign a category', 'doneSorting': 'Done Sorting', 'assignTo': 'Assign to:', 'cakes.emptyTitle': 'No cakes yet', 'cakes.emptySub': 'Add cakes with photo, sizes & prices - they appear on the site for ordering',
        'priceOnRequest': 'Price on request',
        'cakeModal.addTitle': 'Add Cake', 'cakeModal.editTitle': 'Edit Cake', 'cake.name': 'Cake Name', 'cake.namePh': 'e.g. Sunset Fields Art Cake', 'category': 'Category', 'newCategory': '+ New category', 'photo': 'Photo', 'photosHint': 'You can add several photos - the first is the main one (★); customers can swipe through the rest.', 'descOptional': 'Description (optional)', 'descPh': 'Short description',
        'cake.price': 'Cake price (€) - optional', 'cake.priceHint': 'One fixed price for this cake. If set, it is used instead of the per-size prices below.',
        'sizesPrices': 'Sizes & prices (optional)', 'sizesHint': 'Leave empty to use the global Sizes & Prices. Add rows only to override them for this cake.', 'addSize': '+ Add size', 'addAllSizes': '+ Add all standard sizes (6"-12")', 'availableFlavours': 'Available flavours', 'chooseFlavours': 'Choose flavours', 'flavoursSuffix': 'selected', 'leadTime': 'Lead time - days notice required', 'saveCake': 'Save Cake',
        'selectFlavours': 'Select flavours', 'flavourPickHint': 'Tap the flavours available for this cake. To add a new flavour, use the Flavours tab.', 'flavoursNoneModal': 'No flavours yet. Add them in the Flavours tab first.',
        'manageCatsHint': 'Add, rename or delete the categories used for your cakes.', 'addCategory': '+ Add Category', 'newCatPrompt': 'New category name:',
        'cert.add': 'Add Certificate', 'cert.modalTitle': 'Add Certificate', 'cert.front': 'Front photo', 'cert.back': 'Back photo (optional)', 'cert.save': 'Save Certificate', 'cert.emptyTitle': 'No certificates yet', 'cert.emptySub': 'Upload your HACCP / hygiene certificates to show on the site',
        'flavour.add': 'Add Flavour', 'flavour.addTitle': 'Add Flavour', 'flavour.editTitle': 'Edit Flavour', 'flavour.name': 'Flavour Name', 'flavour.namePh': 'e.g. Chocolate', 'flavour.desc': 'Description', 'flavour.descPh': 'Short description of the flavour', 'flavour.gf': 'Gluten-free version available (+€5)', 'flavour.price': 'Price per kg (€) - optional', 'flavour.pricePh': 'e.g. 30', 'flavour.photo': 'Cross-section Photo', 'flavour.save': 'Save Flavour', 'flavour.emptyTitle': 'No flavours yet', 'flavour.emptySub': 'Add flavours with cross-section photos and prices',
        'review.add': 'Add Review', 'review.addTitle': 'Add Review', 'review.editTitle': 'Edit Review', 'review.name': 'Customer Name', 'review.rating': 'Rating', 'review.stars5': '5 Stars', 'review.stars4': '4 Stars', 'review.stars3': '3 Stars', 'review.text': 'Review Text', 'review.save': 'Save Review', 'review.emptyTitle': 'No reviews yet', 'review.emptySub': 'Add customer reviews to display on the website',
        'content.websiteStatus': 'Website status', 'siteOn': 'Website is ON', 'siteOff': 'Website is OFF', 'content.maintHint': 'When OFF, visitors see a "We\'ll be right back" maintenance screen instead of the site. Changes apply instantly.', 'content.msgOff': 'Message shown when website is OFF (optional)', 'content.msgPh': "e.g. We're on holiday until July 5th - see you soon!", 'content.saveMsg': 'Save message',
        'content.heroTitle': 'Home hero photo', 'content.heroHint': 'Shown big on the home page. Square photos look best. Leave empty for the default illustration.',
        'content.prices': 'Cake Prices', 'content.mini': 'Mini 5" (13 cm) price', 'content.maxi': 'Maxi 6" (15 cm) price', 'content.numOnly30': 'Number only, e.g. 30', 'content.numOnly35': 'Number only, e.g. 35',
        'content.weight': 'Weight prices', 'content.weightHint': 'List of weights and their fixed prices - shown in the custom order form.', 'content.addWeight': '+ Add weight', 'weight.weightPh': 'Weight, e.g. 1 kg', 'weight.pricePh': '€ price',
        'content.shed': 'Cake Shed Schedule', 'content.openDays': 'Open days', 'content.openHours': 'Opening hours', 'content.hoursPh': 'e.g. 10:00 - 17:00',
        'content.contact': 'Contact Info', 'content.phone': 'Phone', 'content.address': 'Address', 'content.insta': 'Instagram link', 'content.fb': 'Facebook link', 'content.save': 'Save Changes', 'content.saved': 'Changes saved!'
    },
    ua: {
        'login.title': 'Панель адміністратора', 'login.user': 'Логін', 'login.pass': 'Пароль', 'login.signin': 'Увійти', 'login.wrong': 'Невірний логін або пароль',
        'nav.orders': 'Замовлення', 'nav.cakes': 'Торти', 'nav.sizes': 'Розміри та ціни', 'nav.flavours': 'Смаки', 'nav.certificates': 'Сертифікати', 'nav.reviews': 'Відгуки', 'nav.content': 'Контент',
        'sizes.hint': 'Ці розміри та ціни застосовуються до кожного торта автоматично. Задайте їх тут один раз. За потреби можна змінити розміри для окремого торта в його формі.', 'sizes.add': '+ Додати розмір', 'sizes.fillStandard': '+ Додати стандартні розміри (6"-12")', 'sizes.save': 'Зберегти розміри',
        'ptable.title': 'Таблиця цін - усі торти', 'ptable.hint': 'Введіть ціну для кожного розміру по кожному торту. Залиште торт порожнім, щоб використати стандартні ціни вище. Заповніть лише деякі розміри, щоб пропонувати тільки їх.', 'ptable.cake': 'Торт', 'ptable.save': 'Зберегти всі ціни', 'ptable.needSizes': 'Спершу додайте хоча б один розмір вище та збережіть його - тоді тут зʼявиться таблиця.', 'ptable.empty': 'Тортів ще немає. Додайте торти у вкладці «Торти».', 'ptable.fixed': 'Фікс. €', 'ptable.search': 'Пошук торта…',
        'size.sizePh': 'Розмір (inch), напр. 8', 'size.servesPh': 'Порцій, напр. 15-18', 'size.pricePh': '€ ціна',
        'logout': 'Вийти', 'viewSite': 'Перейти на сайт →',
        'orders.searchPh': 'Пошук: ім\'я / телефон / код', 'orders.emptyTitle': 'Замовлень поки немає', 'orders.emptySub': 'Замовлення з форми на сайті з\'являться тут',
        'orders.allCaught': 'Усе опрацьовано', 'orders.allCaughtSub': 'Завершені замовлення приховані. Натисніть «Показати завершені», щоб побачити їх.',
        'hideCompleted': 'Приховати завершені', 'showCompleted': 'Показати завершені',
        'stats.new': 'Нові', 'stats.progress': 'В роботі', 'stats.done': 'Завершені',
        'status.new': 'Нове', 'status.confirmed': 'Підтверджено', 'status.progress': 'Готується', 'status.ready': 'Готово', 'status.done': 'Завершено', 'status.declined': 'Відхилено',
        'order.phone': 'Телефон', 'order.email': 'Ел. пошта', 'order.dateNeeded': 'Потрібно на дату', 'order.size': 'Розмір', 'order.flavour': 'Смак', 'order.total': 'Орієнт. сума', 'order.allergies': 'Алергії',
        'order.statusPage': 'Сторінка статусу →', 'order.noteLabel': 'Повідомлення клієнту (видно на сторінці статусу)', 'order.notePh': 'напр. Підтверджено! Ціна €45, готово в суботу.', 'order.saveMsg': 'Зберегти повідомлення', 'saved': 'Збережено ✓',
        'edit': 'Редагувати', 'delete': 'Видалити', 'selected': 'вибрано', 'selectAll': 'Вибрати всі', 'cancel': 'Скасувати', 'deleteSelected': 'Видалити вибрані', 'cancelSelection': 'Скасувати вибір', 'done': 'Готово', 'close': 'Закрити',
        'confirm.order': 'Видалити це замовлення?', 'confirm.cake': 'Видалити цей торт?', 'confirm.flavour': 'Видалити цей смак?', 'confirm.review': 'Видалити цей відгук?', 'confirm.cert': 'Видалити цей сертифікат?', 'confirm.cat': 'Видалити цю категорію? Її фото перейдуть у «Інше».',
        'alert.selectCakes': 'Спочатку виберіть торти.', 'alert.noCakesSort': 'Немає тортів для сортування. Спочатку додайте.', 'alert.certFront': 'Будь ласка, оберіть фото лицьового боку',
        'confirm.delCakesPre': 'Видалити ', 'confirm.delCakesPost': ' вибраних тортів?',
        'cakes.add': 'Додати торт', 'sortByCategory': 'Сортувати за категорією', 'selectToDelete': 'Вибрати для видалення', 'manageCategories': 'Керування категоріями', 'cakes.sortHint': 'Виберіть торти, потім призначте категорію', 'doneSorting': 'Готово', 'assignTo': 'Призначити до:', 'cakes.emptyTitle': 'Тортів поки немає', 'cakes.emptySub': 'Додайте торти з фото, розмірами та цінами - вони з\'являться на сайті для замовлення',
        'priceOnRequest': 'Ціна за домовленістю',
        'cakeModal.addTitle': 'Додати торт', 'cakeModal.editTitle': 'Редагувати торт', 'cake.name': 'Назва торта', 'cake.namePh': 'напр. Sunset Fields Art Cake', 'category': 'Категорія', 'newCategory': '+ Нова категорія', 'photo': 'Фото', 'photosHint': 'Можна додати кілька фото - перше головне (★); клієнти можуть гортати решту.', 'descOptional': 'Опис (необов\'язково)', 'descPh': 'Короткий опис',
        'cake.price': 'Ціна торта (€) - необов\'язково', 'cake.priceHint': 'Одна фіксована ціна за цей торт. Якщо вказана, використовується замість цін за розмірами нижче.',
        'sizesPrices': 'Розміри та ціни (необов\'язково)', 'sizesHint': 'Залиште порожнім, щоб використовувати глобальні «Розміри та ціни». Додавайте рядки лише щоб перевизначити їх для цього торта.', 'addSize': '+ Додати розмір', 'addAllSizes': '+ Додати всі стандартні розміри (6"-12")', 'availableFlavours': 'Доступні смаки', 'chooseFlavours': 'Обрати смаки', 'flavoursSuffix': 'вибрано', 'leadTime': 'Термін - за скільки днів замовляти', 'saveCake': 'Зберегти торт',
        'selectFlavours': 'Оберіть смаки', 'flavourPickHint': 'Торкніться смаків, доступних для цього торта. Щоб додати новий смак, скористайтеся вкладкою «Смаки».', 'flavoursNoneModal': 'Смаків поки немає. Спершу додайте їх у вкладці «Смаки».',
        'manageCatsHint': 'Додавайте, перейменовуйте або видаляйте категорії тортів.', 'addCategory': '+ Додати категорію', 'newCatPrompt': 'Назва нової категорії:',
        'cert.add': 'Додати сертифікат', 'cert.modalTitle': 'Додати сертифікат', 'cert.front': 'Фото лицьового боку', 'cert.back': 'Фото зворотного боку (необов\'язково)', 'cert.save': 'Зберегти сертифікат', 'cert.emptyTitle': 'Сертифікатів поки немає', 'cert.emptySub': 'Завантажте сертифікати HACCP / гігієни для показу на сайті',
        'flavour.add': 'Додати смак', 'flavour.addTitle': 'Додати смак', 'flavour.editTitle': 'Редагувати смак', 'flavour.name': 'Назва смаку', 'flavour.namePh': 'напр. Шоколад', 'flavour.desc': 'Опис', 'flavour.descPh': 'Короткий опис смаку', 'flavour.gf': 'Доступна безглютенова версія (+€5)', 'flavour.price': 'Ціна за кг (€) - необов\'язково', 'flavour.pricePh': 'напр. 30', 'flavour.photo': 'Фото розрізу', 'flavour.save': 'Зберегти смак', 'flavour.emptyTitle': 'Смаків поки немає', 'flavour.emptySub': 'Додайте смаки з фото розрізу та цінами',
        'review.add': 'Додати відгук', 'review.addTitle': 'Додати відгук', 'review.editTitle': 'Редагувати відгук', 'review.name': 'Ім\'я клієнта', 'review.rating': 'Оцінка', 'review.stars5': '5 зірок', 'review.stars4': '4 зірки', 'review.stars3': '3 зірки', 'review.text': 'Текст відгуку', 'review.save': 'Зберегти відгук', 'review.emptyTitle': 'Відгуків поки немає', 'review.emptySub': 'Додайте відгуки клієнтів для показу на сайті',
        'content.websiteStatus': 'Статус сайту', 'siteOn': 'Сайт УВІМКНЕНО', 'siteOff': 'Сайт ВИМКНЕНО', 'content.maintHint': 'Коли ВИМКНЕНО, відвідувачі бачать екран «Скоро повернемося» замість сайту. Зміни застосовуються миттєво.', 'content.msgOff': 'Повідомлення, коли сайт вимкнено (необов\'язково)', 'content.msgPh': 'напр. Ми у відпустці до 5 липня - до зустрічі!', 'content.saveMsg': 'Зберегти повідомлення',
        'content.heroTitle': 'Головне фото', 'content.heroHint': 'Показується великим на головній. Найкраще квадратні фото. Залиште порожнім для стандартної ілюстрації.',
        'content.prices': 'Ціни на торти', 'content.mini': 'Ціна Mini 5" (13 см)', 'content.maxi': 'Ціна Maxi 6" (15 см)', 'content.numOnly30': 'Лише число, напр. 30', 'content.numOnly35': 'Лише число, напр. 35',
        'content.weight': 'Ціни за вагою', 'content.weightHint': 'Список ваг та їх фіксованих цін - показується у формі кастомного замовлення.', 'content.addWeight': '+ Додати вагу', 'weight.weightPh': 'Вага, напр. 1 кг', 'weight.pricePh': '€ ціна',
        'content.shed': 'Розклад Cake Shed', 'content.openDays': 'Дні роботи', 'content.openHours': 'Години роботи', 'content.hoursPh': 'напр. 10:00 - 17:00',
        'content.contact': 'Контактна інформація', 'content.phone': 'Телефон', 'content.address': 'Адреса', 'content.insta': 'Посилання Instagram', 'content.fb': 'Посилання Facebook', 'content.save': 'Зберегти зміни', 'content.saved': 'Зміни збережено!'
    },
    ru: {
        'login.title': 'Панель администратора', 'login.user': 'Логин', 'login.pass': 'Пароль', 'login.signin': 'Войти', 'login.wrong': 'Неверный логин или пароль',
        'nav.orders': 'Заказы', 'nav.cakes': 'Торты', 'nav.sizes': 'Размеры и цены', 'nav.flavours': 'Вкусы', 'nav.certificates': 'Сертификаты', 'nav.reviews': 'Отзывы', 'nav.content': 'Контент',
        'sizes.hint': 'Эти размеры и цены применяются ко всем тортам автоматически. Задайте их здесь один раз. При необходимости можно переопределить размеры для отдельного торта в его форме.', 'sizes.add': '+ Добавить размер', 'sizes.fillStandard': '+ Добавить стандартные размеры (6"-12")', 'sizes.save': 'Сохранить размеры',
        'ptable.title': 'Таблица цен - все торты', 'ptable.hint': 'Впишите цену для каждого размера по каждому торту. Оставьте торт пустым, чтобы использовать стандартные цены выше. Заполните только некоторые размеры, чтобы предлагать лишь их.', 'ptable.cake': 'Торт', 'ptable.save': 'Сохранить все цены', 'ptable.needSizes': 'Сначала добавьте хотя бы один размер выше и сохраните его - тогда здесь появится таблица.', 'ptable.empty': 'Тортов пока нет. Добавьте торты во вкладке «Торты».', 'ptable.fixed': 'Фикс. €', 'ptable.search': 'Поиск торта…',
        'size.sizePh': 'Размер (inch), напр. 8', 'size.servesPh': 'Порций, напр. 15-18', 'size.pricePh': '€ цена',
        'logout': 'Выйти', 'viewSite': 'Открыть сайт →',
        'orders.searchPh': 'Поиск: имя / телефон / код', 'orders.emptyTitle': 'Заказов пока нет', 'orders.emptySub': 'Заказы с формы на сайте появятся здесь',
        'orders.allCaught': 'Всё обработано', 'orders.allCaughtSub': 'Завершённые заказы скрыты. Нажмите «Показать завершённые», чтобы увидеть их.',
        'hideCompleted': 'Скрыть завершённые', 'showCompleted': 'Показать завершённые',
        'stats.new': 'Новые', 'stats.progress': 'В работе', 'stats.done': 'Завершённые',
        'status.new': 'Новый', 'status.confirmed': 'Подтверждён', 'status.progress': 'Готовится', 'status.ready': 'Готов', 'status.done': 'Завершён', 'status.declined': 'Отклонён',
        'order.phone': 'Телефон', 'order.email': 'Эл. почта', 'order.dateNeeded': 'Нужно к дате', 'order.size': 'Размер', 'order.flavour': 'Вкус', 'order.total': 'Ориент. сумма', 'order.allergies': 'Аллергии',
        'order.statusPage': 'Страница статуса →', 'order.noteLabel': 'Сообщение клиенту (видно на его странице статуса)', 'order.notePh': 'напр. Подтверждено! Цена €45, готово в субботу.', 'order.saveMsg': 'Сохранить сообщение', 'saved': 'Сохранено ✓',
        'edit': 'Изменить', 'delete': 'Удалить', 'selected': 'выбрано', 'selectAll': 'Выбрать все', 'cancel': 'Отмена', 'deleteSelected': 'Удалить выбранные', 'cancelSelection': 'Отменить выбор', 'done': 'Готово', 'close': 'Закрыть',
        'confirm.order': 'Удалить этот заказ?', 'confirm.cake': 'Удалить этот торт?', 'confirm.flavour': 'Удалить этот вкус?', 'confirm.review': 'Удалить этот отзыв?', 'confirm.cert': 'Удалить этот сертификат?', 'confirm.cat': 'Удалить эту категорию? Её фото перейдут в «Другое».',
        'alert.selectCakes': 'Сначала выберите торты.', 'alert.noCakesSort': 'Нет тортов для сортировки. Сначала добавьте.', 'alert.certFront': 'Пожалуйста, выберите фото лицевой стороны',
        'confirm.delCakesPre': 'Удалить ', 'confirm.delCakesPost': ' выбранных тортов?',
        'cakes.add': 'Добавить торт', 'sortByCategory': 'Сортировать по категории', 'selectToDelete': 'Выбрать для удаления', 'manageCategories': 'Управление категориями', 'cakes.sortHint': 'Выберите торты, затем назначьте категорию', 'doneSorting': 'Готово', 'assignTo': 'Назначить в:', 'cakes.emptyTitle': 'Тортов пока нет', 'cakes.emptySub': 'Добавьте торты с фото, размерами и ценами - они появятся на сайте для заказа',
        'priceOnRequest': 'Цена по договорённости',
        'cakeModal.addTitle': 'Добавить торт', 'cakeModal.editTitle': 'Изменить торт', 'cake.name': 'Название торта', 'cake.namePh': 'напр. Sunset Fields Art Cake', 'category': 'Категория', 'newCategory': '+ Новая категория', 'photo': 'Фото', 'photosHint': 'Можно добавить несколько фото - первое главное (★); клиенты могут листать остальные.', 'descOptional': 'Описание (необязательно)', 'descPh': 'Краткое описание',
        'cake.price': 'Цена торта (€) - необязательно', 'cake.priceHint': 'Одна фиксированная цена за торт. Если указана, используется вместо цен по размерам ниже.',
        'sizesPrices': 'Размеры и цены (необязательно)', 'sizesHint': 'Оставьте пустым, чтобы использовать глобальные «Размеры и цены». Добавляйте строки только чтобы переопределить их для этого торта.', 'addSize': '+ Добавить размер', 'addAllSizes': '+ Добавить все стандартные размеры (6"-12")', 'availableFlavours': 'Доступные вкусы', 'chooseFlavours': 'Выбрать вкусы', 'flavoursSuffix': 'выбрано', 'leadTime': 'Срок - за сколько дней заказывать', 'saveCake': 'Сохранить торт',
        'selectFlavours': 'Выберите вкусы', 'flavourPickHint': 'Нажмите вкусы, доступные для этого торта. Чтобы добавить новый вкус, используйте вкладку «Вкусы».', 'flavoursNoneModal': 'Вкусов пока нет. Сначала добавьте их во вкладке «Вкусы».',
        'manageCatsHint': 'Добавляйте, переименовывайте или удаляйте категории тортов.', 'addCategory': '+ Добавить категорию', 'newCatPrompt': 'Название новой категории:',
        'cert.add': 'Добавить сертификат', 'cert.modalTitle': 'Добавить сертификат', 'cert.front': 'Фото лицевой стороны', 'cert.back': 'Фото обратной стороны (необязательно)', 'cert.save': 'Сохранить сертификат', 'cert.emptyTitle': 'Сертификатов пока нет', 'cert.emptySub': 'Загрузите сертификаты HACCP / гигиены для показа на сайте',
        'flavour.add': 'Добавить вкус', 'flavour.addTitle': 'Добавить вкус', 'flavour.editTitle': 'Изменить вкус', 'flavour.name': 'Название вкуса', 'flavour.namePh': 'напр. Шоколад', 'flavour.desc': 'Описание', 'flavour.descPh': 'Краткое описание вкуса', 'flavour.gf': 'Доступна безглютеновая версия (+€5)', 'flavour.price': 'Цена за кг (€) - необязательно', 'flavour.pricePh': 'напр. 30', 'flavour.photo': 'Фото разреза', 'flavour.save': 'Сохранить вкус', 'flavour.emptyTitle': 'Вкусов пока нет', 'flavour.emptySub': 'Добавьте вкусы с фото разреза и ценами',
        'review.add': 'Добавить отзыв', 'review.addTitle': 'Добавить отзыв', 'review.editTitle': 'Изменить отзыв', 'review.name': 'Имя клиента', 'review.rating': 'Оценка', 'review.stars5': '5 звёзд', 'review.stars4': '4 звезды', 'review.stars3': '3 звезды', 'review.text': 'Текст отзыва', 'review.save': 'Сохранить отзыв', 'review.emptyTitle': 'Отзывов пока нет', 'review.emptySub': 'Добавьте отзывы клиентов для показа на сайте',
        'content.websiteStatus': 'Статус сайта', 'siteOn': 'Сайт ВКЛЮЧЁН', 'siteOff': 'Сайт ВЫКЛЮЧЕН', 'content.maintHint': 'Когда ВЫКЛЮЧЕНО, посетители видят экран «Скоро вернёмся» вместо сайта. Изменения применяются мгновенно.', 'content.msgOff': 'Сообщение, когда сайт выключен (необязательно)', 'content.msgPh': 'напр. Мы в отпуске до 5 июля - до встречи!', 'content.saveMsg': 'Сохранить сообщение',
        'content.heroTitle': 'Главное фото', 'content.heroHint': 'Показывается большим на главной. Лучше всего квадратные фото. Оставьте пустым для стандартной иллюстрации.',
        'content.prices': 'Цены на торты', 'content.mini': 'Цена Mini 5" (13 см)', 'content.maxi': 'Цена Maxi 6" (15 см)', 'content.numOnly30': 'Только число, напр. 30', 'content.numOnly35': 'Только число, напр. 35',
        'content.weight': 'Цены за вес', 'content.weightHint': 'Список весов и их фиксированных цен - показывается в форме кастомного заказа.', 'content.addWeight': '+ Добавить вес', 'weight.weightPh': 'Вес, напр. 1 кг', 'weight.pricePh': '€ цена',
        'content.shed': 'Расписание Cake Shed', 'content.openDays': 'Рабочие дни', 'content.openHours': 'Часы работы', 'content.hoursPh': 'напр. 10:00 - 17:00',
        'content.contact': 'Контактная информация', 'content.phone': 'Телефон', 'content.address': 'Адрес', 'content.insta': 'Ссылка Instagram', 'content.fb': 'Ссылка Facebook', 'content.save': 'Сохранить изменения', 'content.saved': 'Изменения сохранены!'
    }
};
var aLang = 'en';
function at(k) { var t = A[aLang] || A.en; return (t[k] != null ? t[k] : (A.en[k] != null ? A.en[k] : k)); }

function applyAdminI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var v = at(el.getAttribute('data-i18n'));
        if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        var v = at(el.getAttribute('data-i18n-placeholder'));
        if (v != null) el.placeholder = v;
    });
    var active = document.querySelector('.sidebar__link.active');
    if (active && topbarTitle) topbarTitle.textContent = at('nav.' + active.dataset.tab);
    document.querySelectorAll('.admin-lang .lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.lang === aLang);
    });
    var tdb = document.getElementById('toggleDoneBtn');
    if (tdb) tdb.textContent = hideCompleted ? at('showCompleted') : at('hideCompleted');
    var stl = document.getElementById('siteStatusLabel');
    var stt = document.getElementById('siteEnabledToggle');
    if (stl && stt) stl.textContent = stt.checked ? at('siteOn') : at('siteOff');
    // Re-render dynamic lists in the new language
    if (typeof loadOrders === 'function') loadOrders();
    if (typeof loadCakes === 'function') loadCakes();
    if (typeof loadFlavours === 'function') loadFlavours();
    if (typeof loadReviews === 'function') loadReviews();
    if (typeof loadCertificates === 'function') loadCertificates();
    if (typeof renderGlobalSizes === 'function') renderGlobalSizes();
    if (typeof renderPriceTable === 'function') renderPriceTable();
}

function initAdminLang() {
    document.querySelectorAll('.admin-lang .lang-btn').forEach(function(b) {
        b.addEventListener('click', function() {
            aLang = this.dataset.lang;
            localStorage.setItem('ines-admin-lang', aLang);
            applyAdminI18n();
        });
    });
}

// ===== AUTH (Firebase Authentication) =====
var loginScreen = document.getElementById('loginScreen');
var adminPanel = document.getElementById('adminPanel');
var loginForm = document.getElementById('loginForm');
var loginError = document.getElementById('loginError');
var sidebarUser = document.getElementById('sidebarUser');
var _adminDataLoaded = false;

function showAdmin(user) {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'flex';
    if (sidebarUser) sidebarUser.textContent = (user && user.email) || 'Admin';
    if (!_adminDataLoaded) { _adminDataLoaded = true; loadAllData(); }
    applyAdminI18n();
}

function showLogin() {
    loginScreen.style.display = '';
    adminPanel.style.display = 'none';
}

// Reacts to sign-in / sign-out. Fires on page load with the current session.
function checkAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        loginError.textContent = 'Auth unavailable. Please reload.';
        return;
    }
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Mark this browser as admin so the public site lets us through
            // even when it's switched OFF (see inesIsAdmin in firebase-init.js).
            try { localStorage.setItem('ines-admin', '1'); } catch (e) {}
            showAdmin(user);
        } else {
            try { localStorage.removeItem('ines-admin'); } catch (e) {}
            showLogin();
        }
    });
}
initAdminLang();

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;
    loginError.textContent = '';
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(err) {
        loginError.textContent = at('login.wrong');
        console.warn('Sign-in failed:', err && err.code);
    });
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    firebase.auth().signOut().then(function() { location.reload(); });
});

// ===== TABS =====
var tabButtons = document.querySelectorAll('.sidebar__link');
var tabContents = document.querySelectorAll('.tab-content');
var topbarTitle = document.getElementById('topbarTitle');

var tabTitles = {
    orders: 'Orders',
    cakes: 'Cakes',
    sizes: 'Sizes & Prices',
    gallery: 'Gallery',
    certificates: 'Certificates',
    flavours: 'Flavours',
    reviews: 'Reviews',
    content: 'Content'
};

function switchTab(tab) {
    tabButtons.forEach(function(b) { b.classList.remove('active'); });
    tabContents.forEach(function(t) { t.classList.remove('active'); });
    var btn = document.querySelector('[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    var content = document.getElementById('tab-' + tab);
    if (content) content.classList.add('active');
    topbarTitle.textContent = at('nav.' + tab) || tabTitles[tab] || tab;
    localStorage.setItem('ines-admin-tab', tab);
}

tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
        var sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    });
});

var savedTab = localStorage.getItem('ines-admin-tab');
if (savedTab) switchTab(savedTab);

// Mobile sidebar toggle
var adminBurger = document.getElementById('adminBurger');
var sidebar = document.querySelector('.sidebar');

adminBurger.addEventListener('click', function() {
    sidebar.classList.toggle('open');
});

// ===== ORDERS =====
var ORDER_STATUSES = [
    { id: 'new', label: 'New' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'progress', label: 'Being made' },
    { id: 'ready', label: 'Ready' },
    { id: 'done', label: 'Completed' },
    { id: 'declined', label: 'Declined' }
];

function adminNormalizePhone(phone) {
    var digits = String(phone || '').replace(/[^0-9]/g, '');
    if (digits.indexOf('353') === 0) return digits;
    if (digits.indexOf('0') === 0) return '353' + digits.slice(1);
    return digits;
}

function adminWaMessage(order) {
    var code = order.code || '';
    var lang = order.lang || 'en';
    if (lang === 'ua') return 'Вітаємо! Це пекарня I.N.E.S. щодо вашого замовлення ' + code + '.';
    if (lang === 'ru') return 'Здравствуйте! Это пекарня I.N.E.S. по вашему заказу ' + code + '.';
    return 'Hello! This is I.N.E.S. Bakery regarding your order ' + code + '.';
}

var hideCompleted = localStorage.getItem('ines-hide-done') === '1';
var orderSearch = '';

(function() {
    var input = document.getElementById('orderSearch');
    if (!input) return;
    input.addEventListener('input', function() {
        orderSearch = this.value.trim().toLowerCase();
        loadOrders();
    });
})();

function orderMatchesSearch(o) {
    if (!orderSearch) return true;
    var hay = [(o.name || ''), (o.phone || ''), (o.code || ''), (o.email || '')].join(' ').toLowerCase();
    return hay.indexOf(orderSearch) > -1;
}

function isCompleted(o) {
    var s = (o && o.status) || 'new';
    return s === 'done' || s === 'declined';
}

(function() {
    var btn = document.getElementById('toggleDoneBtn');
    if (!btn) return;
    function syncLabel() { btn.textContent = hideCompleted ? at('showCompleted') : at('hideCompleted'); }
    syncLabel();
    btn.addEventListener('click', function() {
        hideCompleted = !hideCompleted;
        localStorage.setItem('ines-hide-done', hideCompleted ? '1' : '0');
        syncLabel();
        loadOrders();
    });
})();

function notifyClientStatus(order) {
    if (!order || !order.email || order.email.indexOf('@') < 0) return;
    try {
        fetch('/api/notify-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: order.email,
                name: order.name || '',
                code: order.code || '',
                status: order.status || 'new',
                note: order.note || '',
                lang: order.lang || 'en'
            })
        }).then(function(r) {
            if (!r.ok) console.warn('Status email not sent (HTTP ' + r.status + ')');
        }).catch(function(e) { console.warn('Status email error', e); });
    } catch (e) { console.warn('Status email error', e); }
}

// Orders are stored as push-keyed children (older ones may still be an array).
// Normalise either shape to a list of { key, o }.
function ordersToEntries(raw) {
    var entries = [];
    if (!raw) return entries;
    if (Array.isArray(raw)) {
        raw.forEach(function(o, i) { if (o) entries.push({ key: String(i), o: o }); });
    } else {
        Object.keys(raw).forEach(function(k) { if (raw[k]) entries.push({ key: k, o: raw[k] }); });
    }
    return entries;
}

// Non-personal fields mirrored to the public order-status node (for tracking).
function orderStatusSubset(o) {
    return {
        status: o.status || 'new',
        note: o.note || '',
        date: o.date || '',
        cakeSize: o.cakeSize || '',
        flavour: o.flavour || '',
        total: o.total || '',
        submitted: o.submitted || ''
    };
}

// One-time: ensure every existing order has a public status record so it can
// be tracked. New orders create theirs on submit; this covers older ones.
var _orderStatusBackfilled = false;
function backfillOrderStatus(entries) {
    if (_orderStatusBackfilled) return;
    _orderStatusBackfilled = true;
    entries.forEach(function(e) {
        if (e.o && e.o.code) fbUpdate('order-status/' + e.o.code, orderStatusSubset(e.o));
    });
}

function loadOrders() {
    var entries = ordersToEntries(getData('orders', null));
    backfillOrderStatus(entries);
    var byKey = {};
    entries.forEach(function(e) { byKey[e.key] = e.o; });

    var list = document.getElementById('ordersList');
    var stats = document.getElementById('orderStats');

    if (!entries.length) {
        list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><p>' + at('orders.emptyTitle') + '</p><span>' + at('orders.emptySub') + '</span></div>';
        stats.innerHTML = '';
        return;
    }

    var counts = { new: 0, active: 0, done: 0 };
    entries.forEach(function(e) {
        var s = e.o.status || 'new';
        if (s === 'new') counts.new++;
        else if (s === 'done' || s === 'declined') counts.done++;
        else counts.active++;
    });

    stats.innerHTML =
        '<span class="stat-badge"><span class="dot dot--new"></span> ' + at('stats.new') + ': ' + counts.new + '</span>' +
        '<span class="stat-badge"><span class="dot dot--progress"></span> ' + at('stats.progress') + ': ' + counts.active + '</span>' +
        '<span class="stat-badge"><span class="dot dot--done"></span> ' + at('stats.done') + ': ' + counts.done + '</span>';

    var html = '';
    var shown = 0;
    for (var i = entries.length - 1; i >= 0; i--) {
        var key = entries[i].key;
        var o = entries[i].o;
        if (hideCompleted && isCompleted(o)) continue;
        if (!orderMatchesSearch(o)) continue;
        shown++;
        var status = o.status || 'new';

        var statusOptions = '';
        for (var s = 0; s < ORDER_STATUSES.length; s++) {
            statusOptions += '<option value="' + ORDER_STATUSES[s].id + '"' +
                (status === ORDER_STATUSES[s].id ? ' selected' : '') + '>' +
                at('status.' + ORDER_STATUSES[s].id) + '</option>';
        }

        var waLink = o.phone
            ? 'https://wa.me/' + adminNormalizePhone(o.phone) + '?text=' + encodeURIComponent(adminWaMessage(o))
            : '';
        var trackLink = o.code ? 'order?code=' + encodeURIComponent(o.code) : '';

        html += '<div class="order-card order-card--' + status + '">' +
            '<div class="order-card__header">' +
                '<span class="order-card__name">' + escapeHtml(o.name) +
                    (o.code ? ' <span class="order-card__code">' + escapeHtml(o.code) + '</span>' : '') +
                '</span>' +
                '<span class="order-card__date">' + escapeHtml(o.submitted || '') + '</span>' +
            '</div>' +
            '<div class="order-card__details">' +
                '<div class="order-card__detail"><strong>' + at('order.phone') + ':</strong> ' + escapeHtml(o.phone) + '</div>' +
                (o.email ? '<div class="order-card__detail"><strong>' + at('order.email') + ':</strong> ' + escapeHtml(o.email) + '</div>' : '') +
                '<div class="order-card__detail"><strong>' + at('order.dateNeeded') + ':</strong> ' + escapeHtml(o.date) + '</div>' +
                '<div class="order-card__detail"><strong>' + at('order.size') + ':</strong> ' + escapeHtml(o.cakeSize) + (o.customDiameter ? ' (' + escapeHtml(o.customDiameter) + '")' : '') + '</div>' +
                (o.flavour ? '<div class="order-card__detail"><strong>' + at('order.flavour') + ':</strong> ' + escapeHtml(o.flavour) + '</div>' : '') +
                (o.total ? '<div class="order-card__detail"><strong>' + at('order.total') + ':</strong> ' + escapeHtml(o.total) + '</div>' : '') +
                (o.allergies ? '<div class="order-card__detail"><strong>' + at('order.allergies') + ':</strong> ' + escapeHtml(o.allergies) + '</div>' : '') +
            '</div>' +
            (o.message ? '<div class="order-card__message">' + escapeHtml(o.message) + '</div>' : '') +
            (o.photo ? '<div class="order-card__photo"><img src="' + o.photo + '" alt="Reference" style="max-width:200px;border-radius:8px;margin-bottom:12px;"></div>' : '') +
            '<div class="order-card__contact">' +
                (waLink ? '<a href="' + waLink + '" target="_blank" class="order-wa-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.6 6.3A7.85 7.85 0 0012 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1A7.94 7.94 0 0012 19.9a7.94 7.94 0 005.6-13.6zM12 18.5a6.6 6.6 0 01-3.4-.9l-.24-.15-2.5.65.67-2.43-.16-.25A6.59 6.59 0 1118.6 12 6.6 6.6 0 0112 18.5z"/></svg> WhatsApp</a>' : '') +
                (trackLink ? '<a href="' + trackLink + '" target="_blank" class="order-track-link">' + at('order.statusPage') + '</a>' : '') +
            '</div>' +
            '<div class="order-card__note">' +
                '<label>' + at('order.noteLabel') + '</label>' +
                '<textarea class="order-note-input" data-note-id="' + key + '" rows="2" placeholder="' + at('order.notePh') + '">' + escapeHtml(o.note || '') + '</textarea>' +
                '<button class="btn-admin order-note-save" data-note-save="' + key + '">' + at('order.saveMsg') + '</button>' +
                '<span class="order-note-status" data-note-status="' + key + '"></span>' +
            '</div>' +
            '<div class="order-card__actions">' +
                '<select class="status-select" data-order-key="' + key + '">' + statusOptions + '</select>' +
                '<button class="btn-delete" data-order-del="' + key + '">' + at('delete') + '</button>' +
            '</div>' +
        '</div>';
    }
    if (shown === 0) {
        html = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M20 6L9 17l-5-5"/></svg><p>' + at('orders.allCaught') + '</p><span>' + at('orders.allCaughtSub') + '</span></div>';
    }
    // Preserve any unsaved message drafts across the re-render.
    var _noteDrafts = {};
    list.querySelectorAll('.order-note-input').forEach(function(ta) { _noteDrafts[ta.dataset.noteId] = ta.value; });
    list.innerHTML = html;
    list.querySelectorAll('.order-note-input').forEach(function(ta) {
        if (_noteDrafts[ta.dataset.noteId] != null) ta.value = _noteDrafts[ta.dataset.noteId];
    });

    list.querySelectorAll('.status-select').forEach(function(sel) {
        sel.addEventListener('change', function() {
            var key = this.dataset.orderKey;
            var o = byKey[key];
            if (!o) return;
            // Keep whatever message is currently typed in this card.
            var ta = list.querySelector('[data-note-id="' + key + '"]');
            if (ta) o.note = ta.value;
            o.status = this.value;
            fbUpdate('orders/' + key, { status: o.status, note: o.note });
            if (o.code) fbUpdate('order-status/' + o.code, { status: o.status, note: o.note });
            notifyClientStatus(o);
            // The orders listener re-renders once the write propagates.
        });
    });

    list.querySelectorAll('[data-note-save]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var key = this.dataset.noteSave;
            var o = byKey[key];
            if (!o) return;
            var ta = list.querySelector('[data-note-id="' + key + '"]');
            o.note = ta ? ta.value : (o.note || '');
            fbUpdate('orders/' + key, { note: o.note });
            if (o.code) fbUpdate('order-status/' + o.code, { note: o.note });
            var statusEl = list.querySelector('[data-note-status="' + key + '"]');
            if (statusEl) {
                statusEl.textContent = at('saved');
                setTimeout(function() { statusEl.textContent = ''; }, 2500);
            }
        });
    });

    list.querySelectorAll('[data-order-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm(at('confirm.order'))) return;
            var key = this.dataset.orderDel;
            var o = byKey[key];
            fbRemove('orders/' + key);
            if (o && o.code) fbRemove('order-status/' + o.code);
        });
    });
}

// ===== GALLERY =====
var pendingUploadCategory = '';

function loadGallery() {
    var gallery = getData('gallery-cat', null);
    if (!gallery) gallery = {};
    var container = document.getElementById('galleryAdmin');

    var hasAny = false;
    for (var k in gallery) {
        if (gallery[k] && gallery[k].length > 0) { hasAny = true; break; }
    }

    if (!hasAny) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>No photos yet</p><span>Upload photos of your cakes to display in the gallery</span></div>';
        return;
    }

    var html = '';
    for (var c = 0; c < CATEGORIES.length; c++) {
        var cat = CATEGORIES[c];
        var photos = gallery[cat.id] || [];
        if (photos.length === 0) continue;

        html += '<div class="gallery-cat-section">' +
            '<div class="gallery-cat-header"><h3>' + escapeHtml(cat.en) + '</h3><span class="gallery-cat-count">' + photos.length + ' photos</span></div>' +
            '<div class="gallery-admin">';

        for (var p = 0; p < photos.length; p++) {
            html += '<div class="gallery-admin-item" data-cat="' + cat.id + '" data-idx="' + p + '">' +
                '<img src="' + photos[p] + '" alt="' + escapeHtml(cat.en) + '">' +
                '<div class="gallery-admin-item__check">✓</div>' +
                '<button class="gallery-admin-item__delete" data-cat="' + cat.id + '" data-idx="' + p + '">&times;</button>' +
            '</div>';
        }
        html += '</div></div>';
    }
    container.innerHTML = html;

    if (gallerySelectMode) {
        container.classList.add('gallery-admin--selecting');
        container.querySelectorAll('.gallery-admin-item').forEach(function(item) {
            var key = item.dataset.cat + '#' + item.dataset.idx;
            if (gallerySelected[key]) item.classList.add('selected');
            item.addEventListener('click', function() {
                var k = this.dataset.cat + '#' + this.dataset.idx;
                if (gallerySelected[k]) { delete gallerySelected[k]; this.classList.remove('selected'); }
                else { gallerySelected[k] = { cat: this.dataset.cat, idx: parseInt(this.dataset.idx) }; this.classList.add('selected'); }
                updateGalleryDelCount();
            });
        });
        updateGalleryDelCount();
    } else {
        container.classList.remove('gallery-admin--selecting');
        container.querySelectorAll('.gallery-admin-item__delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm('Delete this photo?')) return;
                var catId = this.dataset.cat;
                var idx = parseInt(this.dataset.idx);
                var gallery = getData('gallery-cat', {});
                if (gallery[catId]) {
                    gallery[catId].splice(idx, 1);
                    setData('gallery-cat', gallery);
                }
                loadGallery();
            });
        });
    }
}

// ===== GALLERY MULTI-DELETE =====
var gallerySelectMode = false;
var gallerySelected = {};

function updateGalleryDelCount() {
    var n = Object.keys(gallerySelected).length;
    var el = document.getElementById('galleryDelCount');
    if (el) el.textContent = n + ' selected';
}

function exitGalleryDeleteMode() {
    gallerySelectMode = false;
    gallerySelected = {};
    var bar = document.getElementById('galleryDelBar');
    if (bar) bar.style.display = 'none';
    var btn = document.getElementById('multiDeleteBtn');
    if (btn) btn.textContent = 'Select to delete';
    loadGallery();
}

(function initGalleryMultiDelete() {
    var btn = document.getElementById('multiDeleteBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        if (gallerySelectMode) { exitGalleryDeleteMode(); return; }
        gallerySelectMode = true;
        gallerySelected = {};
        this.textContent = 'Cancel selection';
        document.getElementById('galleryDelBar').style.display = 'flex';
        loadGallery();
    });

    document.getElementById('galleryDelCancel').addEventListener('click', exitGalleryDeleteMode);

    document.getElementById('gallerySelectAllDel').addEventListener('click', function() {
        var items = document.querySelectorAll('#galleryAdmin .gallery-admin-item');
        var allSelected = items.length > 0 && Object.keys(gallerySelected).length === items.length;
        gallerySelected = {};
        items.forEach(function(item) {
            if (!allSelected) {
                gallerySelected[item.dataset.cat + '#' + item.dataset.idx] = { cat: item.dataset.cat, idx: parseInt(item.dataset.idx) };
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        updateGalleryDelCount();
    });

    document.getElementById('galleryDeleteSelected').addEventListener('click', function() {
        var keys = Object.keys(gallerySelected);
        if (!keys.length) { alert('Select photos first.'); return; }
        if (!confirm('Delete ' + keys.length + ' selected photo(s)?')) return;

        var gallery = getData('gallery-cat', {}) || {};
        var byCat = {};
        keys.forEach(function(k) {
            var sel = gallerySelected[k];
            if (!byCat[sel.cat]) byCat[sel.cat] = [];
            byCat[sel.cat].push(sel.idx);
        });
        for (var cat in byCat) {
            if (!gallery[cat]) continue;
            byCat[cat].sort(function(a, b) { return b - a; }).forEach(function(idx) {
                gallery[cat].splice(idx, 1);
            });
        }
        setData('gallery-cat', gallery);
        exitGalleryDeleteMode();
    });
})();

function compressImage(file, maxSize, quality, callback) {
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var w = img.width;
            var h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                else { w = Math.round(w * maxSize / h); h = maxSize; }
            }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = function() { alert('Could not load image: ' + file.name); };
        img.src = ev.target.result;
    };
    reader.onerror = function() { alert('Could not read file: ' + file.name); };
    reader.readAsDataURL(file);
}

// ===== LIGHTWEIGHT CATALOGUE =====
// The public home & gallery pages read a small 'catalog' node (names, prices,
// categories + a small thumbnail) instead of the full ~12 MB products node.
// Each product keeps a small `thumb`; the catalog is a cheap projection of it.
function coverOf(c) {
    if (!c) return null;
    return (c.photos && c.photos.length && c.photos[0]) || c.photo || null;
}

// Downscale an existing data-URL (not a File) to a small JPEG thumbnail.
function makeThumb(dataUrl, maxSize, quality, cb) {
    if (!dataUrl) { cb(null); return; }
    var img = new Image();
    img.onload = function() {
        var w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
            if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
            else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        try { cb(canvas.toDataURL('image/jpeg', quality)); }
        catch (e) { cb(dataUrl); }
    };
    img.onerror = function() { cb(dataUrl); };
    img.src = dataUrl;
}

function buildCatalog(cakes) {
    return (cakes || []).map(function(c) {
        if (!c) return null;
        return {
            name: c.name || '',
            category: c.category || 'other',
            price: c.price || '',
            sizes: c.sizes || [],
            noticeDays: c.noticeDays != null ? c.noticeDays : 0,
            flavours: c.flavours || [],
            instaUrl: c.instaUrl || '',
            fbUrl: c.fbUrl || '',
            thumb: c.thumb || coverOf(c) || null
        };
    });
}

// Write the catalog without the usual error alert: if the 'catalog' security
// rule isn't published yet, skip quietly (public pages fall back to products).
function writeCatalog(cakes) {
    var cat = buildCatalog(cakes);
    _cache['catalog'] = cat;
    try {
        db.ref('catalog').set(cat).catch(function(err) {
            console.warn('catalog write skipped:', err && err.message);
        });
    } catch (e) {}
}

// Save products and refresh the derived catalog together.
function saveProducts(cakes, callback) {
    setData('products', cakes, callback);
    writeCatalog(cakes);
}

// One-time: ensure every cake has a small thumb and the catalog exists. Runs
// once after products first load in the admin (the only place with write
// access). Generates any missing thumbnails, then writes products + catalog.
var _catalogEnsured = false;
function ensureCatalog() {
    if (_catalogEnsured) return;
    var cakes = getData('products', null);
    if (!Array.isArray(cakes)) return; // products not loaded yet
    _catalogEnsured = true;

    var pending = 0, addedThumb = false;
    function done() {
        if (addedThumb) setData('products', cakes); // persist newly made thumbs
        writeCatalog(cakes);
        console.log('Catalog ready:', cakes.length, 'items');
    }
    cakes.forEach(function(c) {
        if (!c || c.thumb || !coverOf(c)) return;
        pending++;
        makeThumb(coverOf(c), 400, 0.6, function(th) {
            if (th) { c.thumb = th; addedThumb = true; }
            if (--pending === 0) done();
        });
    });
    if (pending === 0) done();
}

function addCategory(callback) {
    var name = prompt(at('newCatPrompt'));
    if (!name) return;
    name = name.trim();
    if (!name) return;
    var id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('cat' + Date.now());
    // ensure unique id
    var exists = CATEGORIES.some(function(c) { return c.id === id; });
    if (exists) id = id + '-' + Date.now();
    var newCat = { id: id, en: name, ua: name, ru: name };

    fbGetOnce('categories', function(cats) {
        if (!cats || !cats.length) cats = DEFAULT_CATEGORIES.slice();
        // insert before "other" if present
        var otherIdx = cats.findIndex(function(c) { return c.id === 'other'; });
        if (otherIdx > -1) cats.splice(otherIdx, 0, newCat);
        else cats.push(newCat);
        setData('categories', cats);
        if (callback) callback(id);
    });
}

function renderManageCats() {
    var list = document.getElementById('catsManageList');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        var c = CATEGORIES[i];
        html += '<div class="cat-manage-row" data-cat-id="' + c.id + '">' +
            '<input type="text" class="cat-manage-input" value="' + escapeHtml(c.en) + '" data-cat-id="' + c.id + '">' +
            '<button class="btn-delete cat-manage-del" data-cat-id="' + c.id + '">' + at('delete') + '</button>' +
        '</div>';
    }
    list.innerHTML = html;

    list.querySelectorAll('.cat-manage-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.catId;
            if (!confirm(at('confirm.cat'))) return;
            // move photos to other
            fbGetOnce('gallery-cat', function(gallery) {
                if (!gallery) gallery = {};
                if (gallery[catId] && gallery[catId].length) {
                    if (!gallery['other']) gallery['other'] = [];
                    gallery['other'] = gallery['other'].concat(gallery[catId]);
                }
                delete gallery[catId];
                setData('gallery-cat', gallery);
            });
            var cats = CATEGORIES.filter(function(c) { return c.id !== catId; });
            setData('categories', cats);
        });
    });

    list.querySelectorAll('.cat-manage-input').forEach(function(input) {
        input.addEventListener('change', function() {
            var catId = this.dataset.catId;
            var newName = this.value.trim();
            if (!newName) return;
            var cats = CATEGORIES.map(function(c) {
                if (c.id === catId) return { id: c.id, en: newName, ua: newName, ru: newName };
                return c;
            });
            setData('categories', cats);
        });
    });
}

document.getElementById('manageCatsBtn').addEventListener('click', function() {
    renderManageCats();
    document.getElementById('manageCatsModal').style.display = 'flex';
});
document.getElementById('cakesManageCatsBtn').addEventListener('click', function() {
    renderManageCats();
    document.getElementById('manageCatsModal').style.display = 'flex';
});
document.getElementById('manageCatsClose').addEventListener('click', function() {
    document.getElementById('manageCatsModal').style.display = 'none';
});
document.querySelector('#manageCatsModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('manageCatsModal').style.display = 'none';
});
document.getElementById('manageAddCatBtn').addEventListener('click', function() {
    addCategory();
});

function showCategoryModal() {
    var picker = document.getElementById('categoryPick');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="category-pick-btn" data-cat-id="' + CATEGORIES[i].id + '">' + escapeHtml(CATEGORIES[i].en) + '</button>';
    }
    html += '<button class="category-pick-btn category-pick-btn--add" id="addCategoryBtn">+ New category</button>';
    picker.innerHTML = html;
    document.getElementById('categoryModal').style.display = 'flex';

    picker.querySelectorAll('.category-pick-btn').forEach(function(btn) {
        if (btn.id === 'addCategoryBtn') {
            btn.addEventListener('click', function() {
                addCategory(function(newId) {
                    pendingUploadCategory = newId;
                    document.getElementById('categoryModal').style.display = 'none';
                    document.getElementById('galleryUpload').click();
                });
            });
            return;
        }
        btn.addEventListener('click', function() {
            pendingUploadCategory = this.dataset.catId;
            document.getElementById('categoryModal').style.display = 'none';
            document.getElementById('galleryUpload').click();
        });
    });
}

document.getElementById('addPhotoBtn').addEventListener('click', function() {
    showCategoryModal();
});

document.getElementById('categoryCancel').addEventListener('click', function() {
    document.getElementById('categoryModal').style.display = 'none';
});

document.querySelector('#categoryModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('categoryModal').style.display = 'none';
});

document.getElementById('galleryUpload').addEventListener('change', function(e) {
    var fileList = e.target.files;
    if (!fileList.length || !pendingUploadCategory) return;

    var savedFiles = [];
    for (var f = 0; f < fileList.length; f++) savedFiles.push(fileList[f]);

    var catId = pendingUploadCategory;
    var total = savedFiles.length;
    var loaded = 0;

    e.target.value = '';
    pendingUploadCategory = '';

    fbGetOnce('gallery-cat', function(gallery) {
        if (!gallery) gallery = {};
        if (!gallery[catId]) gallery[catId] = [];

        for (var i = 0; i < savedFiles.length; i++) {
            (function(file) {
                compressImage(file, 800, 0.7, function(dataUrl) {
                    gallery[catId].push(dataUrl);
                    loaded++;
                    if (loaded === total) {
                        setData('gallery-cat', gallery);
                    }
                });
            })(savedFiles[i]);
        }
    });
});

// ===== SORT BY CATEGORY =====
var sortPanel = document.getElementById('sortPanel');
var sortGrid = document.getElementById('sortGrid');
var galleryAdminContainer = document.getElementById('galleryAdmin');

var sortSelection = {};

function catLabelById(catId) {
    for (var c = 0; c < CATEGORIES.length; c++) {
        if (CATEGORIES[c].id === catId) return CATEGORIES[c].en;
    }
    return '';
}

function updateSortCount() {
    var n = Object.keys(sortSelection).length;
    document.getElementById('sortCount').textContent = n + ' selected';
    document.getElementById('sortAssign').style.display = n > 0 ? 'flex' : 'none';
}

function renderSortAssign() {
    var bar = document.getElementById('sortAssign');
    var html = '<span class="sort-assign__label">Assign to:</span>';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="sort-assign__btn" data-assign="' + CATEGORIES[i].id + '">' + escapeHtml(CATEGORIES[i].en) + '</button>';
    }
    bar.innerHTML = html;
    bar.querySelectorAll('[data-assign]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.assign;
            Object.keys(sortSelection).forEach(function(idx) {
                window._sortPhotos[idx].cat = catId;
                var item = sortGrid.querySelector('[data-sort-idx="' + idx + '"]');
                if (item) {
                    item.classList.add('sorted');
                    item.classList.remove('selected');
                    var oldBadge = item.querySelector('.sort-item__badge');
                    if (oldBadge) oldBadge.remove();
                    var badge = document.createElement('div');
                    badge.className = 'sort-item__badge';
                    badge.textContent = catLabelById(catId);
                    item.appendChild(badge);
                }
            });
            sortSelection = {};
            updateSortCount();
        });
    });
}

document.getElementById('sortPhotosBtn').addEventListener('click', function() {
    var catGallery = getData('gallery-cat', {}) || {};
    var oldPhotos = getData('gallery', []) || [];

    var allPhotos = [];
    for (var i = 0; i < oldPhotos.length; i++) {
        allPhotos.push({ src: oldPhotos[i], cat: null });
    }
    for (var catId in catGallery) {
        var arr = catGallery[catId];
        for (var j = 0; j < arr.length; j++) {
            allPhotos.push({ src: arr[j], cat: catId });
        }
    }

    if (allPhotos.length === 0) {
        alert('No photos to sort. Upload some first!');
        return;
    }

    sortSelection = {};
    sortPanel.style.display = 'block';
    galleryAdminContainer.style.display = 'none';
    document.querySelector('#tab-gallery .tab-header').style.display = 'none';

    var html = '';
    for (var k = 0; k < allPhotos.length; k++) {
        var p = allPhotos[k];
        var catLabel = p.cat ? catLabelById(p.cat) : '';
        html += '<div class="sort-item' + (p.cat ? ' sorted' : '') + '" data-sort-idx="' + k + '">' +
            '<img src="' + p.src + '" alt="photo">' +
            '<div class="sort-item__check">✓</div>' +
            (catLabel ? '<div class="sort-item__badge">' + escapeHtml(catLabel) + '</div>' : '') +
        '</div>';
    }
    sortGrid.innerHTML = html;
    window._sortPhotos = allPhotos;

    renderSortAssign();
    updateSortCount();

    sortGrid.querySelectorAll('.sort-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var idx = this.dataset.sortIdx;
            if (sortSelection[idx]) {
                delete sortSelection[idx];
                this.classList.remove('selected');
            } else {
                sortSelection[idx] = true;
                this.classList.add('selected');
            }
            updateSortCount();
        });
    });
});

document.getElementById('sortSelectAll').addEventListener('click', function() {
    var items = sortGrid.querySelectorAll('.sort-item');
    var allSelected = Object.keys(sortSelection).length === items.length;
    sortSelection = {};
    items.forEach(function(item) {
        if (allSelected) {
            item.classList.remove('selected');
        } else {
            sortSelection[item.dataset.sortIdx] = true;
            item.classList.add('selected');
        }
    });
    updateSortCount();
});

document.getElementById('sortDone').addEventListener('click', function() {
    var photos = window._sortPhotos || [];
    var newGallery = {};

    for (var i = 0; i < photos.length; i++) {
        var cat = photos[i].cat;
        if (!cat) cat = 'other';
        if (!newGallery[cat]) newGallery[cat] = [];
        newGallery[cat].push(photos[i].src);
    }

    try {
        setData('gallery-cat', newGallery);
        localStorage.removeItem('ines-gallery');
    } catch(e) {
        alert('Storage full!');
        return;
    }

    sortPanel.style.display = 'none';
    galleryAdminContainer.style.display = '';
    document.querySelector('#tab-gallery .tab-header').style.display = '';
    loadGallery();
});

// ===== CERTIFICATES =====
function certFrontSrc(c) { return (typeof c === 'string') ? c : (c && c.front); }
function certBackSrc(c) { return (typeof c === 'string') ? null : (c && c.back); }

function loadCertificates() {
    var certs = getData('certificates', null) || [];
    var container = document.getElementById('certificatesAdmin');

    if (certs.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/></svg><p>' + at('cert.emptyTitle') + '</p><span>' + at('cert.emptySub') + '</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < certs.length; i++) {
        var hasBack = certBackSrc(certs[i]) ? '<span class="cert-admin-item__badge">2 sides</span>' : '';
        html += '<div class="cert-admin-item">' +
            '<img src="' + certFrontSrc(certs[i]) + '" alt="Certificate">' +
            hasBack +
            '<button class="cert-admin-item__delete" data-cert-del="' + i + '">&times;</button>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-cert-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm(at('confirm.cert'))) return;
            var idx = parseInt(this.dataset.certDel);
            var certs = getData('certificates', []) || [];
            certs.splice(idx, 1);
            setData('certificates', certs);
        });
    });
}

var certFrontData = null;
var certBackData = null;

document.getElementById('addCertBtn').addEventListener('click', function() {
    certFrontData = null;
    certBackData = null;
    document.getElementById('certFront').value = '';
    document.getElementById('certBack').value = '';
    document.getElementById('certFrontPreview').innerHTML = '';
    document.getElementById('certBackPreview').innerHTML = '';
    document.getElementById('certModal').style.display = 'flex';
});

document.getElementById('certCancel').addEventListener('click', function() {
    document.getElementById('certModal').style.display = 'none';
});
document.querySelector('#certModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('certModal').style.display = 'none';
});

document.getElementById('certFront').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 1400, 0.82, function(dataUrl) {
        certFrontData = dataUrl;
        document.getElementById('certFrontPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:120px;border-radius:6px;">';
    });
});

document.getElementById('certBack').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 1400, 0.82, function(dataUrl) {
        certBackData = dataUrl;
        document.getElementById('certBackPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:120px;border-radius:6px;">';
    });
});

document.getElementById('certSave').addEventListener('click', function() {
    if (!certFrontData) { alert(at('alert.certFront')); return; }
    var cert = { front: certFrontData, back: certBackData || null };
    fbGetOnce('certificates', function(certs) {
        if (!certs) certs = [];
        certs.push(cert);
        setData('certificates', certs);
        document.getElementById('certModal').style.display = 'none';
    });
});

// ===== FLAVOURS =====
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
var flavoursSeeded = false;

function loadFlavours() {
    var flavours = getData('flavours', null);
    if (!flavours) flavours = [];
    var container = document.getElementById('flavoursAdmin');

    if (flavours.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M12 2a7 7 0 00-7 7c0 2 1 3 1 5h12c0-2 1-3 1-5a7 7 0 00-7-7z"/><line x1="6" y1="18" x2="18" y2="18"/></svg><p>' + at('flavour.emptyTitle') + '</p><span>' + at('flavour.emptySub') + '</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < flavours.length; i++) {
        var f = flavours[i];
        var imgHtml = f.photo
            ? '<img src="' + f.photo + '" class="flavour-admin-card__img" alt="' + escapeHtml(f.name) + '">'
            : '<div class="flavour-admin-card__placeholder"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
        html += '<div class="flavour-admin-card">' +
            imgHtml +
            '<div class="flavour-admin-card__body">' +
                '<div class="flavour-admin-card__name">' + escapeHtml(f.name) + '</div>' +
                (f.desc ? '<div class="flavour-admin-card__desc">' + escapeHtml(f.desc) + '</div>' : '') +
                (f.price ? '<div class="flavour-admin-card__price">+ €' + escapeHtml(f.price) + '</div>' : '') +
                '<div class="flavour-admin-card__actions">' +
                    '<button class="btn-edit" data-flavour-edit="' + i + '">' + at('edit') + '</button>' +
                    '<button class="btn-delete" data-flavour-del="' + i + '">' + at('delete') + '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-flavour-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm(at('confirm.flavour'))) return;
            var idx = parseInt(this.dataset.flavourDel);
            var flavours = getData('flavours', []) || [];
            flavours.splice(idx, 1);
            setData('flavours', flavours);
        });
    });

    container.querySelectorAll('[data-flavour-edit]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.flavourEdit);
            var flavours = getData('flavours', []) || [];
            var f = flavours[idx];
            document.getElementById('flavourEditId').value = idx;
            document.getElementById('flavourName').value = f.name || '';
            document.getElementById('flavourDesc').value = f.desc || '';
            document.getElementById('flavourPrice').value = f.price || '';
            document.getElementById('flavourGF').checked = !!f.glutenFree;
            pendingFlavourPhoto = f.photo || null;
            document.getElementById('flavourPhotoPreview').innerHTML = f.photo ? '<img src="' + f.photo + '" style="max-width:120px;border-radius:8px;">' : '';
            document.getElementById('flavourModalTitle').textContent = at('flavour.editTitle');
            document.getElementById('flavourModal').style.display = 'flex';
        });
    });
}

var pendingFlavourPhoto = null;

document.getElementById('addFlavourBtn').addEventListener('click', function() {
    document.getElementById('flavourEditId').value = '';
    document.getElementById('flavourName').value = '';
    document.getElementById('flavourDesc').value = '';
    document.getElementById('flavourPrice').value = '';
    document.getElementById('flavourGF').checked = false;
    document.getElementById('flavourPhotoPreview').innerHTML = '';
    pendingFlavourPhoto = null;
    document.getElementById('flavourModalTitle').textContent = at('flavour.addTitle');
    document.getElementById('flavourModal').style.display = 'flex';
});

document.getElementById('flavourCancel').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'none';
});

document.querySelector('#flavourModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('flavourModal').style.display = 'none';
});

document.getElementById('flavourPhoto').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    compressImage(file, 600, 0.7, function(dataUrl) {
        pendingFlavourPhoto = dataUrl;
        document.getElementById('flavourPhotoPreview').innerHTML = '<img src="' + dataUrl + '" style="max-width:120px;border-radius:8px;">';
    });
});

document.getElementById('flavourForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var editId = document.getElementById('flavourEditId').value;
    var flavour = {
        name: document.getElementById('flavourName').value.trim(),
        desc: document.getElementById('flavourDesc').value.trim(),
        price: document.getElementById('flavourPrice').value.trim(),
        glutenFree: document.getElementById('flavourGF').checked,
        photo: pendingFlavourPhoto || null
    };

    var flavours = getData('flavours', []) || [];
    if (editId !== '') {
        flavours[parseInt(editId)] = flavour;
    } else {
        flavours.push(flavour);
    }
    setData('flavours', flavours);
    document.getElementById('flavourModal').style.display = 'none';
});

// ===== REVIEWS =====
function loadReviews() {
    var reviews = getData('reviews', null);
    if (!reviews) reviews = [];
    var container = document.getElementById('reviewsAdmin');

    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg><p>' + at('review.emptyTitle') + '</p><span>' + at('review.emptySub') + '</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < reviews.length; i++) {
        var r = reviews[i];
        var stars = '';
        for (var s = 0; s < r.rating; s++) stars += '★';

        html += '<div class="review-admin-card">' +
            (r.photo ? '<img class="review-admin-card__photo" src="' + r.photo + '" alt="">' : '') +
            '<div class="review-admin-card__content">' +
                '<div class="review-admin-card__stars">' + stars + '</div>' +
                '<p class="review-admin-card__text">"' + escapeHtml(r.text) + '"</p>' +
                '<p class="review-admin-card__author">- ' + escapeHtml(r.author) + '</p>' +
            '</div>' +
            '<div class="review-admin-card__actions">' +
                '<button class="btn-edit" data-review-edit="' + i + '">' + at('edit') + '</button>' +
                '<button class="btn-delete" data-review-del="' + i + '">' + at('delete') + '</button>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-review-del]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!confirm(at('confirm.review'))) return;
            var idx = parseInt(this.dataset.reviewDel);
            var reviews = getData('reviews', []);
            reviews.splice(idx, 1);
            setData('reviews', reviews);
            loadReviews();
        });
    });

    container.querySelectorAll('[data-review-edit]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.dataset.reviewEdit);
            var reviews = getData('reviews', []);
            var r = reviews[idx];
            document.getElementById('reviewEditId').value = idx;
            document.getElementById('reviewAuthor').value = r.author;
            document.getElementById('reviewRating').value = r.rating;
            document.getElementById('reviewText').value = r.text;
            document.getElementById('reviewModalTitle').textContent = at('review.editTitle');
            document.getElementById('reviewModal').style.display = 'flex';
        });
    });
}

document.getElementById('addReviewBtn').addEventListener('click', function() {
    document.getElementById('reviewEditId').value = '';
    document.getElementById('reviewAuthor').value = '';
    document.getElementById('reviewRating').value = '5';
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewModalTitle').textContent = at('review.addTitle');
    document.getElementById('reviewModal').style.display = 'flex';
});

document.getElementById('reviewCancel').addEventListener('click', function() {
    document.getElementById('reviewModal').style.display = 'none';
});

document.querySelector('#reviewModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('reviewModal').style.display = 'none';
});

document.getElementById('reviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var editId = document.getElementById('reviewEditId').value;
    var review = {
        author: document.getElementById('reviewAuthor').value.trim(),
        rating: parseInt(document.getElementById('reviewRating').value),
        text: document.getElementById('reviewText').value.trim()
    };

    var reviews = getData('reviews', []);

    if (editId !== '') {
        reviews[parseInt(editId)] = review;
    } else {
        reviews.push(review);
    }

    setData('reviews', reviews);
    document.getElementById('reviewModal').style.display = 'none';
    loadReviews();
});

// ===== SITE ON/OFF =====
var siteEnabledToggle = document.getElementById('siteEnabledToggle');
var siteStatusLabel = document.getElementById('siteStatusLabel');
var siteMessageInput = document.getElementById('siteMessage');

function writeSiteStatus() {
    setData('site-status', {
        enabled: siteEnabledToggle.checked,
        message: siteMessageInput.value.trim()
    });
}

if (siteEnabledToggle) {
    siteEnabledToggle.addEventListener('change', function() {
        siteStatusLabel.textContent = this.checked ? at('siteOn') : at('siteOff');
        writeSiteStatus();
    });
}

var saveSiteMessageBtn = document.getElementById('saveSiteMessage');
if (saveSiteMessageBtn) {
    saveSiteMessageBtn.addEventListener('click', function() {
        writeSiteStatus();
        var b = this;
        b.textContent = at('saved');
        setTimeout(function() { b.textContent = at('content.saveMsg'); }, 2000);
    });
}

function updateSiteToggle(s) {
    if (!siteEnabledToggle) return;
    var enabled = !s || s.enabled !== false;
    siteEnabledToggle.checked = enabled;
    siteStatusLabel.textContent = enabled ? at('siteOn') : at('siteOff');
    if (document.activeElement !== siteMessageInput) {
        siteMessageInput.value = (s && s.message) || '';
    }
}

// ===== CONTENT =====
var pendingHeroPhoto = null;
function renderHeroPhotoPreview() {
    var wrap = document.getElementById('heroPhotoPreview');
    if (!wrap) return;
    wrap.innerHTML = pendingHeroPhoto
        ? '<div class="cake-photo-thumb cake-photo-thumb--main"><img src="' + pendingHeroPhoto + '" alt=""><button type="button" class="cake-photo-thumb__del" id="heroPhotoDel" aria-label="Remove">&times;</button></div>'
        : '';
    var del = document.getElementById('heroPhotoDel');
    if (del) del.addEventListener('click', function() { pendingHeroPhoto = null; renderHeroPhotoPreview(); });
}
(function() {
    var inp = document.getElementById('heroPhotoInput');
    if (inp) inp.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        compressImage(file, 800, 0.8, function(dataUrl) { pendingHeroPhoto = dataUrl; renderHeroPhotoPreview(); });
        e.target.value = '';
    });
})();

// Cake Shed weekly menu image (kept a bit larger/sharper so its text stays readable).
var pendingShedMenu = null;
function renderShedMenuPreview() {
    var wrap = document.getElementById('shedMenuPreview');
    if (!wrap) return;
    wrap.innerHTML = pendingShedMenu
        ? '<div class="cake-photo-thumb cake-photo-thumb--main"><img src="' + pendingShedMenu + '" alt=""><button type="button" class="cake-photo-thumb__del" id="shedMenuDel" aria-label="Remove">&times;</button></div>'
        : '';
    var del = document.getElementById('shedMenuDel');
    if (del) del.addEventListener('click', function() { pendingShedMenu = null; renderShedMenuPreview(); });
}
(function() {
    var inp = document.getElementById('shedMenuInput');
    if (inp) inp.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        compressImage(file, 1200, 0.85, function(dataUrl) { pendingShedMenu = dataUrl; renderShedMenuPreview(); });
        e.target.value = '';
    });
})();

function loadContent() {
    var content = getData('content', null);
    if (!content) return;
    var fields = document.querySelectorAll('[data-key]');
    fields.forEach(function(field) {
        var key = field.dataset.key;
        if (content[key] !== undefined) {
            field.value = content[key];
        }
    });
    pendingHeroPhoto = content.heroPhoto || null;
    renderHeroPhotoPreview();
    pendingShedMenu = content.shedMenu || null;
    renderShedMenuPreview();
}

document.getElementById('saveContentBtn').addEventListener('click', function() {
    var content = {};
    document.querySelectorAll('[data-key]').forEach(function(field) {
        content[field.dataset.key] = field.value.trim();
    });
    if (pendingHeroPhoto) content.heroPhoto = pendingHeroPhoto;
    if (pendingShedMenu) content.shedMenu = pendingShedMenu;
    setData('content', content);
    var status = document.getElementById('saveStatus');
    status.textContent = at('content.saved');
    setTimeout(function() { status.textContent = ''; }, 3000);
});

// ===== HELPERS =====
function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== CAKES CATALOGUE =====
var pendingCakePhotos = [];
function renderCakePhotos() {
    var wrap = document.getElementById('cakePhotoPreview');
    if (!wrap) return;
    wrap.innerHTML = '';
    pendingCakePhotos.forEach(function(src, idx) {
        var item = document.createElement('div');
        item.className = 'cake-photo-thumb' + (idx === 0 ? ' cake-photo-thumb--main' : '');
        item.innerHTML = '<img src="' + src + '" alt="">' +
            '<button type="button" class="cake-photo-thumb__del" aria-label="Remove">&times;</button>' +
            (idx === 0 ? '<span class="cake-photo-thumb__badge">★</span>' : '<button type="button" class="cake-photo-thumb__main" title="Make main">★</button>');
        item.querySelector('.cake-photo-thumb__del').addEventListener('click', function() {
            pendingCakePhotos.splice(idx, 1);
            renderCakePhotos();
        });
        var mainBtn = item.querySelector('.cake-photo-thumb__main');
        if (mainBtn) mainBtn.addEventListener('click', function() {
            var p = pendingCakePhotos.splice(idx, 1)[0];
            pendingCakePhotos.unshift(p);
            renderCakePhotos();
        });
        wrap.appendChild(item);
    });
}

var STANDARD_SIZES = [
    { size: '6"', serves: '6-8' },
    { size: '7"', serves: '10-13' },
    { size: '8"', serves: '15-18' },
    { size: '9"', serves: '20-25' },
    { size: '10"', serves: '30-35' },
    { size: '11"', serves: '40-45' },
    { size: '12"', serves: '50-55' }
];
// Global default sizes & prices, applied to every cake unless the cake overrides them.
function globalSizes() {
    var g = getData('default-sizes', null);
    return (g && g.length) ? g : [];
}
function addAllStandardSizes() {
    var src = globalSizes();
    if (src.length) src.forEach(function(s) { addCakeSizeRow(s.size, s.serves, s.price); });
    else STANDARD_SIZES.forEach(function(s) { addCakeSizeRow(s.size, s.serves, ''); });
}

// ----- Global Sizes & Prices tab -----
function addGlobalSizeRow(size, serves, price) {
    var wrap = document.getElementById('globalSizesList');
    if (!wrap) return;
    var row = document.createElement('div');
    row.className = 'cake-size-row';
    row.innerHTML =
        '<input type="text" class="gs-size" placeholder="' + at('size.sizePh') + '" value="' + escapeHtml(size || '') + '">' +
        '<input type="text" class="gs-serves" placeholder="' + at('size.servesPh') + '" value="' + escapeHtml(serves || '') + '">' +
        '<input type="text" class="gs-price" placeholder="' + at('size.pricePh') + '" value="' + escapeHtml(price != null ? String(price) : '') + '">' +
        '<button type="button" class="cake-size-row__del" aria-label="Remove">&times;</button>';
    row.querySelector('.cake-size-row__del').addEventListener('click', function() { row.remove(); });
    wrap.appendChild(row);
}
function renderGlobalSizes() {
    var wrap = document.getElementById('globalSizesList');
    if (!wrap) return;
    wrap.innerHTML = '';
    var list = getData('default-sizes', null);
    if (list && list.length) list.forEach(function(s) { if (s) addGlobalSizeRow(s.size, s.serves, s.price); });
    else STANDARD_SIZES.forEach(function(s) { addGlobalSizeRow(s.size, s.serves, ''); });
}
function gatherGlobalSizes() {
    var list = [];
    document.querySelectorAll('#globalSizesList .cake-size-row').forEach(function(r) {
        var s = r.querySelector('.gs-size').value.trim();
        var sv = r.querySelector('.gs-serves').value.trim();
        var p = r.querySelector('.gs-price').value.trim();
        if (s || p) list.push({ size: s, serves: sv, price: p });
    });
    return list;
}
(function() {
    var add = document.getElementById('addGlobalSizeBtn');
    if (add) add.addEventListener('click', function() { addGlobalSizeRow('', '', ''); });
    var fill = document.getElementById('fillStdGlobalSizesBtn');
    if (fill) fill.addEventListener('click', function() { STANDARD_SIZES.forEach(function(s) { addGlobalSizeRow(s.size, s.serves, ''); }); });
    var save = document.getElementById('saveGlobalSizesBtn');
    if (save) save.addEventListener('click', function() {
        setData('default-sizes', gatherGlobalSizes());
        var st = document.getElementById('globalSizesStatus');
        if (st) { st.textContent = at('content.saved'); setTimeout(function() { st.textContent = ''; }, 3000); }
    });
})();

// ----- Bulk price table: every cake × every global size -----
function priceForSize(cake, sizeLabel) {
    if (!cake || !cake.sizes) return '';
    for (var i = 0; i < cake.sizes.length; i++) {
        if (cake.sizes[i] && cake.sizes[i].size === sizeLabel) {
            return cake.sizes[i].price != null ? String(cake.sizes[i].price) : '';
        }
    }
    return '';
}
function renderPriceTable() {
    var wrap = document.getElementById('priceTableWrap');
    if (!wrap) return;
    var sizes = globalSizes();
    if (!sizes.length) { wrap.innerHTML = '<p class="price-table__msg">' + at('ptable.needSizes') + '</p>'; return; }
    var cakes = getData('products', null) || [];
    if (!cakes.length) { wrap.innerHTML = '<p class="price-table__msg">' + at('ptable.empty') + '</p>'; return; }

    var head = '<th class="price-table__cakecol">' + at('ptable.cake') + '</th>';
    for (var s = 0; s < sizes.length; s++) {
        head += '<th>' + escapeHtml(sizes[s].size || '') + '</th>';
    }
    var rows = '';
    for (var i = 0; i < cakes.length; i++) {
        var c = cakes[i] || {};
        var nameCell = '<td class="price-table__cakecol"><div class="price-table__cakeinner">' +
            (c.photo ? '<img class="price-table__thumb" src="' + c.photo + '" alt="">' : '') +
            '<span>' + escapeHtml(c.name || '') + '</span></div></td>';
        var cells = '';
        if (c.price) {
            cells = '<td colspan="' + sizes.length + '" class="price-table__fixed">' + at('ptable.fixed') + escapeHtml(c.price) + '</td>';
        } else {
            for (var s2 = 0; s2 < sizes.length; s2++) {
                cells += '<td><input type="text" inputmode="decimal" class="price-table__input" data-cake="' + i + '" data-size="' + s2 + '" value="' + escapeHtml(priceForSize(c, sizes[s2].size)) + '"></td>';
            }
        }
        rows += '<tr data-row="' + i + '" data-name="' + escapeHtml((c.name || '').toLowerCase()) + '">' + nameCell + cells + '</tr>';
    }
    wrap.innerHTML = '<div class="price-table__scroll"><table class="price-table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';

    // Enter / arrow-down jumps to the cell below (fast column entry)
    wrap.querySelectorAll('.price-table__input').forEach(function(inp) {
        inp.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();
            var sz = this.getAttribute('data-size');
            var col = wrap.querySelectorAll('.price-table__input[data-size="' + sz + '"]');
            var idx = -1;
            for (var k = 0; k < col.length; k++) if (col[k] === this) { idx = k; break; }
            var next = col[idx + (e.key === 'ArrowUp' ? -1 : 1)];
            if (next) { next.focus(); next.select(); }
        });
    });
}
function savePriceTable() {
    var cakes = getData('products', null) || [];
    var sizes = globalSizes();
    if (!sizes.length || !cakes.length) return;
    document.querySelectorAll('#priceTableWrap tbody tr').forEach(function(tr) {
        var i = parseInt(tr.getAttribute('data-row'));
        var c = cakes[i];
        if (!c || c.price) return; // fixed-price cakes are left untouched
        var newSizes = [];
        tr.querySelectorAll('.price-table__input').forEach(function(inp) {
            var p = inp.value.trim();
            var sIdx = parseInt(inp.getAttribute('data-size'));
            var gs = sizes[sIdx];
            if (p && gs) newSizes.push({ size: gs.size, serves: gs.serves, price: p });
        });
        if (newSizes.length) c.sizes = newSizes;
        else delete c.sizes;
    });
    saveProducts(cakes);
    var st = document.getElementById('priceTableStatus');
    if (st) { st.textContent = at('content.saved'); setTimeout(function() { st.textContent = ''; }, 3000); }
}
(function() {
    var save = document.getElementById('savePriceTableBtn');
    if (save) save.addEventListener('click', savePriceTable);
    var search = document.getElementById('priceTableSearch');
    if (search) search.addEventListener('input', function() {
        var q = this.value.trim().toLowerCase();
        document.querySelectorAll('#priceTableWrap tbody tr').forEach(function(tr) {
            tr.style.display = (!q || tr.getAttribute('data-name').indexOf(q) > -1) ? '' : 'none';
        });
    });
})();

function priceRange(sizes) {
    if (!sizes || !sizes.length) return at('priceOnRequest');
    var nums = sizes.map(function(s) { return parseFloat(s.price); }).filter(function(n) { return !isNaN(n); });
    if (!nums.length) return at('priceOnRequest');
    var min = Math.min.apply(null, nums);
    var max = Math.max.apply(null, nums);
    return min === max ? ('€' + min) : ('€' + min + ' - €' + max);
}

function catNameById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].en;
    return id || '';
}

function loadCakes() {
    var cakes = getData('products', null) || [];
    var container = document.getElementById('cakesAdmin');
    if (!container) return;

    if (cakes.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C8963E" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21v-8a7 7 0 0114 0v8"/><path d="M12 6V3"/></svg><p>' + at('cakes.emptyTitle') + '</p><span>' + at('cakes.emptySub') + '</span></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < cakes.length; i++) {
        var c = cakes[i];
        var img = c.photo
            ? '<img src="' + c.photo + '" alt="' + escapeHtml(c.name) + '">'
            : '<div class="cake-admin-card__noimg"></div>';
        html += '<div class="cake-admin-card" data-idx="' + i + '">' +
            '<div class="cake-admin-card__check">✓</div>' +
            img +
            '<div class="cake-admin-card__body">' +
                '<div class="cake-admin-card__name">' + escapeHtml(c.name) + '</div>' +
                '<div class="cake-admin-card__meta">' + escapeHtml(catNameById(c.category)) + ' · ' + (c.price ? '€' + escapeHtml(c.price) : priceRange((c.sizes && c.sizes.length) ? c.sizes : globalSizes())) + '</div>' +
                '<div class="cake-admin-card__actions">' +
                    '<button class="btn-edit" data-cake-edit="' + i + '">' + at('edit') + '</button>' +
                    '<button class="btn-delete" data-cake-del="' + i + '">' + at('delete') + '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;

    if (cakeDeleteMode) {
        container.classList.add('cakes-admin--selecting');
        container.querySelectorAll('.cake-admin-card').forEach(function(card) {
            if (cakeDeleteSelected[card.dataset.idx]) card.classList.add('selected');
            card.addEventListener('click', function() {
                var idx = this.dataset.idx;
                if (cakeDeleteSelected[idx]) { delete cakeDeleteSelected[idx]; this.classList.remove('selected'); }
                else { cakeDeleteSelected[idx] = true; this.classList.add('selected'); }
                updateCakesDelCount();
            });
        });
        updateCakesDelCount();
    } else {
        container.classList.remove('cakes-admin--selecting');
        container.querySelectorAll('[data-cake-edit]').forEach(function(btn) {
            btn.addEventListener('click', function() { openCakeModal(parseInt(this.dataset.cakeEdit)); });
        });
        container.querySelectorAll('[data-cake-del]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (!confirm(at('confirm.cake'))) return;
                var cakes = getData('products', []) || [];
                cakes.splice(parseInt(this.dataset.cakeDel), 1);
                saveProducts(cakes);
            });
        });
    }
}

// ===== CAKES MULTI-DELETE =====
var cakeDeleteMode = false;
var cakeDeleteSelected = {};

function updateCakesDelCount() {
    var el = document.getElementById('cakesDelCount');
    if (el) el.textContent = Object.keys(cakeDeleteSelected).length + ' ' + at('selected');
}
function exitCakesDeleteMode() {
    cakeDeleteMode = false;
    cakeDeleteSelected = {};
    var bar = document.getElementById('cakesDelBar');
    if (bar) bar.style.display = 'none';
    var btn = document.getElementById('cakesMultiDeleteBtn');
    if (btn) { var sp = btn.querySelector('span'); if (sp) sp.textContent = at('selectToDelete'); else btn.textContent = at('selectToDelete'); }
    loadCakes();
}
(function initCakesMultiDelete() {
    var btn = document.getElementById('cakesMultiDeleteBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        if (cakeDeleteMode) { exitCakesDeleteMode(); return; }
        cakeDeleteMode = true;
        cakeDeleteSelected = {};
        var sp0 = this.querySelector('span'); if (sp0) sp0.textContent = at('cancelSelection'); else this.textContent = at('cancelSelection');
        document.getElementById('cakesDelBar').style.display = 'flex';
        loadCakes();
    });
    document.getElementById('cakesDelCancel').addEventListener('click', exitCakesDeleteMode);
    document.getElementById('cakesSelectAllDel').addEventListener('click', function() {
        var cards = document.querySelectorAll('#cakesAdmin .cake-admin-card');
        var allSel = cards.length > 0 && Object.keys(cakeDeleteSelected).length === cards.length;
        cakeDeleteSelected = {};
        cards.forEach(function(card) {
            if (allSel) card.classList.remove('selected');
            else { cakeDeleteSelected[card.dataset.idx] = true; card.classList.add('selected'); }
        });
        updateCakesDelCount();
    });
    document.getElementById('cakesDeleteSelected').addEventListener('click', function() {
        var keys = Object.keys(cakeDeleteSelected).map(Number);
        if (!keys.length) { alert(at('alert.selectCakes')); return; }
        if (!confirm(at('confirm.delCakesPre') + keys.length + at('confirm.delCakesPost'))) return;
        var cakes = getData('products', []) || [];
        keys.sort(function(a, b) { return b - a; }).forEach(function(idx) { cakes.splice(idx, 1); });
        saveProducts(cakes);
        exitCakesDeleteMode();
    });
})();

function populateCakeCategorySelect(selected) {
    var sel = document.getElementById('cakeCategory');
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<option value="' + CATEGORIES[i].id + '"' + (CATEGORIES[i].id === selected ? ' selected' : '') + '>' + escapeHtml(CATEGORIES[i].en) + '</option>';
    }
    sel.innerHTML = html;
}

var cakeSelectedFlavours = [];

function renderCakeFlavoursSelected() {
    var box = document.getElementById('cakeFlavoursSelected');
    var txt = document.getElementById('cakeFlavourText');
    if (cakeSelectedFlavours.length) {
        txt.textContent = cakeSelectedFlavours.length + ' ' + at('flavoursSuffix');
        box.innerHTML = cakeSelectedFlavours.map(function(n) {
            return '<span class="flavour-chip">' + escapeHtml(n) + '<button type="button" class="flavour-chip__x" data-rm="' + escapeHtml(n) + '">&times;</button></span>';
        }).join('');
        box.querySelectorAll('[data-rm]').forEach(function(b) {
            b.addEventListener('click', function() {
                var n = this.getAttribute('data-rm');
                cakeSelectedFlavours = cakeSelectedFlavours.filter(function(x) { return x !== n; });
                renderCakeFlavoursSelected();
            });
        });
    } else {
        txt.textContent = at('chooseFlavours');
        box.innerHTML = '';
    }
}

function openCakeFlavourModal() {
    var flavours = getData('flavours', null) || DEFAULT_FLAVOURS;
    var grid = document.getElementById('cakeFlavourGrid');
    if (!flavours.length) {
        grid.innerHTML = '<p class="content-hint">' + at('flavoursNoneModal') + '</p>';
    } else {
        grid.innerHTML = flavours.map(function(f) {
            var sel = cakeSelectedFlavours.indexOf(f.name) > -1;
            var img = f.photo
                ? '<img src="' + f.photo + '" class="flavour-pick-card__img" alt="">'
                : '<div class="flavour-pick-card__ph"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
            return '<div class="flavour-pick-card' + (sel ? ' selected' : '') + '" data-flavour="' + escapeHtml(f.name) + '">' +
                '<div class="flavour-pick-card__check">&#10003;</div>' +
                img +
                '<div class="flavour-pick-card__name">' + escapeHtml(f.name) + '</div>' +
                (f.price ? '<div class="flavour-pick-card__price">+ €' + escapeHtml(f.price) + '</div>' : '') +
            '</div>';
        }).join('');
        grid.querySelectorAll('.flavour-pick-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var n = this.dataset.flavour;
                if (cakeSelectedFlavours.indexOf(n) > -1) {
                    cakeSelectedFlavours = cakeSelectedFlavours.filter(function(x) { return x !== n; });
                    this.classList.remove('selected');
                } else {
                    cakeSelectedFlavours.push(n);
                    this.classList.add('selected');
                }
            });
        });
    }
    document.getElementById('cakeFlavourModal').style.display = 'flex';
}

function addCakeSizeRow(size, serves, price) {
    var wrap = document.getElementById('cakeSizesRows');
    var row = document.createElement('div');
    row.className = 'cake-size-row';
    row.innerHTML =
        '<input type="text" class="cs-size" placeholder="Size (e.g. 6&quot;)" value="' + escapeHtml(size || '') + '">' +
        '<input type="text" class="cs-serves" placeholder="Serves (e.g. 6-8)" value="' + escapeHtml(serves || '') + '">' +
        '<input type="number" class="cs-price" placeholder="€" min="0" step="0.5" value="' + (price != null ? escapeHtml(String(price)) : '') + '">' +
        '<button type="button" class="cake-size-row__del" aria-label="Remove">&times;</button>';
    row.querySelector('.cake-size-row__del').addEventListener('click', function() { row.remove(); });
    wrap.appendChild(row);
}

function openCakeModal(editId) {
    var cakes = getData('products', []) || [];
    document.getElementById('cakeSizesRows').innerHTML = '';
    pendingCakePhotos = [];

    if (editId != null && cakes[editId]) {
        var c = cakes[editId];
        document.getElementById('cakeModalTitle').textContent = at('cakeModal.editTitle');
        document.getElementById('cakeEditId').value = editId;
        document.getElementById('cakeName').value = c.name || '';
        document.getElementById('cakePrice').value = c.price || '';
        document.getElementById('cakeDesc').value = c.desc || '';
        document.getElementById('cakeInsta').value = c.instaUrl || '';
        document.getElementById('cakeFacebook').value = c.fbUrl || '';
        document.getElementById('cakeNotice').value = (c.noticeDays != null ? c.noticeDays : 7);
        populateCakeCategorySelect(c.category);
        cakeSelectedFlavours = (c.flavours || []).slice();
        renderCakeFlavoursSelected();
        pendingCakePhotos = (c.photos && c.photos.length) ? c.photos.slice() : (c.photo ? [c.photo] : []);
        renderCakePhotos();
        var sizes = c.sizes || [];
        // Empty = this cake uses the global sizes. Only show rows if it overrides them.
        sizes.forEach(function(s) { addCakeSizeRow(s.size, s.serves, s.price); });
    } else {
        document.getElementById('cakeModalTitle').textContent = at('cakeModal.addTitle');
        document.getElementById('cakeEditId').value = '';
        document.getElementById('cakeName').value = '';
        document.getElementById('cakePrice').value = '';
        document.getElementById('cakeDesc').value = '';
        document.getElementById('cakeInsta').value = '';
        document.getElementById('cakeFacebook').value = '';
        document.getElementById('cakeNotice').value = 7;
        populateCakeCategorySelect('');
        cakeSelectedFlavours = [];
        renderCakeFlavoursSelected();
        renderCakePhotos();
        // Leave sizes empty so the cake uses the global Sizes & Prices automatically.
    }
    document.getElementById('cakeModal').style.display = 'flex';
}

document.getElementById('addCakeBtn').addEventListener('click', function() { openCakeModal(null); });
document.getElementById('cakeCancel').addEventListener('click', function() { document.getElementById('cakeModal').style.display = 'none'; });
document.querySelector('#cakeModal .modal__overlay').addEventListener('click', function() { document.getElementById('cakeModal').style.display = 'none'; });
document.getElementById('addSizeRowBtn').addEventListener('click', function() { addCakeSizeRow('', '', ''); });
document.getElementById('addAllSizesBtn').addEventListener('click', function() { addAllStandardSizes(); });

document.getElementById('cakeFlavourBtn').addEventListener('click', openCakeFlavourModal);
document.getElementById('cakeFlavourDone').addEventListener('click', function() {
    document.getElementById('cakeFlavourModal').style.display = 'none';
    renderCakeFlavoursSelected();
});
document.querySelector('#cakeFlavourModal .modal__overlay').addEventListener('click', function() {
    document.getElementById('cakeFlavourModal').style.display = 'none';
    renderCakeFlavoursSelected();
});

document.getElementById('cakeNewCatBtn').addEventListener('click', function() {
    addCategory(function(newId) {
        CATEGORIES = getData('categories', CATEGORIES);
        populateCakeCategorySelect(newId);
    });
});

document.getElementById('cakePhoto').addEventListener('change', function(e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    if (!files.length) return;
    var remaining = files.length;
    files.forEach(function(file) {
        compressImage(file, 900, 0.75, function(dataUrl) {
            pendingCakePhotos.push(dataUrl);
            remaining--;
            if (remaining <= 0) renderCakePhotos();
        });
    });
    e.target.value = '';
});

document.getElementById('cakeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var sizes = [];
    document.querySelectorAll('#cakeSizesRows .cake-size-row').forEach(function(row) {
        var size = row.querySelector('.cs-size').value.trim();
        var serves = row.querySelector('.cs-serves').value.trim();
        var price = row.querySelector('.cs-price').value.trim();
        if (size || price) sizes.push({ size: size, serves: serves, price: price });
    });
    var flavours = cakeSelectedFlavours.slice();

    var cake = {
        name: document.getElementById('cakeName').value.trim(),
        price: document.getElementById('cakePrice').value.trim(),
        category: document.getElementById('cakeCategory').value,
        desc: document.getElementById('cakeDesc').value.trim(),
        instaUrl: document.getElementById('cakeInsta').value.trim(),
        fbUrl: document.getElementById('cakeFacebook').value.trim(),
        photo: pendingCakePhotos[0] || null,
        photos: pendingCakePhotos.slice(),
        sizes: sizes,
        flavours: flavours,
        noticeDays: parseInt(document.getElementById('cakeNotice').value) || 0
    };

    // Generate the small listing thumbnail from the cover, then save products
    // and the derived catalog together.
    makeThumb(cake.photo, 400, 0.6, function(thumb) {
        cake.thumb = thumb || null;
        var cakes = getData('products', []) || [];
        var editId = document.getElementById('cakeEditId').value;
        if (editId !== '') cakes[parseInt(editId)] = cake;
        else cakes.push(cake);
        saveProducts(cakes);
        document.getElementById('cakeModal').style.display = 'none';
    });
});

// ===== CAKES SORT BY CATEGORY =====
var cakeSortSelection = {};

function updateCakeSortCount() {
    var n = Object.keys(cakeSortSelection).length;
    document.getElementById('cakesSortCount').textContent = n + ' ' + at('selected');
    document.getElementById('cakesSortAssign').style.display = n > 0 ? 'flex' : 'none';
}

function renderCakeSortAssign() {
    var bar = document.getElementById('cakesSortAssign');
    var html = '<span class="sort-assign__label">' + at('assignTo') + '</span>';
    for (var i = 0; i < CATEGORIES.length; i++) {
        html += '<button class="sort-assign__btn" data-assign="' + CATEGORIES[i].id + '">' + escapeHtml(CATEGORIES[i].en) + '</button>';
    }
    bar.innerHTML = html;
    bar.querySelectorAll('[data-assign]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var catId = this.dataset.assign;
            Object.keys(cakeSortSelection).forEach(function(idx) {
                window._cakeSortItems[idx].category = catId;
                var item = document.querySelector('#cakesSortGrid [data-sort-idx="' + idx + '"]');
                if (item) {
                    item.classList.remove('selected');
                    var badge = item.querySelector('.sort-item__badge');
                    if (badge) badge.textContent = catNameById(catId);
                }
            });
            cakeSortSelection = {};
            updateCakeSortCount();
        });
    });
}

document.getElementById('cakesSortBtn').addEventListener('click', function() {
    var cakes = (getData('products', []) || []).map(function(c) { return Object.assign({}, c); });
    if (!cakes.length) { alert(at('alert.noCakesSort')); return; }
    window._cakeSortItems = cakes;
    cakeSortSelection = {};

    document.getElementById('cakesSortPanel').style.display = 'block';
    document.getElementById('cakesAdmin').style.display = 'none';
    document.querySelector('#tab-cakes .tab-header').style.display = 'none';

    var html = '';
    for (var k = 0; k < cakes.length; k++) {
        var c = cakes[k];
        var img = c.photo ? '<img src="' + c.photo + '" alt="">' : '<div class="cake-admin-card__noimg" style="height:100%"></div>';
        html += '<div class="sort-item sorted" data-sort-idx="' + k + '">' + img +
            '<div class="sort-item__check">✓</div>' +
            '<div class="sort-item__badge">' + escapeHtml(catNameById(c.category)) + '</div>' +
        '</div>';
    }
    var grid = document.getElementById('cakesSortGrid');
    grid.innerHTML = html;
    renderCakeSortAssign();
    updateCakeSortCount();

    grid.querySelectorAll('.sort-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var idx = this.dataset.sortIdx;
            if (cakeSortSelection[idx]) { delete cakeSortSelection[idx]; this.classList.remove('selected'); }
            else { cakeSortSelection[idx] = true; this.classList.add('selected'); }
            updateCakeSortCount();
        });
    });
});

document.getElementById('cakesSortSelectAll').addEventListener('click', function() {
    var items = document.querySelectorAll('#cakesSortGrid .sort-item');
    var allSel = items.length > 0 && Object.keys(cakeSortSelection).length === items.length;
    cakeSortSelection = {};
    items.forEach(function(item) {
        if (allSel) item.classList.remove('selected');
        else { cakeSortSelection[item.dataset.sortIdx] = true; item.classList.add('selected'); }
    });
    updateCakeSortCount();
});

document.getElementById('cakesSortDone').addEventListener('click', function() {
    saveProducts(window._cakeSortItems || []);
    document.getElementById('cakesSortPanel').style.display = 'none';
    document.getElementById('cakesAdmin').style.display = '';
    document.querySelector('#tab-cakes .tab-header').style.display = '';
    loadCakes();
});

// ===== LOAD ALL =====
function loadAllData() {
    listenData('categories', function(val) {
        if (val === null && !categoriesSeeded) {
            categoriesSeeded = true;
            setData('categories', DEFAULT_CATEGORIES);
            return;
        }
        if (val && val.length) CATEGORIES = val;
        loadGallery();
        loadCakes();
        var mcm = document.getElementById('manageCatsModal');
        if (mcm && mcm.style.display === 'flex') renderManageCats();
    });
    listenData('orders', function() { loadOrders(); });
    listenData('products', function() { cleanupLangFields('products'); loadCakes(); renderPriceTable(); ensureCatalog(); });
    listenData('default-sizes', function() { renderGlobalSizes(); loadCakes(); renderPriceTable(); });
    listenData('gallery-cat', function() { loadGallery(); });
    listenData('certificates', function() { loadCertificates(); });
    listenData('flavours', function(val) {
        if (val === null && !flavoursSeeded) {
            flavoursSeeded = true;
            setData('flavours', DEFAULT_FLAVOURS);
            return;
        }
        cleanupLangFields('flavours');
        loadFlavours();
    });
    listenData('reviews', function() { loadReviews(); });
    listenData('content', function() { loadContent(); });
    listenData('site-status', function(s) { updateSiteToggle(s); });
}

// ===== INIT =====
checkAuth();
applyAdminI18n();
