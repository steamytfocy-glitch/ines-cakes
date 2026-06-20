// Notifies the bakery about a new order.
//  - Telegram  : env TELEGRAM_TOKEN, TELEGRAM_CHAT (comma-separated chat IDs)
//  - Email     : env BREVO_KEY, BREVO_SENDER (verified sender),
//                NOTIFY_EMAILS (comma-separated recipient addresses, e.g. mum + you)
// Both channels are optional and independent — whichever is configured will fire.

function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildLines(o) {
    var lines = [];
    lines.push('🎂 New Order — I.N.E.S.');
    if (o.code) lines.push('🔖 Order: ' + o.code);
    lines.push('');
    if (o.name) lines.push('👤 Name: ' + o.name);
    if (o.phone) lines.push('📞 Phone: ' + o.phone);
    if (o.email) lines.push('✉️ Email: ' + o.email);
    if (o.date) lines.push('📅 Date: ' + o.date);
    var size = o.cakeSize || '';
    if (o.customDiameter) size += ' (' + o.customDiameter + '")';
    if (size) lines.push('📏 Size: ' + size);
    if (o.flavour) lines.push('🍰 Flavour: ' + o.flavour);
    if (o.decorComplexity) lines.push('🎨 Decor: ' + o.decorComplexity);
    if (o.allergies) lines.push('⚠️ Allergies: ' + o.allergies);
    if (o.message) lines.push('📝 Wishes: ' + o.message);
    if (o.total) lines.push('💶 Estimated total: ' + o.total);
    lines.push('');
    lines.push('Submitted: ' + (o.submitted || ''));
    return lines;
}

function buildEmailHtml(o, adminUrl) {
    function row(label, value) {
        if (!value) return '';
        return '<tr><td style="padding:6px 12px;color:#6B5B4E;font-size:13px;white-space:nowrap;">' + esc(label) +
            '</td><td style="padding:6px 12px;color:#3D2E1C;font-size:14px;font-weight:600;">' + esc(value) + '</td></tr>';
    }
    var size = o.cakeSize || '';
    if (o.customDiameter) size += ' (' + o.customDiameter + '")';

    var rows = '' +
        row('Order', o.code) +
        row('Name', o.name) +
        row('Phone', o.phone) +
        row('Email', o.email) +
        row('Date needed', o.date) +
        row('Size', size) +
        row('Flavour', o.flavour) +
        row('Decor', o.decorComplexity) +
        row('Allergies', o.allergies) +
        row('Est. total', o.total) +
        row('Submitted', o.submitted);

    var wishes = o.message
        ? '<div style="background:#FBF6EC;border-left:3px solid #C8963E;border-radius:8px;padding:14px 16px;margin:16px 0;color:#3D2E1C;line-height:1.6;white-space:pre-wrap;">' + esc(o.message) + '</div>'
        : '';

    var btn = adminUrl
        ? '<div style="text-align:center;margin-top:18px;"><a href="' + adminUrl + '" style="display:inline-block;background:#C8963E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">Open admin panel</a></div>'
        : '';

    return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#3D2E1C;">' +
        '<div style="text-align:center;padding:18px 0;"><span style="font-size:24px;font-weight:700;color:#C8963E;letter-spacing:3px;">I.N.E.S.</span></div>' +
        '<div style="background:#fff;border:1px solid #EEE5D2;border-radius:16px;padding:24px;">' +
        '<h2 style="margin:0 0 14px;font-size:18px;color:#3D2E1C;">🎂 New order' + (o.code ? ' — ' + esc(o.code) : '') + '</h2>' +
        '<table style="border-collapse:collapse;width:100%;">' + rows + '</table>' +
        wishes + btn +
        '</div></div>';
}

var CUST = {
    en: { subject: 'your order', greeting: 'Hi', received: "Thanks! We've received your order", track: 'Track your order status', save: 'Keep this number to check your order any time:', signoff: '— I.N.E.S. Bakery' },
    ua: { subject: 'ваше замовлення', greeting: 'Вітаємо', received: 'Дякуємо! Ми отримали ваше замовлення', track: 'Відстежити статус замовлення', save: 'Збережіть цей номер, щоб перевіряти замовлення будь-коли:', signoff: '— Пекарня I.N.E.S.' },
    ru: { subject: 'ваш заказ', greeting: 'Здравствуйте', received: 'Спасибо! Мы получили ваш заказ', track: 'Отследить статус заказа', save: 'Сохраните этот номер, чтобы проверять заказ в любой момент:', signoff: '— Пекарня I.N.E.S.' }
};

function buildCustomerHtml(o, lang, orderUrl) {
    var C = CUST[lang] || CUST.en;
    var btn = orderUrl
        ? '<div style="text-align:center;margin:18px 0;"><a href="' + orderUrl + '" style="display:inline-block;background:#C8963E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">' + esc(C.track) + '</a></div>'
        : '';
    return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#3D2E1C;">' +
        '<div style="text-align:center;padding:20px 0;"><span style="font-size:26px;font-weight:700;color:#C8963E;letter-spacing:3px;">I.N.E.S.</span></div>' +
        '<div style="background:#fff;border:1px solid #EEE5D2;border-radius:16px;padding:28px;">' +
        '<p style="font-size:15px;">' + esc(C.greeting) + (o.name ? ' ' + esc(o.name) : '') + ',</p>' +
        '<p style="font-size:15px;">' + esc(C.received) + ' <strong>' + esc(o.code || '') + '</strong>.</p>' +
        '<p style="font-size:13px;color:#6B5B4E;margin-top:14px;">' + esc(C.save) + '</p>' +
        '<p style="font-size:22px;font-weight:700;color:#C8963E;margin:4px 0;">' + esc(o.code || '') + '</p>' +
        btn +
        '<p style="font-size:13px;color:#6B5B4E;margin-top:22px;">' + esc(C.signoff) + '</p>' +
        '</div></div>';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    var o = req.body || {};
    var lines = buildLines(o);
    var text = lines.join('\n');
    var result = { telegram: null, email: null, customer: null };

    var host = req.headers['x-forwarded-host'] || req.headers.host || '';
    var adminUrl = host ? 'https://' + host + '/admin.html' : '';
    var orderUrl = (host && o.code) ? 'https://' + host + '/order.html?code=' + encodeURIComponent(o.code) : '';

    // ----- Telegram -----
    var token = process.env.TELEGRAM_TOKEN;
    var chatId = process.env.TELEGRAM_CHAT;
    if (token && chatId) {
        var chatIds = String(chatId).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        try {
            var tgResults = [];
            for (var i = 0; i < chatIds.length; i++) {
                var tgRes = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatIds[i], text: text })
                });
                tgResults.push(await tgRes.json());
            }
            result.telegram = tgResults;
        } catch (e) {
            result.telegram = { error: String(e) };
        }
    }

    // ----- Email (Brevo) -----
    var key = process.env.BREVO_KEY;
    var sender = process.env.BREVO_SENDER;
    var notifyEmails = process.env.NOTIFY_EMAILS;
    if (key && sender && notifyEmails) {
        var recipients = String(notifyEmails).split(',')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s.indexOf('@') > -1; })
            .map(function (e) { return { email: e }; });
        if (recipients.length) {
            try {
                var brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: { 'api-key': key, 'Content-Type': 'application/json', 'accept': 'application/json' },
                    body: JSON.stringify({
                        sender: { email: sender, name: process.env.BREVO_SENDER_NAME || 'I.N.E.S. Bakery' },
                        to: recipients,
                        subject: '🎂 New order' + (o.code ? ' ' + o.code : '') + (o.name ? ' — ' + o.name : ''),
                        htmlContent: buildEmailHtml(o, adminUrl),
                        textContent: text
                    })
                });
                result.email = await brevoRes.json();
            } catch (e) {
                result.email = { error: String(e) };
            }
        }

        // ----- Confirmation email to the customer -----
        var custEmail = (o.email || '').trim();
        if (custEmail && custEmail.indexOf('@') > -1) {
            var lang = CUST[o.lang] ? o.lang : 'en';
            var C = CUST[lang];
            try {
                var custRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: { 'api-key': key, 'Content-Type': 'application/json', 'accept': 'application/json' },
                    body: JSON.stringify({
                        sender: { email: sender, name: process.env.BREVO_SENDER_NAME || 'I.N.E.S. Bakery' },
                        to: [{ email: custEmail, name: o.name || custEmail }],
                        subject: 'I.N.E.S. — ' + C.subject + (o.code ? ' ' + o.code : ''),
                        htmlContent: buildCustomerHtml(o, lang, orderUrl),
                        textContent: C.received + ' ' + (o.code || '') + (orderUrl ? ('\n' + C.track + ': ' + orderUrl) : '') + '\n' + C.signoff
                    })
                });
                result.customer = await custRes.json();
            } catch (e) {
                result.customer = { error: String(e) };
            }
        }
    }

    res.status(200).json(result);
}
